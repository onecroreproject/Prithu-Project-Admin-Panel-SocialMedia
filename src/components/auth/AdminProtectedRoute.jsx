import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/adminAuthContext";

const AdminProtectedRoute = ({ children }) => {
    const { admin, logout, loading } = useAdminAuth();
    const location = useLocation();

    useEffect(() => {
        if (loading) return; // Don't check session while loading

        const checkSession = () => {
            const loginTime = localStorage.getItem("loginTime");
            if (loginTime) {
                const now = Date.now();
                const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

                if (now - parseInt(loginTime, 10) > twoHours) {
                    console.log("Session expired. Logging out...");
                    logout();
                }
            }
        };

        // Check immediately on mount/update
        checkSession();

        // Check every minute
        const interval = setInterval(checkSession, 60 * 1000);

        return () => clearInterval(interval);
    }, [logout, loading]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!admin) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    return children;
};

export default AdminProtectedRoute;
