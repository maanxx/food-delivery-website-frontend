import axiosInstance from "@config/axiosInstance";

const getCartItems = async () => {
    try {
        const res = await axiosInstance({
            url: "/api/cart",
            method: "GET",
        });

        return res.data;
    } catch (error) {
        console.log("Failed to get cart items ", error);
    }
};

const updateCartItemQuantity = async (cartItemId, quantity) => {
    try {
        const res = await axiosInstance({
            url: "/cart/update-quantity",
            method: "PUT",
            data: {
                cartItemId,
                quantity,
            },
        });
    } catch (error) {
        console.log("Change item quantity failed \n", error);
    }
};

const deleteCartItem = async (cartItemId) => {
    try {
        await axiosInstance({
            url: `/cart/delete-item/${cartItemId}`,
            method: "delete",
        });
    } catch (error) {
        console.log("Delete cart item failed", error);
    }
};

export { getCartItems, updateCartItemQuantity, deleteCartItem };
