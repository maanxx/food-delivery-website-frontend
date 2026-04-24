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
import { toast } from "react-toastify";

import FoodCard from "../../components/FoodCard/FoodCard";
import { getAllDishes } from "../../services/dishService";
import { getVouchers } from "../../services/voucherService";

const Offers = () => {
  const [dishes, setDishes] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [savedVouchers, setSavedVouchers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllDishes();
      setDishes(res?.data || []);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        console.log("🎟️ Fetching vouchers...");
        const res = await getVouchers();
        console.log("🎟️ Vouchers response:", res);
        if (res.data.success) {
          console.log("🎟️ Vouchers data:", res.data.data);
          setVouchers(res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch vouchers:", error);
        toast.error("Không thể tải danh sách voucher");
      }
    };
    fetchVouchers();
  }, []);

  // Load saved vouchers from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedVouchers') || '[]');
    setSavedVouchers(saved);
  }, []);

  const handleSaveVoucher = (voucherCode) => {
    const saved = JSON.parse(localStorage.getItem('savedVouchers') || '[]');
    if (saved.includes(voucherCode)) {
      // Unsave
      const updated = saved.filter(code => code !== voucherCode);
      localStorage.setItem('savedVouchers', JSON.stringify(updated));
      setSavedVouchers(updated);
      toast.info("Đã bỏ lưu voucher");
    } else {
      // Save
      const updated = [...saved, voucherCode];
      localStorage.setItem('savedVouchers', JSON.stringify(updated));
      setSavedVouchers(updated);
      toast.success("Đã lưu voucher!");
    }
  };

  // lọc món giảm giá
  const discountedDishes = dishes.filter(
    (dish) => Number(dish.discount_amount) > 0
  );

  // Filter dishes by category
  const filteredDishes = filter === "all" 
    ? discountedDishes 
    : discountedDishes.filter(dish => {
        if (filter === "food") {
          return !dish.category_id || dish.category_id !== 'drinks-category-id'; // Adjust based on your category IDs
        } else if (filter === "drink") {
          return dish.category_id === 'drinks-category-id'; // Adjust based on your category IDs
        }
        return true;
      });

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
          {vouchers.length === 0 ? (
            <Typography sx={{ textAlign: 'center', py: 4, color: '#999' }}>
              Hiện tại chưa có voucher nào
            </Typography>
          ) : (
            vouchers.map((voucher) => (
              <Box key={voucher.voucher_id} className={styles.voucher}>
                <div>
                  <Typography className={styles.voucherCode}>{voucher.code}</Typography>
                  <Typography className={styles.voucherDesc}>{voucher.description}</Typography>
                </div>
                <Button 
                  size="small" 
                  variant={savedVouchers.includes(voucher.code) ? "contained" : "outlined"}
                  sx={{ 
                    color: savedVouchers.includes(voucher.code) ? "white" : "var(--primaryColor)", 
                    borderColor: "var(--primaryColor)",
                    backgroundColor: savedVouchers.includes(voucher.code) ? "var(--primaryColor)" : "transparent"
                  }}
                  onClick={() => handleSaveVoucher(voucher.code)}
                >
                  {savedVouchers.includes(voucher.code) ? "Đã lưu" : "Lưu"}
                </Button>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* 🔥 FILTER */}
      <Box className={styles.filter}>
        {[
          { value: "all", label: "Tất cả" },
          { value: "food", label: "Đồ ăn" },
          { value: "drink", label: "Đồ uống" }
        ].map((item) => (
          <Chip
            key={item.value}
            label={item.label}
            clickable
            color={filter === item.value ? "primary" : "default"}
            onClick={() => setFilter(item.value)}
          />
        ))}
      </Box>

      {/* 🍔 HOT DEALS */}
      <Box className={styles.section}>
        <Typography className={styles.title}>
          🔥 Ưu đãi hot
        </Typography>

        <Grid container spacing={3}>
          {filteredDishes.map((dish) => (
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
          {filteredDishes.slice(0, 4).map((dish) => (
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