import React, { useRef, useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import styles from "./MessageInput.module.css";
import useWebSocket from "@hooks/useWebSocket";
import { sendMessage, setSendingMessageId, addMessage } from "@features/chat/chatSlice";
import { getUserInfo } from "@helpers/cookieHelper";

const MessageInput = ({ conversationId }) => {
    const dispatch = useDispatch();
    const { sendMessage: emitMessage, emitTyping } = useWebSocket();

    const [content, setContent] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Handle typing indicator
    const handleInput = useCallback(
        (e) => {
            setContent(e.target.value);

            if (!isTyping) {
                setIsTyping(true);
                emitTyping({ conversationId, isTyping: true });
            }

            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                emitTyping({ conversationId, isTyping: false });
            }, 3000);
        },
        [conversationId, emitTyping, isTyping],
    );

    // Handle file selection
    const handleFileSelect = useCallback((e) => {
        const files = Array.from(e.target.files || []);
        setAttachments((prev) => [...prev, ...files]);
    }, []);

    // Remove attachment
    const removeAttachment = useCallback((index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    }, []);

    // Auto-focus textarea after sending message (when content becomes empty)
    useEffect(() => {
        if (content === "" && !isSending && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [content, isSending]);

    // Reset state when conversation changes
    useEffect(() => {
        setIsSending(false);
        setContent("");
        setAttachments([]);
        setIsTyping(false);
    }, [conversationId]);

    // Send message
    const handleSendMessage = useCallback(
        async (e) => {
            e.preventDefault();

            if ((!content.trim() && attachments.length === 0) || isSending) {
                return;
            }

            setIsSending(true);
            const temporaryId = `temp-${Date.now()}`;

            // Get current user info for optimistic update
            const userInfo = getUserInfo();
            const senderId = userInfo?.sub || userInfo?.user_id || userInfo?.userId || userInfo?.id;

            const messageContent = content.trim();
            const messageType =
                attachments.length > 0 ? (attachments[0].type?.startsWith("image") ? "image" : "file") : "text";

            try {
                // 🚀 OPTIMISTIC UPDATE - Add message to UI immediately
                const optimisticMessage = {
                    messageId: temporaryId,
                    conversationId,
                    senderId,
                    senderName: userInfo?.name || "You",
                    senderAvatar: userInfo?.avatar,
                    content: messageContent,
                    type: messageType,
                    createdAt: new Date().toISOString(),
                    status: "sending",
                    isRead: true,
                    attachments: attachments,
                };

                dispatch(addMessage({ conversationId, message: optimisticMessage }));

                // Reset input immediately (better UX)
                setContent("");
                setAttachments([]);
                setIsTyping(false);
                emitTyping({ conversationId, isTyping: false });

                // Dispatch async thunk to send to server
                const result = await dispatch(
                    sendMessage({
                        conversationId,
                        content: messageContent,
                        type: messageType,
                        files: attachments,
                    }),
                ).unwrap();

                // Emit via WebSocket for real-time delivery to others
                emitMessage({
                    conversationId,
                    content: messageContent,
                    type: messageType,
                    attachments: attachments.map((f) => ({ name: f.name, size: f.size })),
                    temporaryId,
                });
            } catch (error) {
                console.error("Failed to send message:", error);
            } finally {
                setIsSending(false);
            }
        },
        [content, attachments, conversationId, dispatch, isSending, emitMessage, emitTyping],
    );

    // Auto-expand textarea
    const handleTextareaChange = useCallback(
        (e) => {
            handleInput(e);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
        },
        [handleInput],
    );

    return (
        <form className={styles.inputContainer} onSubmit={handleSendMessage}>
            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className={styles.attachmentsPreview}>
                    {attachments.map((file, index) => (
                        <div key={index} className={styles.attachmentItem}>
                            {file.type?.startsWith("image") ? (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="attachment"
                                    className={styles.attachmentImage}
                                />
                            ) : (
                                <div className={styles.attachmentFile}>📎 {file.name}</div>
                            )}
                            <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={() => removeAttachment(index)}
                                title="Remove"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Actions */}
            <div className={styles.actionsBar}>
                <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach file"
                >
                    📎
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                    accept="image/*,video/*,.pdf,.doc,.docx"
                />

                <button type="button" className={styles.actionBtn} title="Emoji">
                    😊
                </button>

                <textarea
                    ref={inputRef}
                    value={content}
                    onChange={handleTextareaChange}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                        }
                    }}
                    placeholder="Type a message..."
                    className={styles.input}
                    rows={1}
                />

                <button
                    type="submit"
                    className={`${styles.actionBtn} ${styles.sendBtn}`}
                    disabled={(!content.trim() && attachments.length === 0) || isSending}
                    title="Send message"
                >
                    {isSending ? "⏳" : "📤"}
                </button>
            </div>
        </form>
    );
};

export default MessageInput;
