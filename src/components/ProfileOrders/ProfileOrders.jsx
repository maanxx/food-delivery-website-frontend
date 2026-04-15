import React, { useEffect, useState } from 'react';
import { Tag, Button, Spin, Divider } from 'antd';
import { ShoppingOutlined, SyncOutlined, ClockCircleOutlined } from '@ant-design/icons';
import ProfileEmptyState from '../ProfileEmptyState/ProfileEmptyState';
import styles from './ProfileOrders.module.css';

// Using mock data for now, as order API is not implemented yet.
const MOCK_ORDERS = [
  {
    order_id: 10423,
    date: '2026-04-12T14:30:00Z',
    total_amount: 250000,
    status: 'Delivered',
    restaurant_name: 'Pho 24 - Ben Thanh',
    items: [
      { name: 'Pho Bo Dac Biet', quantity: 2, price: 85000 },
      { name: 'Goi Cuon', quantity: 4, price: 20000 }
    ]
  },
  {
    order_id: 10455,
    date: '2026-04-14T19:00:00Z',
    total_amount: 120000,
    status: 'Processing',
    restaurant_name: 'Banh Mi Huynh Hoa',
    items: [
      { name: 'Banh Mi Thit', quantity: 2, price: 60000 }
    ]
  }
];

const ProfileOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for orders
    setTimeout(() => {
      setOrders(MOCK_ORDERS);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'delivered': return 'green';
      case 'processing': return 'blue';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const handleReorder = (orderId) => {
    // Navigate to cart/checkout and rebuild the order (API integration later)
    console.log(`Reordering ${orderId}`);
  };

  if (loading) {
    return <div className={styles.loader}><Spin size="large" /></div>;
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
            icon={ShoppingOutlined}
          />
        ) : (
          orders.map(order => (
            <div key={order.order_id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.restaurantName}>{order.restaurant_name}</h3>
                  <p className={styles.orderMeta}>
                    Order #{order.order_id} • <ClockCircleOutlined /> {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <Tag color={getStatusColor(order.status)} className={styles.statusTag}>
                  {order.status}
                </Tag>
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
          ))
        )}
      </div>
    </div>
  );
};

export default ProfileOrders;
