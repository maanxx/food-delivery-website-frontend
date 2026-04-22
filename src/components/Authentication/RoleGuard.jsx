import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CircularProgress, Box } from "@mui/material";
import useAuth from "@hooks/useAuth";

const RoleGuard = ({ children, allowedRoles }) => {
    const { isAuthenticated } = useAuth();
    const { user, isInitialized, isLoading } = useSelector((state) => state.auth);

    console.log("--- ROLE GUARD DEBUG ---");
    console.log("USER:", user);
    console.log("TOKEN:", localStorage.getItem("access_token"));
    console.log("ALLOWED ROLES:", allowedRoles);
    if (!isInitialized || isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        console.warn(`Access Denied: User role '${user?.role}' is not in allowed roles:`, allowedRoles);
        return <Navigate to="/" replace />;
    }

    // 3. Authorized -> Render children
    return children;
};

export default RoleGuard;
