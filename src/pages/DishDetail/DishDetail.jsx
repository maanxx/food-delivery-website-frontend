import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Rating,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Divider,
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
  const [rating] = useState(0);
  const [similarDishes, setSimilarDishes] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState('v1');
  const [selectedAddons, setSelectedAddons] = useState([]);

  const mockVariants = [
    { id: 'v1', name: 'Size M', price: 0 },
    { id: 'v2', name: 'Size L', price: 20000 },
  ];
  
  const mockAddons = [
    { id: 'a1', name: 'Thêm phô mai', price: 10000 },
    { id: 'a2', name: 'Thêm xúc xích', price: 15000 },
  ];

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
      const res = await axiosInstance.get(`/api/dish/similar/${id}`);
      setSimilarDishes(res.data);
    };

    fetchSimilar();
  }, [id]);

  if (!dish) return <Typography>Loading...</Typography>;

  const variantPrice = mockVariants.find(v => v.id === selectedVariant)?.price || 0;
  const addonsPrice = selectedAddons.reduce((sum, id) => {
      const addon = mockAddons.find(a => a.id === id);
      return sum + (addon ? Number(addon.price) : 0);
  }, 0);
  const totalPrice = (Number(dish.price) + variantPrice + addonsPrice) * quantity;

  const handleAddonToggle = (addonId) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating
                  value={Number(dish.rating_avg) || rating}
                  readOnly
                  precision={0.5}
                />
                <Typography variant="body2" color="text.secondary">
                  ({dish.rating_avg || 0})
                </Typography>
              </Box>
              <Typography variant="body2">
                {dish.rating_count || dish.rate_quantity || 0} đánh giá
              </Typography>
            </Box>

            <Typography className={styles.price}>
              {Number(dish.price).toLocaleString()} ₫
            </Typography>

            <Typography className={styles.desc}>
              {dish.description || "Chưa có mô tả"}
            </Typography>

            <Divider sx={{ my: 1 }} />

            {/* VARIANTS */}
            <Typography variant="subtitle1" fontWeight="bold">Kích cỡ</Typography>
            <RadioGroup 
                value={selectedVariant} 
                onChange={(e) => setSelectedVariant(e.target.value)}
                sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
            >
                {mockVariants.map(variant => (
                    <Box key={variant.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <FormControlLabel value={variant.id} control={<Radio color="primary"/>} label={variant.name} />
                        <Typography variant="body2">{variant.price > 0 ? `+${variant.price.toLocaleString()} ₫` : 'Miễn phí'}</Typography>
                    </Box>
                ))}
            </RadioGroup>

            {/* ADDONS */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>Món thêm</Typography>
            <FormGroup>
                {mockAddons.map(addon => (
                    <Box key={addon.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <FormControlLabel 
                            control={<Checkbox color="primary" checked={selectedAddons.includes(addon.id)} onChange={() => handleAddonToggle(addon.id)} />} 
                            label={addon.name} 
                        />
                        <Typography variant="body2">+{addon.price.toLocaleString()} ₫</Typography>
                    </Box>
                ))}
            </FormGroup>

            <Box className={styles.addSection}>
              <QuantityInput quantity={quantity} onChange={setQuantity} />

              <Button className={styles.addBtn}>
                Thêm • {totalPrice.toLocaleString()} ₫
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
