import React, { useEffect, useState } from 'react';
import { Button, Tag, Space, message, Modal, Spin } from 'antd';
import { EnvironmentOutlined, CheckCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import profileService from '@services/profileService';
import AddressForm from '../AddressForm/AddressForm'; // Reusing existing AddressForm
import ProfileEmptyState from '../ProfileEmptyState/ProfileEmptyState';
import styles from './ProfileAddresses.module.css';

const ProfileAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await profileService.getAddresses();
      // Expecting real API response struct: response.data.data
      setAddresses(response.data?.data || []);
    } catch (error) {
      message.error("Failed to fetch addresses.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values) => {
    try {
      if (editingAddress) {
        await profileService.updateAddress(editingAddress.address_id, values);
        message.success("Address updated!");
      } else {
        await profileService.addAddress(values);
        message.success("Address added!");
      }
      setFormVisible(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      message.error("Failed to save address.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await profileService.deleteAddress(id);
      message.success("Address deleted.");
      fetchAddresses();
    } catch (error) {
      message.error("Failed to delete address.");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await profileService.setDefaultAddress(id);
      message.success("Default address updated.");
      fetchAddresses();
    } catch (error) {
      message.error("Failed to set default.");
    }
  };

  if (loading) {
    return <div className={styles.loader}><Spin size="large" /></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Addresses</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => { setEditingAddress(null); setFormVisible(true); }}
        >
          Add New Address
        </Button>
      </div>

      <div className={styles.list}>
        {addresses.length === 0 ? (
          <ProfileEmptyState 
            title="No Addresses Found" 
            description="You haven't saved any delivery addresses yet." 
            buttonText="Add Address" 
            onAction={() => setFormVisible(true)}
            icon={EnvironmentOutlined}
          />
        ) : (
          addresses.map(addr => (
            <div key={addr.address_id} className={`${styles.card} ${addr.is_default ? styles.defaultCard : ''}`}>
              <div className={styles.cardHeader}>
                <h4 className={styles.title}>
                  <EnvironmentOutlined className={styles.icon} />
                  {addr.street}, {addr.city}
                </h4>
                {addr.is_default && <Tag color="green">Default</Tag>}
              </div>
              <p className={styles.phone}>Phone: {addr.phone || "Not provided"}</p>
              
              <div className={styles.actions}>
                {!addr.is_default && (
                  <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleSetDefault(addr.address_id)}>
                    Set Default
                  </Button>
                )}
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setEditingAddress(addr); setFormVisible(true); }}>
                  Edit
                </Button>
                <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(addr.address_id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        title={editingAddress ? "Edit Address" : "New Address"} 
        open={formVisible} 
        onCancel={() => setFormVisible(false)}
        footer={null}
        destroyOnClose
      >
        <AddressForm 
          initialData={editingAddress} 
          onSubmit={handleCreateOrUpdate} 
          onCancel={() => setFormVisible(false)} 
        />
      </Modal>
    </div>
  );
};

export default ProfileAddresses;
