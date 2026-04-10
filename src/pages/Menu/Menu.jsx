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

    useEffect(() => {
        try {
            const fetchCategories = async () => {
                const response = await axiosInstance.get("/api/category");
                setCategories([{ category_id: "all", name: "Tất cả" },...response.data]);
            };
            fetchCategories();

            const fetchDishes = async () => {
                const response = await axiosInstance.get("/api/dish");
                setDishes(response.data);
            };
            fetchDishes();
        } catch (error) {
            console.log(error);
        }
    }, []);

    // Filter dishs based on category and search term
    const filteredDishes = dishes.filter((dish) => {
        if (selectedCategoryId === "all") {
            return dishes;
        }
        const matchesCategory = dish.category_id === selectedCategoryId;

        return matchesCategory;
    });

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
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
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
                <div className={cx("search-section")}>
                    <div className={cx("search-bar")}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Tìm kiếm món ăn..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />,
                            }}
                            sx={{ maxWidth: 400 }}
                        />
                    </div>

                    {/* Cart Summary */}
                    {getTotalCartItems() > 0 && (
                        <div className={cx("cart-summary")}>
                            <Chip
                                icon={<CartIcon />}
                                label={`${getTotalCartItems()} món trong giỏ (${formatPrice(Object.keys(cart).reduce((total, dishId) => {
                                    const dish = dishes.find((p) => p.dish_id === parseInt(dishId));
                                    return total + (dish ? cart[dishId] * dish.price : 0);
                                }, 0))})`}
                                color="primary"
                                variant="filled"
                            />
                        </div>
                    )}
                </div>

                {/* Category Filter */}
                <div className={cx("category-section")}>
                    <div className={cx("category-list")}>
                        {categories.map((category) => (
                            <Button
                                key={category.category_id}
                                variant={selectedCategoryId === category.category_id ? "contained" : "outlined"}
                                onClick={() => setSelectedCategoryId(category.category_id)}
                                className={cx("category-btn", {
                                    active: selectedCategoryId === category.category_id,
                                })}
                                startIcon={<span style={{ fontSize: "18px" }}>{category.icon}</span>}
                            >
                                {category.name}
                            </Button>
                        ))}
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
                            {filteredDishes.map((dish) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={dish.id}>
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
                                                <div className={cx("quantity-badge")}>{cart[dish.dish_id]}</div>
                                            )}
                                        </div>

                                        <CardContent className={cx("dish-content")}>
                                            <Typography variant="h6" component="h3" className={cx("dish-name")}>
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
                                                <Typography variant="h6" component="span" className={cx("dish-price")}>
                                                    {formatPrice(dish.price)}
                                                </Typography>

                                                <div className={cx("dish-actions")}>
                                                    {cart[dish.id] ? (
                                                        <div className={cx("quantity-controls")}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => removeFromCart(dish.dish_id)}
                                                                className={cx("quantity-btn")}
                                                            >
                                                                <RemoveIcon />
                                                            </IconButton>
                                                            <span className={cx("quantity")}>{cart[dish.dish_id]}</span>
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
                </div>
            </Container>
        </div>
    );
}

export default Menu;
