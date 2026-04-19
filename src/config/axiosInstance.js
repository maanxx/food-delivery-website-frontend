import axios from "axios";

import { getCookie } from "@helpers/cookieHelper";

// Configure can exchange cookie
axios.defaults.withCredentials = true;

// Create instance Axios for global config
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_SERVER_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Clear token cookie when session expired
            const now = new Date().toUTCString();
            document.cookie = `token=; expires=${now}; path=/;`;

            // Redirect to login
            window.location.href = "/login";
        }
        return Promise.reject(error);
    },
);

axiosInstance.interceptors.request.use(
    (config) => {
        // 🔑 Get fresh token EVERY request (not just once at startup)
        const token = getCookie("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

export default axiosInstance;
