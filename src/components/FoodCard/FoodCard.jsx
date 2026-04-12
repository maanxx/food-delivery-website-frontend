import React from 'react';
import styles from './FoodCard.module.css';

const FoodCard = ({ dish }) => {
  const handleAddToCart = () => {
    console.log('Added to cart:', dish.name);
  };

  const discountPercent = dish.discount || 0;
  const originalPrice = discountPercent > 0 ? (dish.price / (1 - discountPercent / 100)).toFixed(2) : null;

  return (
    <div className={styles.foodCard}>
      <div className={styles.imageWrapper}>
        {discountPercent > 0 && (
          <div className={styles.discountBadge}>
            -{discountPercent}%
          </div>
        )}
        <img 
          src={dish.image || '/images/dishes/pizza/pizza1.jpg'} 
          alt={dish.name} 
          className={styles.image} 
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{dish.name}</h3>
        {originalPrice && (
          <div className={styles.originalPrice}>${originalPrice}</div>
        )}
        <div className={styles.priceWrapper}>
          <span className={styles.price}>${Number(dish.price).toFixed(0)}</span>
        </div>
        <button className={styles.addButton} onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
      </div>
  );
};

FoodCard.defaultProps = {
  dish: {
    name: 'Sample Dish',
    price: 0,
    image: '',
    discount: 0
  }
};

export default FoodCard;
