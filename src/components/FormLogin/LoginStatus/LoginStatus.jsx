import React, { useEffect, useState } from "react";

import axiosInstance from "@config/axiosInstance";
import useAuth from "@hooks/useAuth";
function LoginStatus() {
<<<<<<< HEAD
    const [logged, setLogged] = useState(false);
    const { login, logout } = useAuth();

    useEffect(() => {
        const authSucceededLogin = async () => {
            const loginChannel = new BroadcastChannel("login_channel");
            try {
                const res = await axiosInstance({
                    url: "/auth/login-status",
                    params: {},
                    method: "get",
                });

                if (res.data.success) {
                    loginChannel.postMessage({ success: true });
                    setLogged(true);
                    login();
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
    }, []);

    return <h1>{logged ? "Login Successfully!" : "Login Failed"}</h1>;
=======
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
          loginChannel.postMessage({ success: true });
          setLogged(true);
          login();
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
>>>>>>> 9c90712dccc044a47bf73e31d8c58470a2ead867
}

export default LoginStatus;
