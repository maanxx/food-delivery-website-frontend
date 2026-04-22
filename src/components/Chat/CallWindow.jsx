import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button, Avatar, Space, Tooltip, Alert } from "antd";
import { 
    PhoneOutlined, 
    VideoCameraOutlined, 
    AudioOutlined, 
    AudioMutedOutlined,
    EyeInvisibleOutlined,
    SyncOutlined,
    FullscreenOutlined
} from "@ant-design/icons";
import styles from "./CallWindow.module.css";
import useAudioLevel from "@hooks/useAudioLevel";
import MicrophoneReaction from "./MicrophoneReaction";
import { getUserInfo } from "@helpers/cookieHelper";

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
            const source = audioContext.createMediaStreamSource(stream);
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

const CallWindow = ({ 
    callState, 
    onEndCall, 
    isIncomingMode = false, 
    onAcceptVO, 
    onAcceptVideo, 
    onReject, 
    onRetry,
    onToggleAudio,
    onToggleVideo
}) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const [audioError, setAudioError] = useState(null);
    const [isAudioBlocked, setIsAudioBlocked] = useState(false);
    
    const userInfo = getUserInfo();

    // Phát hiện mức âm thanh từ local stream
    const localAudioLevel = useAudioLevel(callState?.localStream, 50);

    // console.log("🎬 [CallWindow] RENDER - callState:", {
    //     inCall: callState?.inCall,
    //     callType: callState?.callType,
    //     hasRemoteStream: !!callState?.remoteStream,
    //     remoteStreamId: callState?.remoteStream?.id,
    //     remoteStreamTracks: callState?.remoteStream?.getTracks?.()?.length || 0,
    // });

    // Helper function to get display name (not ID)
    const getDisplayName = (name) => {
        if (!name) return "User";
        // Check if it looks like an ID (all numbers or very long string with numbers)
        if (/^\d+$/.test(name) || /^[0-9a-f]{20,}$/i.test(name)) {
            return "Unknown User";
        }
        return name;
    };

    // Display local stream
    useEffect(() => {
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = callState.localStream || null;
        }
    }, [callState.localStream]);

    // Display remote stream
    useEffect(() => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = callState.remoteStream || null;
        }
    }, [callState.remoteStream]);

    // Handle remote audio for voice calls
    useEffect(() => {
        if (!remoteAudioRef.current || !callState.remoteStream || callState.callType !== "voice") {
            return;
        }

        console.log("🎧 [CallWindow] Setting up remote audio");
        console.log("   Stream:", callState.remoteStream);
        console.log("   Stream ID:", callState.remoteStream?.id);

        // Check audio tracks
        const audioTracks = callState.remoteStream?.getAudioTracks?.() || [];
        console.log("   Audio tracks count:", audioTracks.length);
        audioTracks.forEach((track, idx) => {
            console.log(`   Track ${idx}:`, {
                enabled: track.enabled,
                readyState: track.readyState,
                kind: track.kind,
            });
        });

        // Make sure audio tracks are enabled
        if (audioTracks.length === 0) {
            console.warn("⚠️ [CallWindow] NO AUDIO TRACKS in remote stream! Cannot play audio.");
            setAudioError("No audio tracks received. Check remote user's microphone.");
            return;
        }

        // Enable all audio tracks
        audioTracks.forEach((track) => {
            if (!track.enabled) {
                console.log("🔊 [CallWindow] Enabling audio track");
                track.enabled = true;
            }
        });

        // Set the stream and configure audio element
        remoteAudioRef.current.srcObject = callState.remoteStream;
        remoteAudioRef.current.volume = 1.0; // Set volume to max
        remoteAudioRef.current.muted = false; // Ensure not muted
        console.log("   Audio element configured");

        // Add a small delay to ensure the audio element is ready
        const playAudio = async () => {
            try {
                console.log("   Attempting to play audio...");
                // Remove autoPlay attribute and play manually for better control
                if (remoteAudioRef.current) {
                    remoteAudioRef.current.autoplay = true;

                    const playPromise = remoteAudioRef.current.play();
                    if (playPromise !== undefined) {
                        await playPromise;
                        setAudioError(null);
                    }
                }
            } catch (err) {
                console.error("   Error message:", err.message);

                // Handle specific autoplay policy errors
                if (err.name === "NotAllowedError") {
                    console.warn("   ⚠️ Browser autoplay policy prevented audio playback");
                    setAudioError("Click anywhere on the page to enable audio playback");
                } else {
                    setAudioError(`Audio playback failed: ${err.message}`);
                }
            }
        };

        // Use setTimeout to ensure the audio element is in the DOM and ready
        const timeoutId = setTimeout(playAudio, 100);
        return () => clearTimeout(timeoutId);
    }, [callState.remoteStream, callState.callType]);

    // Check for audio issues
    useEffect(() => {
        if (callState.error?.includes("audio") || callState.error?.includes("media")) {
            setAudioError(callState.error);
        }
    }, [callState.error]);

    // Retry audio playback - for handling autoplay policy
    const retryAudioPlayback = useCallback(async () => {
        if (!remoteAudioRef.current) return;

        try {
            console.log("🔊 [retryAudioPlayback] Attempting to resume audio playback");
            setIsAudioBlocked(false);
            await remoteAudioRef.current.play();
            console.log("✅ [retryAudioPlayback] Audio playback resumed successfully");
            setAudioError(null);
        } catch (err) {
            console.error("❌ [retryAudioPlayback] Failed to resume audio:", err);
            setAudioError(`Failed to resume audio: ${err.message}`);
        }
    }, []);

    // Incoming call mode
    if (isIncomingMode && callState.incomingCall && !callState.inCall) {
        return (
            <div className={styles.incomingCallContainer}>
                <div className={styles.incomingCallContent}>
                    <Avatar size={80} style={{ marginBottom: "20px", backgroundColor: "#1890ff" }}>
                        {getDisplayName(callState.incomingCall.fromUserName)?.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                    <h2>{getDisplayName(callState.incomingCall.fromUserName)} is calling...</h2>
                    <p className={styles.callTypeLabel}>
                        {callState.incomingCall.callType === "video" ? "📹 Video Call" : "📞 Voice Call"}
                    </p>

                    <Space size="large" style={{ marginTop: "30px" }}>
                        <Tooltip title="Accept">
                            <Button
                                type="primary"
                                shape="circle"
                                size="large"
                                className={styles.acceptBtn}
                                icon={
                                    callState.incomingCall.callType === "video" ? (
                                        <VideoCameraOutlined />
                                    ) : (
                                        <PhoneOutlined />
                                    )
                                }
                                onClick={() => {
                                    if (callState.incomingCall.callType === "video") {
                                        onAcceptVideo();
                                    } else {
                                        onAcceptVO();
                                    }
                                }}
                            />
                        </Tooltip>
                        <Tooltip title="Reject">
                            <Button 
                                danger 
                                shape="circle" 
                                size="large" 
                                icon={<PhoneOutlined rotate={135} />} 
                                onClick={onReject}
                                className={styles.rejectBtn}
                            />
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
                        <>
                            {/* Audio element for voice calls - plays remote audio */}
                            <audio
                                ref={remoteAudioRef}
                                autoPlay
                                controls={false}
                                crossOrigin="anonymous"
                                playsInline
                                muted={false}
                                style={{ display: "none" }}
                            />
                            {audioError && (
                                <Alert
                                    message="Audio Issue"
                                    description={audioError}
                                    type="warning"
                                    showIcon
                                    action={
                                        audioError.includes("autoplay") && (
                                            <Button size="small" onClick={retryAudioPlayback}>
                                                Enable Audio
                                            </Button>
                                        )
                                    }
                                    style={{ marginBottom: "20px" }}
                                />
                            )}
                            <div className={styles.voiceCallDisplay}>
                                <Avatar size={120} style={{ backgroundColor: "#1890ff" }}>
                                    {getDisplayName(callState.remoteUserName)?.charAt(0).toUpperCase() || "U"}
                                </Avatar>
                                <h3>{getDisplayName(callState.remoteUserName)}</h3>
                                <p className={styles.duration}>{formatDuration(callState.callDuration)}</p>
                                {callState.remoteStream && <AudioVisualization stream={callState.remoteStream} />}
                                {/* Microphone reaction effect */}
                                <MicrophoneReaction audioLevel={localAudioLevel} isActive={callState.inCall} />
                            </div>
                        </>
                    )}
                </div>

                {/* Local video/display */}
                {callState.callType === "video" && (
                    <div className={styles.localVideoContainer}>
                        {callState.isCameraOff ? (
                            <div className={styles.cameraOffPlaceholder}>
                                <Avatar size={48} style={{ backgroundColor: "#8c8c8c" }}>
                                    {userInfo?.name?.charAt(0).toUpperCase() || "U"}
                                </Avatar>
                            </div>
                        ) : (
                            <video ref={localVideoRef} autoPlay playsInline muted className={styles.localVideo} />
                        )}
                        {/* Microphone reaction for video calls */}
                        <div className={styles.localMicReaction}>
                            <MicrophoneReaction audioLevel={localAudioLevel} isActive={callState.inCall} size="small" />
                        </div>
                    </div>
                )}

                {/* Call controls */}
                <div className={styles.callControls}>
                    <div className={styles.callInfoGroup}>
                        <span className={styles.callStatusIndicator}></span>
                        <span className={styles.callInfo}>
                            {callState.callType === "video" ? "📹 Video Call" : "📞 Voice Call"} •{" "}
                            {formatDuration(callState.callDuration)}
                        </span>
                    </div>

                    <div className={styles.mainControls}>
                        <Tooltip title={callState.isMuted ? "Unmute" : "Mute"}>
                            <Button
                                shape="circle"
                                size="large"
                                icon={callState.isMuted ? <AudioMutedOutlined /> : <AudioOutlined />}
                                onClick={onToggleAudio}
                                className={`${styles.controlBtn} ${callState.isMuted ? styles.active : ""}`}
                            />
                        </Tooltip>

                        {callState.callType === "video" && (
                            <Tooltip title={callState.isCameraOff ? "Turn Camera On" : "Turn Camera Off"}>
                                <Button
                                    shape="circle"
                                    size="large"
                                    icon={callState.isCameraOff ? <EyeInvisibleOutlined /> : <VideoCameraOutlined />}
                                    onClick={onToggleVideo}
                                    className={`${styles.controlBtn} ${callState.isCameraOff ? styles.active : ""}`}
                                />
                            </Tooltip>
                        )}

                        <Tooltip title="End Call">
                            <Button
                                danger
                                type="primary"
                                shape="circle"
                                size="large"
                                icon={<PhoneOutlined rotate={135} />}
                                onClick={onEndCall}
                                className={styles.endCallBtn}
                            />
                        </Tooltip>
                    </div>

                    <div className={styles.extraControls}>
                        <Tooltip title="Fullscreen">
                            <Button shape="circle" icon={<FullscreenOutlined />} className={styles.ghostBtn} />
                        </Tooltip>
                    </div>
                </div>
            </div>
        );
    }

    // Outgoing call waiting mode
    if (callState.outgoingCallId && !callState.inCall) {
        return (
            <div className={styles.outgoingCallContainer}>
                {/* For video calls, show local preview even before connection */}
                {callState.callType === "video" && callState.localStream && (
                    <div className={styles.previewBackground}>
                        <video ref={localVideoRef} autoPlay playsInline muted className={styles.fullPreview} />
                    </div>
                )}

                <div className={styles.outgoingCallContent}>
                    {/* Show error alert if there's an error */}
                    {callState.error && (
                        <Alert
                            message="Call Failed"
                            description={callState.error}
                            type="error"
                            showIcon
                            style={{ marginBottom: "20px", width: "100%", borderRadius: "12px" }}
                        />
                    )}

                    <div className={styles.userProfile}>
                        <Avatar size={100} className={styles.profileAvatar}>
                            {getDisplayName(callState.remoteUserName)?.charAt(0).toUpperCase() || "U"}
                        </Avatar>
                        <div className={styles.ringRipple}></div>
                    </div>

                    <h2 className={styles.userName}>
                        {callState.error ? "Call Failed" : `Calling ${getDisplayName(callState.remoteUserName)}...`}
                    </h2>
                    <p className={styles.callTypeLabel}>
                        {callState.callType === "video" ? "📹 Video Call" : "📞 Voice Call"}
                    </p>

                    {!callState.error && (
                        <div className={styles.dialingAnimation}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    )}

                    <Space style={{ marginTop: "40px" }} size="middle">
                        {callState.callType === "video" && (
                             <Tooltip title={callState.isCameraOff ? "Turn Camera On" : "Turn Camera Off"}>
                                <Button
                                    shape="circle"
                                    size="large"
                                    icon={callState.isCameraOff ? <EyeInvisibleOutlined /> : <VideoCameraOutlined />}
                                    onClick={onToggleVideo}
                                    className={`${styles.controlBtn} ${callState.isCameraOff ? styles.active : ""}`}
                                />
                            </Tooltip>
                        )}
                        <Tooltip title={callState.isMuted ? "Unmute" : "Mute"}>
                            <Button
                                shape="circle"
                                size="large"
                                icon={callState.isMuted ? <AudioMutedOutlined /> : <AudioOutlined />}
                                onClick={onToggleAudio}
                                className={`${styles.controlBtn} ${callState.isMuted ? styles.active : ""}`}
                            />
                        </Tooltip>
                        <Tooltip title="Cancel">
                            <Button 
                                danger 
                                type="primary" 
                                shape="circle" 
                                size="large" 
                                icon={<PhoneOutlined rotate={135} />} 
                                onClick={onEndCall} 
                                className={styles.endCallBtn}
                            />
                        </Tooltip>
                        
                        {callState.error && onRetry && (
                            <Button type="primary" onClick={onRetry} className={styles.retryBtn}>
                                Retry Call
                            </Button>
                        )}
                    </Space>
                </div>
            </div>
        );
    }

    return null;
};

export default CallWindow;
