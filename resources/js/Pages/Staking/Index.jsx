import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ pools, wallets, stakes }) {
    const [successMessage, setSuccessMessage] = useState('');
    const [activePool, setActivePool] = useState(pools[0] || null);

    const [calcAmount, setCalcAmount] = useState('');
    const [calcPool, setCalcPool] = useState(pools[0] || null);
    const [calcResult, setCalcResult] = useState({ reward: 0, total: 0 });

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        staking_pool_id: pools[0]?.id || '',
        amount: '',
    });

    useEffect(() => {
        if (activePool) {
            setData(prev => ({
                ...prev,
                staking_pool_id: activePool.id,
                amount: ''
            }));
            clearErrors();
        }
    }, [activePool]);

    useEffect(() => {
        if (calcPool && calcAmount > 0) {
            const amount = parseFloat(calcAmount);
            const apyFraction = calcPool.apy / 100;
            const periodFraction = calcPool.lock_period_days / 365;
            const reward = amount * apyFraction * periodFraction;
            setCalcResult({
                reward: reward,
                total: amount + reward
            });
        } else {
            setCalcResult({ reward: 0, total: 0 });
        }
    }, [calcAmount, calcPool]);

    const handleStake = (e) => {
        e.preventDefault();
        post(route('staking.store'), {
            onSuccess: () => {
                reset('amount');
                setSuccessMessage(`Successfully staked into ${activePool.name}.`);
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleClaim = (stakeId) => {
        router.post(route('staking.claim', stakeId), {}, {
            onSuccess: () => {
                setSuccessMessage('Staking position closed. Principal and interest credited to your wallet.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    DeFi Staking Pools
                </h2>
            }
        >
            <Head title="Staking" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {successMessage && (
                        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 font-medium">
                            {successMessage}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                Active Staking Pools
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {pools.map((pool) => (
                                    <div
                                        key={pool.id}
                                        onClick={() => setActivePool(pool)}
                                        className={`p-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl cursor-pointer border transition duration-150 flex flex-col justify-between ${
                                            activePool?.id === pool.id
                                                ? 'border-indigo-600 ring-1 ring-indigo-600'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-xs uppercase font-bold px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                                                    {pool.currency_code}
                                                </span>
                                                <span className="text-lg font-black text-green-600 dark:text-green-400">
                                                    {parseFloat(pool.apy)}% APY
                                                </span>
                                            </div>
                                            <h4 className="text-md font-bold text-gray-900 dark:text-gray-100 mb-2">
                                                {pool.name}
                                            </h4>
                                            <div className="text-sm text-gray-500 space-y-1 mb-6">
                                                <div className="flex justify-between">
                                                    <span>Lock Period:</span>
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{pool.lock_period_days} Days</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Min Stake:</span>
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{parseFloat(pool.min_stake)} {pool.currency_code}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Pool Capacity:</span>
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                        {parseFloat(pool.total_staked).toLocaleString()} / {parseFloat(pool.capacity).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                                            <div
                                                className="bg-indigo-600 h-1.5 rounded-full"
                                                style={{ width: `${Math.min((pool.total_staked / pool.capacity) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 lg:col-span-1 space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700">
                                Yield Calculator
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Select Pool</label>
                                    <select
                                        value={calcPool?.id || ''}
                                        onChange={e => setCalcPool(pools.find(p => p.id === parseInt(e.target.value)))}
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm focus:outline-none"
                                    >
                                        {pools.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.apy}%)</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Investment Principal</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={calcAmount}
                                        onChange={e => setCalcAmount(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm focus:outline-none"
                                    />
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-2 border border-gray-100 dark:border-gray-800">
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Estimated Yield Interest:</span>
                                        <span className="font-bold text-green-600 dark:text-green-400">
                                            {calcResult.reward.toFixed(6)} {calcPool?.currency_code}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 border-t pt-2 dark:border-gray-800">
                                        <span>Total Return Payout:</span>
                                        <span className="font-bold text-gray-950 dark:text-gray-100">
                                            {calcResult.total.toFixed(6)} {calcPool?.currency_code}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {activePool && (
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 mb-6">
                                Stake into: <span className="text-indigo-600 dark:text-indigo-400">{activePool.name}</span>
                            </h3>
                            <form onSubmit={handleStake} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                <div>
                                    <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Available Balance</label>
                                    <div className="w-full bg-gray-100 dark:bg-gray-900 border border-transparent rounded-lg py-2 px-3 text-sm font-bold text-gray-900 dark:text-gray-100">
                                        {(parseFloat(wallets.find(w => w.currency_code === activePool.currency_code)?.balance || 0)).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 8
                                        })} {activePool.currency_code}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Amount to Stake</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder={`Min: ${parseFloat(activePool.min_stake)}`}
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm focus:outline-none"
                                    />
                                    {errors.amount && <span className="text-xs text-red-500 mt-1 block">{errors.amount}</span>}
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg text-sm transition"
                                    >
                                        {processing ? 'Processing Lockup...' : 'Lock Funds & Start Staking'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                            My Staking Ledger Positions
                        </h3>

                        {stakes.length === 0 ? (
                            <div className="text-center py-6 text-sm text-gray-500">No active staking positions yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-400">
                                            <th className="py-3 px-4">Pool Name</th>
                                            <th className="py-3 px-4 text-right">Staked Capital</th>
                                            <th className="py-3 px-4 text-center">Locked APY</th>
                                            <th className="py-3 px-4">Lock Start Date</th>
                                            <th className="py-3 px-4">Lock End Date</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {stakes.map((stake) => {
                                            const isLocked = new Date() < new Date(stake.ends_at);
                                            return (
                                                <tr key={stake.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                                                    <td className="py-4 px-4 font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                                        {stake.pool?.name}
                                                    </td>
                                                    <td className="py-4 px-4 text-right font-bold text-gray-950 dark:text-gray-100 whitespace-nowrap">
                                                        {parseFloat(stake.amount).toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 8
                                                        })}
                                                    </td>
                                                    <td className="py-4 px-4 text-center font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                                                        {parseFloat(stake.apy)}%
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        {new Date(stake.staked_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        {new Date(stake.ends_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                            stake.status === 'claimed' ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400' :
                                                            stake.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400' :
                                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400'
                                                        }`}>
                                                            {stake.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-center whitespace-nowrap">
                                                        {stake.status === 'active' ? (
                                                            isLocked ? (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-900 text-gray-400 rounded text-xs font-bold">
                                                                    🔒 Locked
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleClaim(stake.id)}
                                                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition"
                                                                >
                                                                    Unstake & Claim
                                                                </button>
                                                            )
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">Settled</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}