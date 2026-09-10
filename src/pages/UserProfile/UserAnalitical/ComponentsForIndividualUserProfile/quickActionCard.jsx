import React, { useState } from 'react';
import FollowersModal from './quickActionComponents/followerModel';
import FollowingModal from './quickActionComponents/followingModel';
import PostsModal from './quickActionComponents/postModel';
import ReportsModal from './quickActionComponents/reportMode';



const QuickActionsCard = ({ user }) => {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showPosts, setShowPosts] = useState(false);
  const [showReports, setShowReports] = useState(false);

  const quickActions = [
    {
      id: 'followers',
      title: 'View Followers',
      count: user.followers?.length || 0,
      icon: (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-blue-50',
      onClick: () => setShowFollowers(true)
    },
    {
      id: 'following',
      title: 'View Following',
      count: user.following?.length || 0,
      icon: (
        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0c-.828 0-1.5.672-1.5 1.5v4.5a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5V7.5a1.5 1.5 0 00-1.5-1.5h-1.5z" />
        </svg>
      ),
      color: 'bg-purple-50',
      onClick: () => setShowFollowing(true)
    },
    {
      id: 'posts',
      title: 'View All Posts',
      count: user.posts?.length || 0,
      icon: (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'bg-green-50',
      onClick: () => setShowPosts(true)
    },
    {
      id: 'reports',
      title: 'View Reports Filed',
      count: user.reports?.length || 0,
      icon: (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m16 0a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a2 2 0 012-2m16 0V8M4 12V8m16 0a2 2 0 00-2-2h-4a2 2 0 00-2 2M4 8a2 2 0 002-2h4a2 2 0 002 2" />
        </svg>
      ),
      color: 'bg-red-50',
      onClick: () => setShowReports(true)
    }
  ];

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Actions
        </h3>
        <div className="space-y-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 ${action.color} rounded-lg`}>
                  {action.icon}
                </div>
                <span>{action.title}</span>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium group-hover:bg-gray-200">
                {action.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showFollowers && (
        <FollowersModal 
          followers={user.followers || []}
          onClose={() => setShowFollowers(false)}
        />
      )}

      {showFollowing && (
        <FollowingModal 
          following={user.following || []}
          onClose={() => setShowFollowing(false)}
        />
      )}

      {showPosts && (
        <PostsModal 
          posts={user.posts || []}
          onClose={() => setShowPosts(false)}
        />
      )}

      {showReports && (
        <ReportsModal 
          reports={user.reports || []}
          onClose={() => setShowReports(false)}
        />
      )}
    </>
  );
};

export default QuickActionsCard;