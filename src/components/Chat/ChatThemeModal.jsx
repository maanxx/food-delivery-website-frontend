import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    updateConversationTheme,
    loadConversationTheme,
    selectConversationTheme,
} from "@features/chat/chatSlice";
import styles from "./ChatThemeModal.module.css";

// ─── preset themes ──────────────────────────────────────────────────────────
const PRESET_COLORS = [
    "#ff914c", "#f44336", "#e91e63", "#9c27b0", "#673ab7",
    "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688",
    "#4caf50", "#8bc34a", "#cddc39", "#ffc107", "#ff5722",
];

const PRESET_GRADIENTS = [
    { start: "#ff914c", end: "#ff6b35", label: "Eatsy Orange" },
    { start: "#667eea", end: "#764ba2", label: "Purple Dream" },
    { start: "#f093fb", end: "#f5576c", label: "Rose Bud" },
    { start: "#4facfe", end: "#00f2fe", label: "Ocean" },
    { start: "#43e97b", end: "#38f9d7", label: "Mint" },
    { start: "#fa709a", end: "#fee140", label: "Sunset" },
    { start: "#a18cd1", end: "#fbc2eb", label: "Lavender" },
    { start: "#30cfd0", end: "#330867", label: "Midnight" },
];

// ─── Preview Component ───────────────────────────────────────────────────────
const ThemePreview = ({ theme }) => {
    const bgStyle = buildBgStyle(theme);
    return (
        <div className={styles.previewContainer} style={bgStyle}>
            <div className={styles.previewMessages}>
                {/* Received */}
                <div className={`${styles.previewBubble} ${styles.received}`}>
                    <span>Hey! How are you? 👋</span>
                </div>
                {/* Sent */}
                <div className={`${styles.previewBubble} ${styles.sent}`}>
                    <span>I'm great, thanks! 😊</span>
                </div>
                {/* Received */}
                <div className={`${styles.previewBubble} ${styles.received}`}>
                    <span>Love this new theme!</span>
                </div>
            </div>
        </div>
    );
};

