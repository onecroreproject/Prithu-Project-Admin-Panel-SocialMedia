import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "../context/SidebarContext";
import { 
  Brain,
  BookOpen,
  FileText,
  Users,
  BarChart,
  Settings,
  Clock,
  CheckCircle,
  PlusCircle,
  FolderOpen,
  HelpCircle,
  Award,
  ChevronDown,
  Home,
  LogOut,
  FileQuestion,
  ClipboardCheck,
  TrendingUp
} from "lucide-react";

const aptitudeNavItems = [
  {
    icon: <Home className="w-5 h-5" />,
    name: "Dashboard",
    path: "/aptitude/dashboard",
    permission: "canViewAptitudeDashboard",
  },
  {
    icon: <BarChart className="w-5 h-5" />,
    name: "Results & Analytics",
    permission: "canViewResults",
    subItems: [
      { name: "Test Management", path: "/aptitude/test/management", permission: "canManageTest" },
      { name: "Performance Reports", path: "/aptitude/results/reports/testId", permission: "canGenerateReports" },
    ],
  },
];

const AptitudeSidebar = ({ user }) => {
  const { 
    isAptitudeMobileOpen, 
    isAptitudeHovered, 
    setIsAptitudeHovered 
  } = useSidebar();
  
  const location = useLocation();
  const navigate = useNavigate();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const sidebarRef = useRef(null);
  const [redirecting, setRedirecting] = useState(false); // Add redirecting state

  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

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

  const filteredNavItems = filterMenu(aptitudeNavItems);

  // Handle submenu toggle
  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prev) =>
      prev?.type === menuType && prev.index === index ? null : { type: menuType, index }
    );
  };

  // Set active item based on current path - REMOVE AUTO-REDIRECT LOGIC
  useEffect(() => {
    const findActiveItem = (items, parentIndex = null) => {
      let foundActive = false;
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Check main item path
        if (item.path === location.pathname) {
          setActiveItem({ index: i, type: "aptitude", parentIndex: null });
          foundActive = true;
          return;
        }
        
        // Check subitems
        if (item.subItems) {
          for (let j = 0; j < item.subItems.length; j++) {
            if (item.subItems[j].path === location.pathname) {
              setActiveItem({ index: i, type: "aptitude", parentIndex: null });
              setOpenSubmenu({ type: "aptitude", index: i });
              foundActive = true;
              return;
            }
          }
        }
      }
      
      // If no active item found and we're on aptitude routes, set to null
      if (!foundActive && location.pathname.startsWith('/aptitude')) {
        // Find if any aptitude route matches
        const isAptitudeRoute = items.some(item => 
          item.path?.startsWith('/aptitude') || 
          item.subItems?.some(sub => sub.path?.startsWith('/aptitude'))
        );
        
        if (isAptitudeRoute) {
          // Set active item to null but don't redirect
          setActiveItem(null);
        }
      }
    };
    
    findActiveItem(filteredNavItems);
  }, [location.pathname, filteredNavItems]); // Remove navigate from dependencies

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAptitudeMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsAptitudeHovered(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAptitudeMobileOpen, setIsAptitudeHovered]);

  // Handle manual navigation to dashboard if needed
  const handleGoToDashboard = useCallback(() => {
    if (!redirecting && location.pathname !== "/aptitude/dashboard") {
      setRedirecting(true);
      navigate("/aptitude/dashboard");
      // Reset redirecting state after navigation
      setTimeout(() => setRedirecting(false), 100);
    }
  }, [navigate, location.pathname, redirecting]);

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
        
        return (
          <li key={nav.name} className="relative">
            {nav.subItems?.length ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`
                  group flex items-center gap-3 w-full px-3 py-3 rounded-xl
                  transition-all duration-300 ease-out
                  ${isSubmenuOpen || hasActiveChild
                    ? "bg-gradient-to-r from-indigo-50 to-indigo-50/70 dark:from-indigo-900/20 dark:to-indigo-900/10 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }
                  ${isItemActive ? "ring-1 ring-indigo-500/20" : ""}
                `}
                tabIndex={0}
              >
                <span className={`
                  flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                  transition-all duration-300
                  ${isSubmenuOpen || hasActiveChild
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                  }
                `}>
                  {nav.icon}
                </span>
                
                <AnimatePresence mode="wait">
                  {(isAptitudeHovered || isAptitudeMobileOpen) && (
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
                
                {(isAptitudeHovered || isAptitudeMobileOpen) && nav.subItems && (
                  <motion.div
                    animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                    className={`
                      w-5 h-5 transition-colors duration-300
                      ${isSubmenuOpen || hasActiveChild
                        ? "text-indigo-500"
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
                    ? "bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/30 dark:to-indigo-900/10 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }
                `}
                onClick={() => setIsAptitudeHovered(false)}
              >
                {isActive(nav.path) && (
                  <motion.div
                    layoutId="aptitudeActiveIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <span className={`
                  flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                  transition-all duration-300 relative z-10
                  ${isActive(nav.path)
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                  }
                `}>
                  {nav.icon}
                </span>
                
                <AnimatePresence mode="wait">
                  {(isAptitudeHovered || isAptitudeMobileOpen) && (
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
                  key={`aptitude-submenu-${index}`}
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
                          onClick={() => setIsAptitudeHovered(false)}
                          className={`
                            flex items-center px-3 py-2.5 rounded-lg text-sm
                            transition-all duration-300 relative group
                            ${isActive(subItem.path)
                              ? "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
                            }
                          `}
                        >
                          {isActive(subItem.path) && (
                            <motion.div
                              layoutId="aptitudeActiveSubIndicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-500 rounded-r-full"
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
      {isAptitudeMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 lg:hidden z-40 backdrop-blur-sm"
          onClick={() => setIsAptitudeHovered(false)}
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
          ${isAptitudeMobileOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0
        `}
        variants={sidebarVariants}
        animate={isAptitudeHovered ? "expanded" : "collapsed"}
        onMouseEnter={() => setIsAptitudeHovered(true)}
        onMouseLeave={() => !isAptitudeMobileOpen && setIsAptitudeHovered(false)}
        style={{
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {/* Aptitude Header */}
        <div className={`
          py-6 px-4 flex items-center border-b border-gray-100 dark:border-gray-800
          transition-all duration-500 bg-gradient-to-r from-white to-gray-50/50 
          dark:from-gray-900 dark:to-gray-900/50
          ${isAptitudeHovered || isAptitudeMobileOpen ? "justify-start" : "justify-center"}
        `}>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-300 flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            <AnimatePresence mode="wait">
              {(isAptitudeHovered || isAptitudeMobileOpen) && (
                <motion.div
                  variants={logoVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="flex flex-col"
                >
                  <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                    Aptitude Hub
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role === "Admin" ? "Administrator" : "Manager"}
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
                {isAptitudeHovered || isAptitudeMobileOpen ? (
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-4 bg-indigo-500 rounded-full" />
                    ASSESSMENT PORTAL
                  </span>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto">
                    <Brain className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "aptitude")}
            </div>
          </nav>
          
          {/* Aptitude Info & Actions */}
          <AnimatePresence mode="wait">
            {(isAptitudeHovered || isAptitudeMobileOpen) && (
              <motion.div
                variants={menuItemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-6"
              >
                <div className="px-3 mb-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center flex-shrink-0">
                        <ClipboardCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Assessment Stats
                        </p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                          150 Tests • 2K Candidates • 98% Accuracy
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Optional: Add a Dashboard quick link if needed */}
                {!isActive("/aptitude/dashboard") && (
                  <div className="px-3 mb-4">
                    <button
                      onClick={handleGoToDashboard}
                      disabled={redirecting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors duration-300 disabled:opacity-50"
                    >
                      <Home className="w-4 h-4" />
                      Go to Dashboard
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
};

export default AptitudeSidebar;