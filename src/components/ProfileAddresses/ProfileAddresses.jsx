import React, { useEffect, useState } from 'react';
import { Button, Modal, Skeleton } from 'antd';
import { EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import { useAddress } from '@hooks/useAddress';

import AddressCard from '../AddressCard/AddressCard';
import AddressForm from '../AddressForm/AddressForm';
import ProfileEmptyState from '../ProfileEmptyState/ProfileEmptyState';
import styles from './ProfileAddresses.module.css';

const ProfileAddresses = () => {
  const { 
    addresses,
    loading, 
    loadingMap, 
    fetchAddresses, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress 
  } = useAddress();

  const [formVisible, setFormVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleCreateOrUpdate = async (values) => {
    setIsSubmitting(true);
    try {
      let result;
      if (editingAddress) {
        result = await updateAddress(editingAddress.addressId, values);
      } else {
        result = await addAddress(values);
      }
      if (result.meta?.requestStatus === 'fulfilled') {
        setFormVisible(false);
        setEditingAddress(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // DEBUG: Log addresses on every render
  console.log("RENDER ADDRESSES:", addresses);

  if (loading && addresses.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div style={{ width: 200, height: 40, background: '#f5f5f5', borderRadius: 8 }} />
          <div style={{ width: 120, height: 40, background: '#f5f5f5', borderRadius: 8 }} />
        </div>
        <div className={styles.list}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ padding: '20px', border: '1px solid #f0f0f0', borderRadius: '16px', marginBottom: 16 }}>
              <Skeleton active avatar paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>Quản lý địa chỉ</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          className={styles.addBtn}
          onClick={() => { setEditingAddress(null); setFormVisible(true); }}
        >
          Thêm địa chỉ mới
        </Button>
      </div>

      <div className={styles.list}>
        {addresses.length === 0 ? (
          <ProfileEmptyState 
            title="Chưa có địa chỉ nào" 
            description="Hãy thêm địa chỉ giao hàng để đặt món nhanh hơn." 
            buttonText="Thêm ngay" 
            onAction={() => setFormVisible(true)}
            icon={EnvironmentOutlined}
          />
        ) : (
          addresses.map(addr => (
            <AddressCard 
              key={addr.addressId}
              address={addr}
              isDeleting={loadingMap[addr.addressId]?.deleting}
              isSettingDefault={loadingMap[addr.addressId]?.settingDefault}
              onEdit={(a) => { setEditingAddress(a); setFormVisible(true); }}
              onDelete={deleteAddress}
              onSetDefault={setDefaultAddress}
            />
          ))
        )}
      </div>

      <Modal 
        title={editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"} 
        open={formVisible} 
        onCancel={() => setFormVisible(false)}
        footer={null}
        destroyOnClose
      >
        <AddressForm 
          visible={formVisible}
          initialData={editingAddress} 
          onSubmit={handleCreateOrUpdate} 
          onCancel={() => setFormVisible(false)} 
          loading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default ProfileAddresses;
