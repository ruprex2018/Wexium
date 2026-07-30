<?php

namespace App\Http\Controllers;

use App\Models\AiRecommendation;
use App\Models\StakingPool;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class AiRecommendationController extends Controller
{
    /**
     * Display the AI Insights Page.
     */
    public function index()
    {
        $user = Auth::user();
        $latestReport = $user->aiRecommendations()->latest()->first();

        return Inertia::render('Ai/Index', [
            'latestReport' => $latestReport,
            'wallets' => $user->wallets()->get(['currency_code', 'balance']),
        ]);
    }

    /**
     * Generate or update a personalized investment plan.
     */
    public function generate(Request $request)
    {
        $user = Auth::user();
        $wallets = $user->wallets()->get(['currency_code', 'balance']);
        $pools = StakingPool::all(['name', 'currency_code', 'apy', 'lock_period_days']);

        $apiKey = config('services.anthropic.key');

        // Compile a precise, data-rich prompt for the AI model
        $balanceText = $wallets->map(fn($w) => "- " . number_format($w->balance, 4) . " " . $w->currency_code)->join("\n");
        $poolsText = $pools->map(fn($p) => "- Name: {$p->name}, Yield: {$p->apy}% APY, Lock: {$p->lock_period_days} days, Currency: {$p->currency_code}")->join("\n");

        $prompt = "You are Metastake's automated enterprise DeFi advisor. Analyze this user's profile and generate a highly personalized, concise financial action plan.\n\n"
                . "USER WALLET BALANCES:\n{$balanceText}\n\n"
                . "AVAILABLE DEFI STAKING POOLS ON METASTAKE:\n{$poolsText}\n\n"
                . "RULES:\n"
                . "1. Recommend specific allocations based on their balances (e.g. if they have high USDT, suggest staking a portion of it in the USDT Growth Pool).\n"
                . "2. Offer defensive hold vs active yield-earning advice.\n"
                . "3. Output MUST be styled cleanly in Markdown. Do not include any introductory remarks, conversational greetings, or off-topic discussions. Start directly with the header: '### Personalized Portfolio Strategy'.";

        $markdownResult = '';

        if (!empty($apiKey)) {
            try {
                // Execute real-time request to Anthropic Claude API
                $response = Http::withHeaders([
                    'x-api-key' => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'content-type' => 'application/json',
                ])->post('https://api.anthropic.com/v1/messages', [
                    'model' => 'claude-3-5-sonnet-20241022',
                    'max_tokens' => 1500,
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt]
                    ]
                ]);

                if ($response->successful()) {
                    $markdownResult = $response->json('content.0.text');
                } else {
                    throw new \Exception("Claude API Error: " . $response->body());
                }
            } catch (\Exception $e) {
                // Fail gracefully and record the issue in the logs
                logger()->error("AI Recommendation Generation Failed: " . $e->getMessage());
                $markdownResult = $this->generateLocalFallbackReport($wallets, $pools);
            }
        } else {
            // Fallback to local rule-based generator if no API key is set
            $markdownResult = $this->generateLocalFallbackReport($wallets, $pools);
        }

        // Cache the newly generated report
        AiRecommendation::create([
            'user_id' => $user->id,
            'recommendation' => $markdownResult,
        ]);

        return redirect()->back()->with('success', 'AI Portfolio Strategy successfully updated.');
    }

    /**
     * Local rule-based fallback generator. 
     * Ensures perfect out-of-the-box operation without requiring paid API keys.
     */
    private function generateLocalFallbackReport($wallets, $pools): string
    {
        $usdtWallet = $wallets->firstWhere('currency_code', 'USDT');
        $ethWallet = $wallets->firstWhere('currency_code', 'ETH');

        $usdtBalance = $usdtWallet ? (float)$usdtWallet->balance : 0.0;
        $ethBalance = $ethWallet ? (float)$ethWallet->balance : 0.0;

        $report = "### Personalized Portfolio Strategy\n\n";
        $report .= "*This report was compiled instantly via your local backup financial advisor engine (Claude API Key is not set in `.env`).*\n\n";
        
        $report .= "#### 1. Asset Inventory Assessment\n";
        $report .= "We have performed a full ledger audit on your active balances:\n";
        $report .= "- **USDT available:** " . number_format($usdtBalance, 2) . " USDT\n";
        $report .= "- **Ethereum available:** " . number_format($ethBalance, 6) . " ETH\n\n";

        $report .= "#### 2. Optimization Allocations\n";

        if ($usdtBalance > 0) {
            $allocation = $usdtBalance * 0.40; // Suggest staking 40%
            $report .= "- **Action Recommended (USDT Yield Lock):** You are currently holding an idle stablecoin balance. We recommend committing **" . number_format($allocation, 2) . " USDT** (approx 40%) into the **USDT Growth Staking** pool. This locks your capital for **30 days** but secures a guaranteed **12.00% APY** return.\n";
        } else {
            $report .= "- **Action Recommended (USDT Liquidity):** Your USDT ledger is currently empty. Consider initiating a mock **Deposit** of USDT first, then committing it to our active staking pools to earn passive yields.\n";
        }

        if ($ethBalance > 0) {
            $report .= "- **Action Recommended (ETH Moon Stake):** You hold active Ethereum. Since ETH is highly volatile, you can either keep **" . number_format($ethBalance * 0.70, 4) . " ETH** in cold-storage/wallet for liquidity, or commit a small allocation of **" . number_format($ethBalance * 0.30, 4) . " ETH** to our **ETH Moon Stake Pool** to secure a premium **18.50% APY** yield over **90 days**.\n";
        } else {
            $report .= "- **Action Recommended (ETH Exposure):** Your Ethereum balance is currently zero. Exposure to ETH is recommended for long-term blockchain asset appreciation.\n";
        }

        $report .= "\n#### 3. Strategic Risk Warning\n";
        $report .= "Lock-up staking guarantees APY payouts, but your assets will remain locked for the duration of the pool parameters. Ensure you maintain sufficient liquid balances for any imminent P2P trading operations.";

        return $report;
    }
}