import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/adminAuthContext";

const AdminProtectedRoute = ({ children }) => {
    const { admin, loading } = useAdminAuth();
    const location = useLocation();

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
