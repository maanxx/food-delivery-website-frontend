import React from 'react';
import { Skeleton } from 'antd';
import styles from './ProfileSkeleton.module.css';

const ProfileSkeleton = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.header}>
        <Skeleton.Input active size="large" className={styles.titleSkeleton} />
        <Skeleton.Input active size="small" className={styles.subtitleSkeleton} />
      </div>
      
      <div className={styles.content}>
        <div className={styles.formSection}>
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
          </div>
          <Skeleton.Button active size="large" className={styles.btnSkeleton} />
        </div>
        
        <div className={styles.avatarSection}>
          <Skeleton.Avatar active size={120} shape="circle" />
          <Skeleton.Button active className={styles.uploadSkeleton} />
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
