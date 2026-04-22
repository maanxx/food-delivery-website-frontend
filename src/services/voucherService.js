import axiosInstance from "@config/axiosInstance";

const checkVoucher = async (voucherCode) => {
    try {
        const res = await axiosInstance({
            url: "/api/voucher/check-voucher",
            method: "post",
            data: {
                voucherCode,
            },
        });

        return res.data;
    } catch (error) {
        console.log("Submit voucher failed ", error);
    }
};

const getVouchers = () => axiosInstance.get('/api/voucher');

const voucherService = {
  checkVoucher,
  getVouchers,
};

export { checkVoucher, getVouchers };
export default voucherService;
