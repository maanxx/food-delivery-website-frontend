import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Paper, Typography, IconButton, Tabs, Tab, TextField, InputAdornment, Avatar, CircularProgress, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { message as antMessage } from "antd";
import styles from "./ChatBox.module.css";
import { sendChatMessage } from "@services/chatbotService";
import { addToCart } from "@features/cart/cartSlice";
import { getDishImageUrl, handleDishImageError } from "@utils/dishImage";
import useWebSocket from "@hooks/useWebSocket";
import { getMyConversation, createConversation, getMessages as getSupportMessages, sendMessage as sendSupportMessage } from "@services/supportService";
import axiosInstance from "@config/axiosInstance";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

const isImageUrl = (url) => {
    if (typeof url !== "string") return false;
    return url.startsWith("http") && (
        url.match(/\.(jpeg|jpg|gif|png|webp)/i) || 
        url.includes("cloudinary.com") ||
        url.includes("placeholder.com")
    );
};

const AI_CHAT_STORAGE_KEY = "eatsy_ai_chat_history";
const AI_CHAT_SESSION_KEY = "eatsy_ai_chat_session_id";
const MAX_VISIBLE_AGENT_MESSAGES = 10;
const DEFAULT_AI_MESSAGES = [
    {
        id: 1,
        role: "assistant",
        content: "Xin chào! Tôi là trợ lý AI thông minh của Eatsy. Tôi có thể tư vấn món ăn ngon và giải đáp mọi thắc mắc của bạn hôm nay. Bạn muốn tìm món gì nào?",
        dishes: [],
    },
];

