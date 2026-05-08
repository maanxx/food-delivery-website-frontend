/**
 * VNPay Payment Service - Frontend Integration
 * Dùng cho React, React Native, hoặc Expo projects
 */

// ============================================
// 1. PAYMENT SERVICE - API CALLS
// ============================================

export const paymentService = {
    /**
     * Tạo URL thanh toán VNPay
     * @param {Object} paymentData - Dữ liệu thanh toán
     * @param {number} paymentData.amount - Số tiền (VND)
     * @param {string} paymentData.orderDescription - Mô tả đơn hàng
     * @param {string} paymentData.orderType - Loại đơn hàng
     * @param {string} token - JWT token của user
     */
    createPaymentUrl: async (paymentData, token) => {
        try {
            const response = await fetch("http://localhost:5678/api/vnpay/create_payment_url", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(paymentData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Không thể tạo URL thanh toán");
            }

            // API sẽ tự redirect, không cần xử lý response
            return { success: true };
        } catch (error) {
            console.error("Payment Error:", error);
            throw error;
        }
    },
};

// ============================================
// 2. REACT COMPONENT - PAYMENT BUTTON
// ============================================

import React, { useState } from "react";

export const PaymentButton = ({ orderId, totalAmount, userToken, onError }) => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (!userToken) {
            onError("Vui lòng đăng nhập để thanh toán");
            return;
        }

        if (totalAmount <= 0) {
            onError("Số tiền không hợp lệ");
            return;
        }

        setLoading(true);
        try {
            await paymentService.createPaymentUrl(
                {
                    amount: totalAmount,
                    orderDescription: `Thanh toán đơn hàng #${orderId}`,
                    orderType: "billpayment",
                    language: "vn",
                },
                userToken,
            );

            // API sẽ redirect, không cần xử lý thêm
            // Nếu có lỗi, sẽ catch ở phía dưới
        } catch (error) {
            onError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={handlePayment} disabled={loading} className="btn btn-primary">
            {loading ? "Đang xử lý..." : "Thanh Toán VNPay"}
        </button>
    );
};

// ============================================
// 3. REACT NATIVE / EXPO EXAMPLE
// ============================================

import { useNavigation } from "@react-navigation/native";
import { Alert, ActivityIndicator } from "react-native";

export const useVNPayPayment = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    const initiatePayment = async (orderId, amount, token) => {
        if (!token) {
            Alert.alert("Lỗi", "Vui lòng đăng nhập");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:5678/api/vnpay/create_payment_url", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: amount,
                    orderDescription: `Thanh toán đơn hàng #${orderId}`,
                    orderType: "billpayment",
                    language: "vn",
                }),
            });

            if (response.ok) {
                // API sẽ redirect nếu dùng WebView
                Alert.alert("Thành công", "Đang chuyển đến trang thanh toán...");
            } else {
                const error = await response.json();
                Alert.alert("Lỗi", error.message || "Không thể tạo URL thanh toán");
            }
        } catch (error) {
            Alert.alert("Lỗi", error.message);
        } finally {
            setLoading(false);
        }
    };

    return { initiatePayment, loading };
};

// ============================================
// 4. ORDER INTEGRATION EXAMPLE
// ============================================

export const OrderCheckout = ({ order, userToken }) => {
    const [error, setError] = useState(null);

    const handleVNPayPayment = async () => {
        try {
            setError(null);

            // Kiểm tra dữ liệu đơn hàng
            if (!order.id || !order.totalAmount) {
                throw new Error("Đơn hàng không hợp lệ");
            }

            // Gọi API thanh toán
            await paymentService.createPaymentUrl(
                {
                    amount: Math.round(order.totalAmount), // Phải là số nguyên
                    orderDescription: `Đơn hàng #${order.id} - ${order.customerName}`,
                    orderType: "billpayment",
                    language: "vn",
                    bankCode: "", // Để trống để cho phép chọn ngân hàng
                },
                userToken,
            );
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="checkout-container">
            <div className="order-summary">
                <h2>Thông Tin Đơn Hàng</h2>
                <p>Mã đơn: {order.id}</p>
                <p>Tổng tiền: {order.totalAmount.toLocaleString("vi-VN")} VND</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button onClick={handleVNPayPayment} className="btn btn-vnpay">
                💳 Thanh Toán VNPay
            </button>

            <div className="payment-methods">
                <h3>Hình thức thanh toán khác</h3>
                {/* Các phương thức khác */}
            </div>
        </div>
    );
};

// ============================================
// 5. PAYMENT RESULT HANDLER
// ============================================

/**
 * Xử lý kết quả thanh toán từ VNPay
 * (Gọi từ backend callback endpoint)
 */
export const handlePaymentResult = (responseCode) => {
    const resultMap = {
        "00": { success: true, message: "Thanh toán thành công!" },
        "07": { success: false, message: "Trừ tiền thất bại" },
        "09": { success: false, message: "Giao dịch bị từ chối" },
        97: { success: false, message: "Chữ ký không hợp lệ" },
    };

    return (
        resultMap[responseCode] || {
            success: false,
            message: "Lỗi không xác định",
        }
    );
};

// ============================================
// 6. AXIOS ALTERNATIVE (Nếu sử dụng Axios)
// ============================================

import axios from "axios";

export const createVNPayPaymentUrl = async (amount, orderDescription, token) => {
    try {
        const response = await axios.post(
            "http://localhost:5678/api/vnpay/create_payment_url",
            {
                amount,
                orderDescription,
                orderType: "billpayment",
                language: "vn",
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// ============================================
// 7. USAGE EXAMPLES
// ============================================

/**
 * Example 1: Thanh toán từ trang đơn hàng
 */
const exampleUsage1 = async () => {
    const orderId = "12345";
    const totalAmount = 500000; // 500,000 VND
    const userToken = "jwt_token_here";

    try {
        await paymentService.createPaymentUrl(
            {
                amount: totalAmount,
                orderDescription: `Thanh toán đơn hàng #${orderId}`,
                orderType: "billpayment",
                language: "vn",
            },
            userToken,
        );
        console.log("Thanh toán thành công, đang chuyển hướng...");
    } catch (error) {
        console.error("Lỗi thanh toán:", error.message);
    }
};

/**
 * Example 2: Thanh toán với xác minh dữ liệu
 */
const exampleUsage2 = async (order, token) => {
    // Xác minh đơn hàng
    if (!order || order.status !== "pending") {
        console.error("Đơn hàng không hợp lệ");
        return;
    }

    // Xác minh số tiền
    if (order.totalAmount <= 0 || order.totalAmount > 1000000000) {
        console.error("Số tiền không hợp lệ");
        return;
    }

    try {
        await paymentService.createPaymentUrl(
            {
                amount: order.totalAmount,
                orderDescription: `Thanh toán đơn hàng ${order.id}`,
                orderType: "billpayment",
                language: "vn",
            },
            token,
        );
    } catch (error) {
        console.error("Lỗi:", error);
    }
};

export { exampleUsage1, exampleUsage2 };
