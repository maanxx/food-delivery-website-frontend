import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tag, Button, Spin, Divider, message } from 'antd';
import { ShoppingOutlined, SyncOutlined, ClockCircleOutlined, ShopOutlined } from '@ant-design/icons';
import ProfileEmptyState from '../ProfileEmptyState/ProfileEmptyState';
import profileService from '@services/profileService';
import styles from './ProfileOrders.module.css';
import { seedOrders } from '@features/order/orderSlice';

const ProfileOrders = () => {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get live order data from Redux
  const liveOrdersByStatus = useSelector((state) => state.order.byId);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileService.getOrders();
      const fetchedOrders = response.data?.data || [];
      setOrders(fetchedOrders);
      
      // Seed our tracking slice
      dispatch(seedOrders(fetchedOrders));
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Could not load order history. Please try again later.');
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

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

  const handleReorder = async (orderId) => {
    try {
      const response = await profileService.reorder(orderId);
      const { added, skipped } = response.data.data;
      
      if (added.length > 0) {
        message.success(`Added ${added.length} items to cart!`);
      }
      
      if (skipped.length > 0) {
        message.warning(`${skipped.length} items were unavailable and skipped.`);
      }
      
      if (added.length === 0 && skipped.length === 0) {
        message.info('No items could be added to cart.');
      }
    } catch (err) {
      console.error('Reorder error:', err);
      message.error(err.response?.data?.message || 'Failed to reorder items');
    }
  };

  if (loading) {
    return <div className={styles.loader}><Spin size="large" tip="Loading orders..." /></div>;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ProfileEmptyState 
          title="Oops!" 
          description={error}
          buttonText="Retry" 
          onAction={fetchOrders}
          icon={ShoppingOutlined}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Order History</h2>
        <p className={styles.subtitle}>View your past orders and their status</p>
      </div>

      <div className={styles.list}>
        {orders.length === 0 ? (
          <ProfileEmptyState 
            title="No Orders Yet" 
            description="Looks like you haven't made your first delivery order yet." 
            buttonText="Browse Restaurants" 
            onAction={() => window.location.href = '/menu'}
            icon={ShoppingOutlined}
          />
        ) : (
          orders.map(order => {
            const liveData = liveOrdersByStatus[order.order_id] || {};
            const displayStatus = liveData.status || order.status;
            const displayBrand = liveData.brand || order.brand || "Eatsy";
            const estTime = liveData.estimated_time || order.estimated_time;
            const statusInfo = getStatusInfo(displayStatus);

            return (
              <div key={order.order_id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.brandInfo}>
                    <div className={styles.brandIcon}>
                      <ShopOutlined />
                    </div>
                    <div>
                      <h3 className={styles.restaurantName}>{displayBrand}</h3>
                      <div className={styles.metaContainer}>
                        <p className={styles.orderMeta}>
                          <ClockCircleOutlined /> {new Date(order.date).toLocaleDateString()}
                        </p>
                        <span className={styles.orderIdText}>#{order.order_id.slice(-8).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.statusSection}>
                    {estTime && displayStatus !== 'delivered' && displayStatus !== 'cancelled' && (
                      <span className={styles.estTime}>~{estTime} mins</span>
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
                    <span className={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()} VND</span>
                  </div>
                ))}
              </div>

              <Divider className={styles.divider} />

              <div className={styles.cardFooter}>
                <div className={styles.totalBlock}>
                  <span>Total Amount</span>
                  <span className={styles.totalAmount}>{order.total_amount.toLocaleString()} VND</span>
                </div>
                <Button 
                  type="primary" 
                  icon={<SyncOutlined />} 
                  onClick={() => handleReorder(order.order_id)}
                  className={styles.reorderBtn}
                >
                  Reorder
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
