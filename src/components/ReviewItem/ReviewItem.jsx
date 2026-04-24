import React, { useState } from "react";
import {
    Box,
    Typography,
    Rating,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useSelector } from "react-redux";
import styles from "./ReviewItem.module.css";

const ReviewItem = ({ review, onEdit, onDelete }) => {
    const { user } = useSelector((state) => state.auth);
    const [anchorEl, setAnchorEl] = useState(null);

    const isOwner = user?.userId === review.user?.user_id;

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        onEdit(review);
        handleMenuClose();
    };

    const handleDelete = () => {
        onDelete(review.review_id);
        handleMenuClose();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return "Hôm nay";
        } else if (diffDays === 1) {
            return "Hôm qua";
        } else if (diffDays < 7) {
            return `${diffDays} ngày trước`;
        } else {
            return date.toLocaleDateString("vi-VN");
        }
    };

    return (
        <Box className={styles.reviewItem}>
            <Box className={styles.header}>
                <Box className={styles.userInfo}>
                    <Avatar
                        src={review.user?.avatar}
                        alt={review.user?.fullname}
                        className={styles.avatar}
                    >
                        {review.user?.fullname?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography className={styles.username}>
                            {review.user?.fullname || "Người dùng"}
                        </Typography>
                        <Typography className={styles.date}>
                            {formatDate(review.created_at)}
                        </Typography>
                    </Box>
                </Box>

                {isOwner && (
                    <>
                        <IconButton
                            size="small"
                            onClick={handleMenuOpen}
                            className={styles.menuButton}
                        >
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleEdit}>Chỉnh sửa</MenuItem>
                            <MenuItem onClick={handleDelete}>Xóa</MenuItem>
                        </Menu>
                    </>
                )}
            </Box>

            <Rating
                value={review.points}
                readOnly
                precision={0.5}
                size="small"
                className={styles.rating}
            />

            <Typography className={styles.content}>{review.content}</Typography>
        </Box>
    );
};

export default ReviewItem;
