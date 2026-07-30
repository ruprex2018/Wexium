import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ wallets, profile }) {
    
    // Simple helper to truncate long hex wallet addresses
    const truncateAddress = (addr) => {
        if (!addr) return 'Not Connected';
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard Overview
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Top Row: Web3 & Profile Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Web3 Profile Details */}
                        <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 col-span-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Account Profile
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div>
                                    <span className="block text-xs uppercase font-semibold text-gray-400">Wallet Address</span>
                                    <span className="font-mono text-gray-900 dark:text-gray-100">
                                        {profile.wallet_address ? profile.wallet_address : 'Traditional Login'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase font-semibold text-gray-400">KYC Status</span>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${
                                        profile.kyc_status === 'approved' ? 'bg-green-100 text-green-800' :
                                        profile.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {profile.kyc_status.toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase font-semibold text-gray-400">Referral Code</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {profile.referral_code || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Panel */}
                        <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 col-span-1 flex flex-col justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Quick Actions
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Route to deposits index */}
                                <Link 
                                    href={route('deposits.index')}
                                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition text-center"
                                >
                                    Deposit
                                </Link>
                                
                                {/* Route to withdrawals index */}
                                <Link 
                                    href={route('withdrawals.index')}
                                    className="py-2.5 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg text-sm transition text-center"
                                >
                                    Withdraw
                                </Link>
                            </div>
                        </div>

                    </div>

                    {/* Middle Row: Multi-Currency Wallet Balances */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                            My Wallets
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {wallets.map((wallet, index) => (
                                <div 
                                    key={index} 
                                    className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs uppercase font-bold tracking-wider px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                                            {wallet.currency_code}
                                        </span>
                                        <span className="text-xs text-gray-400">Active Wallet</span>
                                    </div>
                                    <div className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1">
                                        {/* Display formatting handles both crypto and fiat precision */}
                                        {parseFloat(wallet.balance).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 8
                                        })}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Available {wallet.currency_code} Balance
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}