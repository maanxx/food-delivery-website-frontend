import { useSelector, useDispatch } from "react-redux";

import { clearCookie, login, logout } from "@features/auth/authSlice";
const useAuth = () => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const dispatch = useDispatch();

    const handleLogin = () => {
        dispatch(login());
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    const handleClearCookie = () => {
        dispatch(clearCookie());
    };

    return {
        isAuthenticated,
        login: handleLogin,
        logout: handleLogout,
        clearCookie: handleClearCookie,
    };
};

export default useAuth;
