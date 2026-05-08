# VNPay Thanh Toán - Hướng Dẫn Tích Hợp Frontend

## 📋 Tổng Quan

Hệ thống thanh toán VNPay được tích hợp với endpoint `/api/vnpay/create_payment_url` và xử lý kết quả qua `/api/vnpay/vnpay_return`.

---

## 🔧 Cấu Hình Backend

**Environment Variables:**

```env
EXPO_PUBLIC_VNPAY_TMNCODE=YOUR_TMN_CODE          # Mã cửa hàng từ VNPay
EXPO_PUBLIC_VNPAY_HASH_SECRET=YOUR_HASH_SECRET   # Khóa bảo mật
EXPO_PUBLIC_VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
EXPO_PUBLIC_VNPAY_RETURN_URL=http://localhost:5678/api/vnpay/vnpay_return
```

---

## 🚀 Cách Sử Dụng từ Frontend

### 1. Gọi API để tạo URL thanh toán

**Endpoint:** `POST /api/vnpay/create_payment_url`

**Headers:**

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_TOKEN"  // Bắt buộc (authMiddleware)
}
```

**Request Body:**

```javascript
{
  "amount": 100000,                    // Số tiền (VND) - Bắt buộc
  "orderDescription": "Thanh toán đơn hàng #123",  // Mô tả - Bắt buộc
  "orderType": "billpayment",          // Loại hóa đơn - Bắt buộc
  "language": "vn",                    // "vn" hoặc "en" - Tùy chọn
  "bankCode": ""                       // Mã ngân hàng cụ thể - Tùy chọn
}
```

**Kết Quả:**

- API sẽ **redirect** trực tiếp tới trang thanh toán VNPay
- Không có response JSON, browser sẽ tự chuyển hướng

---

### 2. Frontend Code Example

#### **React / React Native:**

```javascript
// Payment Service
export const initiateVNPayPayment = async (paymentData, token) => {
    try {
        const response = await fetch("http://localhost:5678/api/vnpay/create_payment_url", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(paymentData),
        });

        // API sẽ redirect, không cần xử lý response
        // Nếu có lỗi, sẽ nhận được error response
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }
    } catch (error) {
        console.error("Payment Error:", error);
        throw error;
    }
};

// Component Usage
const handlePayment = async (orderId, totalAmount) => {
    try {
        await initiateVNPayPayment(
            {
                amount: totalAmount,
                orderDescription: `Thanh toán đơn hàng #${orderId}`,
                orderType: "billpayment",
                language: "vn",
            },
            userToken,
        );

        // Không cần xử lý ở đây vì API sẽ redirect
    } catch (error) {
        showError(error.message);
    }
};
```

---

### 3. Xử Lý Kết Quả Thanh Toán

Sau khi thanh toán, VNPay sẽ redirect về:

```
http://localhost:5678/api/vnpay/vnpay_return?vnp_ResponseCode=00&...
```

**Kết Quả Xử Lý:**

| Response Code | Ý Nghĩa                 |
| ------------- | ----------------------- |
| `00`          | ✅ Giao dịch thành công |
| `07`          | ❌ Trừ tiền thất bại    |
| `09`          | ❌ Giao dịch bị từ chối |
| `97`          | ❌ Chữ ký không hợp lệ  |

**Backend sẽ render view `success` với code:**

```javascript
res.render("success", { code: "00" }); // hoặc code khác
```

---

## 💳 Thông Tin Thẻ Test VNPay Sandbox

Sử dụng các thông tin này để test trong sandbox:

### Thẻ Ghi Nợ (Debit Card)

- **Số thẻ:** `9704198526191432198`
- **CVV:** `123`
- **Ngày hết hạn:** `07/15`
- **OTP:** `123456`
- **Chọn ngân hàng:** Bất kỳ

### Thẻ Tín Dụng (Credit Card)

- **Số thẻ:** `9704198526191432195`
- **CVV:** `123`
- **Ngày hết hạn:** `07/25`
- **OTP:** `123456`

---

## 📱 Quy Trình Thanh Toán Chi Tiết

```
1. Frontend gọi POST /api/vnpay/create_payment_url
                      ↓
2. Backend tạo URL + chữ ký HMAC-SHA512
                      ↓
3. Backend redirect tới VNPay sandbox
                      ↓
4. Người dùng nhập thông tin thẻ & OTP trên VNPay
                      ↓
5. VNPay xác minh & redirect về /api/vnpay/vnpay_return
                      ↓
6. Backend kiểm tra chữ ký vnp_SecureHash
                      ↓
7. Render trang success với mã kết quả
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Bắt buộc xác thực:** Endpoint `/api/vnpay/create_payment_url` yêu cầu JWT token (authMiddleware)
2. **Số tiền:** Truyền theo đơn vị VND (ví dụ: 100000 = 100,000 VND)

3. **Return URL:** Sau thanh toán, VNPay sẽ redirect về URL trong config, **không phải về frontend**
    - Bạn cần xử lý callback từ backend để cập nhật trạng thái đơn hàng

4. **Sandbox URL:** Chỉ dùng cho test, production sẽ khác

5. **Lỗi API:** Nếu gặp lỗi, check console backend để xem chi tiết

---

## 🔐 Bảo Mật

- Không bao giờ expose `VNPAY_HASH_SECRET` ở frontend
- Luôn sử dụng HTTPS trong production
- Xác minh chữ ký (`vnp_SecureHash`) từ VNPay trước khi cập nhật trạng thái đơn hàng

---

## 🛠️ Troubleshooting

| Vấn Đề                        | Nguyên Nhân       | Giải Pháp                 |
| ----------------------------- | ----------------- | ------------------------- |
| `Cannot find module 'config'` | Module chưa cài   | `npm install config`      |
| `TMNCODE undefined`           | Env var chưa set  | Kiểm tra file `.env`      |
| Lỗi chữ ký                    | Sai `HASH_SECRET` | Đảm bảo lấy đúng từ VNPay |
| Không redirect                | Backend lỗi       | Check console server      |

---

## 📞 Liên Hệ

Nếu gặp vấn đề, kiểm tra:

1. Server logs (console backend)
2. Network tab (DevTools frontend)
3. File `.env` có đầy đủ không
4. VNPay account có chính xác không

---

## 📚 Tham Khảo

- [VNPay Sandbox](https://sandbox.vnpayment.vn)
- [VNPay Documentation](https://docs.vnpayment.vn)
- API Endpoint: `/api/vnpay/create_payment_url`
- Return Endpoint: `/api/vnpay/vnpay_return`
