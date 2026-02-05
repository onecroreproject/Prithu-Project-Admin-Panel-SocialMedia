import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../Utils/axiosApi";
import toast, { Toaster } from "react-hot-toast";
import TrendingCreatorsTable from "../pages/Tables/CreatorTable/trendingCreatorTable";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";

// Enhanced fetch function with query params using Axios
const fetchTrendingCreatorsWithParams = async ({
  page,
  limit,
  search,
  sortBy,
  sortOrder,
  minScore,
  maxScore,
  minFollowers,
  maxFollowers,
  contentType,
}) => {
  const params = {
    page: page || 1,
    limit: limit || 10,
    ...(search && { search }),
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder }),
    ...(minScore && { minScore }),
    ...(maxScore && { maxScore }),
    ...(minFollowers && { minFollowers }),
    ...(maxFollowers && { maxFollowers }),
    ...(contentType && { contentType }),
  };

  try {
    const response = await axios.get('/api/admin/get/trending/creator', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching trending creators:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch creators");
  }
};

export default function TrendingCreatorsPage() {
  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({
    sortBy: "trendingScore",
    sortOrder: "desc",
    minScore: "",
    maxScore: "",
    minFollowers: "",
    maxFollowers: "",
    contentType: "all",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data with query using Axios
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    error
  } = useQuery({
    queryKey: [
      "trendingCreators",
      page,
      limit,
      debouncedSearch,
      filters,
    ],
    queryFn: () =>
      fetchTrendingCreatorsWithParams({
        page,
        limit,
        search: debouncedSearch,
        ...filters,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    onError: (error) => {
      toast.error(error.message || "Failed to load creators");
    },
  });

  const creators = data?.creators || [];
  const pagination = data?.pagination;

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSortChange = (sortBy, sortOrder) => {
    handleFilterChange("sortBy", sortBy);
    handleFilterChange("sortOrder", sortOrder);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      sortBy: "trendingScore",
      sortOrder: "desc",
      minScore: "",
      maxScore: "",
      minFollowers: "",
      maxFollowers: "",
      contentType: "all",
    });
    setPage(1);
  };

  const handleExport = async () => {
    try {
      toast.loading("Preparing export...");

      const params = {
        page: 1,
        limit: 1000, // Export more records
        search: debouncedSearch,
        ...filters,
      };

      const response = await axios.get('/api/trending-creators', { params });

      // Convert to CSV or Excel (you can implement this based on your needs)
      const csvContent = convertToCSV(response.data.creators);

      // Download the file
      downloadCSV(csvContent, 'trending-creators.csv');

      toast.dismiss();
      toast.success("Export completed successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to export data");
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (data) => {
    if (!data.length) return '';

    const headers = ['User ID', 'Username', 'Trending Score', 'Followers', 'Total Views', 'Likes', 'Shares', 'Image Posts', 'Video Posts', 'Last Updated'];

    const rows = data.map(creator => [
      creator.userId,
      creator.userName,
      creator.trendingScore,
      creator.followerCount,
      creator.totalVideoViews + creator.totalImageViews,
      creator.totalLikes,
      creator.totalShares,
      creator.imagePosts,
      creator.videoPosts,
      new Date(creator.lastUpdated).toLocaleDateString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Helper function to download CSV
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const hasActiveFilters = () => {
    return (
      searchTerm ||
      filters.minScore ||
      filters.maxScore ||
      filters.minFollowers ||
      filters.maxFollowers ||
      filters.contentType !== "all" ||
      filters.sortBy !== "trendingScore"
    );
  };

  // Loading state
  if (isLoading && !isRefetching) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
              <div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>

            {/* Filters skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>

            {/* Table skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
              <div className="h-16 bg-gray-100 dark:bg-gray-700"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 border-b border-gray-200 dark:border-gray-700"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <div className="text-red-500 dark:text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
              Failed to Load Creators
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">
              {error?.message || "Please try refreshing the page or contact support if the problem persists."}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-gray-200',
            duration: 3000,
          }}
        />

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trending Creators
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Discover top-performing creators based on engagement metrics
              </p>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-3">


              <button
                onClick={handleExport}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Creators</p>
                  <p className="text-2xl font-bold mt-1">
                    {pagination?.totalCount?.toLocaleString() || "0"}
                  </p>
                </div>
                <Users className="w-10 h-10 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Avg. Score</p>
                  <p className="text-2xl font-bold mt-1">
                    {creators.length > 0
                      ? (creators.reduce((acc, c) => acc + (c.trendingScore || 0), 0) / creators.length).toFixed(1)
                      : "0.0"
                    }
                  </p>
                </div>
                <BarChart3 className="w-10 h-10 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Followers</p>
                  <p className="text-2xl font-bold mt-1">
                    {creators.reduce((acc, c) => acc + (c.followerCount || 0), 0).toLocaleString()}
                  </p>
                </div>
                <Users className="w-10 h-10 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Avg. Posts</p>
                  <p className="text-2xl font-bold mt-1">
                    {creators.length > 0
                      ? Math.round(creators.reduce((acc, c) => acc + (c.imagePosts + c.videoPosts || 0), 0) / creators.length)
                      : "0"
                    }
                  </p>
                </div>
                <BarChart3 className="w-10 h-10 opacity-80" />
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                Filters & Search
              </h3>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              >
                <Filter className="w-4 h-4" />
                {showAdvancedFilters ? 'Hide Advanced' : 'Show Advanced'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search creators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Content Type Filter */}
              <select
                value={filters.contentType}
                onChange={(e) => handleFilterChange("contentType", e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Content Types</option>
                <option value="image">Image Posts</option>
                <option value="video">Video Posts</option>
              </select>

              {/* Sort By */}
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="trendingScore">Trending Score</option>
                  <option value="followerCount">Followers</option>
                  <option value="totalLikes">Likes</option>
                  <option value="totalShares">Shares</option>
                  <option value="totalPosts">Total Posts</option>
                </select>
                <button
                  onClick={() => handleFilterChange("sortOrder", filters.sortOrder === "desc" ? "asc" : "desc")}
                  className="px-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {filters.sortOrder === "desc" ? "↓" : "↑"}
                </button>
              </div>

              {/* Clear Filters Button */}
              <div className="flex gap-2">
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-3 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Min Score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={filters.minScore}
                      onChange={(e) => handleFilterChange("minScore", e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="100"
                      value={filters.maxScore}
                      onChange={(e) => handleFilterChange("maxScore", e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Min Followers
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={filters.minFollowers}
                      onChange={(e) => handleFilterChange("minFollowers", e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Followers
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="1000000"
                      value={filters.maxFollowers}
                      onChange={(e) => handleFilterChange("maxFollowers", e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Table Content */}
        <div className="mb-8">
          <TrendingCreatorsTable
            creators={creators}
            isLoading={isLoading || isRefetching}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={handleSortChange}
          />
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {(page - 1) * limit + 1}
                </span> to{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {Math.min(page * limit, pagination.totalCount)}
                </span>{" "}
                of <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {pagination.totalCount?.toLocaleString()}
                </span> creators
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${page === pageNum
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
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
  );
}