<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Web3AuthController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\StakingController;
use App\Http\Controllers\KycController;
use App\Http\Controllers\P2pController;
use App\Http\Controllers\AiRecommendationController;
use App\Http\Controllers\WithdrawalController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\SupportTicketController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\AdminController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Wallet;
use App\Models\CmsPage;

// 1. Welcome Page (Default Landing)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// 2. Public CMS Page Viewer Route
Route::get('/page/{slug}', function ($slug) {
    $page = CmsPage::where('slug', $slug)->firstOrFail();
    return Inertia::render('CmsShow', [
        'page' => $page,
    ]);
})->name('page.show');

// 3. Language Switcher Route
Route::get('/lang/{locale}', [LanguageController::class, 'switchLanguage'])->name('lang.switch');

// 4. Web3 Authentication Endpoints
Route::get('/web3/nonce', [Web3AuthController::class, 'getNonce'])->name('web3.nonce');
Route::post('/web3/verify', [Web3AuthController::class, 'verifySignature'])->name('web3.verify');

// 5. Authenticated Client Workspace
Route::middleware(['auth'])->group(function () {
    
    // Dashboard Route
    Route::get('/dashboard', function () {
        $user = auth()->user();
        $wallets = $user->wallets()->get(['currency_code', 'balance']);

        if ($wallets->isEmpty()) {
            $wallets = collect([
                Wallet::create(['user_id' => $user->id, 'currency_code' => 'USDT', 'balance' => 0]),
                Wallet::create(['user_id' => $user->id, 'currency_code' => 'ETH', 'balance' => 0]),
            ]);
        }

        return Inertia::render('Dashboard', [
            'wallets' => $wallets,
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'wallet_address' => $user->wallet_address,
                'kyc_status' => $user->kyc_status,
                'referral_code' => $user->referral_code,
            ]
        ]);
    })->name('dashboard');

    // Profile routes (Laravel Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Deposit endpoints
    Route::get('/deposits', [DepositController::class, 'index'])->name('deposits.index');
    Route::post('/deposits', [DepositController::class, 'store'])->name('deposits.store');
    Route::post('/deposits/{deposit}/approve', [DepositController::class, 'approve'])->name('deposits.approve');

    // Staking endpoints
    Route::get('/staking', [StakingController::class, 'index'])->name('staking.index');
    Route::post('/staking', [StakingController::class, 'store'])->name('staking.store');
    Route::post('/staking/{stake}/claim', [StakingController::class, 'claim'])->name('staking.claim');

    // KYC endpoints
    Route::get('/kyc', [KycController::class, 'index'])->name('kyc.index');
    Route::post('/kyc', [KycController::class, 'store'])->name('kyc.store');
    Route::post('/kyc/{kyc}/decision', [KycController::class, 'processDecision'])->name('kyc.decision');

    // P2P Marketplace & Trading endpoints
    Route::get('/p2p', [P2pController::class, 'index'])->name('p2p.index');
    Route::post('/p2p/offers', [P2pController::class, 'storeOffer'])->name('p2p.offers.store');
    Route::post('/p2p/trades/initiate', [P2pController::class, 'initiateTrade'])->name('p2p.trades.initiate');
    Route::get('/p2p/trades/{trade}', [P2pController::class, 'showTrade'])->name('p2p.trade');
    Route::post('/p2p/trades/{trade}/pay', [P2pController::class, 'submitPayment'])->name('p2p.trades.pay');
    Route::post('/p2p/trades/{trade}/release', [P2pController::class, 'releaseCrypto'])->name('p2p.trades.release');
    Route::post('/p2p/trades/{trade}/message', [P2pController::class, 'storeMessage'])->name('p2p.trades.message');

    // AI Recommendation endpoints
    Route::get('/ai', [AiRecommendationController::class, 'index'])->name('ai.index');
    Route::post('/ai/generate', [AiRecommendationController::class, 'generate'])->name('ai.generate');

    // Withdrawal endpoints
    Route::get('/withdrawals', [WithdrawalController::class, 'index'])->name('withdrawals.index');
    Route::post('/withdrawals', [WithdrawalController::class, 'store'])->name('withdrawals.store');
    Route::post('/withdrawals/{withdrawal}/decision', [WithdrawalController::class, 'processDecision'])->name('withdrawals.decision');

    // Referral endpoints
    Route::get('/referrals', [ReferralController::class, 'index'])->name('referrals.index');

    // Support Ticket endpoints
    Route::get('/support', [SupportTicketController::class, 'index'])->name('support.index');
    Route::post('/support', [SupportTicketController::class, 'store'])->name('support.store');
    Route::get('/support/{ticket}', [SupportTicketController::class, 'show'])->name('support.show');
    Route::post('/support/{ticket}/reply', [SupportTicketController::class, 'reply'])->name('support.reply');
    Route::post('/support/{ticket}/simulate-agent', [SupportTicketController::class, 'simulateAgentReply'])->name('support.simulate');
});

// Secured Master Administration Panel
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'index'])->name('dashboard');
    Route::post('/settings', [AdminController::class, 'updateSettings'])->name('settings.update');
    Route::post('/pools', [AdminController::class, 'storePool'])->name('pools.store');
    Route::delete('/pools/{pool}', [AdminController::class, 'deletePool'])->name('pools.delete');
    Route::post('/users/{user}/toggle-admin', [AdminController::class, 'toggleAdmin'])->name('users.toggle-admin');
    Route::post('/stakes/{stake}/force-complete', [AdminController::class, 'forceCompleteStake'])->name('stakes.force-complete');
    Route::post('/stakes/{stake}/cancel', [AdminController::class, 'cancelStake'])->name('stakes.cancel');
    Route::post('/cms/{page}', [AdminController::class, 'updateCmsPage'])->name('cms.update');
    
    // Official Admin Helpdesk Reply Endpoint (New)
    Route::post('/tickets/{ticket}/reply', [AdminController::class, 'replyToTicket'])->name('tickets.reply');
});

// Traditional Authentication Routes (Login, Register, Password Reset, etc.)
require __DIR__.'/auth.php';