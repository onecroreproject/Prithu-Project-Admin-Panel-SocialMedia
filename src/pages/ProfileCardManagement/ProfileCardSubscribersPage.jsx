import React, { useState, useEffect } from 'react';
import {
    Crown, Users, DollarSign, Search, RefreshCw, Calendar,
    CheckCircle2, XCircle, Clock, ExternalLink, ShieldCheck, Filter
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { getProfileCardSubscribers } from '../../Services/profileCardAdminService';
import GrantSubscriptionModal from './GrantSubscriptionModal';

export default function ProfileCardSubscribersPage() {
    const [subscribers, setSubscribers] = useState([]);
    const [stats, setStats] = useState({ totalSubscribers: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);

    // Filters & Pagination
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Modal
    const [selectedCard, setSelectedCard] = useState(null);
    const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);

    useEffect(() => {
        fetchSubscribers();
    }, [page, search, statusFilter]);

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            const res = await getProfileCardSubscribers({
                page,
                limit,
                search: search.trim(),
                status: statusFilter
            });
            if (res.success) {
                setSubscribers(res.data || []);
                setStats(res.stats || { totalSubscribers: 0, totalRevenue: 0 });
                setTotalPages(res.pagination?.pages || 1);
                setTotalCount(res.pagination?.total || 0);
            }
        } catch (err) {
            console.error('Error fetching subscribers:', err);
            toast.error('Failed to load subscribers list');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const isSubActive = (expiresAt) => {
        if (!expiresAt) return true;
        return new Date(expiresAt) > new Date();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
                        <Crown className="w-7 h-7 text-amber-500" />
                        Profile Card Paid Subscribers & Revenue
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Track all users who paid ₹50 for the Profile Card Pro Pass and manage their access validity.
                    </p>
                </div>
                <button
                    onClick={fetchSubscribers}
                    className="self-start md:self-auto px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex items-center gap-2 shadow-sm"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Paid Subscribers</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                            {stats.totalSubscribers.toLocaleString()}
                        </h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Revenue Generated</p>
                        <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                            ₹{stats.totalRevenue.toLocaleString()}
                        </h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Crown className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pass Unit Price</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                            ₹50 / Year
                        </h3>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search subscriber, business, phone..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none"
                    >
                        <option value="all">All Subscribers</option>
                        <option value="active">Active Access Only</option>
                        <option value="expired">Expired Access Only</option>
                    </select>
                </div>
            </div>

            {/* Subscribers Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50/75 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="py-3.5 px-4">Subscriber User</th>
                                <th className="py-3.5 px-4">Profile Card</th>
                                <th className="py-3.5 px-4">Amount Paid</th>
                                <th className="py-3.5 px-4">Subscribed Date</th>
                                <th className="py-3.5 px-4">Expiry Date</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-gray-400">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent mb-2"></div>
                                        <p>Loading Subscribers...</p>
                                    </td>
                                </tr>
                            ) : subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-gray-400">
                                        No subscribers found.
                                    </td>
                                </tr>
                            ) : (
                                subscribers.map((sub) => {
                                    const active = isSubActive(sub.subscription?.expiresAt);
                                    return (
                                        <tr key={sub._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-750 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={sub.userId?.profileAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.userId?.name || 'User')}&background=10B981&color=fff`}
                                                        alt={sub.userId?.name}
                                                        className="w-9 h-9 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                            {sub.userId?.name || 'User'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                            {sub.userId?.phone || sub.userId?.email || 'No contact'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {sub.businessName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                    /{sub.slug || sub._id}
                                                </p>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                                    ₹{sub.subscription?.amountPaid || 50}
                                                </span>
                                                <p className="text-[10px] text-gray-400 capitalize">
                                                    {sub.subscription?.paymentMethod || 'Wallet'}
                                                </p>
                                            </td>

                                            <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                                                {formatDate(sub.subscription?.subscribedAt || sub.createdAt)}
                                            </td>

                                            <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                                                {formatDate(sub.subscription?.expiresAt)}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {active ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                                        <XCircle className="w-3 h-3" />
                                                        Expired
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCard(sub);
                                                        setIsGrantModalOpen(true);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold text-xs transition-colors"
                                                >
                                                    Manage Access
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Showing {subscribers.length} of {totalCount} Subscribers
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Grant / Revoke Subscription Modal */}
            <GrantSubscriptionModal
                isOpen={isGrantModalOpen}
                onClose={() => setIsGrantModalOpen(false)}
                card={selectedCard}
                onSuccess={fetchSubscribers}
            />
        </div>
    );
}
