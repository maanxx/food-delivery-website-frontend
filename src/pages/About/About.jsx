import React from "react";
import classNames from "classnames/bind";
import { Container, Grid, Card, CardContent, Typography, Box, Avatar } from "@mui/material";

import styles from "./About.module.css";

const cx = classNames.bind(styles);

function About() {
    const stats = [
        { number: "50,000+", label: "Khách hàng hài lòng" },
        { number: "100+", label: "Nhà hàng đối tác" },
        { number: "30+", label: "Thành phố phục vụ" },
        { number: "98%", label: "Đánh giá tích cực" },
    ];

    const values = [
        {
            icon: "🎯",
            title: "Sứ Mệnh",
            description:
                "Mang đến trải nghiệm giao đồ ăn nhanh chóng, tiện lợi và chất lượng cao nhất cho mọi gia đình Việt Nam.",
        },
        {
            icon: "👁️",
            title: "Tầm Nhìn",
            description:
                "Trở thành nền tảng giao đồ ăn hàng đầu Việt Nam, kết nối mọi người với những món ăn yêu thích.",
        },
        {
            icon: "⭐",
            title: "Giá Trị",
            description:
                "Chất lượng - Tốc độ - Tận tâm. Chúng tôi cam kết mang đến dịch vụ xuất sắc trong từng đơn hàng.",
        },
    ];

    const team = [
        {
            name: "Đặng Phúc Nguyên",
            position: "Giám đốc điều hành",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            description: "10+ năm kinh nghiệm trong ngành F&B và công nghệ",
        },
        {
            name: "Thân Hoàng Thiên Thiên",
            position: "Trưởng phòng Marketing",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            description: "Chuyên gia marketing với nhiều chiến dịch thành công",
        },
        {
            name: "Nguyễn Phan Minh Mẫn",
            position: "Trưởng phòng Kỹ thuật",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            description: "Kỹ sư phần mềm với hơn 8 năm kinh nghiệm",
        },
    ];

    const milestones = [
        { year: "2020", event: "Thành lập công ty với 5 nhà hàng đối tác" },
        { year: "2021", event: "Mở rộng ra 10 thành phố lớn" },
        { year: "2022", event: "Đạt 10,000 đơn hàng/tháng" },
        { year: "2023", event: "Ra mắt ứng dụng mobile" },
        { year: "2024", event: "Hợp tác với 100+ nhà hàng" },
        { year: "2025", event: "Phục vụ 50,000+ khách hàng" },
        { year: "2026", event: "Mở rộng toàn quốc" },
    ];

    return (
        <div className={cx("about")}>
            {/* Hero Section */}
            <div className={cx("hero-section")}>
                <Container maxWidth="lg">
                    <div className={cx("hero-content")}>
                        <h1>Về Chúng Tôi</h1>
                        <p>
                            Chúng tôi là đội ngũ đam mê công nghệ và ẩm thực, mang đến cho bạn trải nghiệm giao đồ ăn
                            tuyệt vời nhất
                        </p>
                    </div>
                </Container>
            </div>

            <Container maxWidth="lg">
                {/* Stats Section */}
                <div className={cx("stats-section")}>
                    <Grid container spacing={3}>
                        {stats.map((stat, index) => (
                            <Grid item xs={6} md={3} key={index}>
                                <Card className={cx("stat-card")}>
                                    <CardContent className={cx("stat-content")}>
                                        <Typography variant="h3" className={cx("stat-number")}>
                                            {stat.number}
                                        </Typography>
                                        <Typography variant="body1" className={cx("stat-label")}>
                                            {stat.label}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </div>

                {/* Story Section */}
                <div className={cx("story-section")}>
                    <div className={cx("section-header")}>
                        <h2>Câu Chuyện Của Chúng Tôi</h2>
                    </div>

                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <div className={cx("story-content")}>
                                <p>
                                    Bắt đầu từ năm 2020 với một ý tưởng đơn giản: làm sao để mọi người có thể thưởng
                                    thức những món ăn ngon một cách dễ dàng và nhanh chóng nhất.
                                </p>
                                <p>
                                    Chúng tôi đã xây dựng một nền tảng công nghệ hiện đại, kết nối khách hàng với hàng
                                    trăm nhà hàng uy tín. Từ những ngày đầu khó khăn với chỉ 5 nhà hàng đối tác, đến nay
                                    chúng tôi đã phục vụ hơn 50,000 khách hàng trên khắp cả nước.
                                </p>
                                <p>
                                    Không chỉ dừng lại ở việc giao đồ ăn, chúng tôi luôn nỗ lực mang đến trải nghiệm mua
                                    sắm trọn vẹn, từ giao diện thân thiện, đến dịch vụ khách hàng tận tâm.
                                </p>
                            </div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <div className={cx("story-image")}>
                                <img
                                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
                                    alt="Câu chuyện của chúng tôi"
                                />
                            </div>
                        </Grid>
                    </Grid>
                </div>

                {/* Values Section */}
                <div className={cx("values-section")}>
                    <div className={cx("section-header")}>
                        <h2>Tại Sao Chọn Chúng Tôi</h2>
                        <p>Những giá trị cốt lõi định hướng mọi hoạt động của chúng tôi</p>
                    </div>

                    <Grid container spacing={4}>
                        {values.map((value, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <Card className={cx("value-card")}>
                                    <CardContent className={cx("value-content")}>
                                        <div className={cx("value-icon")}>{value.icon}</div>
                                        <Typography variant="h5" className={cx("value-title")}>
                                            {value.title}
                                        </Typography>
                                        <Typography variant="body1" className={cx("value-description")}>
                                            {value.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </div>

                {/* Team Section */}
                <div className={cx("team-section")}>
                    <div className={cx("section-header")}>
                        <h2>Đội Ngũ Lãnh Đạo</h2>
                        <p>Những con người tài năng đang dẫn dắt công ty phát triển</p>
                    </div>

                    <Grid container spacing={3}>
                        {team.map((member, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card className={cx("team-card")}>
                                    <CardContent className={cx("team-content")}>
                                        <Avatar src={member.image} alt={member.name} className={cx("team-avatar")} />
                                        <Typography variant="h6" className={cx("team-name")}>
                                            {member.name}
                                        </Typography>
                                        <Typography variant="subtitle1" className={cx("team-position")}>
                                            {member.position}
                                        </Typography>
                                        <Typography variant="body2" className={cx("team-description")}>
                                            {member.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </div>

                {/* Timeline Section */}
                <div className={cx("timeline-section")}>
                    <div className={cx("section-header")}>
                        <h2>Hành Trình Phát Triển</h2>
                        <p>Những cột mốc quan trọng trong quá trình xây dựng công ty</p>
                    </div>

                    <div className={cx("timeline")}>
                        {milestones.map((milestone, index) => (
                            <div
                                key={index}
                                className={cx("timeline-item", {
                                    "timeline-left": index % 2 === 0,
                                    "timeline-right": index % 2 === 1,
                                })}
                            >
                                <div className={cx("timeline-content")}>
                                    <div className={cx("timeline-year")}>{milestone.year}</div>
                                    <div className={cx("timeline-event")}>{milestone.event}</div>
                                </div>
                                <div className={cx("timeline-dot")}></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Section */}
                <div className={cx("contact-section")}>
                    <Card className={cx("contact-card")}>
                        <CardContent>
                            <div className={cx("contact-content")}>
                                <Typography variant="h4" className={cx("contact-title")}>
                                    Liên Hệ Với Chúng Tôi
                                </Typography>
                                <Typography variant="body1" className={cx("contact-subtitle")}>
                                    Hãy kết nối với chúng tôi để cùng tạo nên những trải nghiệm ẩm thực tuyệt vời
                                </Typography>

                                <Grid container spacing={4} className={cx("contact-info")}>
                                    <Grid item xs={12} md={4}>
                                        <div className={cx("contact-item")}>
                                            <div className={cx("contact-icon")}>📍</div>
                                            <div>
                                                <strong>Địa chỉ</strong>
                                                <p>
                                                    Số 12 Nguyễn Văn Bảo, P. Hạnh Thông
                                                    <br />
                                                    TP. Hồ Chí Minh
                                                </p>
                                            </div>
                                        </div>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <div className={cx("contact-item")}>
                                            <div className={cx("contact-icon")}>📞</div>
                                            <div>
                                                <strong>Hotline</strong>
                                                <p>
                                                    1900 1234
                                                    <br />
                                                    support@fooddelivery.vn
                                                </p>
                                            </div>
                                        </div>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <div className={cx("contact-item")}>
                                            <div className={cx("contact-icon")}>⏰</div>
                                            <div>
                                                <strong>Giờ làm việc</strong>
                                                <p>
                                                    24/7
                                                    <br />
                                                    Phục vụ tất cả các ngày
                                                </p>
                                            </div>
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </div>
    );
}

export default About;
