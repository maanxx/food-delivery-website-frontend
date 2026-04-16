import React, { memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '@features/cart/cartSlice';
import styles from './FoodCard.module.css';

const FoodCard = memo(({ dish = {} }) => {
  const dispatch = useDispatch();
  const cartStatus = useSelector((state) => state.cart.status);
  const [isAdding, setIsAdding] = React.useState(false);

  const {
    dish_id,
    name = "Unknown",
    price = 0,
    discount = 0,
    image,
    thumbnail_path,
  } = dish;

  const displayImage = image || thumbnail_path || "/images/dishes/pizza/pizza1.jpg";

  const discountPercent = discount;
  const originalPrice =
    discountPercent > 0
      ? (price / (1 - discountPercent / 100)).toFixed(2)
      : null;

  const handleAddToCart = useCallback(async () => {
    if (!dish_id || isAdding) return;
    
    setIsAdding(true);
    try {
      await dispatch(addItemToCart({ dish_id, quantity: 1 })).unwrap();
    } finally {
      setIsAdding(false);
    }
  }, [dispatch, dish_id, isAdding]);

  const isLoading = isAdding || cartStatus === 'loading';

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
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>

        {originalPrice && (
          <div className={styles.originalPrice}>${originalPrice}</div>
        )}

        <div className={styles.priceWrapper}>
          <span className={styles.price}>
            ${Number(price).toFixed(0)}
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
