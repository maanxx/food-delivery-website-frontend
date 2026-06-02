import axiosInstance from "@config/axiosInstance";

const reviewService = {
    getReviewsByDish: async (dishId) => {
        try {
            const response = await axiosInstance.get(`/api/dish/${dishId}/reviews`);
            return response.data;
        } catch (error) {
            console.error("Error fetching reviews:", error);
            throw error;
        }
    },

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

    deleteReview: async (reviewId) => {
        try {
            const response = await axiosInstance.delete(`/api/reviews/${reviewId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting review:", error);
            throw error;
        }
    },

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
