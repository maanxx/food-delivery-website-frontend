import React, { useState, useEffect } from "react";
import {
  Tabs,
  message,
  Button,
  Form,
  Input,
  Upload,
  Spin,
  Avatar,
  Row,
  Col,
} from "antd";
import useAuth from "@hooks/useAuth";
import {
  EditOutlined,
  SaveOutlined,
  LockOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import profileService from "@services/profileService";
import AddressCard from "@components/AddressCard/AddressCard";
import AddressForm from "@components/AddressForm/AddressForm";
import useLoading from "@hooks/useLoading";
import styles from "./Profile.module.css";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { useForm } = Form;

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { loading, setLoading } = useLoading();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form] = useForm();
  const [passwordForm] = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await profileService.getProfile();
      setProfile(response.data.data);
      form.setFieldsValue(response.data.data);
    } catch (error) {
      message.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await profileService.getAddresses();
      setAddresses(response.data.data || []);
    } catch (error) {
      message.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    const formData = new FormData();
    formData.append("fullname", values.fullname);
    formData.append("phone_number", values.phone_number);
    // Add other fields as needed

    setLoading(true);
    try {
      const response = await profileService.updateProfile(formData);
      message.success("Profile updated successfully");
      setProfile(response.data.data);
    } catch (error) {
      message.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      await profileService.changePassword(values);
      message.success("Password changed successfully");
      passwordForm.resetFields();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to change password",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (addressData) => {
    setLoading(true);
    try {
      await profileService.addAddress(addressData);
      message.success("Address added successfully");
      setAddressModalVisible(false);
      fetchAddresses();
    } catch (error) {
      message.error("Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = async (addressData) => {
    setLoading(true);
    try {
      await profileService.updateAddress(
        editingAddress.address_id,
        addressData,
      );
      message.success("Address updated successfully");
      setAddressModalVisible(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      message.error("Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this address?",
    );
    if (!confirm) return;

    setLoading(true);
    try {
      await profileService.deleteAddress(addressId);
      message.success("Address deleted successfully");
      fetchAddresses();
    } catch (error) {
      message.error("Failed to delete address");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    setLoading(true);
    try {
      await profileService.setDefaultAddress(addressId);
      message.success("Default address updated");
      fetchAddresses();
    } catch (error) {
      message.error("Failed to set default address");
    } finally {
      setLoading(false);
    }
  };

  const ProfileTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.avatarSection}>
        <div className={styles.avatarWrapper}>
          <Avatar
            size={120}
            src={
              profile?.avatar_path
                ? `http://localhost:3001${profile.avatar_path}`
                : null
            }
            icon={<UserOutlined />}
            className={styles.avatar}
          />
          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={(info) => {
              const formData = new FormData();
              formData.append("avatar", info.file.originFileObj);
              profileService.updateProfile(formData);
            }}
          >
            <Button
              type="primary"
              shape="circle"
              icon={<CameraOutlined />}
              className={styles.avatarUpload}
            />
          </Upload>
        </div>
        <div>
          <h2>{profile?.fullname || "User"}</h2>
          <p>{profile?.email}</p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpdateProfile}
        disabled={loading}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Full Name" name="fullname">
              <Input prefix={<UserOutlined />} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Phone" name="phone_number">
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="Email" name="email">
              <Input prefix={<MailOutlined />} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Payment Method" name="payment_method">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Role" name="role">
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <div className={styles.btnGroup}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </div>
  );

  const PasswordTab = () => (
    <div className={styles.tabContent}>
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={handleChangePassword}
        className="max-w-md"
      >
        <Form.Item
          label="Old Password"
          name="oldPassword"
          rules={[{ required: true, message: "Please input old password!" }]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: "Please input new password!" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
        <Form.Item
          label="Confirm New Password"
          name="confirmNewPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm new password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon={<LockOutlined />}
          block
          loading={loading}
        >
          Change Password
        </Button>
      </Form>
    </div>
  );

  const AddressesTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.sectionTitle}>
        <h3>Your Addresses</h3>
        <Button
          type="primary"
          onClick={() => setAddressModalVisible(true)}
          icon={<EditOutlined />}
        >
          Add New Address
        </Button>
      </div>

      <div className={styles.addressList}>
        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No addresses found</p>
            <Button onClick={() => setAddressModalVisible(true)}>
              Add your first address
            </Button>
          </div>
        ) : (
          addresses.map((address) => (
            <AddressCard
              key={address.address_id}
              address={address}
              isDefault={address.is_default}
              onEdit={setEditingAddress}
              onDelete={handleDeleteAddress}
              onSetDefault={handleSetDefault}
            />
          ))
        )}
      </div>
    </div>
  );

  if (loading && !profile) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Profile</h1>
        <Button onClick={fetchProfile} loading={loading} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="profile-tabs"
      >
        <TabPane tab="Profile Info" key="profile">
          <ProfileTab />
        </TabPane>
        <TabPane tab="Password" key="password">
          <PasswordTab />
        </TabPane>
        <TabPane tab="Addresses" key="addresses">
          <AddressesTab />
        </TabPane>
      </Tabs>

      <AddressForm
        visible={addressModalVisible}
        onCancel={() => {
          setAddressModalVisible(false);
          setEditingAddress(null);
        }}
        onSubmit={editingAddress ? handleEditAddress : handleAddAddress}
        initialData={editingAddress}
        loading={loading}
      />
    </div>
  );
};

export default Profile;
