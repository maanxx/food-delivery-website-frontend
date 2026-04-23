import React from 'react';
import styles from './AddressCard.module.css';
import { EditOutlined, DeleteOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';

// UPDATED
// UPDATED
const AddressCard = ({ 
  address, 
  onEdit, 
  onDelete, 
  onSetDefault, 
  isDefault,
  isDeleting,
  isSettingDefault 
}) => {
  const addrId = address.address_id || address.addressId;
  const line1 = [address.street, address.ward].filter(Boolean).join(', ');
  const line2 = address.city;

  return (
    <div className={`${styles.card} ${isDefault ? styles.defaultCard : ''}`}>
      <div className={styles.header}>
        <div className={styles.labelSection}>
          <EnvironmentOutlined className={styles.icon} />
          <span className={styles.label}>{address.label || 'Home'}</span>
          {isDefault && <Tag color="#ff914c" className={styles.defaultBadge}>Default</Tag>}
        </div>
        <div className={styles.actions}>
          {!isDefault && (
            <Button 
              type="text" 
              icon={<CheckCircleOutlined />} 
              onClick={() => onSetDefault(addrId)}
              className={styles.actionBtn}
              loading={isSettingDefault}
              disabled={isDeleting || isSettingDefault}
            >
              Set Default
            </Button>
          )}
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
            onClick={() => onDelete(addrId)}
            className={styles.actionBtn}
            loading={isDeleting}
            disabled={isDeleting || isSettingDefault}
          />
        </div>
      </div>
      <div className={styles.details}>
        <div className={styles.mainAddress}>{line1}</div>
        <div className={styles.subAddress}>{line2}</div>
      </div>
    </div>
  );
};

export default AddressCard;

