import React, { useState, useEffect } from "react";
import { X, Award, Gift, Trophy, Star, Zap, Crown, Sparkles, Medal } from "lucide-react";

const ICON_OPTIONS = [
    { label: "Crown (Mega)", value: "crown", icon: Crown },
    { label: "Trophy (Gold)", value: "trophy", icon: Trophy },
    { label: "Medal (Silver)", value: "medal", icon: Medal },
    { label: "Star (Rising)", value: "star", icon: Star },
    { label: "Bolt (Starter)", value: "bolt", icon: Zap },
    { label: "Seedling (Bronze)", value: "seedling", icon: Award },
    { label: "Gift (Special)", value: "gift", icon: Gift },
];

export default function MilestoneModal({ isOpen, onClose, milestone, isEdit, onSave }) {
    const [count, setCount] = useState(5);
    const [reward, setReward] = useState(100);
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [badge, setBadge] = useState("");
    const [icon, setIcon] = useState("trophy");
    const [isGrand, setIsGrand] = useState(false);

    useEffect(() => {
        if (milestone) {
            setCount(milestone.count || 5);
            setReward(milestone.reward || 100);
            setTitle(milestone.title || "");
            setSubtitle(milestone.subtitle || `${milestone.count || 5} Qualified Referrals`);
            setBadge(milestone.badge || "");
            setIcon(milestone.icon || "trophy");
            setIsGrand(!!milestone.isGrand);
        } else {
            setCount(5);
            setReward(100);
            setTitle("New Milestone");
            setSubtitle("5 Qualified Referrals");
            setBadge("Tier");
            setIcon("trophy");
            setIsGrand(false);
        }
    }, [milestone, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            count: Number(count),
            reward: Number(reward),
            title: title.trim() || `Reach ${count} Referrals`,
            subtitle: subtitle.trim() || `${count} Qualified Referrals`,
            badge: badge.trim() || (isGrand ? "Mega Prize 🏆" : "Tier"),
            icon,
            isGrand
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/40">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isGrand ? "bg-amber-500/10 text-amber-500" : "bg-indigo-500/10 text-indigo-600"
                        }`}>
                            {isGrand ? <Crown className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {isEdit ? "Edit Milestone Tier" : "Create New Milestone Tier"}
                            </h3>
                            <p className="text-xs text-gray-500">Configure target referral count & cashback prize</p>
                        </div>
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
                    <div className="grid grid-cols-2 gap-4">
                        {/* Target Referrals */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Referrals Required
                            </label>
                            <input
                                type="number"
                                required
                                min={1}
                                max={100}
                                value={count}
                                onChange={(e) => {
                                    setCount(e.target.value);
                                    if (!subtitle || subtitle.includes("Qualified Referrals")) {
                                        setSubtitle(`${e.target.value} Qualified Referrals`);
                                    }
                                }}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Cashback Reward */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Cashback Reward (₹)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-emerald-600">₹</span>
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    value={reward}
                                    onChange={(e) => setReward(e.target.value)}
                                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-black text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Milestone Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                            Milestone Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Bronze Starter, Starter Goal, Mega Reward"
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* Milestone Subtitle */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                            Subtitle / Description
                        </label>
                        <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="e.g. 5 Qualified Referrals"
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* Badge & Icon */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Badge Label
                            </label>
                            <input
                                type="text"
                                value={badge}
                                onChange={(e) => setBadge(e.target.value)}
                                placeholder="e.g. Tier 1, Mega Prize 🏆"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Theme Icon
                            </label>
                            <select
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {ICON_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Mega Prize Toggle */}
                    <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Mega Reward / Grand Prize Tier</p>
                                <p className="text-xs text-gray-500">Highlights card with premium gold gradients in user app</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={isGrand}
                            onChange={(e) => setIsGrand(e.target.checked)}
                            className="w-5 h-5 text-amber-500 rounded border-gray-300 focus:ring-amber-400"
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
                            className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
                        >
                            {isEdit ? "Update Tier" : "Add Tier"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
