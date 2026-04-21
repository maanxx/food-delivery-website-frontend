import React from 'react';
import { Form, Input, Select, Button, Row, Col, Upload, Avatar, Spin, message } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, CameraOutlined, SaveOutlined } from '@ant-design/icons';
import profileService from '@services/profileService';
import styles from './ProfileInfo.module.css';

const ProfileInfo = ({ profile, loading, onSuccess }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (profile) {
      const formattedProfile = { ...profile };
      if (formattedProfile.dateOfBirth) {
        formattedProfile.dateOfBirth = new Date(formattedProfile.dateOfBirth).toISOString().split('T')[0];
      }
      
      // Map phone with countryCode if available
      if (formattedProfile.countryCode && formattedProfile.phoneNumber) {
          formattedProfile.phoneNumber = `${formattedProfile.countryCode} ${formattedProfile.phoneNumber}`;
      }
      
      form.setFieldsValue(formattedProfile);
    }
  }, [profile, form]);

  const handleUpdateProfile = async (values) => {
    const formData = new FormData();
    formData.append("fullname", values.fullname);
    
    // Extract raw phone number if it contains country code
    let phoneToSave = values.phoneNumber || "";
    if (phoneToSave.includes(" ")) {
        phoneToSave = phoneToSave.split(" ")[1];
    }
    formData.append("phoneNumber", phoneToSave);
    
    formData.append("gender", values.gender || "");
    formData.append("dateOfBirth", values.dateOfBirth || "");
    formData.append("email", values.email || "");
    
    try {
      const response = await profileService.updateProfile(formData);
      message.success("Profile updated successfully");
      if (onSuccess) onSuccess(response.data.data);
    } catch (error) {
      message.error("Failed to update profile");
    }
  };

  const handleAvatarUpload = async (info) => {
    const formData = new FormData();
    formData.append("avatar", info.file.originFileObj);
    try {
      const response = await profileService.updateProfile(formData);
      message.success("Avatar updated successfully");
      if (onSuccess) onSuccess(response.data.data);
    } catch (error) {
      message.error("Failed to update avatar");
    }
  };

  if (loading && !profile) {
    return (
      <div className={styles.loadingWrapper}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>My Profile</h2>
      <p className={styles.subtitle}>Manage and protect your account</p>
      
      <div className={styles.content}>
        <div className={styles.formSection}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateProfile}
            disabled={loading}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Username" name="username">
                  <Input prefix={<UserOutlined />} disabled size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Full Name" name="fullname">
                  <Input prefix={<UserOutlined />} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Phone" name="phoneNumber">
                  <Input prefix={<PhoneOutlined />} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Gender" name="gender">
                  <Select size="large">
                    <Select.Option value="Male">Male</Select.Option>
                    <Select.Option value="Female">Female</Select.Option>
                    <Select.Option value="Other">Other</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Date of Birth" name="dateOfBirth">
                  <Input type="date" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Email" name="email">
                  <Input prefix={<MailOutlined />} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
              className={styles.saveBtn}
            >
              Save Changes
            </Button>
          </Form>
        </div>

        <div className={styles.avatarSection}>
          <Avatar
            size={120}
            src={profile?.avatarPath ? `http://localhost:3001${profile.avatarPath}` : null}
            icon={<UserOutlined />}
            className={styles.avatar}
          />
          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleAvatarUpload}
          >
            <Button icon={<CameraOutlined />}>Select Image</Button>
          </Upload>
          <div className={styles.avatarHelpText}>
            File size: maximum 1 MB<br/>
            File extension: .JPEG, .PNG
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
