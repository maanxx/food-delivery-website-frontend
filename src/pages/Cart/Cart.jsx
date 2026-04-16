import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container, Checkbox } from "@mui/material";
import { ShoppingBasketOutlined, DeleteSweepOutlined } from "@mui/icons-material";
import { message } from "antd";

import styles from "./Cart.module.css";
import { fetchCartItems, removeItemFromCart, clearCart } from "@features/cart/cartSlice";
import { checkVoucher } from "@services/voucherService";
import { CartItemCard, ProfileEmptyState } from "@components/index";

const CART_TEXT = {
  TITLE: "Giỏ hàng của bạn",
  ORDER_SUMMARY: "Chi tiết đơn hàng",
  SELECTED_ITEMS: "Đã chọn",
  TOTAL_PAYMENT: "Tổng thanh toán",
  CHECKOUT: "Thanh toán",
  EMPTY_CART: "Giỏ hàng của bạn còn trống",
  BACK_HOME: "Quay lại trang chủ",
  BULK_DELETE: "Xóa mục đã chọn",
  SELECT_ALL: "Chọn tất cả",
  VOUCHER_PLACEHOLDER: "Nhập mã khuyến mãi",
  APPLY: "Áp dụng",
  DISCOUNT: "Giảm giá",
  WARNING_SELECT: "Vui lòng chọn món để tiếp tục",
  WARNING_INVALID: "Vui lòng xóa các món không khả dụng để tiếp tục",
};

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items: cartItems, status, totalAmount: backendTotal } = useSelector((state) => state.cart);
  const loading = status === 'loading';

  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState(null);

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  // Handle auto-selection of all items by default
  useEffect(() => {
    if (cartItems.length > 0 && selectedItemIds.length === 0) {
      setSelectedItemIds(cartItems.map(i => i.cart_item_id));
    }
  }, [cartItems, selectedItemIds.length]);

  // Sync selected items if they are removed from cart
  useEffect(() => {
    const existingIds = cartItems.map(i => i.cart_item_id);
    setSelectedItemIds(prev => prev.filter(id => existingIds.includes(id)));
  }, [cartItems]);

  const selectedItems = useMemo(() => 
    (cartItems || []).filter(item => selectedItemIds.includes(item.cart_item_id)),
  [cartItems, selectedItemIds]);

  const selectedTotal = useMemo(() => 
    selectedItems.reduce((acc, cur) => acc + Number(cur.price_snapshot) * cur.quantity, 0),
  [selectedItems]);

  const hasInvalidSelectedItems = useMemo(() => 
    selectedItems.some(item => !item.is_available || !item.has_stock),
  [selectedItems]);

  const discountAmount = useMemo(() => {
    if (!discountInfo || selectedTotal === 0) return 0;
    const { discount_type, discount_value } = discountInfo;
    if (discount_type === "Percentage") return (selectedTotal * discount_value);
    return Math.min(discount_value, selectedTotal);
  }, [discountInfo, selectedTotal]);

  const finalTotal = Math.max(0, selectedTotal - discountAmount);

  const handleSelectItem = useCallback((id) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItemIds.length === cartItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds((cartItems || []).map(item => item.cart_item_id));
    }
  }, [selectedItemIds.length, cartItems]);

  const handleDeleteItem = useCallback(async (itemId) => {
    dispatch(removeItemFromCart(itemId));
  }, [dispatch]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedItemIds.length === 0) return;
    if (selectedItemIds.length === cartItems.length) {
      dispatch(clearCart());
    } else {
      // If partially selected, remove them one by one (or implement bulk remove in backend)
      await Promise.all(selectedItemIds.map(id => dispatch(removeItemFromCart(id))));
    }
    setSelectedItemIds([]);
  }, [selectedItemIds, cartItems.length, dispatch]);

  const handleApplyVoucher = useCallback(async () => {
    if (!voucherCode) return;
    try {
      const res = await checkVoucher(voucherCode);
      if (res.status === "OK") {
        setDiscountInfo(res.voucher);
        message.success("Áp dụng mã thành công!");
      } else {
        setDiscountInfo(null);
        message.error("Mã không hợp lệ hoặc đã hết hạn");
      }
    } catch (error) {
      message.error("Lỗi khi kiểm tra mã");
    }
  }, [voucherCode]);

  const handleCheckout = useCallback(() => {
    if (selectedItemIds.length === 0) {
      message.warning(CART_TEXT.WARNING_SELECT);
      return;
    }
    if (hasInvalidSelectedItems) {
      message.error(CART_TEXT.WARNING_INVALID);
      return;
    }
    if (finalTotal === 0) return;
    
    navigate("/checkout", { 
      state: { 
        items: selectedItems,
        total: finalTotal,
        discount: discountAmount,
        subtotal: selectedTotal
      } 
    });
  }, [selectedItemIds.length, hasInvalidSelectedItems, finalTotal, navigate, selectedItems, discountAmount, selectedTotal]);

  if (loading && cartItems.length === 0) {
    return (
      <div className={styles.wrapper}>
        <Container maxWidth="lg">
          <div style={{ textAlign: "center", padding: "100px" }}>Đang tải giỏ hàng...</div>
        </Container>
      </div>
    );
  }

  const isCheckoutDisabled = selectedItemIds.length === 0 || finalTotal === 0 || hasInvalidSelectedItems || loading;

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{CART_TEXT.TITLE}</div>
      <Container maxWidth="lg">
        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <ProfileEmptyState 
              title={CART_TEXT.EMPTY_CART}
              description="Hãy thêm món ăn yêu thích của bạn vào giỏ hàng ngay."
              buttonText={CART_TEXT.BACK_HOME}
              onAction={() => navigate("/")}
              icon={ShoppingBasketOutlined}
            />
          </div>
        ) : (
          <div className={styles.cartGrid}>
            <div className={styles.itemList}>
              <div className={styles.listHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Checkbox 
                    checked={selectedItemIds.length === cartItems.length && cartItems.length > 0}
                    indeterminate={selectedItemIds.length > 0 && selectedItemIds.length < cartItems.length}
                    onChange={handleSelectAll}
                    sx={{ color: 'var(--primaryColor)', '&.Mui-checked': { color: 'var(--primaryColor)' } }}
                  />
                  <span>{CART_TEXT.SELECT_ALL} ({cartItems.length})</span>
                </div>
                
                {selectedItemIds.length > 0 && (
                  <button className={styles.bulkDeleteBtn} onClick={handleBulkDelete} style={{ color: "#ff4d4f", display: "flex", alignItems: "center", gap: "4px" }}>
                    <DeleteSweepOutlined />
                    {CART_TEXT.BULK_DELETE} ({selectedItemIds.length})
                  </button>
                )}
              </div>

              {cartItems.map((item) => (
                <CartItemCard 
                  key={item.cart_item_id}
                  item={item}
                  isSelected={selectedItemIds.includes(item.cart_item_id)}
                  onSelect={handleSelectItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>

            <div className={styles.orderSummary}>
              <h2 className={styles.summaryTitle}>{CART_TEXT.ORDER_SUMMARY}</h2>
              
              <div className={styles.summaryRow}>
                <span>{CART_TEXT.SELECTED_ITEMS}</span>
                <span>{selectedItemIds.length}</span>
              </div>
              
              <div className={styles.summaryRow}>
                <span>Tạm tính</span>
                <span>{selectedTotal.toLocaleString("vi-VN")} ₫</span>
              </div>

              {discountAmount > 0 && (
                <div className={styles.discountRow}>
                  <span>{CART_TEXT.DISCOUNT}</span>
                  <span>-{discountAmount.toLocaleString("vi-VN")} ₫</span>
                </div>
              )}

              <div className={styles.voucherSection}>
                <div className={styles.voucherInputGroup}>
                  <input 
                    type="text" 
                    className={styles.voucherInput}
                    placeholder={CART_TEXT.VOUCHER_PLACEHOLDER}
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                  />
                  <button className={styles.applyBtn} onClick={handleApplyVoucher}>
                    {CART_TEXT.APPLY}
                  </button>
                </div>
              </div>

              <div className={styles.totalRow}>
                <span>{CART_TEXT.TOTAL_PAYMENT}</span>
                <span className={styles.totalAmount}>
                  {finalTotal.toLocaleString("vi-VN")} ₫
                </span>
              </div>

              <button 
                className={styles.checkoutBtn}
                onClick={handleCheckout}
                disabled={isCheckoutDisabled}
              >
                {loading ? "Đang xử lý..." : CART_TEXT.CHECKOUT}
              </button>
              
              {hasInvalidSelectedItems && (
                <p className={styles.errorText} style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "8px" }}>
                  {CART_TEXT.WARNING_INVALID}
                </p>
              )}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

export default Cart;
