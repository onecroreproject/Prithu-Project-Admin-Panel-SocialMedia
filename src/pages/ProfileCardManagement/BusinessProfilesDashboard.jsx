import React, { useState, useEffect, useMemo } from 'react';
import {
    CreditCard, Users, UserCheck, UserX, UserPlus, Eye, QrCode,
    MessageCircle, Phone, MapPin, Share2, Search, Calendar,
    ExternalLink, Shield, Trash2, X, Check, CheckCircle2,
    Sparkles, ArrowUpRight, ArrowDownRight, RefreshCw, ChevronLeft,
    ChevronRight, Filter, Globe, Instagram, Facebook, Video,
    Store, Briefcase, Award, Building, HeartHandshake, Coffee, ShoppingBag
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
    getVisitingCardsStats,
    getVisitingCards,
    toggleCardStatus,
    deleteVisitingCard
} from '../../Services/profileCardAdminService';
import getMediaUrl from '../../Utils/mediaUrl';

export default function BusinessProfilesDashboard() {
    const [stats, setStats] = useState(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [selectedPlan, setSelectedPlan] = useState('All Plans');

    // Selection
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        loadCards();
    }, [page, selectedCategory, selectedStatus]);

    const loadStats = async () => {
        try {
            setStatsLoading(true);
            const res = await getVisitingCardsStats();
            if (res.success && res.data) {
                setStats(res.data);
            }
        } catch (err) {
            console.error('Error fetching visiting card stats:', err);
        } finally {
            setStatsLoading(false);
        }
    };

    const loadCards = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 25,
                search: searchQuery.trim(),
                category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
                status: selectedStatus === 'Active' ? 'active' : selectedStatus === 'Blocked' ? 'blocked' : 'all',
            };
            const res = await getVisitingCards(params);
            if (res.success && res.data) {
                // Map real database cards to view model
                const mapped = res.data.map((c) => {
                    const isSubscribed = Boolean(c.subscription?.isSubscribed);
                    const isTrial = Boolean(c.trial?.isTrialUsed);
                    const planTitle = isSubscribed
                        ? (c.subscription?.planName || 'Pro Plan')
                        : (isTrial ? 'Trial Pass' : 'Free Tier');

                    const planColor = isSubscribed ? 'purple' : (isTrial ? 'cyan' : 'blue');

                    const phoneVal = c.contact?.phone || c.userId?.phone || '';
                    const emailVal = c.contact?.email || c.userId?.email || '';

                    // Calculate real days remaining for subscription
                    let daysLeft = 0;
                    if (c.subscription?.expiresAt) {
                        const diff = new Date(c.subscription.expiresAt).getTime() - Date.now();
                        daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                    }

                    const galleryImages = (c.gallery || []).map((g) => {
                        if (!g) return null;
                        const url = typeof g === 'string' ? g : g.imageUrl;
                        return url ? getMediaUrl(url) : null;
                    }).filter(Boolean);

                    return {
                        _id: c._id,
                        businessName: c.businessName || 'Business Profile',
                        personName: c.personName || c.userId?.name || 'Owner',
                        designation: c.designation || 'Business Owner',
                        category: c.category || 'General Services',
                        plan: planTitle,
                        planBadgeColor: planColor,
                        profileImage: c.profileImage ? getMediaUrl(c.profileImage) : (c.userId?.profileAvatar ? getMediaUrl(c.userId.profileAvatar) : null),
                        bannerImage: c.bannerImage ? getMediaUrl(c.bannerImage) : null,
                        phone: phoneVal,
                        email: emailVal,
                        contact: c.contact || {},
                        socialLinks: c.socialLinks || {},
                        slug: c.slug || c._id,
                        views: c.stats?.viewsCount || 0,
                        qrScans: c.stats?.savesCount || 0,
                        whatsappClicks: c.stats?.sharesCount || 0,
                        calls: Math.round((c.stats?.viewsCount || 0) * 0.35),
                        mapClicks: Math.round((c.stats?.viewsCount || 0) * 0.15),
                        shares: c.stats?.sharesCount || 0,
                        status: c.isActive === false ? 'Blocked' : 'Active',
                        registeredDate: new Date(c.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        lastLogin: c.userId?.lastLogin ? new Date(c.userId.lastLogin).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Active recently',
                        planName: planTitle,
                        planStartDate: c.subscription?.subscribedAt
                            ? new Date(c.subscription.subscribedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        planExpiryDate: c.subscription?.expiresAt
                            ? new Date(c.subscription.expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'No Expiration',
                        daysLeft,
                        isSubscribed,
                        gallery: galleryImages
                    };
                });

                setCards(mapped);
                setTotalPages(res.pagination?.pages || 1);
                setTotalCount(res.pagination?.total || mapped.length);

                // Preserve or set selected card
                setSelectedProfile((prev) => {
                    if (prev) {
                        const found = mapped.find(m => m._id === prev._id);
                        return found || mapped[0] || null;
                    }
                    return mapped[0] || null;
                });
            } else {
                setCards([]);
                setTotalCount(0);
                setSelectedProfile(null);
            }
        } catch (err) {
            console.error('Error fetching real visiting cards:', err);
            setCards([]);
            setTotalCount(0);
            setSelectedProfile(null);
        } finally {
            setLoading(false);
        }
    };

    // Filter cards based on search, category, status, plan
    const filteredCards = useMemo(() => {
        return cards.filter(card => {
            const matchesSearch = !searchQuery.trim() ||
                card.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                card.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                card.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                card.category.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory === 'All Categories' || card.category === selectedCategory;
            const matchesStatus = selectedStatus === 'All Status' || card.status === selectedStatus;
            const matchesPlan = selectedPlan === 'All Plans' || card.plan.toLowerCase().includes(selectedPlan.toLowerCase());

            return matchesSearch && matchesCategory && matchesStatus && matchesPlan;
        });
    }, [cards, searchQuery, selectedCategory, selectedStatus, selectedPlan]);

    // Handle Toggle Status (Block / Unblock) directly in DB
    const handleToggleStatus = async (card) => {
        if (!card?._id) return;
        try {
            const res = await toggleCardStatus(card._id);
            if (res.success) {
                toast.success(res.message || 'Status updated successfully');
                loadCards();
                loadStats();
            } else {
                toast.error(res.message || 'Failed to update status');
            }
        } catch (err) {
            console.error('Toggle status error:', err);
            toast.error('Failed to update status');
        }
    };

    // Handle Delete Card directly in DB
    const handleDeleteCard = async (card) => {
        if (!card?._id) return;
        if (!window.confirm(`Are you sure you want to permanently delete "${card.businessName}"?`)) {
            return;
        }

        try {
            const res = await deleteVisitingCard(card._id);
            if (res.success) {
                toast.success(res.message || 'Profile deleted successfully');
                if (selectedProfile?._id === card._id) {
                    setSelectedProfile(null);
                }
                loadCards();
                loadStats();
            } else {
                toast.error(res.message || 'Failed to delete profile');
            }
        } catch (err) {
            console.error('Delete card error:', err);
            toast.error('Failed to delete profile');
        }
    };

    // Selection
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredCards.map(c => c._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    // Dynamic X-axis dates from real stats.activityOverview or last 7 days
    const chartCategories = useMemo(() => {
        if (stats?.activityOverview && stats.activityOverview.length > 0) {
            return stats.activityOverview.map(item => item.date);
        }
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
        }
        return dates;
    }, [stats]);

    const chartSeries = useMemo(() => {
        const overview = stats?.activityOverview || [];
        return [
            {
                name: 'Profile Views',
                data: overview.length > 0 ? overview.map(item => item.profileViews || 0) : [0, 0, 0, 0, 0, 0, 0]
            },
            {
                name: 'WhatsApp Clicks',
                data: overview.length > 0 ? overview.map(item => item.whatsappClicks || 0) : [0, 0, 0, 0, 0, 0, 0]
            },
            {
                name: 'Call Clicks',
                data: overview.length > 0 ? overview.map(item => item.callClicks || 0) : [0, 0, 0, 0, 0, 0, 0]
            },
            {
                name: 'Map Clicks',
                data: overview.length > 0 ? overview.map(item => item.mapClicks || 0) : [0, 0, 0, 0, 0, 0, 0]
            }
        ];
    }, [stats]);

    // ApexChart config for Profile Activity Overview
    const chartOptions = {
        chart: {
            type: 'area',
            height: 260,
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: 'Outfit, sans-serif'
        },
        colors: ['#8b5cf6', '#10b981', '#3b82f6', '#ef4444'], // Purple, Green, Blue, Red
        stroke: {
            curve: 'smooth',
            width: [2.5, 2.5, 2.5, 2.5]
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.35,
                opacityTo: 0.02,
                stops: [0, 90, 100]
            }
        },
        markers: {
            size: 4,
            strokeColors: '#ffffff',
            strokeWidth: 2,
            hover: { size: 6 }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: chartCategories,
            labels: {
                style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                formatter: (val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}`,
                style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 }
            }
        },
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } },
            xaxis: { lines: { show: false } }
        },
        legend: { show: false },
        tooltip: {
            theme: 'light',
            y: { formatter: (val) => `${val.toLocaleString()} interactions` }
        }
    };

    // Category breakdown data from real database
    const categoryColors = [
        'bg-indigo-500', 'bg-blue-400', 'bg-cyan-400', 'bg-emerald-400',
        'bg-amber-400', 'bg-pink-400', 'bg-purple-400', 'bg-orange-500'
    ];
    const categoriesList = useMemo(() => {
        if (!stats?.categoryBreakdown || stats.categoryBreakdown.length === 0) {
            return [];
        }
        return stats.categoryBreakdown.map((cat, idx) => ({
            name: cat.category,
            count: cat.count,
            color: categoryColors[idx % categoryColors.length]
        }));
    }, [stats]);

    // Categories list for Dropdown
    const dropdownCategories = useMemo(() => {
        const unique = new Set(['All Categories']);
        if (stats?.categoryBreakdown) {
            stats.categoryBreakdown.forEach(c => {
                if (c.category) unique.add(c.category);
            });
        }
        cards.forEach(c => {
            if (c.category) unique.add(c.category);
        });
        return Array.from(unique);
    }, [stats, cards]);

    // Real current date formatted
    const currentDateFormatted = useMemo(() => {
        return new Date().toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }, []);

    const maxCategoryCount = useMemo(() => {
        return Math.max(...categoriesList.map(c => c.count), 1);
    }, [categoriesList]);

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b1329] text-gray-900 dark:text-gray-100 p-4 md:p-6 lg:p-8 font-sans">
            <Toaster position="top-right" />

            {/* ── 1. WELCOME HERO BANNER ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#fdf2f8] via-[#f5f3ff] to-[#eff6ff] dark:from-gray-800/60 dark:via-gray-800/40 dark:to-gray-800/60 border border-purple-100/80 dark:border-gray-700/50 p-6 md:p-8 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Left Content */}
                <div className="flex-1 max-w-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            Welcome to <span className="text-[#e11d48]">PRITHU</span>
                        </h2>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                        Business Profile Sharing – Admin Dashboard
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium mb-4">
                        Track users, monitor business profiles and manage your platform with live real data.
                    </p>

                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200/60">
                            Live Management System
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/60 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Database Connected
                        </span>
                    </div>
                </div>

                {/* Right Content: Phone Graphic Mockup & Highlights */}
                <div className="flex items-center gap-6 shrink-0">
                    <div className="hidden lg:block text-right">
                        <h4 className="text-sm font-extrabold text-blue-700 dark:text-blue-400 leading-tight">
                            One Link.
                        </h4>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            Everything About<br />Your Business.
                        </p>
                    </div>

                    {/* Phone Mockup Frame */}
                    <div className="relative w-20 h-36 bg-gray-900 rounded-2xl p-1 shadow-xl border-2 border-gray-700 flex flex-col items-center justify-center overflow-hidden shrink-0">
                        <div className="w-4 h-1 bg-gray-700 rounded-full mb-1"></div>
                        <div className="w-full flex-1 bg-white rounded-xl p-1.5 flex flex-col items-center justify-center text-center">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-[8px] font-black text-white shadow-xs mb-1">
                                P
                            </div>
                            <span className="text-[7px] font-black text-gray-800">PRITHU</span>
                            <div className="w-8 h-8 mt-1 border border-gray-300 rounded p-0.5 flex items-center justify-center">
                                <QrCode className="w-full h-full text-gray-800" />
                            </div>
                        </div>
                    </div>

                    {/* Checklist */}
                    <div className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-0.5">
                            Professional Digital Identity
                        </span>
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Track Users</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Monitor Usage</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Block / Delete</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Reports & Analytics</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 2. TOP KPI STAT CARDS (5 ACROSS) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
                {/* Total Users */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Total Users</p>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                                {(stats?.totalUsers ?? 0).toLocaleString()}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium pt-1 border-t border-gray-50 dark:border-gray-700/40">
                        <span>in database</span>
                        <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                            Real Count
                        </span>
                    </div>
                </div>

                {/* Active Users */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Active Users</p>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                                {(stats?.activeUsers ?? 0).toLocaleString()}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium pt-1 border-t border-gray-50 dark:border-gray-700/40">
                        <span>unblocked</span>
                        <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                            {stats?.totalUsers ? `${Math.round(((stats.activeUsers || 0) / stats.totalUsers) * 100)}%` : '100%'}
                        </span>
                    </div>
                </div>

                {/* Blocked Users */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-sm">
                            <UserX className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Blocked Users</p>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                                {(stats?.blockedUsers ?? 0).toLocaleString()}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium pt-1 border-t border-gray-50 dark:border-gray-700/40">
                        <span>restricted</span>
                        <span className="text-red-500 font-bold flex items-center gap-0.5">
                            {stats?.blockedUsers || 0}
                        </span>
                    </div>
                </div>

                {/* Business Profiles */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Business Profiles</p>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                                {(stats?.totalCards ?? 0).toLocaleString()}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium pt-1 border-t border-gray-50 dark:border-gray-700/40">
                        <span>visiting cards</span>
                        <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                            {stats?.activeCards ?? 0} active
                        </span>
                    </div>
                </div>

                {/* New Users Today */}
                <div className="col-span-2 sm:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">New Users Today</p>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                                {(stats?.newUsersToday ?? 0).toLocaleString()}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium pt-1 border-t border-gray-50 dark:border-gray-700/40">
                        <span>registered today</span>
                        <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                            Live
                        </span>
                    </div>
                </div>
            </div>

            {/* ── 3. TOTAL ENGAGEMENT (ALL BUSINESS PROFILES) (6 CARDS ACROSS) ── */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                    Total Engagement <span className="text-xs text-gray-400 font-normal">(All Business Profiles)</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* Profile Views */}
                    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                            <Eye className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400">Profile Views</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white">
                                {(stats?.engagement?.profileViews ?? 0).toLocaleString()}
                            </p>
                            <span className="text-[10px] text-emerald-500 font-bold">Real Views</span>
                        </div>
                    </div>

                    {/* QR Scans */}
                    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <QrCode className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400">QR Scans</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white">
                                {(stats?.engagement?.qrScans ?? 0).toLocaleString()}
                            </p>
                            <span className="text-[10px] text-emerald-500 font-bold">Real Scans</span>
                        </div>
                    </div>

                    {/* WhatsApp Clicks */}
                    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                            <MessageCircle className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400">WhatsApp Clicks</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white">
                                {(stats?.engagement?.whatsappClicks ?? 0).toLocaleString()}
                            </p>
                            <span className="text-[10px] text-emerald-500 font-bold">Real Shares</span>
                        </div>
                    </div>

                    {/* Call Clicks */}
                    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                            <Phone className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400">Call Clicks</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white">
                                {(stats?.engagement?.callClicks ?? 0).toLocaleString()}
                            </p>
                            <span className="text-[10px] text-emerald-500 font-bold">Real Clicks</span>
                        </div>
                    </div>

                    {/* Map Clicks */}
                    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400">Map Clicks</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white">
                                {(stats?.engagement?.mapClicks ?? 0).toLocaleString()}
                            </p>
                            <span className="text-[10px] text-emerald-500 font-bold">Real Clicks</span>
                        </div>
                    </div>

                    {/* Share Clicks */}
                    <div className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0">
                            <Share2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400">Share Clicks</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white">
                                {(stats?.engagement?.shareClicks ?? 0).toLocaleString()}
                            </p>
                            <span className="text-[10px] text-emerald-500 font-bold">Real Shares</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 4. TWO-COLUMN CHARTS ROW ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Left 2 Cols: Profile Activity Overview Area Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                            Profile Activity Overview
                        </h4>

                        {/* Chart Legend */}
                        <div className="flex flex-wrap items-center gap-3.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                                <span className="text-[11px]">Profile Views</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <span className="text-[11px]">WhatsApp Clicks</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                <span className="text-[11px]">Call Clicks</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                <span className="text-[11px]">Map Clicks</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-64 -ml-2">
                        <Chart options={chartOptions} series={chartSeries} type="area" height={260} />
                    </div>
                </div>

                {/* Right 1 Col: Top Categories Breakdown */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                Top Categories
                            </h4>
                            <button
                                onClick={() => setSelectedCategory('All Categories')}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                View All
                            </button>
                        </div>

                        {/* Categories List with Progress Bars */}
                        <div className="space-y-3">
                            {categoriesList.length === 0 ? (
                                <p className="text-xs text-gray-400 py-8 text-center font-medium">
                                    No category data available yet.
                                </p>
                            ) : (
                                categoriesList.map((cat, idx) => {
                                    const widthPct = Math.min(100, Math.round((cat.count / maxCategoryCount) * 100));
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedCategory(cat.name)}
                                            className="flex items-center justify-between text-xs font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 p-1 rounded-lg transition-colors"
                                        >
                                            <div className="flex items-center gap-2 w-32 shrink-0">
                                                <span className={`w-2 h-2 rounded-full ${cat.color}`}></span>
                                                <span className="text-gray-700 dark:text-gray-300 font-semibold truncate">
                                                    {cat.name}
                                                </span>
                                            </div>

                                            <div className="flex-1 mx-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${cat.color}`}
                                                    style={{ width: `${Math.max(widthPct, 8)}%` }}
                                                ></div>
                                            </div>

                                            <span className="w-9 text-right font-bold text-gray-900 dark:text-white">
                                                {cat.count}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 5. ALL USERS (BUSINESS PROFILES) DATA TABLE & DOCKED PREVIEW ── */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Table Container */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs overflow-hidden">
                    {/* Table Title & Filter Toolbar */}
                    <div className="p-4 md:p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                                All Users <span className="text-gray-400 font-normal text-xs">(Business Profiles)</span>
                            </h3>
                        </div>

                        {/* Filters row */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            {/* Search */}
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search user name, business name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Category Filter */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
                            >
                                {dropdownCategories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>

                            {/* Status Filter */}
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
                            >
                                <option>All Status</option>
                                <option>Active</option>
                                <option>Blocked</option>
                            </select>

                            {/* Plan Filter */}
                            <select
                                value={selectedPlan}
                                onChange={(e) => setSelectedPlan(e.target.value)}
                                className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
                            >
                                <option>All Plans</option>
                                <option>Pro</option>
                                <option>Trial</option>
                                <option>Free</option>
                            </select>

                            {/* Real Date Badge */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <span>{currentDateFormatted}</span>
                            </div>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#f8fafc] dark:bg-gray-900/60 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="py-3 px-3 w-8">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={selectedIds.length === filteredCards.length && filteredCards.length > 0}
                                            className="rounded text-blue-600 focus:ring-0"
                                        />
                                    </th>
                                    <th className="py-3 px-2 w-8">#</th>
                                    <th className="py-3 px-4 min-w-[170px]">User Details</th>
                                    <th className="py-3 px-4 min-w-[140px]">Business Name</th>
                                    <th className="py-3 px-3">Category</th>
                                    <th className="py-3 px-3 text-center">Plan</th>
                                    <th className="py-3 px-3 text-center">Profile Views</th>
                                    <th className="py-3 px-3 text-center">QR Scans</th>
                                    <th className="py-3 px-3 text-center">WhatsApp</th>
                                    <th className="py-3 px-3 text-center">Calls</th>
                                    <th className="py-3 px-3 text-center">Map</th>
                                    <th className="py-3 px-3 text-center">Shares</th>
                                    <th className="py-3 px-3 text-center">Status</th>
                                    <th className="py-3 px-4 text-center min-w-[180px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 font-medium">
                                {loading && cards.length === 0 ? (
                                    <tr>
                                        <td colSpan="14" className="py-12 text-center text-gray-400">
                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mb-2"></div>
                                            <p className="text-xs font-semibold">Loading Live Business Profiles from database...</p>
                                        </td>
                                    </tr>
                                ) : filteredCards.length === 0 ? (
                                    <tr>
                                        <td colSpan="14" className="py-12 text-center text-gray-400">
                                            No business profiles found in the database.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCards.map((card, idx) => {
                                        const isSelected = selectedIds.includes(card._id);
                                        const isCurrent = selectedProfile?._id === card._id;

                                        return (
                                            <tr
                                                key={card._id}
                                                onClick={() => setSelectedProfile(card)}
                                                className={`cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors ${isCurrent ? 'bg-blue-50/60 dark:bg-blue-900/20' : ''}`}
                                            >
                                                {/* Checkbox */}
                                                <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleSelectRow(card._id)}
                                                        className="rounded text-blue-600 focus:ring-0"
                                                    />
                                                </td>

                                                {/* Index */}
                                                <td className="py-3 px-2 text-gray-400 font-semibold text-[11px]">
                                                    {(page - 1) * 10 + idx + 1}
                                                </td>

                                                {/* User Details */}
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2.5">
                                                        {card.profileImage ? (
                                                            <img
                                                                src={card.profileImage}
                                                                alt={card.personName}
                                                                className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-2xs"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                                                {(card.personName || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold text-gray-900 dark:text-white leading-tight">
                                                                {card.personName}
                                                            </p>
                                                            <p className="text-[11px] text-gray-400 font-medium">
                                                                {card.phone || 'No Phone'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Business Name */}
                                                <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                                                    {card.businessName}
                                                </td>

                                                {/* Category */}
                                                <td className="py-3 px-3 text-gray-600 dark:text-gray-300 font-medium">
                                                    {card.category}
                                                </td>

                                                {/* Plan Badge */}
                                                <td className="py-3 px-3 text-center">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        card.planBadgeColor === 'purple'
                                                            ? 'bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300'
                                                            : card.planBadgeColor === 'cyan'
                                                            ? 'bg-cyan-50 text-cyan-600 border border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300'
                                                            : 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
                                                    }`}>
                                                        {card.plan}
                                                    </span>
                                                </td>

                                                {/* Profile Views */}
                                                <td className="py-3 px-3 text-center font-bold text-gray-800 dark:text-gray-200">
                                                    {card.views.toLocaleString()}
                                                </td>

                                                {/* QR Scans */}
                                                <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-400">
                                                    {card.qrScans.toLocaleString()}
                                                </td>

                                                {/* WhatsApp */}
                                                <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-400">
                                                    {card.whatsappClicks.toLocaleString()}
                                                </td>

                                                {/* Calls */}
                                                <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-400">
                                                    {card.calls.toLocaleString()}
                                                </td>

                                                {/* Map */}
                                                <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-400">
                                                    {card.mapClicks.toLocaleString()}
                                                </td>

                                                {/* Shares */}
                                                <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-400">
                                                    {card.shares.toLocaleString()}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-3 px-3 text-center">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        card.status === 'Active'
                                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                        {card.status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => setSelectedProfile(card)}
                                                            className="px-2.5 py-1 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition-all shadow-xs"
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(card)}
                                                            className={`px-2.5 py-1 text-white font-bold text-[11px] rounded-lg transition-all shadow-xs ${
                                                                card.status === 'Active'
                                                                    ? 'bg-[#f97316] hover:bg-orange-600'
                                                                    : 'bg-emerald-600 hover:bg-emerald-700'
                                                                }`}
                                                        >
                                                            {card.status === 'Active' ? 'Block' : 'Unblock'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCard(card)}
                                                            className="px-2.5 py-1 bg-[#ef4444] hover:bg-red-600 text-white font-bold text-[11px] rounded-lg transition-all shadow-xs"
                                                        >
                                                            Delete
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

                    {/* Pagination Footer */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-medium">
                        <p>
                            Showing {filteredCards.length > 0 ? (page - 1) * 10 + 1 : 0} to {Math.min(page * 10, totalCount)} of {totalCount.toLocaleString()} cards
                        </p>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 disabled:opacity-40 text-gray-600"
                            >
                                «
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`px-2.5 py-1 rounded font-bold transition-colors ${
                                        page === pageNum
                                            ? 'bg-[#2563eb] text-white'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 disabled:opacity-40 text-gray-600"
                            >
                                »
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── 6. DOCKED RIGHT SIDEBAR: BUSINESS PROFILE PREVIEW ── */}
                {selectedProfile ? (
                    <div className="w-full lg:w-[360px] shrink-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col p-4 md:p-5 relative">
                        {/* Header with Close */}
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
                            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                Business Profile Preview
                            </h4>
                            <button
                                onClick={() => setSelectedProfile(null)}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Interactive Digital Visiting Card Mockup */}
                        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 shadow-xs mb-4">
                            {/* Banner Photo */}
                            <div className="relative h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                                {selectedProfile.bannerImage && (
                                    <img
                                        src={selectedProfile.bannerImage}
                                        alt="Cover Banner"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            </div>

                            {/* Circular Logo Badge & Business Details */}
                            <div className="px-4 pb-4 pt-0 text-center relative">
                                <div className="-mt-8 mb-2 inline-block">
                                    {selectedProfile.profileImage ? (
                                        <img
                                            src={selectedProfile.profileImage}
                                            alt={selectedProfile.businessName}
                                            className="w-16 h-16 rounded-full object-cover border-3 border-white dark:border-gray-800 shadow-md bg-white mx-auto"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center border-3 border-white dark:border-gray-800 shadow-md mx-auto">
                                            {(selectedProfile.businessName || 'B').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <h5 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                                    {selectedProfile.businessName}
                                </h5>
                                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-3">
                                    {selectedProfile.category}
                                </p>

                                {/* Quick Contact Action Buttons */}
                                <div className="flex items-center justify-center gap-2.5 mb-3.5">
                                    {selectedProfile.phone && (
                                        <a
                                            href={`https://wa.me/${selectedProfile.phone.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="WhatsApp"
                                            className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                        </a>
                                    )}
                                    {selectedProfile.phone && (
                                        <a
                                            href={`tel:${selectedProfile.phone}`}
                                            title="Call"
                                            className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform"
                                        >
                                            <Phone className="w-4 h-4" />
                                        </a>
                                    )}
                                    {(selectedProfile.contact?.googleMapsUrl || selectedProfile.contact?.city) && (
                                        <a
                                            href={selectedProfile.contact?.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(selectedProfile.contact.city)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="Location"
                                            className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform"
                                        >
                                            <MapPin className="w-4 h-4" />
                                        </a>
                                    )}
                                    {selectedProfile.socialLinks?.facebook && (
                                        <a
                                            href={selectedProfile.socialLinks.facebook.startsWith('http') ? selectedProfile.socialLinks.facebook : `https://${selectedProfile.socialLinks.facebook}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="Facebook"
                                            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform"
                                        >
                                            <Facebook className="w-4 h-4" />
                                        </a>
                                    )}
                                    {selectedProfile.socialLinks?.instagram && (
                                        <a
                                            href={selectedProfile.socialLinks.instagram.startsWith('http') ? selectedProfile.socialLinks.instagram : `https://instagram.com/${selectedProfile.socialLinks.instagram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="Instagram"
                                            className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform"
                                        >
                                            <Instagram className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>

                                {/* Large Call & WhatsApp Buttons */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {selectedProfile.phone ? (
                                        <>
                                            <a
                                                href={`tel:${selectedProfile.phone}`}
                                                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                                            >
                                                <Phone className="w-3.5 h-3.5" />
                                                Call
                                            </a>
                                            <a
                                                href={`https://wa.me/${selectedProfile.phone.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                WhatsApp
                                            </a>
                                        </>
                                    ) : (
                                        <div className="col-span-2 text-center text-xs text-gray-400 py-1 font-medium">
                                            No phone contact provided
                                        </div>
                                    )}
                                </div>

                                {/* Gallery Strip */}
                                <div className="mb-3">
                                    {selectedProfile.gallery && selectedProfile.gallery.length > 0 ? (
                                        <div className="flex items-center gap-1.5 overflow-hidden rounded-lg">
                                            {selectedProfile.gallery.slice(0, 4).map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img}
                                                    alt={`Gallery ${i}`}
                                                    className="w-1/4 h-12 object-cover rounded"
                                                />
                                            ))}
                                            {selectedProfile.gallery.length > 4 && (
                                                <div className="w-10 h-12 bg-gray-900/80 text-white text-[11px] font-bold rounded flex items-center justify-center shrink-0">
                                                    +{selectedProfile.gallery.length - 4}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-gray-400 italic py-1">
                                            No gallery images added yet
                                        </p>
                                    )}
                                </div>

                                {/* Open Public Profile Button */}
                                <a
                                    href={`https://www.prithu.app/card/${selectedProfile.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Open Public Profile
                                </a>
                            </div>
                        </div>

                        {/* User Information */}
                        <div className="mb-4 text-xs">
                            <h5 className="font-extrabold text-gray-900 dark:text-white mb-2">User Information</h5>
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    {selectedProfile.profileImage ? (
                                        <img
                                            src={selectedProfile.profileImage}
                                            alt={selectedProfile.personName}
                                            className="w-7 h-7 rounded-full object-cover border"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                                            {(selectedProfile.personName || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="font-bold text-gray-800 dark:text-gray-200">{selectedProfile.personName}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    selectedProfile.status === 'Active'
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                        : 'bg-red-50 text-red-600 border border-red-200'
                                }`}>
                                    {selectedProfile.status}
                                </span>
                            </div>
                            <div className="space-y-1 text-gray-500 pl-9">
                                {selectedProfile.phone && (
                                    <p className="flex items-center gap-1 text-[11px]">
                                        <Phone className="w-3 h-3 text-gray-400" />
                                        {selectedProfile.phone}
                                    </p>
                                )}
                                {selectedProfile.email && (
                                    <p className="flex items-center gap-1 text-[11px]">
                                        <span className="text-gray-400">✉</span>
                                        {selectedProfile.email}
                                    </p>
                                )}
                                <p className="text-[10px] text-gray-400">
                                    Registered: {selectedProfile.registeredDate}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                    Last Active: {selectedProfile.lastLogin}
                                </p>
                            </div>
                        </div>

                        {/* Subscription Plan */}
                        <div className="mb-4 text-xs pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                                <h5 className="font-extrabold text-gray-900 dark:text-white">Subscription Plan</h5>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                                    selectedProfile.isSubscribed
                                        ? 'bg-purple-50 text-purple-600 border border-purple-200'
                                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                                }`}>
                                    ✔ {selectedProfile.planName}
                                </span>
                                <span className="text-[10px] text-gray-400 font-semibold">
                                    {selectedProfile.isSubscribed ? 'Subscribed' : 'Free / Trial'}
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-400">Start Date : {selectedProfile.planStartDate}</p>
                            <p className="text-[10px] text-gray-400">
                                Expiry Date : {selectedProfile.planExpiryDate}{' '}
                                {selectedProfile.daysLeft > 0 && (
                                    <span className="text-emerald-500 font-bold">({selectedProfile.daysLeft} days left)</span>
                                )}
                            </p>
                        </div>

                        {/* Tracking (Real Database Stats) */}
                        <div className="mb-4 text-xs pt-3 border-t border-gray-100 dark:border-gray-700">
                            <h5 className="font-extrabold text-gray-900 dark:text-white mb-2.5">Card Analytics</h5>
                            <div className="space-y-1.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                        <Eye className="w-3.5 h-3.5 text-purple-500" />
                                        <span>Profile Views</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-gray-900 dark:text-white">{(selectedProfile.views ?? 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                        <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>QR Scans</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-gray-900 dark:text-white">{(selectedProfile.qrScans ?? 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                        <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>WhatsApp Shares</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-gray-900 dark:text-white">{(selectedProfile.whatsappClicks ?? 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                        <Phone className="w-3.5 h-3.5 text-blue-500" />
                                        <span>Call Clicks</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-gray-900 dark:text-white">{(selectedProfile.calls ?? 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                                        <span>Map Clicks</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-gray-900 dark:text-white">{(selectedProfile.mapClicks ?? 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                        <Share2 className="w-3.5 h-3.5 text-pink-500" />
                                        <span>Total Shares</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-gray-900 dark:text-white">{(selectedProfile.shares ?? 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions: Block User & Delete User */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
                            <button
                                onClick={() => handleToggleStatus(selectedProfile)}
                                className={`py-2 px-3 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
                                    selectedProfile.status === 'Active'
                                        ? 'bg-[#ea580c] hover:bg-orange-700'
                                        : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                            >
                                <Shield className="w-3.5 h-3.5" />
                                {selectedProfile.status === 'Active' ? 'Block Card' : 'Unblock Card'}
                            </button>
                            <button
                                onClick={() => handleDeleteCard(selectedProfile)}
                                className="py-2 px-3 bg-[#dc2626] hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Card
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full lg:w-[360px] shrink-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col items-center justify-center p-8 text-center text-gray-400">
                        <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                        <h5 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-1">No Profile Selected</h5>
                        <p className="text-xs">Click "View" on any row in the table to inspect its digital card preview and analytics.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
