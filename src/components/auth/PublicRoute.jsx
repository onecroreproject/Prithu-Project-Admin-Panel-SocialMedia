import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/adminAuthContext";

const PublicRoute = ({ children }) => {
    const { admin } = useAdminAuth();
    const location = useLocation();

    // If already logged in, redirect to the dashboard or the page they were trying to access
    if (admin) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default PublicRoute;
