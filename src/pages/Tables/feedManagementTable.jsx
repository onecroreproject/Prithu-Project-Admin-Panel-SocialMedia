import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Eye, 
  Trash2, 
  Calendar, 
  Play, 
  Edit3, 
  Image as ImageIcon, 
  Plus, 
  Layers, 
  Video, 
  Filter, 
  RotateCcw, 
  Search, 
  Sparkles, 
  Clock, 
  Tag, 
  User, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

import { 
  fetchFeeds, 
  deleteFeed, 
  removeFeedCategory, 
  fetchCategories 
} from "../../Services/FeedServices/feedServices";
import useFeedFilter from "../../hooks/filter";
import usePagination from "../../hooks/pagePagination";
import FeedPreviewModal from "../../components/common/FeedPreviewModal";
import FeedOverlayEditModal from "../../components/common/FeedOverlayEditModal";
import FeedCategoryEditModal from "../../components/common/FeedCategoryEditModal";

export default function FeedManagement() {
  const queryClient = useQueryClient();
  const { filters, handleFilterChange, resetFilters, applyFilters } = useFeedFilter();
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [editingFeed, setEditingFeed] = useState(null);
  const [editingCategoryFeed, setEditingCategoryFeed] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch feeds
  const { 
    data: feedData = { feeds: [], totalFeeds: 0, totalImages: 0, totalVideos: 0 }, 
    isLoading: feedsLoading, 
    isError: feedsError, 
    error: feedsErr,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["feeds", filters.startDate, filters.endDate],
    queryFn: () => fetchFeeds({ fromDate: filters.startDate || undefined, toDate: filters.endDate || undefined }),
  });

  const rawFeeds = feedData.feeds || [];

  // Fetch categories & filter out "God Quotes"
  const { data: rawCategories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const categories = useMemo(() => {
    return (rawCategories || []).filter(c => {
      const name = (c.categoriesName || c.name || '').toLowerCase().trim();
      return !name.includes('quote');
    });
  }, [rawCategories]);

  // Mutation: Delete feed
  const deleteMutation = useMutation({
    mutationFn: ({ feedId }) => deleteFeed({ feedId }),
    onMutate: async ({ feedId }) => {
      await queryClient.cancelQueries({ queryKey: ["feeds"] });
      queryClient.setQueriesData({ queryKey: ["feeds"] }, (oldData) => {
        if (!oldData || !oldData.feeds) return oldData;
        return {
          ...oldData,
          feeds: oldData.feeds.filter(f => f._id !== feedId)
        };
      });
    },
    onSuccess: () => {
      toast.success("Feed permanently deleted!");
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
    },
    onError: (err) => {
      toast.error(err.message || "Delete failed");
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
    },
  });

  // Filter feeds (exclude scheduled + search by query + apply custom filters)
  const nonScheduledFeeds = useMemo(() => {
    return rawFeeds.filter(f => f.status !== 'scheduled');
  }, [rawFeeds]);

  const searchedFeeds = useMemo(() => {
    if (!searchQuery.trim()) return nonScheduledFeeds;
    const q = searchQuery.toLowerCase().trim();
    return nonScheduledFeeds.filter(f => {
      const title = (f.title || f.caption || '').toLowerCase();
      const creator = (f.creator?.userName || f.creator?.name || '').toLowerCase();
      const id = String(f._id || '').toLowerCase();
      const cats = (f.categories || []).map(c => (c.name || '').toLowerCase()).join(' ');
      const sub = (f.subCategory || '').toLowerCase();
      return title.includes(q) || creator.includes(q) || id.includes(q) || cats.includes(q) || sub.includes(q);
    });
  }, [nonScheduledFeeds, searchQuery]);

  const filteredFeeds = applyFilters(searchedFeeds);

  // Pagination (10 per page)
  const { page, totalPages, currentItems, nextPage, prevPage, resetPage } =
    usePagination(filteredFeeds, 10);

  // Date picker refs
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  // Delete Handler
  const handleDelete = (feedId) => {
    if (window.confirm("Are you sure you want to permanently delete this feed item? This cannot be undone.")) {
      deleteMutation.mutate({ feedId });
    }
  };

  // Percentage calculations
  const totalCount = feedData.totalFeeds || rawFeeds.length || 0;
  const imageCount = feedData.totalImages || rawFeeds.filter(f => f.type !== 'video').length || 0;
  const videoCount = feedData.totalVideos || rawFeeds.filter(f => f.type === 'video').length || 0;

  const imagePercent = totalCount > 0 ? Math.round((imageCount / totalCount) * 100) : 0;
  const videoPercent = totalCount > 0 ? Math.round((videoCount / totalCount) * 100) : 0;

  const hasActiveFilters = Boolean(
    filters.type || 
    filters.categoryId || 
    filters.startDate || 
    filters.endDate || 
    filters.isToday || 
    searchQuery.trim()
  );

  return (
    <div className="w-full space-y-6">
      
      {/* ============================================================
          TOP HEADER & OVERVIEW
      ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Feed Management
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Review, filter, inspect and manage active media feeds across all platforms
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-2xs active:scale-95 disabled:opacity-60 cursor-pointer"
            title="Refresh Feed List"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`} />
            <span>{isFetching ? "Syncing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          STATISTICS OVERVIEW CARDS
      ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Feeds */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/20 dark:from-slate-850 dark:to-slate-900 p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Total Feeds
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {totalCount.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">published items</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3" /> Live & Public
            </span>
          </div>
        </div>

        {/* Card 2: Total Images */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/20 dark:from-slate-850 dark:to-slate-900 p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Photos & Banners
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {imageCount.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">images</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-full bg-emerald-100 dark:bg-emerald-950 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${imagePercent}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
              {imagePercent}%
            </span>
          </div>
        </div>

        {/* Card 3: Total Videos */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-100 dark:border-purple-900/30 bg-gradient-to-br from-purple-50/70 via-white to-purple-50/20 dark:from-slate-850 dark:to-slate-900 p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Video Clips
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {videoCount.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">videos</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-full bg-purple-100 dark:bg-purple-950 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${videoPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 shrink-0">
              {videoPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          FILTER TOOLBAR
      ============================================================ */}
      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/60 backdrop-blur-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, creator, category, ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                resetPage();
              }}
              className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  resetPage();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                handleFilterChange("type", "");
                resetPage();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                !filters.type
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => {
                handleFilterChange("type", "image");
                resetPage();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filters.type === "image"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Images</span>
            </button>
            <button
              onClick={() => {
                handleFilterChange("type", "video");
                resetPage();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filters.type === "video"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos</span>
            </button>
          </div>

          {/* Today Filter Pill */}
          <button
            onClick={() => {
              handleFilterChange("isToday", !filters.isToday);
              resetPage();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              filters.isToday
                ? "bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/25"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today's Feeds</span>
          </button>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          
          {/* Category Dropdown */}
          <div className="flex-1 min-w-[200px]">
            <select
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold outline-none focus:border-blue-500 transition-all cursor-pointer"
              value={filters.categoryId}
              onChange={(e) => {
                handleFilterChange("categoryId", e.target.value);
                resetPage();
              }}
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.categoryId || cat._id} value={cat.categoryId || cat._id}>
                  {cat.categoriesName || cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                ref={startDateRef}
                type="date"
                className="pl-3 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium outline-none focus:border-blue-500"
                value={filters.startDate}
                onChange={(e) => {
                  handleFilterChange("startDate", e.target.value);
                  resetPage();
                }}
              />
              <Calendar 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 cursor-pointer" 
                onClick={() => startDateRef.current?.showPicker?.()} 
              />
            </div>
            <span className="text-xs text-slate-400 font-bold">to</span>
            <div className="relative">
              <input
                ref={endDateRef}
                type="date"
                className="pl-3 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium outline-none focus:border-blue-500"
                value={filters.endDate}
                onChange={(e) => {
                  handleFilterChange("endDate", e.target.value);
                  resetPage();
                }}
              />
              <Calendar 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 cursor-pointer" 
                onClick={() => endDateRef.current?.showPicker?.()} 
              />
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                resetFilters();
                setSearchQuery("");
                resetPage();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}

          <div className="ml-auto text-xs font-bold text-slate-500 dark:text-slate-400">
            Found <span className="text-blue-600 dark:text-blue-400 font-black">{filteredFeeds.length}</span> results
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN DATA TABLE
      ============================================================ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {feedsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Loading Feeds...
            </p>
          </div>
        ) : feedsError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Unable to load feeds</p>
            <p className="text-xs text-rose-500 mt-1">{feedsErr?.message || "Unknown server error"}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Filter className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No feeds match criteria</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Try adjusting your search query, clearing your date range, or resetting filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  resetFilters();
                  setSearchQuery("");
                  resetPage();
                }}
                className="mt-4 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Media Content</th>
                  <th className="py-3.5 px-4 w-28">Type</th>
                  <th className="py-3.5 px-4 w-28">Status</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Creator</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Categories & Tags</th>
                  <th className="py-3.5 px-4 w-36 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {currentItems.map((feed, idx) => {
                  const globalIdx = (page - 1) * 10 + idx + 1;
                  const isVideo = feed.type === "video";
                  const creatorName = feed.creator?.userName || feed.creator?.name || "Admin Studio";

                  return (
                    <tr 
                      key={feed._id} 
                      className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Index */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                        {globalIdx}
                      </td>

                      {/* Media Thumbnail & Details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            onClick={() => setSelectedFeed(feed)}
                            className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer shadow-2xs group/media transition-all hover:scale-105 hover:shadow-md"
                          >
                            {isVideo ? (
                              <>
                                <video
                                  src={`${feed.contentUrl}#t=0.001`}
                                  poster={feed.thumbnailUrl || feed.contentUrl}
                                  className="w-full h-full object-cover"
                                  muted
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md group-hover/media:scale-110 transition-transform">
                                    <Play className="w-3 h-3 fill-slate-900 ml-0.5" />
                                  </div>
                                </div>
                              </>
                            ) : feed.contentUrl ? (
                              <img
                                src={feed.contentUrl}
                                alt={feed.title || "feed"}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}

                            {/* Aspect badge */}
                            <span className="absolute bottom-1 right-1 text-[9px] font-black uppercase tracking-tight bg-black/75 text-white px-1 rounded">
                              {isVideo ? "VID" : "IMG"}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p 
                              onClick={() => setSelectedFeed(feed)}
                              className="font-bold text-slate-900 dark:text-white truncate hover:text-blue-600 transition-colors cursor-pointer" 
                              title={feed.title || feed.caption || "Untitled Feed"}
                            >
                              {feed.title || feed.caption || "Untitled Feed"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                ID: {String(feed._id).slice(-6)}
                              </span>
                              {feed.createdAt && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(feed.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          isVideo 
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40" 
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                        }`}>
                          {isVideo ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                          <span>{feed.type}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          feed.status === 'scheduled'
                            ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${feed.status === 'scheduled' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                          <span>{feed.status || "active"}</span>
                        </span>
                      </td>

                      {/* Creator */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {creatorName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                            {creatorName}
                          </span>
                        </div>
                      </td>

                      {/* Categories & Subcategories */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {feed.categories && feed.categories.length > 0 ? (
                            <>
                              {feed.categories.map((cat) => (
                                <span
                                  key={cat.id || cat._id}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/40"
                                >
                                  <Tag className="w-2.5 h-2.5 text-blue-500" />
                                  <span>{cat.name}</span>
                                </span>
                              ))}
                              {feed.subCategory && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/40">
                                  <span>✦ {feed.subCategory}</span>
                                </span>
                              )}
                              <button
                                onClick={() => setEditingCategoryFeed(feed)}
                                className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                                title="Edit Assigned Category"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-400 italic">No category</span>
                              <button
                                onClick={() => setEditingCategoryFeed(feed)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                              >
                                <Plus className="w-2.5 h-2.5" /> Add
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Live Preview Button */}
                          <button
                            onClick={() => setSelectedFeed(feed)}
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all shadow-2xs"
                            title="Preview Content"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Overlays / Template */}
                          <button
                            onClick={() => setEditingFeed(feed)}
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all shadow-2xs"
                            title="Edit Overlays & Frames"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Feed */}
                          <button
                            onClick={() => handleDelete(feed._id)}
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all shadow-2xs"
                            title="Delete Feed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================
            TABLE PAGINATION FOOTER
        ============================================================ */}
        {!feedsLoading && filteredFeeds.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{(page - 1) * 10 + 1}</span> to{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.min(page * 10, filteredFeeds.length)}
              </span>{" "}
              of <span className="font-bold text-slate-900 dark:text-white">{filteredFeeds.length}</span> feeds
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="px-3 py-1 text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200/50 dark:border-blue-900/40">
                {page} / {totalPages || 1}
              </span>

              <button
                onClick={nextPage}
                disabled={page === totalPages || totalPages === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          MODALS
      ============================================================ */}
      {selectedFeed && (
        <FeedPreviewModal
          feed={selectedFeed}
          onClose={() => setSelectedFeed(null)}
        />
      )}

      {editingFeed && (
        <FeedOverlayEditModal
          feed={editingFeed}
          onClose={() => setEditingFeed(null)}
        />
      )}

      {editingCategoryFeed && (
        <FeedCategoryEditModal
          feed={editingCategoryFeed}
          categories={categories}
          onClose={() => setEditingCategoryFeed(null)}
        />
      )}

    </div>
  );
}
