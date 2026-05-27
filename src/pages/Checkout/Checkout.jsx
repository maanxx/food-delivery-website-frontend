import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import {
    LocationOnOutlined,
    PaymentsOutlined,
    DescriptionOutlined,
    ShoppingBagOutlined,
    AccountBalanceOutlined,
} from '@mui/icons-material';
import { message, Modal } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { createOrder, createPaymentSession } from '@features/order/orderSlice';
import { resetCartState } from '@features/cart/cartSlice';

import styles from './Checkout.module.css';
import profileService from '@services/profileService';
import {
    beginRateLimitedAction,
    finishRateLimitedAction,
    getRateLimitRemainingMs,
    RATE_LIMIT_DEFAULTS,
} from '@utils/requestRateLimiter';

const CHECKOUT_TEXT = {
    TITLE: 'Thanh toán',
    ADDRESS_SECTION: 'Địa chỉ giao hàng',
    PAYMENT_SECTION: 'Phương thức thanh toán',
    NOTE_SECTION: 'Ghi chú đơn hàng',
    SUMMARY_SECTION: 'Tóm tắt đơn hàng',
    PLACE_ORDER: 'Đặt hàng',
    COD: 'Thanh toán khi nhận hàng (COD)',
    BANK_TRANSFER: 'Chuyển khoản qua VietQR (MB)',
    BANK_TRANSFER_HINT:
        'Quét mã QR để chuyển khoản. Nội dung chuyển khoản sẽ được tự động điền.',
    QR_TITLE: 'Quét mã để thanh toán',
    QR_AMOUNT: 'Số tiền',
    QR_NOTE: 'Nội dung',
    QR_DONE: 'Đã chuyển khoản',
    QR_WAITING: 'Đơn hàng sẽ được tạo sau khi hệ thống xác nhận thanh toán.',
    EMPTY_ADDRESS:
        'Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ trong trang Cá nhân.',
    GO_TO_PROFILE: 'Đi đến Cá nhân',
};

