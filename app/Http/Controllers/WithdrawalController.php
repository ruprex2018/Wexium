<?php

namespace App\Http\Controllers;

use App\Models\Withdrawal;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    /**
     * Display the withdrawal interface with request history.
     */
    public function index()
    {
        $user = Auth::user();

        return Inertia::render('Withdrawals/Index', [
            'wallets' => $user->wallets()->get(['currency_code', 'balance']),
            'withdrawals' => $user->withdrawals()->latest()->get(),
        ]);
    }

    /**
     * Process and place an immediate hold on a user's withdrawal request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'currency_code' => 'required|string|in:USDT,ETH',
            'amount' => 'required|numeric|min:1.00', // Minimum 1 unit
            'wallet_address' => 'required|string|max:100', // Destination detail
        ]);

        $user = Auth::user();
        $amount = $request->amount;

        // 1. Locate the user's matching wallet
        $wallet = Wallet::where('user_id', $user->id)
            ->where('currency_code', $request->currency_code)
            ->first();

        // 2. Validate sufficient active ledger balance
        if (!$wallet || $wallet->balance < $amount) {
            return redirect()->back()->withErrors([
                'amount' => "Insufficient {$request->currency_code} balance to complete this withdrawal."
            ]);
        }

        // 3. Place immediate hold (deduct from active balance)
        $wallet->decrement('balance', $amount);

        // 4. Log the pending withdrawal request
        Withdrawal::create([
            'user_id' => $user->id,
            'currency_code' => $request->currency_code,
            'amount' => $amount,
            'wallet_address' => $request->wallet_address,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Withdrawal request submitted. The amount has been placed on hold pending admin processing.');
    }

    /**
     * Simulate Admin Processing (Approve/Reject).
     * Rejects reverse the immediate hold and refund balances.
     */
    public function processDecision(Request $request, Withdrawal $withdrawal)
    {
        $request->validate([
            'decision' => 'required|string|in:approved,rejected',
            'feedback' => 'nullable|string|max:500',
        ]);

        if ($withdrawal->status !== 'pending') {
            return redirect()->back()->withErrors(['error' => 'This withdrawal request has already been processed.']);
        }

        $decision = $request->decision;
        $feedback = $request->feedback;

        if ($decision === 'approved') {
            // Approval confirms the permanent debit
            $withdrawal->update([
                'status' => 'approved',
                'admin_feedback' => $feedback ?: 'Processed and sent successfully.'
            ]);
        } else {
            // Rejection triggers a reversal (refund the held balance back to the user's active wallet)
            $wallet = Wallet::where('user_id', $withdrawal->user_id)
                ->where('currency_code', $withdrawal->currency_code)
                ->first();

            if ($wallet) {
                $wallet->increment('balance', $withdrawal->amount);
            }

            $withdrawal->update([
                'status' => 'rejected',
                'admin_feedback' => $feedback ?: 'Request rejected. Balance refunded.'
            ]);
        }

        return redirect()->back()->with('success', "Withdrawal request updated to: " . strtoupper($decision));
    }
}