import React from 'react';

export default function WatchAnalyticsCard({ user }) {
    const { totalWatchHours = 0, topCategory = 'N/A', categoryStats = [] } = user.watchAnalytics || {};

    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-6 text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Analytics
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <div className="text-2xl font-bold text-red-600 mb-1">{totalWatchHours}</div>
                    <div className="text-xs font-medium text-red-400 uppercase tracking-wider">Total Watch Hours</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="text-lg font-bold text-indigo-900 mb-1 truncate" title={topCategory}>{topCategory}</div>
                    <div className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Top Category</div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Content Preferences</h4>
                <div className="space-y-4">
                    {categoryStats.length > 0 ? (
                        categoryStats.map(([category, count], index) => {
                            // Calculate percentage relative to the top category
                            const maxCount = categoryStats[0][1];
                            const percentage = Math.round((count / maxCount) * 100);

                            return (
                                <div key={index} className="relative">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-gray-700">{category}</span>
                                        <span className="text-gray-500">{count} views</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${index === 0 ? 'bg-indigo-500' : 'bg-indigo-300'}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-4 text-gray-400 text-sm">No watch history available</div>
                    )}
                </div>
            </div>
        </div>
    );
}
