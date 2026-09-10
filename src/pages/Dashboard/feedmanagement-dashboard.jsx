import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, 
  Image as ImageIcon, 
  Video, 
  Tag, 
  Calendar, 
  Plus, 
  TrendingUp, 
  RefreshCw, 
  Sparkles, 
  BarChart3, 
  Clock, 
  SlidersHorizontal, 
  Eye, 
  Film, 
  CheckCircle, 
  ArrowRight,
  PieChart,
  Globe,
  Flame,
  UploadCloud,
  Flag,
  BrainCircuit,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Grid,
  Search,
  Zap,
  Activity,
  Award,
  Sparkle,
  Radio,
  Sliders,
  Filter
} from "lucide-react";

import PageMeta from "../../components/common/PageMeta";
import FeedManagement from "../Tables/feedManagementTable";
import ScheduledFeedTable from "../Tables/ScheduledFeedTable";
import FeedUploadPage from "../../components/FeedUpload/FeedUploadPage";
import TrendingFeedsTable from "../treandingFeed";
import CategoryManagementPage from "../CategoryManagementPage";
import PartyManagement from "../PartyManagement/PartyManagement";
import PromptManagementPage from "../PromptManagementPage";
import AICategoryManagementPage from "../AICategoryManagementPage";
import VideoCompressionDashboard from "../AdminPages/VideoCompressionDashboard";

import { fetchFeeds, fetchCategories } from "../../Services/FeedServices/feedServices";

