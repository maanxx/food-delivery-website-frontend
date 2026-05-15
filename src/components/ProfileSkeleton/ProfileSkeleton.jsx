import React from 'react';
import { Skeleton } from 'antd';
import styles from './ProfileSkeleton.module.css';

const ProfileSkeleton = () => {
  return (
    <div className={styles.skeletonContainer}>
      {/* Header Skeleton */}
      <div className={styles.headerSkeleton}>
        <div className={styles.profileSection}>
          <Skeleton.Avatar active size={100} shape="circle" />
          <div className={styles.metaSkeleton}>
            <Skeleton.Input active size="large" style={{ width: 200 }} />
            <Skeleton.Input active size="small" style={{ width: 300 }} />
          </div>
        </div>
        <div className={styles.statsSection}>
          <Skeleton.Input active size="small" style={{ width: 60 }} />
          <Skeleton.Input active size="small" style={{ width: 60 }} />
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className={styles.contentCard}>
        <div className={styles.row}>
          <Skeleton.Input active block className={styles.inputSkeleton} />
          <Skeleton.Input active block className={styles.inputSkeleton} />
        </div>
        <div className={styles.row}>
          <Skeleton.Input active block className={styles.inputSkeleton} />
          <Skeleton.Input active block className={styles.inputSkeleton} />
        </div>
        <div className={styles.row}>
          <Skeleton.Input active block className={styles.inputSkeleton} />
          <Skeleton.Input active block className={styles.inputSkeleton} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Skeleton.Button active size="large" className={styles.btnSkeleton} />
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
