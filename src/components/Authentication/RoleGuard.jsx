import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CircularProgress, Box } from "@mui/material";

const RoleGuard = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, isInitialized, isLoading } = useSelector((state) => state.adminAuth);

    console.log("--- ADMIN ROLE GUARD DEBUG ---");
    console.log("IS AUTHENTICATED:", isAuthenticated);
    console.log("USER:", user);
    console.log("ALLOWED ROLES:", allowedRoles);

    if (!isInitialized || isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    const role = user?.role;
    if (allowedRoles && !allowedRoles.some(r => r.toLowerCase() === role?.toLowerCase())) {
        console.warn(`Access Denied: User role '${role}' is not in allowed roles:`, allowedRoles);
        return <Navigate to="/admin/login" replace />;
    }

    // 3. Authorized -> Render children
    return children;
};

export default RoleGuard;
