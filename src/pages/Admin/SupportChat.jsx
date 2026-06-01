import React, { useState, useEffect, useRef } from "react";
import { Avatar, Button, Input, Tag, Spin, Tooltip, Badge, message as antMessage } from "antd";
import {
    SearchOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ReloadOutlined,
    SendOutlined,
    UserOutlined,
    CustomerServiceOutlined,
    FileImageOutlined
} from "@ant-design/icons";
import useWebSocket from "@hooks/useWebSocket";
import { getFirstLetterOfEachWord } from "@helpers/stringHelper";
import supportService from "@services/supportService";
import axiosInstance from "@config/axiosInstance";
import styles from "./SupportChat.module.css";

const isImageUrl = (url) => {
    if (typeof url !== "string") return false;
    return url.startsWith("http") && (
        url.match(/\.(jpeg|jpg|gif|png|webp)/i) || 
        url.includes("cloudinary.com") ||
        url.includes("placeholder.com")
    );
};

const SupportChat = () => {
    const { socket } = useWebSocket();
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [filterStatus, setFilterStatus] = useState("open"); // 'all', 'open', 'closed'
    const [searchTerm, setSearchTerm] = useState("");
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);
    const conversationsRef = useRef(conversations);
    const activeConvRef = useRef(activeConv);

    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeConvRef.current) return;

        if (file.size > 5 * 1024 * 1024) {
            antMessage.warning("Dung lượng file tối đa là 5MB!");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        setIsUploading(true);
        try {
            const response = await axiosInstance.post("/api/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            const imageUrl = response.data?.url;
            if (imageUrl) {
                const newMsg = await supportService.sendMessage(activeConvRef.current.id, imageUrl);

                setMessages((prev) => {
                    if (prev.some((m) => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });

                setConversations((prev) =>
                    prev.map((c) =>
                        c.id === activeConvRef.current.id
                            ? {
                                  ...c,
                                  lastMessageAt: newMsg.createdAt,
                                  lastMessage: { content: "🖼️ [Hình ảnh]", senderRole: "Admin", createdAt: newMsg.createdAt }
                              }
                            : c
                    )
                );
                antMessage.success("Gửi ảnh thành công!");
            }
        } catch (error) {
            console.error("Lỗi upload ảnh:", error);
            antMessage.error("Không thể tải ảnh lên.");
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    // Keep refs up-to-date for socket event listeners
    useEffect(() => {
        conversationsRef.current = conversations;
    }, [conversations]);

    useEffect(() => {
        activeConvRef.current = activeConv;
    }, [activeConv]);

    // Cuộn xuống cuối danh sách tin nhắn
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loadingMessages]);

    // Tải danh sách các cuộc hội thoại
    const loadConversations = async (status = filterStatus) => {
        setLoadingConversations(true);
        try {
            const result = await supportService.getAllConversations(status);
            setConversations(result.conversations || []);
        } catch (error) {
            antMessage.error("Không thể tải danh sách cuộc hội thoại hỗ trợ.");
        } finally {
            setLoadingConversations(false);
        }
    };

    useEffect(() => {
        loadConversations(filterStatus);
    }, [filterStatus]);

    // Tải lịch sử tin nhắn của cuộc hội thoại đang chọn
    const handleSelectConversation = async (conv) => {
        setActiveConv(conv);
        setLoadingMessages(true);
        try {
            const result = await supportService.getMessages(conv.id);
            setMessages(result.messages || []);

            // Trừ số tin nhắn chưa đọc của cuộc hội thoại này đi trong danh sách cục bộ
            setConversations((prev) =>
                prev.map((c) => (c.id === conv.id ? { ...c, unreadByAdmin: 0 } : c))
            );
        } catch (error) {
            antMessage.error("Không thể tải lịch sử tin nhắn.");
        } finally {
            setLoadingMessages(false);
        }
    };

    // Gửi tin nhắn phản hồi
    const handleSendReply = async () => {
        if (!activeConv || !replyText.trim() || sending) return;

        const textToSend = replyText.trim();
        setReplyText("");
        setSending(true);

        try {
            const newMsg = await supportService.sendMessage(activeConv.id, textToSend);
            
            // Cập nhật tin nhắn cục bộ (tránh trùng lặp với sự kiện từ socket)
            setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });

            // Cập nhật tin nhắn cuối trong danh sách cuộc hội thoại
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === activeConv.id
                        ? {
                              ...c,
                              lastMessageAt: newMsg.createdAt,
                              lastMessage: { content: textToSend, senderRole: "Admin", createdAt: newMsg.createdAt }
                          }
                        : c
                )
            );
        } catch (error) {
            antMessage.error("Gửi phản hồi thất bại: " + (error.message || error));
            setReplyText(textToSend); // khôi phục lại văn bản đã gõ
        } finally {
            setSending(false);
        }
    };

    // Đóng cuộc trò chuyện
    const handleCloseConversation = async () => {
        if (!activeConv) return;
        try {
            await supportService.closeConversation(activeConv.id);
            antMessage.success("Đã đóng cuộc trò chuyện hỗ trợ thành công.");
            
            // Cập nhật trạng thái cục bộ
            const updatedConv = { ...activeConv, status: "closed" };
            setActiveConv(updatedConv);
            setConversations((prev) =>
                prev.map((c) => (c.id === activeConv.id ? updatedConv : c))
            );
            loadConversations(filterStatus);
        } catch (error) {
            antMessage.error("Đóng cuộc trò chuyện thất bại.");
        }
    };

    // Mở lại cuộc trò chuyện
    const handleReopenConversation = async () => {
        if (!activeConv) return;
        try {
            await supportService.reopenConversation(activeConv.id);
            antMessage.success("Đã mở lại cuộc trò chuyện hỗ trợ.");
            
            // Cập nhật trạng thái cục bộ
            const updatedConv = { ...activeConv, status: "open" };
            setActiveConv(updatedConv);
            setConversations((prev) =>
                prev.map((c) => (c.id === activeConv.id ? updatedConv : c))
            );
            loadConversations(filterStatus);
        } catch (error) {
            antMessage.error("Mở lại cuộc trò chuyện thất bại.");
        }
    };

    // Lắng nghe các sự kiện socket real-time
    useEffect(() => {
        if (!socket) return;

        // 1. Lắng nghe cập nhật cuộc hội thoại toàn cục (khi có tin nhắn từ khách hàng bất kỳ)
        const handleGlobalConvUpdate = (data) => {
            console.log("📡 [Socket Support] Global update received:", data);
            const { conversationId, lastMessage, unreadByAdmin, customerId } = data;

            setConversations((prev) => {
                const index = prev.findIndex((c) => c.id === conversationId);
                
                // Nếu cuộc hội thoại đã tồn tại trong danh sách
                if (index !== -1) {
                    const updatedList = [...prev];
                    const existingConv = updatedList[index];

                    // Cập nhật tin nhắn và tăng unread nếu không phải cuộc hội thoại đang chat hoạt động
                    const isActive = activeConvRef.current?.id === conversationId;
                    updatedList[index] = {
                        ...existingConv,
                        lastMessageAt: lastMessage.createdAt,
                        unreadByAdmin: isActive ? 0 : unreadByAdmin,
                        lastMessage: lastMessage
                    };

                    // Sắp xếp lại danh sách đẩy cuộc hội thoại mới cập nhật lên đầu
                    return [
                        updatedList[index],
                        ...updatedList.filter((_, i) => i !== index)
                    ];
                } else {
                    // Nếu cuộc hội thoại chưa có trong danh sách hiện tại (VD: filter đang lọc, hoặc mới tạo)
                    // Ta tải lại danh sách để đảm bảo thông tin chuẩn từ DB
                    loadConversations(filterStatus);
                    return prev;
                }
            });
        };

        socket.on("support:conversation_updated", handleGlobalConvUpdate);

        return () => {
            socket.off("support:conversation_updated", handleGlobalConvUpdate);
        };
    }, [socket, filterStatus]);

    // 2. Gia nhập phòng socket của cuộc hội thoại được chọn để nghe tin nhắn trực tiếp
    useEffect(() => {
        if (!socket || !activeConv?.id) return;

        socket.emit("join_support", activeConv.id);

        const handleNewMessage = (newMsg) => {
            if (newMsg.conversationId === activeConv.id) {
                setMessages((prev) => {
                    // Tránh tin nhắn trùng lặp
                    if (prev.some((m) => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });

                // Cập nhật tin nhắn cuối trong cuộc hội thoại ở sidebar
                setConversations((prev) =>
                    prev.map((c) =>
                        c.id === activeConv.id
                            ? {
                                  ...c,
                                  lastMessageAt: newMsg.createdAt,
                                  lastMessage: { content: newMsg.content, senderRole: newMsg.senderRole, createdAt: newMsg.createdAt }
                              }
                            : c
                    )
                );
            }
        };

        const handleRemoteClosed = (data) => {
            if (data.conversationId === activeConv.id) {
                setActiveConv((prev) => prev ? { ...prev, status: "closed" } : null);
                antMessage.info("Cuộc trò chuyện này đã đóng.");
            }
        };

        const handleRemoteReopened = (data) => {
            if (data.conversationId === activeConv.id) {
                setActiveConv((prev) => prev ? { ...prev, status: "open" } : null);
                antMessage.info("Cuộc trò chuyện đã được mở lại.");
            }
        };

        socket.on("support:new_message", handleNewMessage);
        socket.on("support:conversation_closed", handleRemoteClosed);
        socket.on("support:conversation_reopened", handleRemoteReopened);

        return () => {
            socket.emit("leave_support", activeConv.id);
            socket.off("support:new_message", handleNewMessage);
            socket.off("support:conversation_closed", handleRemoteClosed);
            socket.off("support:conversation_reopened", handleRemoteReopened);
        };
    }, [socket, activeConv?.id]);

    // Lọc danh sách theo thanh tìm kiếm
    const filteredConversations = conversations.filter((conv) => {
        const name = conv.customer?.fullname || conv.customer?.username || "";
        const email = conv.customer?.email || "";
        const phone = conv.customer?.phoneNumber || "";
        const term = searchTerm.toLowerCase();

        return (
            name.toLowerCase().includes(term) ||
            email.toLowerCase().includes(term) ||
            phone.includes(term)
        );
    });

    const formatTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMins / 60);

        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHrs < 24) return `${diffHrs} giờ trước`;
        return date.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }) + " " + date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className={styles.container}>
            {/* CỘT TRÁI: DANH SÁCH KHÁCH HÀNG */}
            <div className={styles.sidebarCol}>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.sidebarTitle}>Hỗ trợ Khách hàng</h2>
                    <Tooltip title="Làm mới danh sách">
                        <Button
                            type="text"
                            icon={<ReloadOutlined spin={loadingConversations} />}
                            onClick={() => loadConversations(filterStatus)}
                            className={styles.refreshBtn}
                        />
                    </Tooltip>
                </div>

                {/* Ô tìm kiếm */}
                <div className={styles.searchBox}>
                    <Input
                        placeholder="Tìm theo tên, email, SĐT..."
                        prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        allowClear
                    />
                </div>

                {/* Bộ lọc trạng thái */}
                <div className={styles.filterBar}>
                    {[
                        { key: "open", label: "Đang mở" },
                        { key: "closed", label: "Đã đóng" },
                        { key: "all", label: "Tất cả" }
                    ].map((f) => (
                        <button
                            key={f.key}
                            className={`${styles.filterTab} ${filterStatus === f.key ? styles.filterTabActive : ""}`}
                            onClick={() => setFilterStatus(f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Danh sách các phiên */}
                <div className={styles.convList}>
                    {loadingConversations && conversations.length === 0 ? (
                        <div className={styles.spinnerWrapper}>
                            <Spin size="medium" />
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className={styles.emptyStateList}>
                            <CustomerServiceOutlined className={styles.emptyListIcon} />
                            <p>Không tìm thấy cuộc hội thoại nào</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const customerName = conv.customer?.fullname || conv.customer?.username || "Khách hàng Eatsy";
                            const isSelected = activeConv?.id === conv.id;
                            const unread = conv.unreadByAdmin || 0;
                            const lastMsgText = conv.lastMessage?.content || "Khách hàng đã tham gia phòng hỗ trợ";
                            const timeStr = formatTime(conv.lastMessageAt || conv.createdAt);

                            return (
                                <div
                                    key={conv.id}
                                    className={`${styles.convItem} ${isSelected ? styles.convItemActive : ""}`}
                                    onClick={() => handleSelectConversation(conv)}
                                >
                                    <Badge count={unread} offset={[-2, 2]}>
                                        <Avatar
                                            size={44}
                                            src={conv.customer?.avatarPath || null}
                                            className={styles.convAvatar}
                                        >
                                            {!conv.customer?.avatarPath &&
                                                getFirstLetterOfEachWord(customerName).children}
                                        </Avatar>
                                    </Badge>
                                    <div className={styles.convDetails}>
                                        <div className={styles.convRow}>
                                            <span className={styles.convName}>{customerName}</span>
                                            <span className={styles.convTime}>{timeStr}</span>
                                        </div>
                                        <div className={styles.convRow}>
                                            <span className={styles.convLastMsg}>{lastMsgText}</span>
                                            {conv.status === "closed" && (
                                                <Tag color="default" style={{ fontSize: "10px", margin: 0, scale: "0.85" }}>Đã đóng</Tag>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* CỘT PHẢI: NỘI DUNG CHAT */}
            <div className={styles.chatCol}>
                {activeConv ? (
                    <div className={styles.chatWrapper}>
                        {/* Chat Header */}
                        <div className={styles.chatHeader}>
                            <div className={styles.customerInfo}>
                                <Avatar
                                    size={40}
                                    src={activeConv.customer?.avatarPath || null}
                                    style={{ backgroundColor: "var(--primaryColor, #ff914d)" }}
                                >
                                    {!activeConv.customer?.avatarPath &&
                                        getFirstLetterOfEachWord(activeConv.customer?.fullname || activeConv.customer?.username || "U").children}
                                </Avatar>
                                <div className={styles.customerHeaderDetails}>
                                    <div className={styles.customerTitleRow}>
                                        <h3 className={styles.chatCustomerName}>
                                            {activeConv.customer?.fullname || activeConv.customer?.username || "Khách hàng"}
                                        </h3>
                                        {activeConv.status === "open" ? (
                                            <Tag color="success" icon={<CheckCircleOutlined />}>Đang hỗ trợ</Tag>
                                        ) : (
                                            <Tag color="error" icon={<CloseCircleOutlined />}>Đã giải quyết (Đóng)</Tag>
                                        )}
                                    </div>
                                    <span className={styles.customerMeta}>
                                        {activeConv.customer?.email ? `${activeConv.customer.email} • ` : ""}
                                        {activeConv.customer?.phoneNumber || "Không có SĐT"}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Nút hành động */}
                            <div className={styles.actionBtns}>
                                {activeConv.status === "open" ? (
                                    <Button
                                        type="primary"
                                        danger
                                        icon={<CloseCircleOutlined />}
                                        onClick={handleCloseConversation}
                                        className={styles.closeTicketBtn}
                                    >
                                        Đóng phiên
                                    </Button>
                                ) : (
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        onClick={handleReopenConversation}
                                        style={{ backgroundColor: "#22a06b", borderColor: "#22a06b" }}
                                    >
                                        Mở lại cuộc chat
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Vùng tin nhắn */}
                        <div className={styles.messagesContainer}>
                            {loadingMessages ? (
                                <div className={styles.spinnerWrapper}>
                                    <Spin size="medium" tip="Đang tải lịch sử trò chuyện..." />
                                </div>
                            ) : (
                                <div className={styles.messagesList}>
                                    <div className={styles.systemWelcome}>
                                        <CustomerServiceOutlined className={styles.welcomeIcon} />
                                        <p className={styles.systemWelcomeText}>
                                            Phiên hỗ trợ trực tuyến được bắt đầu với chủ đề: <strong>{activeConv.subject}</strong>
                                        </p>
                                        <span className={styles.systemWelcomeTime}>
                                            {new Date(activeConv.createdAt).toLocaleString("vi-VN")}
                                        </span>
                                    </div>

                                    {messages.map((msg) => {
                                        const isAdminMsg = msg.senderRole === "Admin";
                                        const isCustomerMsg = msg.senderRole === "Customer";
                                        
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`${styles.msgRow} ${
                                                    isAdminMsg ? styles.msgRowAdmin : styles.msgRowCustomer
                                                }`}
                                            >
                                                {isCustomerMsg && (
                                                    <Avatar
                                                        size={32}
                                                        src={activeConv.customer?.avatarPath || null}
                                                        className={styles.msgAvatar}
                                                    >
                                                        {!activeConv.customer?.avatarPath &&
                                                            getFirstLetterOfEachWord(activeConv.customer?.fullname || activeConv.customer?.username || "U").children}
                                                    </Avatar>
                                                )}
                                                <div
                                                    className={`${styles.msgBubble} ${
                                                        isAdminMsg ? styles.msgBubbleAdmin : styles.msgBubbleCustomer
                                                    }`}
                                                >
                                                    {isImageUrl(msg.content) ? (
                                                        <img 
                                                            src={msg.content} 
                                                            alt="Sent attachment" 
                                                            style={{ maxWidth: "250px", maxHeight: "250px", borderRadius: "12px", cursor: "pointer", display: "block" }} 
                                                            onClick={() => window.open(msg.content, "_blank")}
                                                        />
                                                    ) : (
                                                        <p className={styles.msgText}>{msg.content}</p>
                                                    )}
                                                    <span className={styles.msgTime}>
                                                        {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Ô nhập liệu tin nhắn */}
                        <div className={styles.inputArea}>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageUpload} 
                                accept="image/*" 
                                style={{ display: "none" }} 
                            />
                            {activeConv.status === "closed" ? (
                                <div className={styles.closedInfoBar}>
                                    Phiên hỗ trợ này đã được đóng. Bạn cần click **Mở lại cuộc chat** ở góc trên để gửi tin nhắn tiếp.
                                </div>
                            ) : (
                                <div className={styles.inputContainer}>
                                    <Button
                                        type="text"
                                        icon={<FileImageOutlined style={{ fontSize: "18px", color: "#64748b" }} />}
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={sending || isUploading}
                                        loading={isUploading}
                                        style={{ display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer" }}
                                    />
                                    <Input.TextArea
                                        placeholder="Nhập nội dung phản hồi khách hàng... (Nhấn Enter để gửi)"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onPressEnter={(e) => {
                                            if (!e.shiftKey) {
                                                e.preventDefault();
                                                handleSendReply();
                                            }
                                        }}
                                        autoSize={{ minRows: 1, maxRows: 4 }}
                                        className={styles.textareaInput}
                                        disabled={isUploading}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<SendOutlined />}
                                        onClick={handleSendReply}
                                        disabled={(!replyText.trim() && !isUploading) || sending || isUploading}
                                        loading={sending}
                                        className={styles.sendBtn}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyStateWrapper}>
                        <CustomerServiceOutlined className={styles.emptyIcon} />
                        <h2 className={styles.emptyTitle}>Hộp thư Hỗ trợ Khách hàng</h2>
                        <p className={styles.emptyDesc}>
                            Chọn một phiên chat từ danh sách khách hàng ở cột bên trái để bắt đầu nhắn tin và giải quyết khiếu nại/hỗ trợ khách hàng thời gian thực.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportChat;
