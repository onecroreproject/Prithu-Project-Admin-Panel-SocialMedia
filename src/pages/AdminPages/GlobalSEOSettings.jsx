import React, { useState, useEffect } from "react";
import { Save, RefreshCw, Upload, FileText, Check, AlertCircle ,Globe,Search} from "lucide-react";
import SEOService from "../../Services/seoService";

const GlobalSEOSettings = () => {
    const [config, setConfig] = useState({
        siteName: "",
        siteDescription: "",
        defaultKeywords: [],
        author: "",
        canonicalUrl: "",
        googleAnalyticsId: "",
        googleTagManagerId: "",
        googleSearchConsoleCode: "",
        robotsTxt: "",
        googleCredentials: null
    });
    const [keywordsInput, setKeywordsInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const response = await SEOService.getConfig();
            if (response.success) {
                setConfig(response.data);
                setKeywordsInput(response.data.defaultKeywords?.join(", ") || "");
            }
        } catch (error) {
            console.error("Failed to fetch SEO config", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const updatedConfig = {
                ...config,
                defaultKeywords: keywordsInput.split(",").map(k => k.trim()).filter(k => k !== "")
            };
            const response = await SEOService.updateConfig(updatedConfig);
            if (response.success) {
                setStatus({ type: "success", message: "Settings updated successfully" });
                setTimeout(() => setStatus(null), 3000);
            }
        } catch (error) {
            setStatus({ type: "error", message: error.response?.data?.message || "Failed to update settings" });
        } finally {
            setSaving(false);
        }
    };

    const handleGoogleJsonUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target.result);
                    setConfig({ ...config, googleCredentials: json });
                } catch (err) {
                    alert("Invalid JSON file");
                }
            };
            reader.readAsText(file);
        }
    };

    const handleGenerateSitemap = async () => {
        try {
            const response = await SEOService.generateSitemap();
            if (response.success) {
                alert("Sitemap generated and saved to server.");
            }
        } catch (error) {
            alert("Sitemap generation failed.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold dark:text-white">Global SEO Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Configure site-wide SEO metadata and technical tools</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-8">
                {/* General Info */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                        Website Metadata
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium dark:text-gray-300">Website Name</label>
                            <input
                                type="text"
                                value={config.siteName}
                                onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium dark:text-gray-300">Author Name</label>
                            <input
                                type="text"
                                value={config.author}
                                onChange={(e) => setConfig({ ...config, author: e.target.value })}
                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium dark:text-gray-300">Meta Description</label>
                            <textarea
                                value={config.siteDescription}
                                onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                                rows="3"
                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium dark:text-gray-300">Default Keywords (comma separated)</label>
                            <input
                                type="text"
                                value={keywordsInput}
                                onChange={(e) => setKeywordsInput(e.target.value)}
                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium dark:text-gray-300">Canonical URL</label>
                            <input
                                type="url"
                                value={config.canonicalUrl}
                                onChange={(e) => setConfig({ ...config, canonicalUrl: e.target.value })}
                                placeholder="https://example.com"
                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </section>

                {/* Tracking & Verification */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                        <Search className="w-5 h-5 text-purple-500" />
                        Google Integration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium dark:text-gray-300">Google Analytics ID</label>
                            <input
                                type="text"
                                value={config.googleAnalyticsId}
                                onChange={(e) => setConfig({ ...config, googleAnalyticsId: e.target.value })}
                                placeholder="G-XXXXXXXXXX"
                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium dark:text-gray-300">Tag Manager ID</label>
                            <input
                                type="text"
                                value={config.googleTagManagerId}
                                onChange={(e) => setConfig({ ...config, googleTagManagerId: e.target.value })}
                                placeholder="GTM-XXXXXXX"
                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium dark:text-gray-300">Search Console Verification Code</label>
                            <input
                                type="text"
                                value={config.googleSearchConsoleCode}
                                onChange={(e) => setConfig({ ...config, googleSearchConsoleCode: e.target.value })}
                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/20">
                            <label className="text-sm font-bold dark:text-purple-400 flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Google Service Account JSON
                            </label>
                            <p className="text-xs text-purple-700 dark:text-purple-500 mb-3">
                                Upload your service account JSON file to enable real-time dashboard data.
                            </p>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleGoogleJsonUpload}
                                className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                            {config.googleCredentials && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-green-600 font-medium">
                                    <Check className="w-4 h-4" /> File attached
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Technical SEO */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-amber-500" />
                        Technical Tools
                    </h2>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium dark:text-gray-300">Robots.txt Editor</label>
                                <button
                                    type="button"
                                    onClick={() => SEOService.updateRobots(config.robotsTxt)}
                                    className="text-xs font-bold text-blue-600 hover:underline"
                                >
                                    Publish file
                                </button>
                            </div>
                            <textarea
                                value={config.robotsTxt}
                                onChange={(e) => setConfig({ ...config, robotsTxt: e.target.value })}
                                rows="5"
                                className="w-full px-4 py-2 border font-mono text-sm rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400">XML Sitemap</h4>
                                <p className="text-xs text-amber-700 dark:text-amber-500">Automatically generate a sitemap based on your pages and feeds.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleGenerateSitemap}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all shadow-md"
                            >
                                <FileText className="w-4 h-4" />
                                Generate
                            </button>
                        </div>
                    </div>
                </section>

                {/* Submit Block */}
                <div className="flex items-center justify-between sticky bottom-6 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                    {status && (
                        <div className={`text-sm font-medium flex items-center gap-2 ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {status.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {status.message}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="ml-auto flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GlobalSEOSettings;
