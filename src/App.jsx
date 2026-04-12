<<<<<<< HEAD
import React, { useEffect } from "react";
=======
import React from "react";
>>>>>>> 9c90712dccc044a47bf73e31d8c58470a2ead867
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
          sx={{
            position: "absolute",
            top: "50%",
            right: "50%",
            zIndex: "var(--zIndexOnTop)",
          }}
        />
      )}
      <RouterProvider router={router} />
    </>
  );
}

export default App;
