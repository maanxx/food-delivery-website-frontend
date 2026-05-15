import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Select, Button, Row, Col, message } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, SaveOutlined } from '@ant-design/icons';
import { updateUserProfile } from '@features/user/userSlice';
import styles from './ProfileInfo.module.css';

const ProfileInfo = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.user);

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
    try {
      const result = await dispatch(updateUserProfile(values));
      if (result.meta?.requestStatus === 'fulfilled') {
        message.success('Cập nhật hồ sơ thành công!');
      }
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Thông tin cá nhân</h2>
        <p className={styles.subtitle}>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>
      
      <div className={styles.formCard}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          disabled={loading}
          requiredMark={false}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item label="Họ và tên" name="fullname">
                <Input prefix={<UserOutlined />} size="large" placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Tên đăng nhập" name="username">
                <Input prefix={<UserOutlined />} size="large" placeholder="Nhập tên đăng nhập" />
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

          <div className={styles.actions}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
              className={styles.saveBtn}
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ProfileInfo;

