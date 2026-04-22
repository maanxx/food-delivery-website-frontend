import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as cartService from "@services/cartService";
import { message } from "antd";

/**
 * Thunks for Cart Mutations
 */

export const fetchCartItems = createAsyncThunk(
    "cart/fetchItems",
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartService.fetchCart();
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Không thể tải giỏ hàng");
        }
    }
);

export const addToCart = createAsyncThunk(
    "cart/addItem",
    async ({ dishId, quantity }, { rejectWithValue }) => {
        try {
            const payload = { dishId, quantity };
            console.log("🛒 REDUX THUNK PAYLOAD:", payload);
            const response = await cartService.addToCart(dishId, quantity);
            if (response.success) {
                message.success("✅ Added to cart");
                return response; // Return full response { success, data: { items, totalQuantity, totalAmount } }
            }
            return rejectWithValue(response.message);
        } catch (error) {
            const msg = error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng";
            message.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const updateItemQuantity = createAsyncThunk(
    "cart/updateQuantity",
    async ({ cartItemId, quantity }, { rejectWithValue }) => {
        try {
            const response = await cartService.updateItemQuantity(cartItemId, quantity);
            if (response.success) {
                return response;
            }
            return rejectWithValue(response.message);
        } catch (error) {
            const msg = error.response?.data?.message || "Lỗi khi cập nhật số lượng";
            message.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const removeItemFromCart = createAsyncThunk(
    "cart/removeItem",
    async (cartItemId, { rejectWithValue }) => {
        try {
            const response = await cartService.removeItem(cartItemId);
            if (response.success) {
                message.success("Đã xóa sản phẩm khỏi giỏ hàng");
                return response;
            }
            return rejectWithValue(response.message);
        } catch (error) {
            message.error("Không thể xóa sản phẩm");
            return rejectWithValue(error.response?.data?.message || "Lỗi xóa sản phẩm");
        }
    }
);

export const clearCart = createAsyncThunk(
    "cart/clear",
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartService.clearCart();
            if (response.success) {
                message.success("Đã làm trống giỏ hàng");
                return response;
            }
            return rejectWithValue(response.message);
        } catch (error) {
            message.error("Lỗi khi làm trống giỏ hàng");
            return rejectWithValue(error.response?.data?.message || "Lỗi làm trống giỏ hàng");
        }
    }
);

const initialState = {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    status: "idle", // 'idle' | 'loading' | 'failed'
    error: null,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        resetCartState: (state) => {
            state.items = [];
            state.totalQuantity = 0;
            state.totalAmount = 0;
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Cart
            .addCase(fetchCartItems.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchCartItems.fulfilled, (state, action) => {
                console.group("🛒 REDUX: fetchCartItems Fullfilled");
                console.log("Payload:", action.payload);
                state.status = "idle";
                state.items = action.payload.items || [];
                state.totalQuantity = action.payload.totalQuantity || 0;
                state.totalAmount = action.payload.totalAmount || 0;
                console.log("New State Items:", state.items);
                console.groupEnd();
            })
            .addCase(fetchCartItems.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Generic Loading Status for mutations
            .addMatcher(
                (action) => action.type.startsWith('cart/') && action.type.endsWith('/pending') && action.type !== 'cart/fetchItems/pending',
                (state) => {
                    state.status = "loading";
                }
            )
            // Mutation Fulfillment Handler (Direct State Update)
            .addMatcher(
                (action) => action.type.startsWith('cart/') && action.type.endsWith('/fulfilled') && action.type !== 'cart/fetchItems/fulfilled',
                (state, action) => {
                    console.group(`🛒 REDUX: Mutation ${action.type} Fullfilled`);
                    console.log("Payload:", action.payload);
                    
                    state.status = "idle";
                    // Correctly access data from payload.data.items as per requirement
                    const cartData = action.payload.data;
                    if (cartData) {
                        state.items = Array.isArray(cartData.items) ? cartData.items : [];
                        state.totalQuantity = cartData.totalQuantity || 0;
                        state.totalAmount = cartData.totalAmount || 0;
                    }
                    
                    console.log("Updated State Items:", state.items);
                    console.groupEnd();
                }
            )
            // Generic Error Handler
            .addMatcher(
                (action) => action.type.startsWith('cart/') && action.type.endsWith('/rejected'),
                (state, action) => {
                    state.status = "idle";
                    state.error = action.payload;
                    console.error("🛒 REDUX: Cart Action Failed", action.type, action.payload);
                }
            );
    },
});

export const { resetCartState } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items || [];
export const selectCartTotalQuantity = (state) => state.cart.totalQuantity || 0;
export const selectItemQuantity = (dishId) => (state) => {
    const items = state.cart.items || [];
    const item = items.find((i) => i.dish_id === dishId);
    return item ? item.quantity : 0;
};

export default cartSlice.reducer;