export default function FeedManagementDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("catalog"); 
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [featureSearchQuery, setFeatureSearchQuery] = useState("");
  const [featureFilterCategory, setFeatureFilterCategory] = useState("all");

  // Fetch feeds data
  const { 
    data: feedData = { feeds: [], totalFeeds: 0, totalImages: 0, totalVideos: 0 }, 
    isLoading: feedsLoading, 
    isFetching: feedsFetching,
    refetch: refetchFeeds 
  } = useQuery({
    queryKey: ["feeds"],
    queryFn: () => fetchFeeds({}),
    staleTime: 30000,
  });

  // Fetch categories data
  const { 
    data: categories = [], 
    isLoading: catLoading 
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 60000,
  });

  const feeds = Array.isArray(feedData) ? feedData : (Array.isArray(feedData?.feeds) ? feedData.feeds : []);

  // Computed Analytics Metrics
  const totalCount = feedData.totalFeeds || feeds.length || 0;
  const imageCount = feedData.totalImages || feeds.filter(f => f.type === "image" || !f.type?.includes("video")).length || 0;
  const videoCount = feedData.totalVideos || feeds.filter(f => f.type === "video" || f.type?.includes("video")).length || 0;
  const scheduledCount = feeds.filter(f => f.status === "scheduled").length;

  const imagePercentage = totalCount > 0 ? Math.round((imageCount / totalCount) * 100) : 0;
  const videoPercentage = totalCount > 0 ? Math.round((videoCount / totalCount) * 100) : 0;

  // Language Breakdown
  const languageStats = useMemo(() => {
    let tamil = 0;
    let english = 0;
    let both = 0;
    feeds.forEach((f) => {
      const lang = (f.language || "both").toLowerCase();
      if (lang === "tamil") tamil++;
      else if (lang === "english") english++;
      else both++;
    });
    return { tamil, english, both };
  }, [feeds]);

  // Category Distribution
  const categoryStats = useMemo(() => {
    const counts = {};
    feeds.forEach((f) => {
      if (f.categories && Array.isArray(f.categories)) {
        f.categories.forEach((c) => {
          const name = c.name || c.categoriesName || "Uncategorized";
          counts[name] = (counts[name] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [feeds]);

  // 8 Core Feed Features definition
  const feedFeaturesList = [
    {
      id: "catalog",
      name: "Feed Catalog",
      category: "content",
      path: "/social/feed-management",
      icon: Layers,
      gradient: "from-blue-600 via-indigo-600 to-violet-600",
      glowColor: "shadow-blue-500/25",
      accentBg: "bg-blue-50 dark:bg-blue-950/40",
      accentBorder: "border-blue-200 dark:border-blue-900/50",
      tagText: "text-blue-600 dark:text-blue-400",
      badge: "Core Database",
      badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/90 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
      description: "Visual media database, multi-criteria filtering, 9:16 mobile previews, bulk status actions & sync."
    },
    {
      id: "trending",
      name: "Trending Feeds",
      category: "content",
      path: "/social/trending/feed",
      icon: Flame,
      gradient: "from-amber-500 via-orange-500 to-red-500",
      glowColor: "shadow-amber-500/25",
      accentBg: "bg-amber-50 dark:bg-amber-950/40",
      accentBorder: "border-amber-200 dark:border-amber-900/50",
      tagText: "text-amber-600 dark:text-amber-400",
      badge: "Viral Boost",
      badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/90 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
      description: "Real-time viral post tracking, high-velocity views, engagement multipliers & spotlight promotions."
    },
    {
      id: "upload",
      name: "Feed Upload",
      category: "content",
      path: "/social/admin/upload/page",
      icon: UploadCloud,
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      glowColor: "shadow-emerald-500/25",
      accentBg: "bg-emerald-50 dark:bg-emerald-950/40",
      accentBorder: "border-emerald-200 dark:border-emerald-900/50",
      tagText: "text-emerald-600 dark:text-emerald-400",
      badge: "Studio 9:16",
      badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/90 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
      description: "9:16 vertical video & image studio, scheduled auto-publish queue, priority flags & multilingual tags."
    },
    {
      id: "video",
      name: "Video Dashboard",
      category: "system",
      path: "/settings/video-compression",
      icon: Film,
      gradient: "from-purple-600 via-fuchsia-600 to-pink-600",
      glowColor: "shadow-purple-500/25",
      accentBg: "bg-purple-50 dark:bg-purple-950/40",
      accentBorder: "border-purple-200 dark:border-purple-900/50",
      tagText: "text-purple-600 dark:text-purple-400",
      badge: "Transcoder",
      badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-950/90 dark:text-purple-300 border-purple-200 dark:border-purple-800/60",
      description: "Monitor video compression queues, transcoder health, automated bitrates, ML tags & storage savings."
    },
    {
      id: "categories",
      name: "Category Management",
      category: "taxonomy",
      path: "/social/category/management",
      icon: Tag,
      gradient: "from-indigo-600 via-blue-600 to-cyan-600",
      glowColor: "shadow-indigo-500/25",
      accentBg: "bg-indigo-50 dark:bg-indigo-950/40",
      accentBorder: "border-indigo-200 dark:border-indigo-900/50",
      tagText: "text-indigo-600 dark:text-indigo-400",
      badge: "Taxonomy",
      badgeClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/90 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60",
      description: "Manage hierarchical categories, sub-taxonomies, devotional deities, special calendar days & tags."
    },
    {
      id: "party",
      name: "Party Management",
      category: "taxonomy",
      path: "/social/party/management",
      icon: Flag,
      gradient: "from-rose-500 via-red-500 to-orange-600",
      glowColor: "shadow-rose-500/25",
      accentBg: "bg-rose-50 dark:bg-rose-950/40",
      accentBorder: "border-rose-200 dark:border-rose-900/50",
      tagText: "text-rose-600 dark:text-rose-400",
      badge: "Organizations",
      badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-950/90 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
      description: "Political & civic organization parties, leader symbols, promotional banners & campaign assets."
    },
    {
      id: "prompts",
      name: "Prompt Management",
      category: "ai",
      path: "/social/prompts",
      icon: Sparkles,
      gradient: "from-cyan-500 via-teal-500 to-blue-600",
      glowColor: "shadow-cyan-500/25",
      accentBg: "bg-cyan-50 dark:bg-cyan-950/40",
      accentBorder: "border-cyan-200 dark:border-cyan-900/50",
      tagText: "text-cyan-600 dark:text-cyan-400",
      badge: "AI Prompts",
      badgeClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/90 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60",
      description: "AI image generator prompts, aspect ratios (1:1, 9:16, 16:9), style presets & negative keywords."
    },
    {
      id: "aicategories",
      name: "AI Categories",
      category: "ai",
      path: "/social/ai-categories",
      icon: BrainCircuit,
      gradient: "from-violet-600 via-purple-600 to-fuchsia-600",
      glowColor: "shadow-violet-500/25",
      accentBg: "bg-violet-50 dark:bg-violet-950/40",
      accentBorder: "border-violet-200 dark:border-violet-900/50",
      tagText: "text-violet-600 dark:text-violet-400",
      badge: "Smart Vision",
      badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-950/90 dark:text-violet-300 border-violet-200 dark:border-violet-800/60",
      description: "Machine learning auto-categorization models, prompt linkage, and AI visual tagging taxonomies."
    }
  ];

  // Filtered features list
  const filteredFeatures = useMemo(() => {
    return feedFeaturesList.filter(f => {
      const matchesCat = featureFilterCategory === "all" || f.category === featureFilterCategory;
      const matchesSearch = f.name.toLowerCase().includes(featureSearchQuery.toLowerCase()) || 
                            f.description.toLowerCase().includes(featureSearchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [feedFeaturesList, featureFilterCategory, featureSearchQuery]);

  const tabs = [
    { id: "catalog", label: "CATALOG & FEEDS", count: totalCount, icon: Layers },
    { id: "trending", label: "TRENDING FEEDS", count: null, icon: Flame },
    { id: "upload", label: "UPLOAD STUDIO", count: null, icon: Plus },
    { id: "scheduled", label: "SCHEDULED QUEUE", count: scheduledCount, icon: Calendar },
    { id: "categories", label: "CATEGORY MGMT", count: categories.length, icon: Tag },
    { id: "party", label: "PARTY MGMT", count: null, icon: Flag },
    { id: "prompts", label: "PROMPT MGMT", count: null, icon: Sparkles },
    { id: "aicategories", label: "AI CATEGORIES", count: null, icon: BrainCircuit },
    { id: "video", label: "VIDEO DASHBOARD", count: null, icon: Film },
  ];

  return (
    <div className="space-y-8 max-w-[1680px] mx-auto">
      <PageMeta 
        title="Feed Management Dashboard | Prithu Admin" 
        description="Comprehensive feed catalog control, scheduling, analytics, and category management" 
      />

      {/* =========================================================================
          1. ULTRA-PREMIUM HERO BANNER WITH GLOWING ACCENTS & DYNAMIC ACTION TOOLBAR
      ========================================================================= */}
      <div className="relative">
        <div className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-slate-950 via-[#0a101f] to-[#161938] text-white p-6 sm:p-8 lg:p-10 shadow-2xl border border-indigo-500/20 pb-16 sm:pb-20">
          
          {/* Futuristic Mesh Background & Ambient Glow Orbs */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-blue-600/25 blur-[90px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-[80px] pointer-events-none" />
          <div className="absolute top-1/2 left-0 -ml-10 w-60 h-60 rounded-full bg-cyan-500/15 blur-[70px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Title & Subtitle */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-blue-500/15 backdrop-blur-xl text-blue-300 border border-blue-400/30 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
                  CONTENT INTELLIGENCE SUITE
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-600/40 backdrop-blur-md shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  8 Active Feed Modules
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium text-slate-300 bg-white/5 border border-white/10 backdrop-blur-md">
                  <Radio className="w-3 h-3 text-cyan-400" />
                  Live Sync
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-md">
                Feed Management Dashboard
              </h1>

              <p className="text-xs sm:text-sm text-slate-300/90 max-w-2xl font-medium leading-relaxed">
                Centralized visual media operations, viral discovery, 9:16 mobile publishing studio, multi-tier categories & AI prompt engineering.
              </p>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("upload");
                  const el = document.getElementById("feed-workspace-tabs");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-violet-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 border border-blue-400/30 cursor-pointer"
              >
                <Plus size={16} className="stroke-[2.5]" />
                <span>Upload New Feed</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("trending");
                  const el = document.getElementById("feed-workspace-tabs");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/15 backdrop-blur-md text-amber-300 rounded-2xl text-xs font-bold border border-white/15 transition-all hover:border-amber-400/40 cursor-pointer shadow-xs"
              >
                <Flame size={14} className="text-amber-400" />
                <span>Trending Feeds</span>
              </button>

              {/* Quick Jump Dropdown Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsQuickNavOpen(!isQuickNavOpen)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white rounded-2xl text-xs font-bold border border-white/15 transition-all cursor-pointer shadow-xs"
                >
                  <Grid size={14} className="text-cyan-400" />
                  <span>All Features (8)</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isQuickNavOpen ? "rotate-180" : ""}`} />
                </button>

                {isQuickNavOpen && (
                  <div className="absolute right-0 mt-2 w-76 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1.5 border-b border-slate-800 mb-1.5">
                      Feed Feature Ecosystem
                    </p>
                    <div className="space-y-1 max-h-72 overflow-y-auto custom-scrollbar">
                      {feedFeaturesList.map((feature) => {
                        const Icon = feature.icon;
                        return (
                          <button
                            key={feature.id}
                            type="button"
                            onClick={() => {
                              setActiveTab(feature.id);
                              setIsQuickNavOpen(false);
                              const el = document.getElementById("feed-workspace-tabs");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/10 text-left transition-colors text-xs font-bold text-slate-200 group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${feature.gradient} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                                <Icon size={14} />
                              </div>
                              <span className="truncate max-w-[150px]">{feature.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 group-hover:text-cyan-300 font-semibold">
                              Open →
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  refetchFeeds();
                  queryClient.invalidateQueries({ queryKey: ["categories"] });
                }}
                className="p-2.5 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white rounded-2xl border border-white/15 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                title="Refresh Catalog Data"
              >
                <RefreshCw size={15} className={feedsFetching ? "animate-spin text-blue-300" : ""} />
              </button>
            </div>

          </div>
        </div>

        {/* =========================================================================
            2. OVERLAPPING KPI PERFORMANCE & CATALOG SUMMARY CARDS
        ========================================================================= */}
        <div className="-mt-10 sm:-mt-12 lg:-mt-14 px-3 sm:px-6 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Total Live Feeds */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl hover:shadow-2xl hover:border-blue-500/40 hover:-translate-y-1.5 transition-all duration-300 flex items-center justify-between group">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                  Total Live Feeds
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {totalCount}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Active in catalog
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all shrink-0">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            {/* Image Feeds */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl hover:shadow-2xl hover:border-emerald-500/40 hover:-translate-y-1.5 transition-all duration-300 flex items-center justify-between group">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                  Image Feeds
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {imageCount}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {imagePercentage}% of library
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
            </div>

            {/* Video Feeds */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl hover:shadow-2xl hover:border-purple-500/40 hover:-translate-y-1.5 transition-all duration-300 flex items-center justify-between group">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                  Video Feeds
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {videoCount}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  {videoPercentage}% of library
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all shrink-0">
                <Video className="w-6 h-6" />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl hover:shadow-2xl hover:border-amber-500/40 hover:-translate-y-1.5 transition-all duration-300 flex items-center justify-between group">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                  Categories
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {categories.length}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Taxonomy groups
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all shrink-0">
                <Tag className="w-6 h-6" />
              </div>
            </div>

            {/* Scheduled Queue */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl hover:shadow-2xl hover:border-rose-500/40 hover:-translate-y-1.5 transition-all duration-300 flex items-center justify-between group">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
                  Scheduled Queue
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {scheduledCount}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Auto-publish queue
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all shrink-0">
                <Clock className="w-6 h-6" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================================
          3. FEED MANAGEMENT FEATURE SUITE (8 INTEGRATED MODULES)
      ========================================================================= */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-lg">
        
        {/* Header & Category Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7 pb-5 border-b border-slate-200/60 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 shadow-xs">
                <Grid size={18} />
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Feed Management Ecosystem & Tools
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Explore and launch all 8 modules for visual content publishing, AI prompt engineering & category structures
            </p>
          </div>

          {/* Search and Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={featureSearchQuery}
                onChange={(e) => setFeatureSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-36 sm:w-48 transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              {[
                { id: "all", label: "All (8)" },
                { id: "content", label: "Content" },
                { id: "taxonomy", label: "Taxonomy" },
                { id: "ai", label: "AI & ML" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setFeatureFilterCategory(pill.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    featureFilterCategory === pill.id
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-600/50"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 8 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredFeatures.map((feature) => {
            const Icon = feature.icon;
            const isTabActive = activeTab === feature.id;

            return (
              <div 
                key={feature.id}
                className={`relative rounded-3xl p-5 transition-all duration-300 border flex flex-col justify-between group overflow-hidden ${
                  isTabActive
                    ? "bg-blue-50/90 dark:bg-blue-950/60 border-blue-500 dark:border-blue-500 shadow-xl ring-2 ring-blue-500/20 -translate-y-1.5"
                    : "bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800/90 border-slate-200/70 dark:border-slate-700/60 hover:shadow-2xl hover:border-blue-500/30 hover:-translate-y-2"
                }`}
              >
                {/* Subtle Card Ambient Glow on Hover */}
                <div className={`absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-tr ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 pointer-events-none rounded-full`} />

                <div>
                  {/* Top Header: Icon + Badge */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feature.gradient} text-white flex items-center justify-center shadow-lg ${feature.glowColor} group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0`}>
                      <Icon size={22} className="stroke-[2.2]" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${feature.badgeClass}`}>
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4 line-clamp-2">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom Action Links */}
                <div className="flex items-center gap-2 pt-3.5 border-t border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab(feature.id);
                      const el = document.getElementById("feed-workspace-tabs");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs ${
                      isTabActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 font-black"
                        : "bg-white dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                    }`}
                  >
                    <span>{isTabActive ? "Active View" : "Open Tab"}</span>
                  </button>

                  <Link
                    to={feature.path}
                    className="p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 transition-all hover:scale-105 active:scale-95 shadow-2xs"
                    title={`Open ${feature.name} full page`}
                  >
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          4. VISUAL DISTRIBUTION & ANALYTICS BREAKDOWN
      ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Media Format Ratio */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <PieChart size={16} className="text-blue-600" />
                Media Ratio Breakdown
              </h3>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">{totalCount} Total</span>
            </div>

            {/* Progress Stacked Bar */}
            <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex my-3 p-0.5 border border-slate-200/50 dark:border-slate-700/50">
              <div style={{ width: `${imagePercentage}%` }} className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-l-full transition-all" title={`Images: ${imagePercentage}%`} />
              <div style={{ width: `${videoPercentage}%` }} className="bg-gradient-to-r from-purple-500 to-pink-600 h-full rounded-r-full transition-all" title={`Videos: ${videoPercentage}%`} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300">Images</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{imageCount} <span className="text-[11px] font-semibold text-emerald-600">({imagePercentage}%)</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30">
                <div className="w-3 h-3 rounded-full bg-purple-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-purple-800 dark:text-purple-300">Videos</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{videoCount} <span className="text-[11px] font-semibold text-purple-600">({videoPercentage}%)</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Categories Distribution */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Tag size={16} className="text-amber-500" />
                Top Active Categories
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("categories");
                  const el = document.getElementById("feed-workspace-tabs");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Manage All →
              </button>
            </div>

            <div className="space-y-1.5 mt-2">
              {categoryStats.length > 0 ? (
                categoryStats.map(([catName, count], idx) => {
                  const rankColors = [
                    "from-amber-400 to-orange-500 text-white",
                    "from-slate-400 to-slate-500 text-white",
                    "from-amber-600 to-amber-700 text-white",
                  ];
                  const rankClass = idx < 3 ? rankColors[idx] : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300";

                  return (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center bg-gradient-to-tr ${rankClass}`}>
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[170px]">{catName}</span>
                      </div>
                      <span className="font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-lg text-[10px] border border-blue-200/50 dark:border-blue-900/50">
                        {count} posts
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No category data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Language Distribution */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Globe size={16} className="text-indigo-600" />
                Language Reach
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Multilingual Feeds</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="p-3 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Tamil</p>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{languageStats.tamil}</p>
              </div>

              <div className="p-3 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase">English</p>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{languageStats.english}</p>
              </div>

              <div className="p-3 text-center rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/50">
                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">Both</p>
                <p className="text-lg font-black text-blue-700 dark:text-blue-300 mt-0.5">{languageStats.both}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 mt-3">
            <span>Default Setting: Both</span>
            <button
              type="button"
              onClick={() => {
                setActiveTab("upload");
                const el = document.getElementById("feed-workspace-tabs");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Create Post →
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================================
          5. INTEGRATED MULTI-FEATURE WORKSPACE TABS
      ========================================================================= */}
      <div id="feed-workspace-tabs" className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-lg">
        
        {/* Tab Headers */}
        <div className="flex items-center overflow-x-auto border-b border-slate-200/80 dark:border-slate-800/80 px-4 pt-3 gap-2 bg-slate-100/50 dark:bg-slate-950/40 custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold tracking-wider rounded-t-2xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-sm"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected 
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" 
                      : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="p-4 sm:p-7">
          <AnimatePresence mode="wait">
            {activeTab === "catalog" && (
              <motion.div
                key="catalog"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <FeedManagement />
              </motion.div>
            )}

            {activeTab === "trending" && (
              <motion.div
                key="trending"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <TrendingFeedsTable />
              </motion.div>
            )}

            {activeTab === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <FeedUploadPage />
              </motion.div>
            )}

            {activeTab === "scheduled" && (
              <motion.div
                key="scheduled"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ScheduledFeedTable />
              </motion.div>
            )}

            {activeTab === "categories" && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <CategoryManagementPage />
              </motion.div>
            )}

            {activeTab === "party" && (
              <motion.div
                key="party"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <PartyManagement />
              </motion.div>
            )}

            {activeTab === "prompts" && (
              <motion.div
                key="prompts"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <PromptManagementPage />
              </motion.div>
            )}

            {activeTab === "aicategories" && (
              <motion.div
                key="aicategories"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <AICategoryManagementPage />
              </motion.div>
            )}

            {activeTab === "video" && (
              <motion.div
                key="video"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <VideoCompressionDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
