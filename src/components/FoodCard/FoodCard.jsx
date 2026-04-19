import React, { memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, selectItemQuantity } from '@features/cart/cartSlice';
import { message } from 'antd';
import styles from './FoodCard.module.css';

const FoodCard = memo(({ dish = {} }) => {
  const dispatch = useDispatch();
  const cartStatus = useSelector((state) => state.cart.status);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  
  const {
    dish_id,
    name = "Unknown",
    price = 0,
    discount = 0,
    image,
    thumbnail_path,
  } = dish;

  const quantityInCart = useSelector(selectItemQuantity(dish_id));
  const [isAdding, setIsAdding] = React.useState(false);

  const displayImage = image || thumbnail_path || "/images/dishes/pizza/pizza1.jpg";

  const discountPercent = discount;
  const originalPrice =
    discountPercent > 0
      ? (price / (1 - discountPercent / 100)).toFixed(2)
      : null;

  const handleAddToCart = useCallback(async () => {
    if (!dish_id || isAdding) return;

    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để thêm món vào giỏ hàng!");
      return;
    }
    
    const payload = { dishId: dish_id, quantity: 1 };
    console.log("🛒 ADD TO CART PAYLOAD:", payload);
    setIsAdding(true);
    try {
      await dispatch(addToCart(payload)).unwrap();
    } catch (error) {
      // Error handled by slice
    } finally {
      setIsAdding(false);
    }
  }, [dispatch, dish_id, isAdding, isAuthenticated]);

  const isLoading = isAdding || (cartStatus === 'loading' && isAdding);

  return (
    <div className={styles.foodCard}>
      <div className={styles.imageWrapper}>
        {discountPercent > 0 && (
          <div className={styles.discountBadge}>
            -{discountPercent}%
          </div>
        )}
        <img
          src={displayImage}
          alt={name}
          className={styles.image}
        />
        {quantityInCart > 0 && (
          <div className={styles.quantityBadge}>
            x{quantityInCart}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>

        {originalPrice && (
          <div className={styles.originalPrice}>${originalPrice}</div>
        )}

        <div className={styles.priceWrapper}>
          <span className={styles.price}>
            ${Number(price).toLocaleString()}
          </span>
        </div>

        <button 
          className={styles.addButton} 
          onClick={handleAddToCart}
          disabled={isLoading}
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
});

export default FoodCard;

