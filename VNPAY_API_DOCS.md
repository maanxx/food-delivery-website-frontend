# VNPay API Documentation

## 📌 Base URL

```
http://localhost:5678
```

## 🔐 Authentication

Tất cả các endpoint yêu cầu JWT token trong header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. Tạo URL Thanh Toán

### Endpoint

```
POST /api/vnpay/create_payment_url
```

### Headers

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

### Request Body

```javascript
{
  "amount": 100000,
  "orderDescription": "Thanh toán đơn hàng #123",
  "orderType": "billpayment",
  "language": "vn",
  "bankCode": ""
}
```

### Parameters

| Tham số            | Kiểu   | Bắt buộc | Mô tả                                     |
| ------------------ | ------ | -------- | ----------------------------------------- |
| `amount`           | number | ✅       | Số tiền VND (ví dụ: 100000 = 100,000 VND) |
| `orderDescription` | string | ✅       | Mô tả đơn hàng/hoá đơn                    |
| `orderType`        | string | ✅       | Loại hoá đơn (thường dùng "billpayment")  |
| `language`         | string | ❌       | Ngôn ngữ: "vn" (mặc định) hoặc "en"       |
| `bankCode`         | string | ❌       | Mã ngân hàng (để trống cho phép chọn)     |

### Kết Quả

- **Status 302**: Redirect trực tiếp tới VNPay (thành công)
- **Status 400/500**: Lỗi JSON response

### Response Error Example

```javascript
{
  "success": false,
  "status": "error",
  "message": "VNPAY_TMNCODE not configured",
  "errors": null
}
```

---

## 2. Xử Lý Kết Quả Thanh Toán

### Endpoint

```
GET /api/vnpay/vnpay_return?vnp_ResponseCode=00&...
```

### Response Codes

| Code | Ý Nghĩa                | Xử Lý                                     |
| ---- | ---------------------- | ----------------------------------------- |
| `00` | ✅ Thành công          | Cập nhật trạng thái đơn hàng thành "paid" |
| `07` | ❌ Trừ tiền thất bại   | Thử lại hoặc hủy đơn                      |
| `09` | ❌ Giao dịch từ chối   | Hủy đơn hàng                              |
| `97` | ❌ Chữ ký không hợp lệ | Liên hệ support                           |

### Kết Quả

Backend sẽ render view `success.ejs` hoặc `success.pug`:

```html
<!-- success view sẽ hiển thị kết quả -->
Response Code: <%= code %>
```

---

## 📝 Postman Collection

### 1️⃣ Create Payment URL

**Method:** POST  
**URL:** `{{base_url}}/api/vnpay/create_payment_url`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**

```json
{
    "amount": 100000,
    "orderDescription": "Thanh toán đơn hàng #ORD001",
    "orderType": "billpayment",
    "language": "vn",
    "bankCode": ""
}
```

**Expected Response:**

- 302 Redirect to VNPay sandbox

---

## 🔌 cURL Examples

### Create Payment

```bash
curl -X POST http://localhost:5678/api/vnpay/create_payment_url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 100000,
    "orderDescription": "Thanh toán đơn hàng #123",
    "orderType": "billpayment",
    "language": "vn"
  }' \
  -L
```

---

## 🧪 Test Workflow

### Step 1: Login và lấy Token

```bash
curl -X POST http://localhost:5678/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:

```json
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": 1, "name": "John" }
}
```

### Step 2: Tạo URL Thanh Toán

```bash
curl -X POST http://localhost:5678/api/vnpay/create_payment_url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -d '{
    "amount": 100000,
    "orderDescription": "Đơn hàng test",
    "orderType": "billpayment",
    "language": "vn"
  }' \
  -L
```

Browser sẽ tự redirect tới VNPay sandbox

### Step 3: Nhập Thông Tin Thẻ Test

- Số thẻ: `9704198526191432198`
- CVV: `123`
- OTP: `123456`

### Step 4: Kiểm Tra Kết Quả

- VNPay sẽ redirect về `/api/vnpay/vnpay_return?vnp_ResponseCode=00&...`
- Backend render trang success

---

## 🛡️ Error Handling

### Error Cases

```javascript
// Missing auth header
GET /api/vnpay/create_payment_url
Response: 401 Unauthorized

// Missing required field
POST /api/vnpay/create_payment_url
Body: { "orderDescription": "test" }
Response: 400 Bad Request
         "Missing required field: amount"

// Invalid token
Header: Authorization: Bearer invalid_token
Response: 401 Unauthorized
         "Invalid token"

// Missing environment variables
Response: 500 Internal Server Error
         "VNPAY_TMNCODE not configured"
```

---

## 📱 Frontend Integration Example

```javascript
// Step 1: User clicks payment button
async function handlePaymentClick(orderId, amount) {
    const token = localStorage.getItem("token");

    try {
        // Step 2: Create payment URL
        const response = await fetch("http://localhost:5678/api/vnpay/create_payment_url", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                amount: amount,
                orderDescription: `Thanh toán đơn hàng #${orderId}`,
                orderType: "billpayment",
                language: "vn",
            }),
        });

        // Step 3: Browser automatically redirects (302)
        // No need to handle response
    } catch (error) {
        console.error("Payment error:", error);
    }
}

// Step 4: After payment, check order status
async function checkOrderStatus(orderId) {
    const response = await fetch(`http://localhost:5678/api/orders/${orderId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    const order = await response.json();
    console.log("Order status:", order.paymentStatus); // 'paid' or 'pending'
}
```

---

## 🔗 Resources

- **VNPay Sandbox:** https://sandbox.vnpayment.vn
- **VNPay Docs:** https://docs.vnpayment.vn
- **Backend Endpoint:** `POST /api/vnpay/create_payment_url`
- **Return Endpoint:** `GET /api/vnpay/vnpay_return`

---

## ⚠️ Common Issues

| Lỗi                      | Nguyên Nhân            | Giải Pháp            |
| ------------------------ | ---------------------- | -------------------- |
| Redirect không hoạt động | Chưa set env vars      | Kiểm tra `.env`      |
| 401 Unauthorized         | Token không hợp lệ     | Đăng nhập lại        |
| Số tiền không đúng       | Giá trị âm hoặc 0      | Truyền amount > 0    |
| Chữ ký sai               | HASH_SECRET không đúng | Lấy từ VNPay account |

---

**Last Updated:** May 2026  
**Version:** 1.0
