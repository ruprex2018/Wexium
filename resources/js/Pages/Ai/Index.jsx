import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ latestReport, wallets }) {
    const [successMessage, setSuccessMessage] = useState('');
    const { post, processing } = useForm({});

    const handleGenerate = (e) => {
        e.preventDefault();
        post(route('ai.generate'), {
            onSuccess: () => {
                setSuccessMessage('AI Portfolio Strategy successfully compiled.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    /**
     * Secure, lightweight regex parser to render Claude's Markdown report 
     * directly into standard, styled HTML elements without external libraries.
     */
    const renderMarkdown = (markdown) => {
        if (!markdown) return '';

        let html = markdown;

        // Convert H3 Headers
        html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-extrabold text-gray-950 dark:text-gray-50 mt-6 mb-3">$1</h3>');

        // Convert H4 Headers
        html = html.replace(/^#### (.*$)/gim, '<h4 class="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-4 mb-2">$1</h4>');

        // Convert Bold Text (**text**)
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-gray-100">$1</strong>');

        // Convert Italic Text (*text*)
        html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-500 dark:text-gray-400">$1</em>');

        // Convert Bullet Lists (- list item)
        html = html.replace(/^\s*-\s*(.*$)/gim, '<li class="ml-5 list-disc text-gray-600 dark:text-gray-400 mb-1">$1</li>');

        // Format Paragraph Spacing (replace double newlines with block divisions)
        html = html.split('\n\n').map(para => `<p class="mb-4 leading-relaxed text-sm text-gray-700 dark:text-gray-300">${para}</p>`).join('');

        // Replace single newlines with standard breaks
        html = html.replace(/\n/g, '<br />');

        return html;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    AI Portfolio Advisor
                </h2>
            }
        >
            <Head title="AI Portfolio Insights" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">

                    {successMessage && (
                        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 font-medium">
                            {successMessage}
                        </div>
                    )}

                    {/* AI Advisor Explanation Panel */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                        <div className="md:col-span-3 space-y-2">
                            <h3 className="text-md font-bold text-gray-950 dark:text-gray-100">
                                Claude 3.5 Sonnet Financial Optimizer
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                This engine reviews your active multi-currency wallets, audits current DeFi pool yields, and builds an allocation report to safely maximize your APY returns.
                            </p>
                        </div>
                        <div className="md:col-span-1">
                            <form onSubmit={handleGenerate}>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg text-xs tracking-wider uppercase transition shadow"
                                >
                                    {processing ? 'Analyzing...' : 'Compile Strategy'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* AI Generated Report Presentation Box */}
                    <div className="bg-white p-8 shadow-sm sm:rounded-lg dark:bg-gray-800 border border-gray-100 dark:border-gray-900">
                        {processing ? (
                            <div className="py-24 text-center space-y-4">
                                {/* Simple Loading Spinner */}
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                                <div className="text-sm font-semibold text-gray-500">
                                    Auditing ledger balances, reviewing APY rates, and compiling strategy...
                                </div>
                            </div>
                        ) : latestReport ? (
                            <div className="prose dark:prose-invert max-w-none">
                                <div className="flex justify-between items-center border-b pb-4 mb-6 border-gray-100 dark:border-gray-700">
                                    <span className="text-xs uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400">Active Advisory Report</span>
                                    <span className="text-xs text-gray-400">Updated: {new Date(latestReport.created_at).toLocaleString()}</span>
                                </div>
                                <div 
                                    className="text-gray-800 dark:text-gray-200"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(latestReport.recommendation) }}
                                />
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-full inline-block text-indigo-600 dark:text-indigo-400">
                                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                                </div>
                                <h4 className="text-md font-bold text-gray-900 dark:text-gray-100">No Advisory Plan Compiled Yet</h4>
                                <p className="text-xs text-gray-400 max-w-md mx-auto">
                                    Click the **"Compile Strategy"** button above to generate your first personalized, AI-driven asset strategy plan.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}