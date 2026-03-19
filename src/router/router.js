import React from "react";
import { createBrowserRouter } from "react-router-dom";

import {
    Home,
    Error,
    About,
    Cart,
    Chat,
    Checkout,
    Dashboard,
    Login,
    Menu,
    Order,
    Profile,
    Search,
    Contact,
    Offers,
    ForgotPassword,
} from "@pages/index";
import {
    Authentication,
    FormForgotPasswordOTP,
    FormResetPassword,
    FormPassword,
    FormPhoneNumber,
    FormUserName,
    LoginStatus,
} from "@components/index";
import DefaultLayout from "@layouts/DefaultLayout";
import FormForgetPasswordInfo from "@components/FormForgotPassword/FormForgotPasswordInfo/FormForgotPasswordInfo";
import FormLoginOTP from "@components/FormLogin/FormLoginOTP/FormLoginOTP";

const publicRoutes = [
    {
        path: "/",
        element: <DefaultLayout />,
        errorElement: <Error />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/about",
                element: <About />,
            },

            {
                path: "/search",
                element: <Search />,
            },
            {
                path: "/menu",
                element: <Menu />,
            },
            {
                path: "/contact",
                element: <Contact />,
            },
            {
                path: "/offers",
                element: <Offers />,
            },
        ],
    },
    {
        path: "/login",
        element: <Login />,
        children: [
            {
                path: "",
                element: <FormPhoneNumber />,
            },
            {
                path: "input-username",
                element: <FormUserName />,
            },
            {
                path: "verify-otp",
                element: <FormLoginOTP />,
            },
            {
                path: "input-password",
                element: <FormPassword />,
            },
            {
                path: "status",
                element: <LoginStatus />,
            },
        ],
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />,
        children: [
            {
                path: "",
                element: <FormForgetPasswordInfo />,
            },
            {
                path: "verify-otp",
                element: <FormForgotPasswordOTP />,
            },
            {
                path: "reset-password",
                element: <FormResetPassword />,
            },
        ],
    },
];

const privateRoutes = [
    {
        path: "/",
        element: (
            <Authentication>
                <DefaultLayout />
            </Authentication>
        ),
        children: [
            {
                path: "/dashboard",
                element: <Dashboard />,
            },
            {
                path: "/cart",
                element: <Cart />,
            },
            {
                path: "/checkout",
                element: <Checkout />,
            },
            {
                path: "/profile",
                element: <Profile />,
            },
            {
                path: "/chat",
                element: <Chat />,
            },
            {
                path: "/order",
                element: <Order />,
            },
        ],
    },
];

const router = createBrowserRouter([...publicRoutes, ...privateRoutes]);

export default router;
