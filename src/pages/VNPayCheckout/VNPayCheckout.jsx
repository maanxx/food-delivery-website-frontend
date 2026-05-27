import React, { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container } from "@mui/material";
import { ArrowBackOutlined, QrCode2Outlined, AccountBalanceOutlined, OpenInNewOutlined } from "@mui/icons-material";
import { message } from "antd";

import styles from "./VNPayCheckout.module.css";
import { createPaymentUrl } from "@services/vnpayService";
import {
    beginRateLimitedAction,
    finishRateLimitedAction,
    RATE_LIMIT_DEFAULTS,
} from "@utils/requestRateLimiter";

const METHOD_META = {
    QR: {
        title: "Thanh toán VNPay - Quét mã QR",
        icon: <QrCode2Outlined color="primary" />,
        description: "Hệ thống sẽ chuyển bạn sang cổng VNPay sandbox để quét mã QR và xác nhận thanh toán.",
        bankCode: "VNPAYQR",
    },
    BANK_TRANSFER: {
        title: "Thanh toán VNPay - Chuyển khoản ngân hàng",
        icon: <AccountBalanceOutlined color="primary" />,
        description: "Hệ thống sẽ chuyển bạn sang cổng VNPay sandbox để chọn ngân hàng và hoàn tất chuyển khoản.",
        bankCode: "",
    },
};

function VNPayCheckout() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);

    const orderId = searchParams.get("orderId");
    const method = searchParams.get("method");
    const amount = Number(searchParams.get("amount") || 0);

    const methodMeta = useMemo(() => METHOD_META[method] || METHOD_META.QR, [method]);

    const canPay = Boolean(orderId) && amount > 0;
    const vnpayRateLimitKey = `vnpay-redirect-${orderId || "unknown"}`;

    const handlePayWithVNPay = useCallback(async () => {
        if (!canPay) {
            message.error("Thiếu thông tin đơn hàng để tạo thanh toán VNPay");
            return;
        }

        const rateLimitAttempt = beginRateLimitedAction(
            vnpayRateLimitKey,
            RATE_LIMIT_DEFAULTS.VNPAY_REDIRECT,
        );

        if (!rateLimitAttempt.allowed) {
            const waitSeconds = Math.ceil(rateLimitAttempt.remainingMs / 1000);
            const warnMessage =
                rateLimitAttempt.reason === "in_flight"
                    ? "Yêu cầu thanh toán đang được xử lý. Vui lòng chờ."
                    : `Vui lòng chờ ${waitSeconds} giây trước khi thử lại.`;

            message.warning(warnMessage);
            return;
        }

        setLoading(true);
        try {
            const response = await createPaymentUrl({
                amount,
                orderDescription: `Thanh toán đơn hàng #${orderId}`,
                orderType: "billpayment",
                language: "vn",
                bankCode: methodMeta.bankCode,
            });

            // Axios on browser usually exposes the final URL after backend 302 redirection.
            const redirectUrl = response?.request?.responseURL;

            if (redirectUrl) {
                window.location.href = redirectUrl;
                return;
            }

            message.warning("Đã tạo yêu cầu thanh toán, nhưng chưa lấy được URL chuyển hướng. Vui lòng thử lại.");
        } catch (error) {
            const fallbackRedirect = error?.request?.responseURL;
            if (fallbackRedirect) {
                window.location.href = fallbackRedirect;
                return;
            }

            const msg = error?.response?.data?.message || "Không thể kết nối VNPay sandbox";
            message.error(msg);
        } finally {
            finishRateLimitedAction(vnpayRateLimitKey, rateLimitAttempt.requestId);
            setLoading(false);
        }
    }, [amount, canPay, methodMeta.bankCode, orderId, vnpayRateLimitKey]);

    return (
        <div className={styles.wrapper}>
            <Container maxWidth="md">
                <div className={styles.card}>
                    <div className={styles.headerRow}>
                        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
                            <ArrowBackOutlined />
                            Quay lại
                        </button>
                        <span className={styles.badge}>VNPay Sandbox</span>
                    </div>

                    <h1 className={styles.title}>{methodMeta.title}</h1>
                    <p className={styles.description}>{methodMeta.description}</p>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span>Mã đơn hàng</span>
                            <strong>#{orderId || "N/A"}</strong>
                        </div>
                        <div className={styles.infoItem}>
                            <span>Tổng thanh toán</span>
                            <strong>{amount.toLocaleString("vi-VN")} ₫</strong>
                        </div>
                        <div className={styles.infoItem}>
                            <span>Phương thức</span>
                            <strong className={styles.methodValue}>
                                {methodMeta.icon}
                                {method === "BANK_TRANSFER" ? "Chuyển khoản ngân hàng" : "Quét mã QR"}
                            </strong>
                        </div>
                    </div>

                    <div className={styles.noteBox}>
                        <h3>Thông tin test sandbox</h3>
                        <p>Số thẻ: 9704198526191432198 | CVV: 123 | OTP: 123456</p>
                    </div>

                    <button
                        type="button"
                        className={styles.payBtn}
                        onClick={handlePayWithVNPay}
                        disabled={loading || !canPay}
                    >
                        <OpenInNewOutlined />
                        {loading ? "Đang chuyển đến VNPay..." : "Tiếp tục thanh toán VNPay"}
                    </button>

                    <button
                        type="button"
                        className={styles.successBtn}
                        onClick={() => navigate(`/checkout/success?orderId=${orderId}`)}
                    >
                        Tôi đã thanh toán xong, xem trạng thái đơn
                    </button>
                </div>
            </Container>
        </div>
    );
}

export default VNPayCheckout;