// ─── Build background CSS from theme object ──────────────────────────────────
export const buildBgStyle = (theme) => {
    if (!theme || theme.themeType === "default") return {};
    switch (theme.themeType) {
        case "dark":
            return { background: "#1a1a2e" };
        case "color":
            return { background: theme.backgroundColor || "#ff914c" };
        case "gradient":
            return {
                background: `linear-gradient(135deg, ${theme.gradientStart || "#ff914c"}, ${theme.gradientEnd || "#ff6b35"})`,
            };
        case "image":
            return theme.backgroundImage
                ? {
                      backgroundImage: `url(${theme.backgroundImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                  }
                : {};
        default:
            return {};
    }
};

// ─── Main Modal Component ─────────────────────────────────────────────────────
const ChatThemeModal = ({ visible, onClose, conversationId }) => {
    const dispatch = useDispatch();
    const savedTheme = useSelector(selectConversationTheme(conversationId));

    const [activeTab, setActiveTab] = useState("default"); // default | dark | color | gradient | image
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
    const [customColor, setCustomColor] = useState("#ff914c");
    const [selectedGradient, setSelectedGradient] = useState(PRESET_GRADIENTS[0]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const fileInputRef = useRef(null);

    // Build preview theme from current selections
    const previewTheme = (() => {
        switch (activeTab) {
            case "dark":
                return { themeType: "dark" };
            case "color":
                return { themeType: "color", backgroundColor: customColor || selectedColor };
            case "gradient":
                return {
                    themeType: "gradient",
                    gradientStart: selectedGradient.start,
                    gradientEnd: selectedGradient.end,
                };
            case "image":
                return { themeType: "image", backgroundImage: imagePreviewUrl };
            default:
                return { themeType: "default" };
        }
    })();

    // Load saved theme on mount
    useEffect(() => {
        if (visible && conversationId) {
            dispatch(loadConversationTheme(conversationId));
        }
    }, [visible, conversationId, dispatch]);

    // Sync saved theme into local state only when modal opens
    useEffect(() => {
        if (visible && savedTheme?.themeType) {
            setActiveTab(savedTheme.themeType);
            if (savedTheme.backgroundColor && savedTheme.backgroundColor !== customColor) {
                setCustomColor(savedTheme.backgroundColor);
                setSelectedColor(savedTheme.backgroundColor);
            }
            if (savedTheme.gradientStart) {
                setSelectedGradient({
                    start: savedTheme.gradientStart,
                    end: savedTheme.gradientEnd,
                    label: "Custom",
                });
            }
            if (savedTheme.backgroundImage && savedTheme.backgroundImage !== imagePreviewUrl) {
                setImagePreviewUrl(savedTheme.backgroundImage);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const handleImageChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const url = URL.createObjectURL(file);
        setImagePreviewUrl(url);
        setActiveTab("image");
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        const themeData = { themeType: activeTab };

        if (activeTab === "color") {
            themeData.backgroundColor = customColor || selectedColor;
        } else if (activeTab === "gradient") {
            themeData.gradientStart = selectedGradient.start;
            themeData.gradientEnd = selectedGradient.end;
        } else if (activeTab === "image" && imageFile) {
            themeData.backgroundImage = imageFile;
        }

        console.log(`[ThemeModal] Saving theme:`, themeData);

        try {
            const result = await dispatch(updateConversationTheme({ conversationId, themeData })).unwrap();
            console.log("[ThemeModal] API Response:", result);
            setSaveSuccess(true);
            setTimeout(() => {
                setSaveSuccess(false);
                onClose();
            }, 800);
        } catch (err) {
            console.error("[ThemeModal] Error:", err);
            setSaveError(typeof err === "string" ? err : err?.message || "Failed to save theme");
        } finally {
            setIsSaving(false);
        }
    };

    if (!visible) return null;

    return (
        <div className={styles.overlay} onClick={onClose} id="chat-theme-modal-overlay">
            <div className={styles.modal} onClick={(e) => e.stopPropagation()} id="chat-theme-modal">
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>🎨 Chat Theme</h2>
                    <button className={styles.closeBtn} onClick={onClose} id="theme-modal-close-btn">✕</button>
                </div>

                {/* Preview */}
                <div className={styles.previewSection}>
                    <p className={styles.sectionLabel}>Preview</p>
                    <ThemePreview theme={previewTheme} />
                </div>

                {/* Tab Selector */}
                <div className={styles.tabs}>
                    {[
                        { key: "default", icon: "🏠", label: "Default" },
                        { key: "dark", icon: "🌙", label: "Dark" },
                        { key: "color", icon: "🎨", label: "Color" },
                        { key: "gradient", icon: "✨", label: "Gradient" },
                        { key: "image", icon: "🖼️", label: "Wallpaper" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            id={`theme-tab-${tab.key}`}
                            className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <span className={styles.tabIcon}>{tab.icon}</span>
                            <span className={styles.tabLabel}>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className={styles.tabContent}>
                    {/* DEFAULT */}
                    {activeTab === "default" && (
                        <div className={styles.defaultContent}>
                            <p className={styles.hint}>Standard white background. Clean and minimal.</p>
                            <div className={styles.defaultPreview} />
                        </div>
                    )}

                    {/* DARK */}
                    {activeTab === "dark" && (
                        <div className={styles.defaultContent}>
                            <p className={styles.hint}>Dark mode for comfortable night-time chatting.</p>
                            <div className={styles.darkPreview} />
                        </div>
                    )}

                    {/* SOLID COLOR */}
                    {activeTab === "color" && (
                        <div className={styles.colorGrid}>
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    id={`color-swatch-${c.replace("#", "")}`}
                                    className={`${styles.colorSwatch} ${
                                        customColor === c ? styles.selectedSwatch : ""
                                    }`}
                                    style={{ background: c }}
                                    onClick={() => {
                                        setSelectedColor(c);
                                        setCustomColor(c);
                                    }}
                                />
                            ))}
                            {/* Custom color picker */}
                            <div className={styles.customColorRow}>
                                <label htmlFor="custom-color-input" className={styles.hint}>
                                    Custom color:
                                </label>
                                <input
                                    id="custom-color-input"
                                    type="color"
                                    value={customColor}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    className={styles.colorPicker}
                                />
                                <span className={styles.colorHex}>{customColor}</span>
                            </div>
                        </div>
                    )}

                    {/* GRADIENT */}
                    {activeTab === "gradient" && (
                        <div className={styles.gradientGrid}>
                            {PRESET_GRADIENTS.map((g) => (
                                <button
                                    key={g.label}
                                    id={`gradient-${g.label.toLowerCase().replace(/\s/g, "-")}`}
                                    className={`${styles.gradientSwatch} ${
                                        selectedGradient.label === g.label ? styles.selectedGradient : ""
                                    }`}
                                    style={{
                                        background: `linear-gradient(135deg, ${g.start}, ${g.end})`,
                                    }}
                                    onClick={() => setSelectedGradient(g)}
                                >
                                    <span className={styles.gradientLabel}>{g.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* WALLPAPER IMAGE */}
                    {activeTab === "image" && (
                        <div className={styles.imageSection}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                id="wallpaper-file-input"
                                style={{ display: "none" }}
                                onChange={handleImageChange}
                            />
                            <button
                                className={styles.uploadBtn}
                                id="upload-wallpaper-btn"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                📁 Choose Wallpaper
                            </button>
                            {imagePreviewUrl && (
                                <div className={styles.imagePreviewWrapper}>
                                    <img
                                        src={imagePreviewUrl}
                                        alt="Wallpaper preview"
                                        className={styles.imagePreview}
                                    />
                                    <button
                                        className={styles.removeImageBtn}
                                        onClick={() => {
                                            setImageFile(null);
                                            setImagePreviewUrl(null);
                                            setActiveTab("default");
                                        }}
                                    >
                                        ✕ Remove
                                    </button>
                                </div>
                            )}
                            <p className={styles.hint}>Supported: JPG, PNG, GIF, WebP (max 10 MB)</p>
                        </div>
                    )}
                </div>

                {/* Error / Success */}
                {saveError && <p className={styles.errorMsg}>⚠️ {saveError}</p>}
                {saveSuccess && <p className={styles.successMsg}>✅ Theme saved!</p>}

                {/* Footer */}
                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose} disabled={isSaving} id="theme-cancel-btn">
                        Cancel
                    </button>
                    <button
                        className={styles.saveBtn}
                        onClick={handleSave}
                        disabled={isSaving}
                        id="theme-save-btn"
                    >
                        {isSaving ? "Saving…" : "Apply Theme"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatThemeModal;
