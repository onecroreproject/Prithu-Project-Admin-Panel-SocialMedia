import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Changed from "react-router"
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDownIcon,
  BellIcon,
  CogIcon,
  CreditCardIcon,
  ShieldIcon,
  DollarSignIcon,
  HomeIcon,
  UsersIcon,
  BarChart3Icon,
  DatabaseIcon
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";

const settingsNavItems = [
  {
    icon: <HomeIcon className="w-5 h-5" />,
    name: "Dashboard",
    path: "/settings/dashboard",
    permission: "canViewSettingsDashboard",
  },
  {
    icon: <ShieldIcon className="w-5 h-5" />,
    name: "Admin",
    permission: "canManageChildAdmins",
    subItems: [
      { name: "ChildAdmin Creation", path: "/settings/child/admin/page", permission: "canManageChildAdminsCreation" },
      { name: "Admin Roles", path: "/settings/admin/roles", permission: "canManageAdminRoles" },
      { name: "Permissions", path: "/settings/admin/permissions", permission: "canManagePermissions" },
      { name: "Studio", path: "/settings/admin/studio", permission: "canManageStudio" },
    ],
  },
  {
    icon: <CreditCardIcon className="w-5 h-5" />,
    name: "Subscriptions",
    permission: "canManageSettings",
    subItems: [
      { name: "Manage Subscriptions", path: "/settings/subscription/page", permission: "canManageSettingsSubscriptions" },
      { name: "Billing", path: "/settings/billing", permission: "canViewBilling" },
      { name: "Plans", path: "/settings/plans", permission: "canManagePlans" },
    ],
  },
  {
    icon: <DollarSignIcon className="w-5 h-5" />,
    name: "Sales",
    permission: "canManageSalesSettings",
    subItems: [
      { name: "Sales Dashboard", path: "/settings/sales/dashboard", permission: "canManageSalesDashboard" },

    ],
  },

  {
    icon: <UsersIcon className="w-5 h-5" />,
    name: "Report Management",
    permission: "canManageUsers",
    subItems: [
      { name: "Report Management", path: "/settings/report/management", permission: "canManageAddReport" },
    ],
  },



  // {
  //   icon: <BellIcon className="w-5 h-5" />,
  //   name: "Notifications",
  //   permission: "canManageNotifications",
  //   subItems: [
  //     { name: "Email Templates", path: "/settings/notifications/email", permission: "canManageEmailTemplates" },
  //     { name: "Push Settings", path: "/settings/notifications/push", permission: "canManagePushSettings" },
  //     { name: "SMS Settings", path: "/settings/notifications/sms", permission: "canManageSMSSettings" },
  //   ],
  // },
  {
    icon: <CogIcon className="w-5 h-5" />,
    name: "Company Management",
    permission: "canFaqManagement",
    subItems: [
      { name: "FAQ Settings", path: "/settings/faq/management", permission: "canFaqManagement" },
      { name: "User Feedbacks", path: "/settings/reportandfeedback/management", permission: "canManageUserFeedbacks" },
      { name: "Company Info", path: "/settings/company/info", permission: "canViewSystemLogs" },
    ],
  },
];

