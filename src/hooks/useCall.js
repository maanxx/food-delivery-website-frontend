import { useCallback, useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { getUserInfo } from "@helpers/cookieHelper";
import callService from "@services/callService";

const useCall = (socket) => {
    const userInfo = getUserInfo();
    const userId = userInfo?.sub || userInfo?.user_id || userInfo?.userId || userInfo?.id;

    const [callState, setCallState] = useState({
        inCall: false,
        incomingCall: null,
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

    // End call function - defined early to avoid temporal dead zone
    const endCall = useCallback(() => {
        console.log("📵 Ending call...");

        // Close peer connection
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }

        // Stop media streams
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        // Emit end call signal
        if (remoteUserIdRef.current) {
            socket?.emit("end_call", {
                toUserId: remoteUserIdRef.current,
            });
        }

        // Reset state
        setCallState((prev) => ({
            ...prev,
            inCall: false,
            incomingCall: null,
            outgoingCallId: null,
            remoteStream: null,
            localStream: null,
            callDuration: 0,
            callType: null,
            remoteUserId: null,
        }));

        remoteUserIdRef.current = null;

        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
        }
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
        if (!socket) return;

        socket.on("incoming_call", (data) => {
            console.log("📞 Incoming call:", data);
            setCallState((prev) => ({
                ...prev,
                incomingCall: data,
            }));
        });

        socket.on("call_accepted", (data) => {
            console.log("✅ Call accepted:", data);
            setCallState((prev) => ({
                ...prev,
                inCall: true,
                outgoingCallId: data.callId,
            }));
        });

        socket.on("call_rejected", (data) => {
            console.log("❌ Call rejected:", data);
            setCallState((prev) => ({
                ...prev,
                incomingCall: null,
                outgoingCallId: null,
                error: data.reason || "Call rejected",
            }));
            setTimeout(() => {
                setCallState((prev) => ({ ...prev, error: null }));
            }, 3000);
        });

        socket.on("call_ended", () => {
            console.log("📵 Call ended");
            endCall();
        });

        socket.on("ice_candidate", (data) => {
            if (peerRef.current && data.candidate) {
                peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        socket.on("offer", (data) => {
            if (peerRef.current) {
                peerRef.current.signal(data.offer);
            }
        });

        socket.on("answer", (data) => {
            if (peerRef.current) {
                peerRef.current.signal(data.answer);
            }
        });

        return () => {
            socket.off("incoming_call");
            socket.off("call_accepted");
            socket.off("call_rejected");
            socket.off("call_ended");
            socket.off("ice_candidate");
            socket.off("offer");
            socket.off("answer");
        };
    }, [socket]);

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
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            console.log(`✅ ${type === "video" ? "Video" : "Audio"} stream obtained`);
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
    const initializePeerConnection = useCallback(
        (stream, initiator = true) => {
            try {
                console.log(`🔗 Initializing WebRTC peer connection (initiator: ${initiator})...`);
                const peer = new SimplePeer({
                    initiator,
                    trickleIce: true,
                    stream,
                    iceServers: [{ urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] }],
                });

                peer.on("signal", (data) => {
                    console.log("📤 Sending WebRTC signal:", data.type);
                    if (data.type === "offer") {
                        socket?.emit("offer", {
                            offer: data,
                            toUserId: callState.remoteUserId || callState.incomingCall?.fromUserId,
                            conversationId: callState.incomingCall?.conversationId,
                        });
                    } else if (data.type === "answer") {
                        socket?.emit("answer", {
                            answer: data,
                            toUserId: callState.remoteUserId || callState.incomingCall?.fromUserId,
                            conversationId: callState.incomingCall?.conversationId,
                        });
                    } else if (data.candidate) {
                        socket?.emit("ice_candidate", {
                            candidate: data.candidate,
                            toUserId: callState.remoteUserId || callState.incomingCall?.fromUserId,
                        });
                    }
                });

                peer.on("stream", (remoteStream) => {
                    console.log("📥 Received remote media stream");
                    setCallState((prev) => ({
                        ...prev,
                        remoteStream,
                    }));
                });

                peer.on("error", (error) => {
                    console.error("❌ WebRTC peer error:", error);
                    setCallState((prev) => ({
                        ...prev,
                        error: `Connection error: ${error.message || error}`,
                    }));
                });

                peer.on("close", () => {
                    console.log("🔌 Peer connection closed");
                    // Trigger end call cleanup
                    endCall();
                });

                peerRef.current = peer;
                setCallState((prev) => ({
                    ...prev,
                    peer,
                }));
                return peer;
            } catch (error) {
                console.error("❌ Failed to initialize peer connection:", error);
                setCallState((prev) => ({
                    ...prev,
                    error: `WebRTC initialization failed: ${error.message}`,
                }));
                throw error;
            }
        },
        [socket, callState.remoteUserId, callState.incomingCall],
    );

    // Initiate a call
    const makeCall = useCallback(
        async (recipientId, conversationId, callType = "voice") => {
            try {
                console.log(`📞 Initiating ${callType} call...`);
                setCallState((prev) => ({
                    ...prev,
                    error: null,
                }));

                remoteUserIdRef.current = recipientId;

                // Get media stream
                const stream = await getMediaStream(callType);

                // Initialize peer connection as initiator
                initializePeerConnection(stream, true);

                // Emit call to socket
                socket?.emit("call_user", {
                    toUserId: recipientId,
                    conversationId,
                    callType,
                    fromUserId: userId,
                    fromUserName: userInfo?.name || "User",
                });

                setCallState((prev) => ({
                    ...prev,
                    inCall: false,
                    outgoingCallId: `call_${Date.now()}`,
                    callType,
                    remoteUserId: recipientId,
                }));
            } catch (error) {
                console.error("❌ Failed to make call:", error);
                setCallState((prev) => ({
                    ...prev,
                    error: error.message,
                }));
            }
        },
        [getMediaStream, initializePeerConnection, socket, userId, userInfo],
    );

    // Accept a call
    const acceptCall = useCallback(
        async (callType = "voice") => {
            try {
                console.log(`✅ Accepting ${callType} call...`);
                setCallState((prev) => ({
                    ...prev,
                    error: null,
                }));

                const fromUserId = callState.incomingCall?.fromUserId;
                remoteUserIdRef.current = fromUserId;

                // Get media stream
                const stream = await getMediaStream(callType);

                // Initialize peer connection as non-initiator
                initializePeerConnection(stream, false);

                // Emit acceptance
                socket?.emit("accept_call", {
                    toUserId: fromUserId,
                    conversationId: callState.incomingCall?.conversationId,
                    callId: callState.incomingCall?.callId,
                });

                setCallState((prev) => ({
                    ...prev,
                    inCall: true,
                    callType,
                    remoteUserId: fromUserId,
                    remoteUserName: prev.incomingCall?.fromUserName,
                    incomingCall: null,
                }));
            } catch (error) {
                console.error("❌ Failed to accept call:", error);
                setCallState((prev) => ({
                    ...prev,
                    error: error.message,
                }));
            }
        },
        [callState.incomingCall, getMediaStream, initializePeerConnection, socket],
    );

    // Reject a call
    const rejectCall = useCallback(() => {
        socket?.emit("reject_call", {
            toUserId: callState.incomingCall?.fromUserId,
            conversationId: callState.incomingCall?.conversationId,
            reason: "user_declined",
        });

        setCallState((prev) => ({
            ...prev,
            incomingCall: null,
            error: null,
        }));
    }, [socket, callState.incomingCall]);

    return {
        callState,
        makeCall,
        acceptCall,
        rejectCall,
        endCall,
    };
};

export default useCall;
