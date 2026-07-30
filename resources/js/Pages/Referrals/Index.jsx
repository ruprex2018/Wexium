import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ referral_code, referral_link, level1, level2, leaderboard, commissions }) {
    const [activeTab, setActiveTab] = useState('tree');
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referral_link);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
    };

    // Calculate aggregated statistics
    const totalCommissionsCount = commissions.length;
    const totalEarnedUSDT = commissions
        .filter(c => c.currency_code === 'USDT')
        .reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const totalEarnedETH = commissions
        .filter(c => c.currency_code === 'ETH')
        .reduce((sum, c) => sum + parseFloat(c.amount), 0);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Affiliate & Referral Network
                </h2>
            }
        >
            <Head title="Referrals & Commissions" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Top Row: Referral Link & Affiliate Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Referral Link Card */}
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 md:col-span-2 space-y-4 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 mb-4">
                                    Your Referral Link
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                                    Invite your network using your custom link or code. Direct referrals earn you a <strong>5% commission</strong> on their staking commitments. Indirect Level 2 referrals earn <strong>3%</strong>, and Level 3 referrals earn <strong>1%</strong>.
                                </p>
                                
                                <div className="flex gap-2">
                                    <div className="flex-1 font-mono text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border dark:border-gray-700 select-all overflow-x-auto text-gray-900 dark:text-gray-100 h-10 flex items-center">
                                        {referral_link}
                                    </div>
                                    <button
                                        onClick={handleCopyLink}
                                        className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs tracking-wider uppercase transition h-10 shrink-0"
                                    >
                                        {copySuccess ? 'Copied!' : 'Copy Link'}
                                    </button>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 mt-2 font-semibold">
                                Share Code: <span className="font-mono text-indigo-600 dark:text-indigo-400">{referral_code}</span>
                            </div>
                        </div>

                        {/* Earnings Summary Card */}
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 md:col-span-1 space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 mb-4">
                                Network Earnings
                            </h3>
                            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                                    <span>Total Network Size:</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">
                                        {level1.length + level2.length} Members
                                    </span>
                                </div>
                                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                                    <span>USDT Commission Earned:</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">
                                        {totalEarnedUSDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDT
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>ETH Commission Earned:</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">
                                        {totalEarnedETH.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })} ETH
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Middle Navigation Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('tree')}
                            className={`py-3 px-6 text-sm font-semibold transition ${
                                activeTab === 'tree'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            My Network Tree
                        </button>
                        <button
                            onClick={() => setActiveTab('commissions')}
                            className={`py-3 px-6 text-sm font-semibold transition ${
                                activeTab === 'commissions'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Affiliate Commissions ({totalCommissionsCount})
                        </button>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={`py-3 px-6 text-sm font-semibold transition ${
                                activeTab === 'leaderboard'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Global Leaderboard
                        </button>
                    </div>

                    {/* Tab Content A: Network Tree */}
                    {activeTab === 'tree' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Level 1: Direct Referrals Table */}
                            <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                                <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
                                    <h4 className="text-md font-bold text-gray-900 dark:text-gray-100">
                                        Level 1 (Direct Referrals)
                                    </h4>
                                    <span className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full font-bold">
                                        {level1.length} Directs
                                    </span>
                                </div>
                                {level1.length === 0 ? (
                                    <div className="text-center py-6 text-sm text-gray-500">No direct referrals yet.</div>
                                ) : (
                                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                                        <thead>
                                            <tr className="text-xs uppercase text-gray-400 border-b dark:border-gray-700">
                                                <th className="py-2">Name</th>
                                                <th className="py-2">KYC</th>
                                                <th className="py-2 text-right">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {level1.map((ref) => (
                                                <tr key={ref.id}>
                                                    <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{ref.name}</td>
                                                    <td className="py-3">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                            ref.kyc_status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>{ref.kyc_status.toUpperCase()}</span>
                                                    </td>
                                                    <td className="py-3 text-right text-xs">{new Date(ref.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Level 2: Indirect Referrals Table */}
                            <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                                <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
                                    <h4 className="text-md font-bold text-gray-900 dark:text-gray-100">
                                        Level 2 (Indirect Referrals)
                                    </h4>
                                    <span className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full font-bold">
                                        {level2.length} Indirects
                                    </span>
                                </div>
                                {level2.length === 0 ? (
                                    <div className="text-center py-6 text-sm text-gray-500">No Level 2 referrals yet.</div>
                                ) : (
                                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                                        <thead>
                                            <tr className="text-xs uppercase text-gray-400 border-b dark:border-gray-700">
                                                <th className="py-2">Name</th>
                                                <th className="py-2">KYC</th>
                                                <th className="py-2 text-right">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {level2.map((ref) => (
                                                <tr key={ref.id}>
                                                    <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{ref.name}</td>
                                                    <td className="py-3">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                            ref.kyc_status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>{ref.kyc_status.toUpperCase()}</span>
                                                    </td>
                                                    <td className="py-3 text-right text-xs">{new Date(ref.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                        </div>
                    )}

                    {/* Tab Content B: Commissions Ledger */}
                    {activeTab === 'commissions' && (
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Affiliate Commission Ledger
                            </h3>
                            {commissions.length === 0 ? (
                                <div className="text-center py-6 text-sm text-gray-500">No commissions earned yet.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-400">
                                                <th className="py-3 px-4">Earning Date</th>
                                                <th className="py-3 px-4">Affiliate Level</th>
                                                <th className="py-3 px-4">Purchased By</th>
                                                <th className="py-3 px-4 text-right">Earning Amount</th>
                                                <th className="py-3 px-4">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {commissions.map((c) => (
                                                <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        {new Date(c.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                            c.level === 1 ? 'bg-indigo-100 text-indigo-800' :
                                                            c.level === 2 ? 'bg-blue-100 text-blue-800' :
                                                            'bg-orange-100 text-orange-800'
                                                        }`}>
                                                            LEVEL {c.level}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap font-semibold">
                                                        {c.buyer?.name}
                                                    </td>
                                                    <td className="py-4 px-4 text-right font-black text-gray-950 dark:text-gray-100 whitespace-nowrap">
                                                        +{parseFloat(c.amount).toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 8
                                                        })} {c.currency_code}
                                                    </td>
                                                    <td className="py-4 px-4 text-xs italic">
                                                        {c.description}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab Content C: Leaderboard */}
                    {activeTab === 'leaderboard' && (
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 max-w-xl mx-auto">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 mb-6 text-center">
                                Top Referral Leaders
                            </h3>
                            <div className="space-y-4">
                                {leaderboard.map((leader) => (
                                    <div
                                        key={leader.rank}
                                        className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                                                leader.rank === 1 ? 'bg-yellow-500 text-white' :
                                                leader.rank === 2 ? 'bg-gray-400 text-white' :
                                                leader.rank === 3 ? 'bg-amber-600 text-white' :
                                                'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                                {leader.rank}
                                            </span>
                                            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                                                {leader.name}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            <span className="font-black text-indigo-600 dark:text-indigo-400">{leader.referrals_count}</span> referrals
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}