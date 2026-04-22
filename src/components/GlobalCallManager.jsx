import React from "react";
import useWebSocket from "@hooks/useWebSocket";
import useCall from "@hooks/useCall";
import useCallNotification from "@hooks/useCallNotification";
import CallWindow from "./Chat/CallWindow";

/**
 * GlobalCallManager
 * This component listens for incoming calls and handles the ringtone globally.
 * It also displays the CallWindow when a call is in progress.
 */
const GlobalCallManager = () => {
    const { socket } = useWebSocket();
    const { callState, acceptCall, rejectCall, endCall, makeCall } = useCall(socket);

    // This hook handles the audible ringtone and browser notifications
    useCallNotification(callState.incomingCall, callState.outgoingCallId);

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
            // onRetry logic is slightly complex here as we don't have the original parameters
            // but for global management, the basic end/accept/reject is most important
        />
    );
};

export default GlobalCallManager;
