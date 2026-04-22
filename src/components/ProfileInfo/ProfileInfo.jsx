import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Select, Button, Row, Col, Upload, Avatar, message } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, CameraOutlined, SaveOutlined } from '@ant-design/icons';
import { updateUserProfile, updateUserAvatar } from '@features/user/userSlice';
import { getAvatarUrl } from '@utils/urlHelper';
import styles from './ProfileInfo.module.css';

const ProfileInfo = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  
  // Select user from auth state (Global source of truth)
  const { user } = useSelector((state) => state.auth);
  // Select loading states from user state (Action-specific source of truth)
  const { loading, avatarLoading } = useSelector((state) => state.user);

  // Sync form with Redux user state
  useEffect(() => {
    if (user) {
      const formattedUser = { ...user };
      if (formattedUser.dateOfBirth) {
        formattedUser.dateOfBirth = new Date(formattedUser.dateOfBirth).toISOString().split('T')[0];
      }
      form.setFieldsValue(formattedUser);
    }
  }, [user, form]);

  const handleUpdateProfile = async (values) => {
    // According to requirements: Strictly using backend response as source of truth
    await dispatch(updateUserProfile(values));
  };

  const handleAvatarUpload = async (info) => {
    if (info.file.status === 'uploading') return;
    
    const file = info.file.originFileObj;
    if (!file) return;

    // Per-action loading: specifically for avatar
    await dispatch(updateUserAvatar(file));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Hồ sơ của tôi</h2>
      <p className={styles.subtitle}>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      
      <div className={styles.content}>
        <div className={styles.formSection}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateProfile}
            disabled={loading || avatarLoading}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Tên đăng nhập" name="username">
                  <Input prefix={<UserOutlined />} size="large" placeholder="Nhập tên đăng nhập" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Họ và tên" name="fullname">
                  <Input prefix={<UserOutlined />} size="large" placeholder="Nhập họ và tên" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Số điện thoại" name="phoneNumber">
                  <Input prefix={<PhoneOutlined />} disabled size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Email" name="email">
                  <Input prefix={<MailOutlined />} disabled size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Giới tính" name="gender">
                  <Select size="large" placeholder="Chọn giới tính">
                    <Select.Option value="Male">Nam</Select.Option>
                    <Select.Option value="Female">Nữ</Select.Option>
                    <Select.Option value="Other">Khác</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Ngày sinh" name="dateOfBirth">
                  <Input type="date" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              disabled={loading || avatarLoading}
              size="large"
              className={styles.saveBtn}
            >
              Lưu thay đổi
            </Button>
          </Form>
        </div>

        <div className={styles.avatarSection}>
          <Avatar
            size={120}
            src={getAvatarUrl(user?.avatarPath)}
            icon={<UserOutlined />}
            className={styles.avatar}
          />
          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleAvatarUpload}
            disabled={avatarLoading}
          >
            <Button 
              icon={<CameraOutlined />} 
              loading={avatarLoading}
              disabled={avatarLoading || loading}
            >
              Chọn ảnh
            </Button>
          </Upload>
          <div className={styles.avatarHelpText}>
            Dung lượng file tối đa 1 MB<br/>
            Định dạng: .JPEG, .PNG
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
