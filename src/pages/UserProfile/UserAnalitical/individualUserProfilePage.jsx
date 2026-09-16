import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchUserById, fetchUserActivities } from "../../../Services/UserServices/userServices";
import ProfileHeader from "./ComponentsForIndividualUserProfile/ProfileHeader";
import PersonalInfoCard from "./ComponentsForIndividualUserProfile/PersonalInfoCard";
import UserStats from "./ComponentsForIndividualUserProfile/userStatus";
import SocialLinksCard from "./ComponentsForIndividualUserProfile/socialLinkCard";
import PerformanceMetrics from "./ComponentsForIndividualUserProfile/performaceMetricks";
import ReportsCard from "./ComponentsForIndividualUserProfile/reportCard";
import DeviceInfoCard from "./ComponentsForIndividualUserProfile/deviceInfocard";
import ReferralInfoCard from "./ComponentsForIndividualUserProfile/ReferralInfoCard";
import WatchAnalyticsCard from "./ComponentsForIndividualUserProfile/WatchAnalyticsCard";
import FinancialsCard from "./ComponentsForIndividualUserProfile/FinancialsCard";

const pageMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

export default function IndividualUserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUserById(id),
    enabled: !!id,
  });

  const { data: activitiesData } = useQuery({
    queryKey: ["user-activities", id],
    queryFn: () => fetchUserActivities(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading user profile...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching comprehensive data</p>
        </div>
      </div>
    );
  }

  if (isError || !userData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load user</h3>
          <p className="text-gray-600 mb-6">The user profile could not be loaded. Please try again.</p>
          <button
            onClick={() => navigate("/social/profile")}
            className="px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Back to Users Dashboard
          </button>
        </div>
      </div>
    );
  }

  const user = userData;

  return (
    <motion.div
      {...pageMotion}
      className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100"
    >
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/social/profile")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium mb-6 px-3 py-2 rounded-lg hover:bg-white transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Users Dashboard
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                {user.profile?.profileAvatar && (
                  <img
                    src={user.profile.profileAvatar}
                    alt={user.userName}
                    className="w-14 h-14 rounded-2xl border-2 border-white shadow-lg"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.profile?.displayName || user.userName}</h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <span>@{user.userName}</span>
                    <span className="text-xs px-2 py-1 bg-linear-to-r from-green-100 to-emerald-100 text-green-700 rounded-full">
                      {user.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </p>
                </div>
              </div>
              <p className="text-gray-500 mt-2 max-w-2xl">{user.profile?.bio || 'User profile and comprehensive analytics'}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                Send Message
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Fixed alignment */}
        <div className="space-y-8">
          {/* First Row: Profile Info and User Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Information */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <PersonalInfoCard user={user} />
            </div>

            {/* User Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <UserStats user={user} />
            </div>
          </div>

          {/* Second Row: Performance Metrics & Watch Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Metrics */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <PerformanceMetrics user={user} />
            </div>

            {/* Watch Analytics */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <WatchAnalyticsCard user={user} />
            </div>
          </div>

          {/* Recent Viewed Feeds Card */}
          {user.watchAnalytics?.recentViewedFeeds && user.watchAnalytics.recentViewedFeeds.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Recent Viewed Feeds & Videos ({user.watchAnalytics.recentViewedFeeds.length})
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Detailed record of user's latest watched content</p>
                </div>
                <button
                  onClick={() => navigate(`/social/user/analitical/${id}`)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3.5 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  View All Analytics →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {user.watchAnalytics.recentViewedFeeds.map((feed, idx) => (
                  <div
                    key={feed._id || idx}
                    className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-indigo-300 transition-all duration-300 bg-white flex flex-col"
                  >
                    <div className="h-36 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                      {feed.mediaUrl ? (
                        feed.postType === 'video' || feed.mediaUrl.endsWith('.mp4') ? (
                          <div className="relative w-full h-full">
                            <video
                              src={feed.mediaUrl}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              muted
                              preload="metadata"
                            />
                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                              <span className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-gray-800 shadow-sm">
                                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                              </span>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={feed.mediaUrl}
                            alt={feed.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )
                      ) : (
                        <div className="text-3xl text-gray-300">
                          {feed.postType === 'video' ? '🎥' : '📷'}
                        </div>
                      )}
                      <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded text-white shadow-xs ${
                        feed.postType === 'video' ? 'bg-rose-600/90' : 'bg-blue-600/90'
                      }`}>
                        {feed.postType || 'post'}
                      </span>
                      {feed.watchDuration > 0 && (
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-black/80 text-white">
                          {feed.watchDuration >= 60
                            ? `${Math.floor(feed.watchDuration / 60)}m ${feed.watchDuration % 60}s`
                            : `${feed.watchDuration}s`}
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="font-bold text-xs text-gray-900 line-clamp-1 mb-1" title={feed.title}>
                          {feed.title || "Untitled Feed"}
                        </p>
                        {feed.description && (
                          <p className="text-[11px] text-gray-500 line-clamp-1 mb-2">
                            {feed.description}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-semibold text-[10px] truncate max-w-[100px]">
                            {feed.category || "General"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {feed.viewedAt ? new Date(feed.viewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "-"}
                          </span>
                        </div>
                        {feed.feedId && (
                          <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                            <span className="truncate">ID: {feed.feedId}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(feed.feedId);
                                alert("Feed ID copied to clipboard!");
                              }}
                              className="text-indigo-600 hover:text-indigo-800 text-[9px] font-sans font-bold ml-1"
                              title="Copy Feed ID"
                            >
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Third Row: Financials */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <FinancialsCard user={user} />
          </div>

          {/* Fourth Row: Referral Info & Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Referral Network */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <ReferralInfoCard user={user} />
            </div>

            {/* Reports */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <ReportsCard reports={user.reports} />
            </div>
          </div>

          {/* Fifth Row: Social Links & Device Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Social Links */}
            {user.profile?.socialLinks && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <SocialLinksCard socialLinks={user.profile.socialLinks} />
              </div>
            )}

            {/* Device Info */}
            {user.device && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <DeviceInfoCard device={user.device} />
              </div>
            )}
          </div>

          {/* User Activity & Timeline Section */}
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  User Activity & Action Timeline
                </h3>
                <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                  {activitiesData?.length || 0} Recorded Actions
                </span>
              </div>

              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-100"></div>

                <div className="space-y-6 relative">
                  {(() => {
                    const events = [];

                    // 1. Registration
                    if (user.createdAt) {
                      events.push({
                        date: new Date(user.createdAt),
                        title: "Account Created",
                        description: "User successfully registered on the platform",
                        type: "registration",
                        badge: "Account",
                        icon: (
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )
                      });
                    }

                    // 2. Last Login
                    if (user.lastLoginAt) {
                      events.push({
                        date: new Date(user.lastLoginAt),
                        title: "Last Login Recorded",
                        description: `User last logged in from ${user.device?.deviceName || 'their device'}`,
                        type: "login",
                        badge: "Session",
                        icon: (
                          <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                        )
                      });
                    }

                    // 3. Last Active
                    if (user.lastActiveAt) {
                      events.push({
                        date: new Date(user.lastActiveAt),
                        title: "Last Seen Active",
                        description: user.isOnline ? "User is currently active online" : "User was active on the platform",
                        type: "activity",
                        badge: user.isOnline ? "Online" : "Offline",
                        icon: (
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 01-18 0" />
                            </svg>
                          </div>
                        )
                      });
                    }

                    // 4. Action Activities (Watch, View, Like, Save, Create, Download, etc.)
                    if (activitiesData && Array.isArray(activitiesData)) {
                      activitiesData.forEach(act => {
                        const isWatch = act.actionType === "WATCH_FEED";
                        const isView = act.actionType === "VIEW_FEED";
                        const isLike = act.actionType === "LIKE_POST";
                        const isSave = act.actionType === "SAVE_POST";
                        const isDownload = act.actionType?.includes("DOWNLOAD");

                        events.push({
                          date: new Date(act.createdAt),
                          title: act.title || act.actionType.replace(/_/g, " "),
                          description: act.description || `Action: ${act.actionType}`,
                          type: "action",
                          badge: act.actionType.replace(/_/g, " "),
                          categoryName: act.categoryName,
                          feedId: act.feedId,
                          mediaUrl: act.mediaUrl,
                          postType: act.postType,
                          watchDuration: act.watchDuration,
                          icon: (
                            <div className={`p-2 rounded-lg ${
                              isWatch ? 'bg-rose-100' :
                              isView ? 'bg-indigo-100' :
                              isLike ? 'bg-pink-100' :
                              isSave ? 'bg-amber-100' :
                              isDownload ? 'bg-emerald-100' : 'bg-blue-100'
                            }`}>
                              {isWatch ? (
                                <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                </svg>
                              ) : isLike ? (
                                <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                              ) : isSave ? (
                                <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                </svg>
                              ) : isDownload ? (
                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </div>
                          )
                        });
                      });
                    }

                    // 5. Financials
                    if (user.financials?.transactionHistory) {
                      user.financials.transactionHistory.forEach(tx => {
                        events.push({
                          date: new Date(tx.date),
                          title: `${tx.type} - $${tx.amount}`,
                          description: tx.description,
                          type: tx.type.toLowerCase(),
                          badge: tx.type,
                          icon: (
                            <div className={`p-2 rounded-lg ${tx.type === 'Earning' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                              <svg className={`w-4 h-4 ${tx.type === 'Earning' ? 'text-emerald-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                              </svg>
                            </div>
                          )
                        });
                      });
                    }

                    // Sort chronologically (descending)
                    return events
                      .sort((a, b) => b.date - a.date)
                      .map((event, idx) => (
                        <div key={idx} className="flex gap-4 group relative items-start bg-gray-50/60 hover:bg-white p-3.5 rounded-xl border border-transparent hover:border-gray-200 hover:shadow-xs transition-all">
                          <div className="z-10 mt-0.5">{event.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xs text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {event.title}
                                </h4>
                                {event.badge && (
                                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-gray-200/80 text-gray-700">
                                    {event.badge}
                                  </span>
                                )}
                                {event.categoryName && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                                    {event.categoryName}
                                  </span>
                                )}
                                {event.watchDuration > 0 && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">
                                    ⏱️ {event.watchDuration}s
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-medium text-gray-500 bg-white border border-gray-100 px-2.5 py-1 rounded-full shadow-2xs">
                                {event.date.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            {/* Feed Media Preview & ID if available */}
                            {event.mediaUrl && (
                              <div className="flex items-center gap-3 my-2 p-2 bg-white rounded-lg border border-gray-100">
                                <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0 relative">
                                  {event.postType === 'video' || event.mediaUrl.endsWith('.mp4') ? (
                                    <video src={event.mediaUrl} className="w-full h-full object-cover" muted preload="metadata" />
                                  ) : (
                                    <img src={event.mediaUrl} alt="" className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  {event.description && (
                                    <p className="text-xs text-gray-600 line-clamp-1 mb-0.5">{event.description}</p>
                                  )}
                                  {event.feedId && (
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                                      <span>Feed ID: {event.feedId}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(event.feedId);
                                          alert("Feed ID copied!");
                                        }}
                                        className="text-indigo-600 font-sans font-bold hover:underline ml-1"
                                      >
                                        Copy
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {!event.mediaUrl && event.description && (
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ));
                  })()}
                </div>
              </div>

              {(!activitiesData || activitiesData.length === 0) && (
                <div className="mt-8 text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm italic">No recent platform activities recorded for this user.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}