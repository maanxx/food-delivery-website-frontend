import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tag, Button, Spin, Divider, message, Tabs } from 'antd';
import { ShoppingOutlined, SyncOutlined, ClockCircleOutlined, ShopOutlined, ArrowRightOutlined } from '@ant-design/icons';
import ProfileEmptyState from '../ProfileEmptyState/ProfileEmptyState';
import { fetchMyOrders, selectOrders, selectOrderLoading, selectOrderError } from '@features/order/orderSlice';
import { fetchCartItems } from '@features/cart/cartSlice';
import * as orderService from '@services/orderService';
import styles from './ProfileOrders.module.css';

const STATUS_MAP = {
  pending: { label: "Chờ xử lý", color: "orange" },
  confirmed: { label: "Xác nhận", color: "blue" },
  delivering: { label: "Đang giao", color: "cyan" },
  delivered: { label: "Đã giao", color: "green" },
  cancelled: { label: "Đã hủy", color: "red" },
};

const getStatusInfo = (status) => {
  const key = status?.toLowerCase() || 'pending';
  return STATUS_MAP[key] || { label: status, color: 'default' };
};

const ProfileOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);
  const [activeStatus, setActiveStatus] = useState('all');

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const handleReorder = async (orderId) => {
    try {
      const response = await orderService.reorder(orderId);
      if (response.success) {
        const { added, skipped } = response.data;
        if (added.length > 0) {
          message.success(`Đã thêm ${added.length} món vào giỏ hàng!`);
          dispatch(fetchCartItems());
        }
        if (skipped.length > 0) {
          message.warning(`${skipped.length} món không khả dụng và bị bỏ qua.`);
        }
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Lỗi khi đặt lại hàng');
    }
  };

  const filterOrders = (status) => {
    if (status === 'all') return orders;
    if (status === 'ongoing') return orders.filter(o => ['pending', 'confirmed', 'delivering'].includes(o.status?.toLowerCase()));
    if (status === 'completed') return orders.filter(o => o.status?.toLowerCase() === 'delivered');
    if (status === 'cancelled') return orders.filter(o => o.status?.toLowerCase() === 'cancelled');
    return orders;
  };

  if (loading && orders.length === 0) {
    return <div className={styles.loader}><Spin size="large" tip="Đang tải đơn hàng..." /></div>;
  }

  const renderOrderList = (status) => {
    const filtered = filterOrders(status);
    
    if (filtered.length === 0) {
      return (
        <ProfileEmptyState 
          title="Không tìm thấy đơn hàng" 
          description={status === 'all' ? "Bạn chưa thực hiện đơn hàng nào." : `Bạn không có đơn hàng nào ở trạng thái này.`} 
          buttonText="Khám phá menu" 
          onAction={() => window.location.href = '/menu'}
          icon={ShoppingOutlined}
        />
      );
    }

    return (
      <div className={styles.list}>
        {filtered.map(order => {
          const statusInfo = getStatusInfo(order.status);
          return (
            <div key={order.order_id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.brandInfo}>
                  <div className={styles.brandIcon}><ShopOutlined /></div>
                  <div>
                    <h3 className={styles.restaurantName}>{order.brand || "Eatsy"}</h3>
                    <div className={styles.metaContainer}>
                      <span className={styles.orderIdText}>#{order.order_id.slice(-8).toUpperCase()}</span>
                      <span className={styles.dot}>•</span>
                      <span className={styles.orderMeta}>
                        <ClockCircleOutlined /> {new Date(order.date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.statusSection}>
                  <Tag color={statusInfo.color} className={styles.statusTag}>{statusInfo.label}</Tag>
                </div>
              </div>

              <Divider className={styles.divider} />

              <div className={styles.itemsList}>
                {order.items.slice(0, 2).map((item, index) => (
                  <div key={index} className={styles.itemRow}>
                    <span className={styles.itemName}>{item.quantity}x {item.name}</span>
                    <span className={styles.itemPrice}>{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className={styles.moreItems}>và {order.items.length - 2} món khác...</p>
                )}
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.totalBlock}>
                  <span className={styles.totalLabel}>Tổng thanh toán</span>
                  <span className={styles.totalAmount}>{order.total_amount.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className={styles.actionButtons}>
                  <Button 
                    type="primary" 
                    icon={<SyncOutlined />} 
                    onClick={() => handleReorder(order.order_id)}
                    className={styles.reorderBtn}
                  >
                    Đặt lại
                  </Button>
                  <Button className={styles.detailBtn}>Chi tiết <ArrowRightOutlined /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const tabItems = [
    { key: 'all', label: 'Tất cả' },
    { key: 'ongoing', label: 'Đang đến' },
    { key: 'completed', label: 'Đã hoàn tất' },
    { key: 'cancelled', label: 'Đã hủy' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Lịch sử đơn hàng</h2>
        <p className={styles.subtitle}>Quản lý và xem lại các đơn hàng của bạn</p>
      </div>

      <Tabs 
        defaultActiveKey="all" 
        onChange={setActiveStatus}
        items={tabItems.map(tab => ({
          ...tab,
          children: renderOrderList(tab.key)
        }))}
        className={styles.tabs}
      />
    </div>
  );
};

export default ProfileOrders;

