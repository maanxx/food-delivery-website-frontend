import React, { useEffect, useState } from "react";

import axiosInstance from "@config/axiosInstance";
import useAuth from "@hooks/useAuth";
function LoginStatus() {
  const [logged, setLogged] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login, logout } = useAuth();

  useEffect(() => {
    const authSucceededLogin = async () => {
      const loginChannel = new BroadcastChannel("login_channel");
      try {
        console.log("[LoginStatus] Popup URL:", window.location.href);
        console.log("[LoginStatus] Requesting /api/auth/login-status...");

        const res = await axiosInstance({
          url: "/api/auth/login-status",
          params: {
            _: Date.now(),
          },
          method: "get",
        });

        console.log("[LoginStatus] Response:", res.data);

        if (res.data.success) {
          const { accessToken, refreshToken, user, rememberMe } = res.data;
          loginChannel.postMessage({
            success: true,
            token: accessToken,
            refreshToken,
            user,
            rememberMe,
          });
          setLogged(true);
          setErrorMessage("");
          login({ token: accessToken, refreshToken, user, rememberMe });
        } else {
          loginChannel.postMessage({ success: false });
          setLogged(false);
          setErrorMessage(res.data?.message || "Login status returned unsuccessful.");
          logout();
        }

        setTimeout(() => {
          window.close();
        }, 500);
      } catch (error) {
        console.log(error);
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Unable to complete login status check.";
        console.error("[LoginStatus] Request failed:", message, error);
        setLogged(false);
        setErrorMessage(message);
      }
    };
    authSucceededLogin();
  }, [login, logout]);

  return (
    <div style={{ padding: "24px", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
      <h1>{logged ? "Login Successfully!" : "Login Failed"}</h1>
      {!logged && errorMessage ? (
        <p style={{ color: "#b42318", marginTop: "12px" }}>{errorMessage}</p>
      ) : null}
    </div>
  );
}

export default LoginStatus;
