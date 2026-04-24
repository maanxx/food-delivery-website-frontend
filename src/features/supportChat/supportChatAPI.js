import axiosInstance from "@config/axiosInstance";

const BASE = "/api/support";

/**
 * Tập hợp các hàm gọi API cho tính năng Support Chat (Customer ↔ Admin)
 */
export const supportChatAPI = {
    /**
     * [Customer] Tạo hoặc lấy lại cuộc hội thoại đang mở
     */
    getOrCreate: (subject = "") =>
        axiosInstance.post(`${BASE}/conversations`, { subject }),

    /**
     * [Customer] Lấy cuộc hội thoại đang mở của mình
     */
    getMyConversation: () =>
        axiosInstance.get(`${BASE}/conversations/mine`),

    /**
     * [Admin] Lấy danh sách toàn bộ cuộc hội thoại
     * @param {string} status - 'all' | 'open' | 'closed'
     */
    getAllConversations: (status = "all", page = 1, limit = 20) =>
        axiosInstance.get(`${BASE}/conversations`, { params: { status, page, limit } }),

    /**
     * [Customer & Admin] Lấy lịch sử tin nhắn trong 1 cuộc hội thoại
     */
    getMessages: (conversationId, page = 1, limit = 50) =>
        axiosInstance.get(`${BASE}/conversations/${conversationId}/messages`, {
            params: { page, limit },
        }),

    /**
     * [Customer & Admin] Gửi tin nhắn
     */
    sendMessage: (conversationId, content) =>
        axiosInstance.post(`${BASE}/conversations/${conversationId}/messages`, { content }),

    /**
     * [Admin] Đóng cuộc hội thoại
     */
    closeConversation: (conversationId) =>
        axiosInstance.put(`${BASE}/conversations/${conversationId}/close`),

    /**
     * [Admin] Mở lại cuộc hội thoại
     */
    reopenConversation: (conversationId) =>
        axiosInstance.put(`${BASE}/conversations/${conversationId}/reopen`),
};
