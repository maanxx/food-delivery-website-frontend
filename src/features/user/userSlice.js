import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import profileService from "../../services/profileService";
import { updateUser } from "../auth/authSlice";
import { message } from "antd";

export const updateUserProfile = createAsyncThunk(
    "user/updateProfile",
    async (formData, { rejectWithValue, dispatch }) => {
        try {
            const response = await profileService.updateProfile(formData);
            const freshUser = response.data.data;
            
            // Sync with global auth state (Header, Sidebar, etc)
            dispatch(updateUser(freshUser));
            
            return freshUser;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Cập nhật hồ sơ thất bại";
            message.error(errorMsg);
            return rejectWithValue(errorMsg);
        }
    }
);

export const updateUserAvatar = createAsyncThunk(
    "user/updateAvatar",
    async (file, { rejectWithValue, dispatch }) => {
        try {
            const formData = new FormData();
            formData.append("avatar", file);
            const response = await profileService.updateProfile(formData);
            const freshUser = response.data.data;
            dispatch(updateUser(freshUser));
            return freshUser;
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Cập nhật ảnh đại diện thất bại";
            message.error(errorMsg);
            return rejectWithValue(errorMsg);
        }
    }
);

const initialState = {
    loading: false,
    avatarLoading: false,
    error: null,
    success: false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        resetState: (state) => {
            state.loading = false;
            state.avatarLoading = false;
            state.error = null;
            state.success = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Profile Info Update
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateUserProfile.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
                message.success("Cập nhật hồ sơ thành công!");
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Avatar Update
            .addCase(updateUserAvatar.pending, (state) => {
                state.avatarLoading = true;
                state.error = null;
            })
            .addCase(updateUserAvatar.fulfilled, (state) => {
                state.avatarLoading = false;
                message.success("Cập nhật ảnh đại diện thành công!");
            })
            .addCase(updateUserAvatar.rejected, (state, action) => {
                state.avatarLoading = false;
                state.error = action.payload;
            });
    },
});

export const { resetState } = userSlice.actions;
export default userSlice.reducer;
