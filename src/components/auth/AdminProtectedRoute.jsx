import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/adminAuthContext";

const AdminProtectedRoute = ({ children, requiredRoles }) => {
    const { admin, role: authRole, loading } = useAdminAuth();
    const location = useLocation();

    // Support both direct role from auth or from admin object
    const role = authRole || admin?.role;

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

    // RBAC Check: If requiredRoles is provided, check if user's role is included
    if (requiredRoles && !requiredRoles.includes(role)) {
        // If user doesn't have the required role, redirect to dashboard
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
