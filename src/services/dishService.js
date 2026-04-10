import axiosInstance from "@config/axiosInstance";

// GET all dishes
const getAllDishes = async () => {
    try {
        const res = await axiosInstance({
            url: "/dish",
            method: "get",
        });
        return res.data;
    } catch (error) {
        console.log("Get dishes failed", error);
    }
};

// GET dish by id
const getDishById = async (id) => {
    try {
        const res = await axiosInstance({
            url: `/dish/${id}`,
            method: "get",
        });
        return res.data;
    } catch (error) {
        console.log("Get dish failed", error);
    }
};

export { getAllDishes, getDishById };