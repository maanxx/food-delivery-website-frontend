import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container, Checkbox, Autocomplete, TextField } from "@mui/material";
import { ShoppingBasketOutlined, DeleteSweepOutlined } from "@mui/icons-material";
import { message } from "antd";

import styles from "./Cart.module.css";
import { fetchCartItems, removeItemFromCart, clearCart } from "@features/cart/cartSlice";
import { checkVoucher, getVouchers } from "@services/voucherService";
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
  const [savedVouchers, setSavedVouchers] = useState([]);
  const [allVouchers, setAllVouchers] = useState([]);

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  // Load saved vouchers and fetch all vouchers
  useEffect(() => {
    const fetchData = async () => {
      // Get saved voucher codes from localStorage
      const saved = JSON.parse(localStorage.getItem('savedVouchers') || '[]');
      setSavedVouchers(saved);

      // Fetch all vouchers to get details
      try {
        const res = await getVouchers();
        if (res.data.success) {
          setAllVouchers(res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch vouchers:", error);
      }
    };
    fetchData();
  }, []);

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
    selectedItems.reduce((acc, cur) => {
      const itemPrice = cur.priceSnapshot || cur.price_snapshot || 0;
      return acc + Number(itemPrice) * cur.quantity;
    }, 0),
  [selectedItems]);

  // Filter vouchers that user has saved and check if they're applicable
  const savedVoucherOptions = useMemo(() => {
    return allVouchers
      .filter(v => savedVouchers.includes(v.code))
      .map(v => {
        const minPurchase = Number(v.min_purchase) || 0;
        const isApplicable = selectedTotal >= minPurchase;
        return {
          label: `${v.code} - ${v.description}`,
          value: v.code,
          disabled: !isApplicable,
          minPurchase: minPurchase,
          voucher: v
        };
      });
  }, [allVouchers, savedVouchers, selectedTotal]);

  const hasInvalidSelectedItems = useMemo(() => 
    selectedItems.some(item => !item.is_available || !item.has_stock),
  [selectedItems]);

  const discountAmount = useMemo(() => {
    if (!discountInfo || selectedTotal === 0) return 0;
    
    // Re-check min_purchase when selectedTotal changes
    const minPurchase = Number(discountInfo.min_purchase) || 0;
    if (selectedTotal < minPurchase) {
      // Auto-remove voucher if total drops below min_purchase
      setDiscountInfo(null);
      message.warning(`Đơn hàng không đủ ${minPurchase.toLocaleString('vi-VN')}₫ để áp dụng voucher`);
      return 0;
    }
    
    const { discount_type, discount_value } = discountInfo;
    if (discount_type === "Percentage") return (selectedTotal * discount_value);
    return Math.min(discount_value, selectedTotal);
  }, [discountInfo, selectedTotal]);

  const finalTotal = Math.max(0, selectedTotal - discountAmount);

  const handleSelectItem = useCallback((id) => {
    console.log("🔘 Select item:", id);
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
    console.log("🗑️ Delete item:", itemId);
    dispatch(removeItemFromCart(itemId));
  }, [dispatch]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedItemIds.length === 0) return;
    
    // Always remove items one by one to ensure they are deleted from backend
    await Promise.all(selectedItemIds.map(id => dispatch(removeItemFromCart(id))));
    setSelectedItemIds([]);
  }, [selectedItemIds, dispatch]);

  const handleApplyVoucher = useCallback(async () => {
    if (!voucherCode) {
      message.warning("Vui lòng nhập mã voucher");
      return;
    }
    try {
      console.log("🎟️ Checking voucher:", voucherCode);
      const res = await checkVoucher(voucherCode);
      console.log("🎟️ Voucher response:", res);
      
      if (res.success && res.status === "APPLIED") {
        // Check min_purchase requirement
        const minPurchase = Number(res.voucher.min_purchase) || 0;
        if (selectedTotal < minPurchase) {
          setDiscountInfo(null);
          message.error(`Đơn hàng tối thiểu ${minPurchase.toLocaleString('vi-VN')}₫ để áp dụng mã này`);
          return;
        }
        
        setDiscountInfo(res.voucher);
        message.success("Áp dụng mã thành công!");
      } else {
        setDiscountInfo(null);
        message.error(res.message || "Mã không hợp lệ hoặc đã hết hạn");
      }
    } catch (error) {
      console.error("Voucher error:", error);
      setDiscountInfo(null);
      message.error("Lỗi khi kiểm tra mã");
    }
  }, [voucherCode, selectedTotal]);

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
        subtotal: selectedTotal,
        voucher_code: discountInfo ? voucherCode : null
      } 
    });
  }, [selectedItemIds.length, hasInvalidSelectedItems, finalTotal, navigate, selectedItems, discountAmount, selectedTotal, discountInfo, voucherCode]);

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
                  <Autocomplete
                    freeSolo
                    options={savedVoucherOptions}
                    value={voucherCode}
                    getOptionDisabled={(option) => option.disabled}
                    onChange={(event, newValue) => {
                      if (typeof newValue === 'string') {
                        setVoucherCode(newValue);
                      } else if (newValue && newValue.value) {
                        setVoucherCode(newValue.value);
                      } else {
                        setVoucherCode('');
                      }
                    }}
                    onInputChange={(event, newInputValue) => {
                      setVoucherCode(newInputValue);
                    }}
                    renderOption={(props, option) => (
                      <li {...props} style={{ 
                        opacity: option.disabled ? 0.5 : 1,
                        cursor: option.disabled ? 'not-allowed' : 'pointer',
                        pointerEvents: option.disabled ? 'none' : 'auto'
                      }}>
                        <div style={{ width: '100%' }}>
                          <div style={{ fontWeight: 600 }}>{option.value}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {option.voucher.description}
                          </div>
                          {option.disabled && (
                            <div style={{ fontSize: '11px', color: '#ff4d4f', marginTop: '2px' }}>
                              Đơn tối thiểu {option.minPurchase.toLocaleString('vi-VN')}₫
                            </div>
                          )}
                        </div>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={CART_TEXT.VOUCHER_PLACEHOLDER}
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            backgroundColor: 'white',
                          }
                        }}
                      />
                    )}
                    sx={{ flex: 1 }}
                    noOptionsText={savedVoucherOptions.length === 0 ? "Chưa có voucher đã lưu" : "Không tìm thấy"}
                    slotProps={{
                      popper: {
                        disablePortal: true,
                        sx: {
                          '& .MuiPaper-root': {
                            marginTop: '4px',
                          }
                        }
                      }
                    }}
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