const SettingsSidebar = ({ user }) => {
  const {
    isMobileOpen: isSettingsMobileOpen,
    setIsHovered: setIsSettingsHovered,
    isHovered: isSettingsHovered,
    isExpanded: isSettingsExpanded,
    setIsMobileOpen: setIsSettingsMobileOpen,
    expandSettings
  } = useSidebar();

  const location = useLocation();
  const navigate = useNavigate();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const sidebarRef = useRef(null);

  // Improved isActive function to handle all settings routes
  const isActive = useCallback((path) => {
    // Exact match
    if (location.pathname === path) return true;

    // For dashboard, check if we're on any settings route
    if (path === "/settings/dashboard") {
      return location.pathname.startsWith('/settings') ||
        location.pathname.startsWith('/child') ||
        location.pathname.startsWith('/subscription') ||
        location.pathname.startsWith('/sales') ||
        location.pathname === '/admin/profile/page';
    }

    return false;
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

  const filteredNavItems = filterMenu(settingsNavItems);

  // Handle submenu toggle
  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prev) =>
      prev?.type === menuType && prev.index === index ? null : { type: menuType, index }
    );
  };

  // Set active item based on current path
  useEffect(() => {
    const findActiveItem = () => {
      let foundActive = false;

      for (let i = 0; i < filteredNavItems.length; i++) {
        const item = filteredNavItems[i];

        // Check main item path
        if (item.path && isActive(item.path)) {
          setActiveItem({ index: i, type: "settings", parentIndex: null });
          foundActive = true;
          return;
        }

        // Check subitems
        if (item.subItems) {
          for (let j = 0; j < item.subItems.length; j++) {
            if (location.pathname === item.subItems[j].path) {
              setActiveItem({ index: i, type: "settings", parentIndex: null });
              setOpenSubmenu({ type: "settings", index: i });
              foundActive = true;
              return;
            }
          }
        }
      }

      // If no exact match found but we're on a settings route, highlight dashboard
      if (!foundActive && (
        location.pathname.startsWith('/settings') ||
        location.pathname.startsWith('/child') ||
        location.pathname.startsWith('/subscription') ||
        location.pathname.startsWith('/sales') ||
        location.pathname === '/admin/profile/page'
      )) {
        const dashboardIndex = filteredNavItems.findIndex(item => item.path === "/settings/dashboard");
        if (dashboardIndex !== -1) {
          setActiveItem({ index: dashboardIndex, type: "settings", parentIndex: null });
        }
      }
    };

    findActiveItem();
  }, [location.pathname, filteredNavItems, isActive]);

  // Ensure sidebar is expanded on mount if we're on a settings route
  useEffect(() => {
    if (
      location.pathname.startsWith('/settings') ||
      location.pathname.startsWith('/child') ||
      location.pathname.startsWith('/subscription') ||
      location.pathname.startsWith('/sales') ||
      location.pathname === '/admin/profile/page'
    ) {
      expandSettings();
    }
  }, [expandSettings, location.pathname]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSettingsMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSettingsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSettingsMobileOpen, setIsSettingsMobileOpen]);

  // Sidebar animations
  const sidebarVariants = {
    collapsed: {
      width: isSettingsMobileOpen ? "0px" : "85px",
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
        const hasActiveChild = nav.subItems?.some(sub => location.pathname === sub.path);
        const isDashboard = nav.path === "/settings/dashboard";

        // Special handling for dashboard
        const showAsActive = isItemActive || (isDashboard && isActive(nav.path));

        return (
          <li key={nav.name} className="relative">
            {nav.subItems?.length ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`
                  group flex items-center gap-3 w-full px-3 py-3 rounded-xl
                  transition-all duration-300 ease-out
                  ${isSubmenuOpen || hasActiveChild
                    ? "bg-gradient-to-r from-purple-50 to-purple-50/70 dark:from-purple-900/20 dark:to-purple-900/10 text-purple-600 dark:text-purple-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }
                  ${showAsActive ? "ring-1 ring-purple-500/20" : ""}
                `}
                tabIndex={0}
              >
                <span className={`
                  flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                  transition-all duration-300
                  ${isSubmenuOpen || hasActiveChild
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                  }
                `}>
                  {nav.icon}
                </span>

                <AnimatePresence mode="wait">
                  {(isSettingsHovered || isSettingsMobileOpen || isSettingsExpanded) && (
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

                {(isSettingsHovered || isSettingsMobileOpen || isSettingsExpanded) && nav.subItems && (
                  <motion.div
                    animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                    className={`
                      w-5 h-5 transition-colors duration-300
                      ${isSubmenuOpen || hasActiveChild
                        ? "text-purple-500"
                        : "text-gray-400 group-hover:text-gray-600"
                      }
                    `}
                  >
                    <ChevronDownIcon className="w-full h-full" />
                  </motion.div>
                )}
              </button>
            ) : (
              <Link
                to={nav.path}
                onClick={() => {
                  // Only close on mobile
                  if (isSettingsMobileOpen) {
                    setIsSettingsMobileOpen(false);
                  }
                }}
                className={`
                  group flex items-center gap-3 px-3 py-3 rounded-xl
                  transition-all duration-300 ease-out relative
                  ${showAsActive
                    ? "bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-900/10 text-purple-600 dark:text-purple-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }
                `}
              >
                {showAsActive && (
                  <motion.div
                    layoutId="settingsActiveIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <span className={`
                  flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                  transition-all duration-300 relative z-10
                  ${showAsActive
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                  }
                `}>
                  {nav.icon}
                </span>

                <AnimatePresence mode="wait">
                  {(isSettingsHovered || isSettingsMobileOpen || isSettingsExpanded) && (
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
                  key={`settings-submenu-${index}`}
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
                            // Only close on mobile
                            if (isSettingsMobileOpen) {
                              setIsSettingsMobileOpen(false);
                            }
                          }}
                          className={`
                            flex items-center px-3 py-2.5 rounded-lg text-sm
                            transition-all duration-300 relative group
                            ${location.pathname === subItem.path
                              ? "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
                            }
                          `}
                        >
                          {location.pathname === subItem.path && (
                            <motion.div
                              layoutId="settingsActiveSubIndicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-purple-500 rounded-r-full"
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
      {isSettingsMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 lg:hidden z-40 backdrop-blur-sm"
          onClick={() => setIsSettingsMobileOpen(false)}
        />
      )}

      <motion.aside
        ref={sidebarRef}
        layout
        className={`
          h-screen flex flex-col 
          bg-white dark:bg-gray-900 text-gray-900
          z-49 transition-all ease-in-out overflow-hidden
          shadow-xl dark:shadow-gray-900/50 border-l border-gray-200 dark:border-gray-800
          ${isSettingsMobileOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0
        `}
        variants={sidebarVariants}
        animate={isSettingsHovered || isSettingsMobileOpen || isSettingsExpanded ? "expanded" : "collapsed"}
        onMouseEnter={() => setIsSettingsHovered(true)}
        onMouseLeave={() => !isSettingsMobileOpen && setIsSettingsHovered(false)}
        style={{
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {/* Settings Header */}
        <div className={`
          py-6 px-4 flex items-center border-b border-gray-100 dark:border-gray-800
          transition-all duration-500 bg-gradient-to-r from-white to-gray-50/50 
          dark:from-gray-900 dark:to-gray-900/50
          ${isSettingsHovered || isSettingsMobileOpen || isSettingsExpanded ? "justify-start" : "justify-center"}
        `}>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-300 flex items-center justify-center shadow-lg">
                <CogIcon className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            <AnimatePresence mode="wait">
              {(isSettingsHovered || isSettingsMobileOpen || isSettingsExpanded) && (
                <motion.div
                  variants={logoVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="flex flex-col"
                >
                  <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                    Admin Panel
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Platform Configuration
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
                {isSettingsHovered || isSettingsMobileOpen || isSettingsExpanded ? (
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-4 bg-purple-500 rounded-full" />
                    ADMIN PANEL
                  </span>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto">
                    <CogIcon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  </div>
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "settings")}
            </div>
          </nav>

          {/* System Status */}
          <AnimatePresence mode="wait">
            {(isSettingsHovered || isSettingsMobileOpen || isSettingsExpanded) && (
              <motion.div
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-6"
              >
                <div className="px-3 mb-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-800 flex items-center justify-center flex-shrink-0">
                        <ShieldIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          System Status
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                          All systems operational
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
};

export default SettingsSidebar;