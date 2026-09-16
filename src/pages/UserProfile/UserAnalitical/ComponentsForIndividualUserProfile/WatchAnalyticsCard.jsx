import React, { useState } from 'react';

export default function WatchAnalyticsCard({ user }) {
    const { 
        totalWatchHours = "0.00", 
        totalFeedsWatched = 0, 
        todayFeedsWatched = 0, 
        topCategory = 'General', 
        categoryStats = [],
        recentViewedFeeds = []
    } = user?.watchAnalytics || {};

    const [copiedFeedId, setCopiedFeedId] = useState(null);

    const handleCopyFeedId = (feedId) => {
        if (!feedId) return;
        navigator.clipboard.writeText(feedId);
        setCopiedFeedId(feedId);
        setTimeout(() => setCopiedFeedId(null), 2000);
    };

    const formatDuration = (seconds) => {
        if (!seconds || seconds <= 0) return '0s';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2.5">
                    <span className="p-2 bg-red-50 text-red-500 rounded-xl">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </span>
                    Watch Analytics & Feed History
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {totalFeedsWatched} Total Feeds
                </span>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-linear-to-br from-blue-50 to-blue-100/50 p-3.5 rounded-xl border border-blue-200/60 shadow-xs">
                    <div className="text-2xl font-extrabold text-blue-700 mb-1">{totalFeedsWatched}</div>
                    <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Total Watched</div>
                </div>
                <div className="bg-linear-to-br from-emerald-50 to-emerald-100/50 p-3.5 rounded-xl border border-emerald-200/60 shadow-xs">
                    <div className="text-2xl font-extrabold text-emerald-700 mb-1">{todayFeedsWatched}</div>
                    <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Watched Today</div>
                </div>
                <div className="bg-linear-to-br from-amber-50 to-amber-100/50 p-3.5 rounded-xl border border-amber-200/60 shadow-xs">
                    <div className="text-2xl font-extrabold text-amber-700 mb-1">{totalWatchHours}h</div>
                    <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Watch Hours</div>
                </div>
                <div className="bg-linear-to-br from-indigo-50 to-indigo-100/50 p-3.5 rounded-xl border border-indigo-200/60 shadow-xs">
                    <div className="text-base font-extrabold text-indigo-900 mb-1 truncate" title={topCategory}>{topCategory}</div>
                    <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Top Category</div>
                </div>
            </div>

            {/* Category Preferences Breakdown */}
            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/70">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center justify-between">
                    <span>Category Preferences</span>
                    <span className="text-[10px] font-normal text-gray-500 lowercase">by view count</span>
                </h4>
                <div className="space-y-3">
                    {categoryStats && categoryStats.length > 0 ? (
                        categoryStats.map(([category, count], index) => {
                            const maxCount = categoryStats[0][1] || 1;
                            const percentage = Math.max(8, Math.round((count / maxCount) * 100));

                            return (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-gray-800 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                            {category}
                                        </span>
                                        <span className="text-gray-600 font-semibold">{count} {count === 1 ? 'view' : 'views'}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200/70 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                index === 0
                                                    ? 'bg-linear-to-r from-indigo-500 to-blue-500'
                                                    : 'bg-linear-to-r from-indigo-400 to-indigo-300'
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-3 text-gray-400 text-xs italic">
                            No category watch history available
                        </div>
                    )}
                </div>
            </div>

            {/* Watched Feeds & Video Details Stream */}
            <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center justify-between">
                    <span>Recent Watched Feeds & Videos</span>
                    <span className="text-[10px] font-semibold text-indigo-600">
                        {recentViewedFeeds?.length || 0} recent
                    </span>
                </h4>

                {recentViewedFeeds && recentViewedFeeds.length > 0 ? (
                    <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                        {recentViewedFeeds.map((item, idx) => (
                            <div
                                key={item._id || idx}
                                className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-gray-200/80 hover:border-indigo-300 hover:shadow-xs transition-all group"
                            >
                                {/* Media Thumbnail */}
                                <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative border border-gray-200 flex items-center justify-center">
                                    {item.mediaUrl ? (
                                        item.postType === 'video' || item.mediaUrl.endsWith('.mp4') ? (
                                            <div className="relative w-full h-full">
                                                <video
                                                    src={item.mediaUrl}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    preload="metadata"
                                                />
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ) : (
                                            <img
                                                src={item.mediaUrl}
                                                alt={item.title || "Feed"}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        )
                                    ) : (
                                        <span className="text-xl">
                                            {item.postType === 'video' ? '🎬' : '🖼️'}
                                        </span>
                                    )}

                                    {/* Duration Badge */}
                                    {item.watchDuration > 0 && (
                                        <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                                            {formatDuration(item.watchDuration)}
                                        </span>
                                    )}
                                </div>

                                {/* Feed Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h5 className="text-xs font-bold text-gray-900 truncate" title={item.title}>
                                            {item.title || "Untitled Post"}
                                        </h5>
                                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                            item.postType === 'video'
                                                ? 'bg-rose-100 text-rose-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {item.postType || 'post'}
                                        </span>
                                    </div>

                                    {/* Category & Date */}
                                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1">
                                        <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 font-semibold rounded text-[10px]">
                                            {item.category || "General"}
                                        </span>
                                        <span>•</span>
                                        <span className="text-[10px]">
                                            {item.viewedAt ? new Date(item.viewedAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'Recently'}
                                        </span>
                                    </div>

                                    {/* Feed ID with Copy Button */}
                                    {item.feedId && (
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                                            <span className="truncate max-w-[140px]">ID: {item.feedId}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyFeedId(item.feedId)}
                                                className="text-gray-400 hover:text-indigo-600 p-0.5 transition-colors"
                                                title="Copy Feed ID"
                                            >
                                                {copiedFeedId === item.feedId ? (
                                                    <span className="text-[9px] text-green-600 font-sans font-bold">Copied!</span>
                                                ) : (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                        <p className="text-gray-400 text-xs">No recent watched feeds or videos recorded</p>
                    </div>
                )}
            </div>
        </div>
    );
}
