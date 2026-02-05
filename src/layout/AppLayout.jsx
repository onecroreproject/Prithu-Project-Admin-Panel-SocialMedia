// LayoutContent.jsx (updated sections)
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import MainSidebar from "./socialMediaSideBar";
import DashBoardMetricks from "../pages/Dashboard/Blocks/dashBoardMetricks"
import { useAdminAuth } from "../context/adminAuthContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Users,
  BarChart,
  MessageSquare,
  Shield,
  Database,
  ChevronLeft,
  HardDrive
} from "lucide-react";

const LayoutContent = () => {
  const { admin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    // Main sidebar
    isExpanded: isMainExpanded,
    isMobileOpen: isMainMobileOpen,
    isHovered: isMainHovered,
    toggleMainSidebar,

    // Mobile detection
    isMobile
  } = useSidebar();

  const [sidebarWidth, setSidebarWidth] = useState("0px");
  const [isContentTransitioning, setIsContentTransitioning] = useState(false);

  // SIMPLE LOGIC: Show dashboard cards only on root path "/"
  const shouldShowDashboardCards = location.pathname === "/";

  // Always use social module logic for sidebars
  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/social/dashboard") {
      if (admin?.role === "Child_Admin" && admin?.userId) {
        navigate(`/settings/child/admin/profile/${admin.userId}`, { replace: true });
      } else if (location.pathname === "/") {
        navigate("/social/dashboard", { replace: true });
      }
    }
  }, [location.pathname, navigate, admin]);

  // Update sidebar width - ALWAYS COLLAPSED (85px) on desktop
  useEffect(() => {
    if (isMobile) {
      setSidebarWidth(isMainMobileOpen ? "280px" : "0px");
    } else {
      setSidebarWidth("85px"); // Always collapsed width on desktop
    }
  }, [isMainMobileOpen, isMobile]);

  // Handle content transition
  useEffect(() => {
    setIsContentTransitioning(true);
    const timer = setTimeout(() => setIsContentTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [isMainExpanded]);

  // Handle back to dashboard (always go to social dashboard now)
  const handleBackToDashboard = useCallback(() => {
    navigate("/social/dashboard");
  }, [navigate]);

  // Toggle current active sidebar - DISABLED for desktop (always collapsed)
  const toggleActiveSidebar = useCallback(() => {
    if (isMobile) {
      toggleMainSidebar();
    }
  }, [toggleMainSidebar, isMobile]);

  // Calculate content dimensions - ALWAYS CONFIGURED FOR SOCIAL SIDEBAR
  const contentDimensions = useMemo(() => {
    if (isMobile) {
      return {
        left: "0px",
        width: "100%",
        maxWidth: "max-w-[1600px]",
        padding: "px-4 sm:px-6 lg:px-8",
        sidebarCollapsed: false,
        sidebarVisible: false
      };
    }

    return {
      left: "85px",
      width: "calc(100% - 85px)",
      maxWidth: "max-w-[calc(1600px-85px)]",
      padding: "pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8",
      sidebarCollapsed: true,
      sidebarVisible: true
    };
  }, [isMobile]);

  // Calculate sidebar toggle button position - HIDDEN ON DESKTOP
  const sidebarTogglePosition = useMemo(() => {
    if (isMobile) {
      return {
        left: "270px", // Position near the edge of sidebar
        transform: "translateX(-50%)"
      };
    }
    return null; // Hide on desktop
  }, [isMobile]);

  // Debug log
  // useEffect(() => {
  //   console.log('Current Layout State:', {
  //     location: location.pathname,
  //     shouldShowDashboardCards,
  //     sidebarWidth,
  //     contentLeft: contentDimensions.left,
  //     contentWidth: contentDimensions.width,
  //     maxWidth: contentDimensions.maxWidth,
  //     isSidebarExpanded,
  //     isContentTransitioning
  //   });
  // }, [location.pathname, shouldShowDashboardCards, sidebarWidth, contentDimensions, isContentTransitioning]);

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">

      {/* Render only the active sidebar on the left side */}
      <div className="fixed top-0 left-0 z-40 transition-all duration-300 h-screen">
        <MainSidebar user={admin} />
      </div>

      {/* Sidebar Toggle Button (Mobile only) */}
      {contentDimensions.sidebarVisible && isMobile && (
        <button
          onClick={toggleActiveSidebar}
          className="fixed top-20 z-50 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110 hover:shadow-xl"
          style={sidebarTogglePosition}
          title="Close sidebar"
        >
          <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Backdrop for mobile */}
      {isMainMobileOpen && <Backdrop />}

      {/* Main Content Area */}
      <div
        className={`
          min-h-screen transition-all duration-300 ease-in-out absolute top-0
          ${isContentTransitioning ? 'transitioning' : ''}
        `}
        style={{
          left: contentDimensions.left,
          width: contentDimensions.width,
          paddingTop: "4rem",
        }}
      >
        {/* Header */}
        <div
          className="fixed top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-all duration-300"
          style={{
            left: contentDimensions.left,
            width: contentDimensions.width,
          }}
        >
          <AppHeader />
        </div>

        {/* Main Content */}
        <main className={`py-4 sm:py-6 lg:py-8 ${contentDimensions.padding}`}>
          <div className={`${contentDimensions.maxWidth} mx-auto transition-all duration-300`}>
            {/* Page Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {location.pathname.includes('settings') ? 'Settings' :
                          location.pathname.includes('drive') ? 'Google Drive' :
                            'Dashboard'}
                      </h1>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 sm:mt-3 max-w-3xl">
                    {location.pathname.includes('settings') ? 'System configuration and administration' :
                      location.pathname.includes('drive') ? 'Manage files and storage in Google Drive' :
                        "Manage your data and monitor performance in real-time."}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700/50 overflow-hidden transition-all duration-300">
              <Outlet />
            </div>

            {/* Footer */}
            <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-800/50">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <p>© {new Date().getFullYear()} Prithu Dashboard v1.0</p>
                </div>
                <div className="flex items-center gap-4 md:gap-6 text-sm">
                  <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
                    Terms of Service
                  </a>
                  <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
                    Help Center
                  </a>
                  <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
                    Contact Support
                  </a>
                </div>
              </div>
              <div className="mt-4 text-center md:text-left">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Built with React • Tailwind CSS • Framer Motion
                </p>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

const AppLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;