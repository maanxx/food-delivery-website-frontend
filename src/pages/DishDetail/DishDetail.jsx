import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Rating,
} from "@mui/material";
import styles from "./DishDetail.module.css";
import QuantityInput from "../../components/QuantityInput/QuantityInput";
import FoodCard from "../../components/FoodCard/FoodCard";
import { getDishById } from "../../services/dishService";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import axiosInstance from "@config/axiosInstance";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
const DishDetail = () => {
  const { id } = useParams();
  const [dish, setDish] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [rating, setRating] = useState(0);
  const [similarDishes, setSimilarDishes] = useState([]);
  const navigate = useNavigate();
  // nay la lay mon an
  useEffect(() => {
    const fetchDish = async () => {
      const data = await getDishById(id);
      console.log(data);
      setDish(data?.data || data);
    };
    fetchDish();
  }, [id]);

  // lay goi y mon an
  useEffect(() => {
    const fetchSimilar = async () => {
      const res = await axiosInstance.get(`/dish/similar/${id}`);
      setSimilarDishes(res.data);
    };

    fetchSimilar();
  }, [id]);

  if (!dish) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="lg" className={styles.detailPage}>
      <Box mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/menu")}
          className={styles.backBtn}
        >
          Quay về Menu
        </Button>
      </Box>

      <Grid container spacing={4} alignItems="flex-start">
        {/* IMAGE */}
        <Grid item xs={12} md={6}>
          <div className={styles.imageWrapper}>
            <img
              src={dish.thumbnail_path}
              alt={dish.name || "dish image"}
              className={styles.image}
            />
          </div>
        </Grid>

        {/* INFO */}
        <Grid item xs={12} md={6}>
          <div className={styles.infoCard}>
            <Box className={styles.rowBetween}>
              <Typography className={styles.name}>{dish.name}</Typography>

              <Button onClick={() => setIsFavorite(!isFavorite)}>
                {isFavorite ? (
                  <FavoriteIcon color="error" />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </Button>
            </Box>

            <Box className={styles.rowBetween}>
              <Rating
                value={rating}
                onChange={(e, newValue) => setRating(newValue)}
              />
              <Typography variant="body2">
                {dish.rate_quantity || 0} đánh giá
              </Typography>
            </Box>

            <Typography className={styles.price}>
              {Number(dish.price).toLocaleString()} ₫
            </Typography>

            <Typography className={styles.desc}>
              {dish.description || "Chưa có mô tả"}
            </Typography>

            <Box className={styles.addSection}>
              <QuantityInput quantity={quantity} onChange={setQuantity} />

              <Button className={styles.addBtn}>
                Thêm • {(Number(dish.price) * quantity).toLocaleString()} ₫
              </Button>
            </Box>
          </div>
        </Grid>
      </Grid>
      <Box mt={6}>
        <Typography className={styles.sectionTitle}>
          Món bạn có thể thích
        </Typography>

        <Box className={styles.scrollWrapper}>
          {similarDishes.map((item) => (
            <Box key={item.dish_id} className={styles.scrollItem}>
              <FoodCard dish={item} />
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default DishDetail;
