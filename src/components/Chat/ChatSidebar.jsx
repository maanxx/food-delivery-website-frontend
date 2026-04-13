import React, { useState } from "react";
import { Avatar, message } from "antd";
import {
    BarsOutlined,
    UserOutlined,
    BellOutlined,
    SearchOutlined,
    InfoCircleOutlined,
    EditOutlined,
    FileOutlined,
    RightOutlined,
} from "@ant-design/icons";
import styles from "./ChatSidebar.module.css";
import { getFirstLetterOfEachWord } from "@helpers/stringHelper";

const ChatSidebar = ({ conversation, onClose }) => {
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const menuItems = [
        {
            id: "info",
            label: "Chat Information",
            icon: <InfoCircleOutlined />,
            content: (
                <div className={styles.sectionContent}>
                    <div className={styles.infoItem}>
                        <span>Name:</span>
                        <p>{conversation?.name}</p>
                    </div>
                    {conversation?.conversationType === "group" && (
                        <div className={styles.infoItem}>
                            <span>Members:</span>
                            <p>{conversation?.participantIds?.length || 0} people</p>
                        </div>
                    )}
                    <div className={styles.infoItem}>
                        <span>Type:</span>
                        <p>{conversation?.conversationType === "group" ? "Group" : "Personal"}</p>
                    </div>
                </div>
            ),
        },
        {
            id: "customize",
            label: "Customize Chat",
            icon: <EditOutlined />,
            content: (
                <div className={styles.sectionContent}>
                    <button className={styles.customizeBtn}>🔔 Mute Notifications</button>
                    <button className={styles.customizeBtn}>🎨 Change Color</button>
                    <button className={styles.customizeBtn}>⭐ Mark as Favorite</button>
                    <button className={styles.customizeBtn} style={{ color: "#ff4d4f" }}>
                        🗑️ Delete Chat
                    </button>
                </div>
            ),
        },
        {
            id: "files",
            label: "Media & Files",
            icon: <FileOutlined />,
            content: (
                <div className={styles.sectionContent}>
                    <div className={styles.fileList}>
                        <p className={styles.emptyFiles}>No media files</p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className={styles.sidebar}>
            {/* Close Button */}
            <button className={styles.closeBtn} onClick={onClose}>
                ×
            </button>

            {/* Profile Section */}
            <div className={styles.profileSection}>
                <Avatar
                    size={56}
                    src={conversation?.avatarPath || conversation?.avatar_path || null}
                    style={{
                        backgroundColor: "#1890ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "20px",
                    }}
                >
                    {!conversation?.avatarPath && !conversation?.avatar_path && conversation?.name
                        ? getFirstLetterOfEachWord(conversation.name).children
                        : "U"}
                </Avatar>
                <h3 className={styles.profileName}>{conversation?.name}</h3>
                <p className={styles.encryptionStatus}>🔒 End-to-end encrypted</p>
            </div>

            {/* Navigation Options */}
            <div className={styles.navOptions}>
                <button className={styles.navOption} title="Profile">
                    <UserOutlined />
                    <span>Profile</span>
                </button>
                <button className={styles.navOption} title="Notifications">
                    <BellOutlined />
                    <span>Notifications</span>
                </button>
                <button className={styles.navOption} title="Search">
                    <SearchOutlined />
                    <span>Search</span>
                </button>
            </div>

            {/* Menu Sections */}
            <div className={styles.menuSections}>
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        className={`${styles.menuItem} ${expandedSection === item.id ? styles.expanded : ""}`}
                    >
                        <button className={styles.menuItemHeader} onClick={() => toggleSection(item.id)}>
                            <span className={styles.menuItemLabel}>{item.label}</span>
                            <RightOutlined className={styles.expandIcon} />
                        </button>
                        {expandedSection === item.id && item.content}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatSidebar;
