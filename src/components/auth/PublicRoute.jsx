import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/adminAuthContext";

const PublicRoute = ({ children }) => {
    const { admin } = useAdminAuth();
    const location = useLocation();

    // If already logged in, redirect to the dashboard or the page they were trying to access
    if (admin) {
        let origin = location.state?.from?.pathname || "/";

        // 🛡️ Safety Guard: If origin is a child admin profile but current user is not a Child_Admin,
        // fallback to root to avoid stale session viewing.
        if (origin.includes("/settings/child/admin/profile/") && admin.role !== "Child_Admin") {
            origin = "/";
        }

        return <Navigate to={origin} replace />;
    }

    return children;
};

export default PublicRoute;
