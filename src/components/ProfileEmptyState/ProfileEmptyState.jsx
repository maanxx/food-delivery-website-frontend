import React from 'react';
import { Empty, Button } from 'antd';
import styles from './ProfileEmptyState.module.css';

const ProfileEmptyState = ({ title, description, buttonText, onAction, icon }) => {
  return (
    <div className={styles.emptyContainer}>
      <Empty
        image={icon || Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={{ height: 150 }}
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
