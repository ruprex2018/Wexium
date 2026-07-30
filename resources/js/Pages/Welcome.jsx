import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Welcome({ auth }) {
    const user = auth?.user;
    const [logoError, setLogoError] = useState(false); // Failsafe for broken logo assets

    const props = usePage().props;
    const appName = props.appName || 'Metastake';
    const appLogo = props.appLogo || null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden">
            <Head title={`${appName} — Web3 Investment & P2P Trading Platform`} />

            {/* Ambient Glowing Background Radial Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-950/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-950/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header Navigation */}
            <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b border-slate-900">
                <div className="flex items-center gap-2">
                    {appLogo && !logoError ? (
                        <Link href="/" className="block">
                            <img 
                                src={`/storage/${appLogo}`} 
                                alt={appName} 
                                onError={() => setLogoError(true)}
                                className="max-h-9 w-auto object-contain" 
                            />
                        </Link>
                    ) : (
                        <Link href="/" className="flex items-center gap-2">
                            <svg className="h-8 w-auto fill-current text-emerald-500" viewBox="0 0 24 24">
                                <path d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                            </svg>
                            <span className="font-extrabold tracking-wider text-xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent uppercase">
                                {appName}
                            </span>
                        </Link>
                    )}
                </div>

                <nav className="flex items-center gap-4">
                    {user ? (
                        <Link
                            href={route('dashboard')}
                            className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-lg shadow-emerald-600/20"
                        >
                            Launch App
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="text-sm font-semibold text-slate-400 hover:text-white transition"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold rounded-lg text-sm border border-slate-800 transition"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 space-y-32">
                
                {/* Section 1: Hero Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6 text-center lg:text-left">
                        <div className="inline-block px-3 py-1 bg-emerald-950/30 border border-emerald-900/30 rounded-full text-xs font-bold text-emerald-400 tracking-wider uppercase">
                            Self-Hosted Web3 DeFi Portal
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
                            Own Your Future. <br />
                            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500 bg-clip-text text-transparent">
                                Earn Yield Safely.
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            A secure portal with zero recurring SaaS costs. Connect your Web3 wallet to manage multi-currency ledgers, earn competitive staking APYs, trade in escrowed P2P markets, and generate portfolio strategies backed by AI.
                        </p>
                        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link
                                href={route('login')}
                                className="py-3 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition shadow-lg shadow-emerald-600/30 text-center"
                            >
                                Connect Web3 Wallet
                            </Link>
                            <Link
                                href={route('register')}
                                className="py-3 px-8 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold rounded-lg text-sm border border-slate-800 transition text-center"
                            >
                                Traditional Signup
                            </Link>
                        </div>
                    </div>

                    {/* Right side: Mock Interface Graphic */}
                    <div className="hidden lg:block relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-2xl blur-lg"></div>
                        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-2xl relative space-y-6 backdrop-blur-sm">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                                <span className="text-xs font-mono text-slate-500">metastake_terminal_node.exe</span>
                            </div>

                            {/* Wallet Ledger Mock */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                                    <span className="block text-[10px] uppercase font-bold text-slate-500">USDT Ledger</span>
                                    <span className="text-lg font-black text-white">45,150.00</span>
                                </div>
                                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                                    <span className="block text-[10px] uppercase font-bold text-slate-500">ETH Ledger</span>
                                    <span className="text-lg font-black text-white">12.8712</span>
                                </div>
                            </div>

                            {/* Staking Pool Mock */}
                            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400 font-semibold">Active Pool:</span>
                                    <span className="text-emerald-400 font-black">18.50% APY</span>
                                </div>
                                <div className="text-xs text-slate-500">
                                    ETH Moon Stake — Locked for 90 Days
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Live Asset Ticker Banner */}
                <div className="bg-slate-900/40 border border-slate-900/80 p-6 sm:rounded-2xl grid grid-cols-3 gap-6 text-center divide-x divide-slate-900">
                    <div>
                        <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Bitcoin</span>
                        <span className="text-lg font-bold text-white">$62,450.00</span>
                        <span className="text-xs text-emerald-500 font-semibold block mt-1">+2.45%</span>
                    </div>
                    <div>
                        <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Ethereum</span>
                        <span className="text-lg font-bold text-white">$3,240.50</span>
                        <span className="text-xs text-emerald-500 font-semibold block mt-1">+4.12%</span>
                    </div>
                    <div>
                        <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Tether (USDT)</span>
                        <span className="text-lg font-bold text-white">$1.00</span>
                        <span className="text-xs text-slate-400 font-semibold block mt-1">Stable</span>
                    </div>
                </div>

                {/* Section 3: Core DeFi Pillars */}
                <div className="space-y-12">
                    <div className="text-center space-y-4 max-w-xl mx-auto">
                        <h2 className="text-3xl font-black text-white">Consolidated Web3 Services</h2>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            No third-party subscription fees, no vendor lock-in, and full administrative oversight of your databases.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Feature 1 */}
                        <div className="bg-slate-900/50 p-6 border border-slate-900 rounded-xl space-y-4">
                            <div className="p-3 bg-emerald-950/30 border border-emerald-900/30 rounded-lg text-emerald-400 w-fit">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>
                            </div>
                            <h3 className="text-md font-bold text-white">Web3 Authentication</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Connect Metamask or WalletConnect instantly with passwordless cryptographic signature checks.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-slate-900/50 p-6 border border-slate-900 rounded-xl space-y-4">
                            <div className="p-3 bg-emerald-950/30 border border-emerald-900/30 rounded-lg text-emerald-400 w-fit">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                            </div>
                            <h3 className="text-md font-bold text-white">DeFi Staking Pools</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Lock assets inside designated yield pools to earn competitive APYs with integrated countdown timers.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-slate-900/50 p-6 border border-slate-900 rounded-xl space-y-4">
                            <div className="p-3 bg-emerald-950/30 border border-emerald-900/30 rounded-lg text-emerald-400 w-fit">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                            </div>
                            <h3 className="text-md font-bold text-white">P2P Escrow Market</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Exchange directly with partners via secure escrow holds, built-in chat logs, and receipt proof uploads.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-slate-900/50 p-6 border border-slate-900 rounded-xl space-y-4">
                            <div className="p-3 bg-emerald-950/30 border border-emerald-900/30 rounded-lg text-emerald-400 w-fit">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 4.86 6 7.42 6 10.5v5l-2 2v1h16v-1l-2-2z"/></svg>
                            </div>
                            <h3 className="text-md font-bold text-white">AI Portfolio Advisor</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Real-time portfolio analysis and action-plan suggestions backed by Claude 3.5 Sonnet integrations.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 4: Network Scale Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center border-t border-slate-900 pt-16">
                    <div className="space-y-1">
                        <span className="text-4xl font-black text-emerald-500 block">$48M+</span>
                        <span className="text-xs uppercase text-slate-500 tracking-wider">Total Staked Volume</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-4xl font-black text-teal-500 block">24,000+</span>
                        <span className="text-xs uppercase text-slate-500 tracking-wider">Active Wallet Ledgers</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-4xl font-black text-green-500 block">0.02s</span>
                        <span className="text-xs uppercase text-slate-500 tracking-wider">Average Ledger Execution</span>
                    </div>
                </div>

            </main>

            {/* Platform Footer */}
            <footer className="relative z-10 border-t border-slate-900 bg-slate-950 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <div>
                        &copy; {new Date().getFullYear()} {appName}. Self-Hosted DeFi Portal. All rights reserved.
                    </div>
                    <div className="flex gap-4">
                        <Link href={route('page.show', 'privacy-policy')} className="hover:text-slate-300">
                            Privacy Policy
                        </Link>
                        <Link href={route('page.show', 'terms-of-service')} className="hover:text-slate-300">
                            Terms of Service
                        </Link>
                        <a href="#" className="hover:text-slate-300">Smart Contract Audits</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}