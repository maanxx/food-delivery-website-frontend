import React from "react";
import { RouterProvider } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useDispatch } from "react-redux";
import router from "@router/router";
import useLoading from "@hooks/useLoading";
import { initializeAuth } from "@features/auth/authSlice";

function App() {
  const { loading } = useLoading();
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

    return (
        <>
            {loading && (
                <CircularProgress
                    sx={{
                        position: "absolute",
                        top: "50%",
                        right: "50%",
                        zIndex: "var(--zIndexOnTop)",
                    }}
                />
            )}
            <RouterProvider router={router} />
            <ToastContainer 
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </>
    );
}

export default App;

