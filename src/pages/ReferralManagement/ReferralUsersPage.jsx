import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    Users,
    Gift,
    Shield,
    CheckCircle,
    Clock,
    Search,
    Download,
    Eye,
    Edit3,
    Trash2,
    Copy,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Wallet,
    Award,
    Filter,
    Plus,
    RefreshCw,
    Sliders
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import referralAdminService from "../../Services/referralAdminService";
import UserReferralDetailModal from "./UserReferralDetailModal";
import EditReferralUserModal from "./EditReferralUserModal";
import CreateReferralLinkModal from "./CreateReferralLinkModal";
import { exportToCSV } from "../../Utils/exportUtils";

export default function ReferralUsersPage() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [planFilter, setPlanFilter] = useState("all");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    // Modals
    const [selectedUserDetail, setSelectedUserDetail] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);

    // Fetch Stats
    const fetchStats = async () => {
        try {
            const data = await referralAdminService.getStats();
            setStats(data);
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    // Fetch Users
    const fetchUsers = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const res = await referralAdminService.getUsers({
                page: pageNumber,
                limit: pagination.limit,
                search,
                status: statusFilter,
                planType: planFilter,
                sortBy,
                sortOrder
            });

            setUsers(res.data || []);
            setPagination(res.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load referral users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchUsers(1);
    }, [search, statusFilter, planFilter, sortBy, sortOrder]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success(`Copied: ${text}`);
    };

    const handleToggleValidity = async (user) => {
        try {
            const nextStatus = !user.referralCodeIsValid;
            await referralAdminService.updateUser(user._id, {
                referralCodeIsValid: nextStatus
            });
            toast.success(`Referral code ${nextStatus ? "Enabled" : "Disabled"}`);
            fetchUsers(pagination.page);
            fetchStats();
        } catch (err) {
            toast.error("Failed to toggle code status");
        }
    };

    const handleOpenDetail = async (userId) => {
        try {
            const data = await referralAdminService.getUserDetail(userId);
            setSelectedUserDetail(data);
            setIsDetailModalOpen(true);
        } catch (err) {
            toast.error("Failed to load user details");
        }
    };

    const handleExport = () => {
        const headers = [
            { label: "Username", key: "userName" },
            { label: "Email", key: "email" },
            { label: "Referral Code", key: "referralCode" },
            { label: "Code Active", key: "referralCodeIsValid" },
            { label: "Direct Referrals", key: "directReferralsCount" },
            { label: "Total Cashback (₹)", key: "totalEarnings" },
            { label: "Wallet Balance (₹)", key: "walletBalance" },
            { label: "Referred By", key: "referredByName" }
        ];

        const exportData = users.map(u => ({
            ...u,
            referredByName: u.referredBy?.userName || "Direct Organic"
        }));

        exportToCSV(exportData, "Referral_Users_List", headers);
        toast.success("Exported successfully");
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 sm:p-6 lg:p-8 space-y-6">
            <Toaster position="top-right" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Gift className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                        Referral & Rewards Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Manage 30-day mission cycles, milestone cashback rewards (5, 10, 15, 20, 24, 25), referral codes, and tree mappings.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/settings/referral/milestones"
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all"
                    >
                        <Sliders className="w-4 h-4 text-indigo-500" />
                        Milestone Rewards
                    </Link>

                    <button
                        onClick={() => setIsCreateLinkModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Link Referral
                    </button>
                </div>
            </div>

            {/* Summary Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mb-2">
                        <Users className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Referrers</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white mt-1">{stats?.totalReferrers || 0}</p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-2">
                        <CheckCircle className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Codes</p>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats?.activeValidReferrers || 0}</p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-2">
                        <Users className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Referred</p>
                    <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats?.totalReferredUsers || 0}</p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mb-2">
                        <Award className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Qualified Users</p>
                    <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats?.qualifiedReferrals || 0}</p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-2">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cashback Paid</p>
                    <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">₹{stats?.totalCashbackPaid || 0}</p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mb-2">
                        <Clock className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Cycles</p>
                    <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats?.activeCyclesCount || 0}</p>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Filters Bar */}
                <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full lg:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search username, email, code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Filter Selects */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        {/* Code Status */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 outline-none"
                        >
                            <option value="all">All Code Status</option>
                            <option value="valid">Code Active (Enabled)</option>
                            <option value="invalid">Code Disabled / Inactive</option>
                        </select>

                        {/* Plan Filter */}
                        <select
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                            className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 outline-none"
                        >
                            <option value="all">All Subscription Plans</option>
                            <option value="paid">Paid VIP Plan</option>
                            <option value="trial">Free Trial</option>
                            <option value="none">No Subscription</option>
                        </select>

                        {/* Sort By */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 outline-none"
                        >
                            <option value="createdAt">Joined Date</option>
                            <option value="totalEarnings">Total Earnings</option>
                            <option value="wallet.balance">Wallet Balance</option>
                        </select>

                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/75 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-800 text-xs">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Referral Code</th>
                                <th className="px-6 py-4">Code Status</th>
                                <th className="px-6 py-4">Referred By</th>
                                <th className="px-6 py-4 text-center">Referees</th>
                                <th className="px-6 py-4">30-Day Quest Cycle</th>
                                <th className="px-6 py-4">Cashback / Wallet</th>
                                <th className="px-6 py-4">Plan Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="p-8 text-center text-gray-500">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-2"></div>
                                        <p>Loading referral users...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="p-8 text-center text-gray-500">
                                        No referral users match your filters.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    const isPaid = u.subscription?.isActive && u.subscription?.planType !== 'trial';
                                    const isTrial = u.subscription?.isActive && u.subscription?.planType === 'trial';
                                    const eligible = u.activeCycle?.eligibleReferrals || 0;
                                    const pct = Math.min(100, Math.round((eligible / 25) * 100));

                                    return (
                                        <tr key={u._id} className="hover:bg-indigo-50/20 dark:hover:bg-gray-800/40 transition-colors">
                                            {/* User */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 font-bold flex items-center justify-center text-sm">
                                                        {u.userName?.charAt(0)?.toUpperCase() || "U"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-gray-100">@{u.userName}</p>
                                                        <p className="text-xs text-gray-500">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Referral Code */}
                                            <td className="px-6 py-4">
                                                {u.referralCode && u.referralCode !== "N/A" ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                                            {u.referralCode}
                                                        </span>
                                                        <button
                                                            onClick={() => handleCopy(u.referralCode)}
                                                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                            title="Copy code"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">None</span>
                                                )}
                                            </td>

                                            {/* Code Validity Switch */}
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleValidity(u)}
                                                    className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all ${
                                                        u.referralCodeIsValid
                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-200"
                                                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200"
                                                    }`}
                                                    title="Click to toggle referral code status"
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${u.referralCodeIsValid ? "bg-emerald-500" : "bg-gray-400"}`} />
                                                    {u.referralCodeIsValid ? "Active" : "Disabled"}
                                                </button>
                                            </td>

                                            {/* Referred By */}
                                            <td className="px-6 py-4">
                                                {u.referredBy ? (
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                            @{u.referredBy.userName}
                                                        </p>
                                                        <p className="text-[11px] font-mono text-gray-400">
                                                            {u.referredBy.referralCode}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Direct</span>
                                                )}
                                            </td>

                                            {/* Direct Referees Count */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-800 dark:text-gray-200">
                                                    {u.directReferralsCount || 0}
                                                </span>
                                            </td>

                                            {/* Active Cycle */}
                                            <td className="px-6 py-4">
                                                {u.activeCycle ? (
                                                    <div className="w-32 space-y-1">
                                                        <div className="flex justify-between text-[11px] font-bold">
                                                            <span className="text-gray-700 dark:text-gray-300">{eligible}/25</span>
                                                            <span className="text-indigo-600 dark:text-indigo-400">{pct}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                                            <div
                                                                className="bg-indigo-600 h-full rounded-full transition-all"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">No active cycle</span>
                                                )}
                                            </td>

                                            {/* Cashback / Wallet */}
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                    ₹{u.totalEarnings || 0} earned
                                                </p>
                                                <p className="text-[11px] text-gray-500">
                                                    ₹{u.walletBalance || 0} in wallet
                                                </p>
                                            </td>

                                            {/* Plan Status */}
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                                    isPaid
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                                        : isTrial
                                                        ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400"
                                                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                                }`}>
                                                    {isPaid ? "Paid VIP" : isTrial ? "Free Trial" : "No Plan"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenDetail(u._id)}
                                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-all"
                                                        title="View Referral Network"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUserForEdit(u);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-all"
                                                        title="Edit Referral Settings"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
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
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                    <p>
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchUsers(pagination.page - 1)}
                            disabled={pagination.page <= 1 || loading}
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                            Page {pagination.page} of {pagination.totalPages || 1}
                        </span>
                        <button
                            onClick={() => fetchUsers(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages || loading}
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <UserReferralDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                userDetail={selectedUserDetail}
                onRefresh={() => {
                    if (selectedUserDetail) handleOpenDetail(selectedUserDetail.user._id);
                    fetchUsers(pagination.page);
                    fetchStats();
                }}
            />

            <EditReferralUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={selectedUserForEdit}
                onRefresh={() => {
                    fetchUsers(pagination.page);
                    fetchStats();
                }}
            />

            <CreateReferralLinkModal
                isOpen={isCreateLinkModalOpen}
                onClose={() => setIsCreateLinkModalOpen(false)}
                onRefresh={() => {
                    fetchUsers(pagination.page);
                    fetchStats();
                }}
            />
        </div>
    );
}
