import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Box,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

import styles from "./Menu.module.css";
import axiosInstance from "@config/axiosInstance";

const cx = classNames.bind(styles);

function Menu() {
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState({});
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [openCategory, setOpenCategory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;

  useEffect(() => {
    try {
      const fetchCategories = async () => {
        const response = await axiosInstance.get("/category");
        setCategories([
          { category_id: "all", name: "Tất cả" },
          ...response.data,
        ]);
      };
      fetchCategories();

      const fetchDishes = async () => {
        const response = await axiosInstance.get("/dish");
        setDishes(response.data);
      };
      fetchDishes();
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, searchTerm]);

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory =
      selectedCategoryId === "all" || dish.category_id === selectedCategoryId;

    const matchesSearch =
      !searchTerm ||
      dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dish.description &&
        dish.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredDishes.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDishes = filteredDishes.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Add to cart function
  const addToCart = (dishId) => {
    setCart((prev) => ({
      ...prev,
      [dishId]: (prev[dishId] || 0) + 1,
    }));
    toast.success("Đã thêm vào giỏ hàng!", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  // Remove from cart function
  const removeFromCart = (dishId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[dishId] > 1) {
        newCart[dishId]--;
      } else {
        delete newCart[dishId];
      }
      return newCart;
    });
  };

  // Format price function
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Get total items in cart
  const getTotalCartItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  return (
    <div className={cx("menu")}>
      {/* Header Section */}
      <div className={cx("menu-header")}>
        <Container maxWidth="lg">
          <div className={cx("header-content")}>
            <h1>Thực Đơn Của Chúng Tôi</h1>
            <p>Khám phá những món ăn ngon và đa dạng được chế biến tỉ mỉ</p>
          </div>
        </Container>
      </div>

      <Container maxWidth="lg">
        {/* Search and Filter Section */}
        <div className={cx("search-container")}>
          <div className={cx("search-layout")}>
            {/* CATEGORY */}
            <div className={cx("category-dropdown")}>
              <div
                className={cx("category-select-box")}
                onClick={() => setOpenCategory(!openCategory)}
              >
                <span>
                  {selectedCategoryId === "all"
                    ? "Danh mục"
                    : categories.find(
                        (c) => c.category_id === selectedCategoryId,
                      )?.name || "Danh mục"}
                </span>

                <span className={cx("arrow")}>{openCategory ? "▲" : "▼"}</span>
              </div>

              {openCategory && (
                <div className={cx("category-panel")}>
                  {categories.map((cat) => {
                    const isActive = selectedCategoryId === cat.category_id;

                    return (
                      <div
                        key={cat.category_id}
                        className={cx("category-option", isActive && "active")}
                        onClick={() => {
                          setSelectedCategoryId(cat.category_id);
                          setOpenCategory(false); // chọn xong đóng luôn
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          readOnly
                          className={cx("category-checkbox")}
                        />
                        <span className={cx("category-text")}>{cat.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className={cx("divider")}></div>
            {/* SEARCH */}
            <div className={cx("search-center")}>
              <TextField
                className={cx("search-input")}
                fullWidth
                placeholder="Tìm kiếm món ăn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "#ff6b00" }} />
                  ),
                }}
              />
            </div>

            {/* RIGHT */}
            <div className={cx("search-right")}>
              <Button
                className={cx("search-btn")}
                variant="contained"
                onClick={() => {}}
              >
                Tìm kiếm
              </Button>

              {getTotalCartItems() > 0 && (
                <Chip
                  icon={<CartIcon />}
                  label={`${getTotalCartItems()} món`}
                  color="primary"
                />
              )}
            </div>
          </div>
        </div>
        {/* Products Grid */}
        <div className={cx("dishs-section")}>
          {filteredDishes.length === 0 ? (
            <div className={cx("no-dishs")}>
              <Typography variant="h6" color="text.secondary" align="center">
                Không tìm thấy món ăn nào phù hợp
              </Typography>
            </div>
          ) : (
            <Grid container spacing={3}>
              {currentDishes.map((dish) => (
                <Grid item xs={12} sm={6} md={3} key={dish.dish_id}>
                  <Card className={cx("dish-card")}>
                    <div className={cx("dish-image-container")}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={dish.thumbnail_path}
                        alt={dish.name}
                        className={cx("dish-image")}
                      />
                      {cart[dish.dish_id] && (
                        <div className={cx("quantity-badge")}>
                          {cart[dish.dish_id]}
                        </div>
                      )}
                    </div>

                    <CardContent className={cx("dish-content")}>
                      <Typography
                        variant="h6"
                        component="h3"
                        className={cx("dish-name")}
                      >
                        {dish.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        className={cx("dish-description")}
                      >
                        {dish.description}
                      </Typography>

                      <div className={cx("dish-footer")}>
                        <Typography
                          variant="h6"
                          component="span"
                          className={cx("dish-price")}
                        >
                          {formatPrice(dish.price)}
                        </Typography>

                        <div className={cx("dish-actions")}>
                          {cart[dish.dish_id] ? (
                            <div className={cx("quantity-controls")}>
                              <IconButton
                                size="small"
                                onClick={() => removeFromCart(dish.dish_id)}
                                className={cx("quantity-btn")}
                              >
                                <RemoveIcon />
                              </IconButton>
                              <span className={cx("quantity")}>
                                {cart[dish.dish_id]}
                              </span>
                              <IconButton
                                size="small"
                                onClick={() => addToCart(dish.dish_id)}
                                className={cx("quantity-btn")}
                              >
                                <AddIcon />
                              </IconButton>
                            </div>
                          ) : (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => addToCart(dish.dish_id)}
                              className={cx("add-btn")}
                              startIcon={<AddIcon />}
                            >
                              Thêm
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          <div className={cx("pagination")}>
            <button
              className={cx("page-btn")}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              ◀
            </button>

            <span className={cx("page-info")}>
              {currentPage} / {totalPages}
            </span>

            <button
              className={cx("page-btn")}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              ▶
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Menu;
