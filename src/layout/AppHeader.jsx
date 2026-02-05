import { useEffect, useRef, useState } from "react";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";

const AppHeader = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for subtle shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        sticky top-0 z-40 
        bg-white/80 dark:bg-gray-900/80 
        border-b border-gray-200/50 dark:border-gray-800/50
        backdrop-blur-xl supports-backdrop-blur:bg-white/60
        transition-all duration-300
        ${scrolled ? "shadow-sm dark:shadow-gray-900/20" : ""}
      `}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Only Menu Button */}
          <div className="flex items-center">
            <button
              onClick={toggleMobileSidebar}
              className={`
                p-2 rounded-xl transition-all duration-300
                hover:bg-gray-100 dark:hover:bg-gray-800 
                text-gray-600 dark:text-gray-300 
                lg:hidden
                active:scale-95
                ${isMobileOpen ? "bg-gray-100 dark:bg-gray-800" : ""}
              `}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>

            {/* Desktop: Show Menu Button with different style */}
            <button
              onClick={toggleMobileSidebar}
              className={`
                hidden lg:flex items-center justify-center
                ml-2 w-10 h-10 rounded-xl transition-all duration-300
                hover:bg-gray-100 dark:hover:bg-gray-800 
                text-gray-600 dark:text-gray-300
                active:scale-95
                ${isMobileOpen ? "bg-gray-100 dark:bg-gray-800" : ""}
              `}
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Page Title - Optional if you want to show current page */}
            {/* <div className="ml-4 hidden lg:block">
              <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                Dashboard
              </h1>
            </div> */}
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Quick Action Buttons */}
            <div className="hidden sm:flex items-center gap-1">
              {/* Removed New and Export buttons */}
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

            {/* Theme Toggle */}
            <div className="scale-95 sm:scale-100">
              <ThemeToggleButton />
            </div>

            {/* Notification */}
            <div className="scale-95 sm:scale-100">
              <NotificationDropdown />
            </div>

            {/* User Dropdown */}
            <div className="scale-95 sm:scale-100">
              <UserDropdown />
            </div>
          </div>
        </div>

        {/* Mobile Quick Actions - Cleanup */}
        <div className="lg:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-end">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline">Last updated:</span> Just now
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;