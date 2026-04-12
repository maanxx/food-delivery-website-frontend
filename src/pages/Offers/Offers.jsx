import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Chip,
} from "@mui/material";
import Carousel from "react-material-ui-carousel";
import styles from "./Offers.module.css";

import FoodCard from "../../components/FoodCard/FoodCard";
import { getAllDishes } from "../../services/dishService";

const MOCK_VOUCHERS = [
  { code: 'EATSYWELCOME', desc: 'Giảm 10% cho hóa đơn' },
  { code: 'EATSY50', desc: 'Giảm 50K cho đơn từ 500K' },
  { code: 'WELCOME20', desc: 'Giảm 20% khách mới' },
  { code: 'BIGSALE100', desc: 'Giảm 100K đơn 1Tr' },
  { code: 'FREESHIP', desc: 'Miễn phí VC đơn từ 300K' },
];

const Offers = () => {
  const [dishes, setDishes] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllDishes();
      setDishes(res?.data || []);
    };
    fetchData();
  }, []);

  // lọc món giảm giá
  const discountedDishes = dishes.filter(
    (dish) => Number(dish.discount_amount) > 0
  );

  return (
    <Container maxWidth="lg" className={styles.page}>
      
      {/* 🔥 HERO BANNER */}
      <Box className={styles.banner}>
        <Carousel indicators={false}>
          <div className={styles.bannerItem}>
            <h2>🔥 Giảm đến 50%</h2>
            <p>Áp dụng cho tất cả món ăn hôm nay</p>
            <Button variant="contained">Đặt ngay</Button>
          </div>

          <div className={styles.bannerItem}>
            <h2>🚚 Free Ship</h2>
            <p>Cho đơn hàng từ 50.000đ</p>
            <Button variant="contained">Khám phá</Button>
          </div>
        </Carousel>
      </Box>

      {/* 🎟️ VOUCHER */}
      <Box className={styles.section}>
        <Typography className={styles.title}>
          🎟️ Mã giảm giá
        </Typography>

        <Box className={styles.voucherList} sx={{ pb: 2 }}>
          {MOCK_VOUCHERS.map((voucher, idx) => (
            <Box key={idx} className={styles.voucher}>
              <div>
                <Typography className={styles.voucherCode}>{voucher.code}</Typography>
                <Typography className={styles.voucherDesc}>{voucher.desc}</Typography>
              </div>
              <Button size="small" variant="outlined" sx={{ color: "var(--primaryColor)", borderColor: "var(--primaryColor)" }}>Lưu</Button>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 🔥 FILTER */}
      <Box className={styles.filter}>
        {["all", "food", "drink"].map((item) => (
          <Chip
            key={item}
            label={item}
            clickable
            color={filter === item ? "primary" : "default"}
            onClick={() => setFilter(item)}
          />
        ))}
      </Box>

      {/* 🍔 HOT DEALS */}
      <Box className={styles.section}>
        <Typography className={styles.title}>
          🔥 Ưu đãi hot
        </Typography>

        <Grid container spacing={3}>
          {discountedDishes.map((dish) => (
            <Grid item xs={6} md={3} key={dish.dish_id}>
              <FoodCard dish={dish} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 🍱 COMBO */}
      <Box className={styles.section}>
        <Typography className={styles.title}>
          🍱 Combo tiết kiệm
        </Typography>

        <Grid container spacing={3}>
          {discountedDishes.slice(0, 4).map((dish) => (
            <Grid item xs={6} md={3} key={dish.dish_id}>
              <FoodCard dish={dish} />
            </Grid>
          ))}
        </Grid>
      </Box>

    </Container>
  );
};

export default Offers;