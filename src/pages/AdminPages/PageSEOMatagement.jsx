import React, { useState, useEffect } from "react";
import {
    FileText, Search, Edit, CheckCircle, AlertCircle,
    RefreshCw, BarChart, ExternalLink, ArrowRight, Save, Image as ImageIcon
} from "lucide-react";
import SEOService from "../../Services/seoService";
import SEOPreview from "../../components/SEO/SEOPreview";
import { calculateSeoScore } from "../../Utils/seoScorer";

const PageSEOMatagement = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPage, setEditingPage] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const response = await SEOService.getPages();
            if (response.success) {
                setPages(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch pages", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (page) => {
        setEditingPage({
            ...page,
            seo: page.seo || {
                metaTitle: "",
                metaDescription: "",
                focusKeyword: "",
                canonicalUrl: "",
                isIndexed: true,
                ogTitle: "",
                ogDescription: "",
                ogImage: "",
                twitterCard: "summary_large_image",
                jsonLd: ""
            }
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await SEOService.updatePageSeo(editingPage.slug, {
                seo: editingPage.seo
            });
            if (response.success) {
                alert("SEO settings saved!");
                setEditingPage(null);
                fetchPages();
            }
        } catch (error) {
            alert("Failed to save SEO settings");
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Page-Level SEO</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage SEO metadata for your static pages</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pages List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <h3 className="font-bold text-sm dark:text-white uppercase tracking-wider">Static Pages</h3>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-[600px] overflow-y-auto no-scrollbar">
                            {pages.map((page, index) => (
                                <button
                                    key={page._id || index}
                                    onClick={() => handleEdit(page)}
                                    className={`w-full flex items-center justify-between p-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors text-left ${editingPage?._id === page._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold dark:text-white truncate max-w-[150px]">{page.title}</h4>
                                            <p className="text-[10px] text-gray-400 font-mono">/{page.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {page.seo?.metaTitle && page.seo?.metaDescription ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-amber-500" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    {editingPage ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                    <Edit className="w-5 h-5 text-blue-500" />
                                    Edit SEO: <span className="text-blue-600">{editingPage.title}</span>
                                </h3>
                                <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${calculateSeoScore({
                                    title: editingPage.seo?.metaTitle || "",
                                    description: editingPage.seo?.metaDescription || "",
                                    focusKeyword: editingPage.seo?.focusKeyword || "",
                                    slug: editingPage.slug || ""
                                }) >= 80 ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'}`}>
                                    Score: {calculateSeoScore({
                                        title: editingPage.seo?.metaTitle || "",
                                        description: editingPage.seo?.metaDescription || "",
                                        focusKeyword: editingPage.seo?.focusKeyword || "",
                                        slug: editingPage.slug || ""
                                    })}%
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-8">
                                {/* Basic SEO */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-sm font-medium dark:text-gray-300">Meta Title</label>
                                                <span className={`text-[10px] ${(editingPage.seo?.metaTitle?.length || 0) > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                                                    {editingPage.seo?.metaTitle?.length || 0} / 60
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                value={editingPage.seo?.metaTitle || ""}
                                                onChange={(e) => setEditingPage({
                                                    ...editingPage,
                                                    seo: { ...editingPage.seo, metaTitle: e.target.value }
                                                })}
                                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium dark:text-gray-300">Focus Keyword</label>
                                            <input
                                                type="text"
                                                value={editingPage.seo?.focusKeyword || ""}
                                                onChange={(e) => setEditingPage({
                                                    ...editingPage,
                                                    seo: { ...editingPage.seo, focusKeyword: e.target.value }
                                                })}
                                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-sm font-medium dark:text-gray-300">Meta Description</label>
                                            <span className={`text-[10px] ${(editingPage.seo?.metaDescription?.length || 0) > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                                                {editingPage.seo?.metaDescription?.length || 0} / 160
                                            </span>
                                        </div>
                                        <textarea
                                            value={editingPage.seo?.metaDescription || ""}
                                            onChange={(e) => setEditingPage({
                                                ...editingPage,
                                                seo: { ...editingPage.seo, metaDescription: e.target.value }
                                            })}
                                            rows="3"
                                            className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Social SEO */}
                                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl space-y-6">
                                    <h4 className="text-sm font-bold dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        <BarChart className="w-4 h-4 text-purple-500" />
                                        Social Sharing (Open Graph)
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium dark:text-gray-300">OG Title</label>
                                            <input
                                                type="text"
                                                value={editingPage.seo.ogTitle}
                                                onChange={(e) => setEditingPage({
                                                    ...editingPage,
                                                    seo: { ...editingPage.seo, ogTitle: e.target.value }
                                                })}
                                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium dark:text-gray-300">OG Image URL</label>
                                            <input
                                                type="text"
                                                value={editingPage.seo.ogImage}
                                                onChange={(e) => setEditingPage({
                                                    ...editingPage,
                                                    seo: { ...editingPage.seo, ogImage: e.target.value }
                                                })}
                                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-medium dark:text-gray-300">OG Description</label>
                                            <textarea
                                                value={editingPage.seo.ogDescription}
                                                onChange={(e) => setEditingPage({
                                                    ...editingPage,
                                                    seo: { ...editingPage.seo, ogDescription: e.target.value }
                                                })}
                                                rows="2"
                                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold dark:text-gray-400">Index this page?</span>
                                        <button
                                            type="button"
                                            onClick={() => setEditingPage({
                                                ...editingPage,
                                                seo: { ...editingPage.seo, isIndexed: !editingPage.seo.isIndexed }
                                            })}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${editingPage.seo.isIndexed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editingPage.seo.isIndexed ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
                                    >
                                        {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {saving ? "Saving..." : "Save SEO Details"}
                                    </button>
                                </div>

                                {/* Live Preview */}
                                <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-bold dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4 text-blue-500" />
                                        Search Engine Preview
                                    </h4>
                                    <SEOPreview
                                        title={editingPage.seo.metaTitle}
                                        description={editingPage.seo.metaDescription}
                                        url={`https://prithu.com/${editingPage.slug}`}
                                        ogImage={editingPage.seo.ogImage}
                                    />
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold dark:text-white">Select a Page</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xs mt-2">
                                Click on a page from the list to manage its individual SEO metadata.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageSEOMatagement;
