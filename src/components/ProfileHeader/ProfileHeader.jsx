import React from 'react';
import { Avatar, Button, Upload } from 'antd';
import { UserOutlined, CameraOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserAvatar } from '@features/user/userSlice';
import { getAvatarUrl } from '@utils/urlHelper';
import styles from './ProfileHeader.module.css';

const ProfileHeader = ({ profile }) => {
  const { user } = useSelector((state) => state?.customerAuth || state?.auth || {});
  const { avatarLoading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const profileData = profile || user;
  const phoneLabel =
    profileData?.phoneNumber && /[a-zA-Z]/.test(profileData.phoneNumber)
      ? 'Chưa cập nhật SĐT'
      : (profileData?.phoneNumber || 'Chưa cập nhật SĐT');

  const handleAvatarUpload = async (info) => {
    if (info.file.status === 'uploading') return;
    const file = info.file.originFileObj;
    if (!file) return;
    await dispatch(updateUserAvatar(file));
  };

  return (
    <div className={styles.headerCard}>
      <div className={styles.profileSection}>
        <div className={styles.avatarWrapper}>
          <Avatar 
            size={100} 
            src={getAvatarUrl(profileData?.avatarPath || profileData?.avatar_path)} 
            icon={<UserOutlined />} 
            className={styles.avatar}
          />
          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleAvatarUpload}
            disabled={avatarLoading}
          >
            <Button 
              shape="circle" 
              icon={<CameraOutlined />} 
              className={styles.editAvatarBtn}
              loading={avatarLoading}
            />
          </Upload>
        </div>
        <div className={styles.userMeta}>
          <h2 className={styles.username}>{profileData?.fullname || profileData?.username || 'Eatsy User'}</h2>
          <div className={styles.contactInfo}>
            <span className={styles.infoItem}>{profileData?.email || 'Chưa cập nhật email'}</span>
            <span className={styles.dot}>•</span>
            <span className={styles.infoItem}>{phoneLabel}</span>
          </div>
        </div>
      </div>
      <div className={styles.statsSection}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>0</span>
          <span className={styles.statLabel}>Đơn hàng</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>0</span>
          <span className={styles.statLabel}>Voucher</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>0</span>
          <span className={styles.statLabel}>Yêu thích</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
