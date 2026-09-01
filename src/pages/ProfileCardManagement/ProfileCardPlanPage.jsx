import React, { useState, useEffect } from 'react';
import {
    Crown, Tag, DollarSign, Calendar, Sparkles, CheckCircle2,
    Plus, Trash2, Save, RefreshCw, ShieldCheck, Clock, Gift
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import {
    getProfileCardPlan,
    updateProfileCardPlan
} from '../../Services/profileCardAdminService';

export default function ProfileCardPlanPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState('Profile Card Pro Pass');
    const [price, setPrice] = useState(50);
    const [originalPrice, setOriginalPrice] = useState(199);
    const [durationDays, setDurationDays] = useState(30);
    const [badgeText, setBadgeText] = useState('POPULAR • 75% OFF');
    const [trialEnabled, setTrialEnabled] = useState(true);
    const [trialDurationDays, setTrialDurationDays] = useState(3);
    const [description, setDescription] = useState('Full access to 5 templates, custom theme colors, photo gallery, services, QR code & instant sharing for 30 days');
    const [features, setFeatures] = useState([
        'All 5 Premium Card Themes & Live Color Controls',
        'Unlock QR Code Image & Instant Sharing',
        'Services & Products Showcase (Unlimited)',
        'Photo Gallery & Showcase Images',
        '1-Tap WhatsApp, Direct Call & Google Maps Buttons',
        'vCard Contact Save (.VCF) Download',
        'Real-Time Page View Analytics'
    ]);
    const [newFeature, setNewFeature] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        fetchPlan();
    }, []);

    const fetchPlan = async () => {
        try {
            setLoading(true);
            const res = await getProfileCardPlan();
            if (res.success && res.data) {
                const p = res.data;
                setName(p.name || 'Profile Card Pro Pass');
                setPrice(p.price !== undefined ? p.price : 50);
                setOriginalPrice(p.originalPrice || 199);
                setDurationDays(p.durationDays || 30);
                setBadgeText(p.badgeText || 'POPULAR • 75% OFF');
                setTrialEnabled(p.trialEnabled !== undefined ? p.trialEnabled : true);
                setTrialDurationDays(p.trialDurationDays || 3);
                setDescription(p.description || '');
                if (p.features && p.features.length > 0) {
                    setFeatures(p.features);
                }
                setIsActive(p.isActive !== undefined ? p.isActive : true);
            }
        } catch (err) {
            console.error('Error fetching plan:', err);
            toast.error('Failed to load plan configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFeature = () => {
        if (!newFeature.trim()) return;
        setFeatures([...features, newFeature.trim()]);
        setNewFeature('');
    };

    const handleRemoveFeature = (index) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name,
                price: Number(price),
                originalPrice: Number(originalPrice),
                durationDays: Number(durationDays),
                badgeText,
                trialEnabled,
                trialDurationDays: Number(trialDurationDays),
                description,
                features,
                isActive
            };

            const res = await updateProfileCardPlan(payload);
            if (res.success) {
                toast.success(`Plan updated! Price: ₹${price} • Trial: ${trialEnabled ? `${trialDurationDays} Days Free` : 'Disabled'}`);
            } else {
                toast.error(res.message || 'Failed to update plan');
            }
        } catch (err) {
            console.error('Error saving plan:', err);
            toast.error(err.response?.data?.message || 'Failed to save plan');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
                        <Crown className="w-7 h-7 text-amber-500" />
                        Profile Card Subscription Plan & Free Trial
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Configure the 3-day free trial, ₹50 1-year pass pricing, discount badges, and feature access.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchPlan}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Plan & Trial Changes'}
                    </button>
                </div>
            </div>

            {/* Live Visual Preview & Edit Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Configuration Form (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                    {/* Free Trial Settings Card */}
                    <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/30 dark:via-gray-800 dark:to-gray-800 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <Gift className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                                        Free Trial Configuration
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Give new users full access to all features before prompting payment
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setTrialEnabled(!trialEnabled)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors ${
                                    trialEnabled
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                {trialEnabled ? 'Trial Active' : 'Trial Disabled'}
                            </button>
                        </div>

                        {trialEnabled && (
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Trial Duration (Days)
                                    </label>
                                    <div className="relative">
                                        <Clock className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="number"
                                            value={trialDurationDays}
                                            onChange={(e) => setTrialDurationDays(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-900 border border-emerald-300 dark:border-emerald-700 rounded-xl text-sm font-black text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 leading-tight">
                                        ✨ Users enjoy 100% unlocked sharing, QR code & 5 themes for <b>{trialDurationDays} Days</b>.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Paid Plan Pricing Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                            <Tag className="w-4 h-4 text-emerald-600" />
                            1-Year Pro Pass Details & Pricing
                        </h3>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                Plan Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Selling Price (₹) <span className="text-emerald-600">*Current Active</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-700 rounded-xl text-lg font-black text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Original Price (₹) <span className="text-gray-400">(Strikethrough)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        value={originalPrice}
                                        onChange={(e) => setOriginalPrice(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Validity Duration (Days)
                                </label>
                                <input
                                    type="number"
                                    value={durationDays}
                                    onChange={(e) => setDurationDays(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Discount Badge Tag
                                </label>
                                <input
                                    type="text"
                                    value={badgeText}
                                    onChange={(e) => setBadgeText(e.target.value)}
                                    placeholder="POPULAR • 75% OFF"
                                    className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                Subtitle Description
                            </label>
                            <textarea
                                rows={2}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>

                        {/* Active status */}
                        <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                            <div>
                                <p className="font-bold text-sm text-gray-900 dark:text-white">Active for Mobile Users</p>
                                <p className="text-xs text-gray-500">Allow users to see and purchase this plan in app</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsActive(!isActive)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                                    isActive
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                {isActive ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>
                    </div>

                    {/* Features List Editor */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            Plan Features Included
                        </h3>

                        {/* Add Feature Row */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add new feature bullet point..."
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                                className="flex-1 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleAddFeature}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add
                            </button>
                        </div>

                        {/* List of features */}
                        <div className="space-y-2 pt-2">
                            {features.map((feat, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/60 text-xs"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{feat}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFeature(idx)}
                                        className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Live Mobile Paywall Preview (5 cols) */}
                <div className="lg:col-span-5 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        📱 Live Mobile Paywall Preview
                    </p>

                    <div className="bg-emerald-950 rounded-3xl p-6 text-white shadow-2xl border border-emerald-800 relative overflow-hidden">
                        {/* Background Accents */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none"></div>

                        {trialEnabled && (
                            <div className="mb-4 bg-emerald-900/80 border border-emerald-600/60 rounded-2xl p-3 flex items-center gap-2.5">
                                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                                <div className="text-[11px]">
                                    <span className="font-bold text-amber-300">⏳ {trialDurationDays}-Day Free Trial Active</span>
                                    <p className="text-emerald-200/70 text-[10px]">All functions unlocked during trial period</p>
                                </div>
                            </div>
                        )}

                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-amber-400/40 text-amber-400 mb-1">
                                <Crown className="w-6 h-6" />
                            </div>

                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black tracking-wider uppercase border border-emerald-400/30">
                                    {badgeText || 'SPECIAL OFFER'}
                                </span>
                            </div>

                            <h4 className="text-xl font-black">{name}</h4>
                            <p className="text-xs text-emerald-200/80 leading-relaxed px-2">
                                {description}
                            </p>

                            {/* Price Badge */}
                            <div className="inline-flex items-center gap-2 bg-black/40 px-4 py-2 rounded-2xl border border-white/10 my-2">
                                <span className="text-2xl font-black text-white">₹{price}</span>
                                {originalPrice && (
                                    <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
                                )}
                                <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-md">
                                    {durationDays} Days
                                </span>
                            </div>
                        </div>

                        {/* Features Preview List */}
                        <div className="mt-5 space-y-2.5 border-t border-emerald-800/60 pt-4">
                            <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                                Included Features:
                            </p>
                            {features.slice(0, 6).map((feat, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-emerald-100">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span className="truncate">{feat}</span>
                                </div>
                            ))}
                        </div>

                        {/* Unlock Button */}
                        <div className="mt-6 pt-3">
                            <div className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black rounded-xl text-center text-sm shadow-lg shadow-emerald-500/30 cursor-default">
                                Unlock 30-Day Pass for ₹{price}
                            </div>
                            <p className="text-[10px] text-center text-emerald-400/70 mt-2">
                                🔒 100% Secure • Instant Unlock in Prithu App
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
