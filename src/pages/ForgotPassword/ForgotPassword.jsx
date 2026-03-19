import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { ArrowBack, CopyrightRounded } from "@mui/icons-material";
import { Container } from "@mui/material";

import styles from "./ForgotPassword.module.css";
import axiosInstance from "@config/axiosInstance";
import useAuth from "@hooks/useAuth";
import { getCookie } from "@helpers/cookieHelper";
import { Divider } from "antd";
import { regexEmail, regexVietnamPhoneNumber } from "@constants/constants";
import useLoading from "@hooks/useLoading";

const cx = classNames.bind(styles);

function ForgotPassword() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [info, setInfo] = useState();

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
                        <span>
                            <Divider
                                style={{
                                    borderColor: "var(--blackColor)",
                                    borderWidth: "3px",
                                    height: "40px",
                                    marginLeft: "12px",
                                }}
                                type="vertical"
                            />
                            <span style={{ fontSize: "var(--fontSizeLarge)" }}>Đặt lại mật khẩu</span>
                        </span>
                    </div>
                </Container>
            </header>
            <div className={cx("content")}>
                <Container maxWidth="sm">
                    <Outlet context={{ info, setInfo }} />
                </Container>
            </div>
            <footer>
                <CopyrightRounded /> <span>Bản quyền thuộc về Eatsy {new Date().getFullYear()}.</span>
            </footer>
        </>
    );
}

export default ForgotPassword;
