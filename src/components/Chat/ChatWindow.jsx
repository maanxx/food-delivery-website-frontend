import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Avatar } from "antd";
import styles from "./ChatWindow.module.css";
import { getUserInfo } from "@helpers/cookieHelper";
import { getFirstLetterOfEachWord } from "@helpers/stringHelper";

import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import EmptyChat from "./EmptyChat";
import { loadMessages, selectMessages, markMessagesAsRead } from "@features/chat/chatSlice";
import useWebSocket from "@hooks/useWebSocket";

const ChatWindow = () => {
    const { conversationId } = useParams();
    const dispatch = useDispatch();
    const { socket, isConnected, markAsRead } = useWebSocket();

    const messages = useSelector(selectMessages(conversationId));
    const conversation = useSelector((state) => state.chat.conversations.byId[conversationId]);
    const typingUsers = useSelector((state) => state.chat.typing[conversationId] || []);

    // Get currentUserId from JWT token instead of Redux
    const userInfo = getUserInfo();
    const currentUserId = userInfo?.sub || userInfo?.user_id || userInfo?.userId || userInfo?.id;

    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const messagesEndRef = useRef(null);
    const messageContainerRef = useRef(null);

    // Load messages
    useEffect(() => {
        if (!conversationId) {
            console.warn("⚠️ No conversationId provided to ChatWindow");
            return;
        }

        setIsLoadingMessages(true);
        setLoadError(null);
        dispatch(loadMessages({ conversationId, limit: 50 }))
            .unwrap()
            .catch((error) => {
                console.error("Failed to load messages:", error);
                setLoadError(error);
            })
            .finally(() => setIsLoadingMessages(false));
    }, [conversationId, dispatch]);

    // Join conversation room
    useEffect(() => {
        if (!isConnected || !conversationId) return;

        socket?.emit("join_conversation", conversationId);

        return () => {
            socket?.emit("leave_conversation", conversationId);
        };
    }, [conversationId, socket, isConnected]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto mark messages as read
    useEffect(() => {
        if (!isConnected || !conversationId || !messages.length) return;

        const unreadMessages = messages
            .filter((msg) => msg.senderId !== currentUserId && msg.status !== "seen")
            .map((msg) => msg.messageId);

        if (unreadMessages.length > 0) {
            setTimeout(() => {
                dispatch(markMessagesAsRead({ conversationId, messageIds: unreadMessages }));
                markAsRead({ conversationId, messageIds: unreadMessages });
            }, 500);
        }
    }, [messages, conversationId, currentUserId, isConnected, dispatch, markAsRead]);

    if (!conversation) {
        return <EmptyChat />;
    }

    console.log(conversation)

    return (
        <div className={styles.chatWindow}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <Avatar
                        size={40}
                        src={conversation.avatarPath || conversation.avatar_path || null}
                        style={{
                            backgroundColor: "#1890ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "14px",
                        }}
                    >
                        {!conversation.avatarPath && !conversation.avatar_path && conversation.name
                            ? getFirstLetterOfEachWord(conversation.name).children
                            : "U"}
                    </Avatar>
                    <div className={styles.headerText}>
                        <h3>{conversation.name}</h3>
                        {conversation.conversationType === "group" && (
                            <span className={styles.participants}>
                                {conversation.participantIds?.length || 0} members
                            </span>
                        )}
                    </div>
                </div>
                <div className={styles.actions}>
                    <button className={styles.actionBtn} title="Search">
                        🔍
                    </button>
                    <button className={styles.actionBtn} title="Call">
                        ☎️
                    </button>
                    <button className={styles.actionBtn} title="Info">
                        ℹ️
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div className={styles.messagesContainer} ref={messageContainerRef}>
                {loadError ? (
                    <div className={styles.errorPlaceholder}>
                        <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
                        <h3>Không thể tải tin nhắn</h3>
                        <p>{loadError}</p>
                        <button
                            onClick={() => {
                                setLoadError(null);
                                dispatch(loadMessages({ conversationId, limit: 50 }));
                            }}
                            style={{
                                marginTop: "16px",
                                padding: "8px 16px",
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px",
                            }}
                        >
                            Thử lại
                        </button>
                    </div>
                ) : isLoadingMessages ? (
                    <div className={styles.loadingPlaceholder}>
                        <span className={styles.spinner}></span>
                        <p>Loading messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className={styles.emptyPlaceholder}>
                        <div>💬</div>
                        <h3>No messages yet</h3>
                        <p>Send a message to start the conversation</p>
                    </div>
                ) : (
                    <MessageList messages={messages} conversationId={conversationId} currentUserId={currentUserId} />
                )}

                {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <MessageInput conversationId={conversationId} />
        </div>
    );
};

export default ChatWindow;
