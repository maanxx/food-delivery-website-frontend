import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Container } from "@mui/material";

import styles from "./Home.module.css";
import { BestSeller } from "@components/index";
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);

function Home() {
    const [isAppear, setIsAppear] = useState(false);

    const lazyLoading = (e) => {
        if (e.currentTarget.scrollY >= 300) {
            setIsAppear(true);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", lazyLoading);
        return () => {
            window.removeEventListener("scroll", lazyLoading);
        };
    }, []);

    return (
        <div className={cx("home")}>
            <div
                className={cx("banner")}
                style={{
                    backgroundImage: `url(${require("@images/banner/home_bg.png")})`,
                    backgroundSize: "cover",
                }}
            >
                <Container maxWidth="lg">
                    <h1>
                        Giao Món Ăn <br />
                        <span>Nhanh Nhất</span> Đến Tay Bạn
                    </h1>
                    <h6>Trải nghiệm đặt món dễ dàng, nhanh chóng và tiện lợi – chỉ vài cú nhấp chuột!</h6>
                    <Link to={"/menu"} className={cx("order-btn")}>Đặt Ngay</Link>
                </Container>
            </div>

            <Container maxWidth="lg">
                <div className={cx("serve")}>
                    <div className={cx("title")}>
                        <h3>Quy Trình Phục Vụ Của Chúng Tôi</h3>
                    </div>

                    <div className={cx("info")}>
                        <div className={cx("box")}>
                            <div className={cx("icon", { flyin_y_1: isAppear })}>
                                <img src={require("@images/home_icon/order.png")} />
                            </div>
                            <h1 className={cx({ flyin_x_1: isAppear })}>Đặt Món Dễ Dàng</h1>
                            <h5 style={{ maxWidth: 300 }} className={cx({ flyin_x_1: isAppear })}>
                                Đặt món chỉ với vài bước đơn giản qua nền tảng thân thiện của chúng tôi.
                            </h5>
                        </div>

                        <div className={cx("box")}>
                            <div className={cx("icon", { flyin_y_2: isAppear })}>
                                <img src={require("@images/home_icon/delivery.png")} />
                            </div>
                            <h1 className={cx({ flyin_x_2: isAppear })}>Giao Hàng Nhanh Chóng</h1>
                            <h5 style={{ maxWidth: 300 }} className={cx({ flyin_x_2: isAppear })}>
                                Nhận món ăn của bạn trong thời gian ngắn nhất, đúng giờ mọi lúc.
                            </h5>
                        </div>

                        <div className={cx("box")}>
                            <div className={cx("icon", { flyin_y_3: isAppear })}>
                                <img src={require("@images/home_icon/order.png")} />
                            </div>
                            <h1 className={cx({ flyin_x_3: isAppear })}>Chất Lượng Hàng Đầu</h1>
                            <h5 style={{ maxWidth: 300 }} className={cx({ flyin_x_3: isAppear })}>
                                Chúng tôi cam kết mang đến sản phẩm chất lượng nhất cho bạn.
                            </h5>
                        </div>
                    </div>
                </div>
            </Container>

            <BestSeller />

            <div className={cx("menu")}></div>
            <div className={cx("discount")}></div>
        </div>
    );
}

export default Home;
