import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "../context/SidebarContext";
import { 
  BarChart, 
  Briefcase, 
  Building, 
  Users, 
  ChevronDown, 
  Home,
  Settings,
  FileText,
  CreditCard,
  Shield,
  UserCheck,
  UserX,
  Eye,
  Bell,
  MessageSquare,
  Database,
  TrendingUp,
  CheckCircle,
  Tag,
  Mail,
  LogOut,
  UserCircle,
  Building2,
  List
} from "lucide-react";

const companyNavItems = [
  {
    icon: <Home className="w-5 h-5" />,
    name: "Dashboard",
    path: "/company/dashboard",
    permission: "canViewCompanyDashboard",
  },
  {
    icon: <Building className="w-5 h-5" />,
    name: "Company Management",
    permission: "canManageCompanies",
    subItems: [
      { 
        name: "All Companies", 
        path: "/company/company/list", 
        permission: "canModerateCompanies" 
      },
      { 
        name: "Company Details", 
        path: "/company/profile/view/", // Base path without ID
        permission: "canVerifyCompanies",
        isDynamic: true // Mark as dynamic route
      },
      { 
        name: "Verification Badges", 
        path: "/company/management/verification", 
        permission: "canVerifyCompanies" 
      },
      { 
        name: "Suspended Companies", 
        path: "/company/management/suspended", 
        permission: "canSuspendCompanies" 
      },
    ],
  },
  {
    icon: <Users className="w-5 h-5" />,
    name: "User Application Management",
    permission: "canManageUsersApplications",
    subItems: [
      { 
        name: "Users Applications", 
        path: "/company/users", 
        permission: "canManageUserApplications" 
      },
    ],
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    name: "Job Moderation",
    permission: "canModerateJobs",
    subItems: [
      { name: "Job Approvals", path: "/company/job/list", permission: "canApproveJobs" },
      { name: "Active Jobs", path: "/company/jobs/active", permission: "canViewActiveJobs" },
      { name: "Reported Jobs", path: "/company/jobs/reported", permission: "canManageReportedJobs" },
    ],
  },
  {
    icon: <Tag className="w-5 h-5" />,
    name: "Content Management",
    permission: "canManageContent",
    subItems: [
      { name: "Job Categories", path: "/company/content/categories", permission: "canManageCategories" },
      { name: "Industries", path: "/company/content/industries", permission: "canManageIndustries" },
      { name: "Skill Tags", path: "/company/content/skills", permission: "canManageSkills" },
      { name: "Policies", path: "/company/content/policies", permission: "canManagePolicies" },
    ],
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    name: "Subscription & Payments",
    permission: "canManageSubscriptions",
    subItems: [
      { name: "All Subscriptions", path: "/company/subscriptions", permission: "canViewSubscriptions" },
      { name: "Premium Jobs", path: "/company/subscriptions/premium", permission: "canManagePremiumJobs" },
      { name: "Payment History", path: "/company/subscriptions/payments", permission: "canViewPayments" },
    ],
  },
  {
    icon: <BarChart className="w-5 h-5" />,
    name: "Platform Analytics",
    permission: "canViewAnalytics",
    subItems: [
      { name: "User Analytics", path: "/company/analytics/users", permission: "canViewUserAnalytics" },
      { name: "Job Analytics", path: "/company/analytics/jobs", permission: "canViewJobAnalytics" },
      { name: "Hire Analytics", path: "/company/analytics/hires", permission: "canViewHireAnalytics" },
      { name: "Traffic Sources", path: "/company/analytics/traffic", permission: "canViewTrafficAnalytics" },
    ],
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    name: "Customer Support",
    permission: "canManageSupport",
    subItems: [
      { name: "Support Tickets", path: "/company/support/tickets", permission: "canManageTickets" },
      { name: "User Inquiries", path: "/company/support/users", permission: "canManageUserSupport" },
      { name: "HR Inquiries", path: "/company/support/hr", permission: "canManageHRSupport" },
    ],
  },
  {
    icon: <Bell className="w-5 h-5" />,
    name: "Communications",
    permission: "canManageCommunications",
    subItems: [
      { name: "Email Templates", path: "/company/communications/templates", permission: "canManageTemplates" },
    ],
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: "Reports & Insights",
    permission: "canGenerateReports",
    subItems: [
      { name: "Business Intelligence", path: "/company/reports/bi", permission: "canViewBIReports" },
      { name: "Monthly Reports", path: "/company/reports/monthly", permission: "canGenerateReports" },
      { name: "Platform Health", path: "/company/reports/health", permission: "canViewPlatformHealth" },
      { name: "Export Data", path: "/company/reports/export", permission: "canExportData" },
    ],
  },
];

