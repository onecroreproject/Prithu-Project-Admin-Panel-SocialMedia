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

      {/* Render only the active sidebar */}
      <div className="z-50">
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
          min-h-screen flex flex-col justify-between transition-all duration-300 ease-in-out absolute top-0
          ${isContentTransitioning ? 'transitioning' : ''}
        `}
        style={{
          left: contentDimensions.left,
          width: contentDimensions.width,
          paddingTop: "0px",
        }}
      >
        {/* Main Content */}
        <main className={`flex-1 flex flex-col py-4 sm:py-6 lg:py-8 ${contentDimensions.padding}`}>
          <div className={`${contentDimensions.maxWidth} mx-auto w-full flex-1 flex flex-col transition-all duration-300`}>

            {/* Content Card */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700/50 overflow-hidden transition-all duration-300">
              <Outlet />
            </div>

            {/* Footer fixed down side */}
            <footer className="mt-auto pt-6 pb-4 border-t border-gray-200 dark:border-gray-800/60">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="font-semibold text-gray-600 dark:text-gray-300">© {new Date().getFullYear()} Prithu Admin Platform</p>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-[11px] font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">v1.2</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Terms of Service
                  </a>
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Help Center
                  </a>
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Contact Support
                  </a>
                </div>
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