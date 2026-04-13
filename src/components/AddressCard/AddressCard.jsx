import React from 'react';
import styles from './AddressCard.module.css';
import { EditOutlined, DeleteOutlined, PushpinOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';

const AddressCard = ({ address, onEdit, onDelete, onSetDefault, isDefault }) => {
  return (
    <div className={`${styles.card} ${isDefault ? styles.defaultCard : ''}`}>
      <div className={styles.header}>
        <h4>{address.label || 'Home'}</h4>
        {isDefault && <Tag color="blue"><PushpinOutlined /> Default</Tag>}
        <div className={styles.actions}>
          {!isDefault && (
            <Button 
              type="text" 
              icon={<PushpinOutlined />} 
              onClick={() => onSetDefault(address.address_id)}
              size="small"
            >
              Set Default
            </Button>
          )}
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => onEdit(address)}
            size="small"
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => onDelete(address.address_id)}
            size="small"
          />
        </div>
      </div>
      <div className={styles.details}>
        <p>{address.street}</p>
        <p>{address.ward ? `${address.ward}, ` : ''}{address.district ? `${address.district}, ` : ''}{address.city}</p>
        <p>{address.country}</p>
      </div>
    </div>
  );
};

export default AddressCard;

