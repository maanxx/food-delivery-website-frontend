import axios from "axios";
import { toast } from "react-toastify";

const getAccessToken = () => sessionStorage.getItem("access_token") || localStorage.getItem("access_token");
const getRefreshToken = () => sessionStorage.getItem("refresh_token") || localStorage.getItem("refresh_token");
const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
};

const normalizeApiBaseUrl = (url) => (url || "").replace(/\/+$/, "").replace(/\/api$/, "");
const apiBaseUrl = normalizeApiBaseUrl(
    process.env.REACT_APP_API_URL || process.env.REACT_APP_SERVER_BASE_URL || "http://localhost:5678",
);

const axiosInstance = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    
    // Check if custom auth type was requested, then clean it up
    const authType = config.headers["x-auth-type"];
    delete config.headers["x-auth-type"];

    const isAdminRequest = authType === "admin" || config.url.includes("/api/admin") || window.location.pathname.startsWith("/admin");

    let token = null;
    if (isAdminRequest) {
        token = sessionStorage.getItem("admin_token") || localStorage.getItem("admin_token");
    } else {
        token = sessionStorage.getItem("customer_token") || localStorage.getItem("customer_token");
    }

    console.log("--- AXIOS REQUEST DEBUG ---");
    console.log("URL:", config.url);
    console.log("METHOD:", config.method);
    console.log("CONTEXT:", isAdminRequest ? "ADMIN" : "CUSTOMER");
    console.log("TOKEN PRESENT:", !!token);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("REQUEST HEADERS:", config.headers);

    return config;
}, (error) => {
    return Promise.reject(error);
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 429) {
            toast.error("Ban dang thao tac qua nhanh, vui long thu lai sau 1 phut");
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            
            // Determine context
            const isAdminRequest = originalRequest.url.includes("/api/admin") || window.location.pathname.startsWith("/admin");
            const tokenKey = isAdminRequest ? "admin_token" : "customer_token";
            const refreshKey = isAdminRequest ? "admin_refresh_token" : "customer_refresh_token";
            const redirectPath = isAdminRequest ? "/admin/login" : "/login";

            // If already refreshing, queue the pending requests so they don't simultaneously refresh
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = sessionStorage.getItem(refreshKey) || localStorage.getItem(refreshKey);

            if (!refreshToken) {
                console.log(`--- LOGOUT TRIGGERED: No refresh token for ${isAdminRequest ? 'Admin' : 'Customer'} ---`);
                localStorage.removeItem(tokenKey);
                localStorage.removeItem(refreshKey);
                localStorage.removeItem(isAdminRequest ? "admin_info" : "customer_info");
                sessionStorage.removeItem(tokenKey);
                sessionStorage.removeItem(refreshKey);
                sessionStorage.removeItem(isAdminRequest ? "admin_info" : "customer_info");
                
                if (window.location.pathname !== redirectPath) window.location.href = redirectPath;
                return Promise.reject(error);
            }

            console.log("--- REFRESH TOKEN USED ---");

            try {
                const { data } = await axios.post(`${apiBaseUrl}/api/auth/refresh`, {
                    refreshToken
                });

                if (data.success) {
                    console.log("--- TOKEN REFRESHED ---");
                    const newAccessToken = data.accessToken;
                    
                    // Store in the correct active storage type
                    const isPersistent = !!localStorage.getItem(refreshKey);
                    const storage = isPersistent ? localStorage : sessionStorage;
                    storage.setItem(tokenKey, newAccessToken);
                    
                    processQueue(null, newAccessToken);

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                console.log(`--- LOGOUT TRIGGERED: Refresh token failed or expired for ${isAdminRequest ? 'Admin' : 'Customer'} ---`);
                
                localStorage.removeItem(tokenKey);
                localStorage.removeItem(refreshKey);
                localStorage.removeItem(isAdminRequest ? "admin_info" : "customer_info");
                sessionStorage.removeItem(tokenKey);
                sessionStorage.removeItem(refreshKey);
                sessionStorage.removeItem(isAdminRequest ? "admin_info" : "customer_info");

                if (window.location.pathname !== redirectPath) window.location.href = redirectPath;
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
