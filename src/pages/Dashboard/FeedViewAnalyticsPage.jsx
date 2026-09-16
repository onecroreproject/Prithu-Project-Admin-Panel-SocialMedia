import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Eye,
  Play,
  Film,
  Image as ImageIcon,
  Clock,
  TrendingUp,
  Calendar,
  Search,
  Users,
  Sparkles,
  RefreshCw,
  BarChart3,
  Layers,
  ChevronLeft,
  ChevronRight,
  Activity,
  Tv,
  Tag
} from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  fetchFeedWatchAnalytics,
  fetchFeedViewLogs,
  fetchCategories
} from "../../Services/FeedServices/feedServices";

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toLocaleString();
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "0s";
  if (seconds >= 3600) {
    const hours = (seconds / 3600).toFixed(1);
    return `${hours} hrs`;
  }
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  return `${seconds}s`;
};

export default function FeedViewAnalyticsPage() {
  // Filters for Live View Logs Table
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [postType, setPostType] = useState("all");
  const [topPostsTab, setTopPostsTab] = useState("today"); // "today" | "allTime"

  // 1. Fetch Watch Analytics (Summary KPIs, Category breakdown, Hourly trend, Top Posts)
  const {
    data: watchAnalytics,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
    isRefetching: isAnalyticsRefetching
  } = useQuery({
    queryKey: ["adminFeedWatchAnalytics"],
    queryFn: fetchFeedWatchAnalytics,
    staleTime: 1000 * 30, // 30s
    refetchInterval: 30000 // auto poll every 30s
  });

  // 2. Fetch Categories for Filter Dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["categoriesList"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10
  });
  const categoriesList = categoriesData?.categories || categoriesData?.data || [];

  // 3. Fetch Paginated Live View Logs
  const {
    data: viewLogsData,
    isLoading: isLogsLoading,
    refetch: refetchLogs,
    isRefetching: isLogsRefetching
  } = useQuery({
    queryKey: ["adminFeedViewLogs", page, search, dateRange, categoryId, postType],
    queryFn: () =>
      fetchFeedViewLogs({
        page,
        limit: 15,
        search,
        dateRange,
        categoryId: categoryId !== "all" ? categoryId : undefined,
        postType: postType !== "all" ? postType : undefined
      }),
    staleTime: 1000 * 15
  });

  const handleRefreshAll = () => {
    refetchAnalytics();
    refetchLogs();
  };

  const maxHourlyViews = Math.max(
    ...(watchAnalytics?.todayHourlyViews?.map((h) => h.views) || [1]),
    1
  );

  const topCategory =
    watchAnalytics?.todayCategoryWatched?.[0]?.categoryName ||
    watchAnalytics?.allTimeCategoryWatched?.[0]?.categoryName ||
    "N/A";

  const displayedTopPosts =
    topPostsTab === "today"
      ? watchAnalytics?.topWatchedPostsToday || []
      : watchAnalytics?.topWatchedPostsAllTime || [];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8">
      <PageMeta
        title="Comprehensive Feed & View Analytics | Prithu Admin"
        description="Comprehensive Feed View analytics, user watch history, category statistics, and real-time viewing metrics."
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <PageBreadcrumb pageTitle="Feed View Analytics" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            Comprehensive view counts, real-time user view feeds, category statistics & watch metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshAll}
            disabled={isAnalyticsRefetching || isLogsRefetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-sm transition-all shadow-xs"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                isAnalyticsRefetching || isLogsRefetching ? "animate-spin text-blue-600" : ""
              }`}
            />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Feed Views */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-blue-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Feed Views
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {formatNumber(watchAnalytics?.totalPostsWatched || 0)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-blue-600 font-medium">All Time</span> across images & videos
            </p>
          </div>
        </motion.div>

        {/* Card 2: Today's Total Feed Views */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 bg-linear-to-br from-emerald-500/5 to-transparent shadow-xs relative overflow-hidden group hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Today's Total Views
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl lg:text-3xl font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">
              {formatNumber(watchAnalytics?.todayPostsWatched || 0)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">Live Today</span> feeds viewed
            </p>
          </div>
        </motion.div>

        {/* Card 3: Today's Unique Viewers */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-purple-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Viewers
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {formatNumber(watchAnalytics?.todayUniqueUsersWatched || 0)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Distinct registered users active today
            </p>
          </div>
        </motion.div>

        {/* Card 4: Total Watch Hours */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Watch Time
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {watchAnalytics?.totalWatchHours || 0} hrs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Today: <span className="font-semibold text-amber-600">{watchAnalytics?.todayWatchHours || 0} hrs</span>
            </p>
          </div>
        </motion.div>

        {/* Card 5: Top Viewed Category */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-indigo-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Top Category
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl lg:text-2xl font-bold text-indigo-900 dark:text-indigo-300 truncate tracking-tight" title={topCategory}>
              {topCategory}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Most engaging topic today
            </p>
          </div>
        </motion.div>
      </div>

      {/* Analytics Charts & Breakdowns (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Views by Category (Today & All-Time) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-500" />
                Views by Category
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live category view share & interest distribution
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              Today's Distribution
            </span>
          </div>

          <div className="space-y-4">
            {watchAnalytics?.todayCategoryWatched && watchAnalytics.todayCategoryWatched.length > 0 ? (
              watchAnalytics.todayCategoryWatched.map((cat, idx) => {
                const maxVal = watchAnalytics.todayCategoryWatched[0]?.viewsToday || 1;
                const barWidth = Math.max(Math.round((cat.viewsToday / maxVal) * 100), 6);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {cat.categoryName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatNumber(cat.viewsToday)} views
                        </span>
                        <span className="text-slate-400 text-[11px]">({cat.percentage || 0}%)</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className={`h-full rounded-full ${
                          idx === 0
                            ? "bg-linear-to-r from-indigo-500 to-blue-500"
                            : idx === 1
                            ? "bg-linear-to-r from-blue-500 to-cyan-500"
                            : "bg-linear-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700"
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">
                No category view data recorded for today yet.
              </div>
            )}
          </div>
        </div>

        {/* Right: Today's Hourly Views Trend */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                Today's Hourly View Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                24-Hour real-time feed consumption pattern
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800">
              24-Hour Cycle
            </span>
          </div>

          <div className="h-48 flex items-end gap-1.5 pt-6 pb-2 px-1">
            {watchAnalytics?.todayHourlyViews && watchAnalytics.todayHourlyViews.length > 0 ? (
              watchAnalytics.todayHourlyViews.map((h, i) => {
                const heightPercent = maxHourlyViews > 0 ? Math.round((h.views / maxHourlyViews) * 100) : 0;
                const isCurrentHour = new Date().getHours() === h.hourNum;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center group relative h-full justify-end"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-20 shadow-lg">
                      <div className="font-bold">{h.hour}</div>
                      <div>{h.views} views</div>
                    </div>

                    <div
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isCurrentHour
                          ? "bg-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-800"
                          : h.views > 0
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    />
                    <span className="text-[9px] text-slate-400 mt-1.5 hidden sm:block">
                      {h.hourNum % 4 === 0 ? h.hourNum : ""}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center text-slate-400 text-sm flex items-center justify-center h-full">
                No hourly activity available.
              </div>
            )}
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 px-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
            <span>00:00 (Midnight)</span>
            <span>12:00 (Noon)</span>
            <span>23:00 (Night)</span>
          </div>
        </div>
      </div>

      {/* Top Watched Feeds Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-amber-500" />
              Top Watched Feeds
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Most viewed video and image posts with watch metrics
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTopPostsTab("today")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                topPostsTab === "today"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Today's Top
            </button>
            <button
              onClick={() => setTopPostsTab("allTime")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                topPostsTab === "allTime"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              All-Time Top
            </button>
          </div>
        </div>

        {displayedTopPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedTopPosts.map((post, idx) => (
              <div
                key={post.feedId || idx}
                className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
                    {post.mediaUrl ? (
                      <img
                        src={post.mediaUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        {post.type === "video" ? <Film className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white uppercase">
                      #{idx + 1}
                    </span>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-semibold text-white flex items-center gap-1">
                      {post.type === "video" ? <Play className="w-2.5 h-2.5 fill-current" /> : <ImageIcon className="w-2.5 h-2.5" />}
                      {post.type}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1" title={post.title}>
                      {post.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Category: <span className="font-medium text-slate-700 dark:text-slate-300">{post.category || "General"}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{formatNumber(post.viewsToday || post.totalViews || 0)} views</span>
                  </div>
                  {post.watchDuration > 0 && (
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      ⏱️ {formatDuration(post.watchDuration)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm">
            No top watched feeds found.
          </div>
        )}
      </div>

      {/* Live User View Feeds Activity Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              Live User View Feeds Log
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live feed viewing events with viewer profiles, watch duration, and category
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Total Records:</span>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/60 dark:border-blue-800">
              {formatNumber(viewLogsData?.total || 0)}
            </span>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, email, or feed..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Dates</option>
            <option value="today">Today Only</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categoriesList.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name || c.categoriesName}
              </option>
            ))}
          </select>

          {/* Post Type Filter */}
          <select
            value={postType}
            onChange={(e) => {
              setPostType(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Post Types</option>
            <option value="image">Images Only</option>
            <option value="video">Videos Only</option>
          </select>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Viewer</th>
                <th className="py-3 px-4">Feed Content</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Watch Duration</th>
                <th className="py-3 px-4">Viewed On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
              {isLogsLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="py-4 px-4">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    </td>
                  </tr>
                ))
              ) : viewLogsData?.views && viewLogsData.views.length > 0 ? (
                viewLogsData.views.map((log) => (
                  <tr
                    key={log.viewId || log._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* User */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {log.user?.profileAvatar ? (
                          <img
                            src={log.user.profileAvatar}
                            alt={log.user.userName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs">
                            {log.user?.userName ? log.user.userName[0].toUpperCase() : "U"}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {log.user?.userName || "Anonymous"}
                          </div>
                          <div className="text-[11px] text-slate-400">{log.user?.email || "Guest"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Feed Content */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5 max-w-xs">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                          {log.feed?.mediaUrl ? (
                            <img
                              src={log.feed.mediaUrl}
                              alt={log.feed.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                              {log.postType === "video" ? "🎥" : "📷"}
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {log.feed?.title || "Untitled Post"}
                          </div>
                          <div className="text-[10px] text-slate-400">{log.deviceType || "web"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-200/60 dark:border-indigo-800">
                        <Tag className="w-3 h-3" />
                        {log.category?.name || "General"}
                      </span>
                    </td>

                    {/* Post Type */}
                    <td className="py-3 px-4">
                      {log.postType === "video" ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-semibold text-[11px]">
                          🎥 Video
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold text-[11px]">
                          📷 Image
                        </span>
                      )}
                    </td>

                    {/* Watch Duration */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-md font-semibold text-xs border border-amber-200/60 dark:border-amber-800">
                        ⏱️ {formatDuration(log.watchDuration)}
                      </span>
                    </td>

                    {/* Viewed On */}
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(log.viewedAt)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No feed view activity matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing Page <span className="font-bold text-slate-800 dark:text-slate-200">{viewLogsData?.page || 1}</span> of{" "}
            <span className="font-bold text-slate-800 dark:text-slate-200">{viewLogsData?.totalPages || 1}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || isLogsLoading}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, viewLogsData?.totalPages || 1))}
              disabled={page >= (viewLogsData?.totalPages || 1) || isLogsLoading}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
