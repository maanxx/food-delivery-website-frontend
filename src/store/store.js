import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { thunk } from "redux-thunk";

import authReducer from "@features/auth/authSlice";
import chatReducer from "@features/chat/chatSlice";
import orderReducer from "@features/order/orderSlice";
import cartReducer from "@features/cart/cartSlice";

const persistConfig = {
    key: "root",
    storage,
    blacklist: ["order"], // Order state is transient
};

const rootReducer = combineReducers({
    auth: authReducer,
    chat: chatReducer,
    order: orderReducer,
    cart: cartReducer,
});

const middlewares = [thunk];

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== "production",
    middleware: () => {
        return [...middlewares];
    },
});

const persistor = persistStore(store);

export { store, persistor };

