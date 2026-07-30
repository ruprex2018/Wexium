import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

export default function Show({ ticket, messages }) {
    const chatEndRef = useRef(null);

    // Form for user replies
    const { data: userData, setData: setUserData, post: postUserReply, processing: userProcessing, reset: resetUser } = useForm({
        message: '',
    });

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleUserReply = (e) => {
        e.preventDefault();
        if (!userData.message.trim()) return;

        postUserReply(route('support.reply', ticket.id), {
            onSuccess: () => resetUser('message'),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Ticket Thread: {ticket.subject} (ID: #T-{ticket.id})
                    </h2>
                    <Link
                        href={route('support.index')}
                        className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Back to Helpdesk
                    </Link>
                </div>
            }
        >
            <Head title={`Ticket Room #${ticket.id}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">

                    {/* Ticket Metadata Banner */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                        <div>
                            <span className="block text-xs uppercase font-semibold text-gray-400">Subject</span>
                            <span className="text-md font-bold text-gray-950 dark:text-gray-100">{ticket.subject}</span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase font-semibold text-gray-400">Urgency Priority</span>
                            <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold mt-1 ${
                                ticket.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                                {ticket.priority.toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase font-semibold text-gray-400">Ticket Status</span>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${
                                ticket.status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {ticket.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Chat Workspace (Spans full width for customers) */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 flex flex-col h-[500px]">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700">
                            Message History
                        </h3>

                        {/* Thread scroll area */}
                        <div className="flex-1 overflow-y-auto my-4 space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-800 text-sm">
                            {messages.map((msg) => {
                                const isAgent = msg.is_admin;
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                                        <span className="text-[10px] text-gray-400 mb-1 px-1">
                                            {isAgent ? '💬 Helpdesk Support Agent' : '👤 You'} — {new Date(msg.created_at).toLocaleTimeString()}
                                        </span>
                                        <div className={`p-3 rounded-lg max-w-[70%] font-medium ${
                                            isAgent 
                                                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none border dark:border-gray-700'
                                                : 'bg-indigo-600 text-white rounded-br-none' 
                                        }`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        {/* User reply composer */}
                        {ticket.status !== 'closed' ? (
                            <form onSubmit={handleUserReply} className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Type your message reply..."
                                    value={userData.message}
                                    onChange={e => setUserData('message', e.target.value)}
                                    className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm focus:outline-none"
                                    disabled={userProcessing}
                                />
                                <button
                                    type="submit"
                                    disabled={userProcessing}
                                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition"
                                >
                                    Reply
                                </button>
                            </form>
                        ) : (
                            <div className="text-center p-3 text-xs bg-gray-100 dark:bg-gray-900 text-gray-500 rounded-lg font-medium border dark:border-gray-800">
                                This support ticket has been marked as CLOSED / RESOLVED. You can no longer send replies.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}