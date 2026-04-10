import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import App from "./App.jsx";
import { GlobalStyles } from "@components/index.js";
import { LoadingProvider } from "@contexts/loading.js";
import { persistor, store } from "@store/store";

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
