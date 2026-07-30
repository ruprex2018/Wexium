import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Web3 Login States
    const [web3Loading, setWeb3Loading] = useState(false);
    const [web3Error, setWeb3Error] = useState('');

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    /**
     * Handles the Web3 connection, signing, and authentication.
     */
    const handleWeb3Login = async () => {
        setWeb3Error('');
        setWeb3Loading(true);

        // 1. Verify a Web3 provider is present in the browser
        if (!window.ethereum) {
            setWeb3Error('No Web3 wallet detected. Please install MetaMask or another EVM wallet.');
            setWeb3Loading(false);
            return;
        }

        try {
            // 2. Request user to connect their wallet address
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            const address = accounts[0];

            // 3. Request cryptographic login nonce from the Laravel backend
            const nonceResponse = await axios.get(route('web3.nonce'));
            const { message } = nonceResponse.data;

            // Convert string message to hexadecimal format for the personal_sign RPC method
            const hexMessage = '0x' + Array.from(new TextEncoder().encode(message))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            // 4. Request signature from MetaMask
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [hexMessage, address],
            });

            // 5. Submit the signature and address to backend for verification
            const verifyResponse = await axios.post(route('web3.verify'), {
                address: address,
                signature: signature
            });

            if (verifyResponse.data.success) {
                // If verified, redirect the user to the authenticated dashboard
                window.location.href = verifyResponse.data.redirect;
            } else {
                setWeb3Error('Authentication failed.');
                setWeb3Loading(false);
            }

        } catch (err) {
            console.error(err);
            setWeb3Error(err.response?.data?.error || err.message || 'Authentication canceled or failed.');
            setWeb3Loading(false);
        }
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            {/* Web3 Authentication Area */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                <button
                    type="button"
                    onClick={handleWeb3Login}
                    disabled={web3Loading}
                    className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg shadow transition duration-200"
                >
                    {web3Loading ? (
                        <span>Verifying Signature...</span>
                    ) : (
                        <>
                            {/* Simple Wallet Icon SVG */}
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                            </svg>
                            <span>Connect Web3 Wallet</span>
                        </>
                    )}
                </button>

                {web3Error && (
                    <div className="mt-3 text-sm text-red-600 dark:text-red-400 text-center font-medium">
                        {web3Error}
                    </div>
                )}
            </div>

            <div className="text-center text-sm text-gray-500 mb-4 font-semibold">
                — OR —
            </div>

            {/* Traditional Login Form */}
            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}