// Load polyfills FIRST before anything else
import "./polyfills.js";

import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import App from "./App.jsx";
import { GlobalStyles } from "@components/index.js";
import { LoadingProvider } from "@contexts/loading.js";
import { persistor, store } from "@store/store";

// Polyfill for Node.js modules used by simple-peer and other libraries
if (typeof window !== "undefined") {
    if (!window.process) {
        window.process = {
            env: {},
            nextTick: (callback) => {
                // Use queueMicrotask if available, otherwise use setTimeout
                if (typeof window.queueMicrotask === "function") {
                    window.queueMicrotask(callback);
                } else {
                    setTimeout(callback, 0);
                }
            },
        };
    } else if (!window.process.nextTick) {
        // If process exists but nextTick doesn't, add it
        window.process.nextTick = (callback) => {
            if (typeof window.queueMicrotask === "function") {
                window.queueMicrotask(callback);
            } else {
                setTimeout(callback, 0);
            }
        };
    }

    // Add global object for stream polyfill
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
                        <App />
                    </LoadingProvider>
                </GlobalStyles>
            </PersistGate>
        </Provider>
    </React.StrictMode>,
);

reportWebVitals();
