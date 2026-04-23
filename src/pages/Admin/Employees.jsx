import React, { useState, useEffect, useCallback } from "react";
import {
    Table, Button, Input, Select, Avatar, Tooltip,
    Popconfirm, Modal, Form, message, Row, Col, Spin, Dropdown,
} from "antd";
import {
    EditOutlined, DeleteOutlined, SearchOutlined,
    TeamOutlined, CheckCircleOutlined, UserAddOutlined,
    ReloadOutlined, FileExcelOutlined, FilePdfOutlined,
    DownloadOutlined, FilterOutlined,
} from "@ant-design/icons";
import adminService from "@services/adminService";
import styles from "./Employees.module.css";

const POSITIONS = [
    { label: "Delivery Staff", value: "Delivery Staff" },
    { label: "Chef", value: "Chef" },
    { label: "Manager", value: "Manager" },
    { label: "Cashier", value: "Cashier" },
];

const POSITION_COLORS = {
    "Delivery Staff": { bg: "#e8f4fd", color: "#1a73e8", border: "#c5dff8" },
    "Chef":           { bg: "#fef3e2", color: "#e8830a", border: "#fcd99a" },
    "Manager":        { bg: "#f0ebff", color: "#7c3aed", border: "#d4c5fa" },
    "Cashier":        { bg: "#e6faf2", color: "#0f9058", border: "#b3e8d0" },
};

const getInitials = (name = "") =>
    name.split(" ").slice(-2).map((w) => w[0]?.toUpperCase() || "").join("");

const AVATAR_COLORS = ["#ff914d","#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899"];
const pickAvatarColor = (name = "") => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};


