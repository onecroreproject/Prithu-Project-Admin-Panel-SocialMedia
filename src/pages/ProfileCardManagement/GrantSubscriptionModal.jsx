import React, { useState } from 'react';
import { X, Crown, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { grantProfileCardSubscription } from '../../Services/profileCardAdminService';

export default function GrantSubscriptionModal({
    isOpen,
    onClose,
    card,
    onSuccess
}) {
    if (!isOpen || !card) return null;

    const [durationDays, setDurationDays] = useState(30);
    const [grant, setGrant] = useState(true);
    const [amountPaid, setAmountPaid] = useState(50);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await grantProfileCardSubscription({
                cardId: card._id,
                userId: card.userId?._id || card.userId,
                durationDays: Number(durationDays),
                grant,
                amountPaid: Number(amountPaid)
            });

            if (res.success) {
                toast.success(grant ? 'Subscription granted successfully!' : 'Subscription revoked!');
                if (onSuccess) onSuccess();
                onClose();
            } else {
                toast.error(res.message || 'Operation failed');
            }
        } catch (err) {
            console.error('Grant subscription error:', err);
            toast.error(err.response?.data?.message || 'Failed to update subscription');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <Crown className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                Manage Subscription
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {card.businessName || 'Profile Card'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Action
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setGrant(true)}
                                className={`py-2.5 px-3 rounded-xl font-medium text-xs border transition-all flex items-center justify-center gap-2 ${
                                    grant
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Grant / Extend
                            </button>
                            <button
                                type="button"
                                onClick={() => setGrant(false)}
                                className={`py-2.5 px-3 rounded-xl font-medium text-xs border transition-all flex items-center justify-center gap-2 ${
                                    !grant
                                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                <AlertCircle className="w-4 h-4" />
                                Revoke Access
                            </button>
                        </div>
                    </div>

                    {grant && (
                        <>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Validity Duration (Days)
                                </label>
                                <select
                                    value={durationDays}
                                    onChange={(e) => setDurationDays(Number(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    <option value={30}>30 Days (1 Month)</option>
                                    <option value={90}>90 Days (3 Months)</option>
                                    <option value={180}>180 Days (6 Months)</option>
                                    <option value={365}>365 Days (1 Year)</option>
                                    <option value={730}>730 Days (2 Years)</option>
                                    <option value={3650}>Lifetime (10 Years)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Amount Credited (₹)
                                </label>
                                <input
                                    type="number"
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                        </>
                    )}

                    <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 ${
                                grant
                                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                            }`}
                        >
                            {submitting ? 'Saving...' : grant ? 'Save Subscription' : 'Confirm Revoke'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
