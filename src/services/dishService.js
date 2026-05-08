import axiosInstance from "@config/axiosInstance";

// GET all dishes
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

// GET dish by id
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

// POST create dish (multipart/form-data for image upload)
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

// PUT update dish (multipart/form-data for image upload)
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

// DELETE dish
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
