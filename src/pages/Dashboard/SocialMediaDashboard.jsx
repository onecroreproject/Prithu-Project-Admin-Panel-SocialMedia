import DashBoardMetricks from "./Blocks/dashBoardMetricks";
import MonthlySalesChart from "../../components/ecommerce/UserRegistrationRatio";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import SubscriptionRevenue from "../../components/ecommerce/SubsciptionRevenue";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { useAdminAuth } from "../../context/adminAuthContext";
import { useNavigate } from "react-router";
import { FiMenu, FiX, FiGrid, FiTrendingUp, FiUsers, FiDollarSign } from "react-icons/fi";
import api from "../../Utils/axiosApi";
import { API_ENDPOINTS } from "../../API-Constanse/apiConstance";

export default function SocialMediaDashboard() {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("default");
  const [childStats, setChildStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (admin?.role === "Admin") {
      fetchChildAdminStats();
    }
  }, [admin]);

  const fetchChildAdminStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get(API_ENDPOINTS.GET_CHILD_ADMIN_STATS);
      setChildStats(res.data);
    } catch (err) {
      console.error("Failed to fetch child admin stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Responsive sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle view changes for mobile
  const handleViewChange = (view) => {
    setActiveView(view);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      <PageMeta title="Prithu Dashboard | Analytics" description="Admin dashboard with analytics, metrics, and user insights" />

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <FiX className="text-gray-600" /> : <FiMenu className="text-gray-600" />}
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
              {admin?.userName || "Admin"}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile View Selector */}
      <div className="md:hidden px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: "metrics", label: "Metrics", icon: FiGrid },
            { id: "analytics", label: "Analytics", icon: FiTrendingUp },
            { id: "users", label: "Users", icon: FiUsers },
            admin?.role === "Admin" && { id: "childAdmins", label: "Child Admins", icon: FiUsers },
            { id: "revenue", label: "Revenue", icon: FiDollarSign },
          ].filter(Boolean).map((item) => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${activeView === item.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
                }`}
            >
              <item.icon className="text-base" />
              <span className="hidden xs:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <div
        className={`md:hidden fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative w-64 h-full bg-white shadow-xl">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Dashboard Views</h2>
            <p className="text-sm text-gray-500 mt-1">Switch between different analytics views</p>
          </div>
          {/* Mobile navigation items would go here */}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10">
          {/* Desktop Header */}
          <div className="hidden md:block px-6 pt-6 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {admin?.userName || "Admin"} 👋</h1>
                <p className="text-gray-600 mt-1">
                  Here's what's happening with your platform today.
                  {admin?.role === 'Admin' && ` Team Status: ${childStats?.totalChildAdmins || 0} child admins (${childStats?.onlineChildAdmins || 0} online).`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-gray-500">Last updated</p>
                  <p className="text-sm font-medium text-gray-700">Just now</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Dashboard Metrics */}
          <div className="hidden md:block px-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  Platform Overview
                </h2>
                <p className="text-sm text-gray-500 mt-1">Key metrics and statistics at a glance</p>
              </div>
              <div className="p-4">
                <DashBoardMetricks />
              </div>
            </div>
          </div>

          {/* Responsive Grid Layout */}
          <div className="px-3 sm:px-4 md:px-6 pb-8">
            {/* Mobile Active View */}
            {activeView === "metrics" && window.innerWidth < 768 ? (
              <div className="md:hidden space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Platform Metrics</h2>
                    <p className="text-sm text-gray-500 mt-1">Real-time overview</p>
                  </div>
                  <div className="p-4">
                    <DashBoardMetricks />
                  </div>
                </div>
              </div>
            ) : activeView === "analytics" && window.innerWidth < 768 ? (
              <div className="md:hidden space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">User Registration Trend</h2>
                    <p className="text-sm text-gray-500 mt-1">Monthly analytics</p>
                  </div>
                  <div className="p-4">
                    <MonthlySalesChart />
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Platform Statistics</h2>
                    <p className="text-sm text-gray-500 mt-1">Comprehensive insights</p>
                  </div>
                  <div className="p-4">
                    <StatisticsChart />
                  </div>
                </div>
              </div>
            ) : activeView === "users" && window.innerWidth < 768 ? (
              <div className="md:hidden space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                    <p className="text-sm text-gray-500 mt-1">Latest user activities</p>
                  </div>
                  <div className="p-4">
                    <RecentOrders />
                  </div>
                </div>
              </div>
            ) : activeView === "childAdmins" && admin?.role === "Admin" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <p className="text-sm text-gray-500 uppercase font-bold">Total Child Admins</p>
                    <p className="text-4xl font-black text-blue-600 mt-2">{childStats?.totalChildAdmins || 0}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <p className="text-sm text-gray-500 uppercase font-bold">Active Now</p>
                    <p className="text-4xl font-black text-emerald-600 mt-2">{childStats?.onlineChildAdmins || 0}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Child Admin Offline History</h2>
                    <p className="text-sm text-gray-500 mt-1">Detailed session and inactivity logs</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Child Admin</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Offline From</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Offline To</th>
                          <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {childStats?.offlineHistory?.map((log, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-800">{log.childAdminId?.userName}</p>
                              <p className="text-xs text-gray-500">{log.childAdminId?.email}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{log.date}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {log.offlineFrom ? new Date(log.offlineFrom).toLocaleTimeString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {log.offlineTo ? new Date(log.offlineTo).toLocaleTimeString() : 'Active'}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-blue-600">{log.duration || 'Running'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop & Tablet Layout (Default) */}
                <div className="grid grid-cols-12 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7">

                  {/* User Registration Ratio - After Dashboard Metrics */}
                  <div className="col-span-12 xl:col-span-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                            User Registration Trend
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">Monthly user registration analytics</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                          <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">30 Days</span>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 md:p-6">
                        <MonthlySalesChart />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Subscription Revenue */}
                  <div className="col-span-12 xl:col-span-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
                      <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                          Subscription Revenue
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Revenue breakdown by subscription plans</p>
                      </div>
                      <div className="p-3 sm:p-4 md:p-6">
                        <SubscriptionRevenue />
                      </div>
                    </div>
                  </div>

                  {/* Full Width Chart - Platform Statistics */}
                  {/* <div className="col-span-12 mt-4 sm:mt-5 md:mt-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                            Platform Statistics Overview
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">Comprehensive analytics and insights</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>Last quarter</option>
                          </select>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 md:p-6">
                        <StatisticsChart />
                      </div>
                    </div>
                  </div> */}

                  {/* Bottom Split Section */}
                  {/* <div className="col-span-12 lg:col-span-5 xl:col-span-5">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
                      <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
                          User Demographics
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">User distribution by age and location</p>
                      </div>
                      <div className="p-3 sm:p-4 md:p-6">
                        <DemographicCard />
                      </div>
                    </div>
                  </div> */}

                  {/* <div className="col-span-12 lg:col-span-7 xl:col-span-7">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
                      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                            Recent Activity & Orders
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">Latest user activities and transactions</p>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                          View All →
                        </button>
                      </div>
                      <div className="p-3 sm:p-4 md:p-6">
                        <RecentOrders />
                      </div>
                    </div>
                  </div> */}
                </div>
              </>
            )}

            {/* Mobile Quick Actions Footer */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg z-40">
              <div className="flex justify-around">
                {[
                  { icon: FiGrid, label: "Home", color: "text-blue-600" },
                  { icon: FiTrendingUp, label: "Analytics", color: "text-gray-600" },
                  { icon: FiUsers, label: "Users", color: "text-gray-600" },
                  { icon: FiDollarSign, label: "Revenue", color: "text-gray-600" },
                ].map((item, index) => (
                  <button
                    key={index}
                    className="flex flex-col items-center"
                    onClick={() => handleViewChange(["default", "analytics", "users", "revenue"][index])}
                  >
                    <div className={`p-2 rounded-lg ${item.color} ${activeView === ["default", "analytics", "users", "revenue"][index] ? "bg-blue-50" : ""}`}>
                      <item.icon className="text-xl" />
                    </div>
                    <span className="text-xs mt-1 text-gray-600">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}