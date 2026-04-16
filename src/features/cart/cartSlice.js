import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as cartService from "@services/cartService";
import { toast } from "react-toastify";

/**
 * Thunks for Cart Mutations
 * Each mutation (add, update, remove, clear) follows with a re-fetch
 * to ensure the backend remains the single source of truth.
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

export const addItemToCart = createAsyncThunk(
    "cart/addItem",
    async ({ dish_id, quantity }, { dispatch, rejectWithValue }) => {
        try {
            const response = await cartService.addToCart(dish_id, quantity);
            if (response.success) {
                toast.success("Đã thêm món vào giỏ hàng!");
                dispatch(fetchCartItems());
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error) {
            const msg = error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const updateItemQuantity = createAsyncThunk(
    "cart/updateQuantity",
    async ({ cartItemId, quantity }, { dispatch, rejectWithValue }) => {
        try {
            const response = await cartService.updateItemQuantity(cartItemId, quantity);
            if (response.success) {
                dispatch(fetchCartItems());
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error) {
            const msg = error.response?.data?.message || "Lỗi khi cập nhật số lượng";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const removeItemFromCart = createAsyncThunk(
    "cart/removeItem",
    async (cartItemId, { dispatch, rejectWithValue }) => {
        try {
            const response = await cartService.removeItem(cartItemId);
            if (response.success) {
                toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
                dispatch(fetchCartItems());
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error) {
            toast.error("Không thể xóa sản phẩm");
            return rejectWithValue(error.response?.data?.message || "Lỗi xóa sản phẩm");
        }
    }
);

export const clearCart = createAsyncThunk(
    "cart/clear",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await cartService.clearCart();
            if (response.success) {
                toast.success("Đã làm trống giỏ hàng");
                dispatch(fetchCartItems());
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error) {
            toast.error("Lỗi khi làm trống giỏ hàng");
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
                state.status = "idle";
                state.items = action.payload.items;
                state.totalQuantity = action.payload.totalQuantity;
                state.totalAmount = action.payload.totalAmount;
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
            .addMatcher(
                (action) => action.type.startsWith('cart/') && action.type.endsWith('/rejected') && action.type !== 'cart/fetchItems/rejected',
                (state, action) => {
                    state.status = "idle";
                    state.error = action.payload;
                }
            );
    },
});

export const { resetCartState } = cartSlice.actions;
export default cartSlice.reducer;
