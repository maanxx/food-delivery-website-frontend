import axiosInstance from "@config/axiosInstance";

/**
 * ============================================================
 *  SUPPORT SERVICE — supportService.js (Frontend / React)
 * ============================================================
 * Handles customer support live chat API requests.
 * Supports both Customer and Admin endpoints.
 * ============================================================
 */

// ── CUSTOMER ENDPOINTS ──────────────────────────────────────

/**
 * Get current logged in customer's active support conversation.
 * GET /api/support/conversations/mine
 */
export const getMyConversation = async () => {
    try {
        const response = await axiosInstance.get("/api/support/conversations/mine");
        if (response.data?.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error("Lỗi lấy phiên hỗ trợ hiện tại:", error);
        throw error;
    }
};

/**
 * Create a new support conversation for the customer.
 * POST /api/support/conversations
 */
export const createConversation = async (subject = "Hỗ trợ khách hàng") => {
    try {
        const response = await axiosInstance.post("/api/support/conversations", { subject });
        if (response.data?.success) {
            return response.data.data;
        }
        throw new Error("Không thể tạo phiên hỗ trợ");
    } catch (error) {
        console.error("Lỗi tạo phiên hỗ trợ:", error);
        throw error;
    }
};

/**
 * Get messages history for a conversation.
 * GET /api/support/conversations/:id/messages
 */
export const getMessages = async (conversationId, page = 1, limit = 50) => {
    try {
        const response = await axiosInstance.get(
            `/api/support/conversations/${conversationId}/messages`,
            { params: { page, limit } }
        );
        if (response.data?.success) {
            return response.data.data;
        }
        throw new Error("Không thể lấy lịch sử tin nhắn");
    } catch (error) {
        console.error("Lỗi lấy lịch sử tin nhắn support:", error);
        throw error;
    }
};

/**
 * Send a support message.
 * POST /api/support/conversations/:id/messages
 */
export const sendMessage = async (conversationId, content) => {
    try {
        const response = await axiosInstance.post(
            `/api/support/conversations/${conversationId}/messages`,
            { content }
        );
        if (response.data?.success) {
            return response.data.data;
        }
        throw new Error("Không thể gửi tin nhắn");
    } catch (error) {
        console.error("Lỗi gửi tin nhắn support:", error);
        throw error;
    }
};

// ── ADMIN ENDPOINTS ─────────────────────────────────────────

/**
 * Get all support conversations.
 * GET /api/support/conversations
 * Admin credentials requested explicitly via header 'x-auth-type'
 */
export const getAllConversations = async (status = "all", page = 1, limit = 50) => {
    try {
        const response = await axiosInstance.get("/api/support/conversations", {
            params: { status, page, limit },
            headers: { "x-auth-type": "admin" }
        });
        if (response.data?.success) {
            return response.data.data;
        }
        throw new Error("Không thể tải danh sách phiên hỗ trợ");
    } catch (error) {
        console.error("Lỗi lấy danh sách phiên hỗ trợ cho admin:", error);
        throw error;
    }
};

/**
 * Close a support conversation.
 * PUT /api/support/conversations/:id/close
 */
export const closeConversation = async (conversationId) => {
    try {
        const response = await axiosInstance.put(
            `/api/support/conversations/${conversationId}/close`,
            {},
            { headers: { "x-auth-type": "admin" } }
        );
        return response.data?.success ?? false;
    } catch (error) {
        console.error("Lỗi đóng phiên hỗ trợ:", error);
        throw error;
    }
};

/**
 * Reopen a support conversation.
 * PUT /api/support/conversations/:id/reopen
 */
export const reopenConversation = async (conversationId) => {
    try {
        const response = await axiosInstance.put(
            `/api/support/conversations/${conversationId}/reopen`,
            {},
            { headers: { "x-auth-type": "admin" } }
        );
        return response.data?.success ?? false;
    } catch (error) {
        console.error("Lỗi mở lại phiên hỗ trợ:", error);
        throw error;
    }
};

const supportService = {
    getMyConversation,
    createConversation,
    getMessages,
    sendMessage,
    getAllConversations,
    closeConversation,
    reopenConversation
};

export default supportService;
