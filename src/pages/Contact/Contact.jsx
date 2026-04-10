import React, { useState } from "react";
import classNames from "classnames/bind";
import { 
    Container, 
    Grid, 
    Card, 
    CardContent, 
    Typography, 
    TextField, 
    Button, 
    Box,
    Divider,
    Chip
} from "@mui/material";
import { 
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    AccessTime as TimeIcon,
    Send as SendIcon,
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    Twitter as TwitterIcon
} from "@mui/icons-material";
import { toast } from "react-toastify";

import styles from "./Contact.module.css";

const cx = classNames.bind(styles);

function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const contactInfo = [
        {
            icon: <LocationIcon />,
            title: "Địa Chỉ",
            lines: ["Số 12 Nguyễn Văn Bảo, P. Hạnh Thông", "Gò Vấp, TP. Hồ Chí Minh", "Việt Nam"],
            color: "#ff6b35"
        },
        {
            icon: <PhoneIcon />,
            title: "Số Điện Thoại",
            lines: ["Hotline: 1900 1234", "Di động: +84 123 456 789", "Fax: +84 28 1234 5678"],
            color: "#4CAF50"
        },
        {
            icon: <EmailIcon />,
            title: "Email",
            lines: ["support@fooddelivery.vn", "info@fooddelivery.vn", "marketing@fooddelivery.vn"],
            color: "#2196F3"
        },
        {
            icon: <TimeIcon />,
            title: "Giờ Làm Việc",
            lines: ["Thứ 2 - Thứ 6: 8:00 - 22:00", "Thứ 7 - Chủ Nhật: 9:00 - 23:00", "Hotline 24/7"],
            color: "#9C27B0"
        }
    ];

    const faqs = [
        {
            question: "Làm thế nào để đặt món ăn?",
            answer: "Bạn có thể đặt món thông qua website hoặc ứng dụng di động của chúng tôi. Chọn món ăn yêu thích, thêm vào giỏ hàng và thanh toán."
        },
        {
            question: "Thời gian giao hàng là bao lâu?",
            answer: "Thời gian giao hàng trung bình là 20-45 phút tùy thuộc vào khoảng cách và số lượng đơn hàng tại thời điểm đặt."
        },
        {
            question: "Có những phương thức thanh toán nào?",
            answer: "Chúng tôi hỗ trợ thanh toán tiền mặt khi nhận hàng, chuyển khoản ngân hàng, thẻ tín dụng và ví điện tử."
        },
        {
            question: "Có phí giao hàng không?",
            answer: "Phí giao hàng từ 15,000đ - 25,000đ tùy theo khoảng cách. Miễn phí giao hàng cho đơn từ 200,000đ."
        },
        {
            question: "Làm sao để hủy đơn hàng?",
            answer: "Bạn có thể hủy đơn hàng trong vòng 5 phút sau khi đặt. Sau thời gian này, vui lòng liên hệ hotline để được hỗ trợ."
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate form
        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            setIsSubmitting(false);
            return;
        }

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            toast.success("Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi trong vòng 24h.");
            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: ""
            });
        } catch (error) {
            toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={cx("contact")}>
            {/* Hero Section */}
            <div className={cx("hero-section")}>
                <Container maxWidth="lg">
                    <div className={cx("hero-content")}>
                        <h1>Liên Hệ Với Chúng Tôi</h1>
                        <p>
                            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. 
                            Hãy để lại tin nhắn và chúng tôi sẽ phản hồi sớm nhất có thể.
                        </p>
                    </div>
                </Container>
            </div>

            <Container maxWidth="lg">
                {/* Contact Info Cards */}
                <div className={cx("contact-info-section")}>
                    <Grid container spacing={3}>
                        {contactInfo.map((info, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card className={cx("info-card")}>
                                    <CardContent className={cx("info-content")}>
                                        <div 
                                            className={cx("info-icon")}
                                            style={{ backgroundColor: info.color }}
                                        >
                                            {info.icon}
                                        </div>
                                        <Typography variant="h6" className={cx("info-title")}>
                                            {info.title}
                                        </Typography>
                                        <div className={cx("info-details")}>
                                            {info.lines.map((line, lineIndex) => (
                                                <Typography 
                                                    key={lineIndex} 
                                                    variant="body2" 
                                                    className={cx("info-line")}
                                                >
                                                    {line}
                                                </Typography>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </div>

                {/* Main Contact Section */}
                <div className={cx("main-contact-section")}>
                    <Grid container spacing={4}>
                        {/* Contact Form */}
                        <Grid item xs={12} md={8}>
                            <Card className={cx("contact-form-card")}>
                                <CardContent className={cx("form-content")}>
                                    <Typography variant="h4" className={cx("form-title")}>
                                        Gửi Tin Nhắn
                                    </Typography>
                                    <Typography variant="body1" className={cx("form-subtitle")}>
                                        Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại với bạn
                                    </Typography>

                                    <form onSubmit={handleSubmit} className={cx("contact-form")}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Họ và Tên"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Số Điện Thoại *"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Chủ Đề"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleInputChange}
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Tin Nhắn"
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleInputChange}
                                                    required
                                                    multiline
                                                    rows={4}
                                                    variant="outlined"
                                                    placeholder="Nhập tin nhắn của bạn..."
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    size="large"
                                                    disabled={isSubmitting}
                                                    startIcon={<SendIcon />}
                                                    className={cx("submit-btn")}
                                                >
                                                    {isSubmitting ? "Đang Gửi..." : "Gửi Tin Nhắn"}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </form>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Map & Social */}
                        <Grid item xs={12} md={4}>
                            {/* Map */}
                            <Card className={cx("map-card")}>
                                <CardContent className={cx("map-content")}>
                                    <Typography variant="h5" className={cx("map-title")}>
                                        Vị Trí Của Chúng Tôi
                                    </Typography>
                                    <div className={cx("map-container")}>
                                        <img 
                                            src="https://maps.googleapis.com/maps/api/staticmap?center=Ho+Chi+Minh+City,+Vietnam&zoom=15&size=400x300&maptype=roadmap&markers=color:red%7Clabel:A%7CHo+Chi+Minh+City,+Vietnam&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dO7n2dTsWdSMOM"
                                            alt="Bản đồ vị trí"
                                            className={cx("map-image")}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className={cx("map-placeholder")}>
                                            <LocationIcon className={cx("map-placeholder-icon")} />
                                            <Typography variant="body2">
                                                123 Đường Nguyễn Văn Cừ<br/>
                                                Quận 1, TP.HCM
                                            </Typography>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Social Media */}
                            <Card className={cx("social-card")}>
                                <CardContent className={cx("social-content")}>
                                    <Typography variant="h5" className={cx("social-title")}>
                                        Theo Dõi Chúng Tôi
                                    </Typography>
                                    <Typography variant="body2" className={cx("social-subtitle")}>
                                        Kết nối với chúng tôi trên mạng xã hội
                                    </Typography>
                                    <div className={cx("social-links")}>
                                        <Button 
                                            className={cx("social-btn", "facebook")}
                                            startIcon={<FacebookIcon />}
                                        >
                                            Facebook
                                        </Button>
                                        <Button 
                                            className={cx("social-btn", "instagram")}
                                            startIcon={<InstagramIcon />}
                                        >
                                            Instagram
                                        </Button>
                                        <Button 
                                            className={cx("social-btn", "twitter")}
                                            startIcon={<TwitterIcon />}
                                        >
                                            Twitter
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </div>

                {/* FAQ Section */}
                <div className={cx("faq-section")}>
                    <div className={cx("section-header")}>
                        <Typography variant="h3" className={cx("section-title")}>
                            Câu Hỏi Thường Gặp
                        </Typography>
                        <Typography variant="body1" className={cx("section-subtitle")}>
                            Tìm hiểu những thông tin hữu ích về dịch vụ của chúng tôi
                        </Typography>
                    </div>

                    <Grid container spacing={3}>
                        {faqs.map((faq, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Card className={cx("faq-card")}>
                                    <CardContent className={cx("faq-content")}>
                                        <Typography variant="h6" className={cx("faq-question")}>
                                            {faq.question}
                                        </Typography>
                                        <Divider className={cx("faq-divider")} />
                                        <Typography variant="body2" className={cx("faq-answer")}>
                                            {faq.answer}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </div>

                {/* Call to Action */}
                <div className={cx("cta-section")}>
                    <Card className={cx("cta-card")}>
                        <CardContent className={cx("cta-content")}>
                            <Typography variant="h4" className={cx("cta-title")}>
                                Cần Hỗ Trợ Khẩn Cấp?
                            </Typography>
                            <Typography variant="body1" className={cx("cta-description")}>
                                Liên hệ ngay hotline 24/7 của chúng tôi để được hỗ trợ nhanh chóng
                            </Typography>
                            <div className={cx("cta-actions")}>
                                <Chip 
                                    label="📞 1900 1234"
                                    className={cx("hotline-chip")}
                                    clickable
                                />
                                <Chip 
                                    label="💬 Live Chat"
                                    className={cx("chat-chip")}
                                    clickable
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </div>
    );
}

export default Contact;