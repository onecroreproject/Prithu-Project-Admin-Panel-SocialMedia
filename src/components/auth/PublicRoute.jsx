import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/adminAuthContext";

const PublicRoute = ({ children }) => {
    const { admin } = useAdminAuth();
    const location = useLocation();

    // If already logged in, redirect to the dashboard or the page they were trying to access
    if (admin) {
        const origin = location.state?.from?.pathname || "/";
        return <Navigate to={origin} replace />;
    }

    return children;
};

export default PublicRoute;
