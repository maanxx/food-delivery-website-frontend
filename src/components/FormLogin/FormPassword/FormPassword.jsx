import React, { memo, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box } from "@mui/material";
import { Link, useNavigate, useOutletContext } from "react-router-dom";

import styles from "@pages/Login/Login.module.css";
import { hasLowercase, hasNumber, hasUppercase } from "@helpers/stringHelper";
import useLoading from "@hooks/useLoading";
import useAuth from "@hooks/useAuth";
import axiosInstance from "@config/axiosInstance";

const cx = classNames.bind(styles);

function FormPassword() {
    const navigate = useNavigate();
    const { setFormData, formData, isExistUser } = useOutletContext();
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isValidPassword, setIsValidPassword] = useState(false);
    const [passwordAlertMessage, setPasswordAlertMessage] = useState("");
    const [password, setPassword] = useState();
    const { setLoading } = useLoading();
    const formRef = useRef();
    const { login } = useAuth();

    useEffect(() => {
        if (!formData.phone) {
            navigate("/login");
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
            const res = await axiosInstance({
                url: `/auth/${isExistUser ? "login-user" : "register-user"}`,
                method: "post",
                data: {
                    ...formData,
                    password,
                },
            });

            if (res.data.success) {
                login();
                setIsValidPassword(true);
                navigate(res.data.redirect);
                window.location.reload();
            } else {
                setIsValidPassword(false);
                setPasswordAlertMessage("Mật khẩu chưa đúng.");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const password = e.currentTarget.value;
        setPassword(password);
        setPasswordAlertMessage("");

        if (isExistUser) {
            if (password.length === 0) {
                setIsValidPassword(false);
                setPasswordAlertMessage("Mật khẩu không được bỏ trống.");
                e.currentTarget.parentElement.classList.add(styles.invalid);
            } else {
                setPasswordAlertMessage("");
                e.currentTarget.parentElement.classList.remove(styles.invalid);
                setIsValidPassword(true);
            }
        } else {
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
                setFormData((prevData) => ({ ...prevData, password }));
                e.currentTarget.parentElement.classList.remove(styles.invalid);
            }
        }
    };

    const handleBlur = (e) => {
        const password = e.currentTarget.value;

        if (!isExistUser) {
            if (password.length === 0) {
                setIsValidPassword(false);
            } else if (password.length < 8) {
                setPasswordAlertMessage("Mật khẩu phải từ 8 ký tự trở lên.");
                e.currentTarget.parentElement.classList.add(styles.invalid);
            } else if (!hasNumber(password)) {
                setPasswordAlertMessage("Mật khẩu phải có ít nhất 1 chữ số.");
                e.currentTarget.parentElement.classList.add(styles.invalid);
            } else if (!hasUppercase(password)) {
                setPasswordAlertMessage("Mật khẩu phải có ít nhất 1 ký tự in hoa.");
                e.currentTarget.parentElement.classList.add(styles.invalid);
            } else if (!hasLowercase(password)) {
                setPasswordAlertMessage("Mật khẩu phải có ít nhất 1 ký tự in thường.");
                e.currentTarget.parentElement.classList.add(styles.invalid);
            } else {
                setFormData((prevData) => ({ ...prevData, password }));
                setPasswordAlertMessage("");
                e.currentTarget.parentElement.classList.remove(styles.invalid);
            }
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
                    <h1>{isExistUser ? "Nhập mật khẩu" : "Tạo mật khẩu mới"}</h1>
                    <h4>
                        {isExistUser
                            ? ""
                            : "Mật khẩu phải gồm tối thiểu 8 ký tự, 1 chữ số, 1 ký tự in hoa, và 1 ký tự thường."}
                    </h4>
                </div>

                {isExistUser ? (
                    <div style={{ width: "100%", textAlign: "end", marginBottom: "5px" }}>
                        <Link
                            style={{ color: "var(--linkTextColor)", fontSize: "var(--fontSizeSmall)" }}
                            to={"/forgot-password"}
                            className={cx("forgot-password")}
                        >
                            Quên mật khẩu?
                        </Link>
                    </div>
                ) : (
                    ""
                )}

                <div className={cx("password-input-wrapper")} style={{ marginTop: "0px", marginBottom: "30px" }}>
                    <input
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{ width: "350px" }}
                        name="password"
                        className={cx("password-input")}
                        placeholder={"Mật khẩu của bạn"}
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
                    {isExistUser ? "Đăng nhập" : "Tạo tài khoản"}
                </button>
            </form>
        </Box>
    );
}

FormPassword.propTypes = {
    setCurrentComponent: PropTypes.func,
    setFormData: PropTypes.func,
    formData: PropTypes.object,
    isExistUser: PropTypes.bool,
};

export default memo(FormPassword);
