import axios from "axios";

import { getCookie } from "@helpers/cookieHelper";

const token = getCookie("token");

// Configure can exchange cookie
axios.defaults.withCredentials = true;

axios.defaults.headers.common["Authorization"] = token ? `Bearer ${token}` : "";

// Create instance Axios for global config
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_SERVER_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// axiosInstance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//             window.location.href = "/login";
//         }
//         return Promise.reject(error);
//     },
// );

axiosInstance.interceptors.request.use(
    (config) => {
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

export default axiosInstance;
