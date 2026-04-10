import React from "react";
import { Card, Spin } from "antd";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import styles from "./Chart.module.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

export const OrderStatsChart = ({ data, loading = false }) => {
    return (
        <Card title="Thống kê đơn hàng (7 ngày)" className={styles.chartCard}>
            {loading ? (
                <div className={styles.spinnerContainer}>
                    <Spin />
                </div>
            ) : data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="orders" stroke="#8884d8" name="Đơn hàng" />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <p className={styles.noData}>Không có dữ liệu</p>
            )}
        </Card>
    );
};

export const RevenueChart = ({ data, loading = false }) => {
    return (
        <Card title="Doanh thu (7 ngày)" className={styles.chartCard}>
            {loading ? (
                <div className={styles.spinnerContainer}>
                    <Spin />
                </div>
            ) : data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" fill="#82ca9d" name="Doanh thu (VNĐ)" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <p className={styles.noData}>Không có dữ liệu</p>
            )}
        </Card>
    );
};

export const TopDishesChart = ({ data, loading = false }) => {
    return (
        <Card title="Món bán chạy nhất" className={styles.chartCard}>
            {loading ? (
                <div className={styles.spinnerContainer}>
                    <Spin />
                </div>
            ) : data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="quantity"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <p className={styles.noData}>Không có dữ liệu</p>
            )}
        </Card>
    );
};

export const CategoryChart = ({ data, loading = false }) => {
    return (
        <Card title="Doanh thu theo danh mục" className={styles.chartCard}>
            {loading ? (
                <div className={styles.spinnerContainer}>
                    <Spin />
                </div>
            ) : data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" fill="#ffc658" name="Doanh thu (VNĐ)" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <p className={styles.noData}>Không có dữ liệu</p>
            )}
        </Card>
    );
};
