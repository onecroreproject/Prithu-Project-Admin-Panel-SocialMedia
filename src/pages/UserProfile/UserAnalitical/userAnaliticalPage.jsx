import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "../../../Utils/axiosApi";
import UserAnalyticsFilter from "./userAnalyticsFilter";
import UserAnalyticsTabs from "./UserAnalyticsTabs";
import UserAnalyticsTable from "./userAnaliticalRenderTabel";
import AnalyticsStats from "./analiticalStatus";
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Eye,
  BarChart3,
  Calendar,
  TrendingUp,
  Video,
  Image as ImageIcon,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  FileText,
  RefreshCw,
  Download as DownloadIcon
} from "lucide-react";

// Fetch user analytics data with filters
const fetchUserAnalyticsData = async (userId, filters) => {
  if (!userId) throw new Error("User ID is required");

  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
  if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
  if (filters.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters.tab) params.append('tab', filters.tab);

  const response = await axios.get(`/api/admin/get/user/analytical/data/${userId}?${params.toString()}`);
  return response.data;
};

export default function UserAnalytics() {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState("posts"); // Default to posts
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    type: "all",
    tab: "posts"
  });

  const itemsPerPage = 10;

  // Fetch analytics data with filters
  const {
    data: analyticsData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['userAnalytics', userId, filters],
    queryFn: () => fetchUserAnalyticsData(userId, { ...filters, tab: activeTab }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
  console.log(analyticsData)
  // Transform API data to match expected format - Updated for all tabs
  const transformTabData = () => {
    if (!analyticsData) return [];

    switch (activeTab) {
      case "posts":
        return analyticsData.posts?.map((post, index) => ({
          id: index + 1,
          _id: post.id,
          feedId: {
            title: post.title || `${post.type === 'image' ? '📷 Image' : '🎥 Video'} Post`,
            contentUrl: post.url,
            type: post.type,
            createdAt: post.createdAt,
            description: post.description
          },
          views: post.views || 0,
          likes: post.likes || 0,
          shares: post.shares || 0,
          downloads: post.downloads || 0,
          dislikes: post.dislikes || 0,
          comments: post.comments || 0,
          createdAt: post.createdAt
        })) || [];

      case "following":
        return analyticsData.following?.map((user, index) => ({
          id: index + 1,
          userId: user.id,
          userName: user.userName,
          profileAvatar: user.profileAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.userName,
          followedAt: user.followedAt || new Date().toISOString(),
        })) || [];

      case "followers":
        return analyticsData.followers?.map((user, index) => ({
          id: index + 1,
          userId: user.id,
          userName: user.userName,
          profileAvatar: user.profileAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.userName,
          createdAt: user.followedAt || new Date().toISOString(),
        })) || [];

      case "interested":
        return analyticsData.interested?.map((category, index) => ({
          id: index + 1,
          _id: category.id,
          name: category.name,
          description: category.description || "",
          updatedAt: new Date().toISOString()
        })) || [];

      case "nonInterested":
        return analyticsData.nonInterested?.map((category, index) => ({
          id: index + 1,
          _id: category.id,
          name: category.name,
          description: category.description || "",
          updatedAt: new Date().toISOString()
        })) || [];

      case "hidden":
        return analyticsData.hidden?.map((post, index) => ({
          id: index + 1,
          _id: post.id,
          feedId: {
            title: post.title || `${post.type === 'image' ? '📷 Hidden Image' : '🎥 Hidden Video'}`,
            contentUrl: post.url,
            type: post.type,
            description: post.description || ""
          },
          hiddenAt: post.hiddenAt || new Date().toISOString(),
          createdBy: post.creator
        })) || [];

      case "liked":
        return analyticsData.likedPosts?.map((post, index) => ({
          id: index + 1,
          _id: post.id,
          feedId: {
            title: post.title || `${post.type === 'image' ? '📷 Liked Image' : '🎥 Liked Video'}`,
            contentUrl: post.url,
            type: post.type,
            description: post.description || ""
          },
          likedAt: post.likedAt || new Date().toISOString()
        })) || [];

      case "disliked":
        return analyticsData.dislikedPosts?.map((post, index) => ({
          id: index + 1,
          _id: post.id,
          feedId: {
            title: post.title || `${post.type === 'image' ? '📷 Disliked Image' : '🎥 Disliked Video'}`,
            contentUrl: post.url,
            type: post.type,
            description: post.description || ""
          },
          dislikedAt: post.dislikedAt || new Date().toISOString()
        })) || [];

      case "commented":
        return analyticsData.comments?.map((comment, index) => ({
          id: index + 1,
          _id: comment.id,
          feed: {
            title: comment.post?.title || `${comment.post?.type === 'image' ? '📷 Commented Image' : '🎥 Commented Video'}`,
            contentUrl: comment.post?.contentUrl,
            type: comment.post?.type,
            creator: comment.post?.createdByAccount || "Unknown",
            description: comment.post?.description || ""
          },
          commentText: comment.text,
          createdAt: comment.createdAt,
        })) || [];

      case "shared":
        return analyticsData.sharedPosts?.map((post, index) => ({
          id: index + 1,
          _id: post.id,
          feedId: {
            title: post.title || `${post.type === 'image' ? '📷 Shared Image' : '🎥 Shared Video'}`,
            contentUrl: post.url,
            type: post.type,
            description: post.description || ""
          },
          sharedAt: post.sharedAt || new Date().toISOString()
        })) || [];

      case "downloaded":
        return analyticsData.downloadedPosts?.map((post, index) => ({
          id: index + 1,
          _id: post.id,
          feedId: {
            title: post.title || `${post.type === 'image' ? '📷 Downloaded Image' : '🎥 Downloaded Video'}`,
            contentUrl: post.url,
            type: post.type,
            description: post.description || ""
          },
          downloadedAt: post.downloadedAt || new Date().toISOString()
        })) || [];

      case "saved":
        return analyticsData.savedPosts?.map((post, index) => ({
          id: index + 1,
          _id: post.id,
          feedId: {
            title: post.title || `${post.type === 'image' ? '📷 Saved Image' : '🎥 Saved Video'}`,
            contentUrl: post.url,
            type: post.type,
            description: post.description || ""
          },
          savedAt: post.savedAt || new Date().toISOString()
        })) || [];

      default:
        return [];
    }
  };

  const tabData = useMemo(() => transformTabData(), [analyticsData, activeTab]);

  // Calculate user stats
  const userStats = useMemo(() => ({
    posts: analyticsData?.posts?.length || 0,
    images: analyticsData?.imageCount || 0,
    videos: analyticsData?.videoCount || 0,
    following: analyticsData?.following?.length || 0,
    followers: analyticsData?.followers?.length || 0,
    liked: analyticsData?.interactions?.liked || 0,
    disliked: analyticsData?.interactions?.disliked || 0,
    commented: analyticsData?.comments?.length || 0,
    shared: analyticsData?.interactions?.shared || 0,
    downloaded: analyticsData?.interactions?.downloaded || 0,
    saved: analyticsData?.interactions?.saved || 0,
    hidden: analyticsData?.hidden?.length || 0,
    interested: analyticsData?.interested?.length || 0,
    nonInterested: analyticsData?.nonInterested?.length || 0,
    totalLikes: analyticsData?.engagementSummary?.totalPostLikes || 0,
    totalViews: analyticsData?.engagementSummary?.totalPostViews || 0,
    totalComments: analyticsData?.engagementSummary?.totalComments || 0,
  }), [analyticsData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filters]);

  const totalPages = Math.ceil(tabData.length / itemsPerPage);
  const paginatedData = tabData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = (newFilters) => {
    // Merge new filters with existing ones
    const updatedFilters = {
      ...filters,
      ...newFilters,
      tab: activeTab // Always include current tab
    };

    // Validate date range (end date should be after start date)
    if (updatedFilters.startDate && updatedFilters.endDate) {
      const start = new Date(updatedFilters.startDate);
      const end = new Date(updatedFilters.endDate);
      if (end < start) {
        // Swap dates if end date is before start date
        const temp = updatedFilters.startDate;
        updatedFilters.startDate = updatedFilters.endDate;
        updatedFilters.endDate = temp;
      }
    }

    setFilters(updatedFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      type: "all",
      tab: activeTab
    });
  };

  // Update hasActiveFilters:
  const hasActiveFilters = () => {
    return filters.startDate || filters.endDate || filters.type !== 'all';
  };

  // Loading state
  if (isLoading && !isRefetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="animate-pulse mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="h-16 bg-gray-100 dark:bg-gray-700"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 border-b border-gray-200 dark:border-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Failed to Load Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {error?.message || "Please try refreshing the page or contact support if the problem persists."}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with user info */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                User Analytics Dashboard
              </h1>
              <div className="flex items-center gap-3 mt-3">
                {analyticsData?.selectedUser?.userAvatar && (
                  <img
                    src={analyticsData.selectedUser.userAvatar}
                    alt={analyticsData.selectedUser.userName}
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-lg"
                  />
                )}
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {analyticsData?.selectedUser?.userName || "Unknown User"}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">User ID: {userId}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                      {userStats.posts} Posts
                    </span>
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                      {userStats.followers} Followers
                    </span>
                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                      {userStats.following} Following
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">


              <button
                onClick={() => {
                  // Export functionality
                  const exportData = analyticsData;
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `user-analytics-${userId}-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview - Enhanced with more metrics */}
        <div className="mb-8">
          <AnalyticsStats stats={userStats} />
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Filter Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <UserAnalyticsFilter
              filters={filters}
              activeTab={activeTab}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters()}
              isLoading={isRefetching}
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <UserAnalyticsTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Table Content */}
          <div className="p-6">
            {/* Table Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 capitalize">
                  {activeTab === 'posts' ? 'User Posts & Content' : activeTab.replace(/([A-Z])/g, ' $1')}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{tabData.length}</span> total items
                  </p>
                  {analyticsData?.filters?.applied && (
                    <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full">
                      Filters Applied
                    </span>
                  )}
                  {analyticsData?.engagementSummary && activeTab === 'posts' && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {analyticsData.engagementSummary.totalPostLikes.toLocaleString()} likes
                        </span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {analyticsData.engagementSummary.totalPostViews.toLocaleString()} views
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {(filters.startDate || filters.endDate) && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {filters.startDate ? filters.startDate.toLocaleDateString() : 'Any'} - {filters.endDate ? filters.endDate.toLocaleDateString() : 'Any'}
                    </span>
                  </div>
                )}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages || 1}</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${filters.startDate}-${filters.endDate}-${filters.type}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <UserAnalyticsTable
                  activeTab={activeTab}
                  data={paginatedData}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  isLoading={isLoading || isRefetching}
                  analyticsData={analyticsData}
                />
              </motion.div>
            </AnimatePresence>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span> to{" "}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {Math.min(currentPage * itemsPerPage, tabData.length)}
                    </span>{" "}
                    of <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {tabData.length}
                    </span> entries
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-all ${currentPage === pageNum
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      Next
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        // You might want to handle items per page change
                      }}
                      className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}