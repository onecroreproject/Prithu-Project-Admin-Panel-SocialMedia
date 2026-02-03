import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PrithuLogo from "../Assets/Logo/PrithuLogo.png";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import {
  Grid,
  User,
  Users,
  Table,
  FileText,
  ChevronDown,
  Shield,
  LogOut,
  CreditCard,
  DollarSign,
  Cog,
  Home,
  BarChart3,
  Database,
  HardDrive
} from "lucide-react";

const mainNavItems = [
  {
    icon: <Grid className="w-5 h-5" />,
    name: "Dashboard",
    path: "/social/dashboard",
    permission: null
  },
  {
    icon: <User className="w-5 h-5" />,
    name: "User Profile",
    permission: "canManageUsers",
    subItems: [
      { name: "User Detail", path: "/social/profile", permission: "canManageUsersDetail" },
    ],
  },
  {
    icon: <Users className="w-5 h-5" />,
    name: "Creator Profile",
    permission: "canManageCreators",
    subItems: [
      { name: "Trending Creator", path: "/social/trending/creator", permission: "canTrendingCreators" }
    ]
  },
  {
    icon: <Table className="w-5 h-5" />,
    name: "Feeds Info",
    permission: "canManageFeedInfo",
    subItems: [
      { name: "Treanding Feeds", path: "/social/trending/feed", permission: "canManageTrendingFeeds" },
      { name: "User Feed Request", path: "/social/post/request/approval", permission: "canManageUserFeedRequest" },

    ]
  },
  {
    icon: <Users className="w-5 h-5" />,
    name: "Feed Management",
    permission: "canManageFeeds",
    subItems: [
      { name: "Feed Upload", path: "/social/admin/upload/page", permission: "canManageUpload" },
      { name: "Frame Upload", path: "/social/frame/upload/page", permission: "canManageFrames" },
      { name: "Category Management", path: "/social/category/management", permission: "canManageCategories" },
    ],
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: "Report",
    permission: "canManageReport",
    subItems: [
      { name: "User Feed Reports", path: "/social/user-reportinfo", permission: "canManageUsersFeedReports" },
    ],
  },
  {
    icon: <Shield className="w-5 h-5" />,
    name: "Admin Management",
    permission: "canManageChildAdmins",
    subItems: [
      { name: "Dashboard", path: "/settings/dashboard", permission: "canViewSettingsDashboard" },
      { name: "ChildAdmin Creation", path: "/settings/child/admin/page", permission: "canManageChildAdminsCreation" },
      { name: "Admin Roles", path: "/settings/admin/roles", permission: "canManageAdminRoles" },
      { name: "Permissions", path: "/settings/admin/permissions", permission: "canManagePermissions" },
      { name: "Studio", path: "/settings/admin/studio", permission: "canManageStudio" },
    ],
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    name: "Subscriptions",
    permission: "canManageSettings",
    subItems: [
      { name: "Manage Subscriptions", path: "/settings/subscription/page", permission: "canManageSettingsSubscriptions" },
      { name: "Billing", path: "/settings/billing", permission: "canViewBilling" },
      { name: "Plans", path: "/settings/plans", permission: "canManagePlans" },
    ],
  },
  {
    icon: <DollarSign className="w-5 h-5" />,
    name: "Sales",
    permission: "canManageSalesSettings",
    subItems: [
      { name: "Sales Dashboard", path: "/settings/sales/dashboard", permission: "canManageSalesDashboard" },
    ],
  },
  {
    icon: <Users className="w-5 h-5" />,
    name: "Settings Report",
    permission: "canManageUsers",
    subItems: [
      { name: "Report Management", path: "/settings/report/management", permission: "canManageAddReport" },
    ],
  },
  {
    icon: <Cog className="w-5 h-5" />,
    name: "Company Management",
    permission: "canfaqmanagement",
    subItems: [
      { name: "FAQ Settings", path: "/settings/faq/management", permission: "canFaqManagement" },
      { name: "User Feedbacks", path: "/settings/reportandfeedback/management", permission: "canManageUserFeedbacks" },
      { name: "Company Info", path: "/settings/company/info", permission: "canViewSystemLogs" },
    ],
  },
  {
    icon: <HardDrive className="w-5 h-5" />,
    name: "Manage Drive",
    path: "/drive/dashboard",
    permission: "canManageGoogleDrive",
  },
];

const SocialMediaSidebar = ({ user }) => {
  const {
    isMobileOpen,
    setIsHovered,
    isHovered,
    isMobile,
    setIsMobileOpen,
    expandMain
  } = useSidebar();

  const location = useLocation();
  const navigate = useNavigate();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const sidebarRef = useRef(null);

  const isActive = useCallback((path) => location.pathname.startsWith(path), [location.pathname]);

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

  const filteredNavItems = useMemo(() => filterMenu(mainNavItems), [user]);

  // Handle submenu toggle
  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prev) =>
      prev?.type === menuType && prev.index === index ? null : { type: menuType, index }
    );
  };

  // Set active item based on current path
  useEffect(() => {
    const findActiveItem = () => {
      for (let i = 0; i < filteredNavItems.length; i++) {
        const item = filteredNavItems[i];

        // Check if current path matches main item
        if (item.path && location.pathname === item.path) {
          setActiveItem({ index: i, type: "main" });
          return;
        }

        // Check subitems for matches
        if (item.subItems) {
          for (let j = 0; j < item.subItems.length; j++) {
            if (location.pathname === item.subItems[j].path) {
              setActiveItem({ index: i, type: "main" });
              setOpenSubmenu({ type: "main", index: i });
              return;
            }
          }
        }
      }

      // If no exact match found, try partial matching for social routes
      if (location.pathname.startsWith('/social') || location.pathname.startsWith('/user') ||
        location.pathname.startsWith('/creator') || location.pathname.startsWith('/admin') ||
        location.pathname.startsWith('/frame') || location.pathname.startsWith('/report') ||
        location.pathname.startsWith('/trending') ||
        location.pathname.startsWith('/settings') ||
        location.pathname.startsWith('/child') ||
        location.pathname.startsWith('/subscription') ||
        location.pathname.startsWith('/sales') ||
        location.pathname.startsWith('/social/category')) {
        const dashboardIndex = filteredNavItems.findIndex(item => item.path === "/social/dashboard");
        if (dashboardIndex !== -1) {
          setActiveItem({ index: dashboardIndex, type: "main" });
        }
      }
    };

    findActiveItem();
  }, [location.pathname, filteredNavItems]);

  // Ensure sidebar is expanded on mount if we're on a social route
  useEffect(() => {
    if (location.pathname.startsWith('/social') ||
      location.pathname.startsWith('/user') ||
      location.pathname.startsWith('/creator') ||
      location.pathname.startsWith('/admin') ||
      location.pathname.startsWith('/frame') ||
      location.pathname.startsWith('/report') ||
      location.pathname.startsWith('/trending')) {
      expandMain();
    }
  }, [expandMain, location.pathname]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen, setIsMobileOpen]);

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
        const hasActiveChild = nav.subItems?.some(sub => isActive(sub.path));
        const isDashboard = nav.path === "/social/dashboard";

        // Special handling for dashboard - always show as active if no other active item
        const showAsActive = isItemActive || (isDashboard && location.pathname.startsWith('/social'));

        return (
          <li key={nav.name} className="relative">
            {nav.subItems?.length ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`
                  group flex items-center gap-3 w-full px-3 py-3 rounded-xl
                  transition-all duration-300 ease-out
                  ${isSubmenuOpen || hasActiveChild
                    ? "bg-gradient-to-r from-blue-50 to-blue-50/70 dark:from-blue-900/20 dark:to-blue-900/10 text-blue-600 dark:text-blue-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }
                  ${showAsActive ? "ring-1 ring-blue-500/20" : ""}
                `}
                tabIndex={0}
              >
                <span className={`
                  flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                  transition-all duration-300
                  ${isSubmenuOpen || hasActiveChild
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  }
                `}>
                  {nav.icon}
                </span>

                <AnimatePresence mode="wait">
                  {(isHovered || isMobileOpen) && (
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

                {(isHovered || isMobileOpen) && (
                  <motion.div
                    animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                    className={`
                      w-5 h-5 transition-colors duration-300
                      ${isSubmenuOpen || hasActiveChild
                        ? "text-blue-500"
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
                onClick={() => {
                  if (isMobile) {
                    setIsMobileOpen(false);
                  }
                }}
                className={`
                  group flex items-center gap-3 px-3 py-3 rounded-xl
                  transition-all duration-300 ease-out relative
                  ${showAsActive
                    ? "bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-900/10 text-blue-600 dark:text-blue-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }
                `}
              >
                {showAsActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <span className={`
                  flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                  transition-all duration-300 relative z-10
                  ${showAsActive
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  }
                `}>
                  {nav.icon}
                </span>

                <AnimatePresence mode="wait">
                  {(isHovered || isMobileOpen) && (
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
              {isSubmenuOpen && (
                <motion.div
                  key={`submenu-${index}`}
                  variants={subMenuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <ul className="mt-1 space-y-1 ml-12 pl-1">
                    {nav.subItems?.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          onClick={() => {
                            if (isMobile) {
                              setIsMobileOpen(false);
                            }
                          }}
                          className={`
                            flex items-center px-3 py-2.5 rounded-lg text-sm
                            transition-all duration-300 relative group
                            ${isActive(subItem.path)
                              ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
                            }
                          `}
                        >
                          {isActive(subItem.path) && (
                            <motion.div
                              layoutId="activeSubIndicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-500 rounded-r-full"
                            />
                          )}
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 mr-2.5 flex-shrink-0" />
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
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
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 lg:hidden z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
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
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0
        `}
        variants={sidebarVariants}
        animate={isHovered || isMobileOpen ? "expanded" : "collapsed"}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobileOpen && setIsHovered(false)}
        style={{
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {/* Logo section */}
        <div className={`
          py-6 px-4 flex items-center border-b border-gray-100 dark:border-gray-800
          transition-all duration-500 bg-gradient-to-r from-white to-gray-50/50 
          dark:from-gray-900 dark:to-gray-900/50
          ${isHovered || isMobileOpen ? "justify-start" : "justify-center"}
        `}>
          <Link to="/social/dashboard" className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <img
                src={PrithuLogo}
                alt="Logo"
                className="w-10 h-10 rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-transparent" />
            </motion.div>
            <AnimatePresence mode="wait">
              {(isHovered || isMobileOpen) && (
                <motion.div
                  variants={logoVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="flex flex-col"
                >
                  <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    Social Media
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Main Portal
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-3 py-6">
          <nav className="mb-8">
            <div className="mb-6">
              {renderMenuItems(filteredNavItems, "main")}
            </div>
          </nav>

          {/* Social Media Info & Actions */}
          <AnimatePresence mode="wait">
            {(isHovered || isMobileOpen) && (
              <motion.div
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-6"
              >
               

                <div className="space-y-1 px-3">
                  <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 transition-colors">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">Manage Users</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sidebar Widget */}
          <AnimatePresence>
            {(isHovered || isMobileOpen) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
              >
                <SidebarWidget />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Mini View (Collapsed State) */}
        {user && !isHovered && !isMobileOpen && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
};

export default SocialMediaSidebar;