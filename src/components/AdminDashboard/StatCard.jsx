import React from "react";
import { Card, Statistic, Row, Col, Spin } from "antd";
import { ShoppingCartOutlined, DollarOutlined, UserOutlined, FireOutlined } from "@ant-design/icons";
import styles from "./StatCard.module.css";

const StatCard = ({ title, value, icon, color, loading = false }) => {
    return (
        <Card className={styles.statCard}>
            {loading ? (
                <div className={styles.spinnerContainer}>
                    <Spin />
                </div>
            ) : (
                <Statistic title={title} value={value} prefix={icon} valueStyle={{ color }} />
            )}
        </Card>
    );
};

export default StatCard;
