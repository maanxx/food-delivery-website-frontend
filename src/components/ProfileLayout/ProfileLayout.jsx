import React, { useState } from 'react';
import { Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import ProfileSidebar from '../ProfileSidebar/ProfileSidebar';
import styles from './ProfileLayout.module.css';

const ProfileLayout = ({ children, activeTab, onTabSelect, profileData }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const handleTabSelect = (tab) => {
    onTabSelect(tab);
    setDrawerVisible(false); // Close drawer on mobile after selection
  };

  return (
    <div className={styles.layout}>
      {/* Mobile Hamburger Menu */}
      <div className={styles.hamburgerBtn}>
        <Button type="default" icon={<MenuOutlined />} onClick={toggleDrawer}>
          Profile Menu
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className={styles.sidebarWrapper}>
        <ProfileSidebar 
          activeTab={activeTab} 
          onTabSelect={handleTabSelect} 
          profileData={profileData} 
        />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="My Profile"
        placement="left"
        closable={true}
        onClose={toggleDrawer}
        open={drawerVisible}
        width={280}
      >
        <ProfileSidebar 
          activeTab={activeTab} 
          onTabSelect={handleTabSelect} 
          profileData={profileData} 
          isMobile
        />
      </Drawer>

      {/* Main Content Area */}
      <div className={styles.contentWrapper}>
        {children}
      </div>
    </div>
  );
};

export default ProfileLayout;
