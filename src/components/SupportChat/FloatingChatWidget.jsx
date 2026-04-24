import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import useSupportChat from "@hooks/useSupportChat";
import {
    initSupportConversation,
    fetchSupportMessages,
    sendSupportMessage,
    toggleWidget,
} from "@features/supportChat/supportChatSlice";
import styles from "./FloatingChatWidget.module.css";
import { SendOutlined, CloseOutlined, MessageOutlined } from "@ant-design/icons";

const FloatingChatWidget = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const {
        myConversation,
        messagesByConversation,
        isWidgetOpen,
        isTyping,
    } = useSelector((state) => state.supportChat);

    const [message, setMessage] = useState("");
    const messagesEndRef = useRef(null);

    // Initialize socket connection hook
    const { joinRoom, sendTyping, stopTyping } = useSupportChat(myConversation?.id);

    const messages = myConversation ? messagesByConversation[myConversation.id] || [] : [];

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping, isWidgetOpen]);

    const handleToggle = () => {
        dispatch(toggleWidget());
        // Initialize conversation on first open if needed
        if (!isWidgetOpen && !myConversation) {
            dispatch(initSupportConversation("Hỗ trợ đơn hàng"));
        }
    };

    // Khi có conversation, fetch history
    useEffect(() => {
        if (myConversation?.id && isWidgetOpen) {
            dispatch(fetchSupportMessages({ conversationId: myConversation.id }));
            // Tham gia room socket khi mở lên
            joinRoom(myConversation.id);
        }
    }, [myConversation?.id, isWidgetOpen, dispatch, joinRoom]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || !myConversation) return;

        stopTyping(myConversation.id);
        const textToSend = message;
        setMessage("");

        await dispatch(
            sendSupportMessage({
                conversationId: myConversation.id,
                content: textToSend,
            })
        );
    };

    const handleTyping = (e) => {
        setMessage(e.target.value);
        if (myConversation) {
            if (e.target.value.trim() !== "") {
                sendTyping(myConversation.id);
            } else {
                stopTyping(myConversation.id);
            }
        }
    };

    // If not logged in, don't render widget
    if (!user) return null;

    return (
        <div className={styles.widgetContainer}>
            {/* The Chat Window */}
            {isWidgetOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <div className={styles.headerTitle}>Hỗ trợ & Chăm sóc khách hàng</div>
                        <button className={styles.closeBtn} onClick={handleToggle}>
                            <CloseOutlined />
                        </button>
                    </div>

                    <div className={styles.messageArea}>
                        {myConversation?.status === "closed" && (
                            <div className={styles.systemMessage}>
                                Cuộc hội thoại này đã đóng. Hãy tải lại trang để tạo cuộc trò chuyện mới.
                            </div>
                        )}

                        {!myConversation ? (
                            <div className={styles.loadingMessage}>Đang kết nối...</div>
                        ) : messages.length === 0 ? (
                            <div className={styles.emptyMessage}>
                                Xin chào! Chúng tôi có thể giúp gì cho bạn?
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isCustomer = msg.senderRole === "Customer" || msg.senderRole === "user";
                                return (
                                    <div
                                        key={msg.id || index}
                                        className={`${styles.messageWrapper} ${
                                            isCustomer ? styles.sent : styles.received
                                        }`}
                                    >
                                        <div className={styles.messageBubble}>{msg.content}</div>
                                    </div>
                                );
                            })
                        )}
                        {isTyping && (
                            <div className={`${styles.messageWrapper} ${styles.received}`}>
                                <div className={styles.typingIndicator}>Admin đang gõ...</div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className={styles.inputArea} onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Nhập tin nhắn..."
                            className={styles.inputField}
                            value={message}
                            onChange={handleTyping}
                            disabled={myConversation?.status === "closed"}
                        />
                        <button
                            type="submit"
                            className={styles.sendBtn}
                            disabled={!message.trim() || myConversation?.status === "closed"}
                        >
                            <SendOutlined />
                        </button>
                    </form>
                </div>
            )}

            {/* The FAB Toggle Button */}
            {!isWidgetOpen && (
                <button className={styles.fabBtn} onClick={handleToggle}>
                    <MessageOutlined style={{ fontSize: "24px" }} />
                    {myConversation?.unreadByCustomer > 0 && (
                        <div className={styles.badge}>{myConversation.unreadByCustomer}</div>
                    )}
                </button>
            )}
        </div>
    );
};

export default FloatingChatWidget;
