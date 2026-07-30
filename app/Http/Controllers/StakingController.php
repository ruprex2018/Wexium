<?php

namespace App\Http\Controllers;

use App\Models\StakingPool;
use App\Models\Stake;
use App\Models\Wallet;
use App\Http\Controllers\ReferralController;
use App\Services\BlockchainService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class StakingController extends Controller
{
    protected $blockchain;

    /**
     * Inject the Blockchain Verification Service.
     */
    public function __construct(BlockchainService $blockchain)
    {
        $this->blockchain = $blockchain;
    }

    /**
     * Display staking pools and user staking positions.
     */
    public function index()
    {
        $user = Auth::user();

        if (StakingPool::count() === 0) {
            StakingPool::create([
                'name' => 'USDT Growth Staking',
                'currency_code' => 'USDT',
                'apy' => 12.00,
                'lock_period_days' => 30,
                'min_stake' => 10,
                'max_stake' => 10000,
                'capacity' => 50000,
            ]);
            StakingPool::create([
                'name' => 'ETH Moon Stake (Premium)',
                'currency_code' => 'ETH',
                'apy' => 18.50,
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
     * Lock up user balances into a staking pool after verifying their on-chain transaction.
     */
    public function store(Request $request)
    {
        $request->validate([
            'staking_pool_id' => 'required|exists:staking_pools,id',
            'amount' => 'required|numeric|min:0.00000001',
            'tx_hash' => 'required|string|max:132', // Verify transaction hash format
        ]);

        $pool = StakingPool::findOrFail($request->staking_pool_id);
        $amount = $request->amount;
        $user = Auth::user();

        // Enforce that the user must be authenticated via Web3 to execute contract verifications
        if (empty($user->wallet_address)) {
            return redirect()->back()->withErrors([
                'amount' => 'On-chain staking requires your profile to be authenticated via a Web3 Wallet.'
            ]);
        }

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

        // ENFORCE ON-CHAIN VERIFICATION: Verify that the transaction actually occurred on the blockchain
        // (Smart Contract Address can be set in your .env or handled dynamically)
        $contractAddress = env('STAKING_CONTRACT_ADDRESS', '0x7e274ed190db175b6001474ee27c88b3b955fcd0');
        
        $isValid = $this->blockchain->verifyTransaction(
            $request->tx_hash,
            $user->wallet_address, // Expected Sender
            $contractAddress,      // Expected Recipient (Your Staking Contract)
            $amount                // Expected Value
        );

        if (!$isValid) {
            return redirect()->back()->withErrors([
                'amount' => 'On-chain transaction verification failed. Please ensure the transaction successfully settled on the blockchain.'
            ]);
        }

        // Create the stake position
        $stake = Stake::create([
            'user_id' => $user->id,
            'staking_pool_id' => $pool->id,
            'amount' => $amount,
            'apy' => $pool->apy,
            'status' => 'active',
            'staked_at' => Carbon::now(),
            'ends_at' => Carbon::now()->addDays($pool->lock_period_days),
        ]);

        // Increment the active staking pool counter
        $pool->increment('total_staked', $amount);

        // Trigger the Multi-Level Referral Commission Engine
        ReferralController::distribute($user, $amount, $pool->currency_code);

        return redirect()->back()->with('success', "Success! Locked {$amount} {$pool->currency_code} inside the {$pool->name} on-chain. Reference hash verified: " . substr($request->tx_hash, 0, 15) . "...");
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

        // ENFORCE LOCK PERIOD
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

        if ($wallet) {
            $wallet->increment('balance', $totalReturn);
        }

        return redirect()->back()->with('success', "Unstaked successfully. Received capital + interest: " . number_format($totalReturn, 4) . " " . $pool->currency_code);
    }
}