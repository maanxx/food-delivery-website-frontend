import React from "react";
import { Card, Table, Tag, Spin, Empty } from "antd";
import styles from "./RecentOrders.module.css";

const RecentOrders = ({ orders, loading = false }) => {
    const columns = [
        {
            title: "Mã đơn hàng",
            dataIndex: "id",
            key: "id",
            width: "15%",
        },
        {
            title: "Khách hàng",
            dataIndex: "customerName",
            key: "customerName",
            width: "20%",
        },
        {
            title: "Số tiền",
            dataIndex: "total",
            key: "total",
            width: "15%",
            render: (text) => `${text?.toLocaleString("vi-VN")} VNĐ`,
        },
        {
            title: "Số lượng",
            dataIndex: "itemCount",
            key: "itemCount",
            width: "15%",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: "15%",
            render: (status) => {
                const statusConfig = {
                    pending: { color: "orange", label: "Chờ xử lý" },
                    confirmed: { color: "blue", label: "Đã xác nhận" },
                    shipping: { color: "cyan", label: "Đang giao" },
                    delivered: { color: "green", label: "Đã giao" },
                    cancelled: { color: "red", label: "Đã hủy" },
                };
                const config = statusConfig[status] || { color: "default", label: status };
                return <Tag color={config.color}>{config.label}</Tag>;
            },
        },
        {
            title: "Thời gian",
            dataIndex: "createdAt",
            key: "createdAt",
            width: "20%",
            render: (text) => {
                if (!text) return "-";
                return new Date(text).toLocaleString("vi-VN");
            },
        },
    ];

    return (
        <Card
            title="🔔 Đơn hàng mới (Realtime)"
            className={styles.recentOrdersCard}
            extra={<span className={styles.badge}>{orders?.length || 0} đơn mới</span>}
        >
            {loading ? (
                <div className={styles.spinnerContainer}>
                    <Spin />
                </div>
            ) : orders && orders.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={orders.map((order) => ({ ...order, key: order.id }))}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} đơn hàng`,
                    }}
                    scroll={{ x: 800 }}
                />
            ) : (
                <Empty description="Không có đơn hàng mới" />
            )}
        </Card>
    );
};

export default RecentOrders;
