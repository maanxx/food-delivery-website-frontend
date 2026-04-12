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
    DishDetail,
    Admin,
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

// ✅ PRIVATE ROUTES
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

const adminRoutes = [
    {
        path: "/admin",
        element: (
            <Authentication>
                <AdminLayout />
            </Authentication>
        ),
        children: [
            {
                path: "/admin",
                element: <Admin />,
            },
            {
                path: "/admin/orders",
                element: <Orders />,
            },
            {
                path: "/admin/employees",
                element: <Employees />,
            },
            {
                path: "/admin/products",
                element: <Products />,
            },
            {
                path: "/admin/reports",
                element: <Reports />,
            },
            {
                path: "/admin/settings",
                element: <Settings />,
            },
        ],
    },
];

const router = createBrowserRouter([...publicRoutes, ...privateRoutes, ...adminRoutes]);

export default router;
