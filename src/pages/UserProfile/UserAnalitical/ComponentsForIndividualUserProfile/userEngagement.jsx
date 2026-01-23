import React from 'react';

const UserEngagement = ({ user }) => {
  // Calculate reply ratio and other engagement metrics
  const calculateEngagementMetrics = () => {
    if (!user.posts || user.posts.length === 0) {
      return {
        totalCommentsReceived: 0,
        avgRepliesPerPost: 0,
        engagementRate: '0%',
        postFrequency: 'No posts'
      };
    }

    // Calculate total comments received on all posts
    const totalCommentsReceived = user.posts.reduce((sum, post) => 
      sum + (post.stats?.comments?.length || 0), 0);
    
    // Average comments per post
    const avgRepliesPerPost = user.posts.length > 0 ? 
      (totalCommentsReceived / user.posts.length).toFixed(1) : 0;
    
    // Calculate engagement rate (simplified)
    const totalEngagement = totalCommentsReceived + 
      user.posts.reduce((sum, post) => sum + (post.stats?.likes || 0) + (post.stats?.shares || 0), 0);
    
    const engagementRate = user.followers?.length > 0 ? 
      ((totalEngagement / user.followers.length) * 100).toFixed(1) + '%' : '0%';
    
    // Calculate post frequency
    const posts = user.posts;
    if (posts.length > 1) {
      const firstPost = new Date(posts[posts.length - 1].createdAt);
      const lastPost = new Date(posts[0].createdAt);
      const daysDiff = Math.ceil((lastPost - firstPost) / (1000 * 60 * 60 * 24));
      const postsPerDay = (posts.length / daysDiff).toFixed(2);
      return {
        totalCommentsReceived,
        avgRepliesPerPost,
        engagementRate,
        postFrequency: `${postsPerDay}/day`
      };
    }

    return {
      totalCommentsReceived,
      avgRepliesPerPost,
      engagementRate,
      postFrequency: 'Recent'
    };
  };

  const metrics = calculateEngagementMetrics();

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-6 text-lg flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
        User Engagement
      </h3>
      
      <div className="space-y-6">
        {/* Engagement Overview */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900">Engagement Overview</h4>
              <p className="text-sm text-gray-600">Based on post interactions</p>
            </div>
            <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
              {metrics.engagementRate}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalCommentsReceived}</div>
              <div className="text-xs text-gray-500">Total Comments Received</div>
            </div>
            <div className="bg-white p-3 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{metrics.avgRepliesPerPost}</div>
              <div className="text-xs text-gray-500">Avg. Replies/Post</div>
            </div>
          </div>
        </div>

        {/* Post Frequency */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Post Frequency</h4>
          <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{metrics.postFrequency}</div>
                  <div className="text-sm text-gray-500">Average posting rate</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{user.posts?.length || 0}</div>
                <div className="text-sm text-gray-500">Total Posts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Follower Engagement */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Follower Metrics</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-gray-200">
              <div className="text-lg font-bold text-purple-600">{user.followers?.length || 0}</div>
              <div className="text-sm text-gray-500">Followers</div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-white p-4 rounded-xl border border-gray-200">
              <div className="text-lg font-bold text-pink-600">{user.following?.length || 0}</div>
              <div className="text-sm text-gray-500">Following</div>
            </div>
          </div>
        </div>

        {/* Active Hours (Placeholder) */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Most Active</h4>
          <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Peak Activity</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Afternoon</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                style={{ width: '70%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEngagement;