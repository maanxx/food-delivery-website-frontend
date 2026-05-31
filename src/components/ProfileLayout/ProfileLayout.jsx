import React, { useState } from 'react';
import { Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import ProfileSidebar from '../ProfileSidebar/ProfileSidebar';
import ProfileHeader from '../ProfileHeader/ProfileHeader';
import styles from './ProfileLayout.module.css';

const ProfileLayout = ({ children, activeTab, onTabSelect, profileData }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const handleTabSelect = (tab) => {
    onTabSelect(tab);
    setDrawerVisible(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* Mobile Hamburger Menu */}
        <div className={styles.hamburgerBtn}>
          <Button type="primary" icon={<MenuOutlined />} onClick={toggleDrawer}>
            Menu cá nhân
          </Button>
        </div>

        {/* Desktop Sidebar */}
        <div className={styles.sidebarWrapper}>
          <ProfileSidebar 
            activeTab={activeTab} 
            onTabSelect={handleTabSelect} 
          />
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title="Tài khoản của tôi"
          placement="left"
          closable={true}
          onClose={toggleDrawer}
          open={drawerVisible}
          width={280}
        >
          <ProfileSidebar 
            activeTab={activeTab} 
            onTabSelect={handleTabSelect} 
            isMobile
          />
        </Drawer>

        {/* Main Content Area */}
        <div className={styles.contentWrapper}>
          <ProfileHeader profile={profileData} />
          {children}
        </div>
      </div>
    </div>
  );
};


export default ProfileLayout;
