import React from "react";
import { Card, Table, Button, Space, Tag, Input, Select, Tooltip, Popconfirm, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import styles from "./Orders.module.css";

const Orders = () => {
    const [searchText, setSearchText] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("");
    const [filteredData, setFilteredData] = React.useState([]);

    // Mock data
    const ordersData = [
        {
            id: 1,
            orderNumber: "#ORD001",
            customer: "Nguyễn Văn A",
            date: "2024-04-08",
            amount: 250000,
            status: "completed",
            items: 3,
        },
        {
            id: 2,
            orderNumber: "#ORD002",
            customer: "Trần Thị B",
            date: "2024-04-08",
            amount: 320000,
            status: "pending",
            items: 4,
        },
        {
            id: 3,
            orderNumber: "#ORD003",
            customer: "Lê Văn C",
            date: "2024-04-07",
            amount: 180000,
            status: "shipping",
            items: 2,
        },
        {
            id: 4,
            orderNumber: "#ORD004",
            customer: "Phạm Văn D",
            date: "2024-04-06",
            amount: 420000,
            status: "completed",
            items: 5,
        },
        {
            id: 5,
            orderNumber: "#ORD005",
            customer: "Hồ Thị E",
            date: "2024-04-05",
            amount: 150000,
            status: "cancelled",
            items: 1,
        },
    ];

    React.useEffect(() => {
        let filtered = ordersData;

        if (searchText) {
            filtered = filtered.filter(
                (item) =>
                    item.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                    item.customer.toLowerCase().includes(searchText.toLowerCase()),
            );
        }

        if (statusFilter) {
            filtered = filtered.filter((item) => item.status === statusFilter);
        }

        setFilteredData(filtered);
    }, [searchText, statusFilter]);

    const statusConfig = {
        pending: { color: "#faad14", bg: "#fffbe6", label: "Đang chờ", icon: "⏳" },
        shipping: { color: "#1890ff", bg: "#e6f7ff", label: "Đang vận chuyển", icon: "🚚" },
        completed: { color: "#52c41a", bg: "#f6ffed", label: "Hoàn thành", icon: "✓" },
        cancelled: { color: "#ff4d4f", bg: "#fff1f0", label: "Hủy", icon: "✗" },
    };

    const columns = [
        {
            title: "Order ID",
            dataIndex: "orderNumber",
            key: "orderNumber",
            width: "13%",
            sorter: (a, b) => a.orderNumber.localeCompare(b.orderNumber),
            render: (text) => <span style={{ fontWeight: 600, color: "#667eea" }}>{text}</span>,
        },
        {
            title: "Customer",
            dataIndex: "customer",
            key: "customer",
            width: "20%",
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            width: "13%",
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            width: "14%",
            sorter: (a, b) => a.amount - b.amount,
            render: (amount) => (
                <span style={{ fontWeight: 600, color: "#52c41a" }}>{amount.toLocaleString("vi-VN")} VNĐ</span>
            ),
        },
        {
            title: "Items",
            dataIndex: "items",
            key: "items",
            width: "10%",
            sorter: (a, b) => a.items - b.items,
            align: "center",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: "13%",
            render: (status) => {
                const config = statusConfig[status];
                return (
                    <Tag
                        style={{
                            backgroundColor: config.bg,
                            color: config.color,
                            border: `1px solid ${config.color}`,
                            borderRadius: "20px",
                            padding: "4px 12px",
                            fontWeight: 500,
                        }}
                    >
                        {config.icon} {config.label}
                    </Tag>
                );
            },
        },
        {
            title: "Actions",
            key: "actions",
            width: "17%",
            render: (_, record) => (
                <div className={styles.actionButtons}>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => message.info(`Xem chi tiết đơn hàng ${record.orderNumber}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => message.info(`Chỉnh sửa ${record.orderNumber}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa đơn hàng?"
                            description="Bạn có chắc chắn muốn xóa đơn hàng này không?"
                            onConfirm={() => message.success("Xóa thành công")}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button icon={<DeleteOutlined />} danger size="small" />
                        </Popconfirm>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div className={styles.ordersPage}>
            <div className={styles.header}>
                <h1 className={styles.headerTitle}>📦 Quản lý đơn hàng</h1>
                <Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: "6px" }}>
                    Tạo đơn hàng
                </Button>
            </div>

            <Card className={styles.tableCard}>
                <div className={styles.toolbar}>
                    <Input
                        placeholder="Tìm kiếm theo Order ID hoặc tên khách..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className={styles.searchInput}
                        allowClear
                        size="large"
                    />
                    <Select
                        placeholder="Tất cả trạng thái"
                        style={{ width: "200px" }}
                        value={statusFilter || undefined}
                        onChange={(value) => setStatusFilter(value)}
                        allowClear
                        size="large"
                        options={[
                            { label: "Đang chờ", value: "pending" },
                            { label: "Đang vận chuyển", value: "shipping" },
                            { label: "Hoàn thành", value: "completed" },
                            { label: "Hủy", value: "cancelled" },
                        ]}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData.map((item) => ({ ...item, key: item.id }))}
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} đơn hàng` }}
                    className={styles.table}
                    locale={{
                        emptyText: (
                            <div className={styles.emptyState}>
                                No orders found{searchText && ` for "${searchText}"`}
                            </div>
                        ),
                    }}
                />
            </Card>
        </div>
    );
};

export default Orders;
