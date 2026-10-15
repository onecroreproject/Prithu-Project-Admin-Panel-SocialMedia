import React from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import MainSidebar from "./socialMediaSideBar";
import { useAdminAuth } from "../context/adminAuthContext";

const LayoutContent = () => {
  const { admin } = useAdminAuth();
  const { isMobileOpen, isExpanded } = useSidebar();

  return (
    <div className="relative min-h-screen bg-[#f8fafc] dark:bg-[#070d1e] font-sans antialiased">
      {/* ── Fixed Sidebar ── */}
      <MainSidebar user={admin} />

      {/* ── Backdrop for Mobile Sidebar ── */}
      {isMobileOpen && <Backdrop />}

      {/* ── Main Content Area (dynamically adapts when sidebar opens/closes) ── */}
      <div
        className={`flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out ${
          isExpanded ? "lg:ml-64 lg:w-[calc(100%-16rem)]" : "lg:ml-20 lg:w-[calc(100%-5rem)]"
        }`}
      >
        {/* Global Header Bar */}
        <AppHeader />

        {/* Dynamic Page Content */}
        <main className="flex-1 flex flex-col w-full">
          <Outlet />
        </main>

        {/* Global Clean Footer */}
        <footer className="mt-auto px-4 md:px-6 lg:px-8 py-4 border-t border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="font-semibold text-gray-700 dark:text-gray-300">© {new Date().getFullYear()} PRITHU Admin Platform</p>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded font-bold">
                Live Admin 2.0
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
              <span className="hover:text-blue-600 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-blue-600 cursor-pointer">Terms of Service</span>
              <span className="hover:text-blue-600 cursor-pointer">Help Center</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function AppLayout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}