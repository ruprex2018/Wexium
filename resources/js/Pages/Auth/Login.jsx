import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useConnect, useSignMessage, useDisconnect, useAccount } from 'wagmi';
import axios from 'axios';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [web3Loading, setWeb3Loading] = useState(false);
    const [web3Error, setWeb3Error] = useState('');

    // Wagmi hooks to connect, sign, and disconnect wallets natively on mobile and desktop
    const { connectAsync, connectors } = useConnect();
    const { signMessageAsync } = useSignMessage();
    const { disconnectAsync } = useDisconnect();
    const { isConnected } = useAccount();

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleWeb3Login = async () => {
        setWeb3Error('');
        setWeb3Loading(true);

        try {
            // 1. Force disconnect previous cached sessions to prevent stuck states
            if (isConnected) {
                await disconnectAsync();
            }

            // 2. Select the WalletConnect connector (usually index 1 in our config)
            // On mobile, this instantly triggers the deep-link selector modal for MetaMask/Trust Wallet
            const walletConnectConnector = connectors.find(c => c.id === 'walletConnect') || connectors[0];
            
            const connection = await connectAsync({ 
                connector: walletConnectConnector 
            });
            
            const address = connection.accounts[0];

            // 3. Request cryptographic login nonce from the Laravel backend
            const nonceResponse = await axios.get(route('web3.nonce'));
            const { message } = nonceResponse.data;

            // 4. Request user to sign the message
            // On mobile, this deep-links back into MetaMask/Trust Wallet to request the signature
            const signature = await signMessageAsync({ message });

            // 5. Submit signature to backend for verification
            const verifyResponse = await axios.post(route('web3.verify'), {
                address: address,
                signature: signature
            });

            if (verifyResponse.data.success) {
                window.location.href = verifyResponse.data.redirect;
            } else {
                setWeb3Error('Authentication failed.');
                setWeb3Loading(false);
            }

        } catch (err) {
            console.error(err);
            setWeb3Error(err.response?.data?.error || err.message || 'Authentication canceled or failed.');
            setWeb3Loading(false);
            
            // Clean up connection on failure
            try { await disconnectAsync(); } catch (e) {}
        }
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && <div className="mb-4 text-sm font-medium text-emerald-500">{status}</div>}

            {/* Web3 Authentication Action Button */}
            <div className="mb-6 border-b border-slate-800 pb-6">
                <button
                    type="button"
                    onClick={handleWeb3Login}
                    disabled={web3Loading}
                    className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition duration-200"
                >
                    {web3Loading ? (
                        <span>Authenticating Wallet...</span>
                    ) : (
                        <>
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                            </svg>
                            <span>Connect Web3 Wallet</span>
                        </>
                    )}
                </button>

                {web3Error && (
                    <div className="mt-3 text-xs text-red-400 text-center font-semibold">
                        {web3Error}
                    </div>
                )}
            </div>

            <div className="text-center text-xs text-slate-500 mb-6 font-bold select-none">
                — OR TRADITIONAL ACCOUNT —
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-slate-400 font-semibold text-xs uppercase" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full bg-slate-950 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500 text-white rounded-lg text-sm h-10"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-slate-400 font-semibold text-xs uppercase" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full bg-slate-950 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500 text-white rounded-lg text-sm h-10"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-slate-800 text-emerald-600 bg-slate-950 focus:ring-emerald-500"
                        />
                        <span className="ms-2 text-xs text-slate-400 font-semibold">
                            Remember me
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs text-slate-400 underline hover:text-white"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-bold rounded-lg text-sm transition"
                    >
                        Log In
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}