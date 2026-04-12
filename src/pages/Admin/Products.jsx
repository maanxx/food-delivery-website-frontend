import React from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Image,
    Input,
    Select,
    Tooltip,
    Popconfirm,
    message,
    Row,
    Col,
    Badge,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ShoppingOutlined,
    StockOutlined,
    AlertOutlined,
} from "@ant-design/icons";
import styles from "./Products.module.css";

const Products = () => {
    const [searchText, setSearchText] = React.useState("");
    const [categoryFilter, setCategoryFilter] = React.useState("");
    const [stockFilter, setStockFilter] = React.useState("");
    const [filteredData, setFilteredData] = React.useState([]);

    // Mock data
    const productsData = [
        {
            id: 1,
            name: "Burger Deluxe",
            category: "Burger",
            price: 95000,
            stock: 45,
            status: "available",
            image: "https://via.placeholder.com/50",
        },
        {
            id: 2,
            name: "Pizza Pepperoni",
            category: "Pizza",
            price: 120000,
            stock: 32,
            status: "available",
            image: "https://via.placeholder.com/50",
        },
        {
            id: 3,
            name: "Phở Bò",
            category: "Noodles",
            price: 65000,
            stock: 5,
            status: "low-stock",
            image: "https://via.placeholder.com/50",
        },
        {
            id: 4,
            name: "Pad Thai",
            category: "Noodles",
            price: 75000,
            stock: 0,
            status: "out-of-stock",
            image: "https://via.placeholder.com/50",
        },
        {
            id: 5,
            name: "Sushi Combo",
            category: "Sushi",
            price: 150000,
            stock: 18,
            status: "available",
            image: "https://via.placeholder.com/50",
        },
        {
            id: 6,
            name: "Trà Sữa Trân Châu",
            category: "Drink",
            price: 45000,
            stock: 120,
            status: "available",
            image: "https://via.placeholder.com/50",
        },
    ];

    React.useEffect(() => {
        let filtered = productsData;

        if (searchText) {
            filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()));
        }

        if (categoryFilter) {
            filtered = filtered.filter((item) => item.category === categoryFilter);
        }

        if (stockFilter) {
            if (stockFilter === "available") {
                filtered = filtered.filter((item) => item.stock > 10);
            } else if (stockFilter === "low") {
                filtered = filtered.filter((item) => item.stock > 0 && item.stock <= 10);
            } else if (stockFilter === "out") {
                filtered = filtered.filter((item) => item.stock === 0);
            }
        }

        setFilteredData(filtered);
    }, [searchText, categoryFilter, stockFilter]);

    const totalProducts = productsData.length;
    const totalStock = productsData.reduce((sum, p) => sum + p.stock, 0);
    const lowStockCount = productsData.filter((p) => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = productsData.filter((p) => p.stock === 0).length;

    const categories = [...new Set(productsData.map((p) => p.category))];

    const columns = [
        {
            title: "Product",
            dataIndex: "name",
            key: "name",
            width: "22%",
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <div className={styles.productCell}>
                    <Image
                        src={record.image}
                        alt={text}
                        width={50}
                        height={50}
                        preview={false}
                        className={styles.productImage}
                    />
                    <span className={styles.productName}>{text}</span>
                </div>
            ),
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            width: "14%",
            render: (text) => <span className={styles.categoryTag}>{text}</span>,
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            width: "14%",
            sorter: (a, b) => a.price - b.price,
            render: (price) => <span className={styles.priceTag}>{price.toLocaleString("vi-VN")} VNĐ</span>,
        },
        {
            title: "Stock",
            dataIndex: "stock",
            key: "stock",
            width: "12%",
            sorter: (a, b) => a.stock - b.stock,
            render: (stock) => {
                let statusClass = styles.stockAvailable;
                if (stock === 0) statusClass = styles.stockOut;
                else if (stock < 10) statusClass = styles.stockLow;
                return <div className={`${styles.stockBadge} ${statusClass}`}>{stock} cái</div>;
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: "15%",
            render: (status) => {
                const statusConfig = {
                    available: { color: "#52c41a", bg: "#f6ffed", label: "✓ Còn hàng", icon: "✓" },
                    "low-stock": { color: "#faad14", bg: "#fffbe6", label: "⚠ Sắp hết", icon: "⚠" },
                    "out-of-stock": { color: "#ff4d4f", bg: "#fff1f0", label: "✗ Hết hàng", icon: "✗" },
                };
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
                        {config.label}
                    </Tag>
                );
            },
        },
        {
            title: "Actions",
            key: "actions",
            width: "23%",
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
                            title="Xóa sản phẩm?"
                            description="Bạn có chắc chắn muốn xóa sản phẩm này không?"
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
        <div className={styles.productsPage}>
            <div className={styles.header}>
                <h1 className={styles.headerTitle}>🍕 Quản lý sản phẩm</h1>
                <Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: "6px" }}>
                    Thêm sản phẩm
                </Button>
            </div>

            <Row gutter={[16, 16]} className={styles.statsGrid}>
                <Col xs={12} sm={12} md={6}>
                    <Card className={styles.statCard}>
                        <ShoppingOutlined style={{ fontSize: 24, color: "#667eea" }} />
                        <div className={styles.statValue} style={{ color: "#667eea" }}>
                            {totalProducts}
                        </div>
                        <div className={styles.statLabel}>Tổng sản phẩm</div>
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <Card className={styles.statCard}>
                        <StockOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                        <div className={styles.statValue} style={{ color: "#1890ff" }}>
                            {totalStock}
                        </div>
                        <div className={styles.statLabel}>Tổng tồn kho</div>
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <Card className={styles.statCard}>
                        <AlertOutlined style={{ fontSize: 24, color: "#faad14" }} />
                        <div className={styles.statValue} style={{ color: "#faad14" }}>
                            {lowStockCount}
                        </div>
                        <div className={styles.statLabel}>Sắp hết</div>
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <Card className={styles.statCard}>
                        <AlertOutlined style={{ fontSize: 24, color: "#ff4d4f" }} />
                        <div className={styles.statValue} style={{ color: "#ff4d4f" }}>
                            {outOfStock}
                        </div>
                        <div className={styles.statLabel}>Hết hàng</div>
                    </Card>
                </Col>
            </Row>

            <Card className={styles.tableCard}>
                <div className={styles.toolbar}>
                    <Input
                        placeholder="Tìm kiếm sản phẩm..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className={styles.searchInput}
                        allowClear
                        size="large"
                    />
                    <Select
                        placeholder="Tất cả danh mục"
                        style={{ width: "170px" }}
                        value={categoryFilter || undefined}
                        onChange={(value) => setCategoryFilter(value)}
                        allowClear
                        size="large"
                        options={categories.map((cat) => ({ label: cat, value: cat }))}
                    />
                    <Select
                        placeholder="Tất cả trạng thái"
                        style={{ width: "160px" }}
                        value={stockFilter || undefined}
                        onChange={(value) => setStockFilter(value)}
                        allowClear
                        size="large"
                        options={[
                            { label: "Còn hàng", value: "available" },
                            { label: "Sắp hết", value: "low" },
                            { label: "Hết hàng", value: "out" },
                        ]}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData.map((item) => ({ ...item, key: item.id }))}
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} sản phẩm` }}
                    className={styles.table}
                    locale={{
                        emptyText: (
                            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                                No products found{searchText && ` for "${searchText}"`}
                            </div>
                        ),
                    }}
                />
            </Card>
        </div>
    );
};

export default Products;
