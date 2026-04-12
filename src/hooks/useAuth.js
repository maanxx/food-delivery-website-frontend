import { useSelector, useDispatch } from "react-redux";
import { clearCookie, login, logout } from "@features/auth/authSlice";
import { resetChatState, clearConversations } from "@features/chat/chatSlice";

const useAuth = () => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const dispatch = useDispatch();

    const handleLogin = () => {
        dispatch(login());
    };

    const handleLogout = () => {
        dispatch(logout());
        // Clear chat state when logging out
        dispatch(resetChatState());
        console.log("🔄 Chat state reset on logout");
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
