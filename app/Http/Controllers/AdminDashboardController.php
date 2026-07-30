<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Stake;
use App\Models\Deposit;
use App\Models\Withdrawal;
use App\Models\KycVerification;
use App\Models\SupportTicket;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    /**
     * Fetch platform analytics and load all pending audit queues.
     */
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            // Core Platform Analytics
            'stats' => [
                'total_users' => User::count(),
                'active_staked' => Stake::where('status', 'active')->sum('amount'),
                'total_deposits' => Deposit::where('status', 'approved')->sum('amount'),
                'total_withdrawals' => Withdrawal::where('status', 'approved')->sum('amount'),
            ],
            
            // Queue 1: Pending KYC document reviews
            'pendingKyc' => KycVerification::where('status', 'pending')
                ->with('user:id,name,email')
                ->get(),
                
            // Queue 2: Pending deposit request reviews
            'pendingDeposits' => Deposit::where('status', 'pending')
                ->with('user:id,name,email')
                ->get(),
                
            // Queue 3: Pending withdrawal request reviews
            'pendingWithdrawals' => Withdrawal::where('status', 'pending')
                ->with('user:id,name,email')
                ->get(),
                
            // Queue 4: Open Support Tickets awaiting replies
            'openTickets' => SupportTicket::where('status', 'open')
                ->with('user:id,name,email')
                ->get(),
        ]);
    }
}