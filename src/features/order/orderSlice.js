import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as orderService from "@services/orderService";

// ========== ASYNC THUNKS ==========

export const fetchMyOrders = createAsyncThunk(
    "order/fetchMyOrders",
    async (_, { rejectWithValue }) => {
        try {
            const response = await orderService.fetchMyOrders();
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Không thể tải danh sách đơn hàng");
        }
    }
);

export const createOrder = createAsyncThunk(
    "order/create",
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await orderService.createOrder(orderData);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Lỗi khi tạo đơn hàng");
        }
    }
);

export const fetchOrderDetails = createAsyncThunk(
    "order/fetchDetails",
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await orderService.fetchOrderById(orderId);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Không thể tải chi tiết đơn hàng");
        }
    }
);

// ========== INITIAL STATE ==========

const initialState = {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    // Socket reactivity fields
    byId: {},
    activeOrderIds: [],
};

// ========== HELPERS ==========
const TERMINAL_STATUSES = ["delivered", "cancelled"];
const isTerminal = (status) => TERMINAL_STATUSES.includes(status);

const syncActiveIds = (state) => {
    state.activeOrderIds = state.orders
        .filter(o => !isTerminal(o.status))
        .map(o => o.order_id);
};

// ========== SLICE ==========

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        orderStatusUpdated: (state, action) => {
            const { order_id, status } = action.payload;
            const order = state.orders.find(o => o.order_id === order_id);
            if (order) {
                order.status = status;
            }
            if (state.currentOrder && state.currentOrder.order_id === order_id) {
                state.currentOrder.status = status;
            }
            syncActiveIds(state);
        },
        clearOrders: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Fetch My Orders
            .addCase(fetchMyOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
                syncActiveIds(state);
            })
            .addCase(fetchMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
                // Prepend new order to list
                state.orders.unshift(action.payload);
                syncActiveIds(state);
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Details
            .addCase(fetchOrderDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { orderStatusUpdated, clearOrders } = orderSlice.actions;

// Selectors
export const selectOrders = (state) => state.order.orders;
export const selectCurrentOrder = (state) => state.order.currentOrder;
export const selectOrderLoading = (state) => state.order.loading;
export const selectOrderError = (state) => state.order.error;

export default orderSlice.reducer;
