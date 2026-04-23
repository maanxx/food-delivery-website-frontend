import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container } from "@mui/material";
import { 
  LocationOnOutlined, 
  PaymentsOutlined, 
  DescriptionOutlined,
  ShoppingBagOutlined
} from "@mui/icons-material";
import { message } from "antd";

import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "@features/order/orderSlice";
import { resetCartState } from "@features/cart/cartSlice";

import styles from "./Checkout.module.css";
import profileService from "@services/profileService";

const CHECKOUT_TEXT = {
  TITLE: "Thanh toán",
  ADDRESS_SECTION: "Địa chỉ giao hàng",
  PAYMENT_SECTION: "Phương thức thanh toán",
  NOTE_SECTION: "Ghi chú đơn hàng",
  SUMMARY_SECTION: "Tóm tắt đơn hàng",
  PLACE_ORDER: "Đặt hàng",
  COD: "Thanh toán khi nhận hàng (COD)",
  EMPTY_ADDRESS: "Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ trong trang Cá nhân.",
  GO_TO_PROFILE: "Đi đến Cá nhân",
};

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const checkoutData = location.state;
  const { loading: orderLoading } = useSelector((state) => state.order);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [note, setNote] = useState("");

  // Redirect if no data from cart
  useEffect(() => {
    if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
      message.warning("Dữ liệu thanh toán không hợp lệ");
      navigate("/cart");
    }
  }, [checkoutData, navigate]);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await profileService.getAddresses();
      const data = res.data.data || [];
      setAddresses(data);
      
      // Auto select default address (camelCase from backend)
      const defaultAddr = data.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.addressId);
      } else if (data.length > 0) {
        setSelectedAddressId(data[0].addressId);
      }
    } catch (error) {
      message.error("Lỗi khi tải địa chỉ");
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddressId) {
      message.warning("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    try {
      const orderPayload = {
        address_id: selectedAddressId,
        note: note,
        payment_method: "COD"
      };

      const resultAction = await dispatch(createOrder(orderPayload));
      
      if (createOrder.fulfilled.match(resultAction)) {
        const orderId = resultAction.payload.order_id;
        message.success("Đặt hàng thành công!");
        dispatch(resetCartState());
        navigate(`/checkout/success?orderId=${orderId}`);
      } else {
        message.error(resultAction.payload || "Đặt hàng thất bại");
      }
    } catch (error) {
      console.error("Order error:", error);
      message.error("Lỗi hệ thống khi đặt hàng");
    }
  }, [selectedAddressId, note, navigate, dispatch]);

  const orderSummaryList = useMemo(() => (
    <div className={styles.summaryList}>
      {checkoutData.items.map((item) => (
        <div key={item.dish_id} className={styles.summaryItem}>
          <img src={item.thumbnail_path} alt={item.name} className={styles.itemImage} />
          <div className={styles.itemInfo}>
            <span className={styles.itemName}>{item.name}</span>
            <span className={styles.itemMeta}>Số lượng: {item.quantity}</span>
          </div>
          <span className={styles.itemPrice}>
            {(Number(item.price_snapshot) * item.quantity).toLocaleString("vi-VN")} ₫
          </span>
        </div>
      ))}
    </div>
  ), [checkoutData.items]);

  if (!checkoutData) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{CHECKOUT_TEXT.TITLE}</div>
      <Container maxWidth="lg">
        <div className={styles.checkoutGrid}>
          <div className={styles.mainContent}>
            
            {/* Address Section */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <LocationOnOutlined color="primary" />
                {CHECKOUT_TEXT.ADDRESS_SECTION}
              </h2>
              
              {addresses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <p>{CHECKOUT_TEXT.EMPTY_ADDRESS}</p>
                  <button 
                    className={styles.placeOrderBtn} 
                    style={{ width: "auto", padding: "10px 20px" }}
                    onClick={() => navigate("/profile")}
                  >
                    {CHECKOUT_TEXT.GO_TO_PROFILE}
                  </button>
                </div>
              ) : (
                <div className={styles.addressList}>
                  {addresses.map((addr) => (
                    <div 
                      key={addr.addressId}
                      className={`${styles.addressCard} ${selectedAddressId === addr.addressId ? styles.addressCardActive : ""}`}
                      onClick={() => setSelectedAddressId(addr.addressId)}
                    >
                      <div className={styles.addressHeader}>
                        <span className={styles.addressLabel}>{addr.label || "Home"}</span>
                        {addr.isDefault && <span className={styles.defaultBadge}>Mặc định</span>}
                      </div>
                      <div className={styles.addressContent}>
                        {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <PaymentsOutlined color="primary" />
                {CHECKOUT_TEXT.PAYMENT_SECTION}
              </h2>
              <div className={styles.paymentMethods}>
                <div className={`${styles.paymentOption} ${styles.paymentOptionActive}`}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "5px solid var(--primaryColor)" }} />
                  <span>{CHECKOUT_TEXT.COD}</span>
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <DescriptionOutlined color="primary" />
                {CHECKOUT_TEXT.NOTE_SECTION}
              </h2>
              <textarea 
                className={styles.notesArea}
                placeholder="Ghi chú cho tài xế (ví dụ: tầng 3, cửa màu xanh...)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className={styles.sidebar}>
            <div className={styles.summaryCard}>
              <h2 className={styles.sectionTitle}>
                <ShoppingBagOutlined color="primary" />
                {CHECKOUT_TEXT.SUMMARY_SECTION}
              </h2>

              {orderSummaryList}

              <div className={styles.totalSection}>
                <div className={styles.summaryRow}>
                  <span>Tạm tính</span>
                  <span>{checkoutData.subtotal?.toLocaleString("vi-VN")} ₫</span>
                </div>
                {checkoutData.discount > 0 && (
                  <div className={styles.summaryRow} style={{ color: "#ff4d4f" }}>
                    <span>Giảm giá</span>
                    <span>-{checkoutData.discount.toLocaleString("vi-VN")} ₫</span>
                  </div>
                )}
                <div className={styles.totalRow}>
                  <span>Tổng cộng</span>
                  <span style={{ color: "var(--primaryColor)" }}>
                    {checkoutData.total.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>

              <button 
                className={styles.placeOrderBtn}
                onClick={handlePlaceOrder}
                disabled={orderLoading || !selectedAddressId}
              >
                {orderLoading ? "Đang xử lý..." : CHECKOUT_TEXT.PLACE_ORDER}
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Checkout;