import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { CircularProgress } from "@mui/material";

import router from "@router/router";
import useLoading from "@hooks/useLoading";

function App() {
    const { loading } = useLoading();
    

    return (
        <>
            {loading && (
                <CircularProgress
                    sx={{ position: "absolute", top: "50%", right: "50%", zIndex: "var(--zIndexOnTop)" }}
                />
            )}
            <RouterProvider router={router} />
        </>
    );
}

export default App;
