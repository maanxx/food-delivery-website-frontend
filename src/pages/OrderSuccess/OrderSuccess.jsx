import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { CheckCircleOutline, ShoppingBagOutlined, HomeOutlined } from "@mui/icons-material";
import { message, Spin } from "antd";

import styles from "./OrderSuccess.module.css";
import profileService from "@services/profileService";
import { seedOrder, selectOrderStatus } from "@features/order/orderSlice";

const SUCCESS_TEXT = {
  TITLE: "Đặt hàng thành công!",
  SUBTITLE: "Cảm ơn bạn đã tin tưởng Eatsy. Đơn hàng của bạn đang được xử lý.",
  ORDER_ID: "Mã đơn hàng",
  TOTAL: "Tổng thanh toán",
  STATUS: "Trạng thái",
  BRAND: "Thương hiệu",
  ESTIMATED: "Thời gian dự kiến",
  ITEMS: "Sản phẩm",
  VIEW_ORDERS: "Xem đơn hàng",
  CONTINUE: "Tiếp tục mua sắm",
  LOADING: "Đang tải thông tin đơn hàng...",
  ERROR_NOT_FOUND: "Không tìm thấy thông tin đơn hàng hoặc bạn không có quyền truy cập.",
};

const STATUS_MAP = {
  pending: { label: "Chờ xử lý", color: "#faad14" },
  confirmed: { label: "Đã xác nhận", color: "#1890ff" },
  delivering: { label: "Đang giao hàng", color: "#13c2c2" },
  delivered: { label: "Đã giao hàng", color: "#52c41a" },
  cancelled: { label: "Đã hủy", color: "#f5222d" },
};

function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live status from Redux (updated via socket in real-time)
  const liveStatus = useSelector(selectOrderStatus(orderId));

  const fetchOrderDetails = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await profileService.getOrderDetails(id);
      if (res.data.success) {
        setOrder(res.data.data);
        // Hydrate the orderSlice so selectors work immediately
        dispatch(seedOrder(res.data.data));
      } else {
        throw new Error("Failed to load");
      }
    } catch (error) {
      message.error(SUCCESS_TEXT.ERROR_NOT_FOUND);
      navigate("/profile/orders", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate, dispatch]);

  useEffect(() => {
    if (!orderId) {
      message.warning("Thiếu mã đơn hàng");
      navigate("/", { replace: true });
      return;
    }
    fetchOrderDetails(orderId);
  }, [orderId, fetchOrderDetails, navigate]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.successCard}>
          <Spin size="large" />
          <p style={{ marginTop: "20px", color: "#666" }}>{SUCCESS_TEXT.LOADING}</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  // Use live status from Redux (socket) if available, fallback to API-fetched status
  const displayStatus = liveStatus || order.status;
  const currentStatus = STATUS_MAP[displayStatus.toLowerCase()] || STATUS_MAP.pending;

  return (
    <div className={styles.wrapper}>
      <div className={styles.successCard}>
        <div className={styles.iconWrapper}>
          <CheckCircleOutline fontSize="inherit" />
        </div>
        
        <h1 className={styles.title}>{SUCCESS_TEXT.TITLE}</h1>
        <p className={styles.description}>{SUCCESS_TEXT.SUBTITLE}</p>

        <div className={styles.orderDetailGrid}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{SUCCESS_TEXT.ORDER_ID}</span>
            <span className={`${styles.detailValue} ${styles.orderId}`}>{order.order_id}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{SUCCESS_TEXT.BRAND}</span>
            <span className={styles.detailValue}>{order.brand || "Eatsy"}</span>
          </div>
          
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{SUCCESS_TEXT.STATUS}</span>
            <span 
              className={styles.statusTag} 
              style={{ backgroundColor: currentStatus.color + "22", color: currentStatus.color }}
            >
              {currentStatus.label}
            </span>
          </div>

          {order.estimated_time && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{SUCCESS_TEXT.ESTIMATED}</span>
              <span className={styles.detailValue}>~{order.estimated_time} phút</span>
            </div>
          )}

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{SUCCESS_TEXT.TOTAL}</span>
            <span className={styles.detailValue} style={{ color: "var(--primaryColor)", fontSize: "1.2rem" }}>
              {order.total_amount.toLocaleString("vi-VN")} ₫
            </span>
          </div>

          <div className={styles.itemList}>
            <div className={styles.detailLabel} style={{ marginBottom: "8px" }}>{SUCCESS_TEXT.ITEMS}</div>
            {order.items.map((item, idx) => (
              <div key={idx} className={styles.item}>
                <span>{item.name} x{item.quantity}</span>
                <span>{(item.price * item.quantity).toLocaleString("vi-VN")} ₫</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.viewOrdersBtn} onClick={() => navigate("/profile/orders")}>
            <ShoppingBagOutlined style={{ marginRight: "8px", verticalAlign: "middle" }} />
            {SUCCESS_TEXT.VIEW_ORDERS}
          </button>
          <button className={styles.homeBtn} onClick={() => navigate("/")}>
            <HomeOutlined style={{ marginRight: "8px", verticalAlign: "middle" }} />
            {SUCCESS_TEXT.CONTINUE}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;

