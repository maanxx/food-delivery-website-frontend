import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import profileService from "@services/profileService";
import { fetchAddresses } from "@features/address/addressSlice";

const ROLES = {
    ADMIN: "admin",
    CUSTOMER: "customer"
};

const CUSTOMER_KEYS = {
    token: "customer_token",
    refreshToken: "customer_refresh_token",
    info: "customer_info"
};

const getCustomerStorage = () => {
    if (localStorage.getItem(CUSTOMER_KEYS.token)) {
        return localStorage;
    }

    if (sessionStorage.getItem(CUSTOMER_KEYS.token)) {
        return sessionStorage;
    }

    return localStorage;
};

const clearCustomerStorage = () => {
    [localStorage, sessionStorage].forEach((storage) => {
        storage.removeItem(CUSTOMER_KEYS.token);
        storage.removeItem(CUSTOMER_KEYS.refreshToken);
        storage.removeItem(CUSTOMER_KEYS.info);
    });
};

export const initializeAuth = createAsyncThunk(
    "customerAuth/initialize",
    async (_, { dispatch, rejectWithValue }) => {
        const token = localStorage.getItem(CUSTOMER_KEYS.token) || sessionStorage.getItem(CUSTOMER_KEYS.token);
        if (!token) {
            return rejectWithValue("No token found");
        }

        try {
            // Fetch profile using customer token context
            const response = await profileService.getProfile({ headers: { "x-auth-type": "customer" } });
            if (!response?.data?.success) {
                throw new Error("Invalid session");
            }
                const user = response.data.data;
                // Reject Admin role from customer session
                if (user?.role?.toLowerCase() === ROLES.ADMIN) {
                    clearCustomerStorage();
                    return rejectWithValue("Admin users must use admin portal");
                }

                // Ensure fresh addresses are loaded after successful auth sync
                if (user?.role?.toLowerCase() === ROLES.CUSTOMER) {
                    dispatch(fetchAddresses());
                }
                 const currentStorage =
                localStorage.getItem(CUSTOMER_KEYS.token)
                    ? localStorage
                    : sessionStorage;

            currentStorage.setItem(
                CUSTOMER_KEYS.info,
                JSON.stringify(user)
            );

            return {
                user,
                token
            };
        } catch (error) {
            clearCustomerStorage();
            return rejectWithValue(
                error.response?.data?.message || "Session expired"
            );
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

const customerAuthSlice = createSlice({
    name: "customerAuth",
    initialState,
    reducers: {
        login: (state, action) => {
            if (!action.payload) return;

            const user = action.payload?.user || action.payload;
            const token = action.payload?.token || action.payload?.accessToken;
            const refreshToken = action.payload?.refreshToken;
            const rememberMe = action.payload?.rememberMe ?? false;

            state.isAuthenticated = true;
            state.user = user;
            state.isInitialized = true;
            state.error = null;

            const targetStorage = rememberMe
                ? localStorage
                : sessionStorage;

            const oppositeStorage = rememberMe
                ? sessionStorage
                : localStorage;

            if (token) {
                targetStorage.setItem(CUSTOMER_KEYS.token, token);
            }
            if (refreshToken) {
                targetStorage.setItem(
                    CUSTOMER_KEYS.refreshToken,
                    refreshToken
                );
            }

            if (user) {
                targetStorage.setItem(
                    CUSTOMER_KEYS.info,
                    JSON.stringify(user)
                );
            }

            oppositeStorage.removeItem(CUSTOMER_KEYS.token);
            oppositeStorage.removeItem(CUSTOMER_KEYS.refreshToken);
            oppositeStorage.removeItem(CUSTOMER_KEYS.info);
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.isInitialized = true;
            
            clearCustomerStorage();
        },
        setInitialized: (state) => {
            state.isInitialized = true;
        },
       updateUser: (state, action) => {
            if (!state.user || !action.payload) return;

            state.user = {
                ...state.user,
                ...action.payload
            };

            const storage = getCustomerStorage();

            storage.setItem(
                CUSTOMER_KEYS.info,
                JSON.stringify(state.user)
            );
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(initializeAuth.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload?.user || null;
                state.isInitialized = true;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(initializeAuth.rejected, (state, action) => {
                state.isAuthenticated = false;
                state.user = null;
                state.isInitialized = true;
                state.isLoading = false;
                state.error = action.payload || null;
            });
    },
});

export const { login, logout, setInitialized, updateUser } = customerAuthSlice.actions;
export default customerAuthSlice.reducer;
