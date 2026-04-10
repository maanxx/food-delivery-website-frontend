import React from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Avatar,
    Input,
    Select,
    Tooltip,
    Popconfirm,
    message,
    Row,
    Col,
    Statistic,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    SearchOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import styles from "./Employees.module.css";

const Employees = () => {
    const [searchText, setSearchText] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("");
    const [positionFilter, setPositionFilter] = React.useState("");
    const [filteredData, setFilteredData] = React.useState([]);

    // Mock data
    const employeesData = [
        {
            id: 1,
            name: "Nguyễn Văn A",
            email: "nguyenvana@example.com",
            position: "Delivery Staff",
            phone: "0901234567",
            status: "active",
            joinDate: "2023-01-15",
            avatar: "NA",
        },
        {
            id: 2,
            name: "Trần Thị B",
            email: "tranthib@example.com",
            position: "Chef",
            phone: "0912345678",
            status: "active",
            joinDate: "2023-02-20",
            avatar: "TB",
        },
        {
            id: 3,
            name: "Lê Văn C",
            email: "levanc@example.com",
            position: "Manager",
            phone: "0923456789",
            status: "inactive",
            joinDate: "2022-11-10",
            avatar: "LC",
        },
        {
            id: 4,
            name: "Phạm Thị D",
            email: "phamthid@example.com",
            position: "Cashier",
            phone: "0934567890",
            status: "active",
            joinDate: "2023-03-05",
            avatar: "PD",
        },
        {
            id: 5,
            name: "Hoàng Văn E",
            email: "hoangvane@example.com",
            position: "Chef",
            phone: "0945678901",
            status: "active",
            joinDate: "2023-05-12",
            avatar: "HE",
        },
    ];

    React.useEffect(() => {
        let filtered = employeesData;

        if (searchText) {
            filtered = filtered.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    item.email.toLowerCase().includes(searchText.toLowerCase()) ||
                    item.phone.includes(searchText),
            );
        }

        if (statusFilter) {
            filtered = filtered.filter((item) => item.status === statusFilter);
        }

        if (positionFilter) {
            filtered = filtered.filter((item) => item.position === positionFilter);
        }

        setFilteredData(filtered);
    }, [searchText, statusFilter, positionFilter]);

    const activeCount = employeesData.filter((e) => e.status === "active").length;
    const inactiveCount = employeesData.filter((e) => e.status === "inactive").length;

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            width: "18%",
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <div className={styles.nameCell}>
                    <Avatar style={{ backgroundColor: "#667eea" }}>{record.avatar}</Avatar>
                    <span className={styles.nameText}>{text}</span>
                </div>
            ),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: "18%",
        },
        {
            title: "Position",
            dataIndex: "position",
            key: "position",
            width: "15%",
            render: (text) => <span style={{ fontWeight: 500, color: "#667eea" }}>{text}</span>,
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
            width: "13%",
        },
        {
            title: "Join Date",
            dataIndex: "joinDate",
            key: "joinDate",
            width: "13%",
            sorter: (a, b) => new Date(a.joinDate) - new Date(b.joinDate),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: "11%",
            render: (status) => (
                <Tag
                    icon={status === "active" ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    style={{
                        backgroundColor: status === "active" ? "#f6ffed" : "#fff1f0",
                        color: status === "active" ? "#52c41a" : "#ff4d4f",
                        border: `1px solid ${status === "active" ? "#52c41a" : "#ff4d4f"}`,
                        borderRadius: "20px",
                        padding: "4px 12px",
                        fontWeight: 500,
                    }}
                >
                    {status === "active" ? "Active" : "Inactive"}
                </Tag>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: "12%",
            render: (_, record) => (
                <div className={styles.actionButtons}>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => message.info(`Chỉnh sửa ${record.name}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa nhân viên?"
                            description="Bạn có chắc chắn muốn xóa nhân viên này không?"
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
        <div className={styles.employeesPage}>
            <div className={styles.header}>
                <h1 className={styles.headerTitle}>👥 Quản lý nhân viên</h1>
                <Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: "6px" }}>
                    Thêm nhân viên
                </Button>
            </div>

            <Row gutter={[16, 16]} className={styles.statsGrid}>
                <Col xs={12} sm={12} md={8}>
                    <Card className={styles.statCard}>
                        <TeamOutlined style={{ fontSize: 24, color: "#667eea" }} />
                        <div className={styles.statValue} style={{ color: "#667eea" }}>
                            {employeesData.length}
                        </div>
                        <div className={styles.statLabel}>Tổng nhân viên</div>
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={8}>
                    <Card className={styles.statCard}>
                        <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a" }} />
                        <div className={styles.statValue} style={{ color: "#52c41a" }}>
                            {activeCount}
                        </div>
                        <div className={styles.statLabel}>Đang làm việc</div>
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={8}>
                    <Card className={styles.statCard}>
                        <ClockCircleOutlined style={{ fontSize: 24, color: "#ff4d4f" }} />
                        <div className={styles.statValue} style={{ color: "#ff4d4f" }}>
                            {inactiveCount}
                        </div>
                        <div className={styles.statLabel}>Không hoạt động</div>
                    </Card>
                </Col>
            </Row>

            <Card className={styles.tableCard}>
                <div className={styles.toolbar}>
                    <Input
                        placeholder="Tìm kiếm theo tên, email hoặc SĐT..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className={styles.searchInput}
                        allowClear
                        size="large"
                    />
                    <Select
                        placeholder="Tất cả chức vị"
                        style={{ width: "180px" }}
                        value={positionFilter || undefined}
                        onChange={(value) => setPositionFilter(value)}
                        allowClear
                        size="large"
                        options={[
                            { label: "Delivery Staff", value: "Delivery Staff" },
                            { label: "Chef", value: "Chef" },
                            { label: "Manager", value: "Manager" },
                            { label: "Cashier", value: "Cashier" },
                        ]}
                    />
                    <Select
                        placeholder="Tất cả trạng thái"
                        style={{ width: "150px" }}
                        value={statusFilter || undefined}
                        onChange={(value) => setStatusFilter(value)}
                        allowClear
                        size="large"
                        options={[
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" },
                        ]}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData.map((item) => ({ ...item, key: item.id }))}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} nhân viên`,
                    }}
                    className={styles.table}
                    locale={{
                        emptyText: (
                            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                                No employees found{searchText && ` for "${searchText}"`}
                            </div>
                        ),
                    }}
                />
            </Card>
        </div>
    );
};

export default Employees;
