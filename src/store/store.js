import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "@features/auth/authSlice";
import chatReducer from "@features/chat/chatSlice";
import orderReducer from "@features/order/orderSlice";
import cartReducer from "@features/cart/cartSlice";
import voucherReducer from "@features/voucher/voucherSlice";
import addressReducer from "@features/address/addressSlice";
import userReducer from "@features/user/userSlice";
import supportChatReducer from "@features/supportChat/supportChatSlice";

const persistConfig = {
    key: "root",
    storage,
    blacklist: ["order", "voucher", "address"], 
};

const rootReducer = combineReducers({
    auth: authReducer,
    chat: chatReducer,
    order: orderReducer,
    cart: cartReducer,
    voucher: voucherReducer,
    address: addressReducer,
    user: userReducer,
    supportChat: supportChatReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== "production",
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

const persistor = persistStore(store);

export { store, persistor };

