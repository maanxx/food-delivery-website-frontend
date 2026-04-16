import React, { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart, updateItemQuantity, selectCartItems } from "@features/cart/cartSlice";
import { message } from "antd";
import { 
  Add as AddIcon, 
  Remove as RemoveIcon, 
  Star as StarIcon,
  ShoppingCart as CartIcon
} from "@mui/icons-material";
import classNames from "classnames/bind";
import styles from "./DishCard.module.css";

const cx = classNames.bind(styles);

/**
 * Modern DishCard component standardized on 'dishId' naming.
 * Features:
 * - UI Consistency with #ff914c theme
 * - Price discount logic
 * - Quantity toggle (+/-)
 * - Navigation protection (e.stopPropagation)
 */
const DishCard = memo(({ dish = {} }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);

  // Map Backend fields to local constants
  const {
    dish_id, // We use this to map to dishId
    name = "Tên món ăn",
    thumbnail_path,
    price = 0,
    discount_amount = 0,
    stock = 0,
    rating_avg = 0,
    description = "",
  } = dish;

  const dishId = dish_id; // Standardized internal name
  const finalPrice = price - discount_amount;
  const hasDiscount = discount_amount > 0;
  const isOutOfStock = stock <= 0;

  // Find if this item is in cart to toggle UI
  const cartItem = cartItems.find(item => item.dish_id === dishId);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  // Format price helper
  const formatPrice = (p) => {
    return new window.Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p);
  };

  /**
   * Navigate to detail page on card click
   */
  const handleCardClick = () => {
    navigate(`/dish/${dishId}`);
  };

  /**
   * Add to Cart logic with logs
   */
  const handleAddToCart = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.group("🛒 ADD TO CART UI CLICK");
    const payload = { dishId, quantity: 1 };
    console.log("Payload:", payload);
    console.groupEnd();

    dispatch(addItemToCart(payload))
      .unwrap()
      .then(() => {
        message.success(`Đã thêm ${name} vào giỏ hàng`);
      });
  }, [dispatch, dishId, name]);

  /**
   * Update quantity logic with logs
   */
  const handleUpdateQuantity = useCallback((delta, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const newQuantity = quantityInCart + delta;
    if (newQuantity < 0) return;

    if (newQuantity === 0) {
      // Logic for removing would go here if needed, 
      // otherwise use service's updateItemQuantity
    }

    dispatch(updateItemQuantity({ 
      cartItemId: cartItem.cart_item_id, 
      quantity: newQuantity 
    }));
  }, [dispatch, quantityInCart, cartItem]);

  return (
    <div className={styles.card} onClick={handleCardClick}>
      {/* Image Container */}
      <div className={styles.imageContainer}>
        <img 
          src={thumbnail_path || "/images/dishes/placeholder.jpg"} 
          alt={name} 
          className={styles.image}
          loading="lazy"
        />
        
        <div className={styles.badges}>
          {hasDiscount && (
            <div className={styles.discountBadge}>
              -{Math.round((discount_amount / price) * 100)}% Giảm
            </div>
          )}
          <div className={styles.ratingBadge}>
            <StarIcon className={styles.starIcon} />
            {Number(rating_avg).toFixed(1)}
          </div>
        </div>

        {isOutOfStock && (
          <div className={styles.stockLabel}>Hết hàng</div>
        )}
      </div>

      {/* Content Area */}
      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.description}>{description}</p>
      </div>

      {/* Footer Area with Price and Actions */}
      <div className={styles.footer}>
        <div className={styles.priceWrapper}>
          {hasDiscount && (
            <span className={styles.originalPrice}>{formatPrice(price)}</span>
          )}
          <span className={styles.finalPrice}>{formatPrice(finalPrice)}</span>
        </div>

        <div className={styles.actions}>
          {quantityInCart > 0 ? (
            <div className={styles.quantityControls} onClick={(e) => e.stopPropagation()}>
              <button 
                className={styles.qBtn} 
                onClick={(e) => handleUpdateQuantity(-1, e)}
              >
                <RemoveIcon fontSize="inherit" />
              </button>
              <span className={styles.qValue}>{quantityInCart}</span>
              <button 
                className={styles.qBtn} 
                onClick={(e) => handleUpdateQuantity(1, e)}
              >
                <AddIcon fontSize="inherit" />
              </button>
            </div>
          ) : (
            <button 
              className={styles.addBtn} 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <CartIcon fontSize="inherit" style={{ marginRight: 4 }} />
              Thêm
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default DishCard;
