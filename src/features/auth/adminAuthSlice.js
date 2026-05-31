import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import profileService from "@services/profileService";

const ROLES = {
    ADMIN: "admin",
    CUSTOMER: "customer"
};

const ADMIN_KEYS = {
    token: "admin_token",
    refreshToken: "admin_refresh_token",
    info: "admin_info"
};

const clearAdminStorage = () => {
    sessionStorage.removeItem(ADMIN_KEYS.token);
    sessionStorage.removeItem(ADMIN_KEYS.refreshToken);
    sessionStorage.removeItem(ADMIN_KEYS.info);
};

export const initializeAdminAuth = createAsyncThunk(
    "adminAuth/initialize",
    async (_, { rejectWithValue }) => {
        const token = sessionStorage.getItem(ADMIN_KEYS.token);

        if (!token) {
            return rejectWithValue("No admin token");
        }

        try {
            const response = await profileService.getProfile({
                headers: {
                    "x-auth-type": "admin"
                }
            });

            const admin = response.data.data;

            if (admin?.role?.toLowerCase() !== ROLES.ADMIN) {
                clearAdminStorage();
                return rejectWithValue("Invalid admin");
            }

            return {
                admin,
                token
            };

        } catch (error) {
            clearAdminStorage();
            return rejectWithValue("Admin session expired");
        }
    }
);

const initialState = {
    isAuthenticated: false,
    user: null,
    isInitialized: false,
    isLoading: false,
    error: null,
};

const adminAuthSlice = createSlice({
    name: "adminAuth",
    initialState,
    reducers: {
        loginAdmin: (state, action) => {
    const admin = action.payload.user;

    if (admin.role.toLowerCase() !== ROLES.ADMIN) {
        return;
    }

    state.isAuthenticated = true;
    state.user = admin;
    state.isInitialized = true;

    sessionStorage.setItem(ADMIN_KEYS.token, action.payload.token)
sessionStorage.setItem(ADMIN_KEYS.refreshToken, action.payload.refreshToken)
sessionStorage.setItem(ADMIN_KEYS.info, JSON.stringify(admin))
},
        logoutAdmin: (state) => {
    state.isAuthenticated = false;
    state.user = null;
    state.isInitialized = true;

    sessionStorage.removeItem(ADMIN_KEYS.token)
sessionStorage.removeItem(ADMIN_KEYS.refreshToken)
sessionStorage.removeItem(ADMIN_KEYS.info)
},
        setInitialized: (state) => {
            state.isInitialized = true;
        },
        updateAdmin: (state, action) => {
    if (state.user && action.payload) {
        state.user = {
            ...state.user,
            ...action.payload
        };

       sessionStorage.setItem(
    ADMIN_KEYS.info,
    JSON.stringify(state.user)
);
    }
}
    },
    extraReducers: (builder) => {
        builder
            .addCase(initializeAdminAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(initializeAdminAuth.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload?.admin || null;
                state.isInitialized = true;
                state.isLoading = false;
            })
            .addCase(initializeAdminAuth.rejected, (state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.isInitialized = true;
                state.isLoading = false;
            });
    },
});

export const { loginAdmin, logoutAdmin, setInitialized, updateAdmin } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