const ChatBox = ({ onClose }) => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(
        (state) => state?.customerAuth?.isAuthenticated ?? state?.auth?.isAuthenticated ?? false,
    );
    const [tab, setTab] = useState(0);
    const [message, setMessage] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [addingDishIds, setAddingDishIds] = useState([]);
    const [sessionId] = useState(() => {
        try {
            const existingSessionId = localStorage.getItem(AI_CHAT_SESSION_KEY);
            if (existingSessionId) {
                return existingSessionId;
            }

            const newSessionId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : `session_${Date.now()}_${Math.random().toString(16).slice(2)}`;

            localStorage.setItem(AI_CHAT_SESSION_KEY, newSessionId);
            return newSessionId;
        } catch (_error) {
            return `session_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        }
    });
    const messagesEndRef = useRef(null);

    const { socket } = useWebSocket();
    const [supportConversation, setSupportConversation] = useState(null);
    const [supportMessages, setSupportMessages] = useState([]);
    const [isSupportLoading, setIsSupportLoading] = useState(false);
    const [isSendingSupport, setIsSendingSupport] = useState(false);

    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

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
                let activeConv = supportConversation;
                
                if (!activeConv) {
                    activeConv = await createConversation("Khách hàng gửi ảnh hỗ trợ");
                    setSupportConversation(activeConv);
                    if (socket) {
                        socket.emit("join_support", activeConv.id);
                    }
                }

                const newMsg = await sendSupportMessage(activeConv.id, imageUrl);

                setSupportMessages((prev) => {
                    if (prev.some((m) => m.id === newMsg.id)) return prev;
                    return [
                        ...prev,
                        {
                            id: newMsg.id,
                            role: "user",
                            content: imageUrl,
                            createdAt: newMsg.createdAt
                        }
                    ];
                });
                antMessage.success("Tải ảnh lên thành công!");
            }
        } catch (error) {
            console.error("Lỗi upload ảnh:", error);
            antMessage.error("Không thể upload ảnh, vui lòng thử lại!");
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    // Tải thông tin cuộc hội thoại hỗ trợ khi vào tab Admin
    useEffect(() => {
        if (tab !== 1 || !isAuthenticated) return;

        const loadSupportConversation = async () => {
            setIsSupportLoading(true);
            try {
                const conv = await getMyConversation();
                if (conv) {
                    setSupportConversation(conv);
                    const history = await getSupportMessages(conv.id);
                    const formattedMsgs = history.messages.map(msg => ({
                        id: msg.id,
                        role: msg.senderRole === "Admin" ? "assistant" : "user",
                        content: msg.content,
                        createdAt: msg.createdAt
                    }));
                    setSupportMessages(formattedMsgs);
                } else {
                    setSupportConversation(null);
                    setSupportMessages([]);
                }
            } catch (err) {
                console.error("Lỗi tải cuộc hội thoại hỗ trợ:", err);
            } finally {
                setIsSupportLoading(false);
            }
        };

        loadSupportConversation();
    }, [tab, isAuthenticated]);

    // Lắng nghe sự kiện WebSocket khi cuộc hội thoại hoạt động
    useEffect(() => {
        if (!socket || !supportConversation?.id || tab !== 1) return;

        socket.emit("join_support", supportConversation.id);

        const handleNewSupportMessage = (newMsg) => {
            if (newMsg.conversationId === supportConversation.id) {
                setSupportMessages((prev) => {
                    if (prev.some((m) => m.id === newMsg.id)) return prev;
                    return [
                        ...prev,
                        {
                            id: newMsg.id,
                            role: newMsg.senderRole === "Admin" ? "assistant" : "user",
                            content: newMsg.content,
                            createdAt: newMsg.createdAt
                        }
                    ];
                });
            }
        };

        const handleSupportConversationClosed = (data) => {
            if (data.conversationId === supportConversation.id) {
                setSupportConversation(null);
                setSupportMessages([]);
                antMessage.info("Cuộc hội thoại hỗ trợ đã được đóng bởi Admin.");
            }
        };

        socket.on("support:new_message", handleNewSupportMessage);
        socket.on("support:conversation_closed", handleSupportConversationClosed);

        return () => {
            socket.emit("leave_support", supportConversation.id);
            socket.off("support:new_message", handleNewSupportMessage);
            socket.off("support:conversation_closed", handleSupportConversationClosed);
        };
    }, [socket, supportConversation?.id, tab]);

    /**
     * TÁCH THÔNG TIN MÓN ĂN TỪ TIN NHẮN AI
     * Chuyển đổi chuỗi [DISH_CARD: {...}] thành Object để hiển thị UI Card.
     */
    const parseAIDishCards = (content) => {
        const dishCardRegex = /\[DISH_CARD:\s*(\{.*?\})\]/g;
        const dishes = [];
        let match;
        let cleanText = content;

        while ((match = dishCardRegex.exec(content)) !== null) {
            try {
                const dishData = JSON.parse(match[1]);
                dishes.push(dishData);
                // Xoá tag này khỏi text để không hiện raw json ra màn hình
                cleanText = cleanText.replace(match[0], "");
            } catch (e) {
                console.error("Lỗi parse dữ liệu món ăn từ AI:", e);
            }
        }

        return { text: cleanText.trim(), dishes };
    };

    // AI Messages sử dụng format role/content theo chuẩn API
    const [aiMessages, setAiMessages] = useState(() => {
        try {
            const savedMessages = localStorage.getItem(AI_CHAT_STORAGE_KEY);
            if (!savedMessages) {
                return DEFAULT_AI_MESSAGES;
            }

            const parsedMessages = JSON.parse(savedMessages);
            if (!Array.isArray(parsedMessages) || parsedMessages.length === 0) {
                return DEFAULT_AI_MESSAGES;
            }

            return parsedMessages.slice(-MAX_VISIBLE_AGENT_MESSAGES);
        } catch (error) {
            console.error("Không thể đọc lịch sử chat AI từ localStorage:", error);
            return DEFAULT_AI_MESSAGES;
        }
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Cuộn xuống mỗi khi có tin nhắn mới
    useEffect(() => {
        scrollToBottom();
    }, [aiMessages, tab]);

    useEffect(() => {
        try {
            const trimmedMessages = aiMessages.slice(-MAX_VISIBLE_AGENT_MESSAGES);
            localStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(trimmedMessages));
        } catch (error) {
            console.error("Không thể lưu lịch sử chat AI vào localStorage:", error);
        }
    }, [aiMessages]);

    const adminDefaultMessage = [
        { id: "default-greeting", role: "assistant", content: "Chào bạn, mình là nhân viên hỗ trợ của hệ thống thực phẩm Eatsy. Bạn đang gặp khó khăn gì ạ?" }
    ];

    const messages = tab === 0
        ? aiMessages.slice(-MAX_VISIBLE_AGENT_MESSAGES)
        : (supportMessages.length > 0 ? supportMessages : adminDefaultMessage);

    const handleAddDishToCart = async (dish) => {
        const dishId = dish?.id;
        if (!dishId || addingDishIds.includes(dishId)) {
            return;
        }

        if (!isAuthenticated) {
            antMessage.warning("Vui lòng đăng nhập để thêm món vào giỏ hàng!");
            return;
        }

        setAddingDishIds((prev) => [...prev, dishId]);

        try {
            await dispatch(addToCart({ dishId, quantity: 1 })).unwrap();
            antMessage.success(`Đã thêm ${dish.name || "món ăn"} vào giỏ hàng`);
        } catch (_error) {
            // Error toast/message is already handled by cart slice.
        } finally {
            setAddingDishIds((prev) => prev.filter((id) => id !== dishId));
        }
    };

    const handleSend = async () => {
        if (!message.trim()) return;

        if (tab === 0) {
            // Xử lý nhánh gửi cho AI
            if (isAiLoading) return;

            const userText = message.trim();
            setMessage(""); // Clear input ngay để UX tốt

            const newUserMessage = { id: Date.now(), role: "user", content: userText };
            setAiMessages((prev) => [...prev, newUserMessage]);
            setIsAiLoading(true);

            try {
                // Preserve assistant dish cards so backend can resolve follow-up
                // references like "món đó" or "món thứ 2" reliably.
                const historyForApi = aiMessages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                    dishes: Array.isArray(msg.dishes) ? msg.dishes : [],
                }));
                const response = await sendChatMessage(userText, historyForApi, { sessionId });

                setAiMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        role: "assistant",
                        content: response.reply,
                        dishes: response.cards,
                    },
                ]);
            } catch (error) {
                setAiMessages((prev) => [
                    ...prev,
                    { id: Date.now() + 1, role: "assistant", content: `❌ Xin lỗi, tôi gặp sự cố: ${error.message}` }
                ]);
            } finally {
                setIsAiLoading(false);
            }
        } else {
            // Nhánh gửi cho Admin
            if (isSendingSupport) return;

            // Kiểm tra đăng nhập
            if (!isAuthenticated) {
                antMessage.warning("Vui lòng đăng nhập để gửi yêu cầu hỗ trợ tới Admin!");
                return;
            }

            const userText = message.trim();
            setMessage(""); // Clear input ngay để UX tốt

            setIsSendingSupport(true);
            try {
                let activeConv = supportConversation;
                
                // Nếu chưa có cuộc hội thoại hỗ trợ nào đang mở, tạo mới
                if (!activeConv) {
                    activeConv = await createConversation("Khách hàng yêu cầu hỗ trợ");
                    setSupportConversation(activeConv);
                    
                    // Gia nhập socket room ngay
                    if (socket) {
                        socket.emit("join_support", activeConv.id);
                    }
                }

                // Gửi tin nhắn lên backend
                const newMsg = await sendSupportMessage(activeConv.id, userText);
                
                // Thêm vào danh sách tin nhắn cục bộ (tránh trùng lặp với sự kiện từ socket)
                setSupportMessages((prev) => {
                    if (prev.some((m) => m.id === newMsg.id)) return prev;
                    return [
                        ...prev,
                        {
                            id: newMsg.id,
                            role: "user",
                            content: userText,
                            createdAt: newMsg.createdAt
                        }
                    ];
                });
            } catch (error) {
                antMessage.error(`Lỗi khi gửi tin nhắn hỗ trợ: ${error.message || error}`);
            } finally {
                setIsSendingSupport(false);
            }
        }
    };

    return (
        <Paper
            elevation={6}
            className={styles.chatBoxContainer}
        >
            {/* Header */}
            <Box className={styles.chatBoxHeader}>
                <Typography className={styles.headerTitle}>
                    Chăm sóc khách hàng
                </Typography>
                <IconButton size="small" onClick={onClose} className={styles.closeButton}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Tabs */}
            <Tabs
                value={tab}
                onChange={(e, newValue) => setTab(newValue)}
                variant="fullWidth"
                className={styles.tabsContainer}
                textColor="inherit"
                TabIndicatorProps={{
                    style: { backgroundColor: "var(--primaryColor, #ff914d)" }
                }}
            >
                <Tab
                    icon={<SmartToyIcon fontSize="small"/>}
                    iconPosition="start"
                    label="AI Assistant"
                    sx={{ "&.Mui-selected": { color: "var(--primaryColor, #ff914d)" } }}
                />
                <Tab
                    icon={<SupportAgentIcon fontSize="small"/>}
                    iconPosition="start"
                    label="Admin"
                    sx={{ "&.Mui-selected": { color: "var(--primaryColor, #ff914d)" } }}
                />
            </Tabs>

            {/* Messages Body */}
            <Box className={styles.messagesBody}>
                {tab === 1 && !isAuthenticated ? (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", p: 3, textAlign: "center", gap: 2 }}>
                        <SupportAgentIcon sx={{ fontSize: 60, color: "var(--primaryColor, #ff914d)" }} />
                        <Typography variant="subtitle1" fontWeight="bold">
                            Chat trực tiếp với Admin
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Vui lòng đăng nhập tài khoản khách hàng để có thể gửi yêu cầu hỗ trợ trực tiếp tới nhân viên chăm sóc khách hàng của chúng tôi.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                if (onClose) onClose();
                                window.location.href = "/login";
                            }}
                            sx={{ mt: 1, backgroundColor: "var(--primaryColor, #ff914d)", "&:hover": { backgroundColor: "#e07e3c" }, textTransform: "none" }}
                        >
                            Đăng nhập ngay
                        </Button>
                    </Box>
                ) : tab === 1 && isAuthenticated && isSupportLoading ? (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                        <CircularProgress size={30} sx={{ color: "var(--primaryColor, #ff914d)" }} />
                    </Box>
                ) : (
                    <>
                        {messages.map((msg) => {
                            const isUser = msg.role === "user";
                            const rowClass = isUser ? styles.messageRowUser : styles.messageRowBot;
                            const bubbleClass = isUser ? styles.messageBubbleUser : styles.messageBubbleBot;

                            // Parse tin nhắn để lấy card nếu có (chỉ cho tab AI Assistant, tab Admin bỏ qua)
                            const parsedMessage = isUser || tab === 1
                                ? { text: msg.content, dishes: [] }
                                : parseAIDishCards(msg.content);
                            const dishes = parsedMessage.dishes.length > 0 ? parsedMessage.dishes : (msg.dishes || []);
                            const text = parsedMessage.text;

                            return (
                                <Box key={msg.id} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                    <Box className={`${styles.messageRow} ${rowClass}`}>
                                        {!isUser && (
                                            <Avatar className={tab === 0 ? styles.aiAvatar : styles.adminAvatar}>
                                                {tab === 0 ? <SmartToyIcon fontSize="small"/> : <SupportAgentIcon fontSize="small"/>}
                                            </Avatar>
                                        )}
                                        {text && (
                                            <Box className={`${styles.messageBubble} ${bubbleClass}`}>
                                                {isImageUrl(text) ? (
                                                    <img 
                                                        src={text} 
                                                        alt="Sent attachment" 
                                                        style={{ maxWidth: "160px", maxHeight: "160px", borderRadius: "8px", cursor: "pointer", display: "block" }} 
                                                        onClick={() => window.open(text, "_blank")}
                                                    />
                                                ) : (
                                                    <Typography variant="body2" sx={{ lineHeight: 1.4, whiteSpace: "pre-wrap" }}>{text}</Typography>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                    
                                    {/* HIỂN THỊ CARD MÓN ĂN (NẾU CÓ) */}
                                    {!isUser && dishes.length > 0 && (
                                        <Box sx={{ ml: 5, mb: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                                            {dishes.map((dish, idx) => (
                                                    <Box key={idx} className={styles.aiDishCard}>
                                                        <img
                                                            src={getDishImageUrl(dish.image)}
                                                            alt={dish.name}
                                                            className={styles.aiDishImage}
                                                            onError={handleDishImageError}
                                                        />
                                                    <Box className={styles.aiDishInfo}>
                                                        <Typography className={styles.aiDishName} noWrap>{dish.name}</Typography>
                                                        <Typography className={styles.aiDishPrice}>{dish.price.toLocaleString()}đ</Typography>
                                                        {addingDishIds.includes(dish.id) && (
                                                            <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5 }}>
                                                                Đang thêm vào giỏ...
                                                            </Typography>
                                                        )}
                                                        <Button 
                                                            fullWidth 
                                                            variant="contained" 
                                                            size="small"
                                                            disabled={addingDishIds.includes(dish.id)}
                                                            startIcon={<AddShoppingCartIcon sx={{ fontSize: "0.9rem !important" }} />}
                                                            className={styles.atcButton}
                                                            onClick={() => handleAddDishToCart(dish)}
                                                        >
                                                            Thêm vào giỏ
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </>
                )}
                {/* Trạng thái tải: AI đang response... */}
                {isAiLoading && tab === 0 && (
                    <Box className={`${styles.messageRow} ${styles.messageRowBot}`}>
                        <Avatar className={styles.aiAvatar}>
                            <SmartToyIcon fontSize="small"/>
                        </Avatar>
                        <Box className={`${styles.messageBubble} ${styles.messageBubbleBot}`}>
                            <CircularProgress size={20} color="inherit" />
                        </Box>
                    </Box>
                )}
                {/* Điểm cuộn xuống */}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Footer */}
            <Box className={styles.inputFooter}>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    style={{ display: "none" }} 
                />
                <TextField
                    fullWidth
                    size="small"
                    placeholder={isUploading ? "Đang tải ảnh lên..." : "Nhập tin nhắn..."}
                    variant="outlined"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isUploading}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    InputProps={{
                        className: styles.inputText,
                        endAdornment: (
                            <InputAdornment position="end">
                                {tab === 1 && isAuthenticated && (
                                    isUploading ? (
                                        <CircularProgress size={20} sx={{ mr: 1, color: "var(--primaryColor, #ff914d)" }} />
                                    ) : (
                                        <IconButton 
                                            onClick={() => fileInputRef.current?.click()} 
                                            size="small" 
                                            sx={{ mr: 0.5, color: "#64748b" }}
                                            disabled={isSendingSupport}
                                        >
                                            <PhotoCameraIcon fontSize="small" />
                                        </IconButton>
                                    )
                                )}
                                <IconButton 
                                    onClick={handleSend} 
                                    edge="end" 
                                    className={styles.sendButton}
                                    disabled={(!message.trim() && !isUploading) || isSendingSupport || isUploading}
                                >
                                    <SendIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
        </Paper>
    );
};

export default ChatBox;
