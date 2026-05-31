import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { CopyrightRounded } from "@mui/icons-material";
import { Container } from "@mui/material";

import styles from "./Login.module.css";
import { useSelector } from "react-redux";
import useAuth from "@hooks/useAuth";
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
                login(e.data);
                navigate("/");
            } else {
                logout();
            }
        });

        return () => {
            loginChannel.close();
        };
    }, [login, logout, navigate]);

    const { isInitialized, isLoading } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isInitialized && !isLoading && isAuthenticated) {
            navigate("/");
        }
    }, [isInitialized, isLoading, isAuthenticated, navigate]);

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
