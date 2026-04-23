import React from "react";
import { Spin } from "antd";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import styles from "./Chart.module.css";

const ORANGE   = "#ff914d";
const ORANGE2  = "#ff6b35";
const PIE_COLORS = ["#ff914d", "#3b82f6", "#22a06b", "#8b5cf6", "#f59e0b", "#ef4444"];

const ChartCard = ({ title, subtitle, children, loading }) => (
    <div className={styles.chartCard}>
        <div className={styles.chartHead}>
            <div>
                <div className={styles.chartTitle}>{title}</div>
                {subtitle && <div className={styles.chartSub}>{subtitle}</div>}
            </div>
        </div>
        {loading ? (
            <div className={styles.spinnerWrap}><Spin /></div>
        ) : children}
    </div>
);

const fmtRevenue = (v) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return v;
};

const RevenueTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.tooltip}>
            <div className={styles.tooltipLabel}>{label}</div>
            <div className={styles.tooltipVal} style={{ color: ORANGE }}>
                {Number(payload[0].value).toLocaleString("vi-VN")}₫
            </div>
        </div>
    );
};

const OrderTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.tooltip}>
            <div className={styles.tooltipLabel}>{label}</div>
            <div className={styles.tooltipVal} style={{ color: ORANGE }}>
                {payload[0].value} đơn
            </div>
        </div>
    );
};

export const OrderStatsChart = ({ data, loading = false, period }) => (
    <ChartCard
        title="Thống kê đơn hàng"
        subtitle={period === "today" ? "Theo giờ hôm nay" : period === "week" ? "7 ngày qua" : "6 tháng gần nhất"}
        loading={loading}
    >
        {data?.length ? (
            <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<OrderTooltip />} />
                    <Line
                        type="monotone" dataKey="orders" stroke={ORANGE}
                        strokeWidth={2.5} dot={{ fill: ORANGE, r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: ORANGE2 }} name="Đơn hàng"
                    />
                </LineChart>
            </ResponsiveContainer>
        ) : <p className={styles.noData}>Không có dữ liệu</p>}
    </ChartCard>
);

export const RevenueChart = ({ data, loading = false, period }) => (
    <ChartCard
        title="Doanh thu"
        subtitle={period === "today" ? "Theo giờ hôm nay" : period === "week" ? "7 ngày qua" : "6 tháng gần nhất"}
        loading={loading}
    >
        {data?.length ? (
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmtRevenue} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<RevenueTooltip />} />
                    <Bar dataKey="revenue" name="Doanh thu" radius={[6, 6, 0, 0]}>
                        {data.map((_, i) => (
                            <Cell key={i} fill={i === data.length - 1 ? ORANGE2 : ORANGE} fillOpacity={0.85} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        ) : <p className={styles.noData}>Không có dữ liệu</p>}
    </ChartCard>
);

const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 1.35;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="#374151" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={11} fontWeight={600}>
            {name}: {value}
        </text>
    );
};

export const TopDishesChart = ({ data, loading = false }) => (
    <ChartCard title="Món bán chạy nhất" subtitle="Top 5 sản phẩm" loading={loading}>
        {data?.length ? (
            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie
                        data={data} cx="50%" cy="50%"
                        outerRadius={90} innerRadius={40}
                        dataKey="quantity" labelLine={false} label={<PieLabel />}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} phần`, n]} />
                </PieChart>
            </ResponsiveContainer>
        ) : <p className={styles.noData}>Không có dữ liệu</p>}
    </ChartCard>
);

export const CategoryChart = ({ data, loading = false }) => (
    <ChartCard title="Doanh thu theo danh mục" subtitle="Toàn thời gian" loading={loading}>
        {data?.length ? (
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                    <XAxis type="number" tickFormatter={fmtRevenue} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString("vi-VN")}₫`, "Doanh thu"]} />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]} fill={ORANGE} fillOpacity={0.85} />
                </BarChart>
            </ResponsiveContainer>
        ) : <p className={styles.noData}>Không có dữ liệu</p>}
    </ChartCard>
);
