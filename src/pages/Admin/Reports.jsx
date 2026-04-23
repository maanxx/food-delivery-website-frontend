import React, { useState, useEffect, useCallback } from "react";
import { Button, Table, Input, Select, Tooltip, Spin, Row, Col, message } from "antd";
import {
    DownloadOutlined, SearchOutlined, FilterOutlined,
    FileExcelOutlined, FilePdfOutlined, ReloadOutlined,
    ShoppingOutlined, CheckCircleOutlined, TeamOutlined, AppstoreOutlined,
    RiseOutlined, DollarOutlined, BarChartOutlined, FileTextOutlined,
} from "@ant-design/icons";
import adminService from "@services/adminService";
import styles from "./Reports.module.css";

const TYPE_MAP = {
    revenue:   { label: "Doanh thu",   color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
    orders:    { label: "Đơn hàng",    color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
    products:  { label: "Sản phẩm",    color: "#ff914d", bg: "#fff8f3", border: "#fed7aa" },
    employees: { label: "Nhân viên",   color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
};

const HISTORY = [
    { id: 1, title: "Báo cáo doanh thu tháng 4/2026",   type: "revenue",   format: "xlsx", generatedBy: "Admin",   date: "2026-04-24" },
    { id: 2, title: "Báo cáo đơn hàng tuần 17",          type: "orders",    format: "pdf",  generatedBy: "Admin",   date: "2026-04-22" },
    { id: 3, title: "Tồn kho sản phẩm 24/04",            type: "products",  format: "xlsx", generatedBy: "System",  date: "2026-04-24" },
    { id: 4, title: "Hiệu suất nhân viên Q2",             type: "employees", format: "pdf",  generatedBy: "Admin",   date: "2026-04-20" },
    { id: 5, title: "Báo cáo doanh thu Q1/2026",          type: "revenue",   format: "xlsx", generatedBy: "Finance", date: "2026-04-01" },
    { id: 6, title: "Báo cáo đơn hàng tháng 3/2026",     type: "orders",    format: "xlsx", generatedBy: "Admin",   date: "2026-03-31" },
];

const EXPORT_CARDS = [
    {
        key: "revenue",
        icon: <DollarOutlined />,
        title: "Báo cáo Doanh thu",
        desc: "Tổng doanh thu, doanh số theo ngày / tuần / tháng, so sánh kỳ trước.",
        color: "#059669", bg: "#ecfdf5", border: "#a7f3d0",
    },
    {
        key: "orders",
        icon: <ShoppingOutlined />,
        title: "Báo cáo Đơn hàng",
        desc: "Số lượng đơn, tỷ lệ hoàn thành / huỷ, thời gian giao trung bình.",
        color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe",
    },
    {
        key: "products",
        icon: <AppstoreOutlined />,
        title: "Báo cáo Sản phẩm",
        desc: "Tồn kho, sản phẩm bán chạy, sản phẩm sắp hết hàng theo danh mục.",
        color: "#ff914d", bg: "#fff8f3", border: "#fed7aa",
    },
    {
        key: "employees",
        icon: <TeamOutlined />,
        title: "Báo cáo Nhân viên",
        desc: "Danh sách nhân viên, ca làm, hiệu suất và thống kê theo chức vụ.",
        color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe",
    },
];

const Reports = () => {
    const [metrics, setMetrics] = useState({ totalOrders: 0, completedOrders: 0, totalProducts: 0, totalEmployees: 0 });
    const [metricsLoading, setMetricsLoading] = useState(false);

    const [search, setSearch]       = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [history, setHistory]     = useState(HISTORY);

    const fetchMetrics = useCallback(async () => {
        setMetricsLoading(true);
        try {
            const [orderStats, productStats, empRes] = await Promise.all([
                adminService.getOrderStats(),
                adminService.getProductStats(),
                adminService.getEmployees({ limit: 1, page: 1 }),
            ]);
            setMetrics({
                totalOrders:     orderStats.success   ? orderStats.data.total   : 0,
                completedOrders: orderStats.success   ? orderStats.data.delivered : 0,
                totalProducts:   productStats.success ? productStats.data.total  : 0,
                totalEmployees:  empRes.success        ? empRes.data.total        : 0,
            });
        } catch {}
        finally { setMetricsLoading(false); }
    }, []);

    useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

    const filtered = history.filter((r) => {
        const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
        const matchType   = !typeFilter || r.type === typeFilter;
        return matchSearch && matchType;
    });

    const handleExport = (cardKey, format) => {
        message.info(`Xuất ${TYPE_MAP[cardKey].label} (${format.toUpperCase()}) — tính năng đang phát triển`);
    };

    const historyColumns = [
        {
            title: "Tên báo cáo",
            dataIndex: "title",
            key: "title",
            width: "34%",
            render: (text) => <span className={styles.histTitle}>{text}</span>,
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            width: "14%",
            render: (type) => {
                const t = TYPE_MAP[type];
                return (
                    <span className={styles.typeBadge} style={{ background: t.bg, color: t.color, borderColor: t.border }}>
                        {t.label}
                    </span>
                );
            },
        },
        {
            title: "Ngày tạo",
            dataIndex: "date",
            key: "date",
            width: "14%",
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
            render: (d) => <span className={styles.histDate}>{new Date(d).toLocaleDateString("vi-VN")}</span>,
        },
        {
            title: "Người tạo",
            dataIndex: "generatedBy",
            key: "generatedBy",
            width: "14%",
            render: (v) => <span className={styles.histBy}>{v}</span>,
        },
        {
            title: "Định dạng",
            dataIndex: "format",
            key: "format",
            width: "10%",
            render: (fmt) => (
                <span className={`${styles.fmtBadge} ${fmt === "xlsx" ? styles.fmtXlsx : styles.fmtPdf}`}>
                    {fmt === "xlsx" ? "Excel" : "PDF"}
                </span>
            ),
        },
        {
            title: "Tải xuống",
            key: "dl",
            width: "10%",
            align: "center",
            render: (_, record) => (
                <Tooltip title="Tải xuống" placement="top">
                    <button
                        className={styles.iconBtnDl}
                        onClick={() => message.info("Tính năng đang phát triển")}
                    >
                        <DownloadOutlined />
                    </button>
                </Tooltip>
            ),
        },
    ];

    return (
        <div className={styles.page}>

            {/* ── Header ── */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Báo cáo & Phân tích</h1>
                    <p className={styles.pageSub}>Tổng quan hệ thống và xuất dữ liệu theo yêu cầu</p>
                </div>
                <Tooltip title="Làm mới số liệu">
                    <Button icon={<ReloadOutlined />} onClick={fetchMetrics} className={styles.reloadBtn} />
                </Tooltip>
            </div>

            {/* ── Metric cards ── */}
            <Spin spinning={metricsLoading}>
                <Row gutter={[16, 16]} className={styles.metricsRow}>
                    {[
                        { icon: <ShoppingOutlined />, num: metrics.totalOrders,     lbl: "Tổng đơn hàng",  iconBg: "#fff3e8", iconColor: "#ff914d" },
                        { icon: <CheckCircleOutlined />, num: metrics.completedOrders, lbl: "Đơn đã giao",  iconBg: "#e8faf0", iconColor: "#22a06b" },
                        { icon: <AppstoreOutlined />, num: metrics.totalProducts,   lbl: "Tổng sản phẩm",  iconBg: "#f0f9ff", iconColor: "#0284c7" },
                        { icon: <TeamOutlined />,     num: metrics.totalEmployees,  lbl: "Nhân viên",       iconBg: "#f5f3ff", iconColor: "#7c3aed" },
                    ].map((m, i) => (
                        <Col key={i} xs={12} sm={12} md={6}>
                            <div className={styles.metricCard}>
                                <div className={styles.metricIconBox} style={{ background: m.iconBg }}>
                                    {React.cloneElement(m.icon, { style: { color: m.iconColor, fontSize: 20 } })}
                                </div>
                                <div className={styles.metricBody}>
                                    <span className={styles.metricNum}>{m.num.toLocaleString()}</span>
                                    <span className={styles.metricLbl}>{m.lbl}</span>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Spin>

            {/* ── Export cards ── */}
            <div className={styles.sectionTitle}>
                <BarChartOutlined className={styles.sectionIcon} />
                Xuất báo cáo nhanh
            </div>
            <Row gutter={[16, 16]} className={styles.exportRow}>
                {EXPORT_CARDS.map((card) => (
                    <Col key={card.key} xs={24} sm={12} md={12} lg={6}>
                        <div
                            className={styles.exportCard}
                            style={{ borderTopColor: card.color }}
                        >
                            <div className={styles.exportIconBox} style={{ background: card.bg, border: `1.5px solid ${card.border}` }}>
                                {React.cloneElement(card.icon, { style: { color: card.color, fontSize: 22 } })}
                            </div>
                            <div className={styles.exportTitle}>{card.title}</div>
                            <p className={styles.exportDesc}>{card.desc}</p>
                            <div className={styles.exportBtns}>
                                <button
                                    className={styles.exportBtnXlsx}
                                    onClick={() => handleExport(card.key, "xlsx")}
                                >
                                    <FileExcelOutlined /> Excel
                                </button>
                                <button
                                    className={styles.exportBtnPdf}
                                    onClick={() => handleExport(card.key, "pdf")}
                                >
                                    <FilePdfOutlined /> PDF
                                </button>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* ── History table ── */}
            <div className={styles.card}>
                <div className={styles.cardHead}>
                    <div className={styles.cardHeadLeft}>
                        <FileTextOutlined className={styles.cardHeadIcon} />
                        <span className={styles.cardHeadTitle}>Lịch sử xuất báo cáo</span>
                        <span className={styles.cardHeadCount}>{filtered.length} bản ghi</span>
                    </div>
                    <div className={styles.cardHeadRight}>
                        <Input
                            prefix={<SearchOutlined style={{ color: "#bbb" }} />}
                            placeholder="Tìm kiếm..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            allowClear
                            className={styles.searchInput}
                        />
                        <Select
                            placeholder={<span><FilterOutlined style={{ marginRight: 5 }} />Loại</span>}
                            style={{ width: 150 }}
                            value={typeFilter || undefined}
                            onChange={(v) => setTypeFilter(v || "")}
                            allowClear
                            options={Object.entries(TYPE_MAP).map(([k, v]) => ({ label: v.label, value: k }))}
                            className={styles.filterSelect}
                        />
                    </div>
                </div>

                <Table
                    columns={historyColumns}
                    dataSource={filtered.map((r) => ({ ...r, key: r.id }))}
                    className={styles.table}
                    pagination={{
                        pageSize: 5,
                        showTotal: (t) => `${t} bản ghi`,
                        size: "small",
                    }}
                    locale={{
                        emptyText: (
                            <div className={styles.empty}>
                                <FileTextOutlined style={{ fontSize: 36, color: "#e0e0e0" }} />
                                <p>Không có lịch sử xuất báo cáo</p>
                            </div>
                        ),
                    }}
                />
            </div>
        </div>
    );
};

export default Reports;
