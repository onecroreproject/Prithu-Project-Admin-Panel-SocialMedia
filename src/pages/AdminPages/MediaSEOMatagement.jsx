import React, { useState, useEffect } from "react";
import {
    Image as ImageIcon, Search, Edit, CheckCircle, AlertCircle,
    RefreshCw, FileText, Download, Trash2, Maximize2, Zap
} from "lucide-react";
import SEOService from "../../Services/seoService";

const MediaSEOMatagement = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, image, video

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const response = await SEOService.getMedia();
            if (response.success) {
                setMedia(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch media", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMedia = media.filter(m => {
        if (filter === "all") return true;
        return m.type === filter;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Media SEO Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage alt text and optimization for uploaded images and videos</p>
                </div>
                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        All Media
                    </button>
                    <button
                        onClick={() => setFilter("image")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'image' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        Images
                    </button>
                    <button
                        onClick={() => setFilter("video")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'video' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        Videos
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredMedia.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-400">No media found for this filter.</p>
                        </div>
                    ) : (
                        filteredMedia.map((m) => (
                            <div key={m.id} className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
                                    {m.type === 'image' ? (
                                        <img src={m.url} alt={m.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                            <video src={m.url} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                                    <Zap className="w-5 h-5 fill-current" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                        <button className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm hover:bg-white dark:hover:bg-gray-700 text-blue-500">
                                            <Maximize2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{m.type}</p>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate mt-0.5">{m.alt || "No Alt Text"}</p>
                                        </div>
                                        {!m.alt && (
                                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" title="Missing Alt Text" />
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400">
                                        <span>{m.size ? `${(m.size / 1024).toFixed(1)} KB` : 'N/A'}</span>
                                        <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <div className="pt-2 flex gap-2">
                                        <button className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                                            <Edit className="w-3 h-3" /> Edit Alt
                                        </button>
                                        <button className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 transition-colors" title="Compress Image">
                                            <Zap className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default MediaSEOMatagement;
