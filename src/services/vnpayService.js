import axiosInstance from "@config/axiosInstance";

/**
 * Create VNPay payment request and let backend redirect to VNPay sandbox.
 */
export const createPaymentUrl = async (payload) => {
    const response = await axiosInstance.post("/api/vnpay/create_payment_url", payload);
    return response;
};
