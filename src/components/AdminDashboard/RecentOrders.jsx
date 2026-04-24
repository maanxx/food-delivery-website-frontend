import React from "react";
import { Spin } from "antd";
import { ClockCircleOutlined, CarOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import styles from "./RecentOrders.module.css";

const STATUS_MAP = {
    pending:    { label: "Chờ xác nhận", color: "#d97706", bg: "#fef3c7", Icon: ClockCircleOutlined },
    confirmed:  { label: "Đã xác nhận",  color: "#2563eb", bg: "#eff6ff", Icon: CheckCircleOutlined },
    delivering: { label: "Đang giao",     color: "#7c3aed", bg: "#f5f3ff", Icon: CarOutlined },
    delivered:  { label: "Đã giao",       color: "#059669", bg: "#ecfdf5", Icon: CheckCircleOutlined },
    cancelled:  { label: "Đã huỷ",        color: "#dc2626", bg: "#fef2f2", Icon: CloseCircleOutlined },
    shipping:   { label: "Đang giao",     color: "#7c3aed", bg: "#f5f3ff", Icon: CarOutlined },
};

const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 1) return "vừa xong";
    if (diff < 60) return `${diff} phút trước`;
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
    return new Date(dateStr).toLocaleDateString("vi-VN");
};

const RecentOrders = ({ orders = [], loading = false }) => (
    <div className={styles.card}>
        <div className={styles.cardHead}>
            <div className={styles.headLeft}>
                <span className={styles.headTitle}>Đơn hàng gần đây</span>
                <span className={styles.headBadge}>{orders.length}</span>
            </div>
            <span className={styles.headNote}>Cập nhật tự động</span>
        </div>

        {loading ? (
            <div className={styles.spinnerWrap}><Spin /></div>
        ) : orders.length === 0 ? (
            <div className={styles.empty}>Chưa có đơn hàng</div>
        ) : (
            <div className={styles.list}>
                {orders.slice(0, 6).map((order) => {
                    const cfg = STATUS_MAP[order.order_status] || STATUS_MAP.pending;
                    const Icon = cfg.Icon;
                    return (
                        <div key={order.order_id} className={styles.row}>
                            <div className={styles.rowLeft}>
                                <div className={styles.iconBox} style={{ background: cfg.bg }}>
                                    <Icon style={{ color: cfg.color, fontSize: 14 }} />
                                </div>
                                <div className={styles.info}>
                                    <span className={styles.orderId}>
                                        #{order.order_id?.slice(0, 8).toUpperCase()}
                                    </span>
                                    <span className={styles.customer}>
                                        {order.user?.fullname || "Khách hàng"}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.rowRight}>
                                <span className={styles.amount}>
                                    {Number(order.total_amount || 0).toLocaleString("vi-VN")}₫
                                </span>
                                <div className={styles.meta}>
                                    <span className={styles.statusDot} style={{ background: cfg.color }} />
                                    <span className={styles.statusLbl} style={{ color: cfg.color }}>{cfg.label}</span>
                                </div>
                                <span className={styles.time}>{timeAgo(order.order_date)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
);

export default RecentOrders;
