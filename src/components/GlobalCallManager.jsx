import React from "react";
import { useCallContext } from "@contexts/CallContext";
import CallWindow from "./Chat/CallWindow";

/**
 * GlobalCallManager
 * This component listens for incoming calls and handles the ringtone globally.
 * It also displays the CallWindow when a call is in progress.
 */
const GlobalCallManager = () => {
    const { callState, acceptCall, rejectCall, endCall, toggleAudio, toggleVideo } = useCallContext();

    if (!callState.inCall && !callState.incomingCall && !callState.outgoingCallId) {
        return null;
    }

    return (
        <CallWindow
            callState={callState}
            onEndCall={endCall}
            isIncomingMode={!!callState.incomingCall && !callState.inCall}
            onAcceptVO={() => acceptCall("voice")}
            onAcceptVideo={() => acceptCall("video")}
            onReject={rejectCall}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            // onRetry logic is slightly complex here as we don't have the original parameters
            // but for global management, the basic end/accept/reject is most important
        />
    );
};

export default GlobalCallManager;
