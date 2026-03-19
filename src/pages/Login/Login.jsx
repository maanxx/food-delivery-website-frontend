import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { CopyrightRounded } from "@mui/icons-material";
import { Container } from "@mui/material";

import styles from "./Login.module.css";
import axiosInstance from "@config/axiosInstance";
import useAuth from "@hooks/useAuth";
import { getCookie } from "@helpers/cookieHelper";

const cx = classNames.bind(styles);

function Login() {
    const [formData, setFormData] = useState({ memorizedLogin: false });
    const [isExistUser, setIsExistUser] = useState(true);
    const navigate = useNavigate();
    const { isAuthenticated, login, logout } = useAuth();

    useEffect(() => {
        const loginChannel = new BroadcastChannel("login_channel");

        loginChannel.addEventListener("message", (e) => {
            if (e.data.success) {
                login();
                navigate("/");
                window.close();
            } else {
                navigate("/login");
                logout();
            }
            window.location.reload();
        });

        return () => {
            loginChannel.close();
        };
    }, []);

    useEffect(() => {
        const authenticate = async () => {
            try {
                if (getCookie("token")) {
                    const res = await axiosInstance({
                        url: "/auth",
                        method: "get",
                    });
                    if (res.data.success && isAuthenticated) {
                        navigate("/");
                    } else {
                        navigate("/login");
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };

        authenticate();
    }, []);

    return (
        <>
            <header className={cx("header")}>
                <Container maxWidth="lg">
                    <div className={cx("logo")}>
                        <Link to={"/"}>Eatsy</Link>
                    </div>
                </Container>
            </header>
            <div className={cx("content")}>
                <Container maxWidth="xs">
                    <div className="login-form">
                        <Outlet context={{ setFormData, formData, isExistUser, setIsExistUser }} />
                    </div>
                </Container>
            </div>
            <footer>
                <CopyrightRounded /> <span>Bản quyền thuộc về Eatsy {new Date().getFullYear()}.</span>
            </footer>
        </>
    );
}

export default Login;
