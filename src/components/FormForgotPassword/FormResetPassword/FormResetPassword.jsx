import React, { memo, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box } from "@mui/material";
import { Link, useNavigate, useOutletContext } from "react-router-dom";

import styles from "@pages/ForgotPassword/ForgotPassword.module.css";
import { hasLowercase, hasNumber, hasUppercase } from "@helpers/stringHelper";
import useLoading from "@hooks/useLoading";
import useAuth from "@hooks/useAuth";
import axiosInstance from "@config/axiosInstance";

const cx = classNames.bind(styles);

function FormResetPassword() {
    const navigate = useNavigate();
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isValidPassword, setIsValidPassword] = useState(false);
    const [passwordAlertMessage, setNewPasswordAlertMessage] = useState("");
    const [newPassword, setNewPassword] = useState();
    const { setLoading } = useLoading();
    const formRef = useRef();
    const { logout } = useAuth();
    const { info } = useOutletContext();

    useEffect(() => {
        if (!info) {
            navigate("/login");
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
            const res = await axiosInstance({
                url: `/auth/forgot-password/reset-password`,
                method: "post",
                data: {
                    newPassword,
                    info,
                },
            });

            if (res.data.success) {
                logout();
                setIsValidPassword(true);
                navigate("/login");
                window.location.reload();
            } else {
                setIsValidPassword(false);
                setNewPasswordAlertMessage("Mật khẩu chưa đúng.");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const password = e.currentTarget.value;
        setNewPassword(password);
        setNewPasswordAlertMessage("");

        if (password.length === 0) {
            setIsValidPassword(false);
        } else if (password.length < 8) {
            setIsValidPassword(false);
        } else if (!hasNumber(password)) {
            setIsValidPassword(false);
        } else if (!hasUppercase(password)) {
            setIsValidPassword(false);
        } else if (!hasLowercase(password)) {
            setIsValidPassword(false);
        } else {
            setIsValidPassword(true);
            e.currentTarget.parentElement.classList.remove(styles.invalid);
        }
    };

    const handleBlur = (e) => {
        const password = e.currentTarget.value;

        if (password.length === 0) {
            setIsValidPassword(false);
        } else if (password.length < 8) {
            setNewPasswordAlertMessage("Mật khẩu phải từ 8 ký tự trở lên.");
            e.currentTarget.parentElement.classList.add(styles.invalid);
        } else if (!hasNumber(password)) {
            setNewPasswordAlertMessage("Mật khẩu phải có ít nhất 1 chữ số.");
            e.currentTarget.parentElement.classList.add(styles.invalid);
        } else if (!hasUppercase(password)) {
            setNewPasswordAlertMessage("Mật khẩu phải có ít nhất 1 ký tự in hoa.");
            e.currentTarget.parentElement.classList.add(styles.invalid);
        } else if (!hasLowercase(password)) {
            setNewPasswordAlertMessage("Mật khẩu phải có ít nhất 1 ký tự in thường.");
            e.currentTarget.parentElement.classList.add(styles.invalid);
        } else {
            setNewPasswordAlertMessage("");
            e.currentTarget.parentElement.classList.remove(styles.invalid);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "column",
                gap: 2,
                marginTop: "100px",
            }}
        >
            <form ref={formRef} onSubmit={handleSubmit}>
                <div className={cx("title")} style={{ marginBottom: "10px" }}>
                    <h1>{"Tạo mật khẩu mới"}</h1>
                    <h4>{"Mật khẩu phải gồm tối thiểu 8 ký tự, 1 chữ số, 1 ký tự in hoa, và 1 ký tự thường."}</h4>
                </div>

                <div className={cx("password-input-wrapper")} style={{ marginTop: "0px", marginBottom: "30px" }}>
                    <input
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="password"
                        className={cx("password-input")}
                        placeholder={"Mật khẩu mới của bạn"}
                        type={isShowPassword ? "text" : "password"}
                    />
                    <button
                        onClick={() => setIsShowPassword((prevStatus) => !prevStatus)}
                        type="button"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            transition: "all linear",
                        }}
                        className={cx("show-password-btn")}
                    >
                        {isShowPassword ? (
                            <VisibilityOff className={cx("icon")} />
                        ) : (
                            <Visibility className={cx("icon")} />
                        )}
                    </button>

                    <div className={cx("password-alert")}>{passwordAlertMessage}</div>
                </div>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isValidPassword}
                    className={cx("submit-btn", { disabled: !isValidPassword })}
                >
                    {"Đặt lại mật khẩu"}
                </button>
            </form>
        </Box>
    );
}

FormResetPassword.propTypes = {
    setCurrentComponent: PropTypes.func,
    setFormData: PropTypes.func,
    formData: PropTypes.object,
};

export default memo(FormResetPassword);
