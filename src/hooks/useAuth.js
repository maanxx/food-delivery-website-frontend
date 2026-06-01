import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "@auth/customerAuthSlice";
import { resetChatState } from "@features/chat/chatSlice";

const useAuth = () => {
    const isAuthenticated = useSelector(
        (state) => state?.customerAuth?.isAuthenticated ?? state?.auth?.isAuthenticated ?? false,
    );
    const dispatch = useDispatch();

    const handleLogin = (payload) => {
        dispatch(login(payload));
    };

    const handleLogout = () => {
        dispatch(logout());
        // Clear chat state when logging out
        dispatch(resetChatState());
        console.log("🔄 Chat state reset on logout");
    };

    return {
        isAuthenticated,
        login: handleLogin,
        logout: handleLogout,
    };
};

export default useAuth;
