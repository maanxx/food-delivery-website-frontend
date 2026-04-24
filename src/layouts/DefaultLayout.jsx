import React from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import FloatingChatWidget from "@components/SupportChat/FloatingChatWidget";

import { Footer, Header, FloatingWidget } from "@components/index";
import styles from "./DefaultLayout.module.css";

function DefaultLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
      <FloatingWidget />
      <ToastContainer />
      {/* Widget Chat CSKH luôn nổi trên mọi màn hình của Customer */}
      <FloatingChatWidget />
    </div>
  );
}

export default DefaultLayout;
