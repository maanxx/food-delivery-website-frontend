import { createSlice } from "@reduxjs/toolkit";

// ========== CONSTANTS ==========

const TERMINAL_STATUSES = ["delivered", "cancelled"];

// ========== INITIAL STATE ==========

const initialState = {
    // Lightweight order summaries keyed by order_id
    byId: {},
    // IDs of non-terminal orders (pending / confirmed / delivering)
    activeOrderIds: [],
    // Timestamp of most recent socket event (for UI reactivity)
    lastUpdate: null,
};

// ========== HELPERS ==========

/**
 * Check if a status is terminal (order is finished).
 */
const isTerminal = (status) => TERMINAL_STATUSES.includes(status);

/**
 * Manage activeOrderIds — add if non-terminal, remove if terminal.
 */
const syncActiveIds = (state, orderId, status) => {
    const idx = state.activeOrderIds.indexOf(orderId);
    if (isTerminal(status)) {
        // Remove from active list
        if (idx !== -1) {
            state.activeOrderIds.splice(idx, 1);
        }
    } else {
        // Add to active list if not already present
        if (idx === -1) {
            state.activeOrderIds.push(orderId);
        }
    }
};

/**
 * Normalize socket/API payload into the slice's summary shape.
 */
const normalizeSummary = (payload) => ({
    order_id: payload.order_id,
    status: payload.status || payload.order_status,
    total_amount: payload.total_amount ?? 0,
    brand: payload.brand || "Eatsy",
    estimated_time: payload.estimated_time ?? null,
    items_preview: payload.items_preview || [],
    updatedAt: payload.updatedAt || new Date().toISOString(),
});

// ========== SLICE ==========

const orderSlice = createSlice({
    name: "order",
    initialState,

    reducers: {
        /**
         * Upsert an order summary from a socket `order_updated` event.
         * Merges new data with existing data (if any) so partial updates work.
         */
        orderStatusUpdated: (state, action) => {
            const data = normalizeSummary(action.payload);
            const orderId = data.order_id;

            state.byId[orderId] = {
                ...(state.byId[orderId] || {}),
                ...data,
            };

            syncActiveIds(state, orderId, data.status);
            state.lastUpdate = data.updatedAt;
        },

        /**
         * Hydrate a single order into the slice from an API fetch.
         * Used when OrderSuccess page loads — ensures selectors work
         * before the first socket event arrives.
         */
        seedOrder: (state, action) => {
            const data = normalizeSummary(action.payload);
            const orderId = data.order_id;

            // Only seed if not already present or if API data is newer
            if (!state.byId[orderId]) {
                state.byId[orderId] = data;
            } else {
                // Preserve socket-delivered status (more recent) over API data
                state.byId[orderId] = {
                    ...data,
                    ...state.byId[orderId],
                };
            }

            syncActiveIds(state, orderId, state.byId[orderId].status);
        },

        /**
         * Batch-hydrate multiple orders from API (ProfileOrders page load).
         */
        seedOrders: (state, action) => {
            const orders = action.payload;
            if (!Array.isArray(orders)) return;

            orders.forEach((order) => {
                const data = normalizeSummary(order);
                const orderId = data.order_id;

                if (!state.byId[orderId]) {
                    state.byId[orderId] = data;
                }
                syncActiveIds(state, orderId, data.status);
            });
        },

        /**
         * Reset state on logout.
         */
        clearOrders: () => initialState,
    },
});

// ========== ACTIONS ==========

export const { orderStatusUpdated, seedOrder, seedOrders, clearOrders } = orderSlice.actions;

// ========== SELECTORS ==========

/** Get the status string for a specific order, or null. */
export const selectOrderStatus = (orderId) => (state) =>
    state.order.byId[orderId]?.status ?? null;

/** Get the full summary object for a specific order, or null. */
export const selectOrderSummary = (orderId) => (state) =>
    state.order.byId[orderId] ?? null;

/** Get all non-terminal (active) order summaries. */
export const selectActiveOrders = (state) =>
    state.order.activeOrderIds.map((id) => state.order.byId[id]).filter(Boolean);

/** Check if there are any active orders (for badge/indicator). */
export const selectHasActiveOrders = (state) =>
    state.order.activeOrderIds.length > 0;

/** Get the timestamp of the most recent socket update. */
export const selectLastOrderUpdate = (state) =>
    state.order.lastUpdate;

export default orderSlice.reducer;
