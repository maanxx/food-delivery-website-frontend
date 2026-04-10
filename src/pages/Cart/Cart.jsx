import React, { useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames/bind";
import { Button, Container } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import styles from "./Cart.module.css";
import axiosInstance from "@config/axiosInstance";
import { deleteCartItem, getCartItems } from "@services/cartService";
import { QuantityInput } from "@components/index";
import { Modal } from "antd";
import { Link } from "react-router-dom";
import { Home } from "@mui/icons-material";
import { checkVoucher } from "@services/voucherService";

const cx = classNames.bind(styles);

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const checkBoxesRef = useRef([]);
    const [editMode, setEditMode] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const selectAllRef = useRef();
    const [validVoucher, setValidVoucher] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherAlert, setVoucherAlert] = useState("");

    const selectAll = (e) => {
        checkBoxesRef.current?.forEach((checkbox) => {
            if (checkbox === null) return;

            if (e.target.checked) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
        });
    };

    const refreshCheckBoxes = () => {
        checkBoxesRef.current?.forEach((checkbox) => {
            if (checkbox) {
                checkbox.checked = false;
            }
        });

        selectAllRef.current.checked = false;
    };

    const checkSelectAll = () => {
        const isAllChecked = Array.from(checkBoxesRef.current).every((checkbox) => checkbox?.checked);
        selectAllRef.current.checked = isAllChecked;
    };

    const selectProduct = () => {
        checkSelectAll();

        // * More handle here
    };

    const handleDeleteCartItem = async () => {
        setOpenModal(false);

        const checkedIndexes = checkBoxesRef.current
            .map((checkbox, index) => (checkbox?.checked ? index : null))
            .filter((index) => index !== null);

        cartItems.forEach(async (item, index) => {
            if (checkedIndexes.includes(index) || item.quantity === 0) {
                await deleteCartItem(item.cart_item_id);
                setCartItems(cartItems.filter((item) => item.quantity === 0));
                loadCartItems();
            }
        });

        refreshCheckBoxes();
    };

    const submitVoucher = async (e) => {
        e.preventDefault();

        const data = await checkVoucher(voucherCode);

        switch (data.status) {
            case "MISSING_FIELD":
                setVoucherAlert("Chưa nhập mã");
                setValidVoucher(false);
                break;
            case "NOT_FOUND":
                setVoucherAlert("Không tìm thấy mã");
                setValidVoucher(false);
                break;
            case "HAS_NOT_STARTED":
                setVoucherAlert("Mã chưa được hoạt động");
                setValidVoucher(false);
                break;
            case "HAS_ENDED":
                setVoucherAlert("Mã đã hết hạn sử dụng");
                setValidVoucher(false);
                break;

            default:
                setValidVoucher(true);
                applyVoucher(data.voucher.discount_type, data.voucher.discount_value);
                break;
        }
    };

    const applyVoucher = (discountType, discountAmount) => {
        switch (discountType) {
            case "Percentage":
                setTotalAmount((prev) => prev * discountAmount);
                break;
            case "Amount":
                setTotalAmount((prev) => prev - discountAmount);
                break;
        }
    };

    // load cart items
    const loadCartItems = useCallback(async () => {
        setCartItems(await getCartItems());
    }, []);

    useEffect(() => {
        loadCartItems();
    }, []);

    useEffect(() => {
        const total = cartItems.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);
        setTotalAmount(total);
    }, [cartItems]);

    return (
        <div className={cx("wrapper")}>
            <div className={cx("title")}>
                <h1>Giỏ hàng</h1>
            </div>
            <Container maxWidth="lg">
                <Modal
                    open={openModal}
                    title="Thay đổi giỏ hàng"
                    okText="Xác nhận"
                    cancelText="Trở lại"
                    onOk={handleDeleteCartItem}
                    okButtonProps={{ className: cx("ok-button") }}
                    onCancel={() => setOpenModal(false)}
                >
                    Xác nhận xóa {checkBoxesRef.current.filter((checkbox) => checkbox?.checked).length || 1} món ăn
                </Modal>
                {cartItems?.length === 0 ? (
                    <div className={cx("empty-cart")}>
                        <img src={require("@images/icons/empty-cart-icon.png")} alt="Empty cart icon" />
                        <span>Không có món ăn trong giỏ hàng. </span>
                        <Button
                            style={{ backgroundColor: "var(--primaryColor)", padding: "10px 20px", marginTop: "15px" }}
                        >
                            <Link
                                to={"/"}
                                style={{
                                    color: "white",
                                    display: "flex",
                                    justifyItems: "center",
                                    alignItems: "center",
                                }}
                            >
                                Quay lại trang chủ <Home />
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className={cx("cart")}>
                        <div className={cx("operation")}>
                            <div
                                className={cx("left")}
                                style={{ display: editMode ? "block" : "none", justifySelf: "flex-start" }}
                            >
                                <input
                                    ref={selectAllRef}
                                    type="checkbox"
                                    onChange={selectAll}
                                    name="select-all-product"
                                    id="select-all-product"
                                />
                                <label htmlFor="select-all-product" style={{ marginLeft: "5px", cursor: "pointer" }}>
                                    Chọn tất cả
                                </label>
                            </div>
                            <div className={cx("right")} style={{ justifySelf: "flex-end" }}>
                                <button
                                    hidden={!editMode}
                                    onClick={() =>
                                        checkBoxesRef.current.filter((checkbox) => checkbox?.checked).length > 0
                                            ? setOpenModal(true)
                                            : null
                                    }
                                    className={cx("delete-cart-btn", "cart-btn")}
                                >
                                    Xóa
                                </button>
                                <button
                                    hidden={!editMode}
                                    onClick={() => {
                                        setEditMode(!editMode);
                                        refreshCheckBoxes();
                                    }}
                                    className={cx("cancel-cart-btn", "cart-btn")}
                                >
                                    Hủy
                                </button>
                                <button
                                    hidden={editMode}
                                    onClick={() => setEditMode(!editMode)}
                                    className={cx("edit-cart-btn", "cart-btn")}
                                >
                                    Sửa
                                </button>
                            </div>
                        </div>
                        <TableContainer component={Paper}>
                            <div style={{ padding: "20px 30px" }}>
                                <Table sx={{ minWidth: 650 }} aria-label="cart table">
                                    <TableHead>
                                        <TableRow className={cx("cart-header")}>
                                            <TableCell width={editMode ? 80 : 0}></TableCell>
                                            <TableCell>Sản phẩm</TableCell>
                                            <TableCell align="center">Đơn giá</TableCell>
                                            <TableCell width={250} align="center">
                                                Số lượng
                                            </TableCell>
                                            <TableCell align="center">Tạm tính</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cartItems?.map((item, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                            >
                                                <TableCell align="left">
                                                    <div hidden={!editMode} className={cx("product-select")}>
                                                        <input
                                                            onChange={selectProduct}
                                                            ref={(el) => (checkBoxesRef.current[index] = el)}
                                                            type="checkbox"
                                                            name={`product-${index + 1}`}
                                                            id={`product-${index + 1}`}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell
                                                    align="left"
                                                    component="th"
                                                    scope="row"
                                                    className={cx("product")}
                                                >
                                                    <div
                                                        className={cx("product-image")}
                                                        style={{ backgroundImage: `url("${item.thumbnail_path}")` }}
                                                    ></div>
                                                    <div className={cx("product-name")}>{item.name}</div>
                                                </TableCell>
                                                <TableCell align="center" className={cx("price")}>
                                                    {Number(item.price).toLocaleString("vi-VN")} <span>₫</span>
                                                </TableCell>
                                                <TableCell align="center" className={cx("quantity")}>
                                                    <QuantityInput
                                                        min={0}
                                                        max={999}
                                                        currentValue={item.quantity}
                                                        cartItemId={item.cart_item_id}
                                                        loadCartItems={loadCartItems}
                                                        setOpenModal={setOpenModal}
                                                    />
                                                </TableCell>
                                                <TableCell align="center" className={cx("subtotal")}>
                                                    {(Number(item.price) * item.quantity).toLocaleString("vi-VN")}{" "}
                                                    <span>₫</span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TableContainer>
                    </div>
                )}

                <div style={{ display: "flex", width: "100%", margin: "20px 0", justifyContent: "space-between" }}>
                    <div className={cx("voucher-input")}>
                        <form onSubmit={submitVoucher}>
                            <input
                                type="text"
                                placeholder="Nhập mã khuyến mãi"
                                className={cx({ invalid: !validVoucher })}
                                onChange={(e) => setVoucherCode(e.currentTarget.value)}
                            />
                            <button type="submit" className={cx("apply-voucher-btn")}>
                                Áp dụng
                            </button>
                        </form>
                        <div hidden={validVoucher} className={cx("voucher-alert")}>
                            {voucherAlert}
                        </div>
                    </div>
                    <div className={cx("invoice-total")}>
                        <span style={{ fontSize: "var(--fontSizeLarge)" }}>
                            Tổng thanh toán:{" "}
                            <span
                                className={cx("amount")}
                                style={{
                                    fontSize: "30px",
                                    color: "var(--primaryColor)",
                                    fontWeight: "var(--fontWeightBold)",
                                }}
                            >
                                {totalAmount >= 0 ? totalAmount.toLocaleString("vi-VN") : 0} ₫
                            </span>
                        </span>
                        <button className={cx("checkout-btn")}>
                            <Link to={"/checkout"}>Thanh toán</Link>
                        </button>
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default Cart;
