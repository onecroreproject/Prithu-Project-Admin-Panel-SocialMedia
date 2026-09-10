import React from "react";
import { Globe, Search, Facebook, MessageSquare } from "lucide-react";

/**
 * Live SEO Preview Component
 * Shows how the page will look on Google and Social Media
 */
const SEOPreview = ({ title, description, url, ogImage }) => {
    const displayUrl = url ? url : "https://prithu.com/your-page-slug";
    const displayTitle = title ? title : "Your Page Title - Prithu";
    const displayDesc = description ? description : "Provide a meta description to see how your page appears in search results. A good description should be between 140-160 characters.";

    return (
        <div className="space-y-8">
            {/* Google Preview */}
            <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Search className="w-4 h-4" /> Google Search Preview
                </h4>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm max-w-2xl">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <Globe className="w-3 h-3 text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{displayUrl}</span>
                    </div>
                    <h3 className="text-xl text-blue-700 dark:text-blue-400 hover:underline cursor-pointer font-medium mb-1">
                        {displayTitle}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {displayDesc}
                    </p>
                </div>
            </div>

            {/* Social Media Preview (Facebook/WhatsApp) */}
            <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Facebook className="w-4 h-4" /> Social Media Preview
                </h4>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden max-w-md">
                    {ogImage ? (
                        <img src={ogImage} alt="OG Preview" className="w-full h-48 object-cover" />
                    ) : (
                        <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                            <Globe className="w-12 h-12 opacity-20" />
                        </div>
                    )}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">PRITHU.COM</span>
                        <h4 className="font-bold text-gray-900 dark:text-white mt-1 truncate">{displayTitle}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{displayDesc}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SEOPreview;
