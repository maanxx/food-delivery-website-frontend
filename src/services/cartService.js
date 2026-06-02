import axiosInstance from "@config/axiosInstance";

const fetchCart = async () => {
    try {
        const res = await axiosInstance.get("/api/cart");
        return res.data;
    } catch (error) {
        console.error("Failed to fetch cart:", error);
        throw error;
    }
};

const addToCart = async (dishId, quantity = 1) => {
    try {
        const payload = { dishId, quantity };
        console.log("🛒 ADD TO CART PAYLOAD:", payload);
        const res = await axiosInstance.post("/api/cart/items", payload);
        return res.data;
    } catch (error) {
        console.error("AddToCart failed:", error);
        throw error;
    }
};

const updateItemQuantity = async (cartItemId, quantity) => {
    try {
        const res = await axiosInstance.put(`/api/cart/items/${cartItemId}`, { quantity });
        return res.data;
    } catch (error) {
        console.error("UpdateItemQuantity failed:", error);
        throw error;
    }
};

const removeItem = async (cartItemId) => {
    try {
        const res = await axiosInstance.delete(`/api/cart/items/${cartItemId}`);
        return res.data;
    } catch (error) {
        console.error("RemoveItem failed:", error);
        throw error;
    }
};

const clearCart = async () => {
    try {
        const res = await axiosInstance.delete("/api/cart/items/clear");
        return res.data;
    } catch (error) {
        console.error("ClearCart failed:", error);
        throw error;
    }
};

export { fetchCart, addToCart, updateItemQuantity, removeItem, clearCart };
