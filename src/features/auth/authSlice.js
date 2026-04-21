import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import profileService from "@services/profileService";

export const initializeAuth = createAsyncThunk(
    "auth/initialize",
    async (_, { dispatch, rejectWithValue }) => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            return rejectWithValue("No token found");
        }

        try {
            const response = await profileService.getProfile();
            if (response.data && response.data.success) {
                // Return payload in a structure the reducer expects
                return { user: response.data.data, token };
            }
            return rejectWithValue("Session invalid");
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
            }
            return rejectWithValue(error.response?.data?.message || "Initialization failed");
        }
    }
);

const initialState = {
    isAuthenticated: false,
    user: null,
    isInitialized: false, // Prevents premature redirect
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            if (!action.payload) return;

            state.isAuthenticated = true;
            // SAFE ACCESS: Support both { accessToken, user } and direct user object
            state.user = action.payload?.user || action.payload || null;
            state.isInitialized = true;
            
            const tokenSource = action.payload?.token || action.payload?.accessToken;
            const refreshSource = action.payload?.refreshToken;
            
            if (tokenSource) {
                localStorage.setItem("access_token", tokenSource);
            }
            if (refreshSource) {
                localStorage.setItem("refresh_token", refreshSource);
            }

            // ✅ PRIORITY 6: Frontend Debug Logs
            console.log("--- AUTH LOGIN DEBUG ---");
            console.log("USER:", state.user);
            console.log("ACCESS_TOKEN:", tokenSource);
            console.log("REFRESH_TOKEN:", refreshSource);
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.isInitialized = true;
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            console.log("--- USER LOGGED OUT ---");
        },
        setInitialized: (state) => {
            state.isInitialized = true;
        },
        updateUser: (state, action) => {
            if (state.user && action.payload) {
                state.user = { ...state.user, ...action.payload };
                console.log("--- AUTH USER SYNCED ---", state.user);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(initializeAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                // SAFE ACCESS
                state.user = action.payload?.user || null;
                state.isInitialized = true;
                state.isLoading = false;
            })
            .addCase(initializeAuth.rejected, (state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.isInitialized = true; // Still initialized even if failed
                state.isLoading = false;
            });
    },
});

export const { login, logout, setInitialized, updateUser } = authSlice.actions;
export default authSlice.reducer;