const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [total, setTotal]         = useState(0);
    const [loading, setLoading]     = useState(false);
    const [page, setPage]           = useState(1);
    const [pageSize, setPageSize]   = useState(10);

    const [search, setSearch]               = useState("");
    const [positionFilter, setPositionFilter] = useState("");
    const [statusFilter, setStatusFilter]   = useState("");

    const [modalOpen, setModalOpen]           = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [submitting, setSubmitting]         = useState(false);

    const [form] = Form.useForm();

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminService.getEmployees({ search, position: positionFilter, status: statusFilter, page, limit: pageSize });
            if (res.success) { setEmployees(res.data.employees); setTotal(res.data.total); }
        } catch { message.error("Không thể tải danh sách nhân viên"); }
        finally { setLoading(false); }
    }, [search, positionFilter, statusFilter, page, pageSize]);

    useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

    const activeCount   = employees.filter((e) => e.isOnline).length;
    const inactiveCount = employees.filter((e) => !e.isOnline).length;

    const openAdd = () => {
        setEditingEmployee(null);
        form.resetFields();
        form.setFieldsValue({ isOnline: true, countryCode: "+84" });
        setModalOpen(true);
    };
    const openEdit = (record) => {
        setEditingEmployee(record);
        form.setFieldsValue({ fullname: record.fullname, email: record.email, phoneNumber: record.phoneNumber, position: record.position, isOnline: record.isOnline });
        setModalOpen(true);
    };
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);
            if (editingEmployee) {
                await adminService.updateEmployee(editingEmployee.userId, values);
                message.success("Cập nhật nhân viên thành công");
            } else {
                await adminService.addEmployee(values);
                message.success("Thêm nhân viên thành công");
            }
            setModalOpen(false);
            fetchEmployees();
        } catch (err) {
            if (err?.errorFields) return;
            message.error(err?.response?.data?.message || "Có lỗi xảy ra");
        } finally { setSubmitting(false); }
    };
    const handleDelete = async (id) => {
        try {
            await adminService.deleteEmployee(id);
            message.success("Xóa nhân viên thành công");
            fetchEmployees();
        } catch (err) { message.error(err?.response?.data?.message || "Xóa thất bại"); }
    };

    const exportItems = [
        { key: "excel", label: <span><FileExcelOutlined style={{ color: "#22a06b", marginRight: 8 }} />Xuất Excel (.xlsx)</span>, onClick: () => message.info("Tính năng đang phát triển") },
        { key: "pdf",   label: <span><FilePdfOutlined  style={{ color: "#e53935", marginRight: 8 }} />Xuất PDF (.pdf)</span>,   onClick: () => message.info("Tính năng đang phát triển") },
    ];

    const columns = [
        {
            title: "Nhân viên",
            dataIndex: "fullname",
            key: "fullname",
            width: "26%",
            sorter: (a, b) => (a.fullname || "").localeCompare(b.fullname || ""),
            render: (text, record) => (
                <div className={styles.nameCell}>
                    <Avatar src={record.avatarPath || null} size={40}
                        style={{ backgroundColor: pickAvatarColor(text || ""), flexShrink: 0, fontWeight: 700, fontSize: 14 }}>
                        {!record.avatarPath && getInitials(text)}
                    </Avatar>
                    <div className={styles.nameInfo}>
                        <span className={styles.nameText}>{text || "—"}</span>
                        <span className={styles.emailText}>{record.email}</span>
                    </div>
                </div>
            ),
        },
        {
            title: "Chức vụ",
            dataIndex: "position",
            key: "position",
            width: "16%",
            render: (pos) => {
                const c = POSITION_COLORS[pos];
                return pos
                    ? <span className={styles.posBadge} style={{ background: c?.bg, color: c?.color, border: `1px solid ${c?.border}` }}>{pos}</span>
                    : <span className={styles.noPosition}>—</span>;
            },
        },
        {
            title: "Số điện thoại",
            dataIndex: "phoneNumber",
            key: "phoneNumber",
            width: "15%",
            render: (v) => <span className={styles.phone}>{v || "—"}</span>,
        },
        {
            title: "Ngày vào làm",
            dataIndex: "createdAt",
            key: "createdAt",
            width: "15%",
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (date) => date
                ? <span className={styles.dateText}>{new Date(date).toLocaleDateString("vi-VN")}</span>
                : "—",
        },
        {
            title: "Trạng thái",
            dataIndex: "isOnline",
            key: "isOnline",
            width: "13%",
            render: (isOnline) => (
                <span className={isOnline ? styles.badgeActive : styles.badgeInactive}>
                    <span className={isOnline ? styles.dot : styles.dotGray} />
                    {isOnline ? "Đang làm" : "Nghỉ việc"}
                </span>
            ),
        },
        {
            title: "Hành động",
            key: "actions",
            width: "10%",
            align: "center",
            render: (_, record) => (
                <div className={styles.actions}>
                    <Tooltip title="Chỉnh sửa" placement="top">
                        <button className={styles.iconBtnEdit} onClick={() => openEdit(record)}>
                            <EditOutlined />
                        </button>
                    </Tooltip>
                    <Popconfirm
                        title="Xoá nhân viên này?"
                        description={`"${record.fullname}" sẽ bị xoá vĩnh viễn.`}
                        onConfirm={() => handleDelete(record.userId)}
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
                    <h1 className={styles.pageTitle}>Quản lý nhân viên</h1>
                    <p className={styles.pageSub}>Quản lý toàn bộ nhân viên trong hệ thống nhà hàng</p>
                </div>
                <div className={styles.headerActions}>
                    <Dropdown menu={{ items: exportItems }} trigger={["click"]} placement="bottomRight">
                        <Button icon={<DownloadOutlined />} className={styles.exportBtn}>
                            Xuất báo cáo
                        </Button>
                    </Dropdown>
                    <Button type="primary" icon={<UserAddOutlined />} className={styles.addBtn} onClick={openAdd}>
                        Thêm nhân viên
                    </Button>
                </div>
            </div>

            {/* ── Stats ── */}
            <Row gutter={[16, 16]} className={styles.statsRow}>
                <Col xs={24} sm={8}>
                    <div className={`${styles.statCard} ${styles.statOrange}`}>
                        <div className={styles.statIconBox} style={{ background: "#fff3e8" }}>
                            <TeamOutlined style={{ color: "#ff914d", fontSize: 20 }} />
                        </div>
                        <div className={styles.statBody}>
                            <span className={styles.statNum}>{total}</span>
                            <span className={styles.statLbl}>Tổng nhân viên</span>
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={8}>
                    <div className={`${styles.statCard} ${styles.statGreen}`}>
                        <div className={styles.statIconBox} style={{ background: "#e8faf0" }}>
                            <CheckCircleOutlined style={{ color: "#22a06b", fontSize: 20 }} />
                        </div>
                        <div className={styles.statBody}>
                            <span className={styles.statNum} style={{ color: "#22a06b" }}>{activeCount}</span>
                            <span className={styles.statLbl}>Đang làm việc</span>
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={8}>
                    <div className={`${styles.statCard} ${styles.statRed}`}>
                        <div className={styles.statIconBox} style={{ background: "#fff0f0" }}>
                            <UserAddOutlined style={{ color: "#e53935", fontSize: 20, transform: "scaleX(-1)" }} />
                        </div>
                        <div className={styles.statBody}>
                            <span className={styles.statNum} style={{ color: "#e53935" }}>{inactiveCount}</span>
                            <span className={styles.statLbl}>Nghỉ việc</span>
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
                            placeholder="Tìm theo tên, email, số điện thoại..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            allowClear className={styles.searchInput}
                        />
                        <Select
                            placeholder={<span><FilterOutlined style={{ marginRight: 5 }} />Chức vụ</span>}
                            style={{ width: 160 }}
                            value={positionFilter || undefined}
                            onChange={(v) => { setPositionFilter(v || ""); setPage(1); }}
                            allowClear options={POSITIONS}
                            className={styles.filterSelect}
                        />
                        <Select
                            placeholder={<span><FilterOutlined style={{ marginRight: 5 }} />Trạng thái</span>}
                            style={{ width: 150 }}
                            value={statusFilter || undefined}
                            onChange={(v) => { setStatusFilter(v || ""); setPage(1); }}
                            allowClear
                            options={[{ label: "Đang làm", value: "active" }, { label: "Nghỉ việc", value: "inactive" }]}
                            className={styles.filterSelect}
                        />
                    </div>
                    <Tooltip title="Làm mới dữ liệu">
                        <Button icon={<ReloadOutlined />} onClick={fetchEmployees} className={styles.reloadBtn} />
                    </Tooltip>
                </div>

                {/* Table */}
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={employees.map((e) => ({ ...e, key: e.userId }))}
                        className={styles.table}
                        pagination={{
                            current: page, pageSize, total,
                            showSizeChanger: true,
                            showTotal: (t) => `Hiển thị ${employees.length} / ${t} nhân viên`,
                            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
                            pageSizeOptions: ["5", "10", "20", "50"],
                        }}
                        locale={{
                            emptyText: (
                                <div className={styles.empty}>
                                    <TeamOutlined style={{ fontSize: 44, color: "#e0e0e0" }} />
                                    <p>Chưa có nhân viên nào</p>
                                </div>
                            ),
                        }}
                    />
                </Spin>
            </div>

            {/* ── Modal ── */}
            <Modal
                title={
                    <div className={styles.modalHead}>
                        <div className={styles.modalHeadIcon}>
                            {editingEmployee ? <EditOutlined /> : <UserAddOutlined />}
                        </div>
                        <div>
                            <div className={styles.modalHeadTitle}>{editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}</div>
                            <div className={styles.modalHeadSub}>{editingEmployee ? "Cập nhật thông tin nhân viên" : "Điền đầy đủ thông tin bên dưới"}</div>
                        </div>
                    </div>
                }
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmit}
                okText={editingEmployee ? "Lưu thay đổi" : "Thêm nhân viên"}
                cancelText="Huỷ"
                confirmLoading={submitting}
                okButtonProps={{ className: styles.modalOkBtn }}
                width={540}
                destroyOnClose
            >
                <Form form={form} layout="vertical" className={styles.modalForm}>
                    <Form.Item label="Họ và tên" name="fullname" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
                        <Input placeholder="Nguyễn Văn A" size="large" />
                    </Form.Item>
                    <Row gutter={14}>
                        <Col span={12}>
                            <Form.Item label="Email" name="email"
                                rules={[{ required: true, message: "Nhập email" }, { type: "email", message: "Email không hợp lệ" }]}>
                                <Input placeholder="example@email.com" size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Số điện thoại" name="phoneNumber" rules={[{ required: true, message: "Nhập SĐT" }]}>
                                <Input placeholder="09xxxxxxxx" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={14}>
                        <Col span={12}>
                            <Form.Item label="Chức vụ" name="position">
                                <Select placeholder="Chọn chức vụ" size="large" allowClear options={POSITIONS} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Trạng thái" name="isOnline">
                                <Select size="large" options={[{ label: "Đang làm việc", value: true }, { label: "Nghỉ việc", value: false }]} />
                            </Form.Item>
                        </Col>
                    </Row>
                    {!editingEmployee && (
                        <Row gutter={14}>
                            <Col span={6}>
                                <Form.Item label="Mã QG" name="countryCode" initialValue="+84">
                                    <Input size="large" />
                                </Form.Item>
                            </Col>
                            <Col span={18}>
                                <Form.Item label="Mật khẩu" name="password" extra="Mặc định: Employee@123">
                                    <Input.Password placeholder="Tuỳ chọn" size="large" />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default Employees;
