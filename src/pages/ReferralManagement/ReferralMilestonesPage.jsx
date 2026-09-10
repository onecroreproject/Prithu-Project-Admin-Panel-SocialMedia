import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Award,
    Gift,
    Save,
    RotateCcw,
    ArrowLeft,
    Clock,
    CheckCircle2,
    Crown,
    Zap,
    Trophy,
    Medal,
    Star,
    Sparkles,
    Shield,
    Plus,
    Edit3,
    Trash2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import referralAdminService from "../../Services/referralAdminService";
import MilestoneModal from "./MilestoneModal";

const DEFAULT_MILESTONES = [
    { count: 5, reward: 100, title: "Bronze Starter", subtitle: "5 Qualified Referrals", icon: "seedling", badge: "Tier 1", isGrand: false },
    { count: 10, reward: 300, title: "Starter Goal", subtitle: "10 Qualified Referrals", icon: "bolt", badge: "Tier 2", isGrand: false },
    { count: 15, reward: 500, title: "Rising Star", subtitle: "15 Qualified Referrals", icon: "star", badge: "Tier 3", isGrand: false },
    { count: 20, reward: 700, title: "Silver Goal", subtitle: "20 Qualified Referrals", icon: "medal", badge: "Tier 4", isGrand: false },
    { count: 24, reward: 1000, title: "Gold Goal", subtitle: "24 Qualified Referrals", icon: "trophy", badge: "Tier 5", isGrand: false },
    { count: 25, reward: 2500, title: "Mega Reward", subtitle: "25 Qualified Referrals", icon: "crown", badge: "Mega Prize 🏆", isGrand: true }
];

