import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ kycStatus, kycRequest }) {
    const [successMessage, setSuccessMessage] = useState('');
    const [simulatedReason, setSimulatedReason] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        document_type: 'national_id',
        document_number: '',
        front_image: null,
        back_image: null,
        selfie_image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('kyc.store'), {
            onSuccess: () => {
                reset();
                setSuccessMessage('KYC documents submitted successfully.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleSimulateDecision = (decision) => {
        if (decision === 'rejected' && !simulatedReason.trim()) {
            alert('Please enter a rejection reason for the simulation.');
            return;
        }

        router.post(route('kyc.decision', kycRequest.id), {
            decision: decision,
            rejection_reason: decision === 'rejected' ? simulatedReason : null
        }, {
            onSuccess: () => {
                setSuccessMessage(`Simulation Complete: KYC request updated to ${decision.toUpperCase()}.`);
                setSimulatedReason('');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Identity Verification (KYC)
                </h2>
            }
        >
            <Head title="KYC Verification" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">

                    {successMessage && (
                        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 font-medium">
                            {successMessage}
                        </div>
                    )}

                    {/* Status Alert Banners */}
                    {kycStatus === 'approved' && (
                        <div className="p-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl flex items-start gap-4">
                            <div className="p-2 bg-green-500 rounded-lg text-white">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-green-900 dark:text-green-400">Verification Complete</h4>
                                <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                                    Your identity has been verified successfully. Your account limits have been elevated, and all P2P trading features are unlocked.
                                </p>
                            </div>
                        </div>
                    )}

                    {kycStatus === 'pending' && (
                        <div className="p-6 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-xl flex items-start gap-4">
                            <div className="p-2 bg-yellow-500 rounded-lg text-white">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-yellow-900 dark:text-yellow-400">Verification Under Review</h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                                    Your documents have been submitted and are currently in the queue for manual auditing. This usually takes between 12 to 24 hours.
                                </p>
                            </div>
                        </div>
                    )}

                    {kycStatus === 'rejected' && (
                        <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-4">
                            <div className="p-2 bg-red-500 rounded-lg text-white">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-red-900 dark:text-red-400">Verification Rejected</h4>
                                <p className="text-sm text-red-700 dark:text-red-500 mt-1 font-semibold">
                                    Reason: <span className="italic font-normal">{kycRequest?.rejection_reason || 'Documents were unclear or incomplete.'}</span>
                                </p>
                                <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                                    Please review your document details and submit clear, high-resolution images below to try again.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* KYC Document Submission Form */}
                    {['unsubmitted', 'rejected'].includes(kycStatus) && (
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 mb-6">
                                Submit Verification Documents
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Document Type Dropdown */}
                                    <div>
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Document Type</label>
                                        <select
                                            value={data.document_type}
                                            onChange={e => setData('document_type', e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2px px-3 h-10 text-sm text-gray-955 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="national_id">National ID Card</option>
                                            <option value="passport">International Passport</option>
                                            <option value="drivers_license">Driver's License</option>
                                        </select>
                                    </div>

                                    {/* Document Number Input */}
                                    <div>
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Document ID Number</label>
                                        <input
                                            type="text"
                                            placeholder="Enter card or passport number"
                                            value={data.document_number}
                                            onChange={e => setData('document_number', e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 h-10 text-sm text-gray-955 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {errors.document_number && <span className="text-xs text-red-500 mt-1 block">{errors.document_number}</span>}
                                    </div>
                                </div>

                                {/* File Upload Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Front Side Upload */}
                                    <div>
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Document Front Side</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setData('front_image', e.target.files[0])}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1.5 px-3 text-xs text-gray-955 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {errors.front_image && <span className="text-xs text-red-500 mt-1 block">{errors.front_image}</span>}
                                    </div>

                                    {/* Back Side Upload */}
                                    {data.document_type !== 'passport' && (
                                        <div>
                                            <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Document Back Side</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => setData('back_image', e.target.files[0])}
                                                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1.5 px-3 text-xs text-gray-955 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            {errors.back_image && <span className="text-xs text-red-500 mt-1 block">{errors.back_image}</span>}
                                        </div>
                                    )}

                                    {/* Selfie Upload */}
                                    <div>
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Selfie with Document</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setData('selfie_image', e.target.files[0])}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1.5 px-3 text-xs text-gray-955 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {errors.selfie_image && <span className="text-xs text-red-500 mt-1 block">{errors.selfie_image}</span>}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg text-sm transition"
                                    >
                                        {processing ? 'Uploading files...' : 'Submit Documents for Verification'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Admin Verification Decision Simulator */}
                    {kycStatus === 'pending' && kycRequest && (
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 border border-indigo-100 dark:border-indigo-950">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Simulate Administrative Review
                            </h3>
                            <p className="text-xs text-gray-500 mb-6">
                                Because you are running on a local development server, use this panel to simulate an admin reviewing your submitted files.
                            </p>

                            {/* Display Submitted Meta-details */}
                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6 border dark:border-gray-800">
                                <div>
                                    <span className="block font-semibold text-gray-400">Document Type:</span>
                                    <span className="capitalize">{kycRequest.document_type.replace('_', ' ')}</span>
                                </div>
                                <div>
                                    <span className="block font-semibold text-gray-400">ID Number:</span>
                                    <span className="font-mono">{kycRequest.document_number}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="block font-semibold text-gray-400 mb-1">Uploaded Proofs:</span>
                                    <div className="flex gap-4">
                                        <a href={`/storage/${kycRequest.front_image}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Front ID Image</a>
                                        {kycRequest.back_image && <a href={`/storage/${kycRequest.back_image}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Back ID Image</a>}
                                        {kycRequest.selfie_image && <a href={`/storage/${kycRequest.selfie_image}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Selfie Image</a>}
                                    </div>
                                </div>
                            </div>

                            {/* Simulation Actions */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Rejection Reason (Only required if rejecting)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Selfie photo was blurry, or ID is expired"
                                        value={simulatedReason}
                                        onChange={e => setSimulatedReason(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-955 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleSimulateDecision('approved')}
                                        className="py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition"
                                    >
                                        Approve Verification
                                    </button>
                                    <button
                                        onClick={() => handleSimulateDecision('rejected')}
                                        className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition"
                                    >
                                        Reject Verification
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}