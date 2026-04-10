import React, { memo, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { Box } from "@mui/material";

import styles from "@pages/Login/Login.module.css";
import FormPassword from "../FormPassword/FormPassword";
import { useNavigate, useOutletContext } from "react-router-dom";

const cx = classNames.bind(styles);

function FormUserName() {
    const navigate = useNavigate();
    const { setFormData, formData } = useOutletContext();
    const [username, setUsername] = useState("");
    const [isValidName, setIsValidName] = useState(false);
    const [nameAlertMessage, setNameAlertMessage] = useState("");
    const formRef = useRef();

    useEffect(() => {
        if (!formData.phone) {
            navigate("/login");
        }
    }, []);

    const handleChange = (e) => {
        const value = e.currentTarget.value;
        setUsername(value);
        if (value.length === 0) {
            setIsValidName(false);
            setNameAlertMessage("Tên người dùng không được bỏ trống");
        } else {
            setIsValidName(true);
            setNameAlertMessage("");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormData((prevData) => ({ ...prevData, username }));
        navigate("/login/input-password");
    };

    const handleBlur = (e) => {
        const value = e.currentTarget.value;
        if (value.length === 0) {
            setIsValidName(false);
            setNameAlertMessage("Tên người dùng không được bỏ trống");
        } else {
            setIsValidName(true);
            setNameAlertMessage("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.keyCode === 13 && isValidName) {
            navigate("/login/input-password");
            setFormData((prevData) => ({ ...prevData, username }));
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
            <form onSubmit={handleSubmit} ref={formRef}>
                <div className={cx("title")} style={{ marginBottom: "10px" }}>
                    <h1>Tên đăng nhập</h1>
                    <h4>Nhập tên người dùng của bạn</h4>
                </div>
                <div className={cx("name-input-wrapper")} style={{ marginTop: "0px", marginBottom: "30px" }}>
                    <input
                        style={{ width: "350px" }}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        nam="username"
                        className={cx("name-input")}
                        type="text"
                    />
                    <div className={cx("name-input-alert")}>{nameAlertMessage}</div>
                </div>
                <button
                    type="button"
                    className={cx("submit-btn", { disabled: !isValidName })}
                    disabled={!isValidName}
                    onClick={handleSubmit}
                >
                    Tiếp tục
                </button>
            </form>
        </Box>
    );
}

FormUserName.propTypes = {
    setCurrentComponent: PropTypes.func,
    setFormData: PropTypes.func,
    formData: PropTypes.object,
};

export default memo(FormUserName);
