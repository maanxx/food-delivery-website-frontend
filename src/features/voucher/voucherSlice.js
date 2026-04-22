// NEW
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import voucherService from "../../services/voucherService";

export const getVouchers = createAsyncThunk(
    "voucher/getVouchers",
    async (_, { rejectWithValue }) => {
        try {
            const res = await voucherService.getVouchers();
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch vouchers");
        }
    }
);

const initialState = {
    vouchers: [],
    loading: false,
    error: null,
};

const voucherSlice = createSlice({
    name: "voucher",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getVouchers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getVouchers.fulfilled, (state, action) => {
                state.loading = false;
                state.vouchers = action.payload;
            })
            .addCase(getVouchers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default voucherSlice.reducer;
