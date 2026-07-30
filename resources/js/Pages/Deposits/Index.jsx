import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ wallets, deposits, gateways }) {
    const [selectedGateway, setSelectedGateway] = useState(gateways[0]);
    const [successMessage, setSuccessMessage] = useState('');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        currency_code: 'USDT',
        amount: '',
        payment_method: gateways[0].method,
        tx_hash: '',
        proof_file: null,
    });

    // Update form when selected gateway changes
    useEffect(() => {
        setData(prev => ({
            ...prev,
            payment_method: selectedGateway.method,
            currency_code: selectedGateway.currencies[0] || 'USDT',
            tx_hash: '',
            proof_file: null
        }));
        clearErrors();
    }, [selectedGateway]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('deposits.store'), {
            onSuccess: () => {
                reset('amount', 'tx_hash', 'proof_file');
                setSuccessMessage('Deposit request successfully submitted.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleSimulateApprove = (depositId) => {
        router.post(route('deposits.approve', depositId), {}, {
            onSuccess: () => {
                setSuccessMessage('Simulation Complete: Deposit approved and balance credited.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Deposit Funds
                </h2>
            }
        >
            <Head title="Deposit" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {successMessage && (
                        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 font-medium">
                            {successMessage}
                        </div>
                    )}

                    {/* Top Row: Gateway Selection & Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Gateway Options Selector */}
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 lg:col-span-1 space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700">
                                1. Select Payment Method
                            </h3>
                            <div className="space-y-3">
                                {gateways.map((gw, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedGateway(gw)}
                                        className={`p-4 border rounded-xl cursor-pointer transition duration-150 ${
                                            selectedGateway.name === gw.name
                                                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        <div className="font-bold text-gray-950 dark:text-gray-100 text-sm">
                                            {gw.name}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Currencies: {gw.currencies.join(', ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Deposit Request Form */}
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 lg:col-span-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 mb-4">
                                2. Transaction Details
                            </h3>

                            {/* Gateway Instructions */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-600 dark:text-gray-400 mb-6">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Instructions:</span>
                                {selectedGateway.instructions}
                                <div className="mt-3 font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded border dark:border-gray-700 select-all overflow-x-auto text-gray-900 dark:text-gray-100">
                                    Recipient: {selectedGateway.address}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Currency Selection */}
                                    <div>
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Currency</label>
                                        <select
                                            value={data.currency_code}
                                            onChange={e => setData('currency_code', e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-950 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {selectedGateway.currencies.map((curr, idx) => (
                                                <option key={idx} value={curr}>{curr}</option>
                                            ))}
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
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-950 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {errors.amount && <span className="text-xs text-red-500 mt-1 block">{errors.amount}</span>}
                                    </div>
                                </div>

                                {/* Conditional Fields: Cryptographic TX Hash vs Proof File Upload */}
                                {selectedGateway.method === 'crypto' ? (
                                    <div>
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Transaction Hash (Tx ID)</label>
                                        <input
                                            type="text"
                                            placeholder="0x..."
                                            value={data.tx_hash}
                                            onChange={e => setData('tx_hash', e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm font-mono text-gray-950 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {errors.tx_hash && <span className="text-xs text-red-500 mt-1 block">{errors.tx_hash}</span>}
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Upload Payment Receipt (Image)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setData('proof_file', e.target.files[0])}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1 px-3 text-sm text-gray-950 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {errors.proof_file && <span className="text-xs text-red-500 mt-1 block">{errors.proof_file}</span>}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg text-sm transition"
                                    >
                                        {processing ? 'Submitting...' : 'Submit Deposit Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Bottom Row: Deposit Ledger History */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Deposit Requests History
                        </h3>

                        {deposits.length === 0 ? (
                            <div className="text-center py-6 text-sm text-gray-500">
                                No deposits requested yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-400">
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Method</th>
                                            <th className="py-3 px-4 text-right">Amount</th>
                                            <th className="py-3 px-4">Reference/Proof</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4 text-center">Simulation Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {deposits.map((dep, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    {new Date(dep.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className="capitalize">{dep.payment_method.replace('_', ' ')}</span>
                                                </td>
                                                <td className="py-4 px-4 text-right font-bold text-gray-950 dark:text-gray-100 whitespace-nowrap">
                                                    {parseFloat(dep.amount).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 8
                                                    })} {dep.currency_code}
                                                </td>
                                                <td className="py-4 px-4 font-mono text-xs max-w-xs truncate">
                                                    {dep.payment_method === 'crypto' ? (
                                                        <span title={dep.tx_hash}>{dep.tx_hash}</span>
                                                    ) : (
                                                        <a
                                                            href={`/storage/${dep.proof_file}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-indigo-600 hover:underline"
                                                        >
                                                            View Receipt File
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                        dep.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400' :
                                                        dep.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400'
                                                    }`}>
                                                        {dep.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-center whitespace-nowrap">
                                                    {dep.status === 'pending' ? (
                                                        <button
                                                            onClick={() => handleSimulateApprove(dep.id)}
                                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition"
                                                        >
                                                            Approve (Simulate Admin)
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">None (Processed)</span>
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