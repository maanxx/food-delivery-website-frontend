import React, { useState, useEffect, useCallback } from "react";
import {
    Table, Button, Input, Select, Tooltip, Modal, message,
    Row, Col, Spin, Dropdown, Tag, Badge,
} from "antd";
import {
    SearchOutlined, EyeOutlined, ReloadOutlined,
    FileExcelOutlined, FilePdfOutlined, DownloadOutlined,
    FilterOutlined, ShoppingCartOutlined, ClockCircleOutlined,
    CarOutlined, CheckCircleOutlined, CloseCircleOutlined,
    WalletOutlined, DollarOutlined,
} from "@ant-design/icons";
import adminService from "@services/adminService";
import styles from "./Orders.module.css";

const STATUS_MAP = {
    pending:    { label: "Chờ xác nhận", color: "#d97706", bg: "#fef3c7", border: "#fde68a", icon: <ClockCircleOutlined /> },
    confirmed:  { label: "Đã xác nhận",  color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", icon: <CheckCircleOutlined /> },
    delivering: { label: "Đang giao",     color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", icon: <CarOutlined /> },
    delivered:  { label: "Đã giao",       color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: <CheckCircleOutlined /> },
    cancelled:  { label: "Đã huỷ",        color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: <CloseCircleOutlined /> },
};

const STATUS_FLOW = ["pending", "confirmed", "delivering", "delivered"];

const PAYMENT_MAP = {
    paid:   { label: "Đã thanh toán", color: "#059669", bg: "#ecfdf5" },
    unpaid: { label: "Chưa thanh toán", color: "#d97706", bg: "#fef3c7" },
};

const Orders = () => {
    const [orders, setOrders]     = useState([]);
    const [total, setTotal]       = useState(0);
    const [loading, setLoading]   = useState(false);
    const [page, setPage]         = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [search, setSearch]           = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, delivering: 0, delivered: 0, cancelled: 0 });

    const [detailOrder, setDetailOrder]   = useState(null);
    const [detailOpen, setDetailOpen]     = useState(false);
    const [updatingId, setUpdatingId]     = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminService.getOrders({ search, status: statusFilter, page, limit: pageSize });
            if (res.success) { setOrders(res.data.orders); setTotal(res.data.total); }
        } catch { message.error("Không thể tải danh sách đơn hàng"); }
        finally { setLoading(false); }
    }, [search, statusFilter, page, pageSize]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await adminService.getOrderStats();
            if (res.success) setStats(res.data);
        } catch {}
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);
    useEffect(() => { fetchStats(); }, [fetchStats]);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await adminService.updateOrderStatus(orderId, newStatus);
            message.success("Cập nhật trạng thái thành công");
            fetchOrders();
            fetchStats();
        } catch (err) {
            message.error(err?.response?.data?.message || "Cập nhật thất bại");
        } finally { setUpdatingId(null); }
    };

    const exportItems = [
        { key: "excel", label: <span><FileExcelOutlined style={{ color: "#22a06b", marginRight: 8 }} />Xuất Excel (.xlsx)</span>, onClick: () => message.info("Tính năng đang phát triển") },
        { key: "pdf",   label: <span><FilePdfOutlined  style={{ color: "#dc2626", marginRight: 8 }} />Xuất PDF (.pdf)</span>,   onClick: () => message.info("Tính năng đang phát triển") },
    ];

    const columns = [
        {
            title: "Mã đơn",
            dataIndex: "order_id",
            key: "order_id",
            width: "14%",
            render: (id) => (
                <span className={styles.orderId}>
                    #{id?.slice(0, 8).toUpperCase()}
                </span>
            ),
        },
        {
            title: "Khách hàng",
            key: "customer",
            width: "18%",
            render: (_, record) => (
                <div className={styles.customerCell}>
                    <span className={styles.customerName}>{record.user?.fullname || "—"}</span>
                    <span className={styles.customerPhone}>{record.user?.phoneNumber || record.user?.email || ""}</span>
                </div>
            ),
        },
        {
            title: "Ngày đặt",
            dataIndex: "order_date",
            key: "order_date",
            width: "13%",
            sorter: (a, b) => new Date(a.order_date) - new Date(b.order_date),
            render: (date) => date ? (
                <div className={styles.dateCell}>
                    <span className={styles.dateDay}>{new Date(date).toLocaleDateString("vi-VN")}</span>
                    <span className={styles.dateTime}>{new Date(date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
            ) : "—",
        },
        {
            title: "Tổng tiền",
            dataIndex: "total_amount",
            key: "total_amount",
            width: "13%",
            sorter: (a, b) => Number(a.total_amount) - Number(b.total_amount),
            render: (amount) => (
                <span className={styles.amountText}>
                    {Number(amount || 0).toLocaleString("vi-VN")}₫
                </span>
            ),
        },
        {
            title: "Số món",
            key: "items_count",
            width: "8%",
            align: "center",
            render: (_, record) => (
                <span className={styles.itemsCount}>{record.items?.length ?? 0}</span>
            ),
        },
        {
            title: "Thanh toán",
            dataIndex: "payment_status",
            key: "payment_status",
            width: "13%",
            render: (ps) => {
                const cfg = PAYMENT_MAP[ps] || PAYMENT_MAP.unpaid;
                return (
                    <span className={styles.payBadge} style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                    </span>
                );
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "order_status",
            key: "order_status",
            width: "16%",
            render: (status, record) => (
                <Select
                    value={status}
                    size="small"
                    loading={updatingId === record.order_id}
                    onChange={(val) => handleStatusChange(record.order_id, val)}
                    className={styles.statusSelect}
                    popupMatchSelectWidth={false}
                    options={Object.entries(STATUS_MAP).map(([k, v]) => ({
                        value: k,
                        label: (
                            <span style={{ color: v.color, fontWeight: 600, fontSize: 12 }}>
                                {v.icon}&nbsp;&nbsp;{v.label}
                            </span>
                        ),
                    }))}
                    style={{
                        "--status-color": STATUS_MAP[status]?.color || "#374151",
                        "--status-bg": STATUS_MAP[status]?.bg || "#f3f4f6",
                        "--status-border": STATUS_MAP[status]?.border || "#e5e7eb",
                    }}
                />
            ),
        },
        {
            title: "Hành động",
            key: "actions",
            width: "8%",
            align: "center",
            render: (_, record) => (
                <Tooltip title="Xem chi tiết" placement="top">
                    <button
                        className={styles.iconBtnView}
                        onClick={() => { setDetailOrder(record); setDetailOpen(true); }}
                    >
                        <EyeOutlined />
                    </button>
                </Tooltip>
            ),
        },
    ];

    const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);

    return (
        <div className={styles.page}>

            {/* ── Header ── */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản lý đơn hàng</h1>
                    <p className={styles.pageSub}>Theo dõi và cập nhật trạng thái đơn hàng theo thời gian thực</p>
                </div>
                <Dropdown menu={{ items: exportItems }} trigger={["click"]} placement="bottomRight">
                    <Button icon={<DownloadOutlined />} className={styles.exportBtn}>
                        Xuất báo cáo
                    </Button>
                </Dropdown>
            </div>

            {/* ── Status pipeline ── */}
            <div className={styles.pipeline}>
                <div className={styles.pipelineItem} onClick={() => setStatusFilter("")}>
                    <div className={`${styles.pipelineBox} ${!statusFilter ? styles.pipelineActive : ""}`}>
                        <ShoppingCartOutlined className={styles.pipelineIcon} />
                        <span className={styles.pipelineNum}>{stats.total}</span>
                        <span className={styles.pipelineLbl}>Tất cả</span>
                    </div>
                </div>
                {[
                    { key: "pending",    Icon: ClockCircleOutlined, color: "#d97706", bg: "#fef3c7" },
                    { key: "confirmed",  Icon: CheckCircleOutlined, color: "#2563eb", bg: "#eff6ff" },
                    { key: "delivering", Icon: CarOutlined,          color: "#7c3aed", bg: "#f5f3ff" },
                    { key: "delivered",  Icon: DollarOutlined,       color: "#059669", bg: "#ecfdf5" },
                    { key: "cancelled",  Icon: CloseCircleOutlined,  color: "#dc2626", bg: "#fef2f2" },
                ].map(({ key, Icon, color, bg }) => (
                    <div key={key} className={styles.pipelineItem} onClick={() => setStatusFilter(statusFilter === key ? "" : key)}>
                        <div
                            className={`${styles.pipelineBox} ${statusFilter === key ? styles.pipelineActive : ""}`}
                            style={statusFilter === key ? { borderColor: color, background: bg } : {}}
                        >
                            <Icon className={styles.pipelineIcon} style={{ color: statusFilter === key ? color : undefined }} />
                            <span className={styles.pipelineNum} style={{ color: statusFilter === key ? color : undefined }}>
                                {stats[key]}
                            </span>
                            <span className={styles.pipelineLbl}>{STATUS_MAP[key].label}</span>
                        </div>
                        {key !== "cancelled" && <div className={styles.pipelineArrow}>›</div>}
                    </div>
                ))}
            </div>

            {/* ── Revenue bar ── */}
            <div className={styles.revenueBar}>
                <WalletOutlined className={styles.revenueIcon} />
                <span className={styles.revenueLbl}>Doanh thu trang hiện tại:</span>
                <span className={styles.revenueAmt}>{totalRevenue.toLocaleString("vi-VN")}₫</span>
                <span className={styles.revenueNote}>({orders.length} đơn đang hiển thị)</span>
            </div>

            {/* ── Table card ── */}
            <div className={styles.card}>
                <div className={styles.toolbar}>
                    <div className={styles.toolbarLeft}>
                        <Input
                            prefix={<SearchOutlined style={{ color: "#bbb" }} />}
                            placeholder="Tìm theo mã đơn hoặc địa chỉ..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            allowClear className={styles.searchInput}
                        />
                        <Select
                            placeholder={<span><FilterOutlined style={{ marginRight: 5 }} />Trạng thái</span>}
                            style={{ width: 180 }}
                            value={statusFilter || undefined}
                            onChange={(v) => { setStatusFilter(v || ""); setPage(1); }}
                            allowClear
                            options={Object.entries(STATUS_MAP).map(([k, v]) => ({ label: v.label, value: k }))}
                            className={styles.filterSelect}
                        />
                    </div>
                    <Tooltip title="Làm mới">
                        <Button icon={<ReloadOutlined />} onClick={() => { fetchOrders(); fetchStats(); }} className={styles.reloadBtn} />
                    </Tooltip>
                </div>

                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={orders.map((o) => ({ ...o, key: o.order_id }))}
                        className={styles.table}
                        pagination={{
                            current: page, pageSize, total,
                            showSizeChanger: true,
                            showTotal: (t) => `Hiển thị ${orders.length} / ${t} đơn hàng`,
                            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
                            pageSizeOptions: ["5", "10", "20", "50"],
                        }}
                        locale={{
                            emptyText: (
                                <div className={styles.empty}>
                                    <ShoppingCartOutlined style={{ fontSize: 44, color: "#e0e0e0" }} />
                                    <p>Chưa có đơn hàng nào</p>
                                </div>
                            ),
                        }}
                    />
                </Spin>
            </div>

            {/* ── Detail Modal ── */}
            <Modal
                title={
                    <div className={styles.modalHead}>
                        <div className={styles.modalHeadIcon}><EyeOutlined /></div>
                        <div>
                            <div className={styles.modalHeadTitle}>
                                Chi tiết đơn #{detailOrder?.order_id?.slice(0, 8).toUpperCase()}
                            </div>
                            <div className={styles.modalHeadSub}>
                                {detailOrder?.user?.fullname || "Khách hàng"} · {detailOrder?.order_date ? new Date(detailOrder.order_date).toLocaleString("vi-VN") : ""}
                            </div>
                        </div>
                    </div>
                }
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                footer={null}
                width={580}
                destroyOnClose
            >
                {detailOrder && (
                    <div className={styles.detailBody}>
                        {/* Info grid */}
                        <div className={styles.detailGrid}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLbl}>Khách hàng</span>
                                <span className={styles.detailVal}>{detailOrder.user?.fullname || "—"}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLbl}>Số điện thoại</span>
                                <span className={styles.detailVal}>{detailOrder.user?.phoneNumber || "—"}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLbl}>Thanh toán</span>
                                <span
                                    className={styles.payBadge}
                                    style={{
                                        background: (PAYMENT_MAP[detailOrder.payment_status] || PAYMENT_MAP.unpaid).bg,
                                        color: (PAYMENT_MAP[detailOrder.payment_status] || PAYMENT_MAP.unpaid).color,
                                    }}
                                >
                                    {(PAYMENT_MAP[detailOrder.payment_status] || PAYMENT_MAP.unpaid).label}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLbl}>Phương thức</span>
                                <span className={styles.detailVal}>{detailOrder.payment_method || "Cash"}</span>
                            </div>
                            {detailOrder.delivery_address && (
                                <div className={styles.detailItem} style={{ gridColumn: "span 2" }}>
                                    <span className={styles.detailLbl}>Địa chỉ giao hàng</span>
                                    <span className={styles.detailVal}>{detailOrder.delivery_address}</span>
                                </div>
                            )}
                            {detailOrder.order_note && (
                                <div className={styles.detailItem} style={{ gridColumn: "span 2" }}>
                                    <span className={styles.detailLbl}>Ghi chú</span>
                                    <span className={styles.detailVal}>{detailOrder.order_note}</span>
                                </div>
                            )}
                        </div>

                        {/* Items list */}
                        <div className={styles.itemsTitle}>Danh sách món</div>
                        <div className={styles.itemsList}>
                            {(detailOrder.items || []).map((item) => (
                                <div key={item.order_item_id} className={styles.itemRow}>
                                    <div className={styles.itemImgWrap}>
                                        <img
                                            src={item.dish?.thumbnail_path || item.thumbnail_path}
                                            alt={item.name}
                                            className={styles.itemImg}
                                            onError={(e) => { e.target.src = "https://placehold.co/40x40?text=?"; }}
                                        />
                                    </div>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemQty}>x{item.quantity}</span>
                                    <span className={styles.itemPrice}>
                                        {(Number(item.price) * item.quantity).toLocaleString("vi-VN")}₫
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className={styles.detailTotal}>
                            <span>Tổng cộng</span>
                            <span className={styles.detailTotalAmt}>
                                {Number(detailOrder.total_amount || 0).toLocaleString("vi-VN")}₫
                            </span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Orders;
