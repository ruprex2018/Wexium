<?php

namespace App\Http\Controllers;

use App\Models\P2pOffer;
use App\Models\P2pTrade;
use App\Models\P2pMessage;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class P2pController extends Controller
{
    /**
     * Display the P2P Marketplace, active trades, and current offers.
     */
    public function index()
    {
        $user = Auth::user();

        // Seed initial mock P2P offers if none exist, so developers can test trading instantly
        if (P2pOffer::count() === 0) {
            P2pOffer::create([
                'user_id' => $user->id, // User is trading with themselves/simulation accounts
                'type' => 'sell',
                'currency_code' => 'USDT',
                'amount' => 100.00000000,
                'price_per_unit' => 1.00,
                'payment_method' => 'PayPal',
            ]);
            P2pOffer::create([
                'user_id' => $user->id,
                'type' => 'sell',
                'currency_code' => 'ETH',
                'amount' => 1.50000000,
                'price_per_unit' => 3200.00,
                'payment_method' => 'Bank Transfer',
            ]);
        }

        return Inertia::render('P2p/Index', [
            'offers' => P2pOffer::where('status', 'active')->with('user:id,name')->get(),
            'userOffers' => $user->p2pOffers()->get(),
            'wallets' => $user->wallets()->get(['currency_code', 'balance']),
            'activeTrades' => P2pTrade::where('buyer_id', $user->id)
                ->orWhere('seller_id', $user->id)
                ->with(['offer', 'buyer:id,name', 'seller:id,name'])
                ->latest()
                ->get(),
        ]);
    }

    /**
     * Publish a new P2P Offer on the marketplace.
     */
    public function storeOffer(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:buy,sell',
            'currency_code' => 'required|string|in:USDT,ETH',
            'amount' => 'required|numeric|min:0.00000001',
            'price_per_unit' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|max:50',
        ]);

        P2pOffer::create([
            'user_id' => Auth::id(),
            'type' => $request->type,
            'currency_code' => $request->currency_code,
            'amount' => $request->amount,
            'price_per_unit' => $request->price_per_unit,
            'payment_method' => $request->payment_method,
            'status' => 'active',
        ]);

        return redirect()->back()->with('success', 'Offer successfully published to the P2P marketplace.');
    }

    /**
     * Initiate a P2P Trade position against an offer, locking up the escrow.
     */
    public function initiateTrade(Request $request)
    {
        $request->validate([
            'p2p_offer_id' => 'required|exists:p2p_offers,id',
            'amount' => 'required|numeric|min:0.00000001',
        ]);

        $offer = P2pOffer::findOrFail($request->p2p_offer_id);
        $amount = $request->amount;
        $buyer = Auth::user();
        $seller = $offer->user;

        if ($offer->user_id === $buyer->id) {
            return redirect()->back()->withErrors(['amount' => 'You cannot initiate a trade against your own offer.']);
        }

        if ($amount > $offer->amount) {
            return redirect()->back()->withErrors(['amount' => "Requested amount exceeds the offer's available limit of {$offer->amount}."]);
        }

        // 1. Escrow Lock: Locate and deduct the committed amount from the Seller's active balance
        $sellerWallet = Wallet::where('user_id', $seller->id)
            ->where('currency_code', $offer->currency_code)
            ->first();

        if (!$sellerWallet || $sellerWallet->balance < $amount) {
            return redirect()->back()->withErrors(['amount' => 'The seller does not have sufficient wallet balances to fulfill this escrow lock.']);
        }

        // Deduct crypto immediately to prevent double spending
        $sellerWallet->decrement('balance', $amount);

        // 2. Reduce the active offer pool size
        $offer->decrement('amount', $amount);
        if ($offer->amount <= 0.00000001) {
            $offer->update(['status' => 'completed']);
        }

        // 3. Create the trade record
        $trade = P2pTrade::create([
            'p2p_offer_id' => $offer->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'amount' => $amount,
            'total_price' => $amount * $offer->price_per_unit,
            'status' => 'pending_payment',
        ]);

        // 4. Create an initial system notification in the chat log
        P2pMessage::create([
            'p2p_trade_id' => $trade->id,
            'sender_id' => $seller->id,
            'message' => "System Notification: Trade initiated. Escrow locked. Buyer has been instructed to complete payment of " . number_format($trade->total_price, 2) . " USD via " . $offer->payment_method,
            'is_system' => true,
        ]);

        return redirect()->route('p2p.trade', $trade->id)->with('success', 'Trade initialized. Escrow balance locked.');
    }

    /**
     * Render the active Trade Room workspace (with file upload & messages).
     */
    public function showTrade(P2pTrade $trade)
    {
        $user = Auth::user();

        // Security check: Ensure the user is either the buyer or the seller
        if ($trade->buyer_id !== $user->id && $trade->seller_id !== $user->id) {
            abort(403, 'Unauthorized trade access.');
        }

        return Inertia::render('P2p/TradeRoom', [
            'trade' => $trade->load(['offer', 'buyer:id,name', 'seller:id,name']),
            'messages' => $trade->messages()->with('sender:id,name')->get(),
            'currentUser' => [
                'id' => $user->id,
                'role' => $trade->buyer_id === $user->id ? 'buyer' : 'seller'
            ]
        ]);
    }

    /**
     * Submit Proof of off-chain payment (Screenshot/Receipt upload).
     */
    public function submitPayment(Request $request, P2pTrade $trade)
    {
        if ($trade->buyer_id !== Auth::id()) {
            return redirect()->back()->withErrors(['error' => 'Only the buyer can declare payment.']);
        }

        $request->validate([
            'payment_proof_file' => 'required|image|mimes:jpeg,png,jpg|max:4096',
        ]);

        $path = $request->file('payment_proof_file')->store('p2p_proofs', 'public');

        $trade->update([
            'status' => 'paid',
            'payment_proof_file' => $path
        ]);

        P2pMessage::create([
            'p2p_trade_id' => $trade->id,
            'sender_id' => Auth::id(),
            'message' => "System Notification: Buyer marked payment complete and uploaded confirmation proof receipt.",
            'is_system' => true,
        ]);

        return redirect()->back()->with('success', 'Payment proof submitted. Awaiting seller confirmation.');
    }

    /**
     * Release Crypto from Escrow Pool directly into the Buyer's Wallet.
     */
    public function releaseCrypto(Request $request, P2pTrade $trade)
    {
        if ($trade->seller_id !== Auth::id()) {
            return redirect()->back()->withErrors(['error' => 'Only the seller can unlock the escrow funds.']);
        }

        if ($trade->status !== 'paid') {
            return redirect()->back()->withErrors(['error' => 'Crypto cannot be released until the buyer marks the trade as paid.']);
        }

        // 1. Update trade status
        $trade->update(['status' => 'completed']);

        // 2. Find or create the buyer's corresponding wallet
        $buyerWallet = Wallet::firstOrCreate(
            ['user_id' => $trade->buyer_id, 'currency_code' => $trade->offer->currency_code],
            ['balance' => 0]
        );

        // 3. Unlock escrow and credit buyer's balance
        $buyerWallet->increment('balance', $trade->amount);

        P2pMessage::create([
            'p2p_trade_id' => $trade->id,
            'sender_id' => Auth::id(),
            'message' => "System Notification: Seller confirmed payment receipt. Escrow has been unlocked, and " . parseFloat($trade->amount) . " " . $trade->offer->currency_code . " was credited to the buyer.",
            'is_system' => true,
        ]);

        return redirect()->back()->with('success', 'Escrow released! Cryptocurrency sent to the buyer.');
    }

    /**
     * Post a new message inside the Trade Room chat system.
     */
    public function storeMessage(Request $request, P2pTrade $trade)
    {
        $request->validate(['message' => 'required|string|max:1000']);

        P2pMessage::create([
            'p2p_trade_id' => $trade->id,
            'sender_id' => Auth::id(),
            'message' => $request->message,
        ]);

        return redirect()->back();
    }
}