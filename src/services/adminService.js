import axiosInstance from "@config/axiosInstance";
const adminService = {
    getOrderStats: async (period = "today") => {
        try {
            const response = await axiosInstance.get(`/api/admin/orders/stats?period=${period}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getRevenue: async (period = "today") => {
        try {
            const response = await axiosInstance.get(`/api/admin/revenue?period=${period}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getActiveUsers: async () => {
        try {
            const response = await axiosInstance.get("/api/admin/active-users");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Món bán chạy
    getTopDishes: async (limit = 10) => {
        try {
            const response = await axiosInstance.get(`/api/admin/top-dishes?limit=${limit}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Đơn hàng mới
    getRecentOrders: async (limit = 10) => {
        try {
            const response = await axiosInstance.get(`/api/admin/recent-orders?limit=${limit}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Dữ liệu cho biểu đồ theo ngày
    getDailyChartData: async (days = 7) => {
        try {
            const response = await axiosInstance.get(`/api/admin/chart-data/daily?days=${days}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Dữ liệu cho biểu đồ danh mục
    getCategoryChartData: async () => {
        try {
            const response = await axiosInstance.get("/api/admin/chart-data/category");
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default adminService;
