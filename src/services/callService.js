import axiosInstance from "@config/axiosInstance";

const API_BASE = "/api/calls";

const callService = {
    // Initiate a call
    initiateCall: (conversationId, callType = "voice") => {
        return axiosInstance.post(`${API_BASE}/initiate`, {
            conversationId,
            callType, // 'voice' or 'video'
        });
    },

    // Accept a call
    acceptCall: (callId) => {
        return axiosInstance.post(`${API_BASE}/${callId}/accept`);
    },

    // Reject a call
    rejectCall: (callId, reason = "user_declined") => {
        return axiosInstance.post(`${API_BASE}/${callId}/reject`, {
            reason,
        });
    },

    // End a call
    endCall: (callId) => {
        return axiosInstance.post(`${API_BASE}/${callId}/end`);
    },

    // Get call history
    getCallHistory: (conversationId, limit = 50) => {
        return axiosInstance.get(`${API_BASE}/history/${conversationId}`, {
            params: { limit },
        });
    },

    // Get active calls
    getActiveCalls: () => {
        return axiosInstance.get(`${API_BASE}/active`);
    },
};

export default callService;
