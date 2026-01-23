import React from 'react';

const TopPostsSection = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h3>
        <p className="text-gray-500">User hasn't created any posts.</p>
      </div>
    );
  }

  // Calculate engagement score for sorting
  const postsWithScore = posts.map(post => {
    const score = (post.stats?.likes || 0) * 2 + 
                  (post.stats?.comments?.length || 0) * 3 +
                  (post.stats?.shares || 0) * 4 +
                  (post.stats?.downloads || 0) * 1;
    return { ...post, score };
  });

  // Sort by engagement score
  const topPosts = postsWithScore.sort((a, b) => b.score - a.score).slice(0, 3);

  return (
    <div>
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Top Performing Posts</h3>
            <p className="text-gray-500 text-sm">Posts with highest engagement</p>
          </div>
          <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600 rounded-full text-sm font-medium">
            {posts.length} total posts
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topPosts.map((post, index) => (
            <div key={post._id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    'bg-gradient-to-r from-amber-600 to-amber-700'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900">#{index + 1} Rank</span>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                  {post.type.toUpperCase()}
                </span>
              </div>
              
              {/* Post Preview */}
              <div className="mb-4 rounded-xl overflow-hidden border border-gray-200">
                {post.type === 'image' ? (
                  <img 
                    src={post.contentUrl} 
                    alt="Post content"
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : post.type === 'video' ? (
                  <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Post Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Posted on</span>
                  <span className="text-xs font-medium text-gray-900">
                    {new Date(post.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Engagement Stats */}
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-500">{post.stats?.likes || 0}</div>
                    <div className="text-xs text-gray-500">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-500">{post.stats?.comments?.length || 0}</div>
                    <div className="text-xs text-gray-500">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-500">{post.stats?.shares || 0}</div>
                    <div className="text-xs text-gray-500">Shares</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-500">{post.stats?.downloads || 0}</div>
                    <div className="text-xs text-gray-500">Downloads</div>
                  </div>
                </div>
                
                {/* Total Score */}
                <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Engagement Score</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-bold">
                      {post.score}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopPostsSection;