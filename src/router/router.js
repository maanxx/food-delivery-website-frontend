import React from "react";
import { createBrowserRouter } from "react-router-dom";

import {
    Home,
    Error,
    About,
    Cart,
    ChatPage,
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
    DishDetail,
    Admin,
    OrderSuccess,
} from "@pages/index";
import Orders from "@pages/Admin/Orders";
import Employees from "@pages/Admin/Employees";
import Products from "@pages/Admin/Products";
import Reports from "@pages/Admin/Reports";
import Settings from "@pages/Admin/Settings";
import {
    Authentication,
    FormForgotPasswordOTP,
    FormResetPassword,
    FormPassword,
    FormPhoneNumber,
    FormUserName,
    LoginStatus,
    RoleGuard,
} from "@components/index";
import DefaultLayout from "@layouts/DefaultLayout";
import AdminLayout from "@layouts/AdminLayout";
import FormForgetPasswordInfo from "@components/FormForgotPassword/FormForgotPasswordInfo/FormForgotPasswordInfo";
import FormLoginOTP from "@components/FormLogin/FormLoginOTP/FormLoginOTP";

const publicRoutes = [
    {
        path: "/",
        element: <DefaultLayout />,
        errorElement: <Error />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: "about",
                element: <About />,
            },
            {
                path: "search",
                element: <Search />,
            },
            {
                path: "menu",
                element: <Menu />,
            },
            {
                path: "contact",
                element: <Contact />,
            },
            {
                path: "offers",
                element: <Offers />,
            },
            {
                path: "dish/:id",
                element: <DishDetail />,
            },
        ],
    },

    {
        path: "/login",
        element: <Login />,
        children: [
            {
                index: true,
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
                index: true,
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
                path: "/checkout/success",
                element: <OrderSuccess />,
            },
            {
                path: "/profile",
                element: <Profile />,
            },
            {
                path: "/order",
                element: <Order />,
            },
        ],
    },
];

const adminRoutes = [
    {
        path: "/admin",
        element: (
            // <RoleGuard allowedRoles={["Admin"]}>
                <AdminLayout />
            // </RoleGuard>
        ),
        children: [
            {
                index: true,
                element: <Admin />,
            },
            {
                path: "chat",
                element: <ChatPage />,
            },
            {
                path: "chat/:conversationId",
                element: <ChatPage />,
            },
            {
                path: "employees",
                element: <Employees />,
            },
            {
                path: "products",
                element: <Products />,
            },
            {
                path: "reports",
                element: <Reports />,
            },
            {
                path: "settings",
                element: <Settings />,
            },
            {
                path: "orders",
                element: <Orders />,
            },
        ],
    },
];

const router = createBrowserRouter([...publicRoutes, ...privateRoutes, ...adminRoutes]);

export default router;
