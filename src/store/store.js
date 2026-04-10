import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { thunk } from "redux-thunk";

import authReducer from "@features/auth/authSlice";

const persistConfig = {
    key: "root",
    storage,
};

const rootReducer = combineReducers({
    auth: authReducer,
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
