import React from "react";
import { AdminDashboard } from "@components/AdminDashboard";
import styles from "./Admin.module.css";

const Admin = () => {
    return (
        <div className={styles.adminPage}>
            <AdminDashboard />
        </div>
    );
};

export default Admin;
