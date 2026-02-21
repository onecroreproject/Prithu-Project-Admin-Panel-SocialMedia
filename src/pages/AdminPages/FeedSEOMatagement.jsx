import React, { useState, useEffect } from "react";
import {
    FileText, Search, Edit, CheckCircle, AlertCircle,
    RefreshCw, BarChart, ExternalLink, ArrowRight, Save, Image as ImageIcon
} from "lucide-react";
import SEOService from "../../Services/seoService";
import SEOPreview from "../../components/SEO/SEOPreview";
import { calculateSeoScore } from "../../utils/seoScorer";

const FeedSEOMatagement = () => {
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingFeed, setEditingFeed] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchFeeds();
    }, []);

    const fetchFeeds = async () => {
        try {
            setLoading(true);
            const response = await SEOService.getFeeds();
            if (response.success) {
                setFeeds(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch feeds", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (feed) => {
        setEditingFeed({
            ...feed,
            seoMetadata: feed.seoMetadata || {
                title: "",
                description: "",
                keywords: [],
                focusKeyword: "",
                slug: "",
                isIndexed: true,
                ogTitle: "",
                ogDescription: "",
                ogImage: feed.mediaUrl || "",
                jsonLd: "",
                seoScore: 0
            }
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await SEOService.updateFeedSeo(editingFeed._id, {
                seoMetadata: editingFeed.seoMetadata
            });
            if (response.success) {
                alert("Feed SEO saved!");
                setEditingFeed(null);
                fetchFeeds();
            }
        } catch (error) {
            alert("Failed to save Feed SEO");
        } finally {
            setSaving(false);
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
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold dark:text-white">Feed/Post SEO Management</h1>
                <p className="text-gray-500 dark:text-gray-400">Optimize individual posts and articles for search engines</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Feeds List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Published Feeds</h3>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-[600px] overflow-y-auto no-scrollbar">
                            {feeds.map((feed, index) => (
                                <button
                                    key={feed._id || index}
                                    onClick={() => handleEdit(feed)}
                                    className={`w-full p-4 flex gap-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors text-left ${editingFeed?._id === feed._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                >
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden border border-gray-100 dark:border-gray-700">
                                        {feed.mediaUrl ? (
                                            <img src={feed.mediaUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-full h-full p-3 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold dark:text-white truncate">{feed.caption || "Untitled Feed"}</h4>
                                        <p className="text-[10px] text-gray-400 mt-1">{new Date(feed.createdAt).toLocaleDateString()}</p>
                                        {feed.seoMetadata?.title ? (
                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-green-500 font-medium">
                                                <CheckCircle className="w-3 h-3" /> SEO Set
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-500 font-medium">
                                                <AlertCircle className="w-3 h-3" /> SEO Pending
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    {editingFeed ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <h3 className="text-lg font-bold dark:text-white">Edit SEO Settings</h3>
                                    <div className="flex gap-2">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${calculateSeoScore({
                                            title: editingFeed.seoMetadata?.title || "",
                                            description: editingFeed.seoMetadata?.description || "",
                                            focusKeyword: editingFeed.seoMetadata?.focusKeyword || "",
                                            slug: editingFeed.seoMetadata?.slug || ""
                                        }) >= 80 ? 'bg-green-50 text-green-600' : calculateSeoScore({
                                            title: editingFeed.seoMetadata?.title || "",
                                            description: editingFeed.seoMetadata?.description || "",
                                            focusKeyword: editingFeed.seoMetadata?.focusKeyword || "",
                                            slug: editingFeed.seoMetadata?.slug || ""
                                        }) >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                            Score: {calculateSeoScore({
                                                title: editingFeed.seoMetadata?.title || "",
                                                description: editingFeed.seoMetadata?.description || "",
                                                focusKeyword: editingFeed.seoMetadata?.focusKeyword || "",
                                                slug: editingFeed.seoMetadata?.slug || ""
                                            })}%
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">SEO Title</label>
                                                <span className={`text-[10px] ${(editingFeed.seoMetadata?.title?.length || 0) > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                                                    {editingFeed.seoMetadata?.title?.length || 0} / 60
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                value={editingFeed.seoMetadata?.title || ""}
                                                onChange={(e) => setEditingFeed({
                                                    ...editingFeed,
                                                    seoMetadata: { ...editingFeed.seoMetadata, title: e.target.value }
                                                })}
                                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Custom Slug</label>
                                            <input
                                                type="text"
                                                value={editingFeed.seoMetadata?.slug || ""}
                                                onChange={(e) => setEditingFeed({
                                                    ...editingFeed,
                                                    seoMetadata: { ...editingFeed.seoMetadata, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }
                                                })}
                                                placeholder="my-post-slug"
                                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">SEO Description</label>
                                            <span className={`text-[10px] ${editingFeed.seoMetadata.description?.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                                                {editingFeed.seoMetadata.description?.length || 0} / 160
                                            </span>
                                        </div>
                                        <textarea
                                            value={editingFeed.seoMetadata?.description || ""}
                                            onChange={(e) => setEditingFeed({
                                                ...editingFeed,
                                                seoMetadata: { ...editingFeed.seoMetadata, description: e.target.value }
                                            })}
                                            rows="3"
                                            className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Focus Keyword</label>
                                            <input
                                                type="text"
                                                value={editingFeed.seoMetadata?.focusKeyword || ""}
                                                onChange={(e) => setEditingFeed({
                                                    ...editingFeed,
                                                    seoMetadata: { ...editingFeed.seoMetadata, focusKeyword: e.target.value }
                                                })}
                                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Index Toggle</label>
                                            <div className="flex items-center gap-3 h-10">
                                                <span className="text-xs text-gray-500">Allow index?</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingFeed({
                                                        ...editingFeed,
                                                        seoMetadata: { ...editingFeed.seoMetadata, isIndexed: !editingFeed.seoMetadata.isIndexed }
                                                    })}
                                                    className={`w-12 h-6 rounded-full transition-colors relative ${editingFeed.seoMetadata.isIndexed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editingFeed.seoMetadata.isIndexed ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                                    >
                                        {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {saving ? "Saving..." : "Save Feed SEO"}
                                    </button>
                                </div>
                            </form>

                            {/* Real-time Preview */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                                    <ExternalLink className="w-5 h-5 text-purple-500" />
                                    Live Preview
                                </h3>
                                <SEOPreview
                                    title={editingFeed.seoMetadata?.title || ""}
                                    description={editingFeed.seoMetadata?.description || ""}
                                    url={`https://prithu.com/post/${editingFeed.seoMetadata?.slug || ""}`}
                                    ogImage={editingFeed.mediaUrl}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            <Search className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Select a feed to edit its SEO metadata</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedSEOMatagement;
