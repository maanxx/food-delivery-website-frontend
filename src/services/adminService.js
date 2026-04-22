import axiosInstance from "@config/axiosInstance";
const adminService = {
    getOrderStats: async (period = "today") => {
        const response = await axiosInstance.get(`/api/admin/orders/stats?period=${period}`);
        return response.data;
    },

    getRevenue: async (period = "today") => {
        const response = await axiosInstance.get(`/api/admin/revenue?period=${period}`);
        return response.data;
    },

    getActiveUsers: async () => {
        const response = await axiosInstance.get("/api/admin/active-users");
        return response.data;
    },

    // Món bán chạy
    getTopDishes: async (limit = 10) => {
        const response = await axiosInstance.get(`/api/admin/top-dishes?limit=${limit}`);
        return response.data;
    },

    // Đơn hàng mới
    getRecentOrders: async (limit = 10) => {
        const response = await axiosInstance.get(`/api/admin/recent-orders?limit=${limit}`);
        return response.data;
    },

    // Dữ liệu cho biểu đồ theo ngày
    getDailyChartData: async (days = 7) => {
        const response = await axiosInstance.get(`/api/admin/chart-data/daily?days=${days}`);
        return response.data;
    },

    // Dữ liệu cho biểu đồ danh mục
    getCategoryChartData: async () => {
        const response = await axiosInstance.get("/api/admin/chart-data/category");
        return response.data;
    },
};

export default adminService;
