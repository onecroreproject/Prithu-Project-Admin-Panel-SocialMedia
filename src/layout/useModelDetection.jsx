// useModuleDetection.js
import { useLocation } from "react-router";
import { useCallback, useEffect } from "react";
import { useSidebar } from "../context/SidebarContext";

export const useModuleDetection = () => {
  const location = useLocation();
  const { activeModule, selectModule, resetToDashboard } = useSidebar();

  // Detect module based on path
  const detectModuleFromPath = useCallback((path) => {
    if (path.startsWith('/social/')) return 'social';
    if (path.startsWith('/company/')) return 'company';
    if (path.startsWith('/settings/')) return 'settings';
    if (path.startsWith('/analytics/')) return 'analytics';
    return null;
  }, []);

  // Auto-detect and maintain module on route change
  useEffect(() => {
    const detectedModule = detectModuleFromPath(location.pathname);
    
    if (detectedModule) {
      // If we're in a module route, ensure the module is selected
      if (activeModule !== detectedModule) {
        selectModule(detectedModule);
      }
    } else if (location.pathname === "/") {
      // Only reset on root path
      resetToDashboard();
    }
    // If we're on other non-module routes but have a module active, keep it active
    // This handles cases where user clicks sidebar menu items
  }, [location.pathname, detectModuleFromPath, activeModule, selectModule, resetToDashboard]);

  return {
    isModuleRoute: !!detectModuleFromPath(location.pathname),
    currentModule: detectModuleFromPath(location.pathname),
    shouldShowDashboardCards: location.pathname === "/"
  };
};