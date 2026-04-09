import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Rating,
  Divider,
} from "@mui/material";
import Carousel from "react-material-ui-carousel";
import styles from "./DishDetail.module.css";
import QuantityInput from "../../components/QuantityInput/QuantityInput";
import FoodCard from "../../components/FoodCard/FoodCard";
import { getDishById } from "../../services/dishService";

const DishDetail = () => {
  const { id } = useParams();
  const [dish, setDish] = useState(null);
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    const fetchDish = async () => {
      const data = await getDishById(id);
      console.log(data);
      setDish(data?.data || data);
    };
    fetchDish();
  }, [id]);

  if (!dish) return <Typography>Đang tải...</Typography>;

  return (
    <Container maxWidth="lg" className={styles.detailPage}>
      <Grid container spacing={4} alignItems="flex-start">
        {/* IMAGE */}
        <Grid item xs={12} md={6}>
          <div className={styles.imageWrapper}>
            <Carousel indicators={false} navButtonsAlwaysVisible>
              <img
                src={dish.thumbnail_path}
                alt={dish.name}
                className={styles.image}
              />
            </Carousel>
          </div>
        </Grid>

        {/* INFO */}
        <Grid item xs={12} md={6}>
          <div className={styles.infoCard}>
            <Typography className={styles.name}>{dish.name}</Typography>

            <Rating value={4.5} readOnly />

            <Typography className={styles.price}>
              {Number(dish.price).toLocaleString()} ₫
            </Typography>

            <Typography className={styles.desc}>
              {dish.description || "Chưa có mô tả cho món này"}
            </Typography>

            <Divider />

            <div className={styles.addSection}>
              <QuantityInput quantity={quantity} onChange={setQuantity} />

              <Button
                className={styles.addBtn}
                onClick={() => console.log("Add:", dish.dish_id, quantity)}
              >
                Thêm vào giỏ •{" "}
                {(Number(dish.price) * quantity).toLocaleString()} ₫
              </Button>
            </div>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DishDetail;
