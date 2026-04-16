import React, { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";

import { Footer, Header, FloatingWidget } from "@components/index";
import styles from "./DefaultLayout.module.css";
import useLoading from "@hooks/useLoading";
import useAuth from "@hooks/useAuth";
import { authLogin } from "@services/authService";

function DefaultLayout() {
  const { login, logout } = useAuth();
  const { setLoading } = useLoading();
  const hasCheckedAuth = useRef(false); // Track đã check chưa

  useEffect(() => {
    // Chỉ check session lần đầu tiên component mount
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const authenticate = async () => {
      setLoading(true);
      try {
        if (await authLogin()) {
          login();
        } else {
          logout();
        }
      } catch (error) {
        console.log(error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, []); // Empty dependency array - chỉ chạy 1 lần

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
      <FloatingWidget />
    </div>
  );
}

export default DefaultLayout;
