import axiosInstance from "@config/axiosInstance";

/**
 * Fetch all orders for the current user.
 */
export const fetchMyOrders = async () => {
    try {
        const response = await axiosInstance.get("/orders/my");
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch a single order by ID.
 */
export const fetchOrderById = async (orderId) => {
    try {
        const response = await axiosInstance.get(`/orders/${orderId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Create a new order from the current cart (COD).
 */
export const createOrder = async (orderData) => {
    try {
        const response = await axiosInstance.post("/orders", orderData);
        return response.data;
    } catch (error) {
        throw error;
    }
};
/**
 * Reorder items from a past order.
 */
export const reorder = async (orderId) => {
    try {
        const response = await axiosInstance.post(`/orders/${orderId}/reorder`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
