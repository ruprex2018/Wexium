import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

export default function TradeRoom({ trade, messages, currentUser }) {
    const [successMessage, setSuccessMessage] = useState('');
    const chatEndRef = useRef(null);

    // Form for sending chat messages
    const { data: msgData, setData: setMsgData, post: postMessage, processing: msgProcessing, reset: resetMessage } = useForm({
        message: '',
    });

    // Form for uploading payment proof (Buyer only)
    const { data: uploadData, setData: setUploadData, post: postUpload, processing: uploadProcessing, errors: uploadErrors, reset: resetUpload } = useForm({
        payment_proof_file: null,
    });

    // Scroll chat to the bottom on load and whenever new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!msgData.message.trim()) return;

        postMessage(route('p2p.trades.message', trade.id), {
            onSuccess: () => resetMessage('message'),
        });
    };

    const handleUploadProof = (e) => {
        e.preventDefault();
        if (!uploadData.payment_proof_file) return;

        postUpload(route('p2p.trades.pay', trade.id), {
            onSuccess: () => {
                resetUpload();
                setSuccessMessage('Payment proof successfully submitted. Awaiting seller confirmation.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleReleaseCrypto = () => {
        router.post(route('p2p.trades.release', trade.id), {}, {
            onSuccess: () => {
                setSuccessMessage('Cryptocurrency successfully released from the escrow pool to the buyer.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Trade Room: #{trade.id}
                    </h2>
                    <Link
                        href={route('p2p.index')}
                        className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Back to P2P Market
                    </Link>
                </div>
            }
        >
            <Head title={`Trade Room #${trade.id}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {successMessage && (
                        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 font-medium">
                            {successMessage}
                        </div>
                    )}

                    {/* Trade Overview Banner */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
                        <div>
                            <span className="block text-xs uppercase font-semibold text-gray-400">Trading Quantity</span>
                            <span className="text-xl font-black text-gray-950 dark:text-gray-100">
                                {parseFloat(trade.amount)} {trade.offer?.currency_code}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase font-semibold text-gray-400">Total Price</span>
                            <span className="text-xl font-black text-gray-950 dark:text-gray-100">
                                ${parseFloat(trade.total_price).toFixed(2)} USD
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase font-semibold text-gray-400">Your Role</span>
                            <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold mt-1 ${
                                currentUser.role === 'buyer' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-orange-100 text-orange-800'
                            }`}>
                                {currentUser.role.toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase font-semibold text-gray-400">Trade Status</span>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${
                                trade.status === 'completed' ? 'bg-green-100 text-green-800' :
                                trade.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {trade.status.toUpperCase().replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    {/* Core Layout: Actions Panel (Left) & Chat Box (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Side: Escrow Status & Action Forms */}
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 lg:col-span-1 space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700">
                                Escrow Control Panel
                            </h3>

                            {/* Buyer Actions */}
                            {currentUser.role === 'buyer' && (
                                <div className="space-y-4">
                                    {trade.status === 'pending_payment' && (
                                        <form onSubmit={handleUploadProof} className="space-y-4">
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                                <div className="font-bold text-indigo-600">Payment Instructions:</div>
                                                <p>Transfer <strong>${parseFloat(trade.total_price).toFixed(2)} USD</strong> directly to the seller using their method:</p>
                                                <div className="font-mono text-xs bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700 mt-1 select-all">
                                                    Method: {trade.offer?.payment_method}<br />
                                                    Account/Address: {trade.offer?.payment_method === 'PayPal' ? trade.seller?.name : 'Seller Account Details'}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">
                                                    Upload Payment Screenshot
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => setUploadData('payment_proof_file', e.target.files[0])}
                                                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1.5 px-3 text-xs text-gray-955 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    required
                                                />
                                                {uploadErrors.payment_proof_file && (
                                                    <span className="text-xs text-red-500 mt-1 block">{uploadErrors.payment_proof_file}</span>
                                                )}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={uploadProcessing}
                                                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition"
                                            >
                                                {uploadProcessing ? 'Uploading...' : 'I Have Paid (Submit Proof)'}
                                            </button>
                                        </form>
                                    )}

                                    {trade.status === 'paid' && (
                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400 rounded-lg text-sm font-medium">
                                            Awaiting the Seller to confirm receipt and release the locked cryptocurrency from the escrow pool.
                                        </div>
                                    )}

                                    {trade.status === 'completed' && (
                                        <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-400 rounded-lg text-sm font-medium">
                                            Trade Complete. Your wallet balance has been successfully credited.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Seller Actions */}
                            {currentUser.role === 'seller' && (
                                <div className="space-y-4">
                                    {trade.status === 'pending_payment' && (
                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400 rounded-lg text-sm font-medium">
                                            Awaiting the buyer to transfer the off-chain funds and submit proof. Your crypto is locked securely in escrow.
                                        </div>
                                    )}

                                    {trade.status === 'paid' && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 rounded-lg text-sm">
                                                <div className="font-bold mb-1">Verify Payment Receipt:</div>
                                                <p className="mb-3">The buyer has marked payment complete. Please verify your bank/paypal account for receipt of <strong>${parseFloat(trade.total_price).toFixed(2)} USD</strong>.</p>
                                                <a
                                                    href={`/storage/${trade.payment_proof_file}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block py-1.5 px-3 bg-white dark:bg-gray-800 text-xs font-semibold rounded border dark:border-gray-700 hover:bg-gray-50 text-indigo-600 transition"
                                                >
                                                    View Payment Receipt Screenshot
                                                </a>
                                            </div>

                                            <button
                                                onClick={handleReleaseCrypto}
                                                className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition"
                                            >
                                                Release Crypto (Unlock Escrow)
                                            </button>
                                        </div>
                                    )}

                                    {trade.status === 'completed' && (
                                        <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-400 rounded-lg text-sm font-medium">
                                            Trade Complete. Cryptocurrency successfully released to the buyer.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Side: Chat Workspace */}
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 lg:col-span-2 flex flex-col h-[500px]">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700">
                                Trade Chat Log
                            </h3>

                            {/* Message Threads Scroll Area */}
                            <div className="flex-1 overflow-y-auto my-4 space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-800 text-sm">
                                {messages.map((msg) => {
                                    if (msg.is_system) {
                                        return (
                                            <div key={msg.id} className="text-center p-3 text-xs bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium border border-indigo-100/50 dark:border-indigo-900/30">
                                                {msg.message}
                                            </div>
                                        );
                                    }

                                    const isMe = msg.sender_id === currentUser.id;
                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <span className="text-[10px] text-gray-400 mb-1 px-1">{msg.sender?.name}</span>
                                            <div className={`p-3 rounded-lg max-w-[70%] font-medium ${
                                                isMe 
                                                    ? 'bg-indigo-600 text-white rounded-br-none' 
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none border dark:border-gray-700'
                                            }`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Message Sender Form */}
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Type your message here..."
                                    value={msgData.message}
                                    onChange={e => setMsgData('message', e.target.value)}
                                    className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm focus:outline-none"
                                    disabled={msgProcessing}
                                />
                                <button
                                    type="submit"
                                    disabled={msgProcessing}
                                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition"
                                >
                                    Send
                                </button>
                            </form>
                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}