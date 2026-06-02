import "./polyfills.js";

import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import App from "./App.jsx";
import { GlobalStyles } from "@components/index.js";
import { LoadingProvider } from "@contexts/loading.js";
import { CallProvider } from "@contexts/CallContext.js";
import { persistor, store } from "@store/store";

if (typeof window !== "undefined") {
    if (!window.process) {
        window.process = {
            env: {},
            nextTick: (callback) => {
                if (typeof window.queueMicrotask === "function") {
                    window.queueMicrotask(callback);
                } else {
                    setTimeout(callback, 0);
                }
            },
        };
    } else if (!window.process.nextTick) {
        window.process.nextTick = (callback) => {
            if (typeof window.queueMicrotask === "function") {
                window.queueMicrotask(callback);
            } else {
                setTimeout(callback, 0);
            }
        };
    }

    if (!window.global) {
        window.global = window;
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <GlobalStyles>
                    <LoadingProvider>
                        <CallProvider>
                            <App />
                        </CallProvider>
                    </LoadingProvider>
                </GlobalStyles>
            </PersistGate>
        </Provider>
    </React.StrictMode>,
);

reportWebVitals();
