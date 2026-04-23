// NEW
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import addressService from "../../services/addressService";
import { message } from "antd";

export const fetchAddresses = createAsyncThunk(
    "address/fetchAddresses",
    async (_, { rejectWithValue }) => {
        try {
            const res = await addressService.getAddresses();
            return res.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch addresses");
        }
    }
);

export const addAddress = createAsyncThunk(
    "address/addAddress",
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const res = await addressService.createAddress(data);
            message.success("Address added successfully");
            dispatch(fetchAddresses());
            return res.data.data;
        } catch (error) {
            message.error("Failed to add address");
            return rejectWithValue(error.response?.data?.message || "Failed to add address");
        }
    }
);

export const updateAddress = createAsyncThunk(
    "address/updateAddress",
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const res = await addressService.updateAddress(id, data);
            message.success("Cập nhật địa chỉ thành công!");
            dispatch(fetchAddresses());
            return res.data.data;
        } catch (error) {
            message.error("Lỗi khi cập nhật địa chỉ!");
            return rejectWithValue(error.response?.data?.message || "Failed to update address");
        }
    }
);

export const deleteAddress = createAsyncThunk(
    "address/deleteAddress",
    async (id, { rejectWithValue, getState }) => {
        try {
            await addressService.deleteAddress(id);
            message.success("Đã xóa địa chỉ!");
            return id;
        } catch (error) {
            message.error("Không thể xóa địa chỉ!");
            return rejectWithValue({ id, error: error.response?.data?.message });
        }
    }
);

export const setDefaultAddress = createAsyncThunk(
    "address/setDefaultAddress",
    async (id, { rejectWithValue }) => {
        try {
            await addressService.setDefaultAddress(id);
            message.success("Đã đặt làm địa chỉ mặc định!");
            return id;
        } catch (error) {
            message.error("Lỗi khi thay đổi địa chỉ mặc định!");
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

const initialState = {
    addresses: [],
    loading: false,
    error: null,
    loadingMap: {}, // [id]: { deleting: bool, settingDefault: bool }
    previousAddresses: null, // For rollbacks
};

const addressSlice = createSlice({
    name: "address",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchAddresses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses = action.payload;
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Add Address
            .addCase(addAddress.fulfilled, (state, action) => {
                const newAddress = action.payload;
                if (newAddress) {
                    if (state.addresses.length === 0) {
                        newAddress.is_default = true;
                    }
                    state.addresses.push(newAddress);
                }
            })

            // Delete
            .addCase(deleteAddress.pending, (state, action) => {
                const id = action.meta.arg;
                state.previousAddresses = [...state.addresses];
                state.loadingMap[id] = { ...state.loadingMap[id], deleting: true };
                
                const deletedAddress = state.addresses.find(a => (a.address_id || a.addressId) === id);
                state.addresses = state.addresses.filter(a => (a.address_id || a.addressId) !== id);

                // Edge case: if deleted was default, set first available as new default (optimistically)
                if (deletedAddress?.is_default && state.addresses.length > 0) {
                    state.addresses[0].is_default = true;
                }
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                const id = action.payload;
                delete state.loadingMap[id];
                state.previousAddresses = null;
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                const { id } = action.payload;
                state.addresses = state.previousAddresses; // Rollback
                state.previousAddresses = null;
                delete state.loadingMap[id];
            })

            // Set Default
            .addCase(setDefaultAddress.pending, (state, action) => {
                const id = action.meta.arg;
                state.previousAddresses = [...state.addresses];
                state.loadingMap[id] = { ...state.loadingMap[id], settingDefault: true };

                state.addresses = state.addresses.map(addr => ({
                    ...addr,
                    is_default: (addr.address_id || addr.addressId) === id
                }));
            })
            .addCase(setDefaultAddress.fulfilled, (state, action) => {
                const id = action.payload;
                delete state.loadingMap[id];
                state.previousAddresses = null;
            })
            .addCase(setDefaultAddress.rejected, (state) => {
                state.addresses = state.previousAddresses; // Rollback
                state.previousAddresses = null;
                state.loadingMap = {}; // Reset loading map for safety on catastrophic failure
            });
    },
});

export const { clearError } = addressSlice.actions;
export default addressSlice.reducer;
