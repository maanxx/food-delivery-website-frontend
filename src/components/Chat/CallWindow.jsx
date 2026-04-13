import React, { useEffect, useRef, useState } from "react";
import { Button, Avatar, Space, Tooltip } from "antd";
import { PhoneOutlined, VideoCameraOutlined, PhoneOutlined as HangupIcon } from "@ant-design/icons";
import styles from "./CallWindow.module.css";
import useCallNotification from "@hooks/useCallNotification";

const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// Audio visualization component for voice calls
const AudioVisualization = ({ stream }) => {
    const canvasRef = useRef(null);
    const analyserRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!stream || !canvasRef.current) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamAudioTrackSource(stream);
            source.connect(analyser);

            analyserRef.current = analyser;
            analyser.fftSize = 256;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            const draw = () => {
                animationRef.current = requestAnimationFrame(draw);

                analyser.getByteFrequencyData(dataArray);

                ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const barWidth = (canvas.width / dataArray.length) * 2.5;
                let x = 0;

                for (let i = 0; i < dataArray.length; i++) {
                    const barHeight = (dataArray[i] / 255) * canvas.height;
                    const hue = (i / dataArray.length) * 360;
                    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    x += barWidth + 1;
                }
            };

            draw();

            return () => {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
            };
        } catch (error) {
            console.error("Failed to set up audio visualization:", error);
        }
    }, [stream]);

    return <canvas ref={canvasRef} className={styles.audioVisualization} width={300} height={100} />;
};

const CallWindow = ({ callState, onEndCall, isIncomingMode = false, onAcceptVO, onAcceptVideo, onReject }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [audioError, setAudioError] = useState(null);

    // Use notification hook for incoming calls
    useCallNotification(callState.incomingCall);

    // Display local stream
    useEffect(() => {
        if (localVideoRef.current && callState.localStream) {
            localVideoRef.current.srcObject = callState.localStream;
        }
    }, [callState.localStream]);

    // Display remote stream
    useEffect(() => {
        if (remoteVideoRef.current && callState.remoteStream) {
            remoteVideoRef.current.srcObject = callState.remoteStream;
        }
    }, [callState.remoteStream]);

    // Check for audio issues
    useEffect(() => {
        if (callState.error?.includes("audio") || callState.error?.includes("media")) {
            setAudioError(callState.error);
        }
    }, [callState.error]);

    // Incoming call mode
    if (isIncomingMode && callState.incomingCall && !callState.inCall) {
        return (
            <div className={styles.incomingCallContainer}>
                <div className={styles.incomingCallContent}>
                    <Avatar size={80} style={{ marginBottom: "20px", backgroundColor: "#1890ff" }}>
                        {callState.incomingCall.fromUserName?.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                    <h2>{callState.incomingCall.fromUserName || "Unknown"} is calling...</h2>
                    <p className={styles.callTypeLabel}>
                        {callState.incomingCall.callType === "video" ? "📹 Video Call" : "📞 Voice Call"}
                    </p>

                    <Space size="large" style={{ marginTop: "30px" }}>
                        <Tooltip title="Accept">
                            <Button
                                type="primary"
                                shape="circle"
                                size="large"
                                icon={
                                    callState.incomingCall.callType === "video" ? (
                                        <VideoCameraOutlined />
                                    ) : (
                                        <PhoneOutlined />
                                    )
                                }
                                onClick={() =>
                                    callState.incomingCall.callType === "video" ? onAcceptVideo() : onAcceptVO()
                                }
                                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                            />
                        </Tooltip>
                        <Tooltip title="Reject">
                            <Button danger shape="circle" size="large" icon={<HangupIcon />} onClick={onReject} />
                        </Tooltip>
                    </Space>
                </div>
            </div>
        );
    }

    // Active call mode
    if (callState.inCall) {
        return (
            <div className={styles.callContainer}>
                {/* Remote video/display */}
                <div className={styles.remoteVideoContainer}>
                    {callState.callType === "video" ? (
                        <video ref={remoteVideoRef} autoPlay playsInline className={styles.video} />
                    ) : (
                        <div className={styles.voiceCallDisplay}>
                            <Avatar size={120} style={{ backgroundColor: "#1890ff" }}>
                                {callState.remoteUserName?.charAt(0).toUpperCase() || "U"}
                            </Avatar>
                            <h3>{callState.remoteUserName || "User"}</h3>
                            <p className={styles.duration}>{formatDuration(callState.callDuration)}</p>
                            {callState.remoteStream && <AudioVisualization stream={callState.remoteStream} />}
                        </div>
                    )}
                </div>

                {/* Local video/display */}
                {callState.callType === "video" && (
                    <div className={styles.localVideoContainer}>
                        <video ref={localVideoRef} autoPlay playsInline muted className={styles.localVideo} />
                    </div>
                )}

                {/* Call controls */}
                <div className={styles.callControls}>
                    <span className={styles.callInfo}>
                        {callState.callType === "video" ? "📹 Video Call" : "📞 Voice Call"} •{" "}
                        {formatDuration(callState.callDuration)}
                    </span>
                    <Tooltip title="End Call">
                        <Button
                            danger
                            type="primary"
                            shape="circle"
                            size="large"
                            icon={<HangupIcon />}
                            onClick={onEndCall}
                            className={styles.endCallBtn}
                        />
                    </Tooltip>
                </div>
            </div>
        );
    }

    // Outgoing call waiting mode
    if (callState.outgoingCallId && !callState.inCall) {
        return (
            <div className={styles.outgoingCallContainer}>
                <div className={styles.outgoingCallContent}>
                    <Avatar size={80} style={{ marginBottom: "20px", backgroundColor: "#1890ff" }}>
                        {callState.remoteUserName?.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                    <h2>Calling {callState.remoteUserName || "User"}...</h2>
                    <p className={styles.callTypeLabel}>
                        {callState.callType === "video" ? "📹 Video Call" : "📞 Voice Call"}
                    </p>

                    <div className={styles.dialingAnimation}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <Button danger onClick={onEndCall} style={{ marginTop: "30px" }}>
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return null;
};

export default CallWindow;
