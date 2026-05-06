import { useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import {
    addMessage,
    updateMessage,
    setTyping,
    setUserOnline,
    updateConversationList,
    moveConversationToTop,
    addConversation,
    loadConversations,
    setConversationTheme,
    setConversationMuteStatus,
} from "@features/chat/chatSlice";
import { orderStatusUpdated } from "@features/order/orderSlice";
import { toast } from "react-toastify";

let socketInstance = null;

const useWebSocket = () => {
    const dispatch = useDispatch();
    const socketRef = useRef(null);
    const conversationsRef = useRef(null);

    // Get conversations data to look up user names
    const conversations = useSelector((state) => state.chat.conversations.byId);
    const selectedConversationId = useSelector((state) => state.chat.conversations.selectedId);
    const currentUser = useSelector((state) => state.auth.user);
    const selectedConversationIdRef = useRef(null);

    // Create stable userId using useMemo
    const userId = useMemo(() => {
        return (
            currentUser?.id ||
            currentUser?.userId ||
            currentUser?.user_id ||
            currentUser?.sub ||
            null
        );
    }, [currentUser]);

    // Update ref whenever conversations change (without triggering re-mount)
    useEffect(() => {
        conversationsRef.current = conversations;
        selectedConversationIdRef.current = selectedConversationId;
    }, [conversations, selectedConversationId]);

    // Get token from localStorage
    const authToken = localStorage.getItem("access_token");

    // Initialize WebSocket connection
    useEffect(() => {
        if (!authToken || !userId) return;

        // Reuse existing connection
        if (socketInstance && socketInstance.connected) {
            socketRef.current = socketInstance;
            // Ensure websocket does not duplicate listeners or reconnect infinitely
            // Just re-join the personal room if the user changed
            socketInstance.emit("join_personal_room", { userId });
            return;
        }

        const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5678", {
            auth: {
                token: authToken,
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            transports: ["websocket", "polling"],
        });

        // ========== SOCKET EVENTS ==========

        // Connection events
        socket.on("connect", () => {
            console.log("✅ WebSocket connected", { socketId: socket.id });

            // Join personal room for user so they receive updates
            socket.emit("join_personal_room", { userId });
            console.log(`📍 Joined personal room: user:${userId}`);
        });

        socket.on("disconnect", () => {
            console.log("❌ WebSocket disconnected");
        });

        socket.on("connect_error", (error) => {
            console.error("WebSocket connection error:", error);
        });

        // Message events
        socket.on("new_message", (message) => {
            console.log("📨 New message from socket:", { message, senderId: message?.senderId });
            dispatch(addMessage({ conversationId: message.conversationId, message }));

            // Update conversation with latest message info
            const lastMessage = {
                messageId: message.messageId,
                content: message.content,
                type: message.type,
                senderName: message.senderName,
                senderAvatar: message.senderAvatar,
                createdAt: message.createdAt,
            };

            dispatch(
                updateConversationList({
                    conversationId: message.conversationId,
                    updates: {
                        lastMessage,
                        lastMessageTimestamp: message.createdAt || new Date().toISOString(),
                        lastMessageId: message.messageId,
                        lastMessageText: message.content,
                    },
                }),
            );
            dispatch(moveConversationToTop(message.conversationId));
        });

        socket.on("message_read", ({ conversationId, messageIds, readBy }) => {
            messageIds.forEach((msgId) => {
                dispatch(
                    updateMessage({
                        conversationId,
                        messageId: msgId,
                        updates: { status: "seen", seenBy: readBy },
                    }),
                );
            });
        });

        socket.on("message_edited", ({ conversationId, messageId, content, editedAt }) => {
            dispatch(updateMessage({ conversationId, messageId, updates: { content, editedAt } }));
        });

        socket.on("message_deleted", ({ conversationId, messageId }) => {
            dispatch(updateMessage({ conversationId, messageId, updates: { isDeleted: true } }));
        });

        socket.on("message_recalled", ({ conversationId, messageId }) => {
            dispatch(updateMessage({ conversationId, messageId, updates: { isRecalled: true } }));
        });

        // Typing indicators
        socket.on("user_typing", ({ conversationId, username }) => {
            let displayName = username;
            if (!displayName && conversationId && conversationsRef.current?.[conversationId]) {
                displayName = conversationsRef.current[conversationId].name;
            }
            if (!displayName) displayName = "User";

            dispatch(setTyping({ conversationId, users: [displayName] }));
        });

        socket.on("user_stop_typing", ({ conversationId }) => {
            dispatch(setTyping({ conversationId, users: [] }));
        });

        // User presence
        socket.on("user_online", ({ userId, status }) => {
            dispatch(setUserOnline({ userId, status, lastSeen: null }));
        });

        socket.on("user_offline", ({ userId, lastSeen }) => {
            dispatch(setUserOnline({ userId, status: "offline", lastSeen }));
        });

        // Conversation updates
        socket.on("conversation_updated", (data) => {
            const { conversationId, isMuted, ...updates } = data;
            if (!conversationId) return;

            console.log(`[WebSocket] Conversation ${conversationId} updated. Muted: ${isMuted}`);

            const existingConversation = conversationsRef.current?.[conversationId];
            if (existingConversation) {
                dispatch(updateConversationList({ conversationId, updates }));
                dispatch(moveConversationToTop(conversationId));
            } else {
                const newConversation = {
                    conversationId,
                    type: "1to1",
                    name: updates.lastMessage?.senderName || "Unknown User",
                    avatarPath: updates.lastMessage?.senderAvatar || null,
                    createdAt: new Date().toISOString(),
                    ...updates,
                };
                dispatch(addConversation(newConversation));
                dispatch(moveConversationToTop(conversationId));
            }

            // If not muted and not currently looking at this conversation, show notification
            if (!isMuted && updates.unreadCount > 0 && selectedConversationIdRef.current !== conversationId) {
                console.log(`[Notification] New message in ${conversationId}. Playing sound...`);
                if (updates.lastMessage) {
                    toast.info(`New message from ${updates.lastMessage.senderName || 'someone'}`);
                }
            }
        });

        socket.on("new_conversation", (conversation) => {
            dispatch(addConversation(conversation));
            dispatch(moveConversationToTop(conversation.conversationId));
        });

        socket.on("member_added_to_new_group", (data) => {
            dispatch(loadConversations());
        });

        // Chat customization events
        socket.on("notification_settings_updated", (data) => {
            dispatch(setConversationMuteStatus(data));
        });

        socket.on("theme_updated", (data) => {
            dispatch(setConversationTheme(data));
        });

        // Order realtime updates - Properly wiring orderStatusUpdated and toast
        socket.on("order_updated", (data) => {
            console.log("📦 Order updated:", data);
            if (data.order_id && data.order_status) {
                dispatch(orderStatusUpdated({ order_id: data.order_id, status: data.order_status }));
                toast.info(`Order #${data.order_id.substring(0, 8)} status: ${data.order_status}`);
            }
        });

        socketInstance = socket;
        socketRef.current = socket;

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("connect_error");
            socket.off("new_message");
            socket.off("message_read");
            socket.off("message_edited");
            socket.off("message_deleted");
            socket.off("message_recalled");
            socket.off("user_typing");
            socket.off("user_stop_typing");
            socket.off("user_online");
            socket.off("user_offline");
            socket.off("conversation_updated");
            socket.off("new_conversation");
            socket.off("member_added_to_new_group");
            socket.off("notification_settings_updated");
            socket.off("theme_updated");
            socket.off("order_updated");
        };
    }, [authToken, userId, dispatch]);

    // ========== EMIT FUNCTIONS ==========

    const sendMessage = useCallback(
        ({
            conversationId,
            content,
            type = "text",
            attachments = [],
            mentions = [],
            replyToId = null,
            temporaryId,
        }) => {
            socketRef.current?.emit("message:send", {
                conversationId,
                content,
                type,
                attachments,
                mentions,
                replyToId,
                temporaryId,
            });
        },
        [],
    );

    const markAsRead = useCallback(({ conversationId, messageIds }) => {
        socketRef.current?.emit("message:read", {
            conversationId,
            messageIds,
        });
    }, []);

    const emitTyping = useCallback(({ conversationId, isTyping }) => {
        if (isTyping) {
            socketRef.current?.emit("typing", { conversationId });
        } else {
            socketRef.current?.emit("stop_typing", { conversationId });
        }
    }, []);

    const updateStatus = useCallback((status) => {
        socketRef.current?.emit("user:status", { status });
    }, []);

    const joinConversation = useCallback((conversationId) => {
        socketRef.current?.emit("join_conversation", conversationId);
    }, []);

    const leaveConversation = useCallback((conversationId) => {
        socketRef.current?.emit("leave_conversation", conversationId);
    }, []);

    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketInstance = null;
        }
    }, []);

    return {
        socket: socketRef.current,
        isConnected: socketRef.current?.connected || false,
        joinConversation,
        leaveConversation,
        sendMessage,
        markAsRead,
        emitTyping,
        updateStatus,
        disconnect: disconnectSocket,
    };
};

export default useWebSocket;
