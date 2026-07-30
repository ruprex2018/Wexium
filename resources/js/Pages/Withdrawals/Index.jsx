import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ wallets, withdrawals }) {
    const [successMessage, setSuccessMessage] = useState('');
    const [simulatedFeedback, setSimulatedReason] = useState('');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        currency_code: 'USDT',
        amount: '',
        wallet_address: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('withdrawals.store'), {
            onSuccess: () => {
                reset('amount', 'wallet_address');
                clearErrors();
                setSuccessMessage('Withdrawal request successfully placed on hold.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleSimulateDecision = (withdrawalId, decision) => {
        if (decision === 'rejected' && !simulatedFeedback.trim()) {
            alert('Please enter a rejection reason for the simulation.');
            return;
        }

        router.post(route('withdrawals.decision', withdrawalId), {
            decision: decision,
            feedback: decision === 'rejected' ? simulatedFeedback : 'Approved and broadcast to the blockchain network.'
        }, {
            onSuccess: () => {
                setSuccessMessage(`Simulation Complete: Withdrawal request successfully ${decision.toUpperCase()}.`);
                setSimulatedReason('');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Withdraw Funds
                </h2>
            }
        >
            <Head title="Withdraw" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {successMessage && (
                        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 font-medium">
                            {successMessage}
                        </div>
                    )}

                    {/* Top Row: Form and Balances Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Available Balance Cards */}
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 md:col-span-1 space-y-4 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 mb-4">
                                    Ledger Balances
                                </h3>
                                <div className="space-y-4">
                                    {wallets.map((wallet, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-700">
                                            <span className="block text-xs uppercase font-semibold text-gray-400 mb-1">{wallet.currency_code} Wallet</span>
                                            <span className="text-xl font-black text-gray-950 dark:text-gray-100">
                                                {parseFloat(wallet.balance).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 8
                                                })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 mt-4 leading-relaxed">
                                Note: Placing a withdrawal request will immediately put those funds on hold, deducting them from your active balance. If a request is rejected, the funds will be instantly refunded back to your ledger.
                            </div>
                        </div>

                        {/* Withdrawal Submission Form */}
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 md:col-span-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 mb-6">
                                Submit Withdrawal Request
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Currency Selection */}
                                    <div>
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Asset</label>
                                        <select
                                            value={data.currency_code}
                                            onChange={e => setData('currency_code', e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-955 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="USDT">USDT (Stablecoin)</option>
                                            <option value="ETH">ETH (Ethereum)</option>
                                        </select>
                                    </div>

                                    {/* Amount Input */}
                                    <div>
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Amount</label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="0.00"
                                            value={data.amount}
                                            onChange={e => setData('amount', e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-955 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                        {errors.amount && <span className="text-xs text-red-500 mt-1 block">{errors.amount}</span>}
                                    </div>
                                </div>

                                {/* Destination Wallet Address */}
                                <div>
                                    <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Destination Wallet Address (Recipient)</label>
                                    <input
                                        type="text"
                                        placeholder="Enter recipient ERC-20 / EVM address (0x...)"
                                        value={data.wallet_address}
                                        onChange={e => setData('wallet_address', e.target.value)}
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm font-mono text-gray-955 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.wallet_address && <span className="text-xs text-red-500 mt-1 block">{errors.wallet_address}</span>}
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg text-sm transition"
                                    >
                                        {processing ? 'Processing Hold...' : 'Request Withdrawal'}
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>

                    {/* Bottom Row: Withdrawals Ledger History */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Withdrawal Requests History
                        </h3>

                        {withdrawals.length === 0 ? (
                            <div className="text-center py-6 text-sm text-gray-500">
                                No withdrawal requests submitted yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-400">
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Destination Address</th>
                                            <th className="py-3 px-4 text-right">Amount</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4">Feedback / Memo</th>
                                            <th className="py-3 px-4 text-center">Simulation Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {withdrawals.map((withdraw) => (
                                            <tr key={withdraw.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    {new Date(withdraw.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-4 font-mono text-xs max-w-xs truncate" title={withdraw.wallet_address}>
                                                    {withdraw.wallet_address}
                                                </td>
                                                <td className="py-4 px-4 text-right font-bold text-gray-950 dark:text-gray-100 whitespace-nowrap">
                                                    {parseFloat(withdraw.amount).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 8
                                                    })} {withdraw.currency_code}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                        withdraw.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        withdraw.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {withdraw.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-xs italic">
                                                    {withdraw.admin_feedback || 'Pending audit review...'}
                                                </td>
                                                <td className="py-4 px-4 text-center whitespace-nowrap">
                                                    {withdraw.status === 'pending' ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            {/* Simulate Reject input */}
                                                            <input
                                                                type="text"
                                                                placeholder="Reason if rejecting"
                                                                value={simulatedFeedback}
                                                                onChange={e => setSimulatedReason(e.target.value)}
                                                                className="py-1 px-2 border border-gray-300 rounded text-xs focus:outline-none w-36 bg-white dark:bg-gray-900"
                                                            />
                                                            <button
                                                                onClick={() => handleSimulateDecision(withdraw.id, 'approved')}
                                                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleSimulateDecision(withdraw.id, 'rejected')}
                                                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">Settled</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
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