import axios from "axios";

// Configure can exchange cookie (if still needed for other purposes)
axios.defaults.withCredentials = true;

// Create instance Axios for global config
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_SERVER_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Response interceptor for handling auth errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Clear local credentials on session expiry
            localStorage.removeItem("access_token");
            
            // Clear legacy token cookie
            const now = new Date().toUTCString();
            document.cookie = `token=; expires=${now}; path=/;`;

            // Redirect to login - only if not already on login page to avoid loops
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    },
);

// Request interceptor: Always fetch the latest token from localStorage
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

export default axiosInstance;
