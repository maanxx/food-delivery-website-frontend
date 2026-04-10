import axiosInstance from "@config/axiosInstance";

const checkVoucher = async (voucherCode) => {
    try {
        const res = await axiosInstance({
            url: "/voucher/check-voucher",
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

export { checkVoucher };
