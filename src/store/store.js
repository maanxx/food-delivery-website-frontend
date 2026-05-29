import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import customerAuthReducer from "@features/auth/customerAuthSlice";
import adminAuthReducer from "@features/auth/adminAuthSlice";
import chatReducer from "@features/chat/chatSlice";
import orderReducer from "@features/order/orderSlice";
import cartReducer from "@features/cart/cartSlice";
import voucherReducer from "@features/voucher/voucherSlice";
import addressReducer from "@features/address/addressSlice";
import userReducer from "@features/user/userSlice";

const persistConfig = {
    key: "root",
    storage,
    blacklist: ["auth",
        "adminAuth",
        "order",
        "voucher",
        "address"], 
};

const rootReducer = combineReducers({
    customerAuth: customerAuthReducer,
    adminAuth: adminAuthReducer,
    chat: chatReducer,
    order: orderReducer,
    cart: cartReducer,
    voucher: voucherReducer,
    address: addressReducer,
    user: userReducer,
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

