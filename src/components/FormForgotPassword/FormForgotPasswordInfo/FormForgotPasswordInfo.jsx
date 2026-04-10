import { useState } from "react";
import classNames from "classnames/bind";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

import styles from "@pages/ForgotPassword/ForgotPassword.module.css";
import useLoading from "@hooks/useLoading";
import { regexEmail, regexVietnamPhoneNumber } from "@constants/constants";
import axiosInstance from "@config/axiosInstance";

const cx = classNames.bind(styles);

function FormForgetPasswordInfo() {
    const [isValid, setIsValid] = useState(false);
    const [alertMessage, setAlertMessage] = useState();
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const { info, setInfo } = useOutletContext();

    const validateInput = (e) => {
        if (e.currentTarget.value.length <= 0) {
            setAlertMessage("Không được bỏ trống thông tin.");
            e.currentTarget.parentElement.classList.add(styles.invalid);
            setIsValid(false);
            return;
        }

        const inputValue = e.currentTarget.value.trim();

        if (/^\D/.test(inputValue) && !regexEmail.test(inputValue)) {
            setAlertMessage("Email không hợp lệ.");
            e.currentTarget.parentElement.classList.add(styles.invalid);
            setIsValid(false);
            return;
        }

        if (/^\d/.test(inputValue) && !regexVietnamPhoneNumber.test(inputValue)) {
            setAlertMessage("Số điện thoại không hợp lệ.");
            e.currentTarget.parentElement.classList.add(styles.invalid);
            setIsValid(false);
            return;
        }

        setAlertMessage("");
        e.currentTarget.parentElement.classList.remove(styles.invalid);
        setIsValid(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosInstance({
                url: "/auth/forgot-password/send-otp",
                method: "post",
                data: {
                    countryCode: "+84", // set default country code
                    info: info,
                },
            });

            if (response.data.success) {
                navigate("/forgot-password/verify-otp");
            } else {
                console.log("Failed");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={cx("box")}>
                <div className={cx("box-header")}>
                    <div className={cx("back-button")}>
                        <Link to={"/login"} style={{ color: "var(--primaryColor)" }}>
                            <ArrowBack />
                        </Link>
                    </div>
                    <span style={{ fontWeight: "bold", fontSize: "var(--fontSizeLarge)" }}>Đặt lại mật khẩu</span>
                </div>
                <div className={cx("phone-input-wrapper")}>
                    <input
                        className={cx("phone-input")}
                        type="text"
                        name="phone"
                        onInput={validateInput}
                        onChange={(e) => setInfo(e.currentTarget.value)}
                        placeholder="Email/Số điện thoại"
                        // autoComplete={"off"}
                    />
                    <div className={cx("phone-input-alert")}>{alertMessage}</div>
                </div>
                <button type="submit" className={cx("submit-btn", { disabled: !isValid })} disabled={!isValid}>
                    Tiếp tục
                </button>
            </div>
        </form>
    );
}

export default FormForgetPasswordInfo;
