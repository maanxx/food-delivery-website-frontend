import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginAdmin } from "@features/auth/adminAuthSlice";
import axiosInstance from "@config/axiosInstance";
import styles from "./AdminLogin.module.css";

// Premium pure inline SVG icons for 100% build reliability
const MailIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const AlertIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const adminAuth = useSelector((state) => state.adminAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect to Admin dashboard if already logged in as Admin
  useEffect(() => {
    if (
      adminAuth.isAuthenticated &&
      adminAuth.user?.role?.toLowerCase() === "admin"
    ) {
      navigate("/admin");
    }
  }, [adminAuth.isAuthenticated, adminAuth.user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axiosInstance({
        url: "/api/auth/login-user",
        method: "POST",
        data: {
          email,
          password,
          memorizedLogin: rememberMe,
        },
      });

      if (res.data.success) {
        const { accessToken, refreshToken, user } = res.data;

        // Validate role is strictly Admin
        if (user?.role?.toLowerCase() !== "admin") {
          setErrorMsg(
            "Tài khoản của bạn không có quyền truy cập trang quản trị.",
          );
          setLoading(false);
          return;
        }

        // Log in admin
        dispatch(
          loginAdmin({ token: accessToken, refreshToken, user, rememberMe }),
        );
        navigate("/admin");
      } else {
        setErrorMsg(
          res.data.message || "Tài khoản hoặc mật khẩu không chính xác.",
        );
      }
    } catch (error) {
      console.error("ADMIN LOGIN ERROR:", error);
      setErrorMsg(
        error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminLoginContainer}>
      {/* Left Split Pane - Decorative Branding Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.brandHeader}>
          <span className={styles.brandLogo}>🍊</span>
          <span className={styles.brandName}>
            Eatsy <span>Admin</span>
          </span>
        </div>

        <div className={styles.illustrationContent}>
          <h2>Bảng điều hành quản trị Eatsy</h2>
          <p>
            Hệ thống trung tâm quản lý đơn hàng, điều phối tài xế, quản trị danh
            mục món ăn và phân tích hiệu quả kinh doanh của Eatsy trong thời
            gian thực.
          </p>

          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>⚡</span>
              <span className={styles.featureText}>
                Quản lý đơn hàng Realtime siêu tốc
              </span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📊</span>
              <span className={styles.featureText}>
                Hệ thống báo cáo doanh thu trực quan
              </span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🔒</span>
              <span className={styles.featureText}>
                Bảo mật tối đa, phân quyền an toàn
              </span>
            </div>
          </div>
        </div>

        <div className={styles.leftPanelFooter}>
          <span>Bản quyền thuộc về Eatsy © {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Right Split Pane - Shopify inspired Login Form */}
      <div className={styles.rightPanel}>
        <div className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <h1>Chào mừng trở lại!</h1>
            <p>Đăng nhập tài khoản Quản trị viên để quản lý hệ thống</p>
          </div>

          {errorMsg && (
            <div className={styles.alertBox}>
              <AlertIcon />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className={styles.formGroup}>
              <label htmlFor="email">Email quản trị</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <MailIcon />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.textInput}
                  placeholder="admin@eatsy.vn"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className={styles.formGroup}>
              <label htmlFor="password">Mật khẩu</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <LockIcon />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.textInput}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Options Section */}
            <div className={styles.optionsRow}>
              <label className={styles.rememberMe}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? "Đang xử lý..." : "Đăng nhập hệ thống"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
