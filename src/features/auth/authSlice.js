import { createSlice } from "@reduxjs/toolkit";
import { getCookie } from "@helpers/cookieHelper";

const initialState = {
    isAuthenticated: !!getCookie("token"), // Check token from cookie
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state) => {
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            // Clear token cookie when logout
            const now = new Date().toUTCString();
            document.cookie = `token=; expires=${now}; path=/;`;
        },
        clearCookie: () => {
            const now = new Date().toUTCString();
            document.cookie = `token=; expires=${now}; path=/;`;
        },
    },
});

export const { login, logout, clearCookie } = authSlice.actions;
export default authSlice.reducer;
