import axiosInstance from "@config/axiosInstance";

const reviewService = {
    // Lấy tất cả reviews của món ăn
    getReviewsByDish: async (dishId) => {
        try {
            const response = await axiosInstance.get(`/api/dish/${dishId}/reviews`);
            return response.data;
        } catch (error) {
            console.error("Error fetching reviews:", error);
            throw error;
        }
    },

    // Tạo review mới
    createReview: async (dishId, reviewData) => {
        try {
            const response = await axiosInstance.post(
                `/api/dish/${dishId}/reviews`,
                reviewData
            );
            return response.data;
        } catch (error) {
            console.error("Error creating review:", error);
            throw error;
        }
    },

    // Cập nhật review
    updateReview: async (reviewId, reviewData) => {
        try {
            const response = await axiosInstance.put(
                `/api/reviews/${reviewId}`,
                reviewData
            );
            return response.data;
        } catch (error) {
            console.error("Error updating review:", error);
            throw error;
        }
    },

    // Xóa review
    deleteReview: async (reviewId) => {
        try {
            const response = await axiosInstance.delete(`/api/reviews/${reviewId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting review:", error);
            throw error;
        }
    },

    // Lấy tất cả reviews của user
    getUserReviews: async () => {
        try {
            const response = await axiosInstance.get("/api/user/reviews");
            return response.data;
        } catch (error) {
            console.error("Error fetching user reviews:", error);
            throw error;
        }
    },
};

export default reviewService;
