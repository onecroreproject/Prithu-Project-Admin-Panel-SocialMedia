import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Wallet,
    CheckCircle2,
    Clock,
    XCircle,
    Search,
    Download,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Shield,
    DollarSign,
    User,
    Check,
    X,
    Filter,
    CreditCard
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import referralAdminService from "../../Services/referralAdminService";
import { exportToCSV } from "../../Utils/exportUtils";

export default function WithdrawalManagementPage() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [stats, setStats] = useState({ pendingRequests: 0, totalPaidOut: 0 });
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    // Action Modal state
    const [actionModal, setActionModal] = useState({ isOpen: false, type: null, item: null });
    const [txnRef, setTxnRef] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const fetchWithdrawals = async (page = 1) => {
        setLoading(true);
        try {
            const res = await referralAdminService.getWithdrawals({
                page,
                limit: pagination.limit,
                status: statusFilter,
                search
            });

            setWithdrawals(res.data || []);
            setPagination(res.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
            if (res.stats) {
                setStats(res.stats);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load withdrawals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals(1);
    }, [statusFilter, search]);

    const handleOpenAction = (type, item) => {
        setActionModal({ isOpen: true, type, item });
        setTxnRef("");
        setRejectionReason("");
    };

    const handleConfirmAction = async (e) => {
        e.preventDefault();
        const { type, item } = actionModal;
        if (!item) return;

        setActionLoading(true);
        try {
            if (type === "paid") {
                await referralAdminService.updateWithdrawalStatus(item._id, {
                    status: "paid",
                    transactionReference: txnRef.trim()
                });
                toast.success(`Withdrawal marked as Paid (₹${item.amount})`);
            } else if (type === "rejected") {
                if (!rejectionReason.trim()) {
                    toast.error("Please enter a reason for rejection");
                    setActionLoading(false);
                    return;
                }
                await referralAdminService.updateWithdrawalStatus(item._id, {
                    status: "rejected",
                    rejectionReason: rejectionReason.trim()
                });
                toast.success(`Withdrawal rejected and ₹${item.amount} refunded to user wallet`);
            }
            setActionModal({ isOpen: false, type: null, item: null });
            fetchWithdrawals(pagination.page);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update withdrawal status");
        } finally {
            setActionLoading(false);
        }
    };

    const handleExport = () => {
        const headers = [
            { label: "Username", key: "userName" },
            { label: "Email", key: "email" },
            { label: "Amount (₹)", key: "amount" },
            { label: "Status", key: "status" },
            { label: "Account Holder", key: "accountHolderName" },
            { label: "Bank Name", key: "bankName" },
            { label: "Branch", key: "branch" },
            { label: "Account Number", key: "accountNumber" },
            { label: "IFSC Code", key: "ifscCode" },
            { label: "Phone Number", key: "mobileNumber" },
            { label: "UPI ID", key: "upiId" },
            { label: "Requested At", key: "requestedAt" }
        ];

        const exportData = withdrawals.map(w => ({
            userName: w.userId?.userName || "N/A",
            email: w.userId?.email || "N/A",
            amount: w.amount,
            status: w.status,
            accountHolderName: w.bankDetails?.accountHolderName || w.userId?.userName || "N/A",
            bankName: w.bankDetails?.bankName || "N/A",
            branch: w.bankDetails?.branch || "N/A",
            accountNumber: w.bankDetails?.accountNumber || "N/A",
            ifscCode: w.bankDetails?.ifscCode || "N/A",
            mobileNumber: w.bankDetails?.mobileNumber || w.bankDetails?.phoneNumber || "N/A",
            upiId: w.bankDetails?.upiId || "N/A",
            requestedAt: new Date(w.requestedAt).toLocaleString()
        }));

        exportToCSV(exportData, "Referral_Withdrawals_List", headers);
        toast.success("Exported successfully");
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 sm:p-6 lg:p-8 space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        to="/settings/referral/users"
                        className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Wallet className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                            Referral & Wallet Withdrawals
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                            Approve, payout via UPI/Bank, and manage user wallet cash withdrawals.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Pending Review</p>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
                        {stats.pendingRequests} Requests
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Awaiting review & bank payout</p>
                </div>

                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Paid Out</p>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                        ₹{Number(stats.totalPaidOut).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Successfully transferred to users</p>
                </div>

                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Monthly Cycle Limit</p>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                        25 Friends / Mo
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Claim 1 milestone cashback (up to ₹2,500)</p>
                </div>
            </div>

            {/* Withdrawals Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Filter Toolbar */}
                <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search username, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 outline-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-800 text-xs">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Withdraw Amount</th>
                                <th className="px-6 py-4">Milestone Progress</th>
                                <th className="px-6 py-4">Payout Method / Bank</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Requested Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-2"></div>
                                        <p>Loading withdrawals...</p>
                                    </td>
                                </tr>
                            ) : withdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        No withdrawal requests found.
                                    </td>
                                </tr>
                            ) : (
                                withdrawals.map((w) => {
                                    const u = w.userId || {};
                                    const b = w.bankDetails || {};

                                    return (
                                        <tr key={w._id} className="hover:bg-indigo-50/20 dark:hover:bg-gray-800/40 transition-colors">
                                            {/* User */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 font-bold flex items-center justify-center text-sm">
                                                        {u.userName?.charAt(0)?.toUpperCase() || "U"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white">@{u.userName || "Unknown"}</p>
                                                        <p className="text-xs text-gray-500">{u.email || "No email"}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Withdraw Amount */}
                                            <td className="px-6 py-4">
                                                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                                                    ₹{Number(w.amount).toLocaleString()}
                                                </p>
                                                <p className="text-[11px] text-gray-400">
                                                    Wallet remaining: ₹{u.wallet?.balance || 0}
                                                </p>
                                            </td>

                                            {/* Milestone Progress */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider w-fit ${
                                                        w.milestoneStats?.isMilestoneQualified
                                                            ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                                    }`}>
                                                        {w.milestoneStats?.eligibleReferrals || 0} Ref (₹{w.milestoneStats?.totalMilestoneEarned || 0} Claimed)
                                                    </span>
                                                    <p className="text-[11px] text-gray-400">
                                                        Milestones: {w.milestoneStats?.claimedMilestones?.length ? w.milestoneStats.claimedMilestones.map(m => `M${m}`).join(", ") : "None"}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Payout Bank / UPI */}
                                            <td className="px-6 py-4">
                                                {b.upiId && b.upiId !== "N/A" ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-md uppercase">
                                                                UPI Payout
                                                            </span>
                                                        </div>
                                                        <p className="font-mono font-bold text-xs text-gray-800 dark:text-gray-200">
                                                            {b.upiId}
                                                        </p>
                                                        {(b.mobileNumber || b.phoneNumber) && (b.mobileNumber !== "N/A" || b.phoneNumber !== "N/A") && (
                                                            <p className="text-[11px] text-gray-500">
                                                                📞 {b.mobileNumber || b.phoneNumber}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-xs text-gray-900 dark:text-white">
                                                            {b.accountHolderName || u.userName || "N/A"}
                                                        </p>
                                                        <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                                                            {b.bankName || "Bank Transfer"} {b.branch && b.branch !== "N/A" ? `• Branch: ${b.branch}` : ""}
                                                        </p>
                                                        <p className="font-mono text-[11px] text-gray-500">
                                                            A/C: {b.accountNumber} • IFSC: {b.ifscCode}
                                                        </p>
                                                        {(b.mobileNumber || b.phoneNumber) && (b.mobileNumber !== "N/A" || b.phoneNumber !== "N/A") && (
                                                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                                                                📞 Phone: {b.mobileNumber || b.phoneNumber}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 w-fit ${
                                                    w.status === "paid" || w.status === "approved"
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                                        : w.status === "rejected"
                                                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                                                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        w.status === "paid" ? "bg-emerald-500" : w.status === "rejected" ? "bg-rose-500" : "bg-amber-500 animate-pulse"
                                                    }`} />
                                                    {w.status === "paid" ? "Paid" : w.status === "rejected" ? "Rejected" : "Pending"}
                                                </span>
                                            </td>

                                            {/* Requested Date */}
                                            <td className="px-6 py-4 text-xs text-gray-500">
                                                {new Date(w.requestedAt).toLocaleDateString()}{" "}
                                                <span className="text-[11px] text-gray-400">
                                                    {new Date(w.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                {w.status === "pending" ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenAction("paid", w)}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            Mark Paid
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenAction("rejected", w)}
                                                            className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 font-medium">Completed</span>
                                                )}
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
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} requests
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchWithdrawals(pagination.page - 1)}
                            disabled={pagination.page <= 1 || loading}
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                            Page {pagination.page} of {pagination.totalPages || 1}
                        </span>
                        <button
                            onClick={() => fetchWithdrawals(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages || loading}
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Confirmation Modal */}
            {actionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/40">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                {actionModal.type === "paid" ? "Confirm Payout Approval" : "Reject & Refund Withdrawal"}
                            </h3>
                            <button onClick={() => setActionModal({ isOpen: false, type: null, item: null })}>
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmAction} className="p-6 space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/60">
                                <p className="text-xs text-gray-500">Payout Amount</p>
                                <p className="text-2xl font-black text-emerald-600 mt-1">₹{actionModal.item?.amount}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    To: @{actionModal.item?.userId?.userName} ({actionModal.item?.bankDetails?.upiId || actionModal.item?.bankDetails?.accountNumber})
                                </p>
                            </div>

                            {actionModal.type === "paid" ? (
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                        Transaction Reference / UTR Number
                                    </label>
                                    <input
                                        type="text"
                                        value={txnRef}
                                        onChange={(e) => setTxnRef(e.target.value)}
                                        placeholder="e.g. UTR123456789 or UPI Ref"
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                        Rejection Reason (Refunds ₹{actionModal.item?.amount} to User Wallet)
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="e.g. Invalid UPI ID or Account Number. Please re-check bank details."
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                                    />
                                </div>
                            )}

                            <div className="pt-3 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setActionModal({ isOpen: false, type: null, item: null })}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className={`px-5 py-2 text-sm font-bold text-white rounded-xl shadow-lg transition-all ${
                                        actionModal.type === "paid"
                                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
                                            : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/30"
                                    }`}
                                >
                                    {actionLoading ? "Processing..." : actionModal.type === "paid" ? "Mark as Paid" : "Confirm Reject & Refund"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
