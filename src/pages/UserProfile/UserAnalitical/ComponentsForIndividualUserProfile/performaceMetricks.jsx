import React from 'react';

const PerformanceMetrics = ({ user }) => {
  // Calculate total engagement metrics from all posts
  const calculateMetrics = () => {
    if (!user.posts || user.posts.length === 0) {
      return {
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalDownloads: 0,
        totalEngagement: 0,
        avgEngagementPerPost: 0
      };
    }

    const totalLikes = user.posts.reduce((sum, post) => sum + (post.stats?.likes || 0), 0);
    const totalComments = user.posts.reduce((sum, post) => sum + (post.stats?.comments?.length || 0), 0);
    const totalShares = user.posts.reduce((sum, post) => sum + (post.stats?.shares || 0), 0);
    const totalDownloads = user.posts.reduce((sum, post) => sum + (post.stats?.downloads || 0), 0);
    
    // Calculate average engagement per post
    const totalEngagement = totalLikes + totalComments + totalShares + totalDownloads;
    const avgEngagementPerPost = user.posts.length > 0 ? Math.round(totalEngagement / user.posts.length) : 0;

    return {
      totalLikes,
      totalComments,
      totalShares,
      totalDownloads,
      totalEngagement,
      avgEngagementPerPost
    };
  };

  const metrics = calculateMetrics();

  const statsCards = [
    {
      title: "Total Posts",
      value: user.posts?.length || 0,
      change: null,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      textColor: "text-blue-600"
    },
    {
      title: "Total Engagement",
      value: metrics.totalEngagement,
      change: null,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      ),
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      textColor: "text-purple-600"
    },
    {
      title: "Avg. Engagement/Post",
      value: metrics.avgEngagementPerPost,
      change: null,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      color: "bg-gradient-to-br from-green-500 to-emerald-500",
      textColor: "text-green-600"
    },
    {
      title: "Followers Growth",
      value: user.followers?.length || 0,
      change: "+12%",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0c-.828 0-1.5.672-1.5 1.5v4.5a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5V7.5a1.5 1.5 0 00-1.5-1.5h-1.5z" />
        </svg>
      ),
      color: "bg-gradient-to-br from-orange-500 to-red-500",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-6 text-lg flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Performance Metrics
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-2xl border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 ${stat.color} rounded-xl text-white`}>
                {stat.icon}
              </div>
              {stat.change && (
                <span className="text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString()}</div>
            <div className="text-sm text-gray-500">{stat.title}</div>
          </div>
        ))}
      </div>
      
      {/* Engagement Breakdown */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Engagement Breakdown</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Likes</span>
            </div>
            <span className="font-medium text-gray-900">{metrics.totalLikes}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">Comments</span>
            </div>
            <span className="font-medium text-gray-900">{metrics.totalComments}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Shares</span>
            </div>
            <span className="font-medium text-gray-900">{metrics.totalShares}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-600">Downloads</span>
            </div>
            <span className="font-medium text-gray-900">{metrics.totalDownloads}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;