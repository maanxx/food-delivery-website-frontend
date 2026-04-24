import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Rating,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import styles from "./ReviewForm.module.css";

const ReviewForm = ({ open, onClose, onSubmit, initialData = null }) => {
    const [points, setPoints] = useState(5);
    const [content, setContent] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setPoints(initialData.points || 5);
            setContent(initialData.content || "");
        } else {
            setPoints(5);
            setContent("");
        }
        setErrors({});
    }, [initialData, open]);

    const validate = () => {
        const newErrors = {};

        if (!content.trim()) {
            newErrors.content = "Vui lòng nhập nội dung đánh giá";
        } else if (content.trim().length < 10) {
            newErrors.content = "Nội dung đánh giá phải có ít nhất 10 ký tự";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSubmit({
                points,
                content: content.trim(),
            });
        }
    };

    const handleClose = () => {
        setPoints(5);
        setContent("");
        setErrors({});
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {initialData ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
            </DialogTitle>
            <DialogContent>
                <Box className={styles.formContent}>
                    <Box className={styles.ratingSection}>
                        <Typography className={styles.label}>
                            Đánh giá của bạn
                        </Typography>
                        <Rating
                            value={points}
                            onChange={(event, newValue) => {
                                setPoints(newValue || 1);
                            }}
                            size="large"
                            precision={0.5}
                        />
                    </Box>

                    <Box className={styles.contentSection}>
                        <Typography className={styles.label}>
                            Nhận xét của bạn
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Chia sẻ trải nghiệm của bạn về món ăn này..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            error={!!errors.content}
                            helperText={errors.content}
                            variant="outlined"
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions className={styles.actions}>
                <Button onClick={handleClose} color="inherit">
                    Hủy
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    className={styles.submitButton}
                >
                    {initialData ? "Cập nhật" : "Gửi đánh giá"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReviewForm;
