import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined, SaveOutlined } from '@ant-design/icons';
import profileService from '@services/profileService';
import useLoading from '@hooks/useLoading';
import styles from './ProfilePassword.module.css';

const ProfilePassword = () => {
  const [form] = Form.useForm();
  const { loading, setLoading } = useLoading();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await profileService.changePassword(values);
      if (response.data.success) {
        message.success("Mật khẩu đã được thay đổi thành công!");
        form.resetFields();
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Thay đổi mật khẩu</h2>
        <p className={styles.subtitle}>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
      </div>

      <div className={styles.formWrapper}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          className={styles.form}
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="oldPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" size="large" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" size="large" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" size="large" />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
            className={styles.submitBtn}
          >
            Cập nhật mật khẩu
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default ProfilePassword;
