import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    updateNotificationSettings,
    loadNotificationSettings,
    selectNotificationSettings,
} from "@features/chat/chatSlice";
import styles from "./MuteNotificationsModal.module.css";

const MUTE_OPTIONS = [
    { key: "1_hour", label: "Mute for 1 hour", icon: "⏰" },
    { key: "8_hours", label: "Mute for 8 hours", icon: "🌙" },
    { key: "24_hours", label: "Mute for 24 hours", icon: "📅" },
    { key: "forever", label: "Mute forever", icon: "🔕" },
];

const formatMuteUntil = (muteUntil) => {
    if (!muteUntil) return "";
    const d = new Date(muteUntil);
    const now = new Date();
    const diffMs = d - now;
    if (diffMs <= 0) return "Expired";

    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHrs >= 24) {
        return `Until ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
    }
    if (diffHrs > 0) return `${diffHrs}h ${diffMins}m remaining`;
    return `${diffMins}m remaining`;
};

const MuteNotificationsModal = ({ visible, onClose, conversationId }) => {
    const dispatch = useDispatch();
    const notifSettings = useSelector(selectNotificationSettings(conversationId));

    const [selectedOption, setSelectedOption] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Load current mute status on open
    useEffect(() => {
        if (visible && conversationId) {
            dispatch(loadNotificationSettings(conversationId));
        }
    }, [visible, conversationId, dispatch]);

    const handleApply = async () => {
        if (!selectedOption) return;
        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);
        console.log(`[MuteModal] Toggling mute: ${selectedOption} for ${conversationId}`);
        try {
            const result = await dispatch(updateNotificationSettings({ conversationId, type: selectedOption })).unwrap();
            console.log("[MuteModal] API Response:", result);
            setSaveSuccess(true);
            setTimeout(() => {
                setSaveSuccess(false);
                onClose();
            }, 700);
        } catch (err) {
            console.error("[MuteModal] Error:", err);
            setSaveError(typeof err === "string" ? err : err?.message || "Failed to update notifications");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUnmute = async () => {
        setIsSaving(true);
        setSaveError(null);
        console.log(`[MuteModal] Unmuting: ${conversationId}`);
        try {
            const result = await dispatch(updateNotificationSettings({ conversationId, type: "unmute" })).unwrap();
            console.log("[MuteModal] API Response:", result);
            setSaveSuccess(true);
            setTimeout(() => {
                setSaveSuccess(false);
                onClose();
            }, 700);
        } catch (err) {
            console.error("[MuteModal] Error:", err);
            setSaveError(typeof err === "string" ? err : err?.message || "Failed to unmute");
        } finally {
            setIsSaving(false);
        }
    };

    if (!visible) return null;

    const isMuted = notifSettings?.isMuted;
    const muteUntil = notifSettings?.muteUntil;
    const isMutedForever = notifSettings?.isMutedForever;

    return (
        <div className={styles.overlay} onClick={onClose} id="mute-modal-overlay">
            <div className={styles.modal} onClick={(e) => e.stopPropagation()} id="mute-notifications-modal">
                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.headerIcon}>{isMuted ? "🔕" : "🔔"}</span>
                    <h2 className={styles.title}>Notifications</h2>
                    <button className={styles.closeBtn} onClick={onClose} id="mute-modal-close-btn">✕</button>
                </div>

                {/* Current Status */}
                {isMuted && (
                    <div className={styles.statusBadge}>
                        {isMutedForever ? (
                            <>🔕 Muted forever</>
                        ) : (
                            <>🔕 {formatMuteUntil(muteUntil)}</>
                        )}
                    </div>
                )}

                {/* Mute Options */}
                <div className={styles.optionsList}>
                    <p className={styles.sectionLabel}>Mute notifications</p>
                    {MUTE_OPTIONS.map((opt) => (
                        <button
                            key={opt.key}
                            id={`mute-option-${opt.key}`}
                            className={`${styles.optionItem} ${selectedOption === opt.key ? styles.selectedOption : ""}`}
                            onClick={() => setSelectedOption(opt.key)}
                        >
                            <span className={styles.optionIcon}>{opt.icon}</span>
                            <span className={styles.optionLabel}>{opt.label}</span>
                            <span className={styles.optionCheck}>
                                {selectedOption === opt.key && "✓"}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Error / Success */}
                {saveError && <p className={styles.errorMsg}>⚠️ {saveError}</p>}
                {saveSuccess && <p className={styles.successMsg}>✅ Done!</p>}

                {/* Footer */}
                <div className={styles.footer}>
                    {isMuted && (
                        <button
                            className={styles.unmuteBtn}
                            onClick={handleUnmute}
                            disabled={isSaving}
                            id="unmute-btn"
                        >
                            🔔 Unmute
                        </button>
                    )}
                    <button className={styles.cancelBtn} onClick={onClose} disabled={isSaving} id="mute-cancel-btn">
                        Cancel
                    </button>
                    <button
                        className={styles.applyBtn}
                        onClick={handleApply}
                        disabled={!selectedOption || isSaving}
                        id="mute-apply-btn"
                    >
                        {isSaving ? "Saving…" : "Apply"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MuteNotificationsModal;
