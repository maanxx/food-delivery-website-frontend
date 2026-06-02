import React, { useState } from "react";
import { Layout, Menu, Button, Dropdown, Avatar } from "antd";
import { Outlet } from "react-router-dom";
import {
  BarChartOutlined,
  ShoppingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  FileTextOutlined,
  BgColorsOutlined,
  WechatOutlined,
  DollarOutlined,
  CommentOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getFirstLetterOfEachWord } from "@helpers/stringHelper";
import styles from "./AdminLayout.module.css";

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.adminAuth.user);

  const isFullBleedPage = [
    "/admin/ai-chat",
    "/admin/support",
    "/admin/chat"
  ].some(path => location.pathname.startsWith(path));

  const menuItems = [
    {
      key: "/admin",
      icon: <BarChartOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/admin"),
    },
    {
      key: "/admin/chat",
      icon: <WechatOutlined />,
      label: "Chat",
      onClick: () => navigate("/admin/chat"),
    },
    {
      key: "/admin/support",
      icon: <CommentOutlined />,
      label: "Support Chat",
      onClick: () => navigate("/admin/support"),
    },
    {
      key: "/admin/ai-chat",
      icon: <RobotOutlined />,
      label: "AI Assistant",
      onClick: () => navigate("/admin/ai-chat"),
    },
    {
      key: "/admin/orders",
      icon: <ShoppingOutlined />,
      label: "Orders",
      onClick: () => navigate("/admin/orders"),
    },
    {
      key: "/admin/payments",
      icon: <DollarOutlined />,
      label: "Payments",
      onClick: () => navigate("/admin/payments"),
    },
    {
      key: "/admin/employees",
      icon: <UserOutlined />,
      label: "Employees",
      onClick: () => navigate("/admin/employees"),
    },
    {
      key: "/admin/products",
      icon: <BgColorsOutlined />,
      label: "Products",
      onClick: () => navigate("/admin/products"),
    },
    {
      key: "/admin/reports",
      icon: <FileTextOutlined />,
      label: "Reports",
      onClick: () => navigate("/admin/reports"),
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/admin/settings"),
    },
  ];

  const userMenu = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: () => {
        // Logout logic
        navigate("/login");
      },
    },
  ];

  return (
    <Layout className={styles.adminLayout}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className={styles.sidebar}
        theme="dark"
        width={250}
      >
        <div className={styles.logo}>
          <span style={{ fontSize: 22 }}>🍊</span>
          {!collapsed && <span className={styles.logoText}>Eatsy Admin</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          className={styles.menu}
          selectedKeys={[window.location.pathname]}
        />
      </Sider>

      {/* Main Content */}
      <Layout className={styles.mainLayout}>
        {/* Header */}
        <Header className={styles.header}>
          <div className={styles.headerContent}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={styles.toggleBtn}
            />
          </div>

          <div className={styles.headerRight}>
            <Dropdown menu={{ items: userMenu }} trigger={["click"]}>
              <div className={styles.userSection}>
                <Avatar
                  size={36}
                  src={user?.avatar_path || null}
                  className={styles.avatar}
                >
                  {!user?.avatar_path && user?.fullname
                    ? getFirstLetterOfEachWord(user.fullname).children
                    : !user?.avatar_path && user?.username
                      ? getFirstLetterOfEachWord(user.username).children
                      : "A"}
                </Avatar>
                <span className={styles.userName}>
                  {user?.fullname || user?.username || "Admin User"}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content Area */}
        <Content className={isFullBleedPage ? styles.contentFullBleed : styles.content}>{children || <Outlet />}</Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
