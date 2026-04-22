import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_SERVER_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    // ✅ DEBUG LOGGING
    console.log("--- AXIOS REQUEST DEBUG ---");
    console.log("URL:", config.url);
    console.log("METHOD:", config.method);
    console.log("TOKEN PRESENT:", !!token);

    config.headers = config.headers || {};

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

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            
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
            const refreshToken = localStorage.getItem("refresh_token");

            if (!refreshToken) {
                console.log("--- LOGOUT TRIGGERED: No refresh token ---");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                if (window.location.pathname !== "/login") window.location.href = "/login";
                return Promise.reject(error);
            }

            console.log("--- REFRESH TOKEN USED ---");

            try {
                // Must use standard axios to avoid recursive interceptor loops
                const { data } = await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/auth/refresh`, {
                    refreshToken
                });

                if (data.success) {
                    console.log("--- TOKEN REFRESHED ---");
                    const newAccessToken = data.accessToken;
                    localStorage.setItem("access_token", newAccessToken);
                    
                    // Resolve queued requests
                    processQueue(null, newAccessToken);
                    
                    // Proceed with original request
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                console.log("--- LOGOUT TRIGGERED: Refresh token failed or expired ---");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                if (window.location.pathname !== "/login") window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
