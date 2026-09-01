import React, { useState } from "react";
import {
    X,
    User,
    Gift,
    Clock,
    Award,
    CheckCircle2,
    Clock3,
    Trash2,
    Calendar,
    Wallet,
    Shield,
    Check,
    Users
} from "lucide-react";
import toast from "react-hot-toast";
import referralAdminService from "../../Services/referralAdminService";

export default function UserReferralDetailModal({ isOpen, onClose, userDetail, onRefresh }) {
    const [actionLoading, setActionLoading] = useState(false);

    if (!isOpen || !userDetail) return null;

    const { user, referees = [], cycles = [], activities = [] } = userDetail;

    const handleToggleQualify = async (refereeId, currentStatus) => {
        setActionLoading(true);
        try {
            const nextStatus = currentStatus === "Qualified" ? "Pending" : "Qualified";
            await referralAdminService.updateUser(user._id, {
                qualifyRefereeId: refereeId,
                qualifyStatus: nextStatus
            });
            toast.success(`Referee status updated to ${nextStatus}`);
            onRefresh && onRefresh();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update referee status");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnlinkReferee = async (refereeId, refereeName) => {
        if (!window.confirm(`Are you sure you want to unlink @${refereeName} from this user's referral list?`)) return;
        setActionLoading(true);
        try {
            await referralAdminService.deleteLink(user._id, refereeId);
            toast.success("Referee unlinked successfully");
            onRefresh && onRefresh();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to unlink referee");
        } finally {
            setActionLoading(false);
        }
    };

    const activeCycle = cycles.find(c => c.status === "active") || cycles[0] || null;
    const claimedMilestones = activeCycle?.claimedMilestones || [];

    const MILESTONES_LIST = [
        { count: 5, reward: 100, label: "5 Referrals (₹100)" },
        { count: 10, reward: 300, label: "10 Referrals (₹300)" },
        { count: 15, reward: 500, label: "15 Referrals (₹500)" },
        { count: 20, reward: 700, label: "20 Referrals (₹700)" },
        { count: 24, reward: 1000, label: "24 Referrals (₹1,000)" },
        { count: 25, reward: 2500, label: "25 Referrals - Mega (₹2,500)" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/40">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xl">
                            {user.userName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    @{user.userName}
                                </h3>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                    user.referralCodeIsValid 
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" 
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                }`}>
                                    {user.referralCodeIsValid ? "Code Active" : "Code Disabled"}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user.email} • Code: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{user.referralCode || "None"}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Direct Referees</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{referees.length}</p>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Qualified Referrals</p>
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                {activeCycle?.eligibleReferrals || 0} / 25
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Cashback Earned</p>
                            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                                ₹{user.totalEarnings || 0}
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Wallet Balance</p>
                            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                                ₹{user.wallet?.balance || 0}
                            </p>
                        </div>
                    </div>

                    {/* Referred By Section */}
                    {user.referredByUserId && (
                        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <div>
                                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Referred By</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        @{user.referredByUserId.userName} ({user.referredByUserId.email})
                                    </p>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 bg-white dark:bg-gray-800 text-xs font-mono font-bold text-indigo-600 rounded-lg border border-indigo-100 dark:border-gray-700">
                                {user.referredByUserId.referralCode}
                            </span>
                        </div>
                    )}

                    {/* Milestone Progress Status */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-500" />
                            Milestone Cashback Claims (Active Cycle: {activeCycle?.eligibleReferrals || 0}/25)
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {MILESTONES_LIST.map(m => {
                                const isClaimed = claimedMilestones.includes(m.count);
                                const isUnlocked = (activeCycle?.eligibleReferrals || 0) >= m.count;

                                return (
                                    <div
                                        key={m.count}
                                        className={`p-3 rounded-xl border flex items-center justify-between ${
                                            isClaimed
                                                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                                                : isUnlocked
                                                ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40"
                                                : "bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800"
                                        }`}
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{m.label}</p>
                                            <p className="text-[11px] text-gray-500">
                                                {isClaimed ? "Claimed to Wallet" : isUnlocked ? "Eligible to Claim" : "Locked"}
                                            </p>
                                        </div>
                                        {isClaimed ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        ) : isUnlocked ? (
                                            <Gift className="w-5 h-5 text-amber-500 animate-bounce" />
                                        ) : (
                                            <Clock3 className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Direct Referees List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-500" />
                                Referred Friends ({referees.length})
                            </span>
                        </h4>

                        {referees.length === 0 ? (
                            <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                                <p className="text-sm text-gray-500">No users have signed up with this referral code yet.</p>
                            </div>
                        ) : (
                            <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-semibold border-b border-gray-100 dark:border-gray-800">
                                        <tr>
                                            <th className="p-3">User</th>
                                            <th className="p-3">Joined</th>
                                            <th className="p-3">Plan Status</th>
                                            <th className="p-3">Referral Status</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {referees.map(r => {
                                            const isPaid = r.subscription?.isActive && r.subscription?.planType !== 'trial';
                                            const isTrial = r.subscription?.isActive && r.subscription?.planType === 'trial';
                                            const cycleDetail = activeCycle?.referralDetails?.find(d => d.referredUserId?.toString() === r._id?.toString());
                                            const isQualified = cycleDetail?.subscriptionStatus === "Qualified";

                                            return (
                                                <tr key={r._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                    <td className="p-3">
                                                        <p className="font-bold text-gray-900 dark:text-white">@{r.userName}</p>
                                                        <p className="text-[11px] text-gray-500">{r.email}</p>
                                                    </td>
                                                    <td className="p-3 text-gray-500">
                                                        {new Date(r.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                                            isPaid ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                                            : isTrial ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400"
                                                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                                        }`}>
                                                            {isPaid ? "Paid VIP" : isTrial ? "Free Trial" : "No Plan"}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <button
                                                            onClick={() => handleToggleQualify(r._id, isQualified ? "Qualified" : "Pending")}
                                                            disabled={actionLoading}
                                                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                                                                isQualified
                                                                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                                                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-200"
                                                            }`}
                                                        >
                                                            {isQualified ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                            {isQualified ? "Qualified" : "Pending (Click to Qualify)"}
                                                        </button>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <button
                                                            onClick={() => handleUnlinkReferee(r._id, r.userName)}
                                                            disabled={actionLoading}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all"
                                                            title="Unlink referee"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
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

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl text-sm font-semibold transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
