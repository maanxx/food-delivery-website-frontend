import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supportChatAPI } from "./supportChatAPI";

// ────────────────────────────────────────────────────────────
// ASYNC THUNKS
// ────────────────────────────────────────────────────────────

/**
 * [Customer] Tạo hoặc lấy lại cuộc hội thoại đang mở
 */
export const initSupportConversation = createAsyncThunk(
    "supportChat/initConversation",
    async (subject = "", { rejectWithValue }) => {
        try {
            const res = await supportChatAPI.getOrCreate(subject);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Không thể khởi tạo chat");
        }
    }
);

/**
 * [Customer] Lấy conversation đang mở (khi trang load)
 */
export const fetchMyConversation = createAsyncThunk(
    "supportChat/fetchMyConversation",
    async (_, { rejectWithValue }) => {
        try {
            const res = await supportChatAPI.getMyConversation();
            return res.data.data; // null nếu chưa có
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Lỗi");
        }
    }
);

/**
 * [Admin] Lấy danh sách tất cả conversation
 */
export const fetchAdminConversations = createAsyncThunk(
    "supportChat/fetchAdminConversations",
    async ({ status = "all", page = 1, limit = 20 } = {}, { rejectWithValue }) => {
        try {
            const res = await supportChatAPI.getAllConversations(status, page, limit);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Không thể tải danh sách chat");
        }
    }
);

/**
 * [Customer & Admin] Lấy lịch sử tin nhắn
 */
export const fetchSupportMessages = createAsyncThunk(
    "supportChat/fetchMessages",
    async ({ conversationId, page = 1, limit = 50 }, { rejectWithValue }) => {
        try {
            const res = await supportChatAPI.getMessages(conversationId, page, limit);
            return { conversationId, messages: res.data.data.messages };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Không thể tải tin nhắn");
        }
    }
);

/**
 * [Customer & Admin] Gửi tin nhắn qua HTTP (lưu DB)
 */
