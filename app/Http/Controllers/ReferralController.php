<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Commission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReferralController extends Controller
{
    /**
     * Render the Referral & Commission dashboard page.
     */
    public function index()
    {
        $user = Auth::user();

        // 1. Build the Level 1 and Level 2 recursive referral lists
        $level1 = $user->referrals()->get(['id', 'name', 'email', 'kyc_status', 'created_at']);
        
        $level2 = collect();
        foreach ($level1 as $child) {
            $grandChildren = $child->referrals()->get(['id', 'name', 'email', 'kyc_status', 'created_at']);
            $level2 = $level2->merge($grandChildren);
        }

        // 2. Fetch the platform-wide top referral leaderboard
        $leaderboard = User::withCount('referrals')
            ->orderBy('referrals_count', 'desc')
            ->limit(5)
            ->get(['id', 'name'])
            ->map(function ($u, $idx) {
                return [
                    'rank' => $idx + 1,
                    'name' => $u->name,
                    'referrals_count' => $u->referrals_count,
                ];
            });

        return Inertia::render('Referrals/Index', [
            'referral_code' => $user->referral_code,
            'referral_link' => route('register') . '?ref=' . $user->referral_code,
            'level1' => $level1,
            'level2' => $level2,
            'leaderboard' => $leaderboard,
            'commissions' => $user->commissions()->with('buyer:id,name')->latest()->get(),
        ]);
    }

    /**
     * Recursive Multi-Level Commission Distribution Engine.
     * Traverses up to 3 parent levels, logs commission records, and credits user wallet balances.
     */
    public static function distribute(User $buyer, float $amount, string $currencyCode)
    {
        // Commission Rates: Level 1 = 5%, Level 2 = 3%, Level 3 = 1%
        $rates = [
            1 => 0.05,
            2 => 0.03,
            3 => 0.01,
        ];

        $currentSponsor = $buyer->referrer;
        $level = 1;

        // Traverse up the tree recursively up to 3 levels
        while ($currentSponsor && $level <= 3) {
            $rate = $rates[$level];
            $earning = $amount * $rate;

            if ($earning > 0) {
                // 1. Log the commission record
                Commission::create([
                    'user_id' => $currentSponsor->id,
                    'buyer_id' => $buyer->id,
                    'amount' => $earning,
                    'currency_code' => $currencyCode,
                    'level' => $level,
                    'description' => "Level {$level} Commission from {$buyer->name}'s Staking Lockup.",
                ]);

                // 2. Find or create the sponsor's matching wallet and credit the earning
                $wallet = Wallet::firstOrCreate(
                    ['user_id' => $currentSponsor->id, 'currency_code' => $currencyCode],
                    ['balance' => 0]
                );
                $wallet->increment('balance', $earning);
            }

            // Move to the next parent level (grand-sponsor)
            $currentSponsor = $currentSponsor->referrer;
            $level++;
        }
    }
}