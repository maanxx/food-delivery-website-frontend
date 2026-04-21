import React from 'react';
import { Empty, Button } from 'antd';
import styles from './ProfileEmptyState.module.css';

const ProfileEmptyState = ({ title, description, buttonText, onAction, icon: Icon }) => {
  return (
    <div className={styles.emptyContainer}>
      <Empty
        image={Icon ? <Icon style={{ fontSize: 48, color: '#bfbfbf' }} /> : Empty.PRESENTED_IMAGE_SIMPLE}
        styles={{ image: { height: 60 } }}
        description={
          <div className={styles.emptyContent}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
          </div>
        }
      >
        {buttonText && (
          <Button type="primary" onClick={onAction} size="large" className={styles.actionBtn}>
            {buttonText}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default ProfileEmptyState;
