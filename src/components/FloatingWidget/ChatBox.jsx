import React, { useState } from "react";
import { Box, Paper, Typography, IconButton, Tabs, Tab, TextField, InputAdornment, Avatar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import styles from "./ChatBox.module.css";

const ChatBox = ({ onClose }) => {
    const [tab, setTab] = useState(0);
    const [message, setMessage] = useState("");

    const aiMessages = [
        { id: 1, sender: "ai", text: "Xin chào! Tôi là trợ lý AI của Eatsy. Tôi có thể giúp gì cho bạn hôm nay?" },
        { id: 2, sender: "user", text: "Cho tôi hỏi cách chọn món ăn bằng AI?" },
        { id: 3, sender: "ai", text: "Bạn chỉ cần gửi yêu cầu về món ăn bạn thích, phần còn lại hãy để AI của Eatsy lo nhé!" }
    ];

    const adminMessages = [
        { id: 1, sender: "admin", text: "Chào bạn, mình là nhân viên hỗ trợ của hệ thống thực phẩm Eatery. Bạn đang gặp khó khăn gì ạ?" }
    ];

    const messages = tab === 0 ? aiMessages : adminMessages;

    const handleSend = () => {
        if (!message.trim()) return;
        // In static mode, just clear the input text. Real implementation will append to array.
        console.log("Sent msg:", message);
        setMessage("");
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
                    const isUser = msg.sender === "user";
                    const rowClass = isUser ? styles.messageRowUser : styles.messageRowBot;
                    const bubbleClass = isUser ? styles.messageBubbleUser : styles.messageBubbleBot;

                    return (
                        <Box key={msg.id} className={`${styles.messageRow} ${rowClass}`}>
                            {!isUser && (
                                <Avatar className={tab === 0 ? styles.aiAvatar : styles.adminAvatar}>
                                    {tab === 0 ? <SmartToyIcon fontSize="small"/> : <SupportAgentIcon fontSize="small"/>}
                                </Avatar>
                            )}
                            <Box className={`${styles.messageBubble} ${bubbleClass}`}>
                                <Typography variant="body2" sx={{ lineHeight: 1.4 }}>{msg.text}</Typography>
                            </Box>
                        </Box>
                    );
                })}
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
