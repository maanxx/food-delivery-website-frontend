import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import { DarkMode, Search, Login, ShoppingCart, LightMode } from "@mui/icons-material";
import { Box, Container } from "@mui/material";
import { Avatar } from "antd";

import styles from "./Header.module.css";
import useAuth from "@hooks/useAuth";
import { getFirstLetterOfEachWord } from "@helpers/stringHelper";
import { getUserInfo } from "@helpers/cookieHelper";
import { clearCookie } from "@features/auth/authSlice";

const cx = classNames.bind(styles);

function Header() {
    const [backgroundColor, setBackgroundColor] = useState("var(--backgroundColor)");
    const [activeKey, setActiveKey] = useState("1");
    const [darkMode, setDarkmode] = useState(false);
    const [bannerBackgroundColor, setBannerBackgroundColor] = useState("var(--whiteColor)");
    const { isAuthenticated } = useAuth();
    const [showProfileNav, setShowProfileNav] = useState(false);
    const user = getUserInfo();
    const { logout, clearCookie } = useAuth();

    const handleChangeModeBtnClick = () => {
        setDarkmode((prevMode) => !prevMode);
        if (darkMode) {
            document.body.classList.remove("dark-mode");
            document.body.classList.add("light-mode");
        } else {
            document.body.classList.add("dark-mode");
            document.body.classList.remove("light-mode");
        }
    };

    useEffect(() => {
        // Function to change background color on scroll
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setBackgroundColor("var(--whiteColor)"); // Initial color
                setBannerBackgroundColor("var(--backgroundColor)");
            } else {
                setBackgroundColor("var(--backgroundColor)"); // Change to your desired color when scrolled
                setBannerBackgroundColor("var(--whiteColor)");
            }
        };

        // Add the scroll event listener
        window.addEventListener("scroll", handleScroll);

        // Dark mode
        if (darkMode) {
            document.body.classList.add("dark-mode");
            document.body.classList.remove("light-mode");
        } else {
            document.body.classList.remove("dark-mode");
            document.body.classList.add("light-mode");
        }

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className={cx("background")} style={{ backgroundColor: backgroundColor }}>
            <div style={{ backgroundColor: bannerBackgroundColor }} className={cx("banner")}>
                Giảm giá đến 30% cho mỗi món ăn - Hãy đặt hàng ngay bây giờ
            </div>
            <Container maxWidth="lg">
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "30px 0" }}>
                    <div className={cx("logo")}>
                        <Link to={"/"}>Eatsy</Link>
                    </div>
                    <nav className={cx("nav-bar")}>
                        <ul>
                            <li
                                data-nav-index={"1"}
                                onClick={(e) => setActiveKey(e.currentTarget.getAttribute("data-nav-index"))}
                                className={cx({ active: activeKey === "1" ? true : false })}
                            >
                                <Link to={"/"}>Home</Link>
                            </li>
                            <li
                                data-nav-index={"2"}
                                onClick={(e) => setActiveKey(e.currentTarget.getAttribute("data-nav-index"))}
                                className={cx({ active: activeKey === "2" ? true : false })}
                            >
                                <Link to={"/menu"}>Menu</Link>
                            </li>
                            <li
                                data-nav-index={"3"}
                                onClick={(e) => setActiveKey(e.currentTarget.getAttribute("data-nav-index"))}
                                className={cx({ active: activeKey === "3" ? true : false })}
                            >
                                <Link to={"/offers"}>Offers</Link>
                            </li>
                            <li
                                data-nav-index={"4"}
                                onClick={(e) => setActiveKey(e.currentTarget.getAttribute("data-nav-index"))}
                                className={cx({ active: activeKey === "4" ? true : false })}
                            >
                                <Link to={"/about"}>About</Link>
                            </li>
                            <li
                                data-nav-index={"5"}
                                onClick={(e) => setActiveKey(e.currentTarget.getAttribute("data-nav-index"))}
                                className={cx({ active: activeKey === "5" ? true : false })}
                            >
                                <Link to={"/contact"}>Contact</Link>
                            </li>
                        </ul>
                    </nav>
                    <div className={cx("buttons-group")}>
                        <button className={cx("search-btn")}>
                            <Link to={"/search"}>
                                <Search />
                            </Link>
                        </button>
                        <button className={cx("cart-btn")}>
                            <Link to={"/cart"}>
                                <ShoppingCart />
                                <span className={cx("cart-badge")}>0</span>
                            </Link>
                        </button>
                        {isAuthenticated ? (
                            <div style={{ position: "relative" }}>
                                <button
                                    onMouseEnter={() => setShowProfileNav(true)}
                                    onMouseLeave={() => setShowProfileNav(false)}
                                    className={cx("profile-btn")}
                                >
                                    <Avatar src={user?.avatar_path || null} size={40}>
                                        {getFirstLetterOfEachWord(user?.fullname || user?.username || "").children}
                                    </Avatar>
                                </button>
                                {showProfileNav && (
                                    <div
                                        className={cx("profile-nav-container")}
                                        onMouseEnter={() => setShowProfileNav(true)}
                                        onMouseLeave={() => setShowProfileNav(false)}
                                    >
                                        <ul className={cx("profile-nav-list")}>
                                            <li className={cx("profile-nav-item")}>
                                                <Link to={"/profile"}>Thông tin tài khoản</Link>
                                            </li>
                                            <li
                                                onClick={() => {
                                                    logout();
                                                    clearCookie();
                                                    window.location.reload();
                                                }}
                                                className={cx("profile-nav-item")}
                                            >
                                                <Link to={"/"}>Đăng xuất</Link>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button className={cx("login-btn")}>
                                <Link to={"/login"}>
                                    <Login /> <span>Login</span>
                                </Link>
                            </button>
                        )}
                        <button className={cx("change-mode-btn")} onClick={handleChangeModeBtnClick}>
                            {darkMode ? <LightMode /> : <DarkMode />}
                        </button>
                    </div>
                </Box>
            </Container>
        </div>
    );
}

export default Header;
