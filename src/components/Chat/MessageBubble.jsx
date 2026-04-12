import React, { useState, useEffect } from "react";
import { Avatar } from "antd";
import styles from "./ChatWindow.module.css";
import { formatTime, formatFileSize } from "@utils/formatters";
import { getFirstLetterOfEachWord } from "@helpers/stringHelper";

const MessageBubble = ({ message, isOwn, showAvatar, showTimestamp, onDelete, conversationId }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    // Close menu when clicking outside (must be called unconditionally before returns)
    useEffect(() => {
        if (showMenu) {
            const handleCloseMenu = () => {
                setShowMenu(false);
            };
            document.addEventListener("click", handleCloseMenu);
            return () => document.removeEventListener("click", handleCloseMenu);
        }
    }, [showMenu]);

    if (!message) {
        return null;
    }

    const getSeenStatus = () => {
        if (!message) return null;

        if (message.isRead === true || message.status === "seen") {
            return (
                <span className={styles.seen} title="Seen">
                    {/* ✓✓ */}
                </span>
            );
        }
        if (message.status === "delivered") {
            return (
                <span className={styles.delivered} title="Delivered">
                    {/* ✓ */}
                </span>
            );
        }
        return (
            <span className={styles.sent} title="Sent">
                {/* ✓ */}
            </span>
        );
    };

    const renderContent = () => {
        if (!message || !message.type) {
            return <p className={styles.messageText}>{message?.content || "Message"}</p>;
        }

        switch (message.type) {
            case "text":
                return <p className={styles.messageText}>{message.content || ""}</p>;

            case "image":
                return (
                    <div style={{ maxWidth: "300px" }}>
                        {Array.isArray(message.attachments) &&
                            message.attachments.map((att) => (
                                <img
                                    key={att?.fileId}
                                    src={att?.fileUrl}
                                    alt={att?.fileName}
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "300px",
                                        borderRadius: "8px",
                                        marginBottom: "4px",
                                    }}
                                />
                            ))}
                        {message.content && <p className={styles.messageText}>{message.content}</p>}
                    </div>
                );

            case "voice":
                return (
                    <div>
                        {Array.isArray(message.attachments) && message.attachments[0] && (
                            <audio
                                controls
                                style={{ maxWidth: "200px", marginBottom: "4px" }}
                                src={message.attachments[0].fileUrl}
                            />
                        )}
                        {message.content && <p className={styles.messageText}>{message.content}</p>}
                    </div>
                );

            case "file":
                return (
                    <div>
                        {Array.isArray(message.attachments) &&
                            message.attachments.map((att) => (
                                <a
                                    key={att?.fileId}
                                    href={att?.fileUrl}
                                    download={att?.fileName}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "8px",
                                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                                        borderRadius: "6px",
                                        textDecoration: "none",
                                        color: "inherit",
                                        marginBottom: "4px",
                                    }}
                                >
                                    <span>📎</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontWeight: 500,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {att?.fileName}
                                        </div>
                                        <div style={{ fontSize: "11px", opacity: 0.7 }}>
                                            {att?.fileSize ? formatFileSize(att.fileSize) : ""}
                                        </div>
                                    </div>
                                </a>
                            ))}
                    </div>
                );

            default:
                return null;
        }
    };

    if (message.isDeleted) {
        return (
            <div className={`${styles.messageBubble} ${isOwn ? styles.own : styles.other}`}>
                <div className={styles.bubbleContent} style={{ opacity: 0.5, fontStyle: "italic" }}>
                    This message was deleted
                </div>
            </div>
        );
    }

    const handleContextMenu = (e) => {
        if (isOwn && !message.isDeleted) {
            e.preventDefault();
            setMenuPosition({
                top: e.clientY,
                left: e.clientX,
            });
            setShowMenu(true);
        }
    };

    const handleDelete = async () => {
        if (onDelete && conversationId && message.messageId) {
            try {
                await onDelete(conversationId, message.messageId);
                setShowMenu(false);
            } catch (error) {
                console.error("Failed to delete message:", error);
            }
        }
    };

    return (
        <div
            className={`${styles.messageBubble} ${isOwn ? styles.own : styles.other}`}
            onContextMenu={handleContextMenu}
            style={{ position: "relative" }}
        >
            {showAvatar && !isOwn && (
                <Avatar
                    size={32}
                    src={message?.senderAvatar || null}
                    style={{
                        backgroundColor: "#1890ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "12px",
                        marginRight: "8px",
                        flexShrink: 0,
                    }}
                >
                    {!message?.senderAvatar && message?.senderName
                        ? getFirstLetterOfEachWord(message.senderName).children
                        : "U"}
                </Avatar>
            )}

            <div className={styles.bubbleContent}>
                {renderContent()}

                <div className={styles.messageFooter}>
                    {showTimestamp && message.createdAt && (
                        <span className={styles.timestamp}>{formatTime(message.createdAt)}</span>
                    )}
                    {isOwn && getSeenStatus()}
                </div>
            </div>

            {/* Context Menu */}
            {showMenu && isOwn && !message.isDeleted && (
                <div
                    style={{
                        position: "fixed",
                        top: `${menuPosition.top}px`,
                        left: `${menuPosition.left}px`,
                        backgroundColor: "white",
                        border: "1px solid #e0e0e0",
                        borderRadius: "6px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        zIndex: 1000,
                        minWidth: "120px",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={handleDelete}
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "8px 12px",
                            border: "none",
                            background: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: "#d32f2f",
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = "#ffebee")}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                    >
                        🗑️ Xóa
                    </button>
                </div>
            )}
        </div>
    );
};

export default MessageBubble;
