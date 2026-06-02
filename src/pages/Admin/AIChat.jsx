import React, { useState, useRef, useEffect } from "react";
import { Avatar, Button, Input, Tooltip, Layout, message as antMessage } from "antd";
import {
    SendOutlined,
    RobotOutlined,
    ClearOutlined,
    BulbOutlined,
    UserOutlined,
    ArrowDownOutlined,
    ArrowRightOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";
import axiosInstance from "@config/axiosInstance";
import styles from "./AIChat.module.css";

const { Content } = Layout;
const { TextArea } = Input;

const STORAGE_KEY = "eatsy_admin_ai_chat_history";

const SUGGESTED_PROMPTS = [
    {
        title: "Thống kê doanh thu",
        prompt: "Hãy lập báo cáo thống kê doanh thu và đơn hàng thực tế của hệ thống Eatsy cho tôi.",
        icon: "💰"
    },
    {
        title: "Quản lý nhân viên",
        prompt: "Tôi muốn quản lý nhân viên.",
        icon: "👥"
    },
    {
        title: "Quản lý món ăn",
        prompt: "Tôi muốn quản lý món ăn",
        icon: "🍔"
    },
    {
        title: "Đánh giá & Phản hồi",
        prompt: "Tổng hợp đánh giá tổng quát của người dùng về các món ăn trên hệ thống.",
        icon: "⭐"
    },
];

const DEFAULT_MESSAGE = {
    id: "welcome",
    role: "assistant",
    content: "Xin chào! Tôi là **EatsyAdminBot**, trợ lý AI chuyên biệt dành riêng cho Quản trị viên của hệ thống **Eatsy Food Delivery**.\n\nTôi có thể giúp bạn hiểu rõ cách thức vận hành của hệ thống, bao gồm:\n- 📋 Hướng dẫn xử lý và quản lý đơn hàng.\n- 👥 Thêm mới, phân quyền nhân viên.\n- 🍔 Cập nhật món ăn, danh mục menu.\n- 📊 Xem báo cáo và biểu đồ doanh thu.\n- 💳 Cấu hình thanh toán qua cổng VNPay.\n\nHãy chọn một gợi ý nhanh bên trái hoặc nhập câu hỏi trực tiếp để bắt đầu nhé!",
    createdAt: new Date().toISOString()
};

const AIChat = () => {
    const [message, setMessage] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [DEFAULT_MESSAGE];
        } catch (error) {
            console.error("Không thể khôi phục lịch sử chat AI Admin:", error);
            return [DEFAULT_MESSAGE];
        }
    });

    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);
    const [showScrollBottom, setShowScrollBottom] = useState(false);

    // Lưu lịch sử chat khi có thay đổi
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch (error) {
            console.error("Không thể lưu lịch sử chat AI Admin:", error);
        }
    }, [messages]);

    // Cuộn xuống cuối
    const scrollToBottom = (behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        scrollToBottom("smooth");
    }, [messages, isAiLoading]);

    // Ngăn chặn cuộn trang toàn cục của AdminLayout (chỉ cho phép cuộn bên trong khung chat)
    useEffect(() => {
        const contentEl = document.querySelector(".ant-layout-content") || document.querySelector("main");
        if (contentEl) {
            const originalOverflow = contentEl.style.overflow;
            contentEl.style.overflow = "hidden";
            return () => {
                contentEl.style.overflow = originalOverflow;
            };
        }
    }, []);

    // Theo dõi scroll để hiển thị nút cuộn xuống dưới
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        // Hiển thị nút nếu người dùng cuộn lên trên cách đáy quá 200px
        setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 200);
    };

    // Hàm gửi tin nhắn
    const handleSend = async (textToSend) => {
        const queryText = (textToSend || message).trim();
        if (!queryText || isAiLoading) return;

        // Clear input ngay lập tức
        if (!textToSend) setMessage("");

        const userMsg = {
            id: `user-${Date.now()}`,
            role: "user",
            content: queryText,
            createdAt: new Date().toISOString()
        };

        // Cập nhật tin nhắn người dùng cục bộ
        setMessages((prev) => [...prev, userMsg]);
        setIsAiLoading(true);

        try {
            // Chuẩn bị lịch sử lọc gọn gàng cho API
            const historyForApi = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Gọi API Admin AI Chat
            const response = await axiosInstance.post("/api/admin/ai-chat", {
                message: queryText,
                chatHistory: historyForApi
            });

            const replyText = response.data?.reply || "Xin lỗi, hệ thống AI gặp sự cố phản hồi.";

            setMessages((prev) => [
                ...prev,
                {
                    id: `bot-${Date.now()}`,
                    role: "assistant",
                    content: replyText,
                    createdAt: new Date().toISOString()
                }
            ]);
        } catch (error) {
            console.error("Lỗi khi chat với AI:", error);
            antMessage.error("Không thể kết nối với dịch vụ AI.");
            setMessages((prev) => [
                ...prev,
                {
                    id: `bot-err-${Date.now()}`,
                    role: "assistant",
                    content: "❌ **Lỗi hệ thống:** Dịch vụ AI hiện tại đang quá tải hoặc cấu hình API Key của bạn không chính xác. Vui lòng kiểm tra lại môi trường hoặc thử lại sau.",
                    createdAt: new Date().toISOString()
                }
            ]);
        } finally {
            setIsAiLoading(false);
        }
    };

    // Xóa toàn bộ lịch sử chat
    const handleClearChat = () => {
        setMessages([DEFAULT_MESSAGE]);
        antMessage.success("Đã làm mới cuộc hội thoại!");
    };

    // Hàm render Markdown custom cực mượt, an toàn, hỗ trợ in đậm và danh sách
    const parseMarkdown = (text) => {
        if (!text) return null;
        const lines = text.split("\n");
        const renderedElements = [];
        let i = 0;

        const renderBoldText = (str) => {
            if (!str) return "";
            const boldRegex = /\*\*(.*?)\*\*/g;
            const parts = [];
            let lastIndex = 0;
            let match;

            while ((match = boldRegex.exec(str)) !== null) {
                if (match.index > lastIndex) {
                    parts.push(str.substring(lastIndex, match.index));
                }
                parts.push(<strong key={match.index} style={{ fontWeight: 700, color: "inherit" }}>{match[1]}</strong>);
                lastIndex = boldRegex.lastIndex;
            }

            if (parts.length === 0) return str;

            if (lastIndex < str.length) {
                parts.push(str.substring(lastIndex));
            }
            return parts;
        };

        while (i < lines.length) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // 1. Nhận diện Bảng (Markdown Table)
            if (trimmedLine.startsWith("|") && i + 1 < lines.length) {
                const nextLineTrimmed = lines[i + 1].trim();
                const isSeparator = nextLineTrimmed.startsWith("|") && /^[|\s-:]+$/.test(nextLineTrimmed);

                if (isSeparator) {
                    const headers = line.split("|").map(s => s.trim()).filter((s, idx, arr) => idx > 0 && idx < arr.length - 1);
                    
                    // Bỏ qua dòng separator
                    i += 2; 

                    const rows = [];
                    // Đọc tiếp các dòng dữ liệu của bảng
                    while (i < lines.length && lines[i].trim().startsWith("|")) {
                        const rowLine = lines[i].trim();
                        if (/^[|\s-:]+$/.test(rowLine)) {
                            i++;
                            continue;
                        }
                        const cells = rowLine.split("|").map(s => s.trim()).filter((s, idx, arr) => idx > 0 && idx < arr.length - 1);
                        rows.push(cells);
                        i++;
                    }

                    renderedElements.push(
                        <div key={`table-wrapper-${i}`} className={styles.tableWrapper}>
                            <table className={styles.statsTable}>
                                <thead>
                                    <tr>
                                        {headers.map((h, hIdx) => (
                                            <th key={`th-${hIdx}`}>{renderBoldText(h)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, rIdx) => (
                                        <tr key={`tr-${rIdx}`}>
                                            {row.map((cell, cIdx) => (
                                                <td key={`td-${rIdx}-${cIdx}`}>{renderBoldText(cell)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                    continue;
                }
            }

            // 2. Nhận diện danh sách (List Items)
            if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
                const listItems = [];
                while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))) {
                    const currentTrimmed = lines[i].trim();
                    listItems.push(
                        <li key={`li-${i}`} style={{ marginBottom: "6px", listStyleType: "disc" }}>
                            {renderBoldText(currentTrimmed.substring(2))}
                        </li>
                    );
                    i++;
                }
                renderedElements.push(
                    <ul key={`ul-${i}`} style={{ margin: "8px 0 12px 20px", paddingLeft: "10px" }}>
                        {listItems}
                    </ul>
                );
                continue;
            }

            // 3. Đoạn văn thường hoặc dòng trống
            if (trimmedLine !== "") {
                renderedElements.push(
                    <p key={`p-${i}`} style={{ margin: "0 0 12px 0", lineHeight: 1.6 }}>
                        {renderBoldText(line)}
                    </p>
                );
            } else {
                renderedElements.push(<div key={`br-${i}`} style={{ height: "8px" }} />);
            }
            i++;
        }

        return <div className={styles.markdownBody}>{renderedElements}</div>;
    };

    return (
        <div className={styles.container}>
            {/* Cột trái: Thông tin AI và các gợi ý prompt nhanh */}
            <div className={styles.instructionCol}>
                <div className={styles.botProfileCard}>
                    <div className={styles.avatarPulseContainer}>
                        <Avatar size={64} icon={<RobotOutlined style={{ fontSize: 32 }} />} className={styles.botAvatar} />
                        <div className={styles.pulseBadge} />
                    </div>
                    <h3 className={styles.botName}>EatsyAdminBot</h3>
                    <div className={styles.botStatus}>
                        <CheckCircleOutlined /> Trực tuyến
                    </div>
                    <p className={styles.botDesc}>
                        Trợ lý AI hỗ trợ quản trị vận hành, giải đáp thắc mắc về đơn hàng, món ăn, nhân viên và các tính năng của Eatsy.
                    </p>
                </div>

                <h4 className={styles.promptsTitle}>
                    <BulbOutlined style={{ color: "#ff914d", marginRight: 6 }} /> Gợi ý nhanh
                </h4>
                <div className={styles.promptsList}>
                    {SUGGESTED_PROMPTS.map((item, idx) => (
                        <button
                            key={idx}
                            className={styles.promptCard}
                            onClick={() => handleSend(item.prompt)}
                            disabled={isAiLoading}
                        >
                            <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                <span style={{ fontWeight: 650, marginBottom: 2 }}>{item.title}</span>
                                <span style={{ fontSize: "0.78rem", color: "#64748b" }} className={styles.promptShortText}>
                                    Hỏi nhanh về nội dung này
                                </span>
                            </div>
                            <ArrowRightOutlined style={{ fontSize: 10, color: "#cbd5e1" }} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Cột phải: Vùng chat chính */}
            <div className={styles.chatCol}>
                <div className={styles.chatHeader}>
                    <div className={styles.headerTitleDetails}>
                        <h2 className={styles.headerTitle}>Hỏi đáp với AI</h2>
                        <span className={styles.headerSubtitle}>Trợ lý kỹ thuật số đồng hành quản lý Eatsy</span>
                    </div>
                    <Tooltip title="Làm mới cuộc trò chuyện">
                        <Button
                            type="text"
                            icon={<ClearOutlined />}
                            onClick={handleClearChat}
                            className={styles.clearBtn}
                        />
                    </Tooltip>
                </div>

                {/* Vùng chứa tin nhắn */}
                <div
                    className={styles.messagesContainer}
                    onScroll={handleScroll}
                    ref={containerRef}
                >
                    <div className={styles.messagesList}>
                        {messages.map((msg) => {
                            const isUser = msg.role === "user";
                            const rowClass = isUser ? styles.msgRowUser : styles.msgRowBot;
                            const bubbleClass = isUser ? styles.msgBubbleUser : styles.msgBubbleBot;

                            return (
                                <div key={msg.id} className={`${styles.msgRow} ${rowClass}`}>
                                    {!isUser && (
                                        <Avatar
                                            icon={<RobotOutlined />}
                                            className={styles.msgAvatar}
                                            style={{ backgroundColor: "var(--primaryColor, #ff914d)" }}
                                        />
                                    )}
                                    <div className={`${styles.msgBubble} ${bubbleClass}`}>
                                        {parseMarkdown(msg.content)}
                                        <span className={styles.msgTime}>
                                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                        </span>
                                    </div>
                                    {isUser && (
                                        <Avatar
                                            icon={<UserOutlined />}
                                            className={styles.msgAvatar}
                                            style={{ backgroundColor: "#cbd5e1", marginLeft: 12, marginRight: 0 }}
                                        />
                                    )}
                                </div>
                            );
                        })}

                        {/* Loading Indicator của AI */}
                        {isAiLoading && (
                            <div className={`${styles.msgRow} ${styles.msgRowBot}`}>
                                <Avatar
                                    icon={<RobotOutlined />}
                                    className={styles.msgAvatar}
                                    style={{ backgroundColor: "var(--primaryColor, #ff914d)" }}
                                />
                                <div className={`${styles.msgBubble} ${styles.msgBubbleBot}`} style={{ padding: "12px 20px" }}>
                                    <div className={styles.typingIndicator}>
                                        <div className={styles.typingDot} />
                                        <div className={styles.typingDot} />
                                        <div className={styles.typingDot} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Nút cuộn nhanh xuống đáy */}
                {showScrollBottom && (
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<ArrowDownOutlined />}
                        onClick={() => scrollToBottom("smooth")}
                        style={{
                            position: "absolute",
                            bottom: 100,
                            right: 40,
                            zIndex: 100,
                            backgroundColor: "var(--primaryColor, #ff914d)",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(255, 145, 77, 0.4)"
                        }}
                    />
                )}

                {/* Footer nhập tin nhắn */}
                <div className={styles.inputArea}>
                    <div className={styles.inputContainer}>
                        <TextArea
                            className={styles.textareaInput}
                            autoSize={{ minRows: 1, maxRows: 4 }}
                            placeholder={isAiLoading ? "EatsyAdminBot đang suy nghĩ..." : "Nhập câu hỏi của bạn về Eatsy..."}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isAiLoading}
                            onKeyPress={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={() => handleSend()}
                            className={styles.sendBtn}
                            disabled={!message.trim() || isAiLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChat;
