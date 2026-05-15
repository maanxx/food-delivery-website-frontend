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
  
  // Sort & Filter states
  const [sortBy, setSortBy] = useState("default"); // default, price-asc, price-desc, rating
  const [priceRange, setPriceRange] = useState([0, 500000]); // [min, max]
  const [openSort, setOpenSort] = useState(false);
  const [openPriceFilter, setOpenPriceFilter] = useState(false);

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
  }, [selectedCategoryId, searchTerm, sortBy, priceRange]);

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
    
    // Filter by price range
    const dishPrice = Number(dish.price) || 0;
    const matchesPriceRange = dishPrice >= priceRange[0] && dishPrice <= priceRange[1];
    
    return matchesCategory && matchesSearch && matchesPriceRange;
  });

  // Sort dishes
  const sortedDishes = [...filteredDishes].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      case "price-desc":
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      case "rating":
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      default:
        return 0; // Keep original order
    }
  }); 

  const totalPages = Math.ceil(sortedDishes.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDishes = sortedDishes.slice(
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

            </div>
          </div>
        </div>

        {/* Sort & Filter Bar */}
        <div className={cx("filter-bar")}>
          <div className={cx("filter-left")}>
            <Typography variant="body2" color="text.secondary">
              Tìm thấy {sortedDishes.length} món ăn
            </Typography>
          </div>
          
          <div className={cx("filter-right")}>
            {/* Sort Dropdown */}
            <div className={cx("filter-dropdown")}>
              <div
                className={cx("filter-select-box")}
                onClick={() => setOpenSort(!openSort)}
              >
                <span>
                  {sortBy === "default" && "Sắp xếp"}
                  {sortBy === "price-asc" && "Giá: Thấp → Cao"}
                  {sortBy === "price-desc" && "Giá: Cao → Thấp"}
                  {sortBy === "rating" && "Đánh giá cao nhất"}
                </span>
                <span className={cx("arrow")}>{openSort ? "▲" : "▼"}</span>
              </div>

              {openSort && (
                <div className={cx("filter-panel")}>
                  {[
                    { value: "default", label: "Mặc định" },
                    { value: "price-asc", label: "Giá: Thấp → Cao" },
                    { value: "price-desc", label: "Giá: Cao → Thấp" },
                    { value: "rating", label: "Đánh giá cao nhất" },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={cx("filter-option", sortBy === option.value && "active")}
                      onClick={() => {
                        setSortBy(option.value);
                        setOpenSort(false);
                      }}
                    >
                      <span>{option.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range Filter */}
            <div className={cx("filter-dropdown")}>
              <div
                className={cx("filter-select-box")}
                onClick={() => setOpenPriceFilter(!openPriceFilter)}
              >
                <span>
                  {priceRange[0] === 0 && priceRange[1] === 500000
                    ? "Khoảng giá"
                    : `${(priceRange[0] / 1000).toFixed(0)}k - ${(priceRange[1] / 1000).toFixed(0)}k`}
                </span>
                <span className={cx("arrow")}>{openPriceFilter ? "▲" : "▼"}</span>
              </div>

              {openPriceFilter && (
                <div className={cx("filter-panel", "price-panel")}>
                  {[
                    { value: [0, 500000], label: "Tất cả" },
                    { value: [0, 50000], label: "Dưới 50k" },
                    { value: [50000, 100000], label: "50k - 100k" },
                    { value: [100000, 200000], label: "100k - 200k" },
                    { value: [200000, 500000], label: "Trên 200k" },
                  ].map((option, index) => (
                    <div
                      key={index}
                      className={cx(
                        "filter-option",
                        priceRange[0] === option.value[0] &&
                          priceRange[1] === option.value[1] &&
                          "active"
                      )}
                      onClick={() => {
                        setPriceRange(option.value);
                        setOpenPriceFilter(false);
                      }}
                    >
                      <span>{option.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className={cx("dishs-section")}>
          {sortedDishes.length === 0 ? (
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
