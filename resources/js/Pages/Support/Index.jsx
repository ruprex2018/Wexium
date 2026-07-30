import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ tickets }) {
    const [successMessage, setSuccessMessage] = useState('');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        subject: '',
        priority: 'medium',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('support.store'), {
            onSuccess: () => {
                reset();
                clearErrors();
                setSuccessMessage('Your support ticket has been submitted. An agent will reply shortly.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Customer Support Desk
                </h2>
            }
        >
            <Head title="Support Helpdesk" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {successMessage && (
                        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 font-medium">
                            {successMessage}
                        </div>
                    )}

                    {/* Top Row: Create Ticket Form & Help Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Create Support Ticket Form */}
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 md:col-span-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 mb-6">
                                Submit a New Support Request
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Subject Input */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Subject</label>
                                        <input
                                            type="text"
                                            placeholder="What is the issue you are experiencing?"
                                            value={data.subject}
                                            onChange={e => setData('subject', e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-955 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                        {errors.subject && <span className="text-xs text-red-500 mt-1 block">{errors.subject}</span>}
                                    </div>

                                    {/* Priority Selection */}
                                    <div className="sm:col-span-1">
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Urgency Priority</label>
                                        <select
                                            value={data.priority}
                                            onChange={e => setData('priority', e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 h-10 text-sm text-gray-955 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="low">Low Priority</option>
                                            <option value="medium">Medium Priority</option>
                                            <option value="high">High Priority</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Initial Message Description */}
                                <div>
                                    <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Detailed Description</label>
                                    <textarea
                                        rows="5"
                                        placeholder="Please provide a comprehensive explanation of your concern (wallet balances, transaction hashes, staking details, etc.) so our staff can assist you."
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-955 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    ></textarea>
                                    {errors.message && <span className="text-xs text-red-500 mt-1 block">{errors.message}</span>}
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg text-sm transition"
                                    >
                                        {processing ? 'Submitting ticket...' : 'Submit Support Ticket'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Help Desk Info sidebar */}
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 md:col-span-1 space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700">
                                helpdesk Information
                            </h3>
                            <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed space-y-3">
                                <p>
                                    Metastake operates a 24/7 technical help desk to resolve complex blockchain, wallet, and P2P exchange anomalies.
                                </p>
                                <p>
                                    Before opening a ticket for deposits or withdrawals, please verify that your transaction has successfully processed on the respective blockchain network.
                                </p>
                                <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                                    Note: You can simulate conversations with technical agents on the ticket details page.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Row: Support Tickets Ledger */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                            My Support Tickets History
                        </h3>

                        {tickets.length === 0 ? (
                            <div className="text-center py-6 text-sm text-gray-500">
                                You do not have any active or resolved support tickets.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-400">
                                            <th className="py-3 px-4">Ticket ID</th>
                                            <th className="py-3 px-4">Date Opened</th>
                                            <th className="py-3 px-4">Subject</th>
                                            <th className="py-3 px-4">Urgency Priority</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {tickets.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                                                <td className="py-4 px-4 font-mono text-xs text-indigo-600">
                                                    #T-{t.id}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-xs">
                                                    {new Date(t.created_at).toLocaleString()}
                                                </td>
                                                <td className="py-4 px-4 font-bold text-gray-950 dark:text-gray-100 whitespace-nowrap">
                                                    {t.subject}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                                                        t.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                        t.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {t.priority.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                        t.status === 'replied' ? 'bg-blue-100 text-blue-800' :
                                                        t.status === 'closed' ? 'bg-green-100 text-green-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {t.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-center whitespace-nowrap">
                                                    <Link
                                                        href={route('support.show', t.id)}
                                                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold transition"
                                                    >
                                                        Enter Chat Room
                                                    </Link>
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