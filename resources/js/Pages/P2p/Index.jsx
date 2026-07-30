import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ offers, userOffers, wallets, activeTrades }) {
    const [activeTab, setActiveTab] = useState('browse'); // browse, my-offers, create
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [tradeAmount, setTradeAmount] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        type: 'sell',
        currency_code: 'USDT',
        amount: '',
        price_per_unit: '',
        payment_method: 'PayPal',
    });

    const handleCreateOffer = (e) => {
        e.preventDefault();
        post(route('p2p.offers.store'), {
            onSuccess: () => {
                reset();
                setSuccessMessage('Your offer has been published to the marketplace.');
                setActiveTab('my-offers');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    const handleInitiateTrade = (e) => {
        e.preventDefault();
        if (!selectedOffer || !tradeAmount) return;

        router.post(route('p2p.trades.initiate'), {
            p2p_offer_id: selectedOffer.id,
            amount: tradeAmount
        }, {
            onSuccess: () => {
                setSelectedOffer(null);
                setTradeAmount('');
                setSuccessMessage('Trade successfully initialized. Escrow balance locked.');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    P2P Trading Marketplace
                </h2>
            }
        >
            <Head title="P2P Trading" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {successMessage && (
                        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 font-medium">
                            {successMessage}
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={`py-3 px-6 text-sm font-semibold transition ${
                                activeTab === 'browse'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Browse Listings
                        </button>
                        <button
                            onClick={() => setActiveTab('my-offers')}
                            className={`py-3 px-6 text-sm font-semibold transition ${
                                activeTab === 'my-offers'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            My Listings
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`py-3 px-6 text-sm font-semibold transition ${
                                activeTab === 'create'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Publish New Offer
                        </button>
                    </div>

                    {/* Tab Content A: Browse Marketplace */}
                    {activeTab === 'browse' && (
                        <div className="space-y-6">
                            
                            {/* Selected Offer Initiation Modal/Widget */}
                            {selectedOffer && (
                                <div className="p-6 bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg border border-indigo-200 dark:border-indigo-950">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-md font-bold text-gray-900 dark:text-gray-100">
                                            Initiate Trade against: <span className="text-indigo-600 dark:text-indigo-400">{selectedOffer.user?.name}'s</span> Offer
                                        </h4>
                                        <button 
                                            onClick={() => setSelectedOffer(null)}
                                            className="text-xs text-gray-400 hover:text-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    <form onSubmit={handleInitiateTrade} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                        <div>
                                            <span className="block text-xs uppercase font-semibold text-gray-400 mb-1">Exchange Price</span>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                1.00 {selectedOffer.currency_code} = {parseFloat(selectedOffer.price_per_unit).toFixed(2)} USD
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">
                                                Trade Amount ({selectedOffer.currency_code})
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                max={selectedOffer.amount}
                                                placeholder={`Max: ${parseFloat(selectedOffer.amount)}`}
                                                value={tradeAmount}
                                                onChange={e => setTradeAmount(e.target.value)}
                                                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-955 dark:text-gray-100 focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <button
                                                type="submit"
                                                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition"
                                            >
                                                Lock Escrow & Open Trade
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Active Offers Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {offers.length === 0 ? (
                                    <div className="col-span-full text-center py-6 text-sm text-gray-500 bg-white dark:bg-gray-800 p-6 rounded-lg">
                                        No active buy/sell offers on the board.
                                    </div>
                                ) : (
                                    offers.map((offer) => (
                                        <div key={offer.id} className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className={`text-xs uppercase font-bold px-2 py-1 rounded ${
                                                        offer.type === 'sell' 
                                                            ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' 
                                                            : 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400'
                                                    }`}>
                                                        {offer.type.toUpperCase()}ING
                                                    </span>
                                                    <span className="text-xs text-gray-400">Trader: {offer.user?.name}</span>
                                                </div>
                                                <h4 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-1">
                                                    {parseFloat(offer.amount).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 8
                                                    })} {offer.currency_code}
                                                </h4>
                                                <div className="text-sm text-gray-500 mb-4">
                                                    Rate: <span className="font-semibold text-gray-900 dark:text-gray-100">${parseFloat(offer.price_per_unit).toFixed(2)} USD</span>
                                                </div>
                                            </div>
                                            <div className="border-t pt-4 border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                                <span className="text-xs text-gray-400">Via: {offer.payment_method}</span>
                                                <button
                                                    onClick={() => setSelectedOffer(offer)}
                                                    className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded text-xs transition"
                                                >
                                                    Trade
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab Content B: My Listings */}
                    {activeTab === 'my-offers' && (
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                                My Published Listings
                            </h3>
                            {userOffers.length === 0 ? (
                                <div className="text-center py-6 text-sm text-gray-500">
                                    You have not published any P2P listings yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-400">
                                                <th className="py-3 px-4">Type</th>
                                                <th className="py-3 px-4 text-right">Available Amount</th>
                                                <th className="py-3 px-4 text-right">Price per Unit</th>
                                                <th className="py-3 px-4">Method</th>
                                                <th className="py-3 px-4 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {userOffers.map((offer) => (
                                                <tr key={offer.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                            offer.type === 'sell' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                                        }`}>
                                                            {offer.type.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right font-bold text-gray-950 dark:text-gray-100 whitespace-nowrap">
                                                        {parseFloat(offer.amount)} {offer.currency_code}
                                                    </td>
                                                    <td className="py-4 px-4 text-right font-semibold whitespace-nowrap">
                                                        ${parseFloat(offer.price_per_unit).toFixed(2)} USD
                                                    </td>
                                                    <td className="py-4 px-4">{offer.payment_method}</td>
                                                    <td className="py-4 px-4 text-center whitespace-nowrap">
                                                        <span className="text-xs uppercase font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                                                            {offer.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab Content C: Publish New Offer */}
                    {activeTab === 'create' && (
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 mb-6">
                                Publish New Trade Offer
                            </h3>
                            <form onSubmit={handleCreateOffer} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {/* Type Selector */}
                                    <div>
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Trade Direction</label>
                                        <select
                                            value={data.type}
                                            onChange={e => setData('type', e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-955 dark:text-gray-100 focus:outline-none"
                                        >
                                            <option value="sell">I want to Sell Crypto</option>
                                            <option value="buy">I want to Buy Crypto</option>
                                        </select>
                                    </div>

                                    {/* Currency */}
                                    <div>
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Currency</label>
                                        <select
                                            value={data.currency_code}
                                            onChange={e => setData('currency_code', e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-955 dark:text-gray-100 focus:outline-none"
                                        >
                                            <option value="USDT">USDT</option>
                                            <option value="ETH">ETH</option>
                                        </select>
                                    </div>

                                    {/* Available Balance */}
                                    <div>
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Available Ledger Balance</label>
                                        <div className="w-full bg-gray-100 dark:bg-gray-900 border border-transparent rounded-lg py-2 px-3 text-sm font-bold text-gray-900 dark:text-gray-100">
                                            {(parseFloat(wallets.find(w => w.currency_code === data.currency_code)?.balance || 0)).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 8
                                            })} {data.currency_code}
                                        </div>
                                    </div>

                                    {/* Total Amount to Trade */}
                                    <div>
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Total Quantity</label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="0.00"
                                            value={data.amount}
                                            onChange={e => setData('amount', e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-955 dark:text-gray-100 focus:outline-none"
                                            required
                                        />
                                    </div>

                                    {/* Price Per Unit */}
                                    <div>
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Exchange Rate (Price per 1 unit in USD)</label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="e.g., 1.00"
                                            value={data.price_per_unit}
                                            onChange={e => setData('price_per_unit', e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-955 dark:text-gray-100 focus:outline-none"
                                            required
                                        />
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-xs uppercase font-semibold text-gray-400 mb-1">Payment Method</label>
                                        <input
                                            type="text"
                                            placeholder="PayPal, Bank Transfer, Revolut"
                                            value={data.payment_method}
                                            onChange={e => setData('payment_method', e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-955 dark:text-gray-100 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition"
                                    >
                                        {processing ? 'Publishing...' : 'Publish Listing'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Active Trades Panel (Exits across all tabs) */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                            My Active Trade Orders
                        </h3>

                        {activeTrades.length === 0 ? (
                            <div className="text-center py-6 text-sm text-gray-500">
                                No active trading positions open.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-400">
                                            <th className="py-3 px-4">Trade ID</th>
                                            <th className="py-3 px-4">My Role</th>
                                            <th className="py-3 px-4">Counterparty</th>
                                            <th className="py-3 px-4 text-right">Quantity</th>
                                            <th className="py-3 px-4 text-right">Total Price</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {activeTrades.map((trade) => {
                                            const isBuyer = trade.buyer_id === wallets[0]?.user_id; // Simple role finder
                                            return (
                                                <tr key={trade.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                                                    <td className="py-4 px-4 font-mono text-xs text-indigo-600">
                                                        #{trade.id}
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                            isBuyer 
                                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' 
                                                                : 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400'
                                                        }`}>
                                                            {isBuyer ? 'BUYER' : 'SELLER'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        {isBuyer ? trade.seller?.name : trade.buyer?.name}
                                                    </td>
                                                    <td className="py-4 px-4 text-right font-bold text-gray-950 dark:text-gray-100 whitespace-nowrap">
                                                        {parseFloat(trade.amount)} {trade.offer?.currency_code}
                                                    </td>
                                                    <td className="py-4 px-4 text-right font-bold whitespace-nowrap">
                                                        ${parseFloat(trade.total_price).toFixed(2)} USD
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                            trade.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400' :
                                                            trade.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-950/30 dark:text-gray-400' :
                                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400'
                                                        }`}>
                                                            {trade.status.toUpperCase().replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-center whitespace-nowrap">
                                                        <Link
                                                            href={route('p2p.trade', trade.id)}
                                                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold transition"
                                                        >
                                                            Enter Trade Room
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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