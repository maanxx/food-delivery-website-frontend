import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tag, Button, Spin, Divider, message, Modal } from 'antd';
import { ShoppingOutlined, SyncOutlined, ClockCircleOutlined, ShopOutlined, EyeOutlined } from '@ant-design/icons';
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('vi-VN');
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
                    <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)} ₫</span>
                  </div>
                ))}
              </div>

              <Divider className={styles.divider} />

              <div className={styles.cardFooter}>
                <div className={styles.totalBlock}>
                  <span>Tổng tiền</span>
                  <span className={styles.totalAmount}>{formatPrice(order.total_amount)} ₫</span>
                </div>
                <div className={styles.actionButtons}>
                  <Button 
                    icon={<EyeOutlined />} 
                    onClick={() => handleViewDetails(order)}
                    className={styles.detailBtn}
                  >
                    Chi tiết
                  </Button>
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
            </div>
          );
        })
      )}
      </div>

      {/* Modal Chi tiết đơn hàng */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <ShopOutlined /> Chi tiết đơn hàng #{selectedOrder?.order_id.slice(-8).toUpperCase()}
          </div>
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>,
          <Button 
            key="reorder" 
            type="primary" 
            icon={<SyncOutlined />}
            onClick={() => {
              handleReorder(selectedOrder.order_id);
              handleCloseModal();
            }}
          >
            Đặt lại
          </Button>
        ]}
        width={600}
        className={styles.orderModal}
      >
        {selectedOrder && (
          <div className={styles.modalContent}>
            {/* Thông tin đơn hàng */}
            <div className={styles.modalSection}>
              <h4>Thông tin đơn hàng</h4>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Mã đơn hàng:</span>
                <span className={styles.infoValue}>#{selectedOrder.order_id.slice(-8).toUpperCase()}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Ngày đặt:</span>
                <span className={styles.infoValue}>
                  {new Date(selectedOrder.date).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Trạng thái:</span>
                <Tag color={getStatusInfo(selectedOrder.status).color}>
                  {getStatusInfo(selectedOrder.status).label}
                </Tag>
              </div>
              {selectedOrder.estimated_time && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Thời gian dự kiến:</span>
                  <span className={styles.infoValue}>~{selectedOrder.estimated_time} phút</span>
                </div>
              )}
              {selectedOrder.payment_method && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Phương thức thanh toán:</span>
                  <span className={styles.infoValue}>
                    {selectedOrder.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                  </span>
                </div>
              )}
            </div>

            <Divider />

            {/* Địa chỉ giao hàng */}
            {selectedOrder.delivery_address && (
              <>
                <div className={styles.modalSection}>
                  <h4>Địa chỉ giao hàng</h4>
                  <p className={styles.addressText}>{selectedOrder.delivery_address}</p>
                </div>
                <Divider />
              </>
            )}

            {/* Danh sách món ăn */}
            <div className={styles.modalSection}>
              <h4>Danh sách món ăn</h4>
              <div className={styles.modalItemsList}>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className={styles.modalItemRow}>
                    {item.thumbnail && (
                      <img 
                        src={item.thumbnail} 
                        alt={item.name}
                        className={styles.modalItemImage}
                      />
                    )}
                    <div className={styles.modalItemInfo}>
                      <span className={styles.modalItemQty}>{item.quantity}x</span>
                      <span className={styles.modalItemName}>{item.name}</span>
                    </div>
                    <span className={styles.modalItemPrice}>
                      {formatPrice(item.price * item.quantity)} ₫
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Divider />

            {/* Tổng tiền */}
            <div className={styles.modalSection}>
              <div className={styles.modalSummary}>
                <div className={styles.summaryRow}>
                  <span>Tạm tính:</span>
                  <span>{formatPrice(Number(selectedOrder.total_amount) + Number(selectedOrder.discount_amount || 0))} ₫</span>
                </div>
                {selectedOrder.voucher_code && Number(selectedOrder.discount_amount) > 0 && (
                  <div className={styles.summaryRow}>
                    <span>Giảm giá ({selectedOrder.voucher_code}):</span>
                    <span className={styles.discountText}>-{formatPrice(selectedOrder.discount_amount)} ₫</span>
                  </div>
                )}
                <Divider className={styles.summaryDivider} />
                <div className={styles.summaryRow + ' ' + styles.totalRow}>
                  <span>Tổng cộng:</span>
                  <span className={styles.modalTotalAmount}>{formatPrice(selectedOrder.total_amount)} ₫</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProfileOrders;
