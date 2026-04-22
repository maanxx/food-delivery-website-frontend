import React from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { CircularProgress, Box } from "@mui/material";

import useAuth from "@hooks/useAuth";

function Authentication({ children }) {
    const { isAuthenticated } = useAuth();
    const { isInitialized, isLoading } = useSelector((state) => state.auth);

    // ✅ Wait for initialization to complete before deciding to redirect
    if (!isInitialized || isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
}

export default Authentication;

Authentication.propTypes = {
    children: PropTypes.element,
};