const CompanySidebar = ({ user }) => {
  const { 
    isMobileOpen: isCompanyMobileOpen, 
    setIsHovered: setIsCompanyHovered, 
    isHovered: isCompanyHovered 
  } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const sidebarRef = useRef(null);

  // Update isActive to handle dynamic routes
  const isActive = useCallback((path) => {
    if (path.includes('/company/profile/view/')) {
      // Handle dynamic company profile routes
      return location.pathname.startsWith('/company/profile/view/');
    }
    return location.pathname === path;
  }, [location.pathname]);

  // Check if current route is a company profile view
  const isCompanyProfileView = useCallback(() => {
    return location.pathname.startsWith('/company/profile/view/');
  }, [location.pathname]);

  // Filter menu based on permissions
  const filterMenu = (items) => {
    if (!user) return [];
    if (user.role === "Admin") return items;

    return items
      .filter(
        (item) =>
          !item.permission || user.grantedPermissions.includes(item.permission)
      )
      .map((item) => {
        const allowedSubs =
          item.subItems?.filter(
            (sub) =>
              !sub.permission ||
              user.grantedPermissions.includes(sub.permission) ||
              user.grantedPermissions.includes(item.permission)
          ) || [];

        return { ...item, subItems: allowedSubs };
      })
      .filter((item) => !item.subItems || item.subItems.length > 0);
  };

  const filteredNavItems = filterMenu(companyNavItems);

  // Handle submenu toggle
  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prev) =>
      prev?.type === menuType && prev.index === index ? null : { type: menuType, index }
    );
  };

  // Set active item based on current path
  useEffect(() => {
    const findActiveItem = (items) => {
      // First, check if we're on a company profile view
      if (isCompanyProfileView()) {
        // Find the "Company Management" item
        const companyMgmtIndex = items.findIndex(item => 
          item.name === "Company Management"
        );
        
        if (companyMgmtIndex !== -1) {
          setActiveItem({ index: companyMgmtIndex, type: "company" });
          setOpenSubmenu({ type: "company", index: companyMgmtIndex });
          return;
        }
      }
      
      // Regular route matching
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Check main item path
        if (item.path === location.pathname) {
          setActiveItem({ index: i, type: "company" });
          return;
        }
        
        // Check subitems
        if (item.subItems) {
          for (let j = 0; j < item.subItems.length; j++) {
            const subItem = item.subItems[j];
            
            // Handle dynamic routes
            if (subItem.isDynamic && location.pathname.startsWith(subItem.path)) {
              setActiveItem({ index: i, type: "company" });
              setOpenSubmenu({ type: "company", index: i });
              return;
            }
            
            // Regular exact match
            if (subItem.path === location.pathname) {
              setActiveItem({ index: i, type: "company" });
              setOpenSubmenu({ type: "company", index: i });
              return;
            }
          }
        }
      }
      
      // Default to dashboard only if no other match AND not on company profile view
      if (!isCompanyProfileView() && location.pathname.startsWith('/company')) {
        const dashboardIndex = items.findIndex(item => item.path === "/company/dashboard");
        if (dashboardIndex !== -1) {
          setActiveItem({ index: dashboardIndex, type: "company" });
        }
      }
    };
    
    findActiveItem(filteredNavItems);
  }, [location.pathname, filteredNavItems, isCompanyProfileView]);

  // Auto-expand company management when viewing company profile
  useEffect(() => {
    if (isCompanyProfileView()) {
      const companyMgmtIndex = filteredNavItems.findIndex(item => 
        item.name === "Company Management"
      );
      
      if (companyMgmtIndex !== -1) {
        setOpenSubmenu({ type: "company", index: companyMgmtIndex });
      }
    }
  }, [filteredNavItems, isCompanyProfileView]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCompanyMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsCompanyHovered(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCompanyMobileOpen, setIsCompanyHovered]);

  // Sidebar animations
  const sidebarVariants = {
    collapsed: {
      width: "85px",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30, 
        duration: 0.4 
      },
    },
    expanded: {
      width: "280px",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30, 
        duration: 0.4 
      }
    },
  };

  const logoVariants = {
    hidden: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 } 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      } 
    },
  };

  const menuItemVariants = {
    hidden: { 
      opacity: 0, 
      x: -10,
      transition: { duration: 0.15 } 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.25,
        ease: "easeOut"
      } 
    },
  };

  const subMenuVariants = {
    hidden: { 
      height: 0, 
      opacity: 0,
      transition: {
        height: { duration: 0.2, ease: "easeInOut" },
        opacity: { duration: 0.15 }
      }
    },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: {
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2, delay: 0.1 }
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.2, ease: "easeInOut" },
        opacity: { duration: 0.15 }
      }
    }
  };

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-1">
      {items.map((nav, index) => {
        const isSubmenuOpen = openSubmenu?.type === menuType && openSubmenu?.index === index;
        const isItemActive = activeItem?.index === index && activeItem?.type === menuType;
        const hasActiveChild = nav.subItems?.some(sub => {
          if (sub.isDynamic) {
            return location.pathname.startsWith(sub.path);
          }
          return isActive(sub.path);
        });
        
        // Special handling for Company Management when viewing company profile
        const isCompanyMgmtActive = nav.name === "Company Management" && isCompanyProfileView();
        
        return (
          <li key={nav.name} className="relative">
            {nav.subItems?.length ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`
                  group flex items-center gap-3 w-full px-3 py-3 rounded-xl
                  transition-all duration-300 ease-out
                  ${isSubmenuOpen || hasActiveChild || isCompanyMgmtActive
                    ? "bg-gradient-to-r from-emerald-50 to-emerald-50/70 dark:from-emerald-900/20 dark:to-emerald-900/10 text-emerald-600 dark:text-emerald-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }
                  ${isItemActive ? "ring-1 ring-emerald-500/20" : ""}
                `}
                tabIndex={0}
              >
                <span className={`
                  flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                  transition-all duration-300
                  ${isSubmenuOpen || hasActiveChild || isCompanyMgmtActive
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                  }
                `}>
                  {nav.icon}
                </span>
                
                <AnimatePresence mode="wait">
                  {(isCompanyHovered || isCompanyMobileOpen) && (
                    <motion.span
                      key={nav.name}
                      variants={menuItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="flex-1 text-left text-sm font-medium truncate"
                    >
                      {nav.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {(isCompanyHovered || isCompanyMobileOpen) && nav.subItems && (
                  <motion.div
                    animate={{ rotate: isSubmenuOpen || isCompanyMgmtActive ? 180 : 0 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                    className={`
                      w-5 h-5 transition-colors duration-300
                      ${isSubmenuOpen || hasActiveChild || isCompanyMgmtActive
                        ? "text-emerald-500"
                        : "text-gray-400 group-hover:text-gray-600"
                      }
                    `}
                  >
                    <ChevronDown className="w-full h-full" />
                  </motion.div>
                )}
              </button>
            ) : (
              <Link
                to={nav.path}
                className={`
                  group flex items-center gap-3 px-3 py-3 rounded-xl
                  transition-all duration-300 ease-out relative
                  ${isActive(nav.path)
                    ? "bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-900/10 text-emerald-600 dark:text-emerald-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }
                `}
                onClick={() => setIsCompanyHovered(false)}
              >
                {isActive(nav.path) && (
                  <motion.div
                    layoutId="companyActiveIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <span className={`
                  flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                  transition-all duration-300 relative z-10
                  ${isActive(nav.path)
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                  }
                `}>
                  {nav.icon}
                </span>
                
                <AnimatePresence mode="wait">
                  {(isCompanyHovered || isCompanyMobileOpen) && (
                    <motion.span
                      variants={menuItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="flex-1 text-sm font-medium truncate"
                    >
                      {nav.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )}
            
            {/* Submenu Animation */}
            <AnimatePresence>
              {(isSubmenuOpen || isCompanyMgmtActive) && (
                <motion.div
                  key={`company-submenu-${index}`}
                  variants={subMenuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <ul className="mt-1 space-y-1 ml-12 pl-1">
                    {nav.subItems?.map((subItem) => {
                      // Determine if this subitem should be active
                      const isSubItemActive = subItem.isDynamic 
                        ? location.pathname.startsWith(subItem.path)
                        : isActive(subItem.path);
                      
                      // For company details, show the company name if we're viewing a profile
                      let displayName = subItem.name;
                      if (subItem.isDynamic && isCompanyProfileView()) {
                        // Extract company name from URL or state if available
                        displayName = "Viewing Company";
                      }
                      
                      return (
                        <li key={subItem.name}>
                          {subItem.isDynamic && isCompanyProfileView() ? (
                            // Current company view - show as active link
                            <div
                              className={`
                                flex items-center px-3 py-2.5 rounded-lg text-sm
                                transition-all duration-300 relative group
                                ${isSubItemActive
                                  ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-default"
                                  : "text-gray-600 dark:text-gray-400"
                                }
                              `}
                            >
                              {isSubItemActive && (
                                <motion.div
                                  layoutId="companyActiveSubIndicator"
                                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-emerald-500 rounded-r-full"
                                />
                              )}
                              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 mr-2.5 flex-shrink-0" />
                              <span className="flex-1">{displayName}</span>
                              <span className="ml-2 text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                                Active
                              </span>
                            </div>
                          ) : (
                            // Regular link
                            <Link
                              to={subItem.path}
                              onClick={() => setIsCompanyHovered(false)}
                              className={`
                                flex items-center px-3 py-2.5 rounded-lg text-sm
                                transition-all duration-300 relative group
                                ${isSubItemActive
                                  ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
                                }
                              `}
                            >
                              {isSubItemActive && (
                                <motion.div
                                  layoutId="companyActiveSubIndicator"
                                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-emerald-500 rounded-r-full"
                                />
                              )}
                              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 mr-2.5 flex-shrink-0" />
                              {displayName}
                             
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isCompanyMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 lg:hidden z-40 backdrop-blur-sm"
          onClick={() => setIsCompanyHovered(false)}
        />
      )}

      <motion.aside
        ref={sidebarRef}
        layout
        className={`
          h-screen flex flex-col 
          bg-white dark:bg-gray-900 text-gray-900
          z-49 transition-all ease-in-out overflow-hidden
          shadow-xl dark:shadow-gray-900/50 border-r border-gray-200 dark:border-gray-800
          ${isCompanyMobileOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0
        `}
        variants={sidebarVariants}
        animate={isCompanyHovered || isCompanyMobileOpen ? "expanded" : "collapsed"}
        onMouseEnter={() => setIsCompanyHovered(true)}
        onMouseLeave={() => !isCompanyMobileOpen && setIsCompanyHovered(false)}
        style={{
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {/* Company Header */}
        <div className={`
          py-6 px-4 flex items-center border-b border-gray-100 dark:border-gray-800
          transition-all duration-500 bg-gradient-to-r from-white to-gray-50/50 
          dark:from-gray-900 dark:to-gray-900/50
          ${isCompanyHovered || isCompanyMobileOpen ? "justify-start" : "justify-center"}
        `}>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-300 flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            <AnimatePresence mode="wait">
              {(isCompanyHovered || isCompanyMobileOpen) && (
                <motion.div
                  variants={logoVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="flex flex-col"
                >
                  <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                    Job Portal Admin
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Platform Management
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-3 py-6">
          <nav className="mb-8">
            <div className="mb-6">
              <h2 className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-4 px-3">
                {isCompanyHovered || isCompanyMobileOpen ? (
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                    PLATFORM ADMIN
                  </span>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                    <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "company")}
            </div>
          </nav>
          
          {/* Platform Stats & Actions */}
          <AnimatePresence mode="wait">
            {(isCompanyHovered || isCompanyMobileOpen) && (
              <motion.div
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-6"
              >
                <div className="px-3 mb-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Platform Stats
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">
                            <UserCheck className="w-3 h-3 inline mr-1" />
                            24.5K Users
                          </span>
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            <Briefcase className="w-3 h-3 inline mr-1" />
                            1.2K Jobs
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 px-3">
                  <Link
                    to="/company/company/list"
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <List className="w-5 h-5" />
                    <span className="text-sm font-medium">Company List</span>
                  </Link>
                  <Link
                    to="/company/support/tickets"
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-sm font-medium">Support Tickets</span>
                    <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">8</span>
                  </Link>
                  <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-red-600 dark:text-red-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Switch Module</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Current View Indicator (for collapsed state) */}
        {isCompanyProfileView() && !isCompanyHovered && !isCompanyMobileOpen && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
};

export default CompanySidebar;