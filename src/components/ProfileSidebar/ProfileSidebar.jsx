import React from 'react';
import { Avatar } from 'antd';
import { 
  UserOutlined, 
  ShoppingOutlined, 
  EnvironmentOutlined, 
  CreditCardOutlined, 
  HeartOutlined, 
  LockOutlined, 
  LogoutOutlined 
} from '@ant-design/icons';
import useAuth from '@hooks/useAuth';
import styles from './ProfileSidebar.module.css';

const ProfileSidebar = ({ activeTab, onTabSelect, profileData, isMobile = false }) => {
  const { logout } = useAuth();
  
  const menuItems = [
    { key: 'info', label: 'Profile Info', icon: <UserOutlined /> },
    { key: 'orders', label: 'Order History', icon: <ShoppingOutlined /> },
    { key: 'addresses', label: 'My Addresses', icon: <EnvironmentOutlined /> },
    { key: 'payment', label: 'Payment Methods', icon: <CreditCardOutlined /> },
    { key: 'favorites', label: 'Favorites', icon: <HeartOutlined /> },
    { key: 'password', label: 'Change Password', icon: <LockOutlined /> },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`${styles.sidebar} ${isMobile ? styles.mobileSidebar : ''}`}>
      {/* User Header */}
      <div className={styles.userSection}>
        <Avatar 
          size={isMobile ? 64 : 80} 
          src={profileData?.avatar_path ? `http://localhost:3001${profileData.avatar_path}` : null}
          icon={<UserOutlined />} 
          className={styles.avatar}
        />
        <div className={styles.userInfo}>
          <h3 className={styles.userName}>{profileData?.fullname || 'Loading...'}</h3>
          <p className={styles.userEmail}>{profileData?.email || ''}</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <ul className={styles.menuList}>
        {menuItems.map((item) => (
          <li 
            key={item.key}
            className={`${styles.menuItem} ${activeTab === item.key ? styles.active : ''}`}
            onClick={() => onTabSelect(item.key)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </li>
        ))}
      </ul>
      
      <div className={styles.logoutWrapper}>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogoutOutlined />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;
