import React, { useMemo } from "react";
import { useSidebar } from "../context/SidebarContext";
import { useAdminAuth } from "../context/adminAuthContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";
import { Search, Calendar, Bell, Menu } from "lucide-react";

export default function AppHeader() {
  const { toggleMainSidebar, isMobileOpen, isExpanded } = useSidebar();
  const { admin } = useAdminAuth();

  // Dynamic current date formatted matching the screenshot
  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-800/95 border-b border-gray-100 dark:border-gray-700/80 backdrop-blur-md transition-all shadow-xs">
      <div className="px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Sidebar Open/Close Toggle & Global Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Mobile-Only Sidebar Toggle (hidden on desktop) */}
          <button
            type="button"
            onClick={toggleMainSidebar}
            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 border border-gray-200/80 dark:border-gray-700 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center shrink-0 lg:hidden"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Input matching Screenshot */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users, business name, phone, category..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-700/60 rounded-xl text-xs font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Right: Date Pill, Notification Bell, Theme Toggle, Admin Profile Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Calendar Date Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{currentDateFormatted}</span>
          </div>

          {/* Notification with Badge */}
          <div className="relative">
            <NotificationDropdown />
          </div>

          {/* Theme Toggle */}
          <div className="scale-95">
            <ThemeToggleButton />
          </div>

          <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-700 mx-0.5" />

          {/* Admin Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 pr-3 py-1 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-gray-200">
              {(admin?.userName || "A").charAt(0).toUpperCase()}
            </div>
            <div className="text-left leading-tight hidden xs:block">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[100px]">
                {admin?.userName || "Admin"}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">
                {admin?.role === "Child_Admin" ? "Child Admin" : "Super Admin"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}