import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const SidebarContext = createContext();
export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }) => {
  // MOBILE DETECTION
  const [isMobile, setIsMobile] = useState(false);

  // SOCIAL SIDEBAR
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // COMPANY SIDEBAR
  const [isCompanyExpanded, setIsCompanyExpanded] = useState(false);
  const [isCompanyHovered, setIsCompanyHovered] = useState(false);
  const [isCompanyMobileOpen, setIsCompanyMobileOpen] = useState(false);

  // SETTINGS SIDEBAR
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const [isSettingsMobileOpen, setIsSettingsMobileOpen] = useState(false);

  // APTITUDE SIDEBAR
  const [isAptitudeExpanded, setIsAptitudeExpanded] = useState(false);
  const [isAptitudeHovered, setIsAptitudeHovered] = useState(false);
  const [isAptitudeMobileOpen, setIsAptitudeMobileOpen] = useState(false);

  // ACTIVE MODULE
  const [activeModule, setActiveModule] = useState(null);

  // -----------------------------
  // RESPONSIVE HANDLING
  // -----------------------------
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) {
        setIsMobileOpen(false);
        setIsCompanyMobileOpen(false);
        setIsSettingsMobileOpen(false);
        setIsAptitudeMobileOpen(false);
      }
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // -----------------------------
  // EXPAND/COLLAPSE/TOGGLE FUNCTIONS
  // -----------------------------
  
  // Social Sidebar
  const expandMain = useCallback(() => {
    setIsExpanded(true);
    setActiveModule('social');
  }, []);

  const collapseMain = useCallback(() => setIsExpanded(false), []);

  const toggleMainSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen(prev => !prev);
    } else {
      setIsExpanded(prev => !prev);
    }
  }, [isMobile]);

  // Company Sidebar
  const expandCompany = useCallback(() => {
    setIsCompanyExpanded(true);
    setActiveModule('company');
  }, []);

  const collapseCompany = useCallback(() => setIsCompanyExpanded(false), []);

  const toggleCompanySidebar = useCallback(() => {
    if (isMobile) {
      setIsCompanyMobileOpen(prev => !prev);
    } else {
      setIsCompanyExpanded(prev => !prev);
    }
  }, [isMobile]);

  // Settings Sidebar
  const expandSettings = useCallback(() => {
    setIsSettingsExpanded(true);
    setActiveModule('settings');
  }, []);

  const collapseSettings = useCallback(() => setIsSettingsExpanded(false), []);

  const toggleSettingsSidebar = useCallback(() => {
    if (isMobile) {
      setIsSettingsMobileOpen(prev => !prev);
    } else {
      setIsSettingsExpanded(prev => !prev);
    }
  }, [isMobile]);

  // Aptitude Sidebar
  const expandAptitude = useCallback(() => {
    setIsAptitudeExpanded(true);
    setActiveModule('aptitude');
  }, []);

  const collapseAptitude = useCallback(() => setIsAptitudeExpanded(false), []);

  const toggleAptitudeSidebar = useCallback(() => {
    if (isMobile) {
      setIsAptitudeMobileOpen(prev => !prev);
    } else {
      setIsAptitudeExpanded(prev => !prev);
    }
  }, [isMobile]);

  // -----------------------------
  // SELECT MODULE — OPEN CORRECT SIDEBAR
  // -----------------------------
  const selectModule = useCallback((module) => {
    console.log("selectModule called with:", module);
    
    // First collapse all sidebars
    setIsExpanded(false);
    setIsCompanyExpanded(false);
    setIsSettingsExpanded(false);
    setIsAptitudeExpanded(false);
    setIsHovered(false);
    setIsCompanyHovered(false);
    setIsSettingsHovered(false);
    setIsAptitudeHovered(false);
    
    // Set active module
    setActiveModule(module);
    
    // Expand the selected module's sidebar
    switch(module) {
      case "social":
        setIsExpanded(true);
        break;
      case "company":
        setIsCompanyExpanded(true);
        break;
      case "settings":
        setIsSettingsExpanded(true);
        break;
      case "aptitude":
        setIsAptitudeExpanded(true);
        break;
      default:
        break;
    }
  }, []);

  // -----------------------------
  // RESET BACK TO DASHBOARD
  // -----------------------------
  const resetToDashboard = useCallback(() => {
    console.log("resetToDashboard called");
    setActiveModule(null);
    setIsExpanded(false);
    setIsCompanyExpanded(false);
    setIsSettingsExpanded(false);
    setIsAptitudeExpanded(false);
    setIsHovered(false);
    setIsCompanyHovered(false);
    setIsSettingsHovered(false);
    setIsAptitudeHovered(false);
    
    // Close mobile sidebars
    if (isMobile) {
      setIsMobileOpen(false);
      setIsCompanyMobileOpen(false);
      setIsSettingsMobileOpen(false);
      setIsAptitudeMobileOpen(false);
    }
  }, [isMobile]);

  // -----------------------------
  // TOGGLE ACTIVE SIDEBAR
  // -----------------------------
  const toggleActiveSidebar = useCallback(() => {
    if (!activeModule) return;
    
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
      default:
        break;
    }
  }, [activeModule, toggleMainSidebar, toggleCompanySidebar, toggleSettingsSidebar, toggleAptitudeSidebar]);

  // -----------------------------
  // CLOSE ALL SIDEBARS
  // -----------------------------
  const closeAllSidebars = useCallback(() => {
    setIsExpanded(false);
    setIsCompanyExpanded(false);
    setIsSettingsExpanded(false);
    setIsAptitudeExpanded(false);
    setIsMobileOpen(false);
    setIsCompanyMobileOpen(false);
    setIsSettingsMobileOpen(false);
    setIsAptitudeMobileOpen(false);
    setIsHovered(false);
    setIsCompanyHovered(false);
    setIsSettingsHovered(false);
    setIsAptitudeHovered(false);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isMobile,

        // SOCIAL SIDEBAR
        isExpanded,
        isMobileOpen,
        isHovered,
        expandMain,
        collapseMain,
        toggleMainSidebar,
        setIsHovered,
        setIsMobileOpen,

        // COMPANY SIDEBAR
        isCompanyExpanded,
        isCompanyMobileOpen,
        isCompanyHovered,
        expandCompany,
        collapseCompany,
        toggleCompanySidebar,
        setIsCompanyHovered,
        setIsCompanyMobileOpen,

        // SETTINGS SIDEBAR
        isSettingsExpanded,
        isSettingsMobileOpen,
        isSettingsHovered,
        expandSettings,
        collapseSettings,
        toggleSettingsSidebar,
        setIsSettingsHovered,
        setIsSettingsMobileOpen,

        // APTITUDE SIDEBAR
        isAptitudeExpanded,
        isAptitudeMobileOpen,
        isAptitudeHovered,
        expandAptitude,
        collapseAptitude,
        toggleAptitudeSidebar,
        setIsAptitudeHovered,
        setIsAptitudeMobileOpen,

        // MODULE MANAGEMENT
        activeModule,
        selectModule,
        resetToDashboard,
        toggleActiveSidebar,
        closeAllSidebars,

        // HELPER FUNCTIONS
        getActiveSidebarState: useCallback(() => {
          if (!activeModule) return null;
          
          switch(activeModule) {
            case 'social':
              return {
                isExpanded: isExpanded || isHovered,
                isMobileOpen,
                isHovered
              };
            case 'company':
              return {
                isExpanded: isCompanyExpanded || isCompanyHovered,
                isMobileOpen: isCompanyMobileOpen,
                isHovered: isCompanyHovered
              };
            case 'settings':
              return {
                isExpanded: isSettingsExpanded || isSettingsHovered,
                isMobileOpen: isSettingsMobileOpen,
                isHovered: isSettingsHovered
              };
            case 'aptitude':
              return {
                isExpanded: isAptitudeExpanded || isAptitudeHovered,
                isMobileOpen: isAptitudeMobileOpen,
                isHovered: isAptitudeHovered
              };
            default:
              return null;
          }
        }, [activeModule, isExpanded, isHovered, isMobileOpen, isCompanyExpanded, isCompanyHovered, isCompanyMobileOpen, isSettingsExpanded, isSettingsHovered, isSettingsMobileOpen, isAptitudeExpanded, isAptitudeHovered, isAptitudeMobileOpen]),

        // Check if any sidebar is expanded
        isAnySidebarExpanded: useCallback(() => {
          return isExpanded || isCompanyExpanded || isSettingsExpanded || isAptitudeExpanded || 
                 isMobileOpen || isCompanyMobileOpen || isSettingsMobileOpen || isAptitudeMobileOpen ||
                 isHovered || isCompanyHovered || isSettingsHovered || isAptitudeHovered;
        }, [isExpanded, isCompanyExpanded, isSettingsExpanded, isAptitudeExpanded, 
            isMobileOpen, isCompanyMobileOpen, isSettingsMobileOpen, isAptitudeMobileOpen,
            isHovered, isCompanyHovered, isSettingsHovered, isAptitudeHovered])
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};