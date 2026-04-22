import { useCallback, useEffect, useRef, useState } from "react";
import { getUserInfo } from "@helpers/cookieHelper";
import callService from "@services/callService";
import { getSimplePeer } from "@utils/SimplePeerShim";

const useCall = (socket) => {
    const userInfo = getUserInfo();
    const userId = userInfo?.sub || userInfo?.user_id || userInfo?.userId || userInfo?.id;

    const [callState, setCallState] = useState({
        inCall: false,
        incomingCall: null,
        callId: null, // Actual call ID from backend
        outgoingCallId: null,
        callType: null, // 'voice' or 'video'
        remoteUserId: null,
        remoteUserName: null,
        callDuration: 0,
        peer: null,
        localStream: null,
        remoteStream: null,
        error: null,
    });

    const peerRef = useRef(null);
    const callTimerRef = useRef(null);
    const streamRef = useRef(null);
    const remoteUserIdRef = useRef(null); // Track remote user ID for endCall
    const callIdRef = useRef(null); // Track callId for WebRTC signals
    const recipientIdRef = useRef(null); // Track recipientId for WebRTC signals
    const callStartTimeRef = useRef(null); // Track when call started for duration calculation
    const callConversationIdRef = useRef(null); // Track conversation ID for saving call message
    const callTypeRef = useRef(null); // Track call type (voice/video)
    const isCleaningUpRef = useRef(false); // Prevent recursive cleanup
    const peerReadyRef = useRef(false); // Track if peer is ready to receive signals
    const pendingSignalsRef = useRef([]); // Queue signals if peer not ready
    const answerRetryCountRef = useRef(0); // Track answer retry attempts
    const signalsProcessedRef = useRef({ offers: 0, answers: 0, iceCandidates: 0 }); // Track signal counts

    // Process queued signals when peer is ready
    const processPendingSignals = useCallback(() => {
        console.log(
            `🔄 [processPendingSignals] CALLED - peer: ${!!peerRef.current}, ready: ${peerReadyRef.current}, cleaning: ${isCleaningUpRef.current}, pending: ${pendingSignalsRef.current.length}`,
        );

        if (!peerRef.current) {
            console.warn("   ❌ No peer yet!");
            return;
        }
        if (!peerReadyRef.current) {
            console.warn("   ❌ Peer not ready yet!");
            return;
        }
        if (isCleaningUpRef.current) {
            console.warn("   ❌ Cleanup in progress!");
            return;
        }

        console.log(`   ✅ Processing ${pendingSignalsRef.current.length} pending signals...`);

        while (pendingSignalsRef.current.length > 0) {
            const signal = pendingSignalsRef.current.shift();
            console.log(`   📤 Processing: ${signal.type} (received ${Date.now() - signal.receivedAt}ms ago)`);

            try {
                if (signal.type === "offer") {
                    console.log("      Signaling OFFER to peer...");
                    if (!signal.data || !signal.data.sdp) {
                        console.error("      ❌ OFFER missing SDP!");
                        continue;
                    }
                    console.log(
                        `      ✅ About to call peer.signal(offer) - offer SDP length: ${signal.data.sdp.length}`,
                    );
                    console.log(`         Peer exists: ${!!peerRef.current}`);
                    console.log(`         Peer.signal type: ${typeof peerRef.current?.signal}`);

                    // CRITICAL: This should trigger peer.on('signal') with answer for non-initiator
                    peerRef.current.signal(signal.data);

                    signalsProcessedRef.current.offers++;
                    console.log(`      ✅ OFFER signaled successfully!`);
                    console.log(`         ⏳ Waiting for SimplePeer to generate answer...`);
                } else if (signal.type === "answer") {
                    console.log("      Signaling ANSWER to peer...");
                    if (!signal.data || !signal.data.sdp) {
                        console.error("      ❌ ANSWER missing SDP!");
                        continue;
                    }
                    peerRef.current.signal(signal.data);
                    signalsProcessedRef.current.answers++;
                    answerRetryCountRef.current = 0;
                    console.log("      ✅ ANSWER signaled successfully");
                } else if (signal.type === "ice") {
                    console.log("      Signaling ICE candidate to peer...");
                    if (!signal.data || !signal.data.candidate) {
                        console.error("      ❌ ICE candidate missing data!");
                        continue;
                    }
                    peerRef.current.signal(signal.data);
                    signalsProcessedRef.current.iceCandidates++;
                    console.log("      ✅ ICE candidate signaled successfully");
                } else {
                    // Generic signal handling
                    console.log("      Signaling generic signal...");
                    peerRef.current.signal(signal.data);
                    console.log("      ✅ Generic signal processed");
                }
            } catch (error) {
                console.error(`      ❌ Error signaling ${signal.type}:`, error.message);
                console.error(`      Stack: ${error.stack}`);
                // Re-queue for retry (only for important signals)
                if ((signal.type === "answer" || signal.type === "offer") && answerRetryCountRef.current < 3) {
                    answerRetryCountRef.current++;
                    pendingSignalsRef.current.unshift(signal);
                    console.warn(
                        `      📋 Re-queuing ${signal.type} for retry (attempt ${answerRetryCountRef.current})`,
                    );
                    break; // Stop processing, try again later
                }
            }
        }

        console.log(
            `🔄 [processPendingSignals] DONE - signals: ${signalsProcessedRef.current.offers} offers, ${signalsProcessedRef.current.answers} answers`,
        );
    }, []);

    // Helper to format call message content
    const formatCallMessage = (callType, duration, status) => {
        const icon = callType === "video" ? "📹" : "📞";
        const callTypeText = callType === "video" ? "Video Call" : "Voice Call";

        if (status === "ended") {
            const formatDuration = (seconds) => {
                if (!seconds || seconds <= 0) return null;
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                if (mins > 0) {
                    return `${mins}m ${secs}s`;
                }
                return `${secs}s`;
            };
            const durationStr = formatDuration(duration);
            return durationStr ? `${icon} ${callTypeText} - ${durationStr}` : `${icon} ${callTypeText}`;
        } else if (status === "cancelled") {
            return `${icon} ${callTypeText} - Cancelled`;
        } else if (status === "missed") {
            return `${icon} ${callTypeText} - Missed`;
        }
        return `${icon} ${callTypeText}`;
    };

    // End call function - defined early to avoid temporal dead zone
    const endCall = useCallback(() => {
        console.log("📵 Ending call...");

        // Prevent recursive cleanup
        if (isCleaningUpRef.current) {
            console.log("📵 Cleanup already in progress, skipping");
            return;
        }
        isCleaningUpRef.current = true;

        // Store reference to stream before destroying peer (SimplePeer might be using it)
        const streamToCleanup = streamRef.current;

        // Close peer connection - with proper error handling
        if (peerRef.current) {
            try {
                console.log("📵 Destroying peer connection...");
                if (typeof peerRef.current.destroy === "function") {
                    // Wrap destroy in setTimeout to allow any in-flight operations to complete
                    setTimeout(() => {
                        try {
                            peerRef.current?.destroy?.();
                            console.log("📵 Peer connection destroyed (async)");
                        } catch (asyncError) {
                            console.error("⚠️ Async error destroying peer:", asyncError);
                        }
                    }, 0);
                } else {
                    console.warn("⚠️ Peer doesn't have destroy method");
                }
            } catch (peerError) {
                console.error("⚠️ Error destroying peer connection:", peerError);
            } finally {
                peerRef.current = null;
            }
        }

        // Stop media tracks AFTER destroying peer (to avoid SimplePeer errors)
        // Use setTimeout to prevent race conditions
        setTimeout(() => {
            if (streamToCleanup) {
                try {
                    console.log("📵 Stopping media tracks...");
                    // Check if it's a real MediaStream with getTracks
                    if (typeof streamToCleanup.getTracks === "function") {
                        streamToCleanup.getTracks().forEach((track) => {
                            try {
                                if (track && typeof track.stop === "function") {
                                    track.stop();
                                    console.log(`📵 Stopped ${track.kind} track`);
                                }
                            } catch (trackError) {
                                console.error("⚠️ Error stopping track:", trackError);
                            }
                        });
                    } else {
                        console.warn("⚠️ Stream object doesn't have getTracks method");
                    }
                } catch (streamError) {
                    console.error("⚠️ Error accessing stream tracks:", streamError);
                }
            }
            // Clear reference after cleanup
            streamRef.current = null;
        }, 50);

        // Emit end call signal BEFORE resetting state - use refs for current values with fallback to state
        try {
            setCallState((prev) => {
                const callIdToEnd = callIdRef.current || prev.callId || prev.outgoingCallId;
                const remoteUserId = remoteUserIdRef.current || prev.remoteUserId;
                const conversationId = callConversationIdRef.current;
                const callType = callTypeRef.current || prev.callType;
                const wasInCall = prev.inCall;

                console.log(
                    `📞 [endCall] Using: callId=${callIdToEnd}, remoteUserId=${remoteUserId}, socket.connected=${socket?.connected}`,
                );

                if (callIdToEnd && remoteUserId && socket && socket.connected) {
                    console.log(`📞 [endCall] Emitting call end signals...`);

                    // Try both event names for compatibility
                    try {
                        socket.emit("cancel_call", {
                            callId: callIdToEnd,
                            toUserId: remoteUserId,
                        });
                        console.log(`✅ [endCall] cancel_call emitted`);
                    } catch (err) {
                        console.error(`❌ [endCall] Error emitting cancel_call:`, err);
                    }

                    // Also try call_cancelled as backup
                    try {
                        socket.emit("call_cancelled", {
                            callId: callIdToEnd,
                            toUserId: remoteUserId,
                        });
                        console.log(`✅ [endCall] call_cancelled emitted`);
                    } catch (err) {
                        console.error(`❌ [endCall] Error emitting call_cancelled:`, err);
                    }
                } else {
                    console.warn(
                        `⚠️ [endCall] Cannot emit: callId=${callIdToEnd}, remoteUserId=${remoteUserId}, socket=${socket?.connected ? "connected" : "disconnected"}`,
                    );
                }

                // Determine call status and save message
                if (conversationId && callType) {
                    const duration = wasInCall ? prev.callDuration : 0; // Only count duration if call was active
                    const status = wasInCall ? "ended" : "cancelled"; // "cancelled" if never entered active call

                    console.log(`💬 [endCall] Will save call message: status=${status}, duration=${duration}s`);
                    // Save call message after state update completes
                    setTimeout(() => {
                        if (socket && socket.connected) {
                            socket.emit("save_call_message", {
                                conversationId,
                                content: formatCallMessage(callType, duration, status),
                                type: "system_call",
                                callData: {
                                    callId: callIdToEnd,
                                    callType,
                                    duration,
                                    status,
                                },
                            });
                            console.log("✅ [endCall] Call message emitted");
                        }
                    }, 100);
                }

                return prev;
            });
        } catch (error) {
            console.error("⚠️ Error in endCall emit logic:", error);
        }

        // Reset state
        setCallState((prev) => ({
            ...prev,
            inCall: false,
            callId: null,
            incomingCall: null,
            outgoingCallId: null,
            remoteStream: null,
            localStream: null,
            callDuration: 0,
            callType: null,
            remoteUserId: null,
        }));

        remoteUserIdRef.current = null;
        callIdRef.current = null;
        recipientIdRef.current = null;
        callStartTimeRef.current = null;
        callConversationIdRef.current = null;
        callTypeRef.current = null;

        // Reset WebRTC signal state for next call
        pendingSignalsRef.current = [];
        peerReadyRef.current = false;
        signalsProcessedRef.current = { offers: 0, answers: 0, iceCandidates: 0 };
        answerRetryCountRef.current = 0;
        console.log("📵 [endCall] Signal state reset for next call");

        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
        }

        // Allow cleanup to be called again
        isCleaningUpRef.current = false;
    }, [socket]);

    // Timer for call duration
    useEffect(() => {
        if (callState.inCall) {
            callTimerRef.current = setInterval(() => {
                setCallState((prev) => ({
                    ...prev,
                    callDuration: prev.callDuration + 1,
                }));
            }, 1000);
        } else {
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
            }
        }

        return () => {
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
            }
        };
    }, [callState.inCall]);

    // Listen for incoming calls
    useEffect(() => {
        if (!socket) {
            console.warn("⚠️ Socket not connected yet, waiting to register incoming_call listener");
            return;
        }

        console.log("✅ Registering call event listeners on socket:", socket.id);
        console.log(
            "   Events to register: incoming_call, call_accepted, call_rejected, cancel_call, call_cancelled, call_ended, ice_candidate, offer, answer",
        );

        socket.on("incoming_call", (data) => {
            console.log("📞 Incoming call received:", data);
            // Normalize field names from backend (callerId → fromUserId, callerName → fromUserName)
            setCallState((prev) => ({
                ...prev,
                callId: data.callId || data.id,
                incomingCall: {
                    callId: data.callId || data.id,
                    fromUserId: data.callerId || data.initiator_id,
                    fromUserName: data.callerName || data.caller_name,
                    fromUserAvatar: data.callerAvatar || data.caller_avatar,
                    callType: data.callType || data.call_type,
                    conversationId: data.conversationId || data.conversation_id,
                    timestamp: data.timestamp,
                },
            }));
        });

        socket.on("call_accepted", (data) => {
            console.log("✅ [socket.call_accepted] Call accepted by recipient:", data);
            console.log("✅ [socket.call_accepted] Event data contains:", {
                callId: data.callId,
                id: data.id,
                recipientName: data.recipientName,
                hasAnswer: !!data.answer,
                hasAnswerField: "answer" in data,
                allKeys: Object.keys(data),
            });

            // If answer is included in call_accepted, queue it for processing
            if (data.answer && !isCleaningUpRef.current) {
                console.log("📞 [socket.call_accepted] ANSWER included in call_accepted event!");
                console.log("   Answer data:", data.answer);

                // Queue the signal for processing (don't signal immediately, let processSignal handle it)
                pendingSignalsRef.current.push({
                    data: data.answer,
                    type: "answer",
                    receivedAt: Date.now(),
                });
                console.log(`   📋 Answer queued (pending signals: ${pendingSignalsRef.current.length})`);

                // Try to process pending signals
                if (peerReadyRef.current && peerRef.current) {
                    processPendingSignals();
                }
            }

            setCallState((prev) => {
                console.log("🔍 [socket.call_accepted] Previous state:", {
                    callId: prev.callId,
                    outgoingCallId: prev.outgoingCallId,
                    inCall: prev.inCall,
                });

                // Priority: data.callId > data.id > prev.callId > prev.outgoingCallId
                const newOutgoingCallId = data.callId || data.id || prev.callId || prev.outgoingCallId;
                console.log("📌 [socket.call_accepted] Setting outgoingCallId to:", newOutgoingCallId);

                // Set call start time for duration calculation
                if (!callStartTimeRef.current) {
                    callStartTimeRef.current = Date.now();
                    console.log("⏱️ [socket.call_accepted] Call start time recorded");
                }

                return {
                    ...prev,
                    inCall: true,
                    outgoingCallId: newOutgoingCallId,
                    remoteUserName: data.recipientName || data.recipient_name || prev.remoteUserName,
                };
            });
        });

        socket.on("call_rejected", (data) => {
            console.log("❌ [socket.call_rejected] Call rejected by recipient:", data);
            console.log("❌ [socket.call_rejected] Cleaning up call resources");

            // Immediately stop media and peer connection
            endCall();

            // Show error message briefly
            setCallState((prev) => ({
                ...prev,
                error: data.reason || "Call rejected by user",
            }));

            // Clear error after 3 seconds
            setTimeout(() => {
                setCallState((prev) => ({ ...prev, error: null }));
            }, 3000);
        });

        socket.on("cancel_call", (data) => {
            console.log("❌ [socket.cancel_call] Incoming call was cancelled:", data);
            setCallState((prev) => {
                // If there's an active call in progress, end it
                if (prev.inCall) {
                    console.log("❌ [socket.cancel_call] Active call detected, ending call");
                    // Call endCall through the returned callback
                    // Note: We'll trigger this after state update
                    setTimeout(() => {
                        endCall();
                    }, 0);
                }
                return {
                    ...prev,
                    incomingCall: null,
                };
            });
        });

        socket.on("call_cancelled", (data) => {
            console.log("❌ [socket.call_cancelled] Call was cancelled:", data);
            setCallState((prev) => {
                // If there's an active call in progress, end it
                if (prev.inCall) {
                    console.log("❌ [socket.call_cancelled] Active call detected, ending call");
                    // Call endCall through the returned callback
                    setTimeout(() => {
                        endCall();
                    }, 0);
                }
                return {
                    ...prev,
                    incomingCall: null,
                };
            });
        });

        socket.on("call_ended", () => {
            console.log("📵 [socket.call_ended] Call ended event received");
            console.log("📵 [socket.call_ended] Current callState before endCall:", {
                outgoingCallId: callState?.outgoingCallId,
                inCall: callState?.inCall,
                callType: callState?.callType,
            });
            endCall();
        });

        socket.on("ice_candidate", (data) => {
            console.log("❄️ [socket.on.ice_candidate] RECEIVED ICE CANDIDATE from backend");
            console.log("   Candidate data:", data);

            if (!isCleaningUpRef.current && data.candidate) {
                // Queue ICE candidate for processing when peer is ready
                pendingSignalsRef.current.push({
                    data: {
                        candidate: data.candidate,
                        sdpMLineIndex: data.sdpMLineIndex !== undefined ? data.sdpMLineIndex : 0,
                        sdpMid: data.sdpMid || "0",
                    },
                    type: "ice",
                    receivedAt: Date.now(),
                });
                console.log(`   📋 ICE candidate queued (pending: ${pendingSignalsRef.current.length})`);

                // Try to process if peer is ready
                if (peerReadyRef.current && peerRef.current) {
                    processPendingSignals();
                }
            } else if (isCleaningUpRef.current) {
                console.warn("⚠️ Ignoring ICE candidate: cleanup in progress");
            } else {
                console.warn("⚠️ [socket.on.ice_candidate] No candidate data!");
            }
        });

        socket.on("offer", (data) => {
            console.log("� [socket.on.offer] *** OFFER EVENT TRIGGERED *** ");
            console.log("�📞 [socket.on.offer] RECEIVED OFFER from backend");
            console.log("   Offer data:", data);

            if (!isCleaningUpRef.current && data.offer) {
                // Queue offer for processing when peer is ready
                pendingSignalsRef.current.push({
                    data: data.offer,
                    type: "offer",
                    receivedAt: Date.now(),
                });
                console.log(`   📋 Offer queued (pending: ${pendingSignalsRef.current.length})`);

                // Try to process if peer is ready
                if (peerReadyRef.current && peerRef.current) {
                    processPendingSignals();
                }
            } else if (isCleaningUpRef.current) {
                console.warn("⚠️ Ignoring offer: cleanup in progress");
            } else {
                console.warn("⚠️ [socket.on.offer] No offer data!");
            }
        });

        socket.on("answer", (data) => {
            console.log("📞 [socket.on.answer] 🎉 RECEIVED ANSWER from backend!");
            console.log("   Answer data received:", {
                callId: data?.callId,
                hasAnswerSdp: !!data?.answer?.sdp,
                answerSdpLength: data?.answer?.sdp?.length,
                fromUserId: data?.fromUserId,
                timestamp: new Date().toISOString(),
            });
            console.log("   📊 Signal counts before processing:", signalsProcessedRef.current);

            // Queue the signal instead of signaling immediately
            if (!isCleaningUpRef.current) {
                if (data.answer) {
                    pendingSignalsRef.current.push({
                        data: data.answer,
                        type: "answer",
                        receivedAt: Date.now(),
                    });
                    console.log(`   📋 Answer queued (pending signals: ${pendingSignalsRef.current.length})`);
                    console.log(
                        `   ✅ Answer will be processed when peer is ready (peerReady: ${peerReadyRef.current})`,
                    );
                } else {
                    console.error("   ❌ Answer payload is missing! data.answer is:", data.answer);
                }

                // Try to process pending signals
                if (peerReadyRef.current && peerRef.current) {
                    console.log("   🔄 Peer already ready - processing answer immediately...");
                    processPendingSignals();
                } else {
                    console.log("   ⏳ Peer not ready yet - answer will be processed when peer.on('connect') fires");
                }
            } else if (isCleaningUpRef.current) {
                console.warn("⚠️ Ignoring answer: cleanup in progress");
            }
        });

        // Debug: Log all unhandled socket events for diagnosis
        const originalOn = socket.on.bind(socket);
        const handledEvents = new Set([
            "incoming_call",
            "call_accepted",
            "call_rejected",
            "cancel_call",
            "call_cancelled",
            "call_ended",
            "ice_candidate",
            "offer",
            "answer",
            "connect",
            "disconnect",
            "reconnect",
        ]);

        socket.on = function (eventName, handler) {
            return originalOn(eventName, handler);
        };

        socket.onAny?.((eventName, data) => {
            if (!handledEvents.has(eventName) && eventName.includes("call")) {
                console.log(`📡 [socket.onAny] Unhandled socket event: ${eventName}`, data);
            }
        });


        return () => {
            console.log("🧹 Cleaning up call listeners");
            socket.off("incoming_call");
            socket.off("call_accepted");
            socket.off("call_rejected");
            socket.off("cancel_call");
            socket.off("call_cancelled");
            socket.off("call_ended");
            socket.off("ice_candidate");
            socket.off("offer");
            socket.off("answer");
            console.log("🧹 All listeners cleaned up");
        };
    }, [socket, endCall]);

    console.log("📊 [useCall] Hook initialized - socket:", !!socket, "endCall:", !!endCall);

    // Get user media (audio/video)
    const getMediaStream = useCallback(async (type = "voice") => {
        try {
            // Check for browser support
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error("Your browser does not support voice/video calls");
            }

            const constraints =
                type === "video" ? { audio: true, video: { width: 1280, height: 720 } } : { audio: true };

            console.log(`📻 Requesting ${type} permissions...`);
            console.log(`   Constraints:`, constraints);
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            console.log(`✅ ${type === "video" ? "Video" : "Audio"} stream obtained`);
            console.log(`   Stream ID: ${stream.id}`);
            console.log(`   Total tracks: ${stream.getTracks().length}`);

            // Log each track and ENSURE all audio tracks are enabled
            const audioTracksToEnable = [];
            stream.getTracks().forEach((track, idx) => {
                console.log(`   Track ${idx}:`, {
                    kind: track.kind,
                    enabled: track.enabled,
                    readyState: track.readyState,
                    label: track.label,
                });

                // CRITICAL: Force enable ALL audio tracks immediately
                if (track.kind === "audio") {
                    console.log(`   🔊 [CRITICAL] Audio track ${idx} - Forcing ENABLED`);
                    track.enabled = true; // Force enable
                    if (track.enabled) {
                        console.log(`   ✅ Audio track ${idx} is now ENABLED and ready to transmit`);
                    } else {
                        console.error(`   ❌ Audio track ${idx} STILL DISABLED after forcing enable!`);
                    }
                    audioTracksToEnable.push(track);
                }
            });

            // Verify audio tracks are actually enabled
            if (audioTracksToEnable.length > 0) {
                console.log(`✅ Processed ${audioTracksToEnable.length} audio tracks`);
                audioTracksToEnable.forEach((track) => {
                    if (!track.enabled) {
                        console.error(`❌ CRITICAL: Audio track is NOT enabled! This will cause audio failure!`);
                        // Last resort: try again
                        track.enabled = true;
                        console.log(`   Retry: track.enabled = ${track.enabled}`);
                    } else {
                        console.log(`   ✅ Audio track ENABLED: ${track.enabled}, readyState: ${track.readyState}`);
                    }
                });
            }

            setCallState((prev) => ({
                ...prev,
                localStream: stream,
                error: null,
            }));
            return stream;
        } catch (error) {
            let userFriendlyError = error.message;

            // Handle specific permission errors
            if (error.name === "NotAllowedError" || error.message?.includes("Permission denied")) {
                userFriendlyError = `${type === "video" ? "Video" : "Audio"} permission denied. Please enable camera/microphone access in browser settings.`;
            } else if (error.name === "NotFoundError" || error.message?.includes("no suitable video")) {
                userFriendlyError = `No ${type === "video" ? "camera" : "microphone"} found on your device`;
            } else if (error.name === "NotReadableError") {
                userFriendlyError = `${type === "video" ? "Camera" : "Microphone"} is already in use by another application`;
            } else if (error.message?.includes("browser")) {
                userFriendlyError = "Your browser does not support voice/video calls";
            }

            console.error(`❌ Media stream error (${type}):`, error);
            setCallState((prev) => ({
                ...prev,
                error: userFriendlyError,
            }));
            throw new Error(userFriendlyError);
        }
    }, []);

    // Initialize peer connection
    const createPeerConnection = useCallback(
        async (stream, initiator = true, callId, recipientId) => {
            try {
                console.log(
                    `🔗 [createPeerConnection] Initializing WebRTC peer connection (callId: ${callId}, recipientId: ${recipientId})...`,
                );

                // Validate stream more thoroughly
                if (!stream) {
                    throw new Error("Media stream is undefined");
                }

                // Check if stream is a valid MediaStream
                if (typeof stream.getTracks !== "function") {
                    throw new Error("Invalid stream object: missing getTracks method");
                }

                const tracks = stream.getTracks();
                if (tracks.length === 0) {
                    console.warn("⚠️ [createPeerConnection] Stream has no tracks, but proceeding");
                }

                // Store in refs BEFORE creating SimplePeer to ensure they're set
                callIdRef.current = callId;
                recipientIdRef.current = recipientId;
                console.log(
                    `🔗 [createPeerConnection] Refs set - callIdRef: ${callIdRef.current}, recipientIdRef: ${recipientIdRef.current}`,
                );

                // Create a local closure to capture the exact values
                const capturedCallId = callId;
                const capturedRecipientId = recipientId;

                // Load SimplePeer from shim to ensure proper module loading
                const SimplePeerClass = await getSimplePeer();

                // Validate SimplePeerClass is a constructor
                if (typeof SimplePeerClass !== "function") {
                    throw new Error(
                        `SimplePeerClass is not a constructor. Type: ${typeof SimplePeerClass}, Value: ${SimplePeerClass}`,
                    );
                }

                let peer;
                try {
                    console.log("🔗 [createPeerConnection] Creating SimplePeer with config:", {
                        initiator,
                        trickleIce: true,
                        hasStream: !!stream,
                        streamTracks: stream?.getTracks?.()?.length || 0,
                    });

                    // CRITICAL: Ensure all audio tracks are enabled BEFORE creating peer
                    if (stream) {
                        const audioTracks = stream.getAudioTracks?.() || [];
                        const videoTracks = stream.getVideoTracks?.() || [];

                        console.log("🔊 [CRITICAL] Checking and enabling all audio tracks:");
                        audioTracks.forEach((track, idx) => {
                            console.log(
                                `   Track ${idx} BEFORE: enabled=${track.enabled}, readyState=${track.readyState}`,
                            );
                            // FORCE enable audio tracks
                            track.enabled = true;
                            console.log(`   Track ${idx} AFTER:  enabled=${track.enabled} ✅`);
                        });

                        console.log("   Stream details:", {
                            streamId: stream.id,
                            audioTracksCount: audioTracks.length,
                            videoTracksCount: videoTracks.length,
                            audioTracksEnabled: audioTracks.map((t) => ({
                                enabled: t.enabled,
                                readyState: t.readyState,
                                label: t.label,
                            })),
                            videoTracksEnabled: videoTracks.map((t) => ({
                                enabled: t.enabled,
                                readyState: t.readyState,
                                label: t.label,
                            })),
                        });

                        // Verify all audio tracks are enabled
                        const stillDisabledAudioTracks = audioTracks.filter((t) => !t.enabled);
                        if (stillDisabledAudioTracks.length > 0) {
                            console.error(
                                `❌ CRITICAL: ${stillDisabledAudioTracks.length} audio tracks STILL DISABLED after forcing enable!`,
                            );
                            console.error("   This will prevent remote from hearing you!");
                        } else {
                            console.log(`✅ All ${audioTracks.length} audio tracks are ENABLED and ready to send`);
                        }
                    }

                    // Check if RTCPeerConnection is available
                    const RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
                    if (!RTCPeerConnection) {
                        throw new Error("RTCPeerConnection not available in browser");
                    }

                    peer = new SimplePeerClass({
                        initiator,
                        trickleIce: true, // Enable trickleIce for proper ICE candidate handling
                        stream,
                        config: {
                            iceServers: [
                                { urls: ["stun:stun1.l.google.com:19302"] },
                                { urls: ["stun:stun2.l.google.com:19302"] },
                                { urls: ["stun:stun3.l.google.com:19302"] },
                                { urls: ["stun:stun4.l.google.com:19302"] },
                            ],
                        },
                    });
                    console.log("✅ [createPeerConnection] SimplePeer created successfully");

                    // Verify that audio tracks are being sent
                    if (peer._pc) {
                        console.log("🎤 [CRITICAL] Verifying audio is being SENT:");
                        if (peer._pc.getSenders && typeof peer._pc.getSenders === "function") {
                            const senders = peer._pc.getSenders();
                            if (senders.length === 0) {
                                console.error("❌ NO SENDERS! Audio will not be sent!");
                            } else {
                                let audioSenderFound = false;
                                senders.forEach((sender, idx) => {
                                    const kind = sender.track?.kind;
                                    const enabled = sender.track?.enabled;
                                    console.log(`   Sender ${idx}:`, {
                                        kind,
                                        enabled,
                                        readyState: sender.track?.readyState,
                                    });
                                    if (kind === "audio") {
                                        audioSenderFound = true;
                                        if (!enabled) {
                                            console.error("❌ CRITICAL: Audio sender is DISABLED! Enabling...");
                                            sender.track.enabled = true;
                                            console.log(`   ✅ Audio sender track enabled: ${sender.track.enabled}`);
                                        } else {
                                            console.log("   ✅ Audio sender is ENABLED and ready to transmit");
                                        }
                                    }
                                });
                                if (!audioSenderFound) {
                                    console.error("❌ NO AUDIO SENDER FOUND! Audio will not be sent!");
                                }
                            }
                        }
                    }
                } catch (peerConstructorError) {
                    console.error("❌ [createPeerConnection] Failed to construct SimplePeer:", peerConstructorError);
                    console.error("❌ [createPeerConnection] Error details:", {
                        message: peerConstructorError.message,
                        stack: peerConstructorError.stack,
                    });
                    throw new Error(`SimplePeer initialization failed: ${peerConstructorError.message}`);
                }

                // Add event listeners to track peer connection lifecycle
                peer.on("connect", () => {
                    console.log("✅ [peer.on.connect] WebRTC connection established");
                    // Mark peer as ready and process any pending signals
                    peerReadyRef.current = true;
                    console.log("✅ [peer.on.connect] Peer marked as ready, processing pending signals...");
                    processPendingSignals();
                });

                peer.on("ready", () => {
                    console.log("✅ [peer.on.ready] Peer is ready");
                });

                peer.on("data", (data) => {
                    console.log("📨 [peer.on.data] Received data:", data);
                });

                peer.on("signal", (data) => {
                    // Use closure values first, then fallback to refs
                    const signalCallId = capturedCallId || callIdRef.current;
                    const signalRecipientId = capturedRecipientId || recipientIdRef.current;

                    // CRITICAL: Log signal generation
                    if (data.type === "answer") {
                        console.log(
                            `📤 [peer.on.signal] 🎉 ANSWER GENERATED by SimplePeer (initiator=${initiator}, callId: ${signalCallId})`,
                        );
                        console.log("   ⭐ CRITICAL - SimplePeer created an answer from received offer!");
                    } else {
                        console.log(
                            `📤 [peer.on.signal] ${data.type === "offer" ? "📞" : "❄️"} Signal: ${data.type}, callId: ${signalCallId}`,
                        );
                    }

                    try {
                        if (!socket || !socket.connected) {
                            console.error("❌ [peer.on.signal] Socket NOT connected!");
                            console.error("   Socket exists:", !!socket);
                            console.error("   Socket.connected:", socket?.connected);
                            if (data.type === "answer") {
                                console.error(
                                    "   ❌ CRITICAL: Answer generated but socket disconnected - cannot send!",
                                );
                            }
                            return;
                        }

                        if (data.type === "offer") {
                            console.log("   Emitting 'offer' event to backend...");
                            if (data.sdp && data.sdp.includes("m=audio")) {
                                console.log("   ✅ Offer SDP contains audio media");
                            } else {
                                console.warn("   ⚠️ Offer SDP does NOT contain audio!");
                            }
                            socket.emit("offer", {
                                callId: signalCallId,
                                offer: data,
                                toUserId: signalRecipientId,
                            });
                            console.log("   ✅ 'offer' emitted to backend");
                        } else if (data.type === "answer") {
                            console.log("   🎉 Emitting 'answer' event to backend...");
                            if (data.sdp && data.sdp.includes("m=audio")) {
                                console.log("   ✅ Answer SDP contains audio media");
                            } else {
                                console.warn("   ⚠️ Answer SDP does NOT contain audio!");
                            }
                            console.log("   📦 Answer payload being sent:", {
                                callId: signalCallId,
                                toUserId: signalRecipientId,
                                answerSdpLength: data.sdp?.length || 0,
                            });
                            socket.emit("answer", {
                                callId: signalCallId,
                                answer: data,
                                toUserId: signalRecipientId,
                            });
                            console.log(
                                "   ✅ 'answer' emitted to backend - waiting for backend to forward to initiator",
                            );
                        } else if (data.candidate) {
                            console.log("   Emitting 'ice_candidate' event to backend...");
                            socket.emit("ice_candidate", {
                                callId: signalCallId,
                                candidate: data.candidate,
                                sdpMLineIndex: data.sdpMLineIndex,
                                sdpMid: data.sdpMid,
                                toUserId: signalRecipientId,
                            });
                            console.log("   ✅ 'ice_candidate' emitted");
                        }
                    } catch (signalError) {
                        console.error("⚠️ [peer.on.signal] Error emitting signal:", signalError);
                    }
                });

                peer.on("stream", (remoteStream) => {
                    try {
                        console.log("📥 [peer.on.stream] Received remote media stream");
                        console.log("   Stream ID:", remoteStream?.id);
                        console.log("   Stream tracks:", remoteStream?.getTracks?.()?.length || 0);

                        // Log each track
                        const tracks = remoteStream?.getTracks?.() || [];
                        const audioTracks = tracks.filter((t) => t.kind === "audio");
                        const videoTracks = tracks.filter((t) => t.kind === "video");

                        console.log(`   Audio tracks: ${audioTracks.length}, Video tracks: ${videoTracks.length}`);

                        tracks.forEach((track, idx) => {
                            console.log(`   Track ${idx}:`, {
                                kind: track.kind,
                                enabled: track.enabled,
                                readyState: track.readyState,
                                label: track.label,
                            });
                            // Ensure audio tracks are enabled
                            if (track.kind === "audio" && !track.enabled) {
                                console.log(`   🔊 Enabling audio track ${idx}`);
                                track.enabled = true;
                                console.log(`   ✅ Audio track ${idx} is now enabled: ${track.enabled}`);
                            }
                        });

                        if (!remoteStream || typeof remoteStream.getTracks !== "function") {
                            console.warn("⚠️ [peer.on.stream] Invalid remote stream");
                            return;
                        }

                        if (audioTracks.length === 0) {
                            console.error("❌ [peer.on.stream] NO AUDIO TRACKS IN REMOTE STREAM!");
                            console.error("   This means the remote peer did not send any audio");
                            console.error("   Check if remote user's microphone is enabled and sending audio");
                        } else {
                            console.log(`✅ [peer.on.stream] Remote stream has ${audioTracks.length} audio track(s)`);
                        }

                        setCallState((prev) => ({
                            ...prev,
                            remoteStream,
                        }));
                    } catch (streamError) {
                        console.error("⚠️ [peer.on.stream] Error handling remote stream:", streamError);
                    }
                });

                peer.on("error", (error) => {
                    // CRITICAL FIX: Ignore events from replaced/old peers
                    if (peerRef.current !== peer) {
                        console.warn("❌ [peer.on.error] Ignoring error from old/replaced peer - preventing new call teardown");
                        return;
                    }
                    console.error("❌ [peer.on.error] WebRTC peer error:", error);
                    try {
                        setCallState((prev) => ({
                            ...prev,
                            error: `Connection error: ${error.message || error}`,
                        }));
                    } catch (stateError) {
                        console.error("⚠️ [peer.on.error] Error updating state:", stateError);
                    }
                });

                peer.on("close", () => {
                    // CRITICAL FIX: Ignore close events from old/replaced peers.
                    // When makeCall destroys the previous peer and immediately creates a new one,
                    // the old peer fires 'close' asynchronously AFTER peerRef.current already points
                    // to the new peer. Without this check, endCall() would destroy the new connection.
                    if (peerRef.current !== peer) {
                        console.warn("🔌 [peer.on.close] Ignoring close from old/replaced peer - this is expected on second+ calls");
                        return;
                    }
                    console.log("🔌 [peer.on.close] Peer connection closed");
                    // Only call endCall if we're not already cleaning up, to prevent recursion
                    if (!isCleaningUpRef.current) {
                        console.log("🔌 [peer.on.close] Initiating call cleanup");
                        endCall();
                    } else {
                        console.log("🔌 [peer.on.close] Cleanup already in progress, skipping endCall");
                    }
                });

                // Summary: All peer event listeners registered
                console.log("✅ [createPeerConnection] All peer event listeners registered:");
                console.log("   - peer.on('connect')");
                console.log("   - peer.on('ready')");
                console.log("   - peer.on('data')");
                console.log("   - peer.on('signal') ← Sends offer/answer/ICE");
                console.log("   - peer.on('stream') ← Receives remote audio/video");
                console.log("   - peer.on('error')");
                console.log("   - peer.on('close')");
                console.log("   ✅ Peer is now ready to receive WebRTC signals!");

                // Mark peer as ready after a short delay to ensure all listeners are attached
                setTimeout(() => {
                    if (!isCleaningUpRef.current && peerRef.current === peer) {
                        peerReadyRef.current = true;
                        console.log(
                            `✅ [createPeerConnection] Peer ready! Processing ${pendingSignalsRef.current.length} pending signals...`,
                        );
                        if (pendingSignalsRef.current.length > 0) {
                            console.log(
                                "   Pending signals to process:",
                                pendingSignalsRef.current.map((s) => s.type).join(", "),
                            );
                        }
                        processPendingSignals();
                    }
                }, 100);

                return peer;
            } catch (error) {
                console.error("❌ [createPeerConnection] Failed to create peer connection:", error);
                setCallState((prev) => ({
                    ...prev,
                    error: `WebRTC initialization failed: ${error.message}`,
                }));
                throw error;
            }
        },
        [socket, endCall, processPendingSignals],
    );

    // Initiate a call
    const makeCall = useCallback(
        async (recipientId, conversationId, callType = "voice", recipientName = "User") => {
            console.log(`📞 [makeCall] Starting ${callType} call to ${recipientId}`);
            console.log(`📞 [makeCall] Recipient ID type: ${typeof recipientId}, value: ${recipientId}`);

            try {
                // Reset peer readiness and pending signals for new call
                peerReadyRef.current = false;
                pendingSignalsRef.current = [];
                answerRetryCountRef.current = 0;
                signalsProcessedRef.current = { offers: 0, answers: 0, iceCandidates: 0 };
                console.log("🔄 [makeCall] Reset peer state - ready to receive new signals");

                // ⭐ CRITICAL: Set outgoing state IMMEDIATELY before any async operations
                console.log("📞 [makeCall] Setting initial state with pending outgoingCallId...");
                console.log("📞 [makeCall] BEFORE setCallState - callState:", {
                    inCall: callState?.inCall,
                    outgoingCallId: callState?.outgoingCallId,
                });

                setCallState((prev) => {
                    const newState = {
                        ...prev,
                        outgoingCallId: `pending_${Date.now()}`,
                        callType,
                        remoteUserId: recipientId,
                        remoteUserName: recipientName,
                        error: null,
                    };
                    console.log("📞 [makeCall] SETTING outgoingCallId to:", newState.outgoingCallId);
                    console.log("📞 [makeCall] Full new state:", JSON.stringify(newState));
                    return newState;
                });
                console.log("✅ [makeCall] setCallState callback dispatched - state MAY update asynchronously");

                remoteUserIdRef.current = recipientId;

                // Get media stream
                let stream;
                try {
                    console.log(`📻 [makeCall] Requesting ${callType} media permissions...`);
                    stream = await getMediaStream(callType);
                    console.log(`✅ [makeCall] ${callType} media stream obtained`);
                } catch (mediaError) {
                    console.error("❌ [makeCall] Media stream error:", mediaError);
                    const userMessage =
                        mediaError.message ||
                        `Failed to access ${callType === "video" ? "camera/microphone" : "microphone"}. Please check browser permissions.`;

                    // Update error state
                    setCallState((prev) => ({
                        ...prev,
                        error: userMessage,
                    }));
                    throw mediaError;
                }

                // 🔑 Call REST API FIRST to get real callId
                let callId = null;
                try {
                    console.log(`🌐 [makeCall] Calling API to initiate ${callType} call...`);
                    const response = await callService.initiateCall(recipientId, conversationId, callType);
                    console.log("✅ [makeCall] Full API response:", response);
                    console.log("✅ [makeCall] response.data:", response.data);

                    const callData = response.data?.data || response.data;
                    console.log("🔍 [makeCall] callData (parsed):", callData);
                    console.log("🔍 [makeCall] callData.id:", callData?.id);
                    console.log("🔍 [makeCall] callData.callId:", callData?.callId);
                    console.log("🔍 [makeCall] callData.call_id:", callData?.call_id);

                    // Support both snake_case and camelCase from backend
                    callId = callData.call_id || callData.callId || callData.id;
                    console.log("📌 [makeCall] Final callId assigned:", callId, `(type: ${typeof callId})`);
                } catch (apiError) {
                    console.error("⚠️ [makeCall] Failed to call REST API:", apiError);
                    // Fallback: use pending ID as temporary callId
                    callId = `call_${Date.now()}`;
                    console.log("📌 [makeCall] Using temporary callId (fallback):", callId);
                }

                // Replace pending ID with real callId (only if we have a valid callId)
                if (callId) {
                    console.log("✅ [makeCall] Got valid callId, updating state with real ID");
                    // Store in ref for use in endCall and saveCallMessage
                    callIdRef.current = callId;
                    recipientIdRef.current = recipientId;
                    callConversationIdRef.current = conversationId; // Store conversation ID
                    callTypeRef.current = callType; // Store call type
                    console.log(
                        `📌 [makeCall] Stored in refs - callId: ${callId}, conversationId: ${conversationId}, callType: ${callType}`,
                    );

                    setCallState((prev) => ({
                        ...prev,
                        callId: callId,
                        outgoingCallId: callId, // Replace pending with real ID
                        inCall: false,
                        error: null,
                    }));
                    console.log("✅ [makeCall] Updated with real callId:", callId);
                } else {
                    console.warn("⚠️ [makeCall] No valid callId obtained from API - keeping pending state!");
                    // Keep the pending state, don't overwrite with undefined
                }

                // Initialize peer connection
                console.log("🔗 [makeCall] Initializing WebRTC peer connection...");
                try {
                    // Safely destroy existing peer connection if any
                    if (peerRef.current) {
                        try {
                            console.log("🔗 [makeCall] Destroying existing peer connection...");
                            // CRITICAL FIX: Set peerRef to null BEFORE calling destroy().
                            // This prevents the old peer's async 'close' event from seeing itself
                            // as the current peer and calling endCall(), which would destroy
                            // the new connection we are about to create.
                            const oldPeer = peerRef.current;
                            peerRef.current = null;
                            oldPeer.destroy?.();
                        } catch (destroyError) {
                            console.error("⚠️ [makeCall] Error destroying existing peer:", destroyError);
                            peerRef.current = null;
                        }
                    }

                    const peer = await createPeerConnection(stream, true, callId, recipientId);
                    peerRef.current = peer;
                    console.log("✅ [makeCall] Peer connection initialized");
                    console.log("✅ [makeCall] callKey passed to peer:", callId);
                } catch (peerError) {
                    console.error("❌ [makeCall] Peer connection error:", peerError);
                    setCallState((prev) => ({
                        ...prev,
                        error: `Connection error: ${peerError.message || "Failed to initialize connection"}`,
                    }));
                    throw peerError;
                }
            } catch (error) {
                console.error("❌ [makeCall] Failed to make call:", error);
                // Ensure error is displayed
                setCallState((prev) => ({
                    ...prev,
                    error: error.message || "Call failed",
                }));
            }
        },
        [getMediaStream, socket, userId, userInfo, createPeerConnection],
    );

    // Accept a call
    const acceptCall = useCallback(
        async (callType = "voice") => {
            try {
                // CRITICAL FIX: Do NOT clear pendingSignalsRef here.
                // The offer from the caller may have already arrived (via socket.on('offer'))
                // BEFORE the user pressed Accept. Clearing it would lose that offer and
                // prevent the WebRTC handshake from completing on subsequent calls.
                // endCall() is responsible for clearing signal state between calls.
                peerReadyRef.current = false;
                answerRetryCountRef.current = 0;
                signalsProcessedRef.current = { offers: 0, answers: 0, iceCandidates: 0 };
                console.log("🔄 [acceptCall] Reset peer state - preserving any pre-queued signals:", pendingSignalsRef.current.length);

                console.log(`✅ [acceptCall] START - callType: ${callType}`);
                console.log(`   incomingCall:`, callState.incomingCall);
                setCallState((prev) => ({
                    ...prev,
                    error: null,
                }));

                const fromUserId = callState.incomingCall?.fromUserId;
                const incomingCallId = callState.incomingCall?.callId;
                remoteUserIdRef.current = fromUserId;

                // 🔑 CRITICAL: Notify backend about acceptance FIRST
                try {
                    console.log(`📡 [acceptCall] Calling API to accept call ${incomingCallId}...`);
                    await callService.acceptCall(incomingCallId);
                    console.log("✅ [acceptCall] Backend notified of acceptance");
                } catch (apiError) {
                    console.error("⚠️ [acceptCall] API error (non-blocking):", apiError);
                    // Continue anyway - socket emit might still work
                }

                // Get media stream
                const stream = await getMediaStream(callType);

                // Store call info in refs for use in endCall and saveCallMessage
                callIdRef.current = incomingCallId;
                remoteUserIdRef.current = fromUserId;
                callConversationIdRef.current = callState.incomingCall?.conversationId;
                callTypeRef.current = callType;
                callStartTimeRef.current = Date.now();

                console.log(
                    `📌 [acceptCall] Stored in refs - callId: ${incomingCallId}, conversationId: ${callState.incomingCall?.conversationId}, callType: ${callType}`,
                );

                // Initialize peer connection as non-initiator with callId from incoming call
                const peer = await createPeerConnection(stream, false, incomingCallId, fromUserId);
                peerRef.current = peer;

                // Emit acceptance - use 'call_accepted' to match listener
                console.log(`📤 [acceptCall] Emitting call_accepted event...`);
                socket?.emit("call_accepted", {
                    toUserId: fromUserId,
                    conversationId: callState.incomingCall?.conversationId,
                    callId: incomingCallId,
                });
                console.log("✅ [acceptCall] call_accepted event emitted");

                setCallState((prev) => ({
                    ...prev,
                    inCall: true,
                    callId: incomingCallId,
                    callType,
                    remoteUserId: fromUserId,
                    remoteUserName: prev.incomingCall?.fromUserName,
                    incomingCall: null,
                }));
                console.log("✅ [acceptCall] State updated - inCall: true");
            } catch (error) {
                console.error("❌ Failed to accept call:", error);
                setCallState((prev) => ({
                    ...prev,
                    error: error.message,
                }));
            }
        },
        [callState.incomingCall, getMediaStream, createPeerConnection, socket],
    );

    // Reject a call
    const rejectCall = useCallback(() => {
        console.log(`❌ Rejecting call...`);

        // Get current state before any async operations
        setCallState((prev) => {
            const callIdToReject = prev.incomingCall?.callId;
            const recipientId = prev.incomingCall?.fromUserId;
            const conversationId = prev.incomingCall?.conversationId;
            const callType = prev.incomingCall?.callType || "voice";

            console.log(`❌ Call details - callId: ${callIdToReject}, fromUserId: ${recipientId}`);

            // 🔑 Notify backend about rejection FIRST
            if (callIdToReject) {
                callService
                    .rejectCall(callIdToReject, "user_declined")
                    .then(() => {
                        console.log("✅ [rejectCall] Backend notified of rejection");
                    })
                    .catch((error) => {
                        console.error("⚠️ [rejectCall] API error (non-blocking):", error);
                    });
            }

            // Emit rejection event
            console.log(`📤 [rejectCall] Emitting call_rejected event...`);
            socket?.emit("call_rejected", {
                toUserId: recipientId,
                conversationId: conversationId,
                callId: callIdToReject,
                reason: "user_declined",
            });
            console.log("✅ [rejectCall] call_rejected event emitted");

            // Save missed call message
            if (conversationId && callType && socket && socket.connected) {
                console.log(`💬 [rejectCall] Saving missed call message`);
                setTimeout(() => {
                    socket.emit("save_call_message", {
                        conversationId,
                        content: formatCallMessage(callType, 0, "missed"),
                        type: "system_call",
                        callData: {
                            callId: callIdToReject,
                            callType,
                            duration: 0,
                            status: "missed",
                        },
                    });
                    console.log("✅ [rejectCall] Missed call message emitted");
                }, 100);
            }

            // Clear the incoming call state immediately
            console.log("📵 [rejectCall] Clearing incoming call state");
            return {
                ...prev,
                incomingCall: null,
                error: null,
            };
        });
    }, [socket]);

    // Monitor for missing remote stream with timeout
    useEffect(() => {
        if (!callState.inCall || callState.remoteStream) {
            return; // Call not active or already have remote stream
        }

        // Log diagnostic information
        console.log("📊 [Diagnostic] Call in progress but no remote stream yet");
        console.log("   Current callState:", {
            inCall: callState.inCall,
            hasRemoteStream: !!callState.remoteStream,
            callType: callState.callType,
            remoteUserId: callState.remoteUserId,
            remoteUserName: callState.remoteUserName,
        });
        console.log("   Current refs:", {
            hasPeer: !!peerRef.current,
            callIdRef: callIdRef.current,
            recipientIdRef: recipientIdRef.current,
            peerReady: peerReadyRef.current,
            pendingSignals: pendingSignalsRef.current.length,
            signalsProcessed: signalsProcessedRef.current,
        });

        // Force process any pending signals that might be queued
        if (peerReadyRef.current && peerRef.current && pendingSignalsRef.current.length > 0) {
            console.log("🔄 [Diagnostic] Forcing pending signal processing...");
            processPendingSignals();
        }

        // Wait 15 seconds for remote stream to arrive (increased from 5 seconds)
        const timeoutId = setTimeout(() => {
            // Re-check conditions at timeout time to avoid stale closures
            if (!callState.remoteStream && callState.inCall) {
                console.error("❌ [Timeout] Remote stream not received after 15 seconds!");
                console.error("   This means the WebRTC handshake did NOT complete successfully");
                console.error("   Diagnostic information:");
                console.error("   - Peer ready:", peerReadyRef.current);
                console.error("   - Pending signals:", pendingSignalsRef.current.length);
                console.error("   - Peer instance:", !!peerRef.current);
                console.error("   - Signals processed:", signalsProcessedRef.current);

                console.error("   Possible causes:");
                if (signalsProcessedRef.current?.answers === 0) {
                    console.error("   1. ❌ NO ANSWER received from remote peer - connection incomplete");
                } else if (signalsProcessedRef.current?.offers === 0) {
                    console.error("   1. ❌ NO OFFER sent - initiator might not have started call properly");
                } else if (signalsProcessedRef.current?.iceCandidates === 0) {
                    console.error("   2. ❌ ICE candidates not exchanged properly - NAT/firewall issues");
                } else {
                    console.error("   3. ❓ Signals exchanged but stream still not arriving - media might be muted");
                }
                console.error("   4. ❓ Backend not forwarding WebRTC signals");
                console.error("   ");
                console.error("   Troubleshooting steps:");
                console.error("   1. Check that both users are online");
                console.error("   2. Check browser console for errors on BOTH sides");
                console.error("   3. Check microphone permissions on BOTH sides");
                console.error("   4. Try refreshing the page and calling again");

                setCallState((prev) => ({
                    ...prev,
                    error: "Connection timeout - WebRTC handshake incomplete. Please try again.",
                }));
            }
        }, 15000); // Increased timeout from 5s to 15s

        return () => clearTimeout(timeoutId);
    }, [callState.inCall, callState.remoteStream, processPendingSignals]);

    // Monitor signal flow for debugging
    useEffect(() => {
        if (!callState.inCall) return;

        const interval = setInterval(() => {
            const diagnostics = {
                callId: callState.callId,
                isInitiator: callState.callId && callIdRef.current === callState.callId,
                signalsProcessed: signalsProcessedRef.current,
                pendingSignals: pendingSignalsRef.current.length,
                peerReady: peerReadyRef.current,
                hasPeer: !!peerRef.current,
                hasRemoteStream: !!callState.remoteStream,
                timestamp: new Date().toLocaleTimeString(),
            };

            // Only log if we're waiting for signals (not yet connected)
            if (
                !callState.remoteStream &&
                diagnostics.signalsProcessed.answers === 0 &&
                diagnostics.signalsProcessed.offers > 0
            ) {
                console.log("📊 [Signal Flow Monitor] Waiting for answer from recipient...", diagnostics);
            }
        }, 3000); // Every 3 seconds

        return () => clearInterval(interval);
    }, [callState.inCall, callState.callId, callState.remoteStream]);

    return {
        callState,
        makeCall,
        acceptCall,
        rejectCall,
        endCall,
    };
};

export default useCall;
