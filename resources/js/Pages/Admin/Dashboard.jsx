import { Head, useForm, router, Link, usePage } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect } from 'react';

export default function Dashboard({ stats, users, pendingKyc, pendingDeposits, pendingWithdrawals, stakingPools, settings, allStakes, cmsPages, transactions, allTickets }) {
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, reports, transactions, users, kyc, staking, cms, helpdesk, settings
    const [openDropdown, setOpenDropdown] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [simulatedReason, setSimulatedReason] = useState('');

    // CMS Page Editor selection state
    const [selectedCmsPage, setSelectedCmsPage] = useState(cmsPages[0] || null);

    // Active Helpdesk ticket in review
    const [selectedTicket, setSelectedTicket] = useState(null);
    const chatEndRef = useRef(null);

    // Brand settings
    const props = usePage().props;
    const appName = props.appName || 'MetaStake';
    const appLogo = props.appLogo || null;
    const [logoError, setLogoError] = useState(false);

    // Transaction Table Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    const toggleDropdown = (key) => {
        setOpenDropdown(openDropdown === key ? null : key);
    };

    // Auto-scroll admin ticket thread
    useEffect(() => {
        if (selectedTicket) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedTicket, allTickets]);

    // Staking Pool Creation Form
    const { data: poolData, setData: setPoolData, post: postPool, processing: poolProcessing, errors: poolErrors, reset: resetPool } = useForm({
        name: '',
        currency_code: 'USDT',
        apy: '',
        lock_period_days: '',
        min_stake: '',
        max_stake: '',
        capacity: '',
    });

    // Site Settings Form
    const { data: settingsData, setData: setSettingsData, post: postSettings, processing: settingsProcessing } = useForm({
        app_name: settings.app_name || 'MetaStake',
        seo_title: settings.seo_title || '',
        seo_description: settings.seo_description || '',
        seo_keywords: settings.seo_keywords || '',
        app_logo_file: null,
    });

    // CMS Editor Form
    const { data: cmsData, setData: setCmsData, post: postCmsUpdate, processing: cmsProcessing } = useForm({
        title: selectedCmsPage?.title || '',
        content: selectedCmsPage?.content || '',
    });

    // Admin Ticket Reply Form
    const { data: ticketReplyData, setData: setTicketReplyData, post: postTicketReply, processing: ticketReplyProcessing, reset: resetTicketReply } = useForm({
        message: '',
        close_ticket: false,
    });

    const selectCmsPage = (page) => {
        setSelectedCmsPage(page);
        setCmsData({ title: page.title, content: page.content });
    };

    // Real-time transaction filtering
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  t.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  t.amount.toString().includes(searchQuery);
            const matchesType = filterType === 'All' || t.type === filterType;
            const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [transactions, searchQuery, filterType, filterStatus]);

    const handleCreatePool = (e) => {
        e.preventDefault();
        postPool(route('admin.pools.store'), {
            onSuccess: () => {
                resetPool();
                setSuccessMessage('Staking Pool successfully created.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleDeletePool = (poolId) => {
        if (!confirm('Are you sure?')) return;
        router.delete(route('admin.pools.delete', poolId), {
            onSuccess: () => {
                setSuccessMessage('Staking Pool removed.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleUpdateSettings = (e) => {
        e.preventDefault();
        postSettings(route('admin.settings.update'), {
            onSuccess: () => {
                setSuccessMessage('System settings and SEO parameters updated.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleCmsUpdate = (e) => {
        e.preventDefault();
        postCmsUpdate(route('admin.cms.update', selectedCmsPage.id), {
            onSuccess: () => {
                setSuccessMessage('CMS Page content successfully updated.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleAdminTicketReply = (e) => {
        e.preventDefault();
        if (!ticketReplyData.message.trim()) return;

        postTicketReply(route('admin.tickets.reply', selectedTicket.id), {
            onSuccess: () => {
                resetTicketReply('message');
                setSuccessMessage('Official reply processed successfully.');
                const updatedTicket = allTickets.find(t => t.id === selectedTicket.id);
                if (updatedTicket) {
                    setSelectedTicket(updatedTicket);
                }
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleKycDecision = (kycId, decision) => {
        if (decision === 'rejected' && !simulatedReason.trim()) {
            alert('Please enter a rejection reason.');
            return;
        }
        router.post(route('kyc.decision', kycId), {
            decision,
            rejection_reason: decision === 'rejected' ? simulatedReason : null
        }, {
            onSuccess: () => {
                setSuccessMessage(`KYC request successfully ${decision.toUpperCase()}.`);
                setSimulatedReason('');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleDepositDecision = (depositId) => {
        router.post(route('deposits.approve', depositId), {}, {
            onSuccess: () => {
                setSuccessMessage('Deposit request approved.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleWithdrawalDecision = (withdrawalId, decision) => {
        if (decision === 'rejected' && !simulatedReason.trim()) {
            alert('Please enter a rejection reason.');
            return;
        }
        router.post(route('withdrawals.decision', withdrawalId), {
            decision,
            feedback: decision === 'rejected' ? simulatedReason : 'Approved and broadcast to the blockchain.'
        }, {
            onSuccess: () => {
                setSuccessMessage(`Withdrawal successfully ${decision.toUpperCase()}.`);
                setSimulatedReason('');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleToggleAdmin = (userId) => {
        router.post(route('admin.users.toggle-admin', userId), {}, {
            onSuccess: () => {
                setSuccessMessage('User role privilege toggled.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleForceCompleteStake = (stakeId) => {
        router.post(route('admin.stakes.force-complete', stakeId), {}, {
            onSuccess: () => {
                setSuccessMessage('Staking position force-completed.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleCancelStakeEarly = (stakeId) => {
        router.post(route('admin.stakes.cancel', stakeId), {}, {
            onSuccess: () => {
                setSuccessMessage('Staking position canceled early.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-50 text-slate-800 font-sans flex overflow-hidden">
            <Head title="Administrative Portal" />

            {/* Left Sidebar Layout */}
            <aside className="w-64 bg-[#1e293b] text-slate-300 flex flex-col justify-between shrink-0 z-10 select-none">
                <div className="p-6">
                    {/* Dynamic Brand Logo */}
                    <div className="flex items-center gap-2 mb-8">
                        {appLogo && !logoError ? (
                            <img 
                                src={`/storage/${appLogo}`} 
                                alt={appName} 
                                onError={() => setLogoError(true)}
                                className="max-h-8 w-auto object-contain" 
                            />
                        ) : (
                            <>
                                <svg className="h-6 w-auto fill-current text-emerald-500" viewBox="0 0 24 24">
                                    <path d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                                </svg>
                                <span className="font-extrabold tracking-wider text-sm text-white uppercase">{appName}</span>
                            </>
                        )}
                    </div>

                    <nav className="space-y-1 text-sm font-semibold">
                        <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left py-2 px-4 rounded-lg flex items-center gap-2 transition ${activeTab === 'dashboard' ? 'bg-[#334155] text-white' : 'hover:bg-[#334155]/50'}`}>
                            🏠 Dashboard
                        </button>
                        
                        <div>
                            <button onClick={() => toggleDropdown('users')} className="w-full text-left py-2 px-4 rounded-lg flex justify-between items-center hover:bg-[#334155]/50">
                                <span>👥 Users</span>
                                <span>{openDropdown === 'users' ? '▼' : '►'}</span>
                            </button>
                            {openDropdown === 'users' && (
                                <div className="pl-4 space-y-1 mt-1 bg-[#0f172a]/20 py-1 rounded">
                                    <button onClick={() => setActiveTab('users')} className="w-full text-left py-1.5 px-4 text-xs hover:text-white">All Users</button>
                                    <button onClick={() => setActiveTab('kyc')} className="w-full text-left py-1.5 px-4 text-xs hover:text-white">Pending KYC ({pendingKyc.length})</button>
                                </div>
                            )}
                        </div>

                        <div>
                            <button onClick={() => toggleDropdown('reports')} className="w-full text-left py-2 px-4 rounded-lg flex justify-between items-center hover:bg-[#334155]/50">
                                <span>📄 Reports</span>
                                <span>{openDropdown === 'reports' ? '▼' : '►'}</span>
                            </button>
                            {openDropdown === 'reports' && (
                                <div className="pl-4 space-y-1 mt-1 bg-[#0f172a]/20 py-1 rounded">
                                    <button onClick={() => setActiveTab('reports')} className="w-full text-left py-1.5 px-4 text-xs hover:text-white">Financial Report</button>
                                </div>
                            )}
                        </div>

                        <div>
                            <button onClick={() => toggleDropdown('staking')} className="w-full text-left py-2 px-4 rounded-lg flex justify-between items-center hover:bg-[#334155]/50">
                                <span>🔒 Staking</span>
                                <span>{openDropdown === 'staking' ? '▼' : '►'}</span>
                            </button>
                            {openDropdown === 'staking' && (
                                <div className="pl-4 space-y-1 mt-1 bg-[#0f172a]/20 py-1 rounded">
                                    <button onClick={() => setActiveTab('staking')} className="w-full text-left py-1.5 px-4 text-xs hover:text-white">Staking Pools</button>
                                </div>
                            )}
                        </div>

                        <div>
                            <button onClick={() => toggleDropdown('finance')} className="w-full text-left py-2 px-4 rounded-lg flex justify-between items-center hover:bg-[#334155]/50">
                                <span>💼 Finance</span>
                                <span>{openDropdown === 'finance' ? '▼' : '►'}</span>
                            </button>
                            {openDropdown === 'finance' && (
                                <div className="pl-4 space-y-1 mt-1 bg-[#0f172a]/20 py-1 rounded">
                                    <button onClick={() => setActiveTab('transactions')} className="w-full text-left py-1.5 px-4 text-xs hover:text-white">All Transactions</button>
                                </div>
                            )}
                        </div>

                        <button onClick={() => setActiveTab('helpdesk')} className={`w-full text-left py-2 px-4 rounded-lg flex items-center gap-2 transition ${activeTab === 'helpdesk' ? 'bg-[#334155] text-white' : 'hover:bg-[#334155]/50'}`}>
                            📞 Helpdesk Support
                        </button>
                        <button onClick={() => setActiveTab('cms')} className={`w-full text-left py-2 px-4 rounded-lg flex items-center gap-2 transition ${activeTab === 'cms' ? 'bg-[#334155] text-white' : 'hover:bg-[#334155]/50'}`}>
                            📝 CMS Page Editor
                        </button>
                        <button onClick={() => setActiveTab('settings')} className={`w-full text-left py-2 px-4 rounded-lg flex items-center gap-2 transition ${activeTab === 'settings' ? 'bg-[#334155] text-white' : 'hover:bg-[#334155]/50'}`}>
                            ⚙️ Settings & SEO
                        </button>
                    </nav>
                </div>

                <div className="p-6 border-t border-[#334155] space-y-3">
                    <Link href={route('dashboard')} className="block text-center py-1.5 px-4 bg-[#334155] hover:bg-[#334155]/80 rounded text-xs font-bold transition">
                        Back to Client App
                    </Link>
                </div>
            </aside>

            {/* Main Panel Content Area */}
            <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc] overflow-y-auto">
                <header className="h-16 border-b border-slate-200 bg-white px-8 flex justify-between items-center shrink-0">
                    <div className="text-xs text-slate-400 font-semibold flex items-center gap-2 select-none">
                        <span>Admin</span>
                        <span>&gt;</span>
                        <span className="capitalize">{activeTab.replace('.', ' & ')}</span>
                    </div>
                </header>

                <div className="p-8 space-y-6">
                    {successMessage && (
                        <div className="p-4 text-sm text-green-800 rounded-lg bg-green-50 font-medium">
                            {successMessage}
                        </div>
                    )}

                    {/* Tab Panel 1: Dashboard Overview */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <div className="border-b pb-2">
                                <h2 className="text-xl font-black text-slate-900">Dashboard Overview</h2>
                                <p className="text-xs text-slate-400 font-medium">Monitor your platform's performance and key metrics</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                                <div className="bg-white border border-slate-200 p-6 rounded-xl flex justify-between items-center">
                                    <div>
                                        <span className="block text-xs text-slate-400 font-semibold">Total Users</span>
                                        <span className="text-2xl font-black text-slate-900">{stats.total_users}</span>
                                    </div>
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full">👤</div>
                                </div>
                                <div className="bg-white border border-slate-200 p-6 rounded-xl flex justify-between items-center">
                                    <div>
                                        <span className="block text-xs text-slate-400 font-semibold">Total Balance</span>
                                        <span className="text-2xl font-black text-slate-900">${stats.total_balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="p-3 bg-green-50 text-green-600 rounded-full">💵</div>
                                </div>
                                <div className="bg-white border border-slate-200 p-6 rounded-xl flex justify-between items-center">
                                    <div>
                                        <span className="block text-xs text-slate-400 font-semibold">Active Investments</span>
                                        <span className="text-2xl font-black text-slate-900">{stats.active_investments}</span>
                                    </div>
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">📈</div>
                                </div>
                                <div className="bg-white border border-slate-200 p-6 rounded-xl flex justify-between items-center">
                                    <div>
                                        <span className="block text-xs text-slate-400 font-semibold">Pending Requests</span>
                                        <span className="text-2xl font-black text-slate-900">{pendingDeposits.length + pendingWithdrawals.length}</span>
                                    </div>
                                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">⏱️</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                                    <h4 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b">User Statistics</h4>
                                    <div className="space-y-3 text-xs text-slate-600 font-medium">
                                        <div className="flex justify-between"><span>Total Users:</span><span className="font-bold text-slate-900">{stats.total_users}</span></div>
                                        <div className="flex justify-between"><span>Active Users:</span><span className="font-bold text-slate-900">{stats.active_users}</span></div>
                                        <div className="flex justify-between"><span>Suspended:</span><span className="font-bold text-slate-900">{stats.suspended_users}</span></div>
                                        <div className="flex justify-between"><span>Pending KYC:</span><span className="font-bold text-yellow-600">{stats.pending_kyc_count}</span></div>
                                    </div>
                                </div>
                                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                                    <h4 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b">Financial Overview</h4>
                                    <div className="space-y-3 text-xs text-slate-600 font-medium">
                                        <div className="flex justify-between"><span>Total Deposits:</span><span className="font-bold text-slate-900">${stats.total_deposits.toLocaleString()}</span></div>
                                        <div className="flex justify-between"><span>Total Withdrawals:</span><span className="font-bold text-slate-900">${stats.total_withdrawals.toLocaleString()}</span></div>
                                        <div className="flex justify-between"><span>Total Earnings:</span><span className="font-bold text-indigo-600">${stats.total_earnings.toLocaleString()}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Panel 2: Financial Reports */}
                    {activeTab === 'reports' && (
                        <div className="space-y-6">
                            <div className="border-b pb-2">
                                <h2 className="text-xl font-black text-slate-900">Financial Report</h2>
                                <p className="text-xs text-slate-400 font-medium">Comprehensive financial overview and analytics</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                                    <span className="block text-xs text-slate-400 font-semibold mb-1">Total Deposits</span>
                                    <span className="text-2xl font-black text-slate-900">${stats.total_deposits.toLocaleString()}</span>
                                </div>
                                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                                    <span className="block text-xs text-slate-400 font-semibold mb-1">Total Withdrawals</span>
                                    <span className="text-2xl font-black text-slate-900">${stats.total_withdrawals.toLocaleString()}</span>
                                </div>
                                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                                    <span className="block text-xs text-slate-400 font-semibold mb-1">Total Investments</span>
                                    <span className="text-2xl font-black text-slate-900">${stats.total_invested.toLocaleString()}</span>
                                </div>
                                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                                    <span className="block text-xs text-slate-400 font-semibold mb-1">Net Balance</span>
                                    <span className="text-2xl font-black text-green-600">+${(stats.total_deposits - stats.total_withdrawals).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="bg-white border border-slate-200 p-6 rounded-xl lg:col-span-2">
                                    <h4 className="text-sm font-bold text-slate-900 mb-4">Daily Transactions</h4>
                                    <svg viewBox="0 0 500 150" className="w-full h-40">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,150 L50,120 L100,130 L150,90 L200,80 L250,110 L300,60 L350,70 L400,30 L450,40 L500,20 L500,150 Z" fill="url(#chartGradient)" />
                                        <path d="M0,150 L50,120 L100,130 L150,90 L200,80 L250,110 L300,60 L350,70 L400,30 L450,40 L500,20" fill="none" stroke="#10b981" strokeWidth="3" />
                                    </svg>
                                </div>
                                <div className="bg-white border border-slate-200 p-6 rounded-xl lg:col-span-1 flex flex-col justify-between">
                                    <h4 className="text-sm font-bold text-slate-900">Revenue vs Expenses</h4>
                                    <div className="relative flex justify-center py-4">
                                        <svg width="120" height="120" viewBox="0 0 36 36">
                                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="80 20" strokeDashoffset="25" />
                                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="45" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col justify-center items-center">
                                            <span className="text-xs text-slate-400 font-bold uppercase">Surplus</span>
                                            <span className="text-md font-black text-slate-900">80%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Panel 3: Transaction Management */}
                    {activeTab === 'transactions' && (
                        <div className="space-y-6">
                            <div className="border-b pb-2">
                                <h2 className="text-xl font-black text-slate-900">Transaction Management</h2>
                                <p className="text-xs text-slate-400 font-medium">Monitor and manage all financial transactions</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                                    <span className="block text-xs text-slate-400 font-semibold mb-1">Total Transactions</span>
                                    <span className="text-2xl font-black text-slate-900">{filteredTransactions.length}</span>
                                </div>
                                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                                    <span className="block text-xs text-slate-400 font-semibold mb-1">Total Volume</span>
                                    <span className="text-2xl font-black text-slate-900">${filteredTransactions.reduce((acc, t) => acc + t.amount, 0).toLocaleString()}</span>
                                </div>
                                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                                    <span className="block text-xs text-slate-400 font-semibold mb-1">This Month</span>
                                    <span className="text-2xl font-black text-slate-900">{filteredTransactions.length}</span>
                                </div>
                                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                                    <span className="block text-xs text-slate-400 font-semibold mb-1">Completed</span>
                                    <span className="text-2xl font-black text-slate-900">{filteredTransactions.filter(t => t.status === 'approved').length}</span>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <input
                                    type="text"
                                    placeholder="Search by ID, amount, or user..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="border border-slate-200 rounded-lg px-4 py-2 text-xs w-full sm:w-72 focus:outline-none bg-white"
                                />
                                <div className="flex gap-4">
                                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-slate-200 rounded-lg px-4 py-2 text-xs focus:outline-none bg-white">
                                        <option value="All">All Types</option>
                                        <option value="Credit">Credit (Deposits)</option>
                                        <option value="Debit">Debit (Withdrawals)</option>
                                    </select>
                                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-slate-200 rounded-lg px-4 py-2 text-xs focus:outline-none bg-white">
                                        <option value="All">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-slate-600">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-xs uppercase text-slate-400 bg-slate-50/50">
                                                <th className="py-3 px-4">Transaction ID</th>
                                                <th className="py-3 px-4">User</th>
                                                <th className="py-3 px-4">Type</th>
                                                <th className="py-3 px-4 text-right">Amount</th>
                                                <th className="py-3 px-4 text-right">Fee</th>
                                                <th className="py-3 px-4">Status</th>
                                                <th className="py-3 px-4 text-right">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {filteredTransactions.map((t, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/30">
                                                    <td className="py-4 px-4 font-mono text-xs text-slate-400">{t.id}</td>
                                                    <td className="py-4 px-4">
                                                        <div className="text-slate-900 font-bold">{t.user?.name}</div>
                                                        <div className="text-xs text-slate-400 font-normal">{t.user?.email}</div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                                                            t.type === 'Credit' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                        }`}>
                                                            {t.type === 'Credit' ? '+ Credit' : '- Debit'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right font-black text-slate-900">
                                                        {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="py-4 px-4 text-right text-slate-400">${t.fee.toFixed(2)}</td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                            t.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                            t.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {t.status === 'approved' ? 'Completed' : t.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right text-xs text-slate-400">
                                                        {new Date(t.created_at).toLocaleDateString()} {new Date(t.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Panel 4: Helpdesk Management (Official Agent Room) */}
                    {activeTab === 'helpdesk' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-white border border-slate-200 p-6 rounded-xl col-span-1 space-y-4 max-h-[600px] overflow-y-auto">
                                <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Active Helpdesk Tickets</h3>
                                <div className="space-y-3">
                                    {allTickets.map(t => (
                                        <div
                                            key={t.id}
                                            onClick={() => setSelectedTicket(t)}
                                            className={`p-4 border rounded-xl cursor-pointer transition ${
                                                selectedTicket?.id === t.id
                                                    ? 'border-emerald-600 bg-emerald-50/50'
                                                    : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-mono text-xs text-indigo-500">#T-{t.id}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    t.status === 'closed' ? 'bg-green-100 text-green-800' :
                                                    t.status === 'replied' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {t.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="font-bold text-slate-900 text-sm">{t.subject}</div>
                                            <div className="text-[10px] text-slate-400 mt-1">User: {t.user?.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedTicket ? (
                                <div className="bg-white border border-slate-200 p-6 rounded-xl col-span-2 flex flex-col h-[600px] justify-between">
                                    <div>
                                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                                            <h4 className="font-bold text-slate-900 text-sm">Thread: {selectedTicket.subject}</h4>
                                            <span className="text-xs text-slate-400">Priority: {selectedTicket.priority.toUpperCase()}</span>
                                        </div>

                                        <div className="overflow-y-auto h-[320px] space-y-3 p-4 bg-slate-50 rounded-xl border mb-4 text-xs font-semibold">
                                            {selectedTicket.messages?.map((msg) => {
                                                const isAgent = msg.is_admin;
                                                return (
                                                    <div key={msg.id} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                                                        <span className="text-[9px] text-gray-400 mb-0.5 px-1">
                                                            {isAgent ? '💬 Helpdesk Support Agent' : `👤 ${selectedTicket.user?.name}`}
                                                        </span>
                                                        <div className={`p-2.5 rounded-lg max-w-[80%] ${
                                                            isAgent 
                                                                ? 'bg-white text-gray-900 border'
                                                                : 'bg-indigo-600 text-white' 
                                                        }`}>
                                                            {msg.message}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={chatEndRef} />
                                        </div>
                                    </div>

                                    <form onSubmit={handleAdminTicketReply} className="space-y-4 border-t pt-4">
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Official Response Message</label>
                                            <textarea
                                                rows="3"
                                                placeholder="Enter helpdesk resolution details here..."
                                                value={ticketReplyData.message}
                                                onChange={e => setTicketReplyData('message', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="close_ticket"
                                                    checked={ticketReplyData.close_ticket}
                                                    onChange={e => setTicketReplyData('close_ticket', e.target.checked)}
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                                />
                                                <label htmlFor="close_ticket" className="ms-2 text-xs text-slate-500 font-semibold">
                                                    Mark ticket as RESOLVED / CLOSED
                                                </label>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={ticketReplyProcessing}
                                                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                                            >
                                                Send Official Response
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-xl col-span-2 flex flex-col justify-center items-center py-20">
                                    <div className="text-sm font-semibold text-slate-400">Select a support ticket from the sidebar to begin active mediation.</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab Panel 5: Database User list */}
                    {activeTab === 'users' && (
                        <div className="bg-white border border-slate-200 p-6 rounded-xl">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Database User Ledger</h2>
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead>
                                    <tr className="border-b text-xs uppercase text-slate-400">
                                        <th className="py-3 px-4">User</th>
                                        <th className="py-3 px-4">Wallet Address</th>
                                        <th className="py-3 px-4">KYC Status</th>
                                        <th className="py-3 px-4">Role</th>
                                        <th className="py-3 px-4 text-center">Toggle Privilege</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50">
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-slate-950">{user.name}</div>
                                                <div className="text-xs text-slate-400">{user.email}</div>
                                            </td>
                                            <td className="py-4 px-4 font-mono text-xs text-slate-400">{user.wallet_address || 'Traditional Signup'}</td>
                                            <td className="py-4 px-4 capitalize text-xs">{user.kyc_status}</td>
                                            <td className="py-4 px-4 text-xs font-bold">{user.is_admin ? 'ADMIN' : 'USER'}</td>
                                            <td className="py-4 px-4 text-center">
                                                <button onClick={() => handleToggleAdmin(user.id)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs">
                                                    Toggle Admin Role
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab Panel 6: KYC Requests Queue */}
                    {activeTab === 'kyc' && (
                        <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-6">
                            <h2 className="text-xl font-bold text-slate-900">Pending KYC Audit Queue ({pendingKyc.length})</h2>
                            {pendingKyc.length === 0 ? (
                                <div className="text-center py-6 text-slate-400">No pending KYC applications.</div>
                            ) : (
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead>
                                        <tr className="border-b text-xs uppercase text-slate-400">
                                            <th className="py-3 px-4">User</th>
                                            <th className="py-3 px-4">Doc / ID No</th>
                                            <th className="py-3 px-4">Proofs</th>
                                            <th className="py-3 px-4 text-center">Decision</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pendingKyc.map((kyc) => (
                                            <tr key={kyc.id}>
                                                <td className="py-4 px-4">
                                                    <span className="font-bold text-slate-950">{kyc.user?.name}</span>
                                                    <span className="block text-xs text-slate-400">{kyc.user?.email}</span>
                                                </td>
                                                <td className="py-4 px-4 font-mono text-xs">
                                                    <span className="capitalize">{kyc.document_type.replace('_', ' ')}</span>
                                                    <span className="block text-slate-400">{kyc.document_number}</span>
                                                </td>
                                                <td className="py-4 px-4 space-x-3 text-xs">
                                                    <a href={`/storage/${kyc.front_image}`} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Front ID</a>
                                                    {kyc.back_image && <a href={`/storage/${kyc.back_image}`} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Back ID</a>}
                                                    {kyc.selfie_image && <a href={`/storage/${kyc.selfie_image}`} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Selfie</a>}
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        <input type="text" placeholder="Rejection notes" value={simulatedReason} onChange={e => setSimulatedReason(e.target.value)} className="py-1 px-2 border rounded bg-white text-xs w-32" />
                                                        <button onClick={() => handleKycDecision(kyc.id, 'approved')} className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">Approve</button>
                                                        <button onClick={() => handleKycDecision(kyc.id, 'rejected')} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">Reject</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Tab Panel 7: Staking Pools Config */}
                    {activeTab === 'staking' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="bg-white border border-slate-200 p-6 rounded-xl col-span-1 space-y-4">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Deploy New Staking Pool</h3>
                                    <form onSubmit={handleCreatePool} className="space-y-4 text-xs font-semibold">
                                        <div>
                                            <label className="block text-slate-400 mb-1">Pool Name</label>
                                            <input type="text" value={poolData.name} onChange={e => setPoolData('name', e.target.value)} className="w-full border border-slate-200 rounded p-2 focus:outline-none" required />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 mb-1">Asset Currency</label>
                                            <select value={poolData.currency_code} onChange={e => setPoolData('currency_code', e.target.value)} className="w-full border border-slate-200 rounded p-2 focus:outline-none bg-white">
                                                <option value="USDT">USDT</option>
                                                <option value="ETH">ETH</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-slate-400 mb-1">APY (%)</label>
                                                <input type="number" step="any" value={poolData.apy} onChange={e => setPoolData('apy', e.target.value)} className="w-full border border-slate-200 rounded p-2" required />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 mb-1">Lock Duration (Days)</label>
                                                <input type="number" value={poolData.lock_period_days} onChange={e => setPoolData('lock_period_days', e.target.value)} className="w-full border border-slate-200 rounded p-2" required />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-slate-400 mb-1">Min Stake</label>
                                                <input type="number" step="any" value={poolData.min_stake} onChange={e => setPoolData('min_stake', e.target.value)} className="w-full border border-slate-200 rounded p-2" required />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 mb-1">Max Stake</label>
                                                <input type="number" step="any" value={poolData.max_stake} onChange={e => setPoolData('max_stake', e.target.value)} className="w-full border border-slate-200 rounded p-2" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 mb-1">Total Pool Capacity</label>
                                            <input type="number" step="any" value={poolData.capacity} onChange={e => setPoolData('capacity', e.target.value)} className="w-full border border-slate-200 rounded p-2" required />
                                        </div>
                                        <button type="submit" disabled={poolProcessing} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded">Deploy Pool</button>
                                    </form>
                                </div>

                                <div className="bg-white border border-slate-200 p-6 rounded-xl col-span-2">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Active Staking Plans</h3>
                                    <table className="w-full text-left text-sm text-slate-600">
                                        <thead>
                                            <tr className="border-b text-xs uppercase text-slate-400">
                                                <th className="py-2">Pool Name</th>
                                                <th className="py-2">Currency</th>
                                                <th className="py-2 text-right">APY</th>
                                                <th className="py-2 text-right">Duration</th>
                                                <th className="py-2 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stakingPools.map((pool) => (
                                                <tr key={pool.id} className="border-b border-slate-100">
                                                    <td className="py-3 font-bold text-slate-900">{pool.name}</td>
                                                    <td className="py-3">{pool.currency_code}</td>
                                                    <td className="py-3 text-right font-black text-emerald-500">{parseFloat(pool.apy)}%</td>
                                                    <td className="py-3 text-right">{pool.lock_period_days} Days</td>
                                                    <td className="py-3 text-center">
                                                        <button onClick={() => handleDeletePool(pool.id)} className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs">Remove</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 p-6 rounded-xl">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">User Staking Positions</h3>
                                {allStakes.length === 0 ? (
                                    <div className="text-center py-6 text-slate-400">No active user staking positions.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-600">
                                            <thead>
                                                <tr className="border-b text-xs uppercase text-slate-400">
                                                    <th className="py-2 px-4">User</th>
                                                    <th className="py-2 px-4">Pool Name</th>
                                                    <th className="py-2 px-4 text-right">Staked Capital</th>
                                                    <th className="py-2 px-4">Ends At</th>
                                                    <th className="py-2 px-4">Status</th>
                                                    <th className="py-2 px-4 text-center">Admin Controls</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allStakes.map((stake) => (
                                                    <tr key={stake.id} className="border-b">
                                                        <td className="py-3 px-4 font-bold text-slate-900">{stake.user?.name}</td>
                                                        <td className="py-3 px-4">{stake.pool?.name}</td>
                                                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                                                            {parseFloat(stake.amount)} {stake.pool?.currency_code}
                                                        </td>
                                                        <td className="py-3 px-4 text-xs">{new Date(stake.ends_at).toLocaleDateString()}</td>
                                                        <td className="py-3 px-4 text-xs uppercase font-bold">{stake.status}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {stake.status === 'active' ? (
                                                                <div className="flex gap-2 justify-center">
                                                                    <button onClick={() => handleForceCompleteStake(stake.id)} className="px-2 py-0.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold">Force Complete</button>
                                                                    <button onClick={() => handleCancelStakeEarly(stake.id)} className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold">Cancel Early</button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-slate-400">Settled</span>
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
                    )}

                    {activeTab === 'cms' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-white border border-slate-200 p-6 rounded-xl col-span-1 space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Select Page</h3>
                                <div className="space-y-2">
                                    {cmsPages.map(page => (
                                        <div
                                            key={page.id}
                                            onClick={() => selectCmsPage(page)}
                                            className={`p-4 border rounded-xl cursor-pointer transition ${
                                                selectedCmsPage?.id === page.id
                                                    ? 'border-emerald-600 bg-emerald-50'
                                                    : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="font-bold text-slate-900 text-sm">{page.title}</div>
                                            <div className="text-xs text-slate-400 mt-1">Slug: /page/{page.slug}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedCmsPage && (
                                <div className="bg-white border border-slate-200 p-6 rounded-xl col-span-2">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6 border-b pb-2">
                                        Edit: <span className="text-emerald-600">{selectedCmsPage.title}</span>
                                    </h3>
                                    <form onSubmit={handleCmsUpdate} className="space-y-4 text-xs font-semibold">
                                        <div>
                                            <label className="block text-slate-400 mb-1">Page Title</label>
                                            <input
                                                type="text"
                                                value={cmsData.title}
                                                onChange={e => setCmsData('title', e.target.value)}
                                                className="w-full border rounded p-2.5 text-slate-900 text-sm font-semibold"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 mb-1">Page HTML/Text Content</label>
                                            <textarea
                                                rows="12"
                                                value={cmsData.content}
                                                onChange={e => setCmsData('content', e.target.value)}
                                                className="w-full border rounded p-2.5 text-slate-900 text-sm font-mono leading-relaxed"
                                                required
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={cmsProcessing}
                                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded uppercase tracking-wider"
                                        >
                                            {cmsProcessing ? 'Saving Page...' : 'Save CMS Content'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-xl mx-auto space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Global Settings & SEO Editor</h2>
                            <form onSubmit={handleUpdateSettings} className="space-y-4 text-xs font-semibold">
                                <div>
                                    <label className="block text-slate-400 mb-1">Application Name</label>
                                    <input type="text" value={settingsData.app_name} onChange={e => setSettingsData('app_name', e.target.value)} className="w-full border border-slate-200 rounded p-2.5" required />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">S.E.O. Title Tag</label>
                                    <input type="text" value={settingsData.seo_title} onChange={e => setSettingsData('seo_title', e.target.value)} className="w-full border border-slate-200 rounded p-2.5" required />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">S.E.O. Meta Description</label>
                                    <textarea rows="3" value={settingsData.seo_description} onChange={e => setSettingsData('seo_description', e.target.value)} className="w-full border border-slate-200 rounded p-2.5" required></textarea>
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">S.E.O. Keywords</label>
                                    <input type="text" value={settingsData.seo_keywords} onChange={e => setSettingsData('seo_keywords', e.target.value)} className="w-full border border-slate-200 rounded p-2.5" required />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1">Update Brand Logo (Image file)</label>
                                    <input type="file" accept="image/*" onChange={e => setSettingsData('app_logo_file', e.target.files[0])} className="w-full border border-slate-200 rounded p-2 bg-white" />
                                    {settings.app_logo && (
                                        <div className="mt-2 text-slate-400">
                                            Active Logo: <a href={`/storage/${settings.app_logo}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">View Logo File</a>
                                        </div>
                                    )}
                                </div>

                                <button type="submit" disabled={settingsProcessing} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-sm tracking-wider uppercase">Save Settings</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}