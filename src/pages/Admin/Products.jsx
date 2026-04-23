import React, { useState, useEffect, useCallback } from "react";
import {
    Table, Button, Input, Select, Tooltip,
    Popconfirm, Modal, Form, InputNumber, message, Row, Col, Spin, Dropdown,
} from "antd";
import {
    EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined,
    ShoppingOutlined, CheckCircleOutlined, CloseCircleOutlined,
    ReloadOutlined, FileExcelOutlined, FilePdfOutlined,
    DownloadOutlined, FilterOutlined, PlusOutlined, InboxOutlined,
    TagOutlined, ClockCircleOutlined, FireOutlined,
} from "@ant-design/icons";
import adminService from "@services/adminService";
import styles from "./Products.module.css";

const STATUS_OPTIONS = [
    { label: "Đang bán", value: "active" },
    { label: "Ngừng bán", value: "inactive" },
    { label: "Nháp", value: "draft" },
];

const STATUS_COLORS = {
    active:   { bg: "#ecfdf5", color: "#059669", label: "Đang bán" },
    inactive: { bg: "#f3f4f6", color: "#6b7280", label: "Ngừng bán" },
    draft:    { bg: "#fef9c3", color: "#b45309", label: "Nháp" },
};

const Products = () => {
    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [total, setTotal]           = useState(0);
    const [loading, setLoading]       = useState(false);
    const [page, setPage]             = useState(1);
    const [pageSize, setPageSize]     = useState(10);

    const [search, setSearch]                 = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter]     = useState("");

    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, outOfStock: 0 });

    const [modalOpen, setModalOpen]           = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [submitting, setSubmitting]         = useState(false);
    const [form] = Form.useForm();

    const [detailOpen, setDetailOpen]         = useState(false);
    const [detailProduct, setDetailProduct]   = useState(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminService.getProducts({
                search, category_id: categoryFilter, status: statusFilter, page, limit: pageSize,
            });
            if (res.success) { setProducts(res.data.products); setTotal(res.data.total); }
        } catch { message.error("Không thể tải danh sách sản phẩm"); }
        finally { setLoading(false); }
    }, [search, categoryFilter, statusFilter, page, pageSize]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await adminService.getProductStats();
            if (res.success) setStats(res.data);
        } catch {}
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await adminService.getCategories();
            if (res.success) setCategories(res.data);
        } catch {}
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);
    useEffect(() => { fetchStats(); fetchCategories(); }, [fetchStats, fetchCategories]);

    const openAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        form.setFieldsValue({ status: "active", available: true, stock: 0, discount_amount: 0 });
        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditingProduct(record);
        form.setFieldsValue({
            name: record.name,
            category_id: record.category_id,
            price: Number(record.price),
            stock: record.stock,
            status: record.status,
            available: record.available,
            description: record.description,
            thumbnail_path: record.thumbnail_path,
            brand: record.brand,
            discount_amount: Number(record.discount_amount),
            preparation_time: record.preparation_time,
            calories: record.calories,
        });
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);
            if (editingProduct) {
                await adminService.updateProduct(editingProduct.dish_id, values);
                message.success("Cập nhật sản phẩm thành công");
            } else {
                await adminService.addProduct(values);
                message.success("Thêm sản phẩm thành công");
            }
            setModalOpen(false);
            fetchProducts();
            fetchStats();
        } catch (err) {
            if (err?.errorFields) return;
            message.error(err?.response?.data?.message || "Có lỗi xảy ra");
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        try {
            await adminService.deleteProduct(id);
            message.success("Xóa sản phẩm thành công");
            fetchProducts();
            fetchStats();
        } catch (err) { message.error(err?.response?.data?.message || "Xóa thất bại"); }
    };

    const exportItems = [
        { key: "excel", label: <span><FileExcelOutlined style={{ color: "#22a06b", marginRight: 8 }} />Xuất Excel (.xlsx)</span>, onClick: () => message.info("Tính năng đang phát triển") },
        { key: "pdf",   label: <span><FilePdfOutlined  style={{ color: "#e53935", marginRight: 8 }} />Xuất PDF (.pdf)</span>,   onClick: () => message.info("Tính năng đang phát triển") },
    ];

    const columns = [
        {
            title: "Sản phẩm",
            dataIndex: "name",
            key: "name",
            width: "28%",
            sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
            render: (text, record) => (
                <div className={styles.productCell}>
                    <div className={styles.productImgWrap}>
                        <img
                            src={record.thumbnail_path}
                            alt={text}
                            className={styles.productImg}
                            onError={(e) => { e.target.src = "https://placehold.co/48x48?text=?"; }}
                        />
                    </div>
                    <div className={styles.productInfo}>
                        <span className={styles.productName}>{text}</span>
                        {record.brand && <span className={styles.productBrand}>{record.brand}</span>}
                    </div>
                </div>
            ),
        },
        {
            title: "Danh mục",
            dataIndex: "category",
            key: "category",
            width: "14%",
            render: (cat) => cat
                ? <span className={styles.catBadge}>{cat.name}</span>
                : <span className={styles.noCategory}>—</span>,
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            width: "14%",
            sorter: (a, b) => Number(a.price) - Number(b.price),
            render: (price) => (
                <span className={styles.priceText}>
                    {Number(price).toLocaleString("vi-VN")}₫
                </span>
            ),
        },
        {
            title: "Tồn kho",
            dataIndex: "stock",
            key: "stock",
            width: "10%",
            sorter: (a, b) => a.stock - b.stock,
            render: (stock) => {
                const cls = stock === 0 ? styles.stockOut : stock <= 10 ? styles.stockLow : styles.stockOk;
                return <span className={`${styles.stockBadge} ${cls}`}>{stock}</span>;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: "13%",
            render: (status) => {
                const cfg = STATUS_COLORS[status] || STATUS_COLORS.draft;
                return (
                    <span className={styles.statusBadge} style={{ background: cfg.bg, color: cfg.color }}>
                        <span className={styles.statusDot} style={{ background: cfg.color }} />
                        {cfg.label}
                    </span>
                );
            },
        },
        {
            title: "Hành động",
            key: "actions",
            width: "14%",
            align: "center",
            render: (_, record) => (
                <div className={styles.actions}>
                    <Tooltip title="Chi tiết" placement="top">
                        <button className={styles.iconBtnView} onClick={() => { setDetailProduct(record); setDetailOpen(true); }}>
                            <EyeOutlined />
                        </button>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa" placement="top">
                        <button className={styles.iconBtnEdit} onClick={() => openEdit(record)}>
                            <EditOutlined />
                        </button>
                    </Tooltip>
                    <Popconfirm
                        title="Xoá sản phẩm này?"
                        description={`"${record.name}" sẽ bị xoá vĩnh viễn.`}
                        onConfirm={() => handleDelete(record.dish_id)}
                        okText="Xoá" cancelText="Huỷ"
                        okButtonProps={{ danger: true }}
                        placement="topRight"
                    >
                        <Tooltip title="Xoá" placement="top">
                            <button className={styles.iconBtnDelete}><DeleteOutlined /></button>
                        </Tooltip>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div className={styles.page}>

            {/* ── Page header ── */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản lý sản phẩm</h1>
                    <p className={styles.pageSub}>Quản lý toàn bộ thực đơn và hàng hoá trong hệ thống</p>
                </div>
                <div className={styles.headerActions}>
                    <Dropdown menu={{ items: exportItems }} trigger={["click"]} placement="bottomRight">
                        <Button icon={<DownloadOutlined />} className={styles.exportBtn}>
                            Xuất báo cáo
                        </Button>
                    </Dropdown>
                    <Button type="primary" icon={<PlusOutlined />} className={styles.addBtn} onClick={openAdd}>
                        Thêm sản phẩm
                    </Button>
                </div>
            </div>

            {/* ── Stats ── */}
            <Row gutter={[16, 16]} className={styles.statsRow}>
                <Col xs={12} sm={12} md={6}>
                    <div className={styles.statCard}>
                        <div className={styles.statIconBox} style={{ background: "#fff3e8" }}>
                            <ShoppingOutlined style={{ color: "#ff914d", fontSize: 20 }} />
                        </div>
                        <div className={styles.statBody}>
                            <span className={styles.statNum}>{stats.total}</span>
                            <span className={styles.statLbl}>Tổng sản phẩm</span>
                        </div>
                    </div>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <div className={styles.statCard}>
                        <div className={styles.statIconBox} style={{ background: "#e8faf0" }}>
                            <CheckCircleOutlined style={{ color: "#22a06b", fontSize: 20 }} />
                        </div>
                        <div className={styles.statBody}>
                            <span className={styles.statNum} style={{ color: "#22a06b" }}>{stats.active}</span>
                            <span className={styles.statLbl}>Đang bán</span>
                        </div>
                    </div>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <div className={styles.statCard}>
                        <div className={styles.statIconBox} style={{ background: "#f3f4f6" }}>
                            <CloseCircleOutlined style={{ color: "#6b7280", fontSize: 20 }} />
                        </div>
                        <div className={styles.statBody}>
                            <span className={styles.statNum} style={{ color: "#6b7280" }}>{stats.inactive}</span>
                            <span className={styles.statLbl}>Ngừng bán</span>
                        </div>
                    </div>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <div className={styles.statCard}>
                        <div className={styles.statIconBox} style={{ background: "#fff0f0" }}>
                            <InboxOutlined style={{ color: "#e53935", fontSize: 20 }} />
                        </div>
                        <div className={styles.statBody}>
                            <span className={styles.statNum} style={{ color: "#e53935" }}>{stats.outOfStock}</span>
                            <span className={styles.statLbl}>Hết hàng</span>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* ── Table card ── */}
            <div className={styles.card}>

                {/* Toolbar */}
                <div className={styles.toolbar}>
                    <div className={styles.toolbarLeft}>
                        <Input
                            prefix={<SearchOutlined style={{ color: "#bbb" }} />}
                            placeholder="Tìm theo tên sản phẩm..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            allowClear className={styles.searchInput}
                        />
                        <Select
                            placeholder={<span><FilterOutlined style={{ marginRight: 5 }} />Danh mục</span>}
                            style={{ width: 160 }}
                            value={categoryFilter || undefined}
                            onChange={(v) => { setCategoryFilter(v || ""); setPage(1); }}
                            allowClear
                            options={categories.map(c => ({ label: c.name, value: c.category_id }))}
                            className={styles.filterSelect}
                        />
                        <Select
                            placeholder={<span><FilterOutlined style={{ marginRight: 5 }} />Trạng thái</span>}
                            style={{ width: 150 }}
                            value={statusFilter || undefined}
                            onChange={(v) => { setStatusFilter(v || ""); setPage(1); }}
                            allowClear
                            options={STATUS_OPTIONS}
                            className={styles.filterSelect}
                        />
                    </div>
                    <Tooltip title="Làm mới dữ liệu">
                        <Button icon={<ReloadOutlined />} onClick={() => { fetchProducts(); fetchStats(); }} className={styles.reloadBtn} />
                    </Tooltip>
                </div>

                {/* Table */}
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={products.map((p) => ({ ...p, key: p.dish_id }))}
                        className={styles.table}
                        pagination={{
                            current: page, pageSize, total,
                            showSizeChanger: true,
                            showTotal: (t) => `Hiển thị ${products.length} / ${t} sản phẩm`,
                            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
                            pageSizeOptions: ["5", "10", "20", "50"],
                        }}
                        locale={{
                            emptyText: (
                                <div className={styles.empty}>
                                    <ShoppingOutlined style={{ fontSize: 44, color: "#e0e0e0" }} />
                                    <p>Chưa có sản phẩm nào</p>
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
                            <div className={styles.modalHeadTitle}>Chi tiết sản phẩm</div>
                            <div className={styles.modalHeadSub}>{detailProduct?.name}</div>
                        </div>
                    </div>
                }
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                footer={null}
                width={560}
                destroyOnClose
            >
                {detailProduct && (
                    <div className={styles.detailBody}>
                        <div className={styles.detailImgRow}>
                            <img
                                src={detailProduct.thumbnail_path}
                                alt={detailProduct.name}
                                className={styles.detailImg}
                                onError={(e) => { e.target.src = "https://placehold.co/200x200?text=?"; }}
                            />
                            <div className={styles.detailMeta}>
                                <div className={styles.detailName}>{detailProduct.name}</div>
                                {detailProduct.brand && <div className={styles.detailBrand}>{detailProduct.brand}</div>}
                                <div className={styles.detailPrice}>{Number(detailProduct.price).toLocaleString("vi-VN")}₫</div>
                                {detailProduct.discount_amount > 0 && (
                                    <div className={styles.detailDiscount}>Giảm {detailProduct.discount_amount}%</div>
                                )}
                                <span
                                    className={styles.statusBadge}
                                    style={{
                                        background: (STATUS_COLORS[detailProduct.status] || STATUS_COLORS.draft).bg,
                                        color: (STATUS_COLORS[detailProduct.status] || STATUS_COLORS.draft).color,
                                        marginTop: 8,
                                    }}
                                >
                                    <span className={styles.statusDot} style={{ background: (STATUS_COLORS[detailProduct.status] || STATUS_COLORS.draft).color }} />
                                    {(STATUS_COLORS[detailProduct.status] || STATUS_COLORS.draft).label}
                                </span>
                            </div>
                        </div>

                        <div className={styles.detailGrid}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLbl}><TagOutlined /> Danh mục</span>
                                <span className={styles.detailVal}>{detailProduct.category?.name || "—"}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLbl}>Tồn kho</span>
                                <span className={`${styles.stockBadge} ${detailProduct.stock === 0 ? styles.stockOut : detailProduct.stock <= 10 ? styles.stockLow : styles.stockOk}`}>
                                    {detailProduct.stock}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLbl}>Đã bán</span>
                                <span className={styles.detailVal}>{detailProduct.sold_count ?? 0}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLbl}>Hiển thị</span>
                                <span className={styles.detailVal}>{detailProduct.available ? "Có" : "Không"}</span>
                            </div>
                            {detailProduct.preparation_time && (
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLbl}><ClockCircleOutlined /> Chuẩn bị</span>
                                    <span className={styles.detailVal}>{detailProduct.preparation_time} phút</span>
                                </div>
                            )}
                            {detailProduct.calories && (
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLbl}><FireOutlined /> Calories</span>
                                    <span className={styles.detailVal}>{detailProduct.calories} kcal</span>
                                </div>
                            )}
                            <div className={styles.detailItem}>
                                <span className={styles.detailLbl}>Đánh giá</span>
                                <span className={styles.detailVal}>{detailProduct.rating_avg ?? 0} ⭐ ({detailProduct.rating_count ?? 0})</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLbl}>Ngày tạo</span>
                                <span className={styles.detailVal}>
                                    {detailProduct.created_at ? new Date(detailProduct.created_at).toLocaleDateString("vi-VN") : "—"}
                                </span>
                            </div>
                        </div>

                        {detailProduct.description && (
                            <div className={styles.detailDesc}>
                                <div className={styles.detailLbl}>Mô tả</div>
                                <p className={styles.detailDescText}>{detailProduct.description}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* ── Edit/Add Modal ── */}
            <Modal
                title={
                    <div className={styles.modalHead}>
                        <div className={styles.modalHeadIcon}>
                            {editingProduct ? <EditOutlined /> : <PlusOutlined />}
                        </div>
                        <div>
                            <div className={styles.modalHeadTitle}>{editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</div>
                            <div className={styles.modalHeadSub}>{editingProduct ? "Cập nhật thông tin sản phẩm" : "Điền đầy đủ thông tin bên dưới"}</div>
                        </div>
                    </div>
                }
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmit}
                okText={editingProduct ? "Lưu thay đổi" : "Thêm sản phẩm"}
                cancelText="Huỷ"
                confirmLoading={submitting}
                okButtonProps={{ className: styles.modalOkBtn }}
                width={600}
                destroyOnClose
            >
                <Form form={form} layout="vertical" className={styles.modalForm}>
                    <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}>
                        <Input placeholder="Ví dụ: Burger Bò Phô Mai" size="large" />
                    </Form.Item>

                    <Row gutter={14}>
                        <Col span={12}>
                            <Form.Item label="Danh mục" name="category_id">
                                <Select placeholder="Chọn danh mục" size="large" allowClear
                                    options={categories.map(c => ({ label: c.name, value: c.category_id }))} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Thương hiệu" name="brand">
                                <Input placeholder="KFC, Pizza Hut..." size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={14}>
                        <Col span={12}>
                            <Form.Item label="Giá bán (₫)" name="price" rules={[{ required: true, message: "Nhập giá bán" }]}>
                                <InputNumber
                                    placeholder="95000" size="large" style={{ width: "100%" }} min={0}
                                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    parser={(v) => v.replace(/,/g, "")}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Giảm giá (%)" name="discount_amount">
                                <InputNumber placeholder="0" size="large" style={{ width: "100%" }} min={0} max={100} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={14}>
                        <Col span={8}>
                            <Form.Item label="Tồn kho" name="stock">
                                <InputNumber placeholder="0" size="large" style={{ width: "100%" }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Trạng thái" name="status">
                                <Select size="large" options={STATUS_OPTIONS} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Hiển thị" name="available">
                                <Select size="large" options={[
                                    { label: "Có", value: true },
                                    { label: "Không", value: false },
                                ]} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="URL ảnh sản phẩm" name="thumbnail_path" rules={[{ required: true, message: "Nhập URL ảnh" }]}>
                        <Input placeholder="https://..." size="large" />
                    </Form.Item>

                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea rows={3} placeholder="Mô tả sản phẩm..." />
                    </Form.Item>

                    <Row gutter={14}>
                        <Col span={12}>
                            <Form.Item label="Thời gian chuẩn bị (phút)" name="preparation_time">
                                <InputNumber placeholder="15" size="large" style={{ width: "100%" }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Calories" name="calories">
                                <InputNumber placeholder="350" size="large" style={{ width: "100%" }} min={0} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default Products;
