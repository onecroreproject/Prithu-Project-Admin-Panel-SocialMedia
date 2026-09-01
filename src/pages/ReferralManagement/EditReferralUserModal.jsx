import React, { useState, useEffect } from "react";
import { X, Shield, Key, Wallet, RefreshCw, Check } from "lucide-react";
import toast from "react-hot-toast";
import referralAdminService from "../../Services/referralAdminService";

export default function EditReferralUserModal({ isOpen, onClose, user, onRefresh }) {
    const [referralCode, setReferralCode] = useState("");
    const [referralCodeIsValid, setReferralCodeIsValid] = useState(false);
    const [walletAdjustment, setWalletAdjustment] = useState("");
    const [resetCycle, setResetCycle] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setReferralCode(user.referralCode || "");
            setReferralCodeIsValid(!!user.referralCodeIsValid);
            setWalletAdjustment("");
            setResetCycle(false);
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                referralCode: referralCode.trim().toUpperCase(),
                referralCodeIsValid,
                resetCycle
            };

            if (walletAdjustment && !isNaN(Number(walletAdjustment))) {
                payload.walletAdjustment = Number(walletAdjustment);
            }

            await referralAdminService.updateUser(user._id, payload);
            toast.success("User referral settings updated successfully!");
            onRefresh && onRefresh();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/40">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-600" />
                            Edit Referral Settings: @{user.userName}
                        </h3>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Referral Code */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                            Custom Referral Code
                        </label>
                        <div className="relative">
                            <Key className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                placeholder="ENTER CODE (e.g. PRITHU100)"
                                maxLength={20}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono font-bold text-gray-900 dark:text-white uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Referral Code Validity Toggle */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Referral Code Status</p>
                            <p className="text-xs text-gray-500">Enable/disable referral code for rewards & cashback missions</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setReferralCodeIsValid(!referralCodeIsValid)}
                            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                                referralCodeIsValid ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                            }`}
                        >
                            <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                    referralCodeIsValid ? "translate-x-6" : "translate-x-0"
                                }`}
                            />
                        </button>
                    </div>

                    {/* Wallet Cashback Adjustment */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                            Wallet Cashback Adjustment (₹)
                        </label>
                        <div className="relative">
                            <Wallet className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="number"
                                value={walletAdjustment}
                                onChange={(e) => setWalletAdjustment(e.target.value)}
                                placeholder="e.g. +500 or -200 (Current: ₹"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">Current Wallet Balance: ₹{user.walletBalance || user.wallet?.balance || 0}</p>
                    </div>

                    {/* Reset Active Cycle */}
                    <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                <RefreshCw className="w-4 h-4 text-amber-600" />
                                Reset Active Referral Cycle
                            </p>
                            <p className="text-xs text-gray-500">Expires current cycle and generates a fresh 30-day quest cycle</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={resetCycle}
                            onChange={(e) => setResetCycle(e.target.checked)}
                            className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-3 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-800">
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
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
