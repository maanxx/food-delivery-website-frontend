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
}) => {
  const { cart_item_id, quantity, price_snapshot, is_available, has_stock, warning, dish } = item;
  const { name, thumbnail_path } = dish || {};

  const handleZeroQuantity = React.useCallback(() => {
    onDelete(cart_item_id);
  }, [onDelete, cart_item_id]);

  const isInvalid = !is_available || !has_stock;

  return (
    <div className={`${styles.card} ${isInvalid ? styles.invalid : ''}`}>
      <Checkbox 
        className={styles.checkbox}
        checked={isSelected}
        disabled={isInvalid}
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
        {isInvalid && <div className={styles.overlay}>Không khả dụng</div>}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        <div className={styles.priceContainer}>
          <span className={styles.price}>
            {Number(price_snapshot).toLocaleString('vi-VN')}
            <span className={styles.priceUnit}>₫</span>
          </span>
          {warning && <span className={styles.warningText}>{warning}</span>}
        </div>
      </div>

      <div className={styles.controls}>
        <QuantityInput 
          min={1} 
          max={999} 
          currentValue={quantity}
          cartItemId={cart_item_id}
          setOpenModal={handleZeroQuantity}
          disabled={!is_available}
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
