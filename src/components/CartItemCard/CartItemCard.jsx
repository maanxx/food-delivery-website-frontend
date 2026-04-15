import React, { memo } from 'react';
import { Checkbox } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { QuantityInput } from '@components/index';
import styles from './CartItemCard.module.css';

const CartItemCard = memo(({ 
  item, 
  isSelected, 
  onSelect, 
  onDelete, 
  onLoadCartItems 
}) => {
  const { cart_item_id, name, price, quantity, thumbnail_path } = item;

  const handleZeroQuantity = React.useCallback(() => {
    onDelete(cart_item_id);
  }, [onDelete, cart_item_id]);

  return (
    <div className={styles.card}>
      <Checkbox 
        className={styles.checkbox}
        checked={isSelected}
        onChange={() => onSelect(cart_item_id)}
        sx={{
          color: 'var(--primaryColor)',
          '&.Mui-checked': {
            color: 'var(--primaryColor)',
          },
        }}
      />
      
      <div className={styles.imageContainer}>
        <img src={thumbnail_path} alt={name} className={styles.image} />
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        <span className={styles.price}>
          {Number(price).toLocaleString('vi-VN')}
          <span className={styles.priceUnit}>₫</span>
        </span>
      </div>

      <div className={styles.controls}>
        <QuantityInput 
          min={1} 
          max={999} 
          currentValue={quantity}
          cartItemId={cart_item_id}
          loadCartItems={onLoadCartItems}
          setOpenModal={handleZeroQuantity}
        />
        
        <button 
          className={styles.removeBtn} 
          onClick={() => onDelete(cart_item_id)}
          title="Xóa sản phẩm"
        >
          <DeleteOutlineIcon fontSize="medium" />
        </button>
      </div>
    </div>
  );
});

export default CartItemCard;
