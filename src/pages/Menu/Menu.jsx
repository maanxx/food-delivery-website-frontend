import React, { useState, useEffect, useCallback } from "react";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  updateItemQuantity,
  selectCartItems,
  selectItemQuantity,
} from "@features/cart/cartSlice";
import {
  Container,
  Grid,
  Typography,
  Button,
  TextField,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
} from "@mui/icons-material";
import DishCard from "@components/DishCard/DishCard";
import styles from "./Menu.module.css";
import axiosInstance from "@config/axiosInstance";

import Pagination from "@components/Pagination/Pagination";

const cx = classNames.bind(styles);

function Menu() {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);

  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [openCategory, setOpenCategory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;

  useEffect(() => {
    try {
      const fetchCategories = async () => {
        const response = await axiosInstance.get("/api/category");
        setCategories([
          { category_id: "all", name: "Tất cả" },
          ...response.data,
        ]);
      };
      fetchCategories();

      const fetchDishes = async () => {
        const response = await axiosInstance.get("/api/dish");
        setDishes(response.data.data || []);
      };
      fetchDishes();
    } catch (error) {
      console.log("Error fetching menu data:", error);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, searchTerm]);

  const safeDishes = Array.isArray(dishes) ? dishes : [];

  const filteredDishes = safeDishes.filter((dish) => {
    const matchesCategory =
      selectedCategoryId === "all" ||
      dish.category_id === selectedCategoryId;

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

  // Get total items in cart from Redux
  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
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
                          setOpenCategory(false);
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
                  <DishCard dish={dish} />
                </Grid>
              ))}
            </Grid>
          )}
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </Container>
    </div>
  );
}

export default Menu;
