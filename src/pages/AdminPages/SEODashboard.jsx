import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from "recharts";
import {
    Search, Globe, AlertTriangle, CheckCircle, FileText,
    ArrowRight, ExternalLink, RefreshCw
} from "lucide-react";
import SEOService from "../../Services/seoService";

const SEODashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await SEOService.getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch SEO stats", error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, color, description }) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <h3 className="text-2xl font-bold dark:text-white">{value}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            {description && <p className="text-xs text-gray-400 mt-2">{description}</p>}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const { stats: s, googleData } = stats || {};

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">SEO Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">Monitor your website's search performance</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-500/25"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Stats
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={Globe}
                    label="Total Indexed Pages"
                    value={s?.totalIndexedPages || 0}
                    color="bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Missing Meta Titles"
                    value={s?.pagesMissingTitle || 0}
                    color="bg-red-50 text-red-600 dark:bg-red-900/20"
                    description="Pages needing optimization"
                />
                <StatCard
                    icon={FileText}
                    label="Sitemap Status"
                    value={s?.sitemapLastGenerated ? "Generated" : "Pending"}
                    color="bg-green-50 text-green-600 dark:bg-green-900/20"
                    description={s?.sitemapLastGenerated ? `Last updated: ${new Date(s.sitemapLastGenerated).toLocaleDateString()}` : "Not yet generated"}
                />
                <StatCard
                    icon={CheckCircle}
                    label="Avg. SEO Score"
                    value={`${s?.averageSeoScore || 0}%`}
                    color="bg-purple-50 text-purple-600 dark:bg-purple-900/20"
                    description="Overall optimization level"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Google Search Console - Impressions (Placeholder if no data) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-500" />
                        Top Performance Queries
                    </h3>
                    {googleData?.rows ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-500 border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="py-3 font-medium">Query</th>
                                        <th className="py-3 font-medium">Clicks</th>
                                        <th className="py-3 font-medium">Impressions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                    {googleData.rows.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="py-3 dark:text-gray-300">{row.keys[0]}</td>
                                            <td className="py-3 font-medium dark:text-white">{row.clicks}</td>
                                            <td className="py-3 text-gray-500">{row.impressions}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-full mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                                Google Search Console data is not connected. Connect in settings to see real performance.
                            </p>
                        </div>
                    )}
                </div>

                {/* Missing Optimization List */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Critical Issues
                    </h3>
                    <div className="space-y-4">
                        {s?.pagesMissingTitle > 0 && (
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                <div className="mt-1">
                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400">Missing Title Tags</h4>
                                    <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                                        {s.pagesMissingTitle} pages are missing meta titles. This significantly impacts search visibility.
                                    </p>
                                </div>
                                <button className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                                    Fix Now <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        )}

                        {s?.redirectsActive > 0 && (
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                <div className="mt-1">
                                    <RefreshCw className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-400">Active Redirects</h4>
                                    <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">
                                        You have {s.redirectsActive} active URL redirects. Ensure they are monitored for performance.
                                    </p>
                                </div>
                            </div>
                        )}

                        {!s?.sitemapLastGenerated && (
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                <div className="mt-1">
                                    <Globe className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-400">Generate Sitemap</h4>
                                    <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">
                                        Generate your first sitemap to help search engines index your content faster.
                                    </p>
                                </div>
                                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                    Generate <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SEODashboard;
