import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import { EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import { useAddress } from '@hooks/useAddress';
import { Skeleton } from 'antd';

import AddressCard from '../AddressCard/AddressCard';
import AddressForm from '../AddressForm/AddressForm';
import ProfileEmptyState from '../ProfileEmptyState/ProfileEmptyState';
import styles from './ProfileAddresses.module.css';

// UPDATED
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
        const addrId = editingAddress.address_id || editingAddress.addressId;
        result = await updateAddress(addrId, values);
      } else {
        result = await addAddress(values);
      }

      // Only close and reset if the action was successful
      if (result.meta?.requestStatus === 'fulfilled') {
        setFormVisible(false);
        setEditingAddress(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <div className={styles.container}>
         <div className={styles.header}>
            <Skeleton.Button active size="large" style={{ width: 200 }} />
            <Skeleton.Button active size="large" style={{ width: 150 }} />
         </div>
         <div className={styles.list}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ padding: '20px', border: '1px solid #f0f0f0', borderRadius: '16px' }}>
                <Skeleton active avatar={{ size: 'small', shape: 'circle' }} paragraph={{ rows: 2 }} />
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
              key={addr.address_id}
              address={addr}
              isDefault={addr.is_default}
              isDeleting={loadingMap[addr.address_id]?.deleting}
              isSettingDefault={loadingMap[addr.address_id]?.settingDefault}
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
