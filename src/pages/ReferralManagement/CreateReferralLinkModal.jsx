import React, { useState } from "react";
import { X, Link2, UserCheck, ArrowRight, Key, Sparkles, Shield } from "lucide-react";
import toast from "react-hot-toast";
import referralAdminService from "../../Services/referralAdminService";

export default function CreateReferralLinkModal({ isOpen, onClose, onRefresh }) {
    const [tab, setTab] = useState("link"); // "link" | "assign"
    
    // Mode 1: Link Referee to Referrer
    const [parentIdentifier, setParentIdentifier] = useState("");
    const [childIdentifier, setChildIdentifier] = useState("");

    // Mode 2: Assign Referral Code directly
    const [userIdentifier, setUserIdentifier] = useState("");
    const [customCode, setCustomCode] = useState("");
    const [codeIsValid, setCodeIsValid] = useState(true);

    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleLinkSubmit = async (e) => {
        e.preventDefault();
        if (!parentIdentifier.trim() || !childIdentifier.trim()) {
            toast.error("Please provide both Referrer and Referee identifiers");
            return;
        }

        setLoading(true);
        try {
            const res = await referralAdminService.createLink({
                parentIdentifier: parentIdentifier.trim(),
                childIdentifier: childIdentifier.trim()
            });
            toast.success(res.message || "Referral link created successfully!");
            onRefresh && onRefresh();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to link referral");
        } finally {
            setLoading(false);
        }
    };

    const handleAssignCodeSubmit = async (e) => {
        e.preventDefault();
        if (!userIdentifier.trim()) {
            toast.error("Please enter a username, email, or user ID");
            return;
        }

        setLoading(true);
        try {
            // Find user or update
            const res = await referralAdminService.updateUser(userIdentifier.trim(), {
                referralCode: customCode.trim().toUpperCase() || undefined,
                referralCodeIsValid: codeIsValid
            });
            toast.success(res.message || "Referral code configured successfully!");
            onRefresh && onRefresh();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to assign referral code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/40">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                            <Link2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {tab === "link" ? "Create Referral Link" : "Assign Referral Code"}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {tab === "link" ? "Map a referee to a referrer" : "Generate/enable referral code for a user"}
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

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 pt-3 gap-4 bg-gray-50/30 dark:bg-gray-800/20">
                    <button
                        onClick={() => setTab("link")}
                        className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                            tab === "link"
                                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        <Link2 className="w-3.5 h-3.5" />
                        Link Referee to Referrer
                    </button>
                    <button
                        onClick={() => setTab("assign")}
                        className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                            tab === "assign"
                                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        <Key className="w-3.5 h-3.5" />
                        Assign / Enable Code
                    </button>
                </div>

                {/* Content */}
                {tab === "link" ? (
                    <form onSubmit={handleLinkSubmit} className="p-6 space-y-4">
                        {/* Parent (Referrer) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Referrer (Parent User)
                            </label>
                            <input
                                type="text"
                                value={parentIdentifier}
                                onChange={(e) => setParentIdentifier(e.target.value)}
                                placeholder="Username, Email, Referral Code, or User ID"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <p className="text-[11px] text-gray-500 mt-1">This user receives credit towards their 25-milestone cycle.</p>
                        </div>

                        <div className="flex justify-center my-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
                                <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
                            </div>
                        </div>

                        {/* Child (Referee) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Referee (Child / New User)
                            </label>
                            <input
                                type="text"
                                value={childIdentifier}
                                onChange={(e) => setChildIdentifier(e.target.value)}
                                placeholder="Username, Email, or User ID"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <p className="text-[11px] text-gray-500 mt-1">The invited user to be linked under the referrer.</p>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                            >
                                {loading ? "Linking..." : "Create Link"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleAssignCodeSubmit} className="p-6 space-y-4">
                        {/* Target User */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Target User ID / Username
                            </label>
                            <input
                                type="text"
                                value={userIdentifier}
                                onChange={(e) => setUserIdentifier(e.target.value)}
                                placeholder="User MongoDB ID or Username"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Custom Code */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Custom Referral Code (Optional)
                            </label>
                            <input
                                type="text"
                                value={customCode}
                                onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                                placeholder="Leave blank to auto-generate"
                                maxLength={20}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono font-bold text-gray-900 dark:text-white uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Code Active Toggle */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Enable Referral Rewards</p>
                                <p className="text-xs text-gray-500">Enable cashback missions for this user</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={codeIsValid}
                                onChange={(e) => setCodeIsValid(e.target.checked)}
                                className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                            >
                                {loading ? "Configuring..." : "Configure Code"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