export default function ReferralMilestonesPage() {
    const [milestones, setMilestones] = useState(DEFAULT_MILESTONES);
    const [rewardPerPerson, setRewardPerPerson] = useState(100);
    const [maxReferralsLimit, setMaxReferralsLimit] = useState(25);
    const [cycleDays, setCycleDays] = useState(30);
    const [qualifyingPlanPrice, setQualifyingPlanPrice] = useState(599);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        fetchMilestones();
    }, []);

    const fetchMilestones = async () => {
        setLoading(true);
        try {
            const data = await referralAdminService.getMilestones();
            if (data) {
                if (data.milestones?.length > 0) setMilestones(data.milestones);
                setRewardPerPerson(data.rewardPerPerson !== undefined ? data.rewardPerPerson : 100);
                setMaxReferralsLimit(data.maxReferralsLimit !== undefined ? data.maxReferralsLimit : 25);
                setCycleDays(data.cycleDays || 30);
                setQualifyingPlanPrice(data.qualifyingPlanPrice || 599);
            }
        } catch (err) {
            console.error("Error fetching milestones:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setSelectedMilestone(null);
        setEditIndex(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item, index) => {
        setSelectedMilestone(item);
        setEditIndex(index);
        setIsModalOpen(true);
    };

    const handleSaveMilestoneFromModal = (milestoneData) => {
        let updated = [...milestones];
        if (editIndex !== null) {
            updated[editIndex] = milestoneData;
            toast.success(`Updated ${milestoneData.title}`);
        } else {
            updated.push(milestoneData);
            toast.success(`Added new milestone: ${milestoneData.title}`);
        }
        // Sort by count ascending
        updated.sort((a, b) => a.count - b.count);
        setMilestones(updated);
    };

    const handleDeleteMilestone = (index) => {
        const item = milestones[index];
        if (!window.confirm(`Are you sure you want to delete milestone '${item.title}' (${item.count} referrals)?`)) return;
        const updated = milestones.filter((_, i) => i !== index);
        setMilestones(updated);
        toast.success("Milestone removed. Click Save Settings to persist.");
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await referralAdminService.updateMilestones({
                milestones,
                rewardPerPerson: Number(rewardPerPerson),
                maxReferralsLimit: Number(maxReferralsLimit),
                cycleDays: Number(cycleDays),
                qualifyingPlanPrice: Number(qualifyingPlanPrice)
            });
            toast.success("Referral & milestone rewards configuration saved successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    const handleResetToDefaults = () => {
        if (!window.confirm("Reset settings to standard configuration (₹100/person, max 25 persons, 30 days)?")) return;
        setMilestones(DEFAULT_MILESTONES);
        setRewardPerPerson(100);
        setMaxReferralsLimit(25);
        setCycleDays(30);
        setQualifyingPlanPrice(599);
        toast.success("Reset to default configuration. Click Save Settings to persist.");
    };

    const totalPotentialReward = milestones.reduce((sum, m) => sum + (Number(m.reward) || 0), 0);

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
                            <Trophy className="w-7 h-7 text-amber-500" />
                            Referral & Rewards Configuration
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                            Set reward per person (₹), max referral limits, quest cycle duration, and milestone tiers.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Create Milestone
                    </button>

                    <button
                        onClick={handleResetToDefaults}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset Defaults
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>

            {/* Settings Overview Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Per Person Reward */}
                <div className="p-5 bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-2xl shadow-md">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Per Person Reward</p>
                        <Gift className="w-5 h-5 text-amber-300" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-2xl font-black">₹</span>
                        <input
                            type="number"
                            value={rewardPerPerson}
                            onChange={(e) => setRewardPerPerson(e.target.value)}
                            min={1}
                            className="w-28 px-3 py-1.5 bg-white/20 border border-white/30 rounded-xl text-2xl font-black text-white text-center focus:ring-2 focus:ring-white outline-none"
                        />
                    </div>
                    <p className="text-xs text-emerald-100 mt-2">Reward earned per qualified friend (e.g. ₹100)</p>
                </div>

                {/* 2. Max Referrals Limit */}
                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
                        Max Referrals Limit
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            value={maxReferralsLimit}
                            onChange={(e) => setMaxReferralsLimit(e.target.value)}
                            min={1}
                            max={1000}
                            className="w-24 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-black text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Persons limit</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">Maximum referrals allowed per user (e.g. 25).</p>
                </div>

                {/* 3. Qualifying Plan Price */}
                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
                        Qualifying Plan Price (₹)
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            value={qualifyingPlanPrice}
                            onChange={(e) => setQualifyingPlanPrice(e.target.value)}
                            min={0}
                            className="w-24 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-black text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">₹ Min for VIP</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">Referred user must buy a VIP plan above this amount.</p>
                </div>

                {/* 4. Mode / Non-expiring status */}
                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
                        Referral Program Mode
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            ● Permanent / Non-Expiring
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">Referrals accumulate continuously without expiring.</p>
                </div>
            </div>

            {/* Milestones Edit Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Award className="w-5 h-5 text-indigo-600" />
                            Referral Milestone Ladder ({milestones.length} Tiers)
                        </h3>
                        <p className="text-xs text-gray-500">Live configuration synced with Mobile App quest ladder</p>
                    </div>

                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Tier
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-800 text-xs">
                            <tr>
                                <th className="px-6 py-4">Level / Tier</th>
                                <th className="px-6 py-4">Target Referrals</th>
                                <th className="px-6 py-4">Cashback Reward</th>
                                <th className="px-6 py-4">Milestone Title</th>
                                <th className="px-6 py-4">Badge</th>
                                <th className="px-6 py-4">Prize Type</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {milestones.map((m, idx) => (
                                <tr key={idx} className={m.isGrand ? "bg-amber-50/30 dark:bg-amber-950/10" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/30"}>
                                    {/* Level */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-bold flex items-center justify-center text-xs">
                                                {idx + 1}
                                            </span>
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                Tier {idx + 1}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Target Referrals */}
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg font-bold text-xs">
                                            {m.count} Referrals
                                        </span>
                                    </td>

                                    {/* Cashback Reward */}
                                    <td className="px-6 py-4">
                                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                                            ₹{Number(m.reward).toLocaleString()}
                                        </span>
                                    </td>

                                    {/* Milestone Title */}
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 dark:text-white text-xs">{m.title}</p>
                                        <p className="text-[11px] text-gray-400">{m.subtitle}</p>
                                    </td>

                                    {/* Badge */}
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            {m.badge || "Standard"}
                                        </span>
                                    </td>

                                    {/* Prize Type */}
                                    <td className="px-6 py-4">
                                        {m.isGrand ? (
                                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                                                <Crown className="w-3.5 h-3.5" /> Mega Prize
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium">Standard Tier</span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => handleOpenEditModal(m, idx)}
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-all"
                                                title="Edit Milestone"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMilestone(idx)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all"
                                                title="Delete Milestone"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Configuration"}
                    </button>
                </div>
            </div>

            {/* Create / Edit Milestone Modal */}
            <MilestoneModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                milestone={selectedMilestone}
                isEdit={editIndex !== null}
                onSave={handleSaveMilestoneFromModal}
            />
        </div>
    );
}
