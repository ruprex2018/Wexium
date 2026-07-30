<?php

namespace App\Http\Controllers;

use App\Models\StakingPool;
use App\Models\Stake;
use App\Models\Wallet;
use App\Http\Controllers\ReferralController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class StakingController extends Controller
{
    /**
     * Display staking pools and user staking positions.
     */
    public function index()
    {
        $user = Auth::user();

        // Dynamically pre-populate staking pools if none exist in the database
        if (StakingPool::count() === 0) {
            StakingPool::create([
                'name' => 'USDT Growth Staking',
                'currency_code' => 'USDT',
                'apy' => 12.00, // 12% APY
                'lock_period_days' => 30,
                'min_stake' => 10,
                'max_stake' => 10000,
                'capacity' => 50000,
            ]);
            StakingPool::create([
                'name' => 'ETH Moon Stake (Premium)',
                'currency_code' => 'ETH',
                'apy' => 18.50, // 18.5% APY
                'lock_period_days' => 90,
                'min_stake' => 0.01,
                'max_stake' => 50,
                'capacity' => 200,
            ]);
        }

        return Inertia::render('Staking/Index', [
            'pools' => StakingPool::all(),
            'wallets' => $user->wallets()->get(['currency_code', 'balance']),
            'stakes' => $user->stakes()->with('pool:id,name')->latest()->get(),
        ]);
    }

    /**
     * Lock up user balances into a staking pool.
     */
    public function store(Request $request)
    {
        $request->validate([
            'staking_pool_id' => 'required|exists:staking_pools,id',
            'amount' => 'required|numeric|min:0.00000001',
        ]);

        $pool = StakingPool::findOrFail($request->staking_pool_id);
        $amount = $request->amount;
        $user = Auth::user();

        if ($amount < $pool->min_stake || $amount > $pool->max_stake) {
            return redirect()->back()->withErrors([
                'amount' => "Amount must be between {$pool->min_stake} and {$pool->max_stake} {$pool->currency_code}."
            ]);
        }

        if (($pool->total_staked + $amount) > $pool->capacity) {
            return redirect()->back()->withErrors([
                'amount' => "Staking request exceeds maximum pool capacity limit."
            ]);
        }

        $wallet = Wallet::where('user_id', $user->id)
            ->where('currency_code', $pool->currency_code)
            ->first();

        if (!$wallet || $wallet->balance < $amount) {
            return redirect()->back()->withErrors([
                'amount' => "Insufficient {$pool->currency_code} balance in your wallet."
            ]);
        }

        $wallet->decrement('balance', $amount);
        $pool->increment('total_staked', $amount);

        $stake = Stake::create([
            'user_id' => $user->id,
            'staking_pool_id' => $pool->id,
            'amount' => $amount,
            'apy' => $pool->apy,
            'status' => 'active',
            'staked_at' => Carbon::now(),
            'ends_at' => Carbon::now()->addDays($pool->lock_period_days),
        ]);

        // Trigger Multi-Level Referral Commissions
        ReferralController::distribute($user, $amount, $pool->currency_code);

        return redirect()->back()->with('success', "Success! Locked {$amount} {$pool->currency_code} inside the {$pool->name}. Direct referrers have been credited their commission payouts.");
    }

    /**
     * Process stake payouts after lock expiration.
     */
    public function claim(Request $request, Stake $stake)
    {
        if ($stake->user_id !== Auth::id()) {
            return redirect()->back()->withErrors(['error' => 'Unauthorized action.']);
        }

        if ($stake->status !== 'active') {
            return redirect()->back()->withErrors(['error' => 'This position has already been claimed.']);
        }

        // ENFORCE LOCK PERIOD: Block users from claiming prior to expiration
        if (Carbon::now()->lt($stake->ends_at)) {
            return redirect()->back()->withErrors(['error' => 'The lock period has not expired yet.']);
        }

        $pool = $stake->pool;
        $stakedDays = $pool->lock_period_days;
        $apyFraction = $stake->apy / 100;
        $reward = $stake->amount * $apyFraction * ($stakedDays / 365);
        $totalReturn = $stake->amount + $reward;

        $stake->update(['status' => 'claimed']);
        $pool->decrement('total_staked', $stake->amount);

        $wallet = Wallet::where('user_id', $stake->user_id)
            ->where('currency_code', $pool->currency_code)
            ->first();

        $wallet->increment('balance', $totalReturn);

        return redirect()->back()->with('success', "Unstaked successfully. Received capital + interest: " . number_format($totalReturn, 4) . " " . $pool->currency_code);
    }
}