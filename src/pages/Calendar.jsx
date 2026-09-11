import { useState, useRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Eye, 
  Edit, 
  Trash, 
  Play, 
  Layers, 
  Sparkles, 
  Filter, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Image as ImageIcon, 
  Video,
  X,
  ExternalLink
} from "lucide-react";

import PageMeta from "../components/common/PageMeta";
import { fetchFeeds, deleteFeed } from "../Services/FeedServices/feedServices";
import FeedPreviewModal from "../components/common/FeedPreviewModal";
import FeedOverlayEditModal from "../components/common/FeedOverlayEditModal";
import ScheduleEditModal from "../components/common/ScheduleEditModal";

export default function Calendar() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  // Filter state
  const [filterType, setFilterType] = useState("all"); // "all", "scheduled", "with_calendar", "published"

  // Modals state
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [editingOverlayFeed, setEditingOverlayFeed] = useState(null);
  const [schedulingFeed, setSchedulingFeed] = useState(null);
  const [feedDetailsModalOpen, setFeedDetailsModalOpen] = useState(false);
  const [activeFeedInModal, setActiveFeedInModal] = useState(null);

  // Fetch Feeds
  const { data: feedData = { feeds: [] }, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["feeds"],
    queryFn: fetchFeeds,
  });

  const feeds = feedData.feeds || [];

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: ({ feedId }) => deleteFeed({ feedId }),
    onSuccess: () => {
      toast.success("Feed deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
      setFeedDetailsModalOpen(false);
    },
    onError: (err) => toast.error(err.message || "Failed to delete feed"),
  });

  // Calculate stats
  const stats = useMemo(() => {
    const scheduled = feeds.filter(f => f.status === "scheduled");
    const withCalendar = feeds.filter(f => 
      f.designMetadata?.overlayElements?.some(el => el.type === 'calendar' && el.visible !== false)
    );
    const todayStr = new Date().toISOString().split("T")[0];
    const todayCount = feeds.filter(f => {
      const d = f.scheduleDate || f.createdAt;
      return d && d.startsWith(todayStr);
    }).length;

    return {
      total: feeds.length,
      scheduled: scheduled.length,
      withCalendar: withCalendar.length,
      todayCount
    };
  }, [feeds]);

  // Filtered feeds mapping to calendar events
  const calendarEvents = useMemo(() => {
    return feeds
      .filter((feed) => {
        const hasCalendarLayer = feed.designMetadata?.overlayElements?.some(
          (el) => el.type === 'calendar' && el.visible !== false
        );
        if (filterType === "scheduled") return feed.status === "scheduled";
        if (filterType === "with_calendar") return hasCalendarLayer;
        if (filterType === "published") return feed.status !== "scheduled";
        return true;
      })
      .map((feed) => {
        const hasCalendarLayer = feed.designMetadata?.overlayElements?.some(
          (el) => el.type === 'calendar' && el.visible !== false
        );
        const isScheduled = feed.status === "scheduled";
        const dateStr = feed.scheduleDate || feed.createdAt || new Date().toISOString();

        return {
          id: feed._id,
          title: feed.caption || feed.title || (feed.creator?.userName ? `${feed.creator.userName}'s Feed` : "Feed Post"),
          start: dateStr,
          allDay: !feed.scheduleDate,
          extendedProps: {
            feed,
            type: feed.type || "image",
            hasCalendarLayer,
            isScheduled,
            creator: feed.creator?.userName || "Admin",
            contentUrl: feed.contentUrl,
            designMetadata: feed.designMetadata,
          },
        };
      });
  }, [feeds, filterType]);

  const handleEventClick = (clickInfo) => {
    const feed = clickInfo.event.extendedProps.feed;
    if (feed) {
      setActiveFeedInModal(feed);
      setFeedDetailsModalOpen(true);
    }
  };

  const handleDateSelect = (selectInfo) => {
    // Navigate to feed upload with scheduled date preselected if clicked
    navigate("/social/admin/upload/page");
  };

  return (
    <>
      <PageMeta
        title="Feed & Schedule Calendar | Prithu Admin"
        description="Manage scheduled feeds, calendar overlays, and layers visually on a calendar."
      />

      <div className="space-y-6">
        {/* Top Header & Metrics */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-wide">
                    Feed Schedule & Calendar Layers
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Visual feed scheduling with live preview and template overlay controls
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                disabled={isLoading || isRefetching}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
                title="Refresh Calendar"
              >
                <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin text-blue-600" : ""}`} />
              </button>

              <button
                onClick={() => navigate("/social/admin/upload/page")}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload & Schedule</span>
              </button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                Total Feeds
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {stats.total}
              </span>
            </div>

            <div className="bg-blue-50/60 dark:bg-blue-900/10 p-3.5 rounded-2xl border border-blue-100/60 dark:border-blue-900/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
                Scheduled Posts
              </span>
              <span className="text-xl font-black text-blue-700 dark:text-blue-300">
                {stats.scheduled}
              </span>
            </div>

            <div className="bg-amber-50/60 dark:bg-amber-900/10 p-3.5 rounded-2xl border border-amber-100/60 dark:border-amber-900/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> With Calendar Layer
              </span>
              <span className="text-xl font-black text-amber-700 dark:text-amber-300">
                {stats.withCalendar}
              </span>
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-900/10 p-3.5 rounded-2xl border border-emerald-100/60 dark:border-emerald-900/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                Today's Feeds
              </span>
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                {stats.todayCount}
              </span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 mr-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>
            {[
              { id: "all", label: "All Feeds" },
              { id: "scheduled", label: "Scheduled Only" },
              { id: "with_calendar", label: "📅 Calendar Layer Only" },
              { id: "published", label: "Published Feeds" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === tab.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Calendar View Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="custom-calendar min-h-[600px]">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={calendarEvents}
              selectable={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              dayMaxEvents={3}
              height="auto"
            />
          </div>
        </div>
      </div>

      {/* Feed Details & Layers Drawer / Modal */}
      {feedDetailsModalOpen && activeFeedInModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Feed Details & Overlays
                  </h3>
                  <p className="text-xs text-slate-500">
                    ID: {activeFeedInModal._id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFeedDetailsModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Media Preview & Core Info */}
              <div className="flex flex-col sm:flex-row gap-5 items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-black shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm group">
                  {activeFeedInModal.type === "video" ? (
                    <video
                      src={activeFeedInModal.contentUrl}
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                    />
                  ) : activeFeedInModal.contentUrl ? (
                    <img
                      src={activeFeedInModal.contentUrl}
                      className="w-full h-full object-cover"
                      alt="Feed Preview"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                      No Media
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedFeed(activeFeedInModal)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Live Canvas Preview"
                  >
                    <Eye className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      activeFeedInModal.status === "scheduled"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    }`}>
                      {activeFeedInModal.status === "scheduled" ? "Scheduled" : "Published"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase">
                      {activeFeedInModal.type}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                    {activeFeedInModal.caption || activeFeedInModal.title || "Untitled Post"}
                  </h4>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(activeFeedInModal.scheduleDate || activeFeedInModal.createdAt).toLocaleString()}
                    </span>
                    <span>By: <strong className="text-slate-700 dark:text-slate-300">{activeFeedInModal.creator?.userName || "Admin"}</strong></span>
                  </div>
                </div>
              </div>

              {/* Layers & Template Overview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-500" /> Active Design Layers
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {activeFeedInModal.designMetadata?.overlayElements?.length || 0} Layers Configured
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Calendar Layer Card */}
                  {(() => {
                    const calEl = activeFeedInModal.designMetadata?.overlayElements?.find(
                      (el) => el.type === 'calendar'
                    );
                    const isActive = calEl && calEl.visible !== false;
                    const calConfig = calEl?.calendarConfig || {};
                    return (
                      <div className={`p-4 rounded-2xl border transition-all ${
                        isActive 
                          ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800" 
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-60"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            📅 Calendar Overlay
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            isActive ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-500"
                          }`}>
                            {isActive ? "Active" : "Disabled"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Style: <strong className="text-slate-700 dark:text-slate-300 capitalize">{calConfig.style || "Simple Icon"}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Format: <strong className="text-slate-700 dark:text-slate-300">{calConfig.format || "DD.MM.YYYY"}</strong>
                        </p>
                      </div>
                    );
                  })()}

                  {/* Avatar Layer Card */}
                  {(() => {
                    const avatarEl = activeFeedInModal.designMetadata?.overlayElements?.find(
                      (el) => el.type === 'avatar'
                    );
                    const isActive = avatarEl && avatarEl.visible !== false;
                    return (
                      <div className={`p-4 rounded-2xl border transition-all ${
                        isActive 
                          ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800" 
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-60"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            👤 Avatar Layer
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            isActive ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                          }`}>
                            {isActive ? "Active" : "Disabled"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Shape: <strong className="text-slate-700 dark:text-slate-300 capitalize">{avatarEl?.avatarConfig?.shape || avatarEl?.shape || "Circle"}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Motion: <strong className="text-slate-700 dark:text-slate-300">{avatarEl?.animation?.enabled ? avatarEl.animation.direction : "None"}</strong>
                        </p>
                      </div>
                    );
                  })()}

                  {/* Logo Layer Card */}
                  {(() => {
                    const logoEl = activeFeedInModal.designMetadata?.overlayElements?.find(
                      (el) => el.type === 'logo'
                    );
                    const isActive = logoEl && logoEl.visible !== false;
                    return (
                      <div className={`p-4 rounded-2xl border transition-all ${
                        isActive 
                          ? "bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800" 
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-60"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            🏷️ Brand Logo
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            isActive ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-500"
                          }`}>
                            {isActive ? "Active" : "Disabled"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Position: <strong className="text-slate-700 dark:text-slate-300">{logoEl?.xPercent ?? 80}% X, {logoEl?.yPercent ?? 5}% Y</strong>
                        </p>
                      </div>
                    );
                  })()}

                  {/* Username Layer Card */}
                  {(() => {
                    const userEl = activeFeedInModal.designMetadata?.overlayElements?.find(
                      (el) => el.type === 'username'
                    );
                    const isActive = userEl && userEl.visible !== false;
                    return (
                      <div className={`p-4 rounded-2xl border transition-all ${
                        isActive 
                          ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" 
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-60"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            ✏️ Username Text
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            isActive ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                          }`}>
                            {isActive ? "Active" : "Disabled"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Text: <strong className="text-slate-700 dark:text-slate-300">{userEl?.text || "User Name"}</strong>
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Footer / Action Buttons */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedFeed(activeFeedInModal);
                  }}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Full Live Preview</span>
                </button>

                <button
                  onClick={() => {
                    setSchedulingFeed(activeFeedInModal);
                  }}
                  className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>Reschedule</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this feed?")) {
                      deleteMutation.mutate({ feedId: activeFeedInModal._id });
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash className="w-4 h-4" />
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => {
                    setEditingOverlayFeed(activeFeedInModal);
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Overlays & Layers</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Live Preview Modal */}
      {selectedFeed && (
        <FeedPreviewModal
          feed={selectedFeed}
          onClose={() => setSelectedFeed(null)}
        />
      )}

      {/* Layer / Template Editor Modal */}
      {editingOverlayFeed && (
        <FeedOverlayEditModal
          feed={editingOverlayFeed}
          onClose={() => {
            setEditingOverlayFeed(null);
            queryClient.invalidateQueries({ queryKey: ["feeds"] });
          }}
        />
      )}

      {/* Schedule Edit Modal */}
      {schedulingFeed && (
        <ScheduleEditModal
          feed={schedulingFeed}
          onClose={() => setSchedulingFeed(null)}
          onSuccess={() => {
            setSchedulingFeed(null);
            queryClient.invalidateQueries({ queryKey: ["feeds"] });
            setFeedDetailsModalOpen(false);
          }}
        />
      )}
    </>
  );
}

const renderEventContent = (eventInfo) => {
  const { feed, type, hasCalendarLayer, isScheduled } = eventInfo.event.extendedProps;
  return (
    <div className={`flex items-center gap-1.5 p-1 rounded-md text-xs font-semibold overflow-hidden transition-all shadow-xs cursor-pointer ${
      isScheduled 
        ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
    }`}>
      {feed?.contentUrl && (
        <div className="w-4 h-4 rounded-xs shrink-0 overflow-hidden bg-black/10">
          {type === 'video' ? (
            <video src={feed.contentUrl} className="w-full h-full object-cover" muted />
          ) : (
            <img src={feed.contentUrl} className="w-full h-full object-cover" alt="" />
          )}
        </div>
      )}
      <span className="truncate flex-1 font-bold text-[11px]">{eventInfo.event.title}</span>
      {hasCalendarLayer && (
        <span className="shrink-0 text-[10px]" title="Calendar Overlay Active">
          📅
        </span>
      )}
    </div>
  );
};
