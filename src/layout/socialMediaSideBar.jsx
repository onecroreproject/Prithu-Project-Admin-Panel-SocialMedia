import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PrithuLogo from "../Assets/Logo/prithulogo.png";
import { useSidebar } from "../context/SidebarContext";
import { useAdminAuth } from "../context/adminAuthContext";
import { useUpdates } from "../context/UpdateContext";
import {
  Grid,
  Users,
  CreditCard,
  BarChart3,
  FileText,
  Bell,
  Shield,
  Cog,
  MessageSquare,
  LogOut,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Award,
  Sparkles,
  Search,
  ExternalLink,
  X,
  ChevronLeft,
  Power
} from "lucide-react";

export default function SocialMediaSidebar({ user }) {
  const { isMobileOpen, setIsMobileOpen, isExpanded, toggleMainSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const { unreadCount } = useUpdates();

  // Accordion state: only one menu open at a time
  const [openMenuId, setOpenMenuId] = useState(null);

  // Navigation Items matching the design screenshot
  const navItems = useMemo(() => [
    {
      id: "dashboard",
      name: "Dashboard",
      path: "/social/dashboard",
      icon: <Grid className="w-4 h-4 text-blue-400" />,
      permission: null
    },
    {
      id: "users",
      name: "User Management",
      icon: <Users className="w-4 h-4 text-sky-400" />,
      permission: "canManageUsers",
      subItems: [
        { name: "All Users", path: "/social/profile", permission: "canManageUsersDetail" },
        { name: "Active Users", path: "/social/profile?status=active", permission: "canManageUsersDetail" },
        { name: "Blocked Users", path: "/social/profile?status=blocked", permission: "canManageUsersDetail" },
        { name: "Deleted Users", path: "/social/user/deletion-logs", permission: "canManageUsers" },
      ]
    },
    {
      id: "businessProfiles",
      name: "Business Profiles",
      icon: <CreditCard className="w-4 h-4 text-teal-400" />,
      permission: null,
      subItems: [
        { name: "All Profiles", path: "/social/business-profiles", permission: null },
        { name: "Active Profiles", path: "/social/business-profiles?status=active", permission: null },
        { name: "Blocked Profiles", path: "/social/business-profiles?status=blocked", permission: null },
      ]
    },
    {
      id: "analytics",
      name: "Analytics & Tracking",
      icon: <BarChart3 className="w-4 h-4 text-purple-400" />,
      permission: "canManageSalesDashboard",
      subItems: [
        { name: "Feed Analytics", path: "/social/feed-view-analytics", permission: "canManageFeeds" },
        { name: "Sales Dashboard", path: "/settings/sales/dashboard", permission: "canManageSalesDashboard" },
        { name: "Reco Analytics", path: "/social/recommendation-dashboard", permission: "canManageSalesDashboard" },
      ]
    },
    {
      id: "feeds",
      name: "Feed Management",
      icon: <LayoutGrid className="w-4 h-4 text-blue-300" />,
      permission: "canManageFeeds",
      subItems: [
        { name: "Feed Upload", path: "/social/admin/upload/page", permission: "canManageUpload" },
        { name: "Category Management", path: "/social/category/management", permission: "canManageCategories" },
        { name: "Post Global Options", path: "/social/post-global-options", permission: "canManageCategories" },
        { name: "Party Management", path: "/social/party/management", permission: "canManageParties" },
        { name: "Prompt Management", path: "/social/prompts", permission: "canManageFeeds" },
        { name: "AI Categories", path: "/social/ai-categories", permission: "canManageFeeds" },
      ]
    },
    {
      id: "reports",
      name: "Reports",
      icon: <FileText className="w-4 h-4 text-blue-400" />,
      permission: "canManageReport",
      subItems: [
        { name: "User Feed Reports", path: "/social/user-reportinfo", permission: "canManageUsersFeedReports" },
        { name: "Report Management", path: "/settings/report/management", permission: "canManageAddReport" },
      ]
    },
    {
      id: "subscriptions",
      name: "Subscriptions",
      icon: <Award className="w-4 h-4 text-amber-400" />,
      permission: "canManageSubscriptions",
      subItems: [
        { name: "Manage Subscriptions", path: "/settings/subscription/page", permission: "canManageSettingsSubscriptions" },
        { name: "Subscriber Users", path: "/settings/sales/subscriptions", permission: "canManageSettingsSubscriptions" },
        { name: "Withdrawal Users", path: "/settings/sales/withdrawals", permission: "canManageSettingsSubscriptions" },
        { name: "Top Referrals", path: "/settings/sales/referrals", permission: "canManageSettingsSubscriptions" },
      ]
    },
    {
      id: "support",
      name: "Support Requests",
      icon: <MessageSquare className="w-4 h-4 text-rose-400" />,
      permission: "canManageFAQs",
      subItems: [
        { name: "Feedback & Support", path: "/settings/reportandfeedback/management", permission: "canManageUserFeedbacks" },
        { name: "FAQ Settings", path: "/settings/faq/management", permission: "canManageFAQs" },
      ]
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: <Bell className="w-4 h-4 text-violet-400" />,
      permission: "canManageUpdates",
      subItems: [
        { name: "Updates Management", path: "/settings/updates/management", permission: "canManageUpdates" },
        { name: "What's New", path: "/social/whats-new", permission: "canManageUpdates" },
      ]
    },
    {
      id: "adminStaff",
      name: "Admin & Staff",
      icon: <Shield className="w-4 h-4 text-cyan-400" />,
      permission: "canManageChildAdmins",
      subItems: [
        { name: "Admin List", path: "/settings/child/admin/list", permission: "canManageChildAdmins" },
        { name: "Admin Creation", path: "/settings/child/admin/page", permission: "canManageChildAdminsCreation" },
      ]
    },
    {
      id: "settings",
      name: "Settings",
      icon: <Cog className="w-4 h-4 text-slate-400" />,
      permission: null,
      subItems: [
        { name: "Admin Profile", path: "/settings/admin/profile/page", permission: null },
        { name: "SEO Dashboard", path: "/seo/dashboard", permission: "canViewSEODashboard" },
        { name: "Global SEO", path: "/seo/settings", permission: "canManageSEOGlobal" },
        { name: "Email Management", path: "/settings/email/dashboard", permission: null },
        { name: "Server Management", path: "/settings/server/management", permission: "canViewSystemLogs" },
        { name: "AI Monetization", path: "/social/monetization/dashboard", permission: null },
      ]
    }
  ], []);

  // Filter based on RBAC permissions
  const filteredNavItems = useMemo(() => {
    if (!user) return navItems;
    if (user.role === "Admin") return navItems;

    const granted = user.grantedPermissions || [];
    return navItems
      .filter(item => !item.permission || granted.includes(item.permission))
      .map(item => {
        if (!item.subItems) return item;
        const allowedSubs = item.subItems.filter(sub => !sub.permission || granted.includes(sub.permission));
        return { ...item, subItems: allowedSubs };
      })
      .filter(item => !item.subItems || item.subItems.length > 0);
  }, [user, navItems]);

  // Check active routes
  const isItemActive = (item) => {
    if (item.path) {
      if (item.path === "/social/dashboard" && (location.pathname === "/social/dashboard" || location.pathname === "/")) {
        return true;
      }
      return location.pathname === item.path;
    }
    if (item.subItems) {
      return item.subItems.some(sub => location.pathname === sub.path.split("?")[0]);
    }
    return false;
  };

  const isSubItemActive = (sub) => {
    const [subPath, subQuery] = sub.path.split("?");
    if (subQuery) {
      return location.pathname === subPath && location.search.includes(subQuery);
    }
    return location.pathname === subPath && !location.search;
  };

  // Auto-expand menu containing active path (only that single one)
  useEffect(() => {
    const activeItem = filteredNavItems.find(item =>
      item.subItems && item.subItems.some(sub => location.pathname === sub.path.split("?")[0])
    );
    if (activeItem) {
      setOpenMenuId(activeItem.id);
    }
  }, [location.pathname, filteredNavItems]);

  // Accordion toggle: opening one tab automatically closes all other tabs
  const toggleMenu = (id) => {
    setOpenMenuId(prev => (prev === id ? null : id));
  };

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <>
      <aside
        className={`
          h-screen flex flex-col bg-[#0b132b] text-white fixed top-0 left-0 z-50
          border-r border-slate-800/80 shadow-2xl transition-all duration-300 ease-in-out font-sans
          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
          ${isExpanded ? "lg:w-64" : "lg:w-20"}
        `}
      >
        {/* ── TOP LOGO HEADER ── */}
        {isExpanded ? (
          <div className="p-4 border-b border-slate-800 bg-[#070d1e]/50 shrink-0 flex items-center justify-between gap-2">
            <Link
              to="/social/dashboard"
              onClick={() => setIsMobileOpen(false)}
              className="bg-white rounded-xl p-2.5 shadow-xs flex items-center gap-3 transition-transform hover:scale-[1.02] flex-1 min-w-0"
            >
              <img src={PrithuLogo} alt="Prithu Logo" className="w-8 h-8 object-contain shrink-0" />
              <div className="leading-tight truncate">
                <h1 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-1">
                  PRITHU <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48]"></span>
                </h1>
                <p className="text-[10px] text-gray-500 font-semibold tracking-wide">Admin Panel</p>
              </div>
            </Link>

            {/* Collapse Sidebar Button (X on mobile, ChevronLeft on desktop) */}
            <button
              type="button"
              onClick={toggleMainSidebar}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Collapse to icons"
              aria-label="Collapse to icons"
            >
              <X className="w-4 h-4 lg:hidden" />
              <ChevronLeft className="w-4 h-4 hidden lg:block" />
            </button>
          </div>
        ) : (
          <div className="p-2.5 border-b border-slate-800 bg-[#070d1e]/50 shrink-0 flex items-center justify-between gap-1.5">
            <Link
              to="/social/dashboard"
              className="bg-white rounded-xl p-1.5 shadow-xs flex items-center justify-center transition-transform hover:scale-105 shrink-0"
              title="Prithu Admin Dashboard"
            >
              <img src={PrithuLogo} alt="Prithu Logo" className="w-7 h-7 object-contain" />
            </Link>
            <button
              type="button"
              onClick={toggleMainSidebar}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-[#2563eb] text-slate-300 hover:text-white transition-all cursor-pointer hidden lg:flex items-center justify-center shrink-0 shadow-xs active:scale-95"
              title="Expand full sidebar"
              aria-label="Expand full sidebar"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* ── NAVIGATION MENU ITEMS (Scrollbar hidden) ── */}
        <div
          className={`flex-1 overflow-y-auto ${isExpanded ? "px-3" : "px-2"} py-4 space-y-1.5 no-scrollbar [&::-webkit-scrollbar]:hidden`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filteredNavItems.map((item) => {
            const hasSub = Boolean(item.subItems?.length);
            const active = isItemActive(item);
            const isOpen = openMenuId === item.id;

            // When collapsed (isExpanded === false on desktop): Show icons only with flyout hover tooltip
            if (!isExpanded) {
              return (
                <div key={item.id} className="relative group/navitem flex justify-center">
                  {hasSub ? (
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.id)}
                      className={`
                        flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 cursor-pointer
                        ${active
                          ? "bg-[#2563eb] text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400/40"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                        }
                      `}
                      title={item.name}
                    >
                      <span className="scale-110">{item.icon}</span>
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`
                        flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 cursor-pointer
                        ${active
                          ? "bg-[#2563eb] text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400/40"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                        }
                      `}
                      title={item.name}
                    >
                      <span className="scale-110">{item.icon}</span>
                    </Link>
                  )}

                  {/* Flyout Submenu / Tooltip Card on Hover */}
                  <div className="hidden lg:group-hover/navitem:flex flex-col absolute left-full top-0 ml-2.5 min-w-[210px] bg-[#0c1633] text-white border border-slate-700/90 rounded-2xl shadow-2xl p-2.5 z-50 pointer-events-auto">
                    <div className="px-2.5 py-1.5 border-b border-slate-800 mb-1 flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-wide">{item.name}</span>
                      {hasSub && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded">
                          {item.subItems.length}
                        </span>
                      )}
                    </div>
                    {hasSub ? (
                      <div
                        className="space-y-0.5 mt-1 max-h-60 overflow-y-auto no-scrollbar [&::-webkit-scrollbar]:hidden"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        {item.subItems.map((sub) => {
                          const subActive = isSubItemActive(sub);
                          return (
                            <Link
                              key={sub.name}
                              to={sub.path}
                              onClick={() => setIsMobileOpen(false)}
                              className={`
                                block px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                                ${subActive
                                  ? "bg-[#2563eb] text-white font-bold shadow-xs"
                                  : "text-slate-300 hover:text-white hover:bg-white/10"
                                }
                              `}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 px-2.5 py-1">Click to open</p>
                    )}
                  </div>
                </div>
              );
            }

            // Expanded Full Sidebar Mode
            if (hasSub) {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`
                      flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold
                      transition-all duration-200 group
                      ${active && !isOpen
                        ? "bg-[#2563eb] text-white shadow-md shadow-blue-500/20"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="shrink-0">{item.icon}</span>
                      <span className="truncate">{item.name}</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-white" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-4 ml-4 border-l border-slate-700/60 space-y-1 overflow-hidden"
                      >
                        {item.subItems.map((sub) => {
                          const subActive = isSubItemActive(sub);
                          return (
                            <li key={sub.name}>
                              <Link
                                to={sub.path}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                  ${subActive
                                    ? "bg-[#2563eb] text-white font-bold shadow-xs"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                  }
                                `}
                              >
                                {sub.name}
                              </Link>
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold
                  transition-all duration-200
                  ${active
                    ? "bg-[#2563eb] text-white shadow-md shadow-blue-500/20"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                  }
                `}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* ── BOTTOM USER PROFILE & LOGOUT ── */}
        <div className={`${isExpanded ? "p-3" : "p-2"} border-t border-slate-800 bg-[#070d1e]/40 shrink-0`}>
          {isExpanded ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                  {(user?.userName || "A").charAt(0).toUpperCase()}
                </div>
                <div className="leading-tight overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{user?.userName || "Admin"}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.role || "Super Admin"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-xl bg-red-500/15 text-red-400 hover:text-white hover:bg-red-600 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center group"
              >
                <Power className="w-4 h-4 stroke-[2.2] group-hover:scale-110 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-slate-700 shadow-xs cursor-pointer"
                title={`${user?.userName || "Admin"} (${user?.role || "Super Admin"})`}
              >
                {(user?.userName || "A").charAt(0).toUpperCase()}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-xl bg-red-500/15 text-red-400 hover:text-white hover:bg-red-600 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center group"
              >
                <Power className="w-4 h-4 stroke-[2.2] group-hover:scale-110 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}