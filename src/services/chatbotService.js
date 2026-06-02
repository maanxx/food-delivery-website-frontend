const sendChatMessage = async (message, chatHistory = [], options = {}) => {
    try {
        if (!message || message.trim() === "") {
            throw new Error("Tin nhắn không được để trống.");
        }

        const response = await axiosInstance({
            url: "/api/chat",
            method: "post",
            data: {
                message: message.trim(),
                sessionId: options.sessionId || "",
                chatHistory: chatHistory.map(({ role, content, dishes = [] }) => ({
                    role,
                    content,
                    dishes,
                })),
            },
        });

        if (response.data?.success && response.data?.data?.reply) {
            return {
                reply: response.data.data.reply,
                cards: Array.isArray(response.data.data.cards) ? response.data.data.cards : [],
            };
        }

        throw new Error(
            response.data?.message || "Phản hồi từ server không hợp lệ."
        );
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const serverMsg = error.response.data?.message;

            if (status === 503) {
                throw new Error(
                    serverMsg || "Hệ thống AI đang bận. Vui lòng thử lại sau ít giây."
                );
            }
            if (status === 400) {
                throw new Error(serverMsg || "Dữ liệu gửi lên không hợp lệ.");
            }
            throw new Error(
                serverMsg || `Lỗi máy chủ (${status}). Vui lòng thử lại.`
            );
        }

        if (error.request) {
            throw new Error(
                "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
            );
        }

        throw new Error(error.message || "Đã xảy ra lỗi không xác định.");
    }
};

export { sendChatMessage };
