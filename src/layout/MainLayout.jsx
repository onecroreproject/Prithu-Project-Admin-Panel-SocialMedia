import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet, useLocation } from "react-router-dom";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import SocialMediaSidebar from "./socialMediaSideBar";
import { useAdminAuth } from "../context/adminAuthContext";
import { useEffect, useMemo, useState } from "react";

const LayoutContent = () => {
    const { admin } = useAdminAuth();
    const location = useLocation();

    const {
        isExpanded,
        isMobileOpen,
        isHovered,
        toggleMainSidebar,
        isMobile
    } = useSidebar();

    const [sidebarWidth, setSidebarWidth] = useState(isMobile ? "0px" : "85px");

    // Update sidebar width based on mobile/desktop
    useEffect(() => {
        if (isMobile) {
            setSidebarWidth(isMobileOpen ? "280px" : "0px");
        } else {
            setSidebarWidth("85px"); // Desktop always collapsed width
        }
    }, [isMobile, isMobileOpen]);

    // Calculate content dimensions
    const contentDimensions = useMemo(() => {
        if (isMobile) {
            return {
                left: "0px",
                width: "100%",
                maxWidth: "max-w-[1600px]",
                padding: "px-0", // No padding for mobile content wrapper, handled by pages
                sidebarVisible: isMobileOpen
            };
        }

        return {
            left: "85px",
            width: "calc(100% - 85px)",
            maxWidth: "max-w-[calc(1600px-85px)]",
            padding: "px-0", // Pages will handle their own padding
            sidebarVisible: true
        };
    }, [isMobile, isMobileOpen]);

    return (
        <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">

            {/* Sidebar */}
            <div className="fixed top-0 left-0 z-40 h-screen transition-all duration-300">
                <SocialMediaSidebar user={admin} />
            </div>

            {/* Backdrop for mobile */}
            {isMobileOpen && <Backdrop />}

            {/* Main Content Area */}
            <div
                className="min-h-screen transition-all duration-300 ease-in-out absolute top-0"
                style={{
                    left: contentDimensions.left,
                    width: contentDimensions.width,
                    paddingTop: "4rem",
                }}
            >
                {/* Header */}
                <div
                    className="fixed top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300"
                    style={{
                        left: contentDimensions.left,
                        width: contentDimensions.width,
                    }}
                >
                    <AppHeader />
                </div>

                {/* Main Content - No card wrapper, pages handle their own UI */}
                <main className={`${contentDimensions.padding}`}>
                    <div className="w-full mx-auto transition-all duration-300">
                        <Outlet />
                    </div>

                    {/* Minimal Footer */}
                    <footer className="mt-auto py-8 px-6 border-t border-gray-200 dark:border-gray-800/50">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                            <p>© {new Date().getFullYear()} Prithu Admin • Management Portal v1.2</p>
                            <div className="flex gap-4">
                                <span>Security Verified</span>
                                <span>System Operational</span>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

const MainLayout = () => {
    return (
        <SidebarProvider>
            <LayoutContent />
        </SidebarProvider>
    );
};

export default MainLayout;
