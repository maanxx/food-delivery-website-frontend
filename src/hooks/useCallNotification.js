import { useEffect, useState } from "react";

const useCallNotification = (incomingCall) => {
    const [notificationId, setNotificationId] = useState(null);

    useEffect(() => {
        // Request notification permission if not already granted
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission().catch((error) => {
                console.warn("Notification permission not granted:", error);
            });
        }
    }, []);

    useEffect(() => {
        if (!incomingCall || !("Notification" in window)) {
            return;
        }

        // Show notification for incoming call
        if (Notification.permission === "granted") {
            try {
                const notification = new Notification("Incoming Call", {
                    body: `${incomingCall.fromUserName || "Someone"} is calling you...`,
                    icon: "📞",
                    tag: `call-${incomingCall.callId}`,
                    requireInteraction: true,
                    badge: "📱",
                });

                // Close notification when call ends
                setNotificationId(notification);

                // Auto-close after 30 seconds if not closed
                const timeout = setTimeout(() => {
                    notification.close();
                }, 30000);

                return () => {
                    clearTimeout(timeout);
                    notification.close();
                };
            } catch (error) {
                console.error("Failed to show notification:", error);
            }
        }
    }, [incomingCall]);

    // Close notification when component unmounts
    useEffect(() => {
        return () => {
            if (notificationId) {
                notificationId.close();
            }
        };
    }, [notificationId]);

    // Request notification permission
    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            return false;
        }

        if (Notification.permission === "granted") {
            return true;
        }

        if (Notification.permission !== "denied") {
            try {
                const permission = await Notification.requestPermission();
                return permission === "granted";
            } catch (error) {
                console.error("Failed to request notification permission:", error);
                return false;
            }
        }

        return false;
    };

    return {
        isNotificationSupported: "Notification" in window,
        hasNotificationPermission: Notification.permission === "granted",
        requestNotificationPermission,
    };
};

export default useCallNotification;
