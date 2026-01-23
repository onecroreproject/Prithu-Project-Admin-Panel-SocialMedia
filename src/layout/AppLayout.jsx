// LayoutContent.jsx (updated sections)
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import MainSidebar from "./socialMediaSideBar";
import CompanySidebar from "./companySideBar";
import DashBoardMetricks from "../pages/Dashboard/Blocks/dashBoardMetricks"
import SettingsSidebar from "./settingsSidebar";
import AptitudeSidebar from "./aptitudeSidebar";
import { useAdminAuth } from "../context/adminAuthContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Users,
  Building,
  Settings,
  BarChart,
  MessageSquare,
  Shield,
  TrendingUp,
  Database,
  X,
  ChevronLeft,
  Brain,
  ChevronRight,
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
    
    // Company sidebar
    isCompanyExpanded,
    isCompanyHovered,
    toggleCompanySidebar,
    
    // Settings sidebar
    isSettingsExpanded,
    isSettingsHovered,
    toggleSettingsSidebar,
    
    // Aptitude sidebar
    isAptitudeExpanded,
    isAptitudeHovered,
    isAptitudeMobileOpen,
    toggleAptitudeSidebar,
    
    // Module management
    activeModule,
    selectModule,
    resetToDashboard,
    
    // Mobile detection
    isMobile
  } = useSidebar();
  
  const [sidebarWidth, setSidebarWidth] = useState("0px");
  const [isContentTransitioning, setIsContentTransitioning] = useState(false);

  // SIMPLE LOGIC: Show dashboard cards only on root path "/"
  const shouldShowDashboardCards = location.pathname === "/";

  // Auto-select module based on current route
  useEffect(() => {
    // console.log("Route changed to:", location.pathname);
    
    if (location.pathname.startsWith('/social')) {
      // console.log("Auto-selecting social module");
      selectModule('social');
    } else if (location.pathname.startsWith('/company')) {
      // console.log("Auto-selecting company module");
      selectModule('company');
    } else if (location.pathname.startsWith('/settings')) {
      // console.log("Auto-selecting settings module");
      selectModule('settings');
    } else if (location.pathname.startsWith('/aptitude')) {
      // console.log("Auto-selecting aptitude module");
      selectModule('aptitude');
    } else if (location.pathname === "/") {
      // console.log("On root path, resetting to dashboard");
      resetToDashboard();
    }
  }, [location.pathname, selectModule, resetToDashboard]);

  // Update sidebar width based on active module - ALWAYS COLLAPSED (85px)
  useEffect(() => {
    if (isMobile) {
      // Mobile logic - sidebars take full width when open
      if (activeModule === 'social') {
        setSidebarWidth(isMainMobileOpen ? "280px" : "0px");
      } else if (activeModule === 'company') {
        setSidebarWidth(isCompanyExpanded ? "280px" : "0px");
      } else if (activeModule === 'settings') {
        setSidebarWidth(isSettingsExpanded ? "280px" : "0px");
      } else if (activeModule === 'aptitude') {
        setSidebarWidth(isAptitudeExpanded ? "280px" : "0px");
      } else {
        setSidebarWidth("0px");
      }
    } else {
      // DESKTOP ALWAYS COLLAPSED: Always use collapsed width (85px) when module is active
      if (activeModule === 'social' || activeModule === 'company' || 
          activeModule === 'settings' || activeModule === 'aptitude') {
        setSidebarWidth("85px"); // Always collapsed width
      } else {
        setSidebarWidth("0px");
      }
    }
  }, [
    activeModule, 
    isMainHovered, 
    isMainMobileOpen, 
    isMainExpanded, 
    isCompanyHovered, 
    isCompanyExpanded, 
    isSettingsHovered, 
    isSettingsExpanded,
    isAptitudeHovered,
    isAptitudeExpanded,
    isAptitudeMobileOpen,
    isMobile
  ]);

  // Handle content transition
  useEffect(() => {
    if (activeModule) {
      setIsContentTransitioning(true);
      const timer = setTimeout(() => setIsContentTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
  }, [activeModule, isMainExpanded, isCompanyExpanded, isSettingsExpanded, isAptitudeExpanded]);

  // Handle module selection with navigation to dashboard
  const handleModuleClick = useCallback((module) => {
    // console.log("Module clicked:", module);

    // Navigate to the corresponding dashboard based on module
    switch(module) {
      case 'social':
        navigate("/social/dashboard");
        break;
      case 'company':
        navigate("/company/dashboard");
        break;
      case 'drive':
        navigate("/drive/dashboard");
        break;
      case 'settings':
        navigate("/settings/dashboard");
        break;
      case 'aptitude':
        navigate("/aptitude/dashboard");
        break;
      default:
        navigate("/");
    }
  }, [navigate]);

  // Handle back to dashboard
  const handleBackToDashboard = useCallback(() => {
    resetToDashboard();
    navigate("/");
  }, [resetToDashboard, navigate]);

  // Toggle current active sidebar - DISABLED for desktop (always collapsed)
  const toggleActiveSidebar = useCallback(() => {
    if (isMobile) {
      // Only allow toggle on mobile
      switch(activeModule) {
        case 'social':
          toggleMainSidebar();
          break;
        case 'company':
          toggleCompanySidebar();
          break;
        case 'settings':
          toggleSettingsSidebar();
          break;
        case 'aptitude':
          toggleAptitudeSidebar();
          break;
      }
    }
    // On desktop, do nothing (always collapsed)
  }, [activeModule, toggleMainSidebar, toggleCompanySidebar, 
      toggleSettingsSidebar, toggleAptitudeSidebar, isMobile]);

  // Dashboard Cards Data
  const dashboardCards = useMemo(() => [
    {
      id: 'social',
      title: 'Social Media',
      description: 'Manage users, creators, feeds, and reports',
      icon: <MessageSquare className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      stats: '24.5K Users',
      permission: null
    },
    {
      id: 'company',
      title: 'Jobs',
      description: 'HR, Jobs, Departments, and Performance',
      icon: <Building className="w-8 h-8" />,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      stats: '45 Jobs Posted',
      permission: 'canManageJobInfo'
    },
    {
      id: 'aptitude',
      title: 'Aptitude',
      description: 'Manage aptitude tests, questions, and assessments',
      icon: <Brain className="w-8 h-8" />,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      stats: '150 Tests',
      permission: 'canManageAptitudeTests'
    },
    {
      id: 'drive',
      title: 'Manage Google Drive',
      description: 'Manage files, folders, and storage in Google Drive',
      icon: <HardDrive className="w-8 h-8" />,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      stats: '2.4GB Used',
      permission: 'canManageGoogleDrive'
    },
    {
      id: 'settings',
      title: 'Admin Settings',
      description: 'System configuration and administration',
      icon: <Settings className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      stats: '12 Admins',
      permission: 'canManageChildAdmins'
    }
  ], []);

  // Check permissions and filter cards
  const availableCards = useMemo(() => {
    if (!admin) return dashboardCards;
    if (admin.role === "Admin") return dashboardCards;
    
    return dashboardCards.filter(card => 
      !card.permission || admin.grantedPermissions?.includes(card.permission)
    );
  }, [admin, dashboardCards]);

  // Calculate if sidebar is expanded (for content width adjustment) - ALWAYS FALSE ON DESKTOP
  const isSidebarExpanded = useMemo(() => {
    if (!activeModule || isMobile) return false;
    
    // On desktop, sidebar is always collapsed
    return false;
  }, [activeModule, isMobile]);

  // Calculate content dimensions - SIMPLIFIED FOR ALWAYS COLLAPSED
  const contentDimensions = useMemo(() => {
    // No active module or mobile - full width
    if (!activeModule || isMobile) {
      return {
        left: "0px",
        width: "100%",
        maxWidth: "max-w-[1600px]",
        padding: "px-4 sm:px-6 lg:px-8",
        sidebarCollapsed: false,
        sidebarVisible: false
      };
    }

    // Desktop: Always collapsed, so always use 85px offset
    return {
      left: "85px", // Always 85px on desktop
      width: "calc(100% - 85px)", // Always calculate with 85px
      maxWidth: "max-w-[calc(1600px-85px)]",
      padding: "pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8",
      sidebarCollapsed: true, // Always collapsed on desktop
      sidebarVisible: true
    };
  }, [activeModule, isMobile]);

  // Calculate sidebar toggle button position - HIDDEN ON DESKTOP
  const sidebarTogglePosition = useMemo(() => {
    // Only show on mobile when sidebar is visible
    if (isMobile && activeModule && 
        (activeModule === 'social' || activeModule === 'company' || 
         activeModule === 'settings' || activeModule === 'aptitude')) {
      return {
        left: "270px", // Position near the edge of sidebar
        transform: "translateX(-50%)"
      };
    }
    return null; // Hide on desktop
  }, [activeModule, isMobile]);

  // Debug log
  // useEffect(() => {
  //   console.log('Current Layout State:', {
  //     activeModule,
  //     location: location.pathname,
  //     shouldShowDashboardCards,
  //     sidebarWidth,
  //     contentLeft: contentDimensions.left,
  //     contentWidth: contentDimensions.width,
  //     maxWidth: contentDimensions.maxWidth,
  //     isSidebarExpanded,
  //     isContentTransitioning
  //   });
  // }, [activeModule, location.pathname, shouldShowDashboardCards, sidebarWidth, contentDimensions, isSidebarExpanded, isContentTransitioning]);

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      
      {/* Render only the active sidebar on the left side */}
      <div className={`
        fixed top-0 left-0 z-40 transition-all duration-300 h-screen
        ${activeModule ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        {/* Show only the active sidebar */}
        {activeModule === 'social' && <MainSidebar user={admin} />}
        {activeModule === 'company' && <CompanySidebar user={admin} />}
        {activeModule === 'settings' && <SettingsSidebar user={admin} />}
        {activeModule === 'aptitude' && <AptitudeSidebar user={admin} />}
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
      {(isMainMobileOpen || isCompanyHovered || isSettingsHovered || isAptitudeHovered) && <Backdrop />}
 
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
            {/* Show Dashboard Cards or Outlet based on state */}
            {shouldShowDashboardCards ? (
              <>
                {/* Welcome Header */}
                <div className="mb-8 sm:mb-12">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Welcome back, <span className="text-blue-600 dark:text-blue-400">{admin?.name || "Admin"}</span>
                      </h1>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 sm:mt-3 max-w-3xl">
                        Select a module to manage or explore your dashboard. Click on any card to open its sidebar.
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>System Status: Operational</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
               
                </div>
                 <DashBoardMetricks />
                {/* Module Selection Cards */}
                <div className="mb-8 sm:mb-12">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                    Available Modules
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {availableCards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => handleModuleClick(card.id)}
                        className={`
                          relative group overflow-hidden rounded-2xl p-6 text-left
                          transition-all duration-300 ease-out
                          ${card.bgColor} border ${card.borderColor}
                          hover:scale-[1.02] hover:shadow-xl
                          transform-gpu will-change-transform
                          ${activeModule === card.id ? 'ring-2 ring-offset-2 ring-current' : ''}
                        `}
                      >
                        {/* Gradient Background Effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                        
                        {/* Icon */}
                        <div className={`relative mb-4 w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}>
                          {card.icon}
                        </div>
                        
                        {/* Content */}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {card.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {card.description}
                        </p>
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {card.stats}
                          </span>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                            {activeModule === card.id ? '✓ Active' : 'Click to open →'}
                          </div>
                        </div>
                        
                        {/* Active Indicator */}
                        {activeModule === card.id && (
                          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-current"></div>
                        )}
                        
                        {/* Hover Indicator */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sidebar Active Status */}
                {activeModule && (
                  <div className="mb-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activeModule === 'social' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          activeModule === 'company' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                          activeModule === 'settings' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                          'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        }`}>
                          {activeModule === 'social' ? <MessageSquare className="w-5 h-5" /> :
                           activeModule === 'company' ? <Building className="w-5 h-5" /> :
                           activeModule === 'settings' ? <Settings className="w-5 h-5" /> :
                           <Brain className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {activeModule === 'social' ? 'Social Media Sidebar' :
                             activeModule === 'company' ? 'Company Sidebar' :
                             activeModule === 'settings' ? 'Settings Sidebar' :
                             'Aptitude Sidebar'} is active (collapsed)
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Navigate using the sidebar menu. Click any menu item to go to that page.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleBackToDashboard}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" /> Close Sidebar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700/50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">New user registered</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">New job posted</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">System updated</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Page Header - When sidebar is active but user navigated somewhere */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activeModule === 'social' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          activeModule === 'company' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                          activeModule === 'settings' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                          activeModule === 'aptitude' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                          'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        }`}>
                          {activeModule === 'social' ? <MessageSquare className="w-5 h-5" /> :
                           activeModule === 'company' ? <Building className="w-5 h-5" /> :
                           activeModule === 'settings' ? <Settings className="w-5 h-5" /> :
                           activeModule === 'aptitude' ? <Brain className="w-5 h-5" /> :
                           <BarChart className="w-5 h-5" />}
                        </div>
                        <div>
                          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {activeModule === 'social' ? 'Social Media' : 
                             activeModule === 'company' ? 'Company' :
                             activeModule === 'settings' ? 'Settings' :
                             activeModule === 'aptitude' ? 'Aptitude' :
                             activeModule === 'analytics' ? 'Analytics' :
                             'Dashboard'}
                          </h1>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 sm:mt-3 max-w-3xl">
                        {activeModule === 'social' ? 'Manage users, creators, feeds, and reports' :
                         activeModule === 'company' ? 'HR, Jobs, Departments, and Performance' :
                         activeModule === 'settings' ? 'System configuration and administration' :
                         activeModule === 'aptitude' ? 'Manage aptitude tests and assessments' :
                         activeModule === 'analytics' ? 'Advanced analytics and insights' :
                         "Here's what's happening with your dashboard today. Manage your data and monitor performance in real-time."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBackToDashboard}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
               
                {/* Content Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700/50 overflow-hidden transition-all duration-300">
                  <Outlet />
                </div>
              </>
            )}
           
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