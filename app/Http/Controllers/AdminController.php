<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Stake;
use App\Models\Deposit;
use App\Models\Withdrawal;
use App\Models\KycVerification;
use App\Models\StakingPool;
use App\Models\Setting;
use App\Models\Wallet;
use App\Models\CmsPage;
use App\Models\SupportTicket;
use App\Models\SupportMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Render the decoupled, high-fidelity Admin Dashboard.
     */
    public function index()
    {
        if (Setting::count() === 0) {
            Setting::create(['key' => 'app_name', 'value' => 'MetaStake']);
            Setting::create(['key' => 'app_logo', 'value' => null]);
            Setting::create(['key' => 'seo_title', 'value' => 'MetaStake — Web3 DeFi Portal']);
            Setting::create(['key' => 'seo_description', 'value' => 'Self-hosted Web3 staking and P2P trading platform.']);
            Setting::create(['key' => 'seo_keywords', 'value' => 'web3, defi, staking, p2p, crypto']);
        }

        if (CmsPage::count() === 0) {
            CmsPage::create([
                'slug' => 'privacy-policy',
                'title' => 'Privacy Policy',
                'content' => '<h3>Privacy Policy Statement</h3><p>We value your privacy. Your decentralized ledger coordinates are only utilized to authenticate security structures on our platform.</p>'
            ]);
            CmsPage::create([
                'slug' => 'terms-of-service',
                'title' => 'Terms of Service',
                'content' => '<h3>Terms of Service Agreement</h3><p>By using MetaStake, you agree that blockchain lockups and P2P transactions are governed strictly by your custom local database and smart contract rules.</p>'
            ]);
        }

        $settings = Setting::pluck('value', 'key')->all();

        // Compile Unified Transaction Ledger
        $rawDeposits = Deposit::with('user:id,name,email')->latest()->get();
        $rawWithdrawals = Withdrawal::with('user:id,name,email')->latest()->get();

        $depositsList = $rawDeposits->map(function ($d) {
            return [
                'id' => 'TXN' . str_pad($d->id, 8, '0', STR_PAD_LEFT),
                'user' => $d->user,
                'type' => 'Credit',
                'amount' => (float)$d->amount,
                'fee' => 0.00,
                'status' => $d->status,
                'created_at' => $d->created_at->toIso8601String(),
            ];
        });

        $withdrawalsList = $rawWithdrawals->map(function ($w) {
            return [
                'id' => 'TXN' . str_pad($w->id, 8, '0', STR_PAD_LEFT),
                'user' => $w->user,
                'type' => 'Debit',
                'amount' => (float)$w->amount,
                'fee' => 0.00,
                'status' => $w->status,
                'created_at' => $w->created_at->toIso8601String(),
            ];
        });

        $allTransactions = $depositsList->merge($withdrawalsList)->sortByDesc('created_at')->values()->all();

        // Calculate Ledger Totals for Reports
        $totalDeposited = (float)Deposit::where('status', 'approved')->sum('amount');
        $totalWithdrawn = (float)Withdrawal::where('status', 'approved')->sum('amount');
        $activeStaked = (float)Stake::where('status', 'active')->sum('amount');
        $rewardsPaid = (float)Stake::where('status', 'claimed')->get()->reduce(function($carry, $stake) {
            $pool = $stake->pool;
            if (!$pool) return $carry;
            $apyFraction = $stake->apy / 100;
            $periodFraction = $pool->lock_period_days / 365;
            return $carry + ($stake->amount * $apyFraction * $periodFraction);
        }, 0);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_users' => User::count(),
                'active_users' => User::where('kyc_status', 'approved')->count(),
                'suspended_users' => User::where('kyc_status', 'rejected')->count(),
                'pending_kyc_count' => KycVerification::where('status', 'pending')->count(),
                'total_balance' => Wallet::sum('balance'),
                'active_investments' => Stake::where('status', 'active')->count(),
                'completed_investments' => Stake::where('status', 'claimed')->count(),
                'total_invested' => Stake::sum('amount'),
                'total_earnings' => $rewardsPaid,
                'total_deposits' => $totalDeposited,
                'total_withdrawals' => $totalWithdrawn,
            ],

            'users' => User::latest()->get(['id', 'name', 'email', 'wallet_address', 'kyc_status', 'is_admin', 'created_at']),
            'pendingKyc' => KycVerification::where('status', 'pending')->with('user:id,name,email')->get(),
            'pendingDeposits' => Deposit::where('status', 'pending')->with('user:id,name,email')->get(),
            'pendingWithdrawals' => Withdrawal::where('status', 'pending')->with('user:id,name,email')->get(),
            'stakingPools' => StakingPool::all(),
            'allStakes' => Stake::with(['user:id,name', 'pool:id,name'])->latest()->get(),
            'cmsPages' => CmsPage::all(),
            'transactions' => $allTransactions,
            'settings' => $settings,
            
            // Fetch all tickets with complete messaging threads for Admin Helpdesk View
            'allTickets' => SupportTicket::with(['user:id,name,email', 'messages.sender:id,name'])->latest()->get(),
        ]);
    }

    /**
     * Create a new Staking Pool/Plan.
     */
    public function storePool(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'currency_code' => 'required|string|in:USDT,ETH',
            'apy' => 'required|numeric|min:0.01|max:500',
            'lock_period_days' => 'required|integer|min:1|max:3650',
            'min_stake' => 'required|numeric|min:0.00000001',
            'max_stake' => 'required|numeric|gt:min_stake',
            'capacity' => 'required|numeric|gt:max_stake',
        ]);

        StakingPool::create($request->all());

        return redirect()->back()->with('success', 'New Staking Pool successfully deployed.');
    }

    /**
     * Remove an existing Staking Pool/Plan.
     */
    public function deletePool(StakingPool $pool)
    {
        $pool->delete();

        return redirect()->back()->with('success', 'Staking Pool removed successfully.');
    }

    /**
     * Update Global System Settings and SEO Metadata.
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'app_name' => 'required|string|max:100',
            'seo_title' => 'required|string|max:200',
            'seo_description' => 'required|string|max:500',
            'seo_keywords' => 'required|string|max:500',
            'app_logo_file' => 'nullable|image|mimes:png,jpg,jpeg|max:2048',
        ]);

        Setting::where('key', 'app_name')->update(['value' => $request->app_name]);
        Setting::where('key', 'seo_title')->update(['value' => $request->seo_title]);
        Setting::where('key', 'seo_description')->update(['value' => $request->seo_description]);
        Setting::where('key', 'seo_keywords')->update(['value' => $request->seo_keywords]);

        if ($request->hasFile('app_logo_file')) {
            $path = $request->file('app_logo_file')->store('settings', 'public');
            Setting::where('key', 'app_logo')->update(['value' => $path]);
        }

        return redirect()->back()->with('success', 'Global settings and SEO metadata updated.');
    }

    /**
     * Toggle Administrative privileges for a user.
     */
    public function toggleAdmin(User $user)
    {
        if ($user->id === Auth::id()) {
            return redirect()->back()->withErrors(['error' => 'You cannot revoke your own administrative status.']);
        }

        $user->update(['is_admin' => !$user->is_admin]);

        return redirect()->back()->with('success', 'User role privilege updated.');
    }

    /**
     * Force complete a user's stake early.
     */
    public function forceCompleteStake(Stake $stake)
    {
        if ($stake->status !== 'active') {
            return redirect()->back()->withErrors(['error' => 'This staking position is already settled.']);
        }

        $pool = $stake->pool;
        $apyFraction = $stake->apy / 100;
        $periodFraction = $pool->lock_period_days / 365;
        $reward = $stake->amount * $apyFraction * $periodFraction;
        $totalReturn = $stake->amount + $reward;

        $stake->update(['status' => 'claimed']);
        $pool->decrement('total_staked', $stake->amount);

        $wallet = Wallet::where('user_id', $stake->user_id)
            ->where('currency_code', $pool->currency_code)
            ->first();

        if ($wallet) {
            $wallet->increment('balance', $totalReturn);
        }

        return redirect()->back()->with('success', 'Admin Override: Staking position force-completed. Principal + APY Yield credited.');
    }

    /**
     * Cancel a user's active stake early.
     */
    public function cancelStake(Stake $stake)
    {
        if ($stake->status !== 'active') {
            return redirect()->back()->withErrors(['error' => 'This staking position is already settled.']);
        }

        $pool = $stake->pool;

        $stake->update(['status' => 'cancelled']);
        $pool->decrement('total_staked', $stake->amount);

        $wallet = Wallet::where('user_id', $stake->user_id)
            ->where('currency_code', $pool->currency_code)
            ->first();

        if ($wallet) {
            $wallet->increment('balance', $stake->amount);
        }

        return redirect()->back()->with('success', 'Admin Override: Staking position canceled early. Principal refunded.');
    }

    /**
     * Update dynamic CMS page content.
     */
    public function updateCmsPage(Request $request, CmsPage $page)
    {
        $request->validate([
            'title' => 'required|string|max:200',
            'content' => 'required|string',
        ]);

        $page->update([
            'title' => $request->title,
            'content' => $request->content,
        ]);

        return redirect()->back()->with('success', "CMS Page '{$page->title}' successfully updated.");
    }

    /**
     * Submit an Official Agent Response and update ticket status (Admin Only).
     */
    public function replyToTicket(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'close_ticket' => 'required|boolean',
        ]);

        // Create the official agent message
        SupportMessage::create([
            'support_ticket_id' => $ticket->id,
            'sender_id' => Auth::id(),
            'message' => $request->message,
            'is_admin' => true,
        ]);

        $status = $request->close_ticket ? 'closed' : 'replied';
        $ticket->update(['status' => $status]);

        return redirect()->back()->with('success', "Response processed. Ticket status updated to: " . strtoupper($status));
    }
}