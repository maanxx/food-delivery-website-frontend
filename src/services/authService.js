import axiosInstance from "@config/axiosInstance";

const authLogin = async () => {
    try {
        const res = await axiosInstance({
            url: "/api/auth",
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

const authLogout = async () => {
    try {
        const res = await axiosInstance({
            url: "/api/auth/logout-user",
            method: "post",
        });
        return res.data.success;
    } catch (error) {
        console.log(error);
        return false;
    }
};

export { authLogin, authLogout };
