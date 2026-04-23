import React from 'react';
import styles from './AddressCard.module.css';
import { EditOutlined, DeleteOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';

const AddressCard = ({ 
  address, 
  onEdit, 
  onDelete, 
  onSetDefault, 
  isDeleting,
  isSettingDefault 
}) => {
  console.log("RENDER AddressCard:", { id: address.addressId, isDefault: address.isDefault });

  return (
    <div className={`${styles.card} ${address.isDefault ? styles.defaultCard : ''}`}>
      <div className={styles.header}>
        <div className={styles.labelSection}>
          <EnvironmentOutlined className={styles.icon} />
          <span className={styles.label}>{address.label || 'Home'}</span>
          {address.isDefault && <Tag color="#ff914c" className={styles.defaultBadge}>Default</Tag>}
        </div>
        <div className={styles.actions}>
          <Button 
            type="text" 
            icon={<CheckCircleOutlined />} 
            onClick={() => !address.isDefault && onSetDefault(address.addressId)}
            className={styles.actionBtn}
            loading={isSettingDefault}
            disabled={address.isDefault || isDeleting || isSettingDefault}
          >
            {address.isDefault ? "Default" : "Set Default"}
          </Button>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => onEdit(address)}
            className={styles.actionBtn}
            disabled={isDeleting || isSettingDefault}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => onDelete(address.addressId)}
            className={styles.actionBtn}
            loading={isDeleting}
            disabled={isDeleting || isSettingDefault}
          />
        </div>
      </div>
      <div className={styles.details}>
        <div className={styles.mainAddress}>{[address.street, address.ward].filter(Boolean).join(', ')}</div>
        <div className={styles.subAddress}>{address.city}</div>
      </div>
    </div>
  );
};

export default AddressCard;
