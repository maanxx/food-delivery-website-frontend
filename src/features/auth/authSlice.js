import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
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
        },
        clearCookie: () => {
            const now = new Date().toUTCString();
            document.cookie = `token=; expires=${now}; path=/;`;
        },
    },
});

export const { login, logout, clearCookie } = authSlice.actions;
export default authSlice.reducer;
