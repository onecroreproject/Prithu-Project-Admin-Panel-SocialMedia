import React, { useState, useEffect } from 'react';
import {
    CreditCard, Eye, Share2, UserPlus, Search, RefreshCw,
    ExternalLink, Crown, CheckCircle2, XCircle, ShieldCheck,
    Filter, ArrowUpRight, Sparkles, Smartphone, Globe
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import {
    getVisitingCardsStats,
    getVisitingCards
} from '../../Services/profileCardAdminService';
import GrantSubscriptionModal from './GrantSubscriptionModal';

export default function ProfileCardsListPage() {
    const [stats, setStats] = useState(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    // Filters & Pagination
    const [search, setSearch] = useState('');
    const [templateFilter, setTemplateFilter] = useState('');
    const [subFilter, setSubFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Modal
    const [selectedCard, setSelectedCard] = useState(null);
    const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchCards();
    }, [page, search, templateFilter, subFilter]);

    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const res = await getVisitingCardsStats();
            if (res.success) {
                setStats(res.data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchCards = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: search.trim(),
                templateId: templateFilter || undefined,
            };
            if (subFilter === 'subscribed') params.isSubscribed = 'true';
            if (subFilter === 'free') params.isSubscribed = 'false';

            const res = await getVisitingCards(params);
            if (res.success) {
                setCards(res.data || []);
                setTotalPages(res.pagination?.pages || 1);
                setTotalCount(res.pagination?.total || 0);
            }
        } catch (err) {
            console.error('Error fetching cards:', err);
            toast.error('Failed to load profile cards');
        } finally {
            setLoading(false);
        }
    };

    const getTemplateBadge = (templateId) => {
        const map = {
            template_1: { name: 'Royal Gold', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
            template_2: { name: 'Navy Executive', bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
            template_3: { name: 'Emerald Wave', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
            template_4: { name: 'Midnight Violet', bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
            template_5: { name: 'Teal Medical', bg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800' },
        };
        const item = map[templateId] || { name: templateId || 'Default', bg: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' };
        return (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${item.bg}`}>
                {item.name}
            </span>
        );
    };

    const isCardSubscribed = (card) => {
        return Boolean(
            card.subscription?.isSubscribed &&
            (!card.subscription?.expiresAt || new Date(card.subscription?.expiresAt) > new Date())
        );
    };

    const getSubscriptionStatusBadge = (card) => {
        if (isCardSubscribed(card)) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <Crown className="w-3 h-3" />
                    ₹50 Active
                </span>
            );
        }

        const isTrialActive = Boolean(
            card.trial?.trialExpiresAt && new Date(card.trial.trialExpiresAt) > new Date()
        );

        if (isTrialActive) {
            const diffDays = Math.max(1, Math.ceil((new Date(card.trial.trialExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <Clock className="w-3 h-3" />
                    Trial ({diffDays}d left)
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                <XCircle className="w-3 h-3" />
                Locked / Expired
            </span>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Toaster position="top-right" />

            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
                        <CreditCard className="w-7 h-7 text-emerald-600" />
                        Digital Profile Cards Directory
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Track live page views, templates, active ₹50 subscriptions and user cards.
                    </p>
                </div>
                <button
                    onClick={() => { fetchStats(); fetchCards(); }}
                    className="self-start md:self-auto px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex items-center gap-2 shadow-sm"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Directory
                </button>
            </div>

            {/* KPI Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Profile Cards</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                            {statsLoading ? '...' : (stats?.totalCards || 0).toLocaleString()}
                        </h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Eye className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">App + Web Page Views</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                            {statsLoading ? '...' : (stats?.totalViews || 0).toLocaleString()}
                        </h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Share2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shares & WhatsApp</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                            {statsLoading ? '...' : (stats?.totalShares || 0).toLocaleString()}
                        </h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">vCard Saves</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                            {statsLoading ? '...' : (stats?.totalSaves || 0).toLocaleString()}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search business, person, phone, slug..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    <select
                        value={templateFilter}
                        onChange={(e) => { setTemplateFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none"
                    >
                        <option value="">All Templates (5)</option>
                        <option value="template_1">Royal Gold (T1)</option>
                        <option value="template_2">Navy Executive (T2)</option>
                        <option value="template_3">Emerald Wave (T3)</option>
                        <option value="template_4">Midnight Violet (T4)</option>
                        <option value="template_5">Teal Medical (T5)</option>
                    </select>

                    <select
                        value={subFilter}
                        onChange={(e) => { setSubFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none"
                    >
                        <option value="all">All Subscription Statuses</option>
                        <option value="subscribed">👑 Active ₹50 Subscribers</option>
                        <option value="free">🔒 Unsubscribed / Free</option>
                    </select>
                </div>
            </div>

            {/* Profile Cards Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50/75 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="py-3.5 px-4">Card Profile</th>
                                <th className="py-3.5 px-4">Owner / Contact</th>
                                <th className="py-3.5 px-4">Template</th>
                                <th className="py-3.5 px-4">Subscription</th>
                                <th className="py-3.5 px-4 text-center">👁️ Views</th>
                                <th className="py-3.5 px-4 text-center">📲 Shares</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-gray-400">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent mb-2"></div>
                                        <p>Loading Profile Cards...</p>
                                    </td>
                                </tr>
                            ) : cards.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-gray-400">
                                        No Profile Cards found matching your query.
                                    </td>
                                </tr>
                            ) : (
                                cards.map((card) => {
                                    const activeSub = isCardSubscribed(card);
                                    return (
                                        <tr key={card._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-750 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={card.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(card.businessName || 'Card')}&background=10B981&color=fff`}
                                                        alt={card.businessName}
                                                        className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                            {card.businessName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                            /{card.slug || card._id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {card.personName || card.userId?.name || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {card.contact?.phone || card.userId?.phone || 'No phone'}
                                                </p>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {getTemplateBadge(card.templateId)}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {getSubscriptionStatusBadge(card)}
                                            </td>

                                            <td className="py-3.5 px-4 text-center font-bold text-gray-800 dark:text-gray-200">
                                                {(card.stats?.viewsCount || 0).toLocaleString()}
                                            </td>

                                            <td className="py-3.5 px-4 text-center font-bold text-gray-800 dark:text-gray-200">
                                                {(card.stats?.sharesCount || 0).toLocaleString()}
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a
                                                        href={`/share/card/${card.slug || card._id}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="Open Web Preview"
                                                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedCard(card);
                                                            setIsGrantModalOpen(true);
                                                        }}
                                                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
                                                    >
                                                        <Crown className="w-3 h-3" />
                                                        Pass
                                                    </button>
                                                </div>
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
                        Showing {cards.length} of {totalCount} Profile Cards
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
                onSuccess={() => {
                    fetchStats();
                    fetchCards();
                }}
            />
        </div>
    );
}
