import React, { useState, useEffect, memo, useRef } from "react";
import classNames from "classnames/bind";
import { ExpandMore } from "@mui/icons-material";
import { Checkbox, Divider } from "@mui/material";
import PropTypes from "prop-types";
import { screen } from '@testing-library/react';

import styles from "@pages/Login/Login.module.css";
import countryService from "@services/countryService";
import useLoading from "@hooks/useLoading";
import { regexNumbers, regexVietnamPhoneNumber } from "@constants/constants";
import { FormOTP } from "@components/index";
import axiosInstance from "@config/axiosInstance";
import { Link, useNavigate, useOutletContext } from "react-router-dom";

const cx = classNames.bind(styles);

function FormPhoneNumber() {
    const { setFormData, formData } = useOutletContext();
    const [countries, setCountries] = useState([]);
    const [currentCountry, setCurrentCountry] = useState({
        name: "Việt Nam",
        flags: {
            png: "https://flagcdn.com/w320/vn.png",
        },
        idd: {
            root: "+8",
            suffixes: "4",
        },
        caa3: "VNM",
    });
    const [isValidPhoneNumber, setIsValidPhoneNumber] = useState(false);
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const [alertMessage, setAlertMessage] = useState();
    const [phoneNumberValue, setPhoneNumberValue] = useState();
    const formRef = useRef();
    const serverBaseUrl = process.env.REACT_APP_SERVER_BASE_URL;
    const clientBaseUrl = process.env.REACT_APP_CLIENT_BASE_URL;
    const { setLoading } = useLoading();
    const navigate = useNavigate();

    const handleCountryChange = (e) => {
        countries.forEach((country) => {
            if (country.cca3 === e.currentTarget.getAttribute("data-option-value")) {
                setCurrentCountry(country);
            }
        });
    };

    const handleOnlyInputNumber = (e) => {
        e.currentTarget.value = e.currentTarget.value.replace(regexNumbers, "");
    };

    const handleValidatePhoneInput = (e) => {
        handleOnlyInputNumber(e);
        setPhoneNumberValue(e.currentTarget.value);

        if (e.currentTarget.value.length <= 0) {
            setAlertMessage("Số điện thoại không được bỏ trống.");
            e.currentTarget.parentElement.classList.add(styles.invalid);
            setIsValidPhoneNumber(false);
        } else if (!regexVietnamPhoneNumber.test(e.currentTarget.value)) {
            setAlertMessage("Số điện thoại không hợp lệ.");
            e.currentTarget.parentElement.classList.add(styles.invalid);
            setIsValidPhoneNumber(false);
        } else {
            setAlertMessage("");
            e.currentTarget.parentElement.classList.remove(styles.invalid);
            setIsValidPhoneNumber(true);
        }
    };

    const handleMemorizedLoginChange = () => {
        setFormData((prevData) => ({ ...prevData, memorizedLogin: !formData.memorizedLogin }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const data = {
            country: {
                countryName: event.target?.countryName?.value || "",
                countryCaa3: event.target?.countryCaa3?.value || "",
                countryCode: event.target?.countryCode?.value || "",
            },
            phone: event.target?.phone.value || "",
            memorizedLogin: event.target?.memorizedLogin.checked || false,
        };

        setFormData(data);

        setLoading(true);

        try {
            const res = await axiosInstance({
                url: "/auth/send-otp",
                method: "post",
                data: data,
            });

            if (res.data.success) {
                navigate("/login/verify-otp");
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginWithGoogle = async () => {
        const width = 500;
        const height = 800;
        console.log(screen);

        const left = screen.width / 2 - width / 2;
        const top = screen.height / 2 - height / 2;

        // Open google login popup
        const popup = window.open(
            `${serverBaseUrl}/auth/google`,
            "_blank",
            `width=${width},height=${height},top=${top},left=${left}`,
        );

        if (!popup) {
            console.error("Failed to open pop-up window");
            return;
        }

        try {
            await axiosInstance({
                url: "/auth/google",
                params: {
                    memorizedLogin: formData.memorizedLogin,
                },
                method: "get",
            });
        } catch (error) {
            console.log(error);
        }

        const checkPopup = setInterval(() => {
            if (popup?.closed) {
                clearInterval(checkPopup);
            }
        }, 2000);
    };
    const handleLoginWithFacebook = async () => {
        const width = 500;
        const height = 800;
        const left = screen.width / 2 - width / 2;
        const top = screen.height / 2 - height / 2;

        // Open facebook login popup
        const popup = window.open(
            `${serverBaseUrl}/auth/facebook`,
            "_blank",
            `width=${width},height=${height},top=${top},left=${left}`,
        );

        if (!popup) {
            console.error("Failed to open pop-up window");
            return;
        }

        try {
            await axiosInstance({
                url: "/auth/facebook",
                params: {
                    memorizedLogin: formData.memorizedLogin,
                },
                method: "get",
            });
        } catch (error) {
            console.log(error);
        }

        const checkPopup = setInterval(() => {
            if (popup?.closed) {
                clearInterval(checkPopup);
            }
        }, 2000);
    };

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const data = await countryService.getAll();
                const defaultCountry = data[167];
                setCountries(data);
                setCurrentCountry(defaultCountry); // default country
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCountries();

        return;
    }, [setLoading]);

    return (
        <>
            <form ref={formRef} onSubmit={handleSubmit}>
                <div className={cx("title")}>
                    <h1>Đăng nhập</h1>
                    <h4>Nhập số điện thoại của bạn</h4>
                </div>
                <div className={cx("phone-input-wrapper")}>
                    <div
                        className={cx("country-selection")}
                        aria-describedby={"country-selection"}
                        onClick={() => setIsOpenDropdown((prevState) => !prevState)}
                    >
                        <input
                            className={cx("hidden-input")}
                            name="countryName"
                            defaultValue={currentCountry?.name || ""}
                        />
                        <input
                            className={cx("hidden-input")}
                            name="countryCaa3"
                            defaultValue={currentCountry?.caa3 || ""}
                        />

                        <input
                            className={cx("hidden-input")}
                            name="countryCode"
                            defaultValue={currentCountry?.idd.root + currentCountry?.idd.suffixes || ""}
                        />
                        <div className={cx("select-input-content")}>
                            <div
                                className={cx("flag")}
                                style={{
                                    backgroundImage: `url(${currentCountry?.flags.png})`,
                                }}
                            ></div>
                            <ExpandMore className={cx("more-icon", { active: isOpenDropdown })} />

                            <span className={cx("code")}>
                                {currentCountry?.idd.root + currentCountry?.idd.suffixes || ""}
                            </span>
                        </div>
                        <div
                            id="country-selection"
                            className={cx("dropdown", { open: isOpenDropdown })}
                            name="country-selection"
                        >
                            <div className={cx("dropdown-overlay")}></div>
                            {countries.map((country, index) => (
                                <div
                                    key={index}
                                    className={cx("option")}
                                    data-option-value={country.cca3}
                                    onClick={handleCountryChange}
                                >
                                    <div
                                        className={cx("flag")}
                                        style={{
                                            backgroundImage: `url(${country.flags.png})`,
                                        }}
                                    ></div>
                                    <span className={cx("code")} style={{ marginRight: "var(--spacingSmall)" }}>
                                        {country.idd.root + country.idd.suffixes || ""}
                                    </span>
                                    <span className={cx("name")}>{country.name.common}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <input
                        className={cx("phone-input")}
                        type="text"
                        name="phone"
                        onInput={handleValidatePhoneInput}
                        placeholder="0 1 2 3 4 5 6 7 8 9"
                        // autoComplete={"off"}
                    />
                    <div className={cx("phone-input-alert")}>{alertMessage}</div>
                </div>
                <div className={cx("memorized-login-wrapper")}>
                    <Checkbox
                        name="memorizedLogin"
                        onChange={handleMemorizedLoginChange}
                        size="medium"
                        style={{ color: "var(--primaryColor)" }}
                    />
                    <span className={cx("checkbox-label")}>Ghi nhớ đăng nhập trên thiết bị này.</span>
                </div>
                <button
                    type="submit"
                    className={cx("submit-btn", { disabled: !isValidPhoneNumber })}
                    disabled={!isValidPhoneNumber}
                >
                    Tiếp tục
                </button>
            </form>
            <Divider textAlign="center" style={{ opacity: 0.5, fontSize: "var(--fontSizeSmall)", margin: "30px 0" }}>
                hoặc
            </Divider>
            <div className={cx("social-login-buttons-group")}>
                <button type="button" onClick={handleLoginWithGoogle} className={cx("google-login-btn")}>
                    <div
                        className={cx("logo")}
                        style={{ backgroundImage: `url(${require("@images/logos/google-logo.webp")})` }}
                    ></div>
                    <span>Tiếp tục với Google</span>
                </button>
                <button type="button" onClick={handleLoginWithFacebook} className={cx("facebook-login-btn")}>
                    <div
                        className={cx("logo")}
                        style={{ backgroundImage: `url(${require("@images/logos/facebook-logo.webp")})` }}
                    ></div>
                    <span>Tiếp tục với Facebook</span>
                </button>
                <button type="button" className={cx("apple-login-btn")}>
                    <div
                        className={cx("logo")}
                        style={{ backgroundImage: `url(${require("@images/logos/apple-logo.png")})` }}
                    ></div>
                    <span>Tiếp tục với Apple</span>
                </button>
            </div>
        </>
    );
}

export default memo(FormPhoneNumber);
