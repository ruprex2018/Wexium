import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Authenticated({ header, children }) {
    // Safe access to prevent null-pointer crashes
    const props = usePage().props;
    const auth = props.auth || {};
    const user = auth.user || {};

    const [showingMobileMenu, setShowingNavigationDropdown] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const [dropupOpen, setDropupOpen] = useState(false); // Managed state for desktop Drop-Up menu

    const translations = props.translations || {};
    const locale = props.locale || 'en';
    const appName = props.appName || 'Metastake';
    const appLogo = props.appLogo || null;

    const __ = (key) => {
        return translations[key] || key;
    };

    const getLinkClass = (active) => {
        return `w-full flex items-center gap-3 py-2.5 px-4 rounded-lg text-sm font-semibold transition ${
            active 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
        }`;
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col md:flex-row">
            
            {/* 1. Mobile Top Header Bar */}
            <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between z-20 shrink-0">
                <Link href="/" className="flex items-center gap-2">
                    {appLogo && !logoError ? (
                        <img 
                            src={`/storage/${appLogo}`} 
                            alt={appName} 
                            onError={() => setLogoError(true)}
                            className="block h-7 w-auto object-contain" 
                        />
                    ) : (
                        <>
                            <svg className="h-6 w-auto fill-current text-emerald-500" viewBox="0 0 24 24">
                                <path d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                            </svg>
                            <span className="font-extrabold tracking-wider text-sm text-white uppercase">{appName}</span>
                        </>
                    )}
                </Link>

                <button
                    onClick={() => setShowingNavigationDropdown(!showingMobileMenu)}
                    className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg focus:outline-none"
                >
                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path
                            className={!showingMobileMenu ? 'inline-flex' : 'hidden'}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                        <path
                            className={showingMobileMenu ? 'inline-flex' : 'hidden'}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            {/* 2. Desktop Left-Side Sidebar */}
            <aside className="hidden md:flex w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col justify-between shrink-0 p-6 z-10">
                <div className="space-y-8">
                    {/* Dynamic Logo & Branding */}
                    <div className="flex items-center gap-2">
                        {appLogo && !logoError ? (
                            <Link href="/" className="block">
                                <img 
                                    src={`/storage/${appLogo}`} 
                                    alt={appName} 
                                    onError={() => setLogoError(true)}
                                    className="max-h-12 w-auto object-contain" 
                                />
                            </Link>
                        ) : (
                            <Link href="/" className="flex items-center gap-2">
                                <svg className="h-7 w-auto fill-current text-emerald-500" viewBox="0 0 24 24">
                                    <path d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                                </svg>
                                <span className="font-extrabold tracking-wider text-md text-gray-900 dark:text-white uppercase">{appName}</span>
                            </Link>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
                        <Link href={route('dashboard')} className={getLinkClass(route().current('dashboard'))}>
                            {__('Dashboard Overview')}
                        </Link>
                        <Link href={route('deposits.index')} className={getLinkClass(route().current('deposits.index'))}>
                            {__('Deposit Funds')}
                        </Link>
                        <Link href={route('staking.index')} className={getLinkClass(route().current('staking.index'))}>
                            {__('DeFi Staking Pools')}
                        </Link>
                        <Link href={route('kyc.index')} className={getLinkClass(route().current('kyc.index'))}>
                            {__('Identity Verification (KYC)')}
                        </Link>
                        <Link href={route('p2p.index')} className={getLinkClass(route().current('p2p.index') || route().current('p2p.trade'))}>
                            P2P Market
                        </Link>
                        <Link href={route('ai.index')} className={getLinkClass(route().current('ai.index'))}>
                            AI Advisor
                        </Link>
                        <Link href={route('withdrawals.index')} className={getLinkClass(route().current('withdrawals.index'))}>
                            {__('Withdraw Funds')}
                        </Link>
                        <Link href={route('referrals.index')} className={getLinkClass(route().current('referrals.index'))}>
                            Affiliates
                        </Link>
                        <Link href={route('support.index')} className={getLinkClass(route().current('support.index') || route().current('support.show'))}>
                            Helpdesk
                        </Link>
                    </nav>
                </div>

                {/* Footer Section of Sidebar */}
                <div className="space-y-4 border-t border-gray-200 dark:border-gray-800 pt-4 shrink-0">
                    
                    {/* Multilingual Switcher */}
                    <div className="flex gap-2 justify-center pb-2">
                        <Link
                            href={route('lang.switch', 'en')}
                            className={`px-3 py-1 text-xs font-bold rounded ${
                                locale === 'en'
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                            EN
                        </Link>
                        <Link
                            href={route('lang.switch', 'es')}
                            className={`px-3 py-1 text-xs font-bold rounded ${
                                locale === 'es'
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                            ES
                        </Link>
                    </div>

                    {/* Administrative Dashboard Link */}
                    {user.is_admin === 1 && (
                        <Link 
                            href={route('admin.dashboard')}
                            className="w-full block text-center py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-xs font-bold transition uppercase tracking-wider"
                        >
                            Admin Command Panel
                        </Link>
                    )}

                    {/* Account Settings: SECURE UPWARD OPENING DROP-UP MENU */}
                    <div className="relative">
                        {dropupOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl z-30 py-1 font-semibold text-xs">
                                <Link 
                                    href={route('profile.edit')} 
                                    onClick={() => setDropupOpen(false)}
                                    className="block px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    Profile Settings
                                </Link>
                                <Link 
                                    href={route('logout')} 
                                    method="post" 
                                    as="button" 
                                    className="w-full text-left block px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-t border-gray-100 dark:border-gray-800/50"
                                >
                                    Log Out
                                </Link>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setDropupOpen(!dropupOpen)}
                            className="w-full inline-flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            <span className="truncate max-w-[130px]">{user.name || 'Account'}</span>
                            <svg className={`ms-2 h-4 w-4 transform transition-transform ${dropupOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 24" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Responsive Navigation Dropdown Drawer */}
            <div className={`${showingMobileMenu ? 'block' : 'hidden'} md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10 shrink-0`}>
                <div className="space-y-1 pb-3 pt-2">
                    <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                        {__('Dashboard Overview')}
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href={route('deposits.index')} active={route().current('deposits.index')}>
                        {__('Deposit Funds')}
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href={route('staking.index')} active={route().current('staking.index')}>
                        {__('DeFi Staking Pools')}
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href={route('kyc.index')} active={route().current('kyc.index')}>
                        {__('Identity Verification (KYC)')}
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href={route('p2p.index')} active={route().current('p2p.index')}>
                        P2P Market
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href={route('ai.index')} active={route().current('ai.index')}>
                        AI Advisor
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href={route('withdrawals.index')} active={route().current('withdrawals.index')}>
                        {__('Withdraw Funds')}
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href={route('referrals.index')} active={route().current('referrals.index')}>
                        Affiliates
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href={route('support.index')} active={route().current('support.index')}>
                        Helpdesk
                    </ResponsiveNavLink>
                </div>

                <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-800 flex justify-between items-center px-4">
                    <div>
                        <div className="text-base font-semibold text-gray-800 dark:text-gray-200">{user.name}</div>
                        <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    </div>
                    {user.is_admin === 1 && (
                        <Link href={route('admin.dashboard')} className="py-1 px-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded text-xs font-bold">
                            Admin Panel
                        </Link>
                    )}
                </div>
                <div className="mt-3 space-y-1 px-4 pb-4">
                    <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                    <ResponsiveNavLink method="post" href={route('logout')} as="button">
                        Log Out
                    </ResponsiveNavLink>
                </div>
            </div>

            {/* Right-Side Workspace Page Content Wrapper */}
            <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                {header && (
                    <header className="bg-white shadow dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )}

                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}