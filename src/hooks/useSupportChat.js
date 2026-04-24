import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import {
    pushNewMessage,
    updateConversationPreview,
    setIsTyping,
    updateConversationStatus,
} from "@features/supportChat/supportChatSlice";

// ─────────────────────────────────────────────────────────────
// Biến singleton để tái sử dụng kết nối socket giữa các lần render
// QUAN TRỌNG: Không tạo kết nối mới nếu đã có
// ─────────────────────────────────────────────────────────────
let supportSocketInstance = null;

/**
 * Custom hook quản lý toàn bộ logic Socket.io cho Support Chat.
 *
 * NGUYÊN TẮC AN TOÀN:
 * - Đây là file hoàn toàn MỚI, KHÔNG đụng vào useWebSocket.js
 * - Kết nối trực tiếp tới server Socket.io đang chạy (cùng port)
 * - Dùng events riêng có prefix 'support:' để tránh xung đột
 *
 * @param {string|null} activeConversationId - ID room cần join (null nếu chưa chọn)
 */
const useSupportChat = (activeConversationId = null) => {
    const dispatch = useDispatch();
    const socketRef = useRef(null);

    // Lấy token từ localStorage để xác thực socket
    const authToken = localStorage.getItem("access_token");

    // ─── Khởi tạo Socket và lắng nghe events ───────────────────
    useEffect(() => {
        if (!authToken) return;

        // Tái sử dụng kết nối nếu đã có và còn online
        if (supportSocketInstance && supportSocketInstance.connected) {
            socketRef.current = supportSocketInstance;
        } else {
            // Tạo kết nối mới tới root namespace (cùng server với useWebSocket)
            const socket = io(
                process.env.REACT_APP_SOCKET_URL || "http://localhost:5678",
                {
                    auth: { token: authToken },
                    reconnection: true,
                    reconnectionDelay: 1000,
                    transports: ["websocket", "polling"],
                }
            );

            socket.on("connect", () => {
                console.log("✅ [Support Socket] Connected:", socket.id);
            });

            socket.on("connect_error", (err) => {
                console.error("❌ [Support Socket] Connection error:", err.message);
            });

            supportSocketInstance = socket;
            socketRef.current = socket;
        }

        const socket = socketRef.current;

        // ── Lắng nghe tin nhắn mới đến từ server ──────────────────
        const handleNewMessage = (message) => {
            console.log("📩 [Support] Nhận tin nhắn mới:", message);
            dispatch(
                pushNewMessage({
                    conversationId: message.conversationId,
                    message,
                })
            );
        };

        // ── Cập nhật preview conversation trong danh sách (Admin) ──
        const handleConversationUpdated = (data) => {
            dispatch(
                updateConversationPreview({
                    conversationId: data.conversationId,
                    lastMessage: data.lastMessage,
                    unreadByAdmin: data.unreadByAdmin,
                })
            );
        };

        // ── Typing indicator ───────────────────────────────────────
        const handleDisplayTyping = () => {
            dispatch(setIsTyping(true));
            // Tự động tắt sau 3 giây nếu không có sự kiện tiếp theo
            setTimeout(() => dispatch(setIsTyping(false)), 3000);
        };

        const handleHideTyping = () => {
            dispatch(setIsTyping(false));
        };

        const handleClosed = (data) => {
            dispatch(updateConversationStatus({ conversationId: data.conversationId, status: "closed" }));
        };

        const handleReopened = (data) => {
            dispatch(updateConversationStatus({ conversationId: data.conversationId, status: "open" }));
        };

        // Đăng ký event listeners
        socket.on("support:new_message", handleNewMessage);
        socket.on("support:conversation_updated", handleConversationUpdated);
        socket.on("support:display_typing", handleDisplayTyping);
        socket.on("support:hide_typing", handleHideTyping);
        socket.on("support:conversation_closed", handleClosed);
        socket.on("support:conversation_reopened", handleReopened);

        return () => {
            // Chỉ gỡ listener, KHÔNG ngắt kết nối (giữ kết nối sống)
            socket.off("support:new_message", handleNewMessage);
            socket.off("support:conversation_updated", handleConversationUpdated);
            socket.off("support:display_typing", handleDisplayTyping);
            socket.off("support:hide_typing", handleHideTyping);
            socket.off("support:conversation_closed", handleClosed);
            socket.off("support:conversation_reopened", handleReopened);
        };
    }, [authToken, dispatch]);

    // ─── Auto join / leave room khi activeConversationId thay đổi ──
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket || !activeConversationId) return;

        // Tham gia room của conversation này
        socket.emit("support:join", activeConversationId);
        console.log(`🚪 [Support] Joined room: support_conv_${activeConversationId}`);

        return () => {
            // Rời room khi component unmount hoặc đổi conversation
            socket.emit("support:leave", activeConversationId);
        };
    }, [activeConversationId]);

    // ─── Hàm emit ──────────────────────────────────────────────

    /**
     * Tham gia vào room của 1 conversation
     */
    const joinRoom = useCallback((conversationId) => {
        socketRef.current?.emit("support:join", conversationId);
    }, []);

    /**
     * Emit typing indicator tới room
     */
    const sendTyping = useCallback((conversationId) => {
        socketRef.current?.emit("support:typing", { conversationId });
    }, []);

    /**
     * Emit dừng typing
     */
    const stopTyping = useCallback((conversationId) => {
        socketRef.current?.emit("support:stop_typing", { conversationId });
    }, []);

    /**
     * Ngắt kết nối socket (dùng khi logout)
     */
    const disconnect = useCallback(() => {
        if (supportSocketInstance) {
            supportSocketInstance.disconnect();
            supportSocketInstance = null;
        }
    }, []);

    return {
        joinRoom,
        sendTyping,
        stopTyping,
        disconnect,
        isConnected: socketRef.current?.connected || false,
    };
};

export default useSupportChat;
