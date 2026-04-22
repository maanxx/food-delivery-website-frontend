import React from "react";
import { Outlet } from "react-router-dom";

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
    </div>
  );
}

export default DefaultLayout;