function Checkout() {
    const checkoutRateLimitKey = 'checkout-submit';
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const checkoutData = location.state;
    const { loading: orderLoading } = useSelector((state) => state.order);

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [qrInfo, setQrInfo] = useState(null);
    const [paymentId, setPaymentId] = useState(null);
    const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0);
    const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

    // Redirect if no data from cart
    useEffect(() => {
        if (
            !checkoutData ||
            !checkoutData.items ||
            checkoutData.items.length === 0
        ) {
            message.warning('Dữ liệu thanh toán không hợp lệ');
            navigate('/cart');
        }
    }, [checkoutData, navigate]);

    const fetchAddresses = useCallback(async () => {
        try {
            const res = await profileService.getAddresses();
            const data = res.data.data || [];
            setAddresses(data);

            // Auto select default address (camelCase from backend)
            const defaultAddr = data.find((addr) => addr.isDefault);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.addressId);
            } else if (data.length > 0) {
                setSelectedAddressId(data[0].addressId);
            }
        } catch (error) {
            message.error('Lỗi khi tải địa chỉ');
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    useEffect(() => {
        if (!cooldownRemainingMs) {
            return undefined;
        }

        const timer = setInterval(() => {
            const remaining = getRateLimitRemainingMs(checkoutRateLimitKey);
            setCooldownRemainingMs(remaining);

            if (!remaining) {
                clearInterval(timer);
            }
        }, 250);

        return () => {
            clearInterval(timer);
        };
    }, [cooldownRemainingMs, checkoutRateLimitKey]);

    const handlePlaceOrder = useCallback(async () => {
        if (!selectedAddressId) {
            message.warning('Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        const rateLimitAttempt = beginRateLimitedAction(
            checkoutRateLimitKey,
            RATE_LIMIT_DEFAULTS.CHECKOUT_SUBMIT,
        );

        if (!rateLimitAttempt.allowed) {
            const waitSeconds = Math.ceil(rateLimitAttempt.remainingMs / 1000);
            setCooldownRemainingMs(rateLimitAttempt.remainingMs);

            if (rateLimitAttempt.reason === 'in_flight') {
                message.warning('Đơn hàng đang được xử lý. Vui lòng chờ.');
                return;
            }

            message.warning(
                `Vui lòng chờ ${waitSeconds} giây trước khi đặt hàng lại.`,
            );
            return;
        }

        setIsSubmittingCheckout(true);
        setCooldownRemainingMs(RATE_LIMIT_DEFAULTS.CHECKOUT_SUBMIT);

        try {
            const payload = {
                address_id: selectedAddressId,
                note: note,
                payment_method: paymentMethod,
                request_id: rateLimitAttempt.requestId,
            };

            if (checkoutData.voucher_code) {
                payload.voucher_code = checkoutData.voucher_code;
            }

            if (paymentMethod === 'BANK_TRANSFER') {
                const resultAction = await dispatch(
                    createPaymentSession(payload),
                );
                if (createPaymentSession.fulfilled.match(resultAction)) {
                    const { paymentSession, idempotentReplay } =
                        resultAction.payload;
                    message[
                        idempotentReplay ? 'info' : 'success'
                    ](
                        idempotentReplay
                            ? 'Đã dùng lại phiên thanh toán trước đó. Vui lòng tiếp tục chuyển khoản.'
                            : 'Đã tạo phiên thanh toán. Vui lòng chuyển khoản để hoàn tất.',
                    );
                    setQrInfo(paymentSession.qr_info);
                    setPaymentId(paymentSession.payment_id);
                    setQrModalOpen(true);
                    return;
                }
                message.error(
                    resultAction.payload || 'Không thể tạo phiên thanh toán',
                );
                return;
            }

            const resultAction = await dispatch(createOrder(payload));
            if (createOrder.fulfilled.match(resultAction)) {
                const { order, idempotentReplay } = resultAction.payload;
                const orderId = order.order_id;
                message[idempotentReplay ? 'info' : 'success'](
                    idempotentReplay
                        ? 'Đơn hàng trước đó đã được ghi nhận. Chúng tôi đang mở lại kết quả cho bạn.'
                        : 'Đặt hàng thành công!',
                );
                dispatch(resetCartState());
                navigate(`/checkout/success?orderId=${orderId}`);
            } else {
                message.error(resultAction.payload || 'Đặt hàng thất bại');
            }
        } catch (error) {
            console.error('Order error:', error);
            message.error('Lỗi hệ thống khi đặt hàng');
        } finally {
            finishRateLimitedAction(
                checkoutRateLimitKey,
                rateLimitAttempt.requestId,
            );
            setIsSubmittingCheckout(false);
            setCooldownRemainingMs(
                getRateLimitRemainingMs(checkoutRateLimitKey),
            );
        }
    }, [
        checkoutRateLimitKey,
        selectedAddressId,
        note,
        navigate,
        dispatch,
        checkoutData.voucher_code,
        paymentMethod,
    ]);

    const handleCloseQrModal = useCallback(() => {
        setQrModalOpen(false);
        message.info('Đơn hàng sẽ được tạo sau khi xác nhận thanh toán.');
    }, []);

    const orderSummaryList = useMemo(
        () => (
            <div className={styles.summaryList}>
                {checkoutData.items.map((item) => {
                    // Support both formats from cart
                    const itemPrice =
                        item.priceSnapshot || item.price_snapshot || 0;
                    const itemImage =
                        item.dish?.thumbnail_path || item.thumbnail_path || '';
                    const itemName = item.dish?.name || item.name || 'Món ăn';

                    return (
                        <div
                            key={item.cart_item_id || item.dish_id}
                            className={styles.summaryItem}
                        >
                            <img
                                src={itemImage}
                                alt={itemName}
                                className={styles.itemImage}
                            />
                            <div className={styles.itemInfo}>
                                <span className={styles.itemName}>
                                    {itemName}
                                </span>
                                <span className={styles.itemMeta}>
                                    Số lượng: {item.quantity}
                                </span>
                            </div>
                            <span className={styles.itemPrice}>
                                {(
                                    Number(itemPrice) * item.quantity
                                ).toLocaleString('vi-VN')}{' '}
                                ₫
                            </span>
                        </div>
                    );
                })}
            </div>
        ),
        [checkoutData.items],
    );

    const placeOrderDisabled = !selectedAddressId;

    const placeOrderLabel = useMemo(() => {
        if (orderLoading || isSubmittingCheckout) {
            return 'Đang xử lý...';
        }

        if (cooldownRemainingMs > 0) {
            return `Vui lòng chờ ${Math.ceil(cooldownRemainingMs / 1000)}s`;
        }

        return CHECKOUT_TEXT.PLACE_ORDER;
    }, [cooldownRemainingMs, isSubmittingCheckout, orderLoading]);

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
                                <div
                                    style={{
                                        textAlign: 'center',
                                        padding: '20px',
                                    }}
                                >
                                    <p>{CHECKOUT_TEXT.EMPTY_ADDRESS}</p>
                                    <button
                                        className={styles.placeOrderBtn}
                                        style={{
                                            width: 'auto',
                                            padding: '10px 20px',
                                        }}
                                        onClick={() => navigate('/profile')}
                                    >
                                        {CHECKOUT_TEXT.GO_TO_PROFILE}
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.addressList}>
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr.addressId}
                                            className={`${styles.addressCard} ${selectedAddressId === addr.addressId ? styles.addressCardActive : ''}`}
                                            onClick={() =>
                                                setSelectedAddressId(
                                                    addr.addressId,
                                                )
                                            }
                                        >
                                            <div
                                                className={styles.addressHeader}
                                            >
                                                <span
                                                    className={
                                                        styles.addressLabel
                                                    }
                                                >
                                                    {addr.label || 'Home'}
                                                </span>
                                                {addr.isDefault && (
                                                    <span
                                                        className={
                                                            styles.defaultBadge
                                                        }
                                                    >
                                                        Mặc định
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    styles.addressContent
                                                }
                                            >
                                                {addr.street}, {addr.ward},{' '}
                                                {addr.district}, {addr.city}
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
                                <div
                                    className={`${styles.paymentOption} ${paymentMethod === 'COD' ? styles.paymentOptionActive : ''}`}
                                    onClick={() => setPaymentMethod('COD')}
                                >
                                    <div className={styles.paymentRadio} />
                                    <span>{CHECKOUT_TEXT.COD}</span>
                                </div>
                                <div
                                    className={`${styles.paymentOption} ${paymentMethod === 'BANK_TRANSFER' ? styles.paymentOptionActive : ''}`}
                                    onClick={() =>
                                        setPaymentMethod('BANK_TRANSFER')
                                    }
                                >
                                    <AccountBalanceOutlined color="primary" />
                                    <div
                                        className={styles.paymentOptionContent}
                                    >
                                        <span>
                                            {CHECKOUT_TEXT.BANK_TRANSFER}
                                        </span>
                                        <span className={styles.paymentHint}>
                                            {CHECKOUT_TEXT.BANK_TRANSFER_HINT}
                                        </span>
                                    </div>
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
                                    <span>
                                        {checkoutData.subtotal?.toLocaleString(
                                            'vi-VN',
                                        )}{' '}
                                        ₫
                                    </span>
                                </div>
                                {checkoutData.discount > 0 && (
                                    <>
                                        <div
                                            className={styles.summaryRow}
                                            style={{ color: '#52c41a' }}
                                        >
                                            <span>
                                                Mã giảm giá:{' '}
                                                {checkoutData.voucher_code}
                                            </span>
                                            <span></span>
                                        </div>
                                        <div
                                            className={styles.summaryRow}
                                            style={{ color: '#ff4d4f' }}
                                        >
                                            <span>Giảm giá</span>
                                            <span>
                                                -
                                                {checkoutData.discount.toLocaleString(
                                                    'vi-VN',
                                                )}{' '}
                                                ₫
                                            </span>
                                        </div>
                                    </>
                                )}
                                <div className={styles.totalRow}>
                                    <span>Tổng cộng</span>
                                    <span
                                        style={{ color: 'var(--primaryColor)' }}
                                    >
                                        {checkoutData.total.toLocaleString(
                                            'vi-VN',
                                        )}{' '}
                                        ₫
                                    </span>
                                </div>
                            </div>

                            <button
                                className={styles.placeOrderBtn}
                                onClick={handlePlaceOrder}
                                disabled={placeOrderDisabled}
                            >
                                {placeOrderLabel}
                            </button>
                            {cooldownRemainingMs > 0 &&
                                !orderLoading &&
                                !isSubmittingCheckout && (
                                    <p className={styles.cooldownHint}>
                                        Hệ thống đang giới hạn thao tác đặt hàng
                                        để tránh gửi trùng yêu cầu.
                                    </p>
                                )}
                        </div>
                    </div>
                </div>
            </Container>
            <Modal
                open={qrModalOpen}
                onCancel={handleCloseQrModal}
                onOk={handleCloseQrModal}
                okText={CHECKOUT_TEXT.QR_DONE}
                cancelText="Đóng"
                title={CHECKOUT_TEXT.QR_TITLE}
                centered
            >
                {qrInfo && (
                    <div className={styles.qrModalContent}>
                        <img
                            className={styles.qrImage}
                            src={qrInfo.qr_url}
                            alt="VietQR"
                        />
                        <div className={styles.qrDetails}>
                            <div>
                                <strong>{CHECKOUT_TEXT.QR_AMOUNT}:</strong>{' '}
                                {Number(qrInfo.amount || 0).toLocaleString(
                                    'vi-VN',
                                )}{' '}
                                ₫
                            </div>
                            <div>
                                <strong>{CHECKOUT_TEXT.QR_NOTE}:</strong>{' '}
                                {qrInfo.add_info}
                            </div>
                            <div>{CHECKOUT_TEXT.QR_WAITING}</div>
                            {paymentId && (
                                <div>
                                    <strong>Mã thanh toán:</strong> {paymentId}
                                </div>
                            )}
                            <div>
                                <strong>Ngân hàng:</strong> {qrInfo.bank_code}
                            </div>
                            <div>
                                <strong>Số TK:</strong> {qrInfo.account_no}
                            </div>
                            <div>
                                <strong>Chủ TK:</strong> {qrInfo.account_name}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Checkout;
