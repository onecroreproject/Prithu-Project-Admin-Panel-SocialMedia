import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../Utils/axiosApi";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFire,
  FaEye,
  FaHeart,
  FaShare,
  FaDownload,
  FaUser,
  FaCalendar,
  FaChartLine,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaPlay,
  FaImage,
  FaVideo,
  FaExternalLinkAlt,
  FaCrown,
  FaSearch,
  FaSync,
  FaStar,
  FaBookmark,
  FaThumbsDown,
  FaTrophy
} from "react-icons/fa";
import { TrendingUp, Clock, Award } from "lucide-react";

// API service function using Axios
const fetchTrendingFeeds = async (filters) => {
  try {
    const params = {
      limit: filters.limit,
      ...(filters.type !== 'all' && { type: filters.type }),
      ...(filters.search && { search: filters.search }),
    };

    const response = await axios.get("/api/get/trending/feed", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching trending feeds:", error);
    throw error;
  }
};

export default function TrendingFeedsTable() {
  const [filters, setFilters] = useState({
    type: 'all',
    sortBy: 'trendingScore',
    sortOrder: 'desc',
    search: '',
    limit: 20
  });
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch trending feeds
  const { data: apiResponse, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['trendingFeeds', filters],
    queryFn: () => fetchTrendingFeeds(filters),
    staleTime: 30000, // 30 seconds
  });

  console.log("API Response:", apiResponse);
  const trendingFeeds = apiResponse?.data || [];

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (column) => {
    if (filters.sortBy === column) {
      setFilters(prev => ({
        ...prev,
        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        sortBy: column,
        sortOrder: 'desc'
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      sortBy: 'trendingScore',
      sortOrder: 'desc',
      search: '',
      limit: 20
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Get trending badge color
  const getTrendingBadge = (trendingScore) => {
    if (trendingScore > 400) return 'bg-gradient-to-r from-red-500 to-orange-500 text-white';
    if (trendingScore > 200) return 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white';
    if (trendingScore > 100) return 'bg-gradient-to-r from-yellow-500 to-green-500 text-white';
    return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white';
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Sort feeds based on current sort settings
  const sortedFeeds = [...trendingFeeds].sort((a, b) => {
    const aValue = a[filters.sortBy] || a.trendingScore || 0;
    const bValue = b[filters.sortBy] || b.trendingScore || 0;

    if (filters.sortOrder === 'asc') {
      return aValue - bValue;
    }
    return bValue - aValue;
  });

  // Search filter
  const filteredFeeds = sortedFeeds.filter(feed => {
    if (!filters.search) return true;

    const searchTerm = filters.search.toLowerCase();
    return (
      (feed.createdBy?.userName?.toLowerCase().includes(searchTerm)) ||
      (feed.feedId?.toLowerCase().includes(searchTerm)) ||
      (feed.type?.toLowerCase().includes(searchTerm))
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trending feeds...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <FaFire className="text-red-500 text-2xl" />
        </div>
        <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to load trending feeds</h3>
        <p className="text-red-600 mb-4">{error?.message || 'Please try again later'}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <FaTrophy className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trending Feeds</h1>
              <p className="text-gray-600">Most engaging content based on views, likes, shares & downloads</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                  {trendingFeeds.length} trending feeds
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  Real-time updates
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search feeds, creators, or content..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-48">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-48">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="trendingScore">Trending Score</option>
              <option value="views">Views</option>
              <option value="likes">Likes</option>
              <option value="shares">Shares</option>
              <option value="downloads">Downloads</option>
              <option value="createdAt">Date Posted</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {trendingFeeds.reduce((sum, feed) => sum + (feed.views || 0), 0).toLocaleString()}
              </p>
            </div>
            <FaEye className="text-orange-500 text-xl" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Likes</p>
              <p className="text-2xl font-bold text-gray-900">
                {trendingFeeds.reduce((sum, feed) => sum + (feed.likes || 0), 0).toLocaleString()}
              </p>
            </div>
            <FaHeart className="text-red-500 text-xl" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Shares</p>
              <p className="text-2xl font-bold text-gray-900">
                {trendingFeeds.reduce((sum, feed) => sum + (feed.shares || 0), 0).toLocaleString()}
              </p>
            </div>
            <FaShare className="text-green-500 text-xl" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900">
                {trendingFeeds.reduce((sum, feed) => sum + (feed.downloads || 0), 0).toLocaleString()}
              </p>
            </div>
            <FaDownload className="text-blue-500 text-xl" />
          </div>
        </div>
      </div>

      {/* Trending Feeds Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('trendingScore')}
                >
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3" /> Score
                    {filters.sortBy === 'trendingScore' && (
                      filters.sortOrder === 'desc' ? <FaSortDown className="ml-1" /> : <FaSortUp className="ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('views')}
                >
                  <div className="flex items-center gap-1">
                    <FaEye className="w-3 h-3" /> Views
                    {filters.sortBy === 'views' && (
                      filters.sortOrder === 'desc' ? <FaSortDown className="ml-1" /> : <FaSortUp className="ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('likes')}
                >
                  <div className="flex items-center gap-1">
                    <FaHeart className="w-3 h-3" /> Likes
                    {filters.sortBy === 'likes' && (
                      filters.sortOrder === 'desc' ? <FaSortDown className="ml-1" /> : <FaSortUp className="ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('shares')}
                >
                  <div className="flex items-center gap-1">
                    <FaShare className="w-3 h-3" /> Shares
                    {filters.sortBy === 'shares' && (
                      filters.sortOrder === 'desc' ? <FaSortDown className="ml-1" /> : <FaSortUp className="ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    <FaCalendar className="w-3 h-3" /> Posted
                    {filters.sortBy === 'createdAt' && (
                      filters.sortOrder === 'desc' ? <FaSortDown className="ml-1" /> : <FaSortUp className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFeeds.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FaFire className="text-gray-400 text-2xl" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No trending feeds found</h3>
                      <p className="text-gray-500">Try adjusting your filters or check back later</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFeeds.map((feed, index) => (
                  <motion.tr
                    key={feed.feedId || feed._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-orange-50/20 transition-colors"
                  >
                    {/* Rank */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                            index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white' :
                              index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white' :
                                'bg-gray-100 text-gray-700'
                          }`}>
                          {index + 1}
                        </div>
                        {index < 3 && (
                          <FaCrown className={`mt-1 ${index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-400' :
                                'text-amber-700'
                            }`} />
                        )}
                      </div>
                    </td>

                    {/* Content */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div
                            className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
                            onClick={() => {
                              setSelectedFeed(feed);
                              setShowPreview(true);
                            }}
                          >
                            {feed.contentUrl ? (
                              feed.type === 'video' ? (
                                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                  <FaPlay className="text-white text-xl" />
                                </div>
                              ) : (
                                <img
                                  src={feed.contentUrl}
                                  alt="Feed content"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                                  }}
                                />
                              )
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No preview</span>
                              </div>
                            )}
                          </div>
                          <div className="absolute -top-1 -right-1">
                            {feed.type === 'video' ? (
                              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <FaVideo className="text-white text-xs" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <FaImage className="text-white text-xs" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden">
                                <img
                                  src={feed.createdBy?.avatar || 'https://via.placeholder.com/100x100?text=User'}
                                  alt={feed.createdBy?.userName || 'Creator'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/100x100?text=User';
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {feed.createdBy?.userName || 'Unknown Creator'}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 mb-2">
                            ID: {feed.feedId?.slice(0, 8) || 'N/A'}...
                          </div>

                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getTrendingBadge(feed.trendingScore || 0)}`}>
                            <FaFire className="w-3 h-3" />
                            {feed.trendingScore || 0} pts
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Trend Score */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-lg font-bold text-gray-900">
                          {feed.trendingScore || 0}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          Based on engagement
                        </div>
                      </div>
                    </td>

                    {/* Views */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FaEye className="text-blue-500 w-4 h-4" />
                          <span className="text-lg font-semibold text-gray-900">
                            {formatNumber(feed.views || 0)}
                          </span>
                        </div>
                        {feed.lastViewed && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(feed.lastViewed)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Likes */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FaHeart className="text-red-500 w-4 h-4" />
                          <span className="text-lg font-semibold text-gray-900">
                            {formatNumber(feed.likes || 0)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Shares */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FaShare className="text-green-500 w-4 h-4" />
                          <span className="text-lg font-semibold text-gray-900">
                            {formatNumber(feed.shares || 0)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Posted */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(feed.createdAt)}
                        </div>
                        {feed.createdAt && (
                          <div className="text-xs text-gray-500">
                            {formatTimeAgo(feed.createdAt)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedFeed(feed);
                            setShowPreview(true);
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>

                        {feed.contentUrl && (
                          <button
                            onClick={() => window.open(feed.contentUrl, '_blank')}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Open Original"
                          >
                            <FaExternalLinkAlt className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => alert(`Would send notification to ${feed.createdBy?.userName} about trending performance`)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Notify Creator"
                        >
                          <FaChartLine className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => alert(`Would boost or hide feed ${feed.feedId}`)}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Manage Feed"
                        >
                          <FaStar className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-semibold">{Math.min(filters.limit, filteredFeeds.length)}</span> trending feeds
              {trendingFeeds.length > 0 && (
                <span className="ml-2 text-gray-500">
                  ({trendingFeeds.length} total trending feeds)
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Show:</span>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="text-sm text-gray-700">
                Sorted by: <span className="font-semibold capitalize">{filters.sortBy}</span>
                <span className="ml-1">{filters.sortOrder === 'desc' ? '↓' : '↑'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedFeed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Feed Details</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {selectedFeed.type === 'video' ? 'Video' : 'Image'}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full font-bold ${getTrendingBadge(selectedFeed.trendingScore || 0)}`}>
                        Score: {selectedFeed.trendingScore || 0}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Media Preview */}
                    <div>
                      <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
                        {selectedFeed.contentUrl ? (
                          selectedFeed.type === 'video' ? (
                            <video
                              src={selectedFeed.contentUrl}
                              controls
                              autoPlay
                              className="w-full h-auto max-h-96"
                            />
                          ) : (
                            <img
                              src={selectedFeed.contentUrl}
                              alt="Feed content"
                              className="w-full h-auto max-h-96 object-contain"
                            />
                          )
                        ) : (
                          <div className="h-96 flex items-center justify-center text-white">
                            <div className="text-center">
                              <FaImage className="text-gray-400 text-4xl mb-2 mx-auto" />
                              <p>No preview available</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-center gap-3">
                        {selectedFeed.contentUrl && (
                          <button
                            onClick={() => window.open(selectedFeed.contentUrl, '_blank')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                          >
                            <FaExternalLinkAlt /> Open Original
                          </button>
                        )}
                        <button
                          onClick={() => alert(`Boost feed ${selectedFeed.feedId}`)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                        >
                          <FaStar /> Boost Feed
                        </button>
                      </div>
                    </div>

                    {/* Right: Stats & Info */}
                    <div className="space-y-6">
                      {/* Creator Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Creator Information</h4>
                        <div className="flex items-center gap-3">
                          <img
                            src={selectedFeed.createdBy?.avatar || 'https://via.placeholder.com/100x100?text=User'}
                            alt={selectedFeed.createdBy?.userName || 'Creator'}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{selectedFeed.createdBy?.userName || 'Unknown Creator'}</p>
                            <p className="text-sm text-gray-500">
                              User ID: {selectedFeed.createdBy?._id?.slice(0, 8)}...
                            </p>
                            <p className="text-sm text-gray-500">
                              Posted {formatTimeAgo(selectedFeed.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Engagement Stats */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Engagement Statistics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FaEye className="text-blue-500" />
                              <span className="font-medium">Views</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(selectedFeed.views || 0)}</p>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FaHeart className="text-red-500" />
                              <span className="font-medium">Likes</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(selectedFeed.likes || 0)}</p>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FaShare className="text-green-500" />
                              <span className="font-medium">Shares</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(selectedFeed.shares || 0)}</p>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <FaDownload className="text-purple-500" />
                              <span className="font-medium">Downloads</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(selectedFeed.downloads || 0)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Trending Info */}
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Trending Analysis</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Trending Score:</span>
                            <span className={`px-3 py-1 rounded-full font-bold ${getTrendingBadge(selectedFeed.trendingScore || 0)}`}>
                              {selectedFeed.trendingScore || 0}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Content Type:</span>
                            <span className="font-medium capitalize">
                              {selectedFeed.type}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Feed ID:</span>
                            <span className="font-medium text-sm">
                              {selectedFeed.feedId?.slice(0, 8)}...
                            </span>
                          </div>

                          {selectedFeed.lastViewed && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Last Viewed:</span>
                              <span className="font-medium">
                                {formatTimeAgo(selectedFeed.lastViewed)}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Created:</span>
                            <span className="font-medium">
                              {formatDate(selectedFeed.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      alert(`Action taken on feed ${selectedFeed.feedId}`);
                      setShowPreview(false);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:opacity-90"
                  >
                    Take Action
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}