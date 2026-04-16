import axiosInstance from "@config/axiosInstance";

/**
 * Fetch full cart data with totals and enriched items.
 */
const fetchCart = async () => {
    try {
        const res = await axiosInstance.get("/api/cart");
        return res.data; // Expected { success: true, data: { items, totalQuantity, totalAmount } }
    } catch (error) {
        console.error("Failed to fetch cart:", error);
        throw error;
    }
};

/**
 * Add a new dish to the cart.
 */
const addToCart = async (dish_id, quantity = 1) => {
    try {
        const res = await axiosInstance.post("/api/cart/items", { dish_id, quantity });
        return res.data;
    } catch (error) {
        console.error("AddToCart failed:", error);
        throw error;
    }
};

/**
 * Update quantity of a specific cart item.
 */
const updateItemQuantity = async (cartItemId, quantity) => {
    try {
        const res = await axiosInstance.put(`/api/cart/items/${cartItemId}`, { quantity });
        return res.data;
    } catch (error) {
        console.error("UpdateItemQuantity failed:", error);
        throw error;
    }
};

/**
 * Remove a single item from the cart.
 */
const removeItem = async (cartItemId) => {
    try {
        const res = await axiosInstance.delete(`/api/cart/items/${cartItemId}`);
        return res.data;
    } catch (error) {
        console.error("RemoveItem failed:", error);
        throw error;
    }
};

/**
 * Clear all items in the current user's cart.
 */
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
