import React, { useEffect, useState } from "react";

import axiosInstance from "@config/axiosInstance";
import useAuth from "@hooks/useAuth";
function LoginStatus() {
  const [logged, setLogged] = useState(false);
  const { login, logout } = useAuth();

  useEffect(() => {
    const authSucceededLogin = async () => {
      const loginChannel = new BroadcastChannel("login_channel");
      try {
        const res = await axiosInstance({
          url: "/api/auth/login-status",
          params: {},
          method: "get",
        });

        if (res.data.success) {
          const { accessToken, refreshToken, user } = res.data;
          localStorage.setItem("access_token", accessToken);
          if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
          loginChannel.postMessage({ success: true });
          setLogged(true);
          login({ token: accessToken, refreshToken, user });
        } else {
          loginChannel.postMessage({ success: false });
          setLogged(false);
          logout();
        }

        setTimeout(() => {
          window.close();
        }, 500);
      } catch (error) {
        console.log(error);
        setTimeout(() => {
          window.close();
        }, 500);
      }
    };
    authSucceededLogin();
  }, [login, logout]);

  return <h1>{logged ? "Login Successfully!" : "Login Failed"}</h1>;
}

export default LoginStatus;
