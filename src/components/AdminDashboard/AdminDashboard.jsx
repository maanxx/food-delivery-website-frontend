import React, { useState, useEffect } from "react";
import { Row, Col, Space, Button, DatePicker, Card, Statistic, message } from "antd";
import { ShoppingCartOutlined, DollarOutlined, UserOutlined, FireOutlined, ReloadOutlined } from "@ant-design/icons";
import StatCard from "./StatCard";
import { OrderStatsChart, RevenueChart, TopDishesChart, CategoryChart } from "./Chart";
import RecentOrders from "./RecentOrders";
import adminService from "@services/adminService";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState("today");
    const [stats, setStats] = useState({
        totalOrders: 0,
        revenue: 0,
        activeUsers: 0,
        topDishes: [],
    });
    const [chartData, setChartData] = useState({
        orderStats: [],
        revenueData: [],
        topDishesData: [],
        categoryData: [],
    });
    const [recentOrders, setRecentOrders] = useState([]);

    // Fetch tất cả dữ liệu
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Giả dữ liệu để demo, sau này replace bằng API thực
            const mockOrderStats = [
                { date: "1-tháng này", orders: 45 },
                { date: "2-tháng này", orders: 52 },
                { date: "3-tháng này", orders: 48 },
                { date: "4-tháng này", orders: 61 },
                { date: "5-tháng này", orders: 55 },
                { date: "6-tháng này", orders: 67 },
                { date: "7-tháng này", orders: 72 },
            ];

            const mockRevenueData = [
                { date: "1-tháng này", revenue: 2450000 },
                { date: "2-tháng này", revenue: 2800000 },
                { date: "3-tháng này", revenue: 2200000 },
                { date: "4-tháng này", revenue: 2780000 },
                { date: "5-tháng này", revenue: 1890000 },
                { date: "6-tháng này", revenue: 2390000 },
                { date: "7-tháng này", revenue: 3490000 },
            ];

            const mockTopDishes = [
                { name: "Pizza Pepperoni", quantity: 156 },
                { name: "Burger Deluxe", quantity: 143 },
                { name: "Phở Bò", quantity: 129 },
                { name: "Pad Thai", quantity: 115 },
                { name: "Sushi Combo", quantity: 98 },
            ];

            const mockCategoryData = [
                { category: "Pizza", revenue: 5600000 },
                { category: "Burger", revenue: 4200000 },
                { category: "Noodles", revenue: 3800000 },
                { category: "Drinks", revenue: 2100000 },
                { category: "Rice", revenue: 3200000 },
            ];

            const mockRecentOrders = [
                {
                    id: "#ORD001",
                    customerName: "Nguyễn Văn A",
                    total: 250000,
                    itemCount: 3,
                    status: "confirmed",
                    createdAt: new Date().toISOString(),
                },
                {
                    id: "#ORD002",
                    customerName: "Trần Thị B",
                    total: 320000,
                    itemCount: 4,
                    status: "shipping",
                    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
                },
                {
                    id: "#ORD003",
                    customerName: "Lê Văn C",
                    total: 180000,
                    itemCount: 2,
                    status: "pending",
                    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
                },
                {
                    id: "#ORD004",
                    customerName: "Phạm Thị D",
                    total: 450000,
                    itemCount: 5,
                    status: "delivered",
                    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
                },
                {
                    id: "#ORD005",
                    customerName: "Đặng Văn E",
                    total: 290000,
                    itemCount: 3,
                    status: "confirmed",
                    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
                },
            ];

            setStats({
                totalOrders: period === "today" ? 45 : period === "week" ? 312 : 1247,
                revenue: period === "today" ? 3450000 : period === "week" ? 24280000 : 112500000,
                activeUsers: 1243,
                topDishes: mockTopDishes,
            });

            setChartData({
                orderStats: mockOrderStats,
                revenueData: mockRevenueData,
                topDishesData: mockTopDishes,
                categoryData: mockCategoryData,
            });

            setRecentOrders(mockRecentOrders);
        } catch (error) {
            message.error("Lỗi khi tải dữ liệu!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, [period]);

    const handleRefresh = () => {
        fetchDashboardData();
    };

    return (
        <div className={styles.adminDashboard}>
            <div className={styles.header}>
                <h1>Admin Dashboard</h1>
                <Space>
                    <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                        Làm mới
                    </Button>
                    <select
                        className={styles.periodSelector}
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="today">Hôm nay</option>
                        <option value="week">Tuần này</option>
                        <option value="month">Tháng này</option>
                    </select>
                </Space>
            </div>

            <Row gutter={[16, 16]} className={styles.statsSection}>
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        title="Tổng đơn hàng"
                        value={stats.totalOrders}
                        icon={<ShoppingCartOutlined />}
                        color="#1890ff"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        title="Doanh thu"
                        value={`${(stats.revenue / 1000000).toFixed(1)}M`}
                        icon={<DollarOutlined />}
                        color="#52c41a"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        title="User hoạt động"
                        value={stats.activeUsers}
                        icon={<UserOutlined />}
                        color="#fa8c16"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        title="Món bán chạy"
                        value={stats.topDishes.length > 0 ? stats.topDishes[0].name : "N/A"}
                        icon={<FireOutlined />}
                        color="#f5222d"
                        loading={loading}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]} className={styles.chartsSection}>
                <Col xs={24} lg={12}>
                    <OrderStatsChart data={chartData.orderStats} loading={loading} />
                </Col>
                <Col xs={24} lg={12}>
                    <RevenueChart data={chartData.revenueData} loading={loading} />
                </Col>
            </Row>

            <Row gutter={[16, 16]} className={styles.chartsSection}>
                <Col xs={24} lg={12}>
                    <TopDishesChart data={chartData.topDishesData} loading={loading} />
                </Col>
                <Col xs={24} lg={12}>
                    <CategoryChart data={chartData.categoryData} loading={loading} />
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
