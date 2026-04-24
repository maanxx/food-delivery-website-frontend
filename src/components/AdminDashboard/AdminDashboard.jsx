import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Button, Spin, Tooltip } from "antd";
import {
    ShoppingOutlined, CheckCircleOutlined, AppstoreOutlined,
    TeamOutlined, ReloadOutlined, RiseOutlined,
} from "@ant-design/icons";
import { OrderStatsChart, RevenueChart, TopDishesChart, CategoryChart } from "./Chart";
import RecentOrders from "./RecentOrders";
import adminService from "@services/adminService";
import styles from "./AdminDashboard.module.css";

const PERIOD_OPTIONS = [
    { value: "today", label: "Hôm nay" },
    { value: "week",  label: "Tuần này" },
    { value: "month", label: "Tháng này" },
];

const MOCK_CHARTS = {
    today: {
        orderStats: [
            { date: "6h", orders: 3 }, { date: "8h", orders: 7 }, { date: "10h", orders: 11 },
            { date: "12h", orders: 18 }, { date: "14h", orders: 14 }, { date: "16h", orders: 9 },
            { date: "18h", orders: 15 }, { date: "20h", orders: 22 }, { date: "22h", orders: 8 },
        ],
        revenueData: [
            { date: "6h", revenue: 120000 }, { date: "8h", revenue: 380000 }, { date: "10h", revenue: 620000 },
            { date: "12h", revenue: 980000 }, { date: "14h", revenue: 740000 }, { date: "16h", revenue: 490000 },
            { date: "18h", revenue: 830000 }, { date: "20h", revenue: 1200000 }, { date: "22h", revenue: 460000 },
        ],
    },
    week: {
        orderStats: [
            { date: "T2", orders: 48 }, { date: "T3", orders: 55 }, { date: "T4", orders: 42 },
            { date: "T5", orders: 61 }, { date: "T6", orders: 73 }, { date: "T7", orders: 88 }, { date: "CN", orders: 65 },
        ],
        revenueData: [
            { date: "T2", revenue: 2800000 }, { date: "T3", revenue: 3200000 }, { date: "T4", revenue: 2400000 },
            { date: "T5", revenue: 3600000 }, { date: "T6", revenue: 4200000 }, { date: "T7", revenue: 5100000 }, { date: "CN", revenue: 3800000 },
        ],
    },
    month: {
        orderStats: [
            { date: "T1", orders: 312 }, { date: "T2", orders: 287 }, { date: "T3", orders: 354 },
            { date: "T4", orders: 401 }, { date: "T5", orders: 378 }, { date: "T6", orders: 445 },
        ],
        revenueData: [
            { date: "T1", revenue: 18200000 }, { date: "T2", revenue: 16800000 }, { date: "T3", revenue: 21400000 },
            { date: "T4", revenue: 24600000 }, { date: "T5", revenue: 22900000 }, { date: "T6", revenue: 27300000 },
        ],
    },
};

const MOCK_TOP_DISHES = [
    { name: "Pizza Pepperoni", quantity: 156 },
    { name: "Burger Deluxe",   quantity: 143 },
    { name: "Phở Bò",          quantity: 129 },
    { name: "Pad Thai",        quantity: 115 },
    { name: "Sushi Combo",     quantity: 98  },
];

const MOCK_CATEGORY = [
    { category: "Pizza",   revenue: 5600000 },
    { category: "Burger",  revenue: 4200000 },
    { category: "Noodles", revenue: 3800000 },
    { category: "Drinks",  revenue: 2100000 },
    { category: "Rice",    revenue: 3200000 },
];

const AdminDashboard = () => {
    const [loading, setLoading]       = useState(false);
    const [period, setPeriod]         = useState("today");
    const [kpis, setKpis]             = useState({ totalOrders: 0, pendingOrders: 0, totalProducts: 0, totalEmployees: 0 });
    const [recentOrders, setRecentOrders] = useState([]);

    const today = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [orderStats, productStats, empRes, ordersRes] = await Promise.all([
                adminService.getOrderStats().catch(() => ({ success: false })),
                adminService.getProductStats().catch(() => ({ success: false })),
                adminService.getEmployees({ limit: 1, page: 1 }).catch(() => ({ success: false })),
                adminService.getOrders({ limit: 5, page: 1 }).catch(() => ({ success: false })),
            ]);

            setKpis({
                totalOrders:    orderStats.success   ? orderStats.data.total   : 0,
                pendingOrders:  orderStats.success   ? (orderStats.data.pending + orderStats.data.confirmed) : 0,
                totalProducts:  productStats.success ? productStats.data.total  : 0,
                totalEmployees: empRes.success        ? empRes.data.total        : 0,
            });

            if (ordersRes.success) setRecentOrders(ordersRes.data.orders);
        } catch {}
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchData();
        const timer = setInterval(fetchData, 60000);
        return () => clearInterval(timer);
    }, [fetchData]);

    const chartData = MOCK_CHARTS[period] || MOCK_CHARTS.today;

    return (
        <div className={styles.page}>

            {/* ── Header ── */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Dashboard</h1>
                    <p className={styles.pageSub}>{today}</p>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.periodTabs}>
                        {PERIOD_OPTIONS.map(({ value, label }) => (
                            <button
                                key={value}
                                className={`${styles.periodTab} ${period === value ? styles.periodTabActive : ""}`}
                                onClick={() => setPeriod(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <Tooltip title="Làm mới">
                        <Button
                            icon={<ReloadOutlined spin={loading} />}
                            onClick={fetchData}
                            className={styles.reloadBtn}
                        />
                    </Tooltip>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <Spin spinning={loading} tip="">
                <Row gutter={[16, 16]} className={styles.kpiRow}>
                    {[
                        {
                            icon: <ShoppingOutlined />, iconBg: "#fff3e8", iconColor: "#ff914d",
                            num: kpis.totalOrders, lbl: "Tổng đơn hàng",
                            sub: `${kpis.pendingOrders} chờ xử lý`, subColor: "#d97706",
                        },
                        {
                            icon: <CheckCircleOutlined />, iconBg: "#e8faf0", iconColor: "#22a06b",
                            num: kpis.totalOrders > 0 ? `${Math.round(((kpis.totalOrders - kpis.pendingOrders) / kpis.totalOrders) * 100)}%` : "0%",
                            lbl: "Tỷ lệ hoàn thành",
                            sub: "đơn đã xử lý", subColor: "#22a06b",
                        },
                        {
                            icon: <AppstoreOutlined />, iconBg: "#f0f9ff", iconColor: "#0284c7",
                            num: kpis.totalProducts, lbl: "Tổng sản phẩm",
                            sub: "trong thực đơn", subColor: "#6b7280",
                        },
                        {
                            icon: <TeamOutlined />, iconBg: "#f5f3ff", iconColor: "#7c3aed",
                            num: kpis.totalEmployees, lbl: "Nhân viên",
                            sub: "đang làm việc", subColor: "#6b7280",
                        },
                    ].map((k, i) => (
                        <Col key={i} xs={12} sm={12} md={6}>
                            <div className={styles.kpiCard}>
                                <div className={styles.kpiTop}>
                                    <div className={styles.kpiIconBox} style={{ background: k.iconBg }}>
                                        {React.cloneElement(k.icon, { style: { color: k.iconColor, fontSize: 20 } })}
                                    </div>
                                    <RiseOutlined className={styles.kpiTrend} />
                                </div>
                                <div className={styles.kpiNum}>{k.num.toLocaleString?.() ?? k.num}</div>
                                <div className={styles.kpiLbl}>{k.lbl}</div>
                                <div className={styles.kpiSub} style={{ color: k.subColor }}>{k.sub}</div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Spin>

            {/* ── Charts row 1 ── */}
            <Row gutter={[16, 16]} className={styles.chartsRow}>
                <Col xs={24} lg={12}>
                    <OrderStatsChart data={chartData.orderStats} loading={loading} period={period} />
                </Col>
                <Col xs={24} lg={12}>
                    <RevenueChart data={chartData.revenueData} loading={loading} period={period} />
                </Col>
            </Row>

            {/* ── Charts row 2 ── */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <TopDishesChart data={MOCK_TOP_DISHES} loading={loading} />
                </Col>
                <Col xs={24} lg={12}>
                    <RecentOrders orders={recentOrders} loading={loading} />
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
