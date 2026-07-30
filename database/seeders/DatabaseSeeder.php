<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\StakingPool;
use App\Models\CmsPage;
use App\Models\Setting;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with default configurations.
     */
    public function run(): void
    {
        // 1. Create Default Administrative User (Sponsor/Referrer A)
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'), // Change this password immediately on your live server
                'wallet_address' => '0x3d274ed190db175b6001474ee27c88b3b955fcd0',
                'is_admin' => true,
                'kyc_status' => 'approved',
                'referral_code' => 'ADMIN123',
            ]
        );

        // Initialize default administrator testing balances
        Wallet::firstOrCreate(['user_id' => $admin->id, 'currency_code' => 'USDT'], ['balance' => 10000.00]);
        Wallet::firstOrCreate(['user_id' => $admin->id, 'currency_code' => 'ETH'], ['balance' => 10.00]);

        // 2. Create Default System Settings & S.E.O. Metadata
        $settings = [
            'app_name' => 'Wexium',
            'app_logo' => null,
            'seo_title' => 'Wexium — Web3 DeFi Portal',
            'seo_description' => 'Self-hosted Web3 staking, locked investments, and P2P trading platform.',
            'seo_keywords' => 'web3, defi, staking, p2p, crypto, wexium',
        ];

        foreach ($settings as $key => $value) {
            Setting::firstOrCreate(['key' => $key], ['value' => $value]);
        }

        // 3. Create Default Staking Pools
        $pools = [
            [
                'name' => 'USDT Growth Staking',
                'currency_code' => 'USDT',
                'apy' => 12.00,
                'lock_period_days' => 30,
                'min_stake' => 10,
                'max_stake' => 10000,
                'capacity' => 50000,
            ],
            [
                'name' => 'ETH Moon Stake (Premium)',
                'currency_code' => 'ETH',
                'apy' => 18.50,
                'lock_period_days' => 90,
                'min_stake' => 0.01,
                'max_stake' => 50,
                'capacity' => 200,
            ],
        ];

        foreach ($pools as $pool) {
            StakingPool::firstOrCreate(['name' => $pool['name']], $pool);
        }

        // 4. Create Default CMS Pages
        $pages = [
            [
                'slug' => 'privacy-policy',
                'title' => 'Privacy Policy',
                'content' => '<h3>Privacy Policy Statement</h3><p>We value your privacy. Your decentralized ledger coordinates are only utilized to authenticate security structures on our platform.</p>'
            ],
            [
                'slug' => 'terms-of-service',
                'title' => 'Terms of Service',
                'content' => '<h3>Terms of Service Agreement</h3><p>By using Wexium, you agree that blockchain lockups and P2P transactions are governed strictly by your custom local database and smart contract rules.</p>'
            ]
        ];

        foreach ($pages as $page) {
            CmsPage::firstOrCreate(['slug' => $page['slug']], $page);
        }
    }
}