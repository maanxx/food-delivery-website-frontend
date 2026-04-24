import axiosInstance from "@config/axiosInstance";

const adminService = {
    getOrderStats: async () => {
        const response = await axiosInstance.get("/api/admin/orders/stats");
        return response.data;
    },

    getOrders: async ({ search = "", status = "", page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (status) params.append("status", status);
        params.append("page", page);
        params.append("limit", limit);
        const response = await axiosInstance.get(`/api/admin/orders?${params.toString()}`);
        return response.data;
    },

    updateOrderStatus: async (id, status) => {
        const response = await axiosInstance.put(`/api/admin/orders/${id}/status`, { status });
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

    // Employee management
    getEmployees: async ({ search = "", position = "", status = "", page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (position) params.append("position", position);
        if (status) params.append("status", status);
        params.append("page", page);
        params.append("limit", limit);
        const response = await axiosInstance.get(`/api/admin/employees?${params.toString()}`);
        return response.data;
    },

    addEmployee: async (data) => {
        const response = await axiosInstance.post("/api/admin/employees", data);
        return response.data;
    },

    updateEmployee: async (id, data) => {
        const response = await axiosInstance.put(`/api/admin/employees/${id}`, data);
        return response.data;
    },

    deleteEmployee: async (id) => {
        const response = await axiosInstance.delete(`/api/admin/employees/${id}`);
        return response.data;
    },

    // Product management
    getProducts: async ({ search = "", category_id = "", status = "", page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (category_id) params.append("category_id", category_id);
        if (status) params.append("status", status);
        params.append("page", page);
        params.append("limit", limit);
        const response = await axiosInstance.get(`/api/admin/products?${params.toString()}`);
        return response.data;
    },

    addProduct: async (data) => {
        const response = await axiosInstance.post("/api/admin/products", data);
        return response.data;
    },

    updateProduct: async (id, data) => {
        const response = await axiosInstance.put(`/api/admin/products/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await axiosInstance.delete(`/api/admin/products/${id}`);
        return response.data;
    },

    getProductStats: async () => {
        const response = await axiosInstance.get("/api/admin/products/stats");
        return response.data;
    },

    getCategories: async () => {
        const response = await axiosInstance.get("/api/admin/categories");
        return response.data;
    },
};

export default adminService;
