import axiosInstance from "@config/axiosInstance";

const authLogin = async () => {
    try {
        const res = await axiosInstance({
            url: "/auth",
            method: "get",
        });

        if (res.data.success) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};

export { authLogin };
