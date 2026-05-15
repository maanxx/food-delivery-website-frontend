import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Divider,
} from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import ReviewItem from "@components/ReviewItem/ReviewItem";
import ReviewForm from "@components/ReviewForm/ReviewForm";
import reviewService from "@services/reviewService";
import styles from "./ReviewList.module.css";

const ReviewList = ({ dishId }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [userHasReviewed, setUserHasReviewed] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [dishId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewService.getReviewsByDish(dishId);
            setReviews(response.data || []);

            // Kiểm tra user đã review chưa
            if (isAuthenticated && user) {
                const hasReviewed = response.data?.some(
                    (review) => review.user?.user_id === user.userId
                );
                setUserHasReviewed(hasReviewed);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast.error("Không thể tải đánh giá");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = () => {
        if (!isAuthenticated) {
            toast.warning("Vui lòng đăng nhập để đánh giá");
            return;
        }
        setEditingReview(null);
        setFormOpen(true);
    };

    const handleEdit = (review) => {
        setEditingReview(review);
        setFormOpen(true);
    };

    const handleSubmit = async (reviewData) => {
        try {
            if (editingReview) {
                // Update existing review
                await reviewService.updateReview(editingReview.review_id, reviewData);
                toast.success("Cập nhật đánh giá thành công");
            } else {
                // Create new review
                await reviewService.createReview(dishId, reviewData);
                toast.success("Đánh giá thành công");
            }

            setFormOpen(false);
            setEditingReview(null);
            fetchReviews();
        } catch (error) {
            console.error("Error submitting review:", error);
            const message =
                error.response?.data?.message ||
                "Có lỗi xảy ra, vui lòng thử lại";
            toast.error(message);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) {
            return;
        }

        try {
            await reviewService.deleteReview(reviewId);
            toast.success("Xóa đánh giá thành công");
            fetchReviews();
        } catch (error) {
            console.error("Error deleting review:", error);
            const message =
                error.response?.data?.message ||
                "Có lỗi xảy ra, vui lòng thử lại";
            toast.error(message);
        }
    };

    if (loading) {
        return (
            <Box className={styles.loading}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box className={styles.reviewList}>
            <Box className={styles.header}>
                <Typography className={styles.title}>
                    Đánh giá ({reviews.length})
                </Typography>

                {isAuthenticated && !userHasReviewed && (
                    <Button
                        variant="contained"
                        onClick={handleOpenForm}
                        className={styles.writeButton}
                    >
                        Viết đánh giá
                    </Button>
                )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {reviews.length === 0 ? (
                <Box className={styles.empty}>
                    <Typography color="text.secondary">
                        Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá món này!
                    </Typography>
                </Box>
            ) : (
                <Box className={styles.list}>
                    {reviews.map((review) => (
                        <ReviewItem
                            key={review.review_id}
                            review={review}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </Box>
            )}

            <ReviewForm
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setEditingReview(null);
                }}
                onSubmit={handleSubmit}
                initialData={editingReview}
            />
        </Box>
    );
};

export default ReviewList;