export const sendSupportMessage = createAsyncThunk(
    "supportChat/sendMessage",
    async ({ conversationId, content }, { rejectWithValue }) => {
        try {
            const res = await supportChatAPI.sendMessage(conversationId, content);
            return { conversationId, message: res.data.data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Không thể gửi tin nhắn");
        }
    }
);

/**
 * [Admin] Đóng conversation
 */
export const closeConversation = createAsyncThunk(
    "supportChat/closeConversation",
    async (conversationId, { rejectWithValue }) => {
        try {
            await supportChatAPI.closeConversation(conversationId);
            return conversationId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Không thể đóng cuộc hội thoại");
        }
    }
);

/**
 * [Admin] Mở lại conversation
 */
export const reopenConversation = createAsyncThunk(
    "supportChat/reopenConversation",
    async (conversationId, { rejectWithValue }) => {
        try {
            await supportChatAPI.reopenConversation(conversationId);
            return conversationId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Không thể mở lại cuộc hội thoại");
        }
    }
);

// ────────────────────────────────────────────────────────────
// STATE KHỞI ĐẦU
// ────────────────────────────────────────────────────────────
const initialState = {
    // Conversation hiện tại của Customer
    myConversation: null,

    // Danh sách conversation (cho Admin)
    conversations: [],
    conversationsTotal: 0,
    isLoadingConversations: false,

    // ID conversation đang được xem (Admin chọn 1 trong danh sách)
    activeConversationId: null,

    // Tin nhắn theo từng conversation: { [convId]: [...messages] }
    messagesByConversation: {},
    isLoadingMessages: false,

    // Trạng thái đang gõ của đầu kia
    isTyping: false,

    // Widget trạng thái mở/đóng (Customer)
    isWidgetOpen: false,

    // Lỗi
    error: null,
};

// ────────────────────────────────────────────────────────────
// SLICE
// ────────────────────────────────────────────────────────────
const supportChatSlice = createSlice({
    name: "supportChat",
    initialState,

    reducers: {
        // Mở / Đóng widget chat cho Customer
        toggleWidget: (state) => {
            state.isWidgetOpen = !state.isWidgetOpen;
        },
        openWidget: (state) => {
            state.isWidgetOpen = true;
        },
        closeWidget: (state) => {
            state.isWidgetOpen = false;
        },

        // Admin chọn 1 conversation để xem
        setActiveConversation: (state, action) => {
            state.activeConversationId = action.payload;
        },

        // Khi nhận tin nhắn mới qua Socket (real-time)
        pushNewMessage: (state, action) => {
            const { conversationId, message } = action.payload;
            if (!state.messagesByConversation[conversationId]) {
                state.messagesByConversation[conversationId] = [];
            }
            // Tránh duplicate
            const exists = state.messagesByConversation[conversationId].some(
                (m) => m.id === message.id
            );
            if (!exists) {
                state.messagesByConversation[conversationId].push(message);
            }
        },

        // Cập nhật danh sách conversation khi có tin nhắn mới (Admin sidebar)
        updateConversationPreview: (state, action) => {
            const { conversationId, lastMessage, unreadByAdmin } = action.payload;
            const index = state.conversations.findIndex((c) => c.id === conversationId);
            if (index !== -1) {
                state.conversations[index].lastMessage = lastMessage;
                state.conversations[index].unreadByAdmin = unreadByAdmin;
                // Đưa lên đầu danh sách
                const updated = state.conversations.splice(index, 1)[0];
                state.conversations.unshift(updated);
            }
        },

        // Trạng thái typing
        setIsTyping: (state, action) => {
            state.isTyping = action.payload;
        },

        // Thay đổi status của conversation từ Socket (Closed / Open)
        updateConversationStatus: (state, action) => {
            const { conversationId, status } = action.payload;
            // Cập nhật ở phía Admin list
            const conv = state.conversations.find((c) => c.id === conversationId);
            if (conv) conv.status = status;
            // Cập nhật ở phía Customer widget
            if (state.myConversation?.id === conversationId) {
                state.myConversation.status = status;
            }
        },

        // Xóa lỗi
        clearError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        // ── initSupportConversation ──
        builder
            .addCase(initSupportConversation.fulfilled, (state, action) => {
                state.myConversation = action.payload;
                state.error = null;
            })
            .addCase(initSupportConversation.rejected, (state, action) => {
                state.error = action.payload;
            });

        // ── fetchMyConversation ──
        builder
            .addCase(fetchMyConversation.fulfilled, (state, action) => {
                state.myConversation = action.payload; // có thể null
            });

        // ── fetchAdminConversations ──
        builder
            .addCase(fetchAdminConversations.pending, (state) => {
                state.isLoadingConversations = true;
            })
            .addCase(fetchAdminConversations.fulfilled, (state, action) => {
                state.isLoadingConversations = false;
                state.conversations = action.payload.conversations;
                state.conversationsTotal = action.payload.total;
            })
            .addCase(fetchAdminConversations.rejected, (state, action) => {
                state.isLoadingConversations = false;
                state.error = action.payload;
            });

        // ── fetchSupportMessages ──
        builder
            .addCase(fetchSupportMessages.pending, (state) => {
                state.isLoadingMessages = true;
            })
            .addCase(fetchSupportMessages.fulfilled, (state, action) => {
                state.isLoadingMessages = false;
                const { conversationId, messages } = action.payload;
                state.messagesByConversation[conversationId] = messages;
            })
            .addCase(fetchSupportMessages.rejected, (state, action) => {
                state.isLoadingMessages = false;
                state.error = action.payload;
            });

        // ── sendSupportMessage ──
        builder
            .addCase(sendSupportMessage.fulfilled, (state, action) => {
                const { conversationId, message } = action.payload;
                if (!state.messagesByConversation[conversationId]) {
                    state.messagesByConversation[conversationId] = [];
                }
                // Thêm tin nhắn vừa gửi vào cuối danh sách
                const exists = state.messagesByConversation[conversationId].some(
                    (m) => m.id === message.id
                );
                if (!exists) {
                    state.messagesByConversation[conversationId].push(message);
                }
            })
            .addCase(sendSupportMessage.rejected, (state, action) => {
                state.error = action.payload;
            });

        // ── closeConversation ──
        builder
            .addCase(closeConversation.fulfilled, (state, action) => {
                const conversationId = action.payload;
                // Đánh dấu đóng trong state conversations (Admin)
                const conv = state.conversations.find((c) => c.id === conversationId);
                if (conv) conv.status = "closed";
                // Nếu là myConversation của Customer thì xóa
                if (state.myConversation?.id === conversationId) {
                    state.myConversation = null;
                }
            });
        // ── reopenConversation ──
        builder
            .addCase(reopenConversation.fulfilled, (state, action) => {
                const conversationId = action.payload;
                const conv = state.conversations.find((c) => c.id === conversationId);
                if (conv) conv.status = "open";
            });
    },
});

export const {
    toggleWidget,
    openWidget,
    closeWidget,
    setActiveConversation,
    pushNewMessage,
    updateConversationPreview,
    setIsTyping,
    updateConversationStatus,
    clearError,
} = supportChatSlice.actions;

export default supportChatSlice.reducer;
