import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, Input, Button, Badge, Modal } from "antd";
import { SendOutlined, CloseCircleOutlined, UserOutlined } from "@ant-design/icons";
import {
    fetchAdminConversations,
    fetchSupportMessages,
    sendSupportMessage,
    setActiveConversation,
    closeConversation,
    reopenConversation,
} from "@features/supportChat/supportChatSlice";
import useSupportChat from "@hooks/useSupportChat";
import styles from "./AdminChatPage.module.css";
import { getFirstLetterOfEachWord } from "@helpers/stringHelper";

const AdminChatPage = () => {
    const dispatch = useDispatch();
    const {
        conversations,
        activeConversationId,
        messagesByConversation,
        isTyping,
    } = useSelector((state) => state.supportChat);

    const [message, setMessage] = useState("");
    const messagesEndRef = useRef(null);

    // Dùng hook: lắng nghe real-time, auto join room khi activeConversationId thay đổi
    const { joinRoom, sendTyping, stopTyping } = useSupportChat(activeConversationId);

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutes}`;
    };

    // Initial load danh sách
    useEffect(() => {
        dispatch(fetchAdminConversations({ status: "all", limit: 50 }));
    }, [dispatch]);

    // Lấy chi tiết conversation đang chọn
    const activeConvData = conversations.find((c) => c.id === activeConversationId);
    const messages = activeConversationId ? messagesByConversation[activeConversationId] || [] : [];

    // Chọn 1 conversation
    const handleSelectConversation = (id) => {
        dispatch(setActiveConversation(id));
        dispatch(fetchSupportMessages({ conversationId: id }));
        setMessage("");
    };

    // Auto-scroll
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping, activeConversationId]);

    // Gửi tin nhắn
    const handleSend = async (e) => {
        e?.preventDefault();
        if (!message.trim() || !activeConversationId) return;

        stopTyping(activeConversationId);
        const txt = message;
        setMessage("");
        await dispatch(sendSupportMessage({ conversationId: activeConversationId, content: txt }));
    };

    const handleTyping = (e) => {
        setMessage(e.target.value);
        if (activeConversationId) {
            if (e.target.value.trim() !== "") {
                sendTyping(activeConversationId);
            } else {
                stopTyping(activeConversationId);
            }
        }
    };

    const handleCloseChat = () => {
        Modal.confirm({
            title: "Xác nhận đóng cuộc hội thoại?",
            content: "Nếu đóng, bạn và khách hàng sẽ không thể gửi thêm tin nhắn vào đây nữa.",
            onOk: async () => {
                await dispatch(closeConversation(activeConversationId));
            },
        });
    };

    const handleReopenChat = async () => {
        await dispatch(reopenConversation(activeConversationId));
    };

    return (
        <div className={styles.adminChatContainer}>
            {/* ── Sidebar: Danh sách cuộc hội thoại ── */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h3>Tin nhắn Hỗ trợ</h3>
                </div>
                <div className={styles.conversationList}>
                    {conversations.length === 0 && (
                        <div className={styles.emptyList}>Chưa có cuộc hội thoại nào</div>
                    )}
                    {conversations.map((conv) => {
                        const isActive = conv.id === activeConversationId;
                        const customer = conv.customer || {};
                        return (
                            <div
                                key={conv.id}
                                className={`${styles.conversationItem} ${isActive ? styles.active : ""}`}
                                onClick={() => handleSelectConversation(conv.id)}
                            >
                                <Badge count={conv.unreadByAdmin}>
                                    <Avatar src={customer.avatarPath} icon={<UserOutlined />}>
                                        {customer.fullname ? getFirstLetterOfEachWord(customer.fullname).children : "C"}
                                    </Avatar>
                                </Badge>
                                <div className={styles.conversationInfo}>
                                    <div className={styles.convHeader}>
                                        <span className={styles.customerName}>
                                            {customer.fullname || customer.username || "Khách hàng"}
                                        </span>
                                        <span className={styles.time}>
                                            {formatTime(conv.lastMessageAt)}
                                        </span>
                                    </div>
                                    <div className={styles.convPreview}>
                                        {/* Trích xuất tin nhắn dùng chung với db */}
                                        <span className={styles.previewText}>
                                            {conv.status === "closed" ? "🔴 Đã đóng" : "Chat hỗ trợ..."}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Chat Flow: Khung chat ── */}
            <div className={styles.chatArea}>
                {!activeConversationId ? (
                    <div className={styles.noSelection}>
                        Bấm vào một cuộc hội thoại bên trái để bắt đầu hỗ trợ
                    </div>
                ) : (
                    <>
                        <div className={styles.chatHeader}>
                            <div className={styles.chatHeaderInfo}>
                                <Avatar src={activeConvData?.customer?.avatarPath} icon={<UserOutlined />} />
                                <div className={styles.chatTitle}>
                                    <h4>{activeConvData?.customer?.fullname || "Khách hàng"}</h4>
                                    <span>{activeConvData?.customer?.phoneNumber || activeConvData?.customer?.email}</span>
                                </div>
                            </div>
                            {activeConvData?.status === "open" ? (
                                <Button danger icon={<CloseCircleOutlined />} onClick={handleCloseChat}>
                                    Đóng chat
                                </Button>
                            ) : (
                                <Button type="default" onClick={handleReopenChat}>
                                    Mở lại chat
                                </Button>
                            )}
                        </div>

                        <div className={styles.messagesContainer}>
                            {messages.map((msg, idx) => {
                                // Admin là "me" (bên phải), Customer là "other" (bên trái)
                                const isMe = msg.senderRole === "Admin";
                                return (
                                    <div key={msg.id || idx} className={`${styles.messageWrapper} ${isMe ? styles.me : styles.other}`}>
                                        <div className={styles.bubble}>{msg.content}</div>
                                        <div className={styles.timestamp}>{formatTime(msg.createdAt)}</div>
                                    </div>
                                );
                            })}
                            
                            {isTyping && (
                                <div className={`${styles.messageWrapper} ${styles.other}`}>
                                    <div className={styles.typingIndicator}>Khách hàng đang gõ...</div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {activeConvData?.status === "closed" ? (
                            <div className={styles.closedNotice}>Cuộc hội thoại này đã bị đóng.</div>
                        ) : (
                            <form className={styles.inputForm} onSubmit={handleSend}>
                                <Input
                                    value={message}
                                    onChange={handleTyping}
                                    placeholder="Nhập tin nhắn..."
                                    className={styles.input}
                                    size="large"
                                />
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    icon={<SendOutlined />} 
                                    size="large"
                                    disabled={!message.trim()}
                                >
                                    Gửi
                                </Button>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminChatPage;
