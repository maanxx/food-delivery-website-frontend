import axiosInstance from "@config/axiosInstance";

const API_BASE = "/api/calls";

const callService = {
    initiateCall: (recipientId, conversationId, callType = "voice") => {
        return axiosInstance.post(`${API_BASE}`, {
            recipientId,
            conversationId,
            callType,
        });
    },

    acceptCall: (callId) => {
        return axiosInstance.post(`${API_BASE}/${callId}/accept`);
    },

    rejectCall: (callId, reason = "user_declined") => {
        return axiosInstance.post(`${API_BASE}/${callId}/reject`, {
            reason,
        });
    },

    endCall: (callId) => {
        return axiosInstance.post(`${API_BASE}/${callId}/end`);
    },

    getCallHistory: (conversationId, limit = 50) => {
        return axiosInstance.get(`${API_BASE}/history/${conversationId}`, {
            params: { limit },
        });
    },

    getActiveCalls: () => {
        return axiosInstance.get(`${API_BASE}/active`);
    },

    initiateGroupCall: (conversationId, callType = "voice", participantIds = []) => {
        return axiosInstance.post(`${API_BASE}/group`, {
            conversationId,
            callType,
            participantIds,
        });
    },

    addGroupCallParticipant: (callId, participantId) => {
        return axiosInstance.post(`${API_BASE}/${callId}/add-participant`, {
            participantId,
        });
    },

    removeGroupCallParticipant: (callId, participantId) => {
        return axiosInstance.post(`${API_BASE}/${callId}/remove-participant`, {
            participantId,
        });
    },
};

export default callService;
