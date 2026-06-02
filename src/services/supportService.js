import axiosInstance from "@config/axiosInstance";

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
