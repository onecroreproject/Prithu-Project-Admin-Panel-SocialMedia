import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PostsModal = ({ posts, onClose }) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">All Posts ({posts.length})</h3>
                  <p className="text-sm text-gray-500">All posts created by this user</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto text-gray-300 mb-4">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h4>
                  <p className="text-gray-500">This user hasn't created any posts.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <div key={post._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      {post.type === 'image' && post.contentUrl && (
                        <div className="h-48 overflow-hidden">
                          <img 
                            src={post.contentUrl} 
                            alt="Post"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      {post.type === 'video' && (
                        <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                      {post.type !== 'image' && post.type !== 'video' && (
                        <div className="h-48 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                            {post.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.hashtags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div>
                            <div className="text-sm font-bold text-red-500">{post.stats?.likes || 0}</div>
                            <div className="text-xs text-gray-500">Likes</div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-blue-500">{post.stats?.comments?.length || 0}</div>
                            <div className="text-xs text-gray-500">Comments</div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-green-500">{post.stats?.shares || 0}</div>
                            <div className="text-xs text-gray-500">Shares</div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-purple-500">{post.stats?.downloads || 0}</div>
                            <div className="text-xs text-gray-500">Downloads</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default PostsModal;