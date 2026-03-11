import React, { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/adminAuthContext";
import { getPromoDashboardStats, triggerPromoBatch, toggleCampaignStatus } from "../../Services/adminEmailService";
import { toast } from "react-hot-toast";
import { Mail, Users, Clock, Play, Pause, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function EmailManagementDashboard() {
    const { admin } = useAdminAuth();
    const token = admin?.token;
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await getPromoDashboardStats();
            setStats(response.data);
        } catch (error) {
            toast.error("Failed to fetch dashboard stats");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchStats();

        // Polling for real-time updates every 10 seconds
        const interval = setInterval(() => {
            if (token) fetchStats();
        }, 10000);

        return () => clearInterval(interval);
    }, [token]);

    const handleTriggerBatch = async () => {
        if (!window.confirm("Continue to trigger a new promotional batch for 1,000 eligible users?")) return;

        try {
            setTriggering(true);
            const response = await triggerPromoBatch();
            toast.success(`Batch triggered: ${response.processed} users added to queue`);
            fetchStats();
        } catch (error) {
            toast.error(error.message || "Failed to trigger batch");
        } finally {
            setTriggering(false);
        }
    };

    const handleToggleStatus = async () => {
        const newPauseState = !stats?.isPaused;
        const confirmMsg = newPauseState
            ? "Are you sure you want to PAUSE the promotional campaign? No automated emails will be sent."
            : "Resume the promotional campaign? Automated emails will start sending at the next scheduled time.";

        if (!window.confirm(confirmMsg)) return;

        try {
            const response = await toggleCampaignStatus(newPauseState);
            toast.success(response.message);
            setStats(prev => ({ ...prev, isPaused: response.isPaused }));
        } catch (error) {
            toast.error("Failed to update campaign status");
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Mail className="text-blue-600" /> Email Management Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">Real-time status of promotional campaigns and email delivery</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchStats}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Refresh Stats"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleToggleStatus}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg transition shadow-lg ${stats?.isPaused ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'}`}
                    >
                        {stats?.isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                        {stats?.isPaused ? 'Resume Campaign' : 'Pause Campaign'}
                    </button>
                    <button
                        onClick={handleTriggerBatch}
                        disabled={triggering || stats?.isPaused}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {triggering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play size={18} fill="currentColor" />}
                        Trigger Manual Batch
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<Users className="text-purple-600" />}
                    label="Eligible Users"
                    value={stats?.eligibleUsers || 0}
                    subLabel="Ready for next promo"
                    color="purple"
                />
                <StatCard
                    icon={<Clock className="text-blue-600" />}
                    label="Queue Waiting"
                    value={stats?.queue?.waiting || 0}
                    subLabel="Jobs pending"
                    color="blue"
                />
                <StatCard
                    icon={<RefreshCw className="text-orange-600" />}
                    label="Currently Processing"
                    value={stats?.queue?.active || 0}
                    subLabel="Active delivery"
                    color="orange"
                />
                <StatCard
                    icon={<CheckCircle className="text-green-600" />}
                    label="Completed Today"
                    value={stats?.queue?.completed || 0}
                    subLabel="Success delivery"
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Queue Health */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Queue Status</h2>
                    <div className="space-y-6">
                        <ProgressBar label="Completed" count={stats?.queue?.completed} total={calculateTotal(stats?.queue)} color="bg-green-500" />
                        <ProgressBar label="Waiting" count={stats?.queue?.waiting} total={calculateTotal(stats?.queue)} color="bg-blue-500" />
                        <ProgressBar label="Active" count={stats?.queue?.active} total={calculateTotal(stats?.queue)} color="bg-orange-500" />
                        <ProgressBar label="Failed" count={stats?.queue?.failed} total={calculateTotal(stats?.queue)} color="bg-red-500" />
                    </div>
                    {stats?.queue?.failed > 0 && (
                        <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-red-900">Delivery Errors Detected</h4>
                                <p className="text-xs text-red-700 mt-1">Some emails failed to deliver. The system will automatically retry failed attempts based on the worker configuration.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Campaign Info */}
                <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl">
                    <h2 className="text-xl font-bold mb-6">Campaign Settings</h2>
                    <ul className="space-y-4">
                        <li className="flex justify-between items-center py-3 border-b border-gray-800">
                            <span className="text-gray-400 text-sm">Target Window</span>
                            <span className="font-bold">Every {stats?.campaignWindowDays || 3} Days</span>
                        </li>
                        <li className="flex justify-between items-center py-3 border-b border-gray-800">
                            <span className="text-gray-400 text-sm">Batch Limit</span>
                            <span className="font-bold">1,000 / Day</span>
                        </li>
                        <li className="flex justify-between items-center py-3 border-b border-gray-800">
                            <span className="text-gray-400 text-sm">Schedule Time</span>
                            <span className="font-bold">10:00 AM Daily</span>
                        </li>
                        <li className="flex justify-between items-center py-3">
                            <span className="text-gray-400 text-sm">Template Rotation</span>
                            <span className="font-bold">1 - 10 Cycle</span>
                        </li>
                        <li className="flex justify-between items-center py-3 border-t border-gray-800">
                            <span className="text-gray-400 text-sm">Campaign Status</span>
                            <span className={`font-bold ${stats?.isPaused ? 'text-orange-400' : 'text-green-400'}`}>
                                {stats?.isPaused ? 'PAUSED' : 'RUNNING'}
                            </span>
                        </li>
                    </ul>
                    <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-xs text-blue-300 leading-relaxed">
                            The system automatically cycles through 10 distinct storytelling templates to maintain user engagement and social proof from real-time community statistics.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, subLabel, color }) {
    const colorClasses = {
        purple: "bg-purple-50 border-purple-100 text-purple-600",
        blue: "bg-blue-50 border-blue-100 text-blue-600",
        orange: "bg-orange-50 border-orange-100 text-orange-600",
        green: "bg-green-50 border-green-100 text-green-600"
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[color]}`}>
                {icon}
            </div>
            <h3 className="text-sm font-medium text-gray-500">{label}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{subLabel}</p>
        </motion.div>
    );
}

function ProgressBar({ label, count, total, color }) {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm font-bold text-gray-900">{(count || 0).toLocaleString()} <span className="text-gray-400 font-normal text-xs">({percentage.toFixed(1)}%)</span></span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    );
}

function calculateTotal(queue) {
    if (!queue) return 0;
    return (queue.waiting || 0) + (queue.active || 0) + (queue.completed || 0) + (queue.failed || 0) + (queue.delayed || 0);
}
