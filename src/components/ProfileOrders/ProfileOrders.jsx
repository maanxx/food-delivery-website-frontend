import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tag, Button, Spin, Divider, message } from 'antd';
import { ShoppingOutlined, SyncOutlined, ClockCircleOutlined, ShopOutlined } from '@ant-design/icons';
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
      console.error('Reorder error:', err);
      message.error(err.response?.data?.message || 'Lỗi khi đặt lại hàng');
    }
  };

  if (loading && orders.length === 0) {
    return <div className={styles.loader}><Spin size="large" tip="Đang tải đơn hàng..." /></div>;
  }

  if (error && orders.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <ProfileEmptyState 
          title="Oops!" 
          description={error}
          buttonText="Thử lại" 
          onAction={() => dispatch(fetchMyOrders())}
          icon={ShoppingOutlined}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Lịch sử đơn hàng</h2>
        <p className={styles.subtitle}>Xem các đơn hàng đã đặt và trạng thái của chúng</p>
      </div>

      <div className={styles.list}>
        {orders.length === 0 ? (
          <ProfileEmptyState 
            title="Chưa có đơn hàng" 
            description="Bạn chưa thực hiện đơn hàng nào." 
            buttonText="Khám phá ngay" 
            onAction={() => window.location.href = '/menu'}
            icon={ShoppingOutlined}
          />
        ) : (
          orders.map(order => {
            const statusInfo = getStatusInfo(order.status);

            return (
              <div key={order.order_id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.brandInfo}>
                    <div className={styles.brandIcon}>
                      <ShopOutlined />
                    </div>
                    <div>
                      <h3 className={styles.restaurantName}>{order.brand || "Eatsy"}</h3>
                      <div className={styles.metaContainer}>
                        <p className={styles.orderMeta}>
                          <ClockCircleOutlined /> {new Date(order.date).toLocaleDateString('vi-VN')}
                        </p>
                        <span className={styles.orderIdText}>#{order.order_id.slice(-8).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.statusSection}>
                    {order.estimated_time && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <span className={styles.estTime}>~{order.estimated_time} phút</span>
                    )}
                    <Tag color={statusInfo.color} className={styles.statusTag}>
                      {statusInfo.label}
                    </Tag>
                  </div>
                </div>

              <Divider className={styles.divider} />

              <div className={styles.itemsList}>
                {order.items.map((item, index) => (
                  <div key={index} className={styles.itemRow}>
                    <span className={styles.itemQty}>{item.quantity}x</span>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemPrice}>{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</span>
                  </div>
                ))}
              </div>

              <Divider className={styles.divider} />

              <div className={styles.cardFooter}>
                <div className={styles.totalBlock}>
                  <span>Tổng tiền</span>
                  <span className={styles.totalAmount}>{order.total_amount.toLocaleString('vi-VN')} ₫</span>
                </div>
                <Button 
                  type="primary" 
                  icon={<SyncOutlined />} 
                  onClick={() => handleReorder(order.order_id)}
                  className={styles.reorderBtn}
                >
                  Đặt lại
                </Button>
              </div>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
};

export default ProfileOrders;
