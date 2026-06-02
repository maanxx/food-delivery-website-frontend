import axiosInstance from "@config/axiosInstance";

const getAllDishes = async () => {
    try {
        const res = await axiosInstance({
            url: "/api/dish",
            method: "get",
        });
        return res.data;
    } catch (error) {
        console.log("Get dishes failed", error);
    }
};

const getDishById = async (id) => {
    try {
        const res = await axiosInstance({
            url: `/api/dish/${id}`,
            method: "get",
        });
        return res.data;
    } catch (error) {
        console.log("Get dish failed", error);
    }
};

const createDish = async (formData) => {
    try {
        const res = await axiosInstance({
            url: "/api/dish",
            method: "post",
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    } catch (error) {
        console.log("Create dish failed", error);
        throw error;
    }
};

const updateDish = async (id, formData) => {
    try {
        const res = await axiosInstance({
            url: `/api/dish/${id}`,
            method: "put",
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    } catch (error) {
        console.log("Update dish failed", error);
        throw error;
    }
};

const deleteDish = async (id) => {
    try {
        const res = await axiosInstance({
            url: `/api/dish/${id}`,
            method: "delete",
        });
        return res.data;
    } catch (error) {
        console.log("Delete dish failed", error);
        throw error;
    }
};

export { getAllDishes, getDishById, createDish, updateDish, deleteDish };
