<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DepositController extends Controller
{
    /**
     * Display the deposit screen with history.
     */
    public function index()
    {
        $user = Auth::user();

        return Inertia::render('Deposits/Index', [
            'wallets' => $user->wallets()->get(['currency_code', 'balance']),
            'deposits' => $user->deposits()->latest()->get(),
            // Mock gateways to present to the frontend
            'gateways' => [
                [
                    'name' => 'MetaMask / Direct Transfer',
                    'method' => 'crypto',
                    'currencies' => ['ETH', 'USDT'],
                    'address' => '0x3d274ed190db175b6001474ee27c88b3b955fcd0',
                    'instructions' => 'Send funds to our official wallet address and paste your Transaction Hash below.'
                ],
                [
                    'name' => 'USDT (TRC-20) Manual Transfer',
                    'method' => 'manual_qr',
                    'currencies' => ['USDT'],
                    'address' => 'TX9yZ15433createwallets123456789',
                    'instructions' => 'Send TRC-20 USDT and upload a screenshot of your transfer receipt.'
                ]
            ]
        ]);
    }

    /**
     * Process and store a incoming user deposit request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'currency_code' => 'required|string|in:USDT,ETH',
            'amount' => 'required|numeric|min:0.00000001',
            'payment_method' => 'required|string|in:crypto,manual_qr',
            'tx_hash' => 'required_if:payment_method,crypto|nullable|string|max:100',
            'proof_file' => 'required_if:payment_method,manual_qr|nullable|image|mimes:jpeg,png,jpg|max:4096', // Max 4MB
        ]);

        $filePath = null;

        // Process file upload if it is a manual screenshot proof
        if ($request->hasFile('proof_file')) {
            $filePath = $request->file('proof_file')->store('deposits', 'public');
        }

        Deposit::create([
            'user_id' => Auth::id(),
            'currency_code' => $request->currency_code,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'tx_hash' => $request->tx_hash,
            'proof_file' => $filePath,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Deposit request submitted successfully. It is now pending admin approval.');
    }

    /**
     * Simulate Admin Approval of a Deposit request.
     * Credits the matching wallet balance.
     */
    public function approve(Request $request, Deposit $deposit)
    {
        // Prevent double spending / processing completed deposits
        if ($deposit->status !== 'pending') {
            return redirect()->back()->withErrors(['error' => 'This deposit has already been processed.']);
        }

        // 1. Update the deposit status
        $deposit->update([
            'status' => 'approved',
            'admin_feedback' => 'Approved automatically via simulated local admin check.'
        ]);

        // 2. Find or create the user's matching wallet
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $deposit->user_id, 'currency_code' => $deposit->currency_code],
            ['balance' => 0]
        );

        // 3. Credit the wallet balance with precision
        $wallet->increment('balance', $deposit->amount);

        return redirect()->back()->with('success', 'Deposit approved. Balance credited to user wallet.');
    }
}