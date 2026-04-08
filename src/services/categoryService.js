import axiosInstance from "@config/axiosInstance";

const getCategories = async () => {
    try {
        const res = await axiosInstance({
            url: "/category",
            method: "get",
        });
        return res.data;
    } catch (error) {
        console.log("Get categories failed", error);
    }
};

export { getCategories };