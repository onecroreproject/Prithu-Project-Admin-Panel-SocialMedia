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


          {/* Fourth Row: Account Timeline */}
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-6 text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Account Timeline Detail
              </h3>

              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-100"></div>

                <div className="space-y-8 relative">
                  {(() => {
                    const events = [];

                    // 1. Registration
                    if (user.createdAt) {
                      events.push({
                        date: new Date(user.createdAt),
                        title: "Account Created",
                        description: "User successfully registered on the platform",
                        type: "registration",
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
                        description: `User last logged in from a ${user.device?.deviceName || 'device'}`,
                        type: "login",
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
                        description: user.isOnline ? "User is currently online" : "User was last active on the platform",
                        type: "activity",
                        icon: (
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 01-18 0" />
                            </svg>
                          </div>
                        )
                      });
                    }

                    // 4. Action Activities
                    if (activitiesData) {
                      activitiesData.forEach(act => {
                        events.push({
                          date: new Date(act.createdAt),
                          title: act.actionType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
                          description: act.targetId?.title || act.targetId?.userName || "Activity recorded",
                          type: "action",
                          icon: (
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                              </svg>
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
                        <div key={idx} className="flex gap-4 group relative">
                          <div className="z-10">{event.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {event.title}
                              </h4>
                              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {event.date.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {event.description}
                            </p>
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