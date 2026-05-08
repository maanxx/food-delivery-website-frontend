import React from 'react';
import { 
  UserOutlined, 
  ShoppingOutlined, 
  EnvironmentOutlined, 
  CreditCardOutlined, 
  HeartOutlined, 
  LockOutlined, 
  SettingOutlined,
  LogoutOutlined,
  BellOutlined
} from '@ant-design/icons';
import useAuth from '@hooks/useAuth';
import styles from './ProfileSidebar.module.css';

const ProfileSidebar = ({ activeTab, onTabSelect, isMobile = false }) => {
  const { logout } = useAuth();
  
  const menuSections = [
    {
      title: 'Tài khoản của tôi',
      items: [
        { key: 'info', label: 'Thông tin cá nhân', icon: <UserOutlined /> },
        { key: 'addresses', label: 'Địa chỉ nhận hàng', icon: <EnvironmentOutlined /> },
        { key: 'password', label: 'Bảo mật/Mật khẩu', icon: <LockOutlined /> },
      ]
    },
    {
      title: 'Đơn hàng & Yêu thích',
      items: [
        { key: 'orders', label: 'Lịch sử đơn hàng', icon: <ShoppingOutlined /> },
        { key: 'favorites', label: 'Món ăn yêu thích', icon: <HeartOutlined /> },
        { key: 'vouchers', label: 'Kho Voucher', icon: <CreditCardOutlined /> },
      ]
    },
    {
      title: 'Tiện ích & Thiết lập',
      items: [
        { key: 'payment', label: 'Phương thức thanh toán', icon: <CreditCardOutlined /> },
        { key: 'notifications', label: 'Thông báo', icon: <BellOutlined /> },
        { key: 'settings', label: 'Thiết lập tài khoản', icon: <SettingOutlined /> },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`${styles.sidebar} ${isMobile ? styles.mobileSidebar : ''}`}>
      <div className={styles.menuContainer}>
        {menuSections.map((section, sIndex) => (
          <div key={sIndex} className={styles.section}>
            <h4 className={styles.sectionTitle}>{section.title}</h4>
            <ul className={styles.menuList}>
              {section.items.map((item) => (
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
          </div>
        ))}
      </div>
      
      <div className={styles.logoutWrapper}>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogoutOutlined />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;

