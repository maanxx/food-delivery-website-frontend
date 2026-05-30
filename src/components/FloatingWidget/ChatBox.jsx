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

    const adminMessages = [
        { id: 1, role: "assistant", content: "Chào bạn, mình là nhân viên hỗ trợ của hệ thống thực phẩm Eatery. Bạn đang gặp khó khăn gì ạ?" }
    ];

    const messages = tab === 0
        ? aiMessages.slice(-MAX_VISIBLE_AGENT_MESSAGES)
        : adminMessages;

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
            // Nhánh gửi cho Admin (logic tính sau)
            console.log("Sent msg to admin:", message);
            setMessage("");
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
                {messages.map((msg) => {
                    const isUser = msg.role === "user";
                    const rowClass = isUser ? styles.messageRowUser : styles.messageRowBot;
                    const bubbleClass = isUser ? styles.messageBubbleUser : styles.messageBubbleBot;

                    // Parse tin nhắn để lấy card nếu có
                    const parsedMessage = isUser
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
                                        <Typography variant="body2" sx={{ lineHeight: 1.4, whiteSpace: "pre-wrap" }}>{text}</Typography>
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
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Nhập tin nhắn..."
                    variant="outlined"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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
                                <IconButton onClick={handleSend} edge="end" className={styles.sendButton}>
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
