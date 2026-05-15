import React from 'react';
import { Card, Row, Col, Tag, Button } from 'antd';
import { 
  CreditCardOutlined, 
  WalletOutlined, 
  BankOutlined, 
  PlusOutlined,
  DollarOutlined
} from '@ant-design/icons';
import styles from './ProfilePayment.module.css';

const ProfilePayment = () => {
  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      title: 'Thẻ tín dụng/Ghi nợ',
      description: 'Liên kết thẻ Visa, Mastercard hoặc JCB',
      icon: <CreditCardOutlined />,
      status: 'Not Linked',
    },
    {
      id: 2,
      type: 'e-wallet',
      title: 'Ví điện tử',
      description: 'MoMo, ZaloPay, ShopeePay',
      icon: <WalletOutlined />,
      status: 'Not Linked',
    },
    {
      id: 3,
      type: 'bank',
      title: 'Tài khoản ngân hàng',
      description: 'Liên kết trực tiếp với ngân hàng của bạn',
      icon: <BankOutlined />,
      status: 'Not Linked',
    },
    {
      id: 4,
      type: 'cod',
      title: 'Thanh toán tiền mặt',
      description: 'Thanh toán trực tiếp khi nhận hàng',
      icon: <DollarOutlined />,
      status: 'Default',
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Phương thức thanh toán</h2>
        <p className={styles.subtitle}>Quản lý các phương thức thanh toán an toàn của bạn</p>
      </div>

      <Row gutter={[16, 16]}>
        {paymentMethods.map((method) => (
          <Col xs={24} md={12} key={method.id}>
            <Card className={styles.paymentCard}>
              <div className={styles.cardContent}>
                <div className={styles.iconWrapper}>
                  {method.icon}
                </div>
                <div className={styles.info}>
                  <div className={styles.titleRow}>
                    <h4 className={styles.methodTitle}>{method.title}</h4>
                    <Tag color={method.status === 'Default' ? '#ff914c' : 'default'}>
                      {method.status}
                    </Tag>
                  </div>
                  <p className={styles.methodDesc}>{method.description}</p>
                </div>
              </div>
              <div className={styles.cardActions}>
                {method.status === 'Default' ? (
                  <Button type="link" disabled>Đang sử dụng</Button>
                ) : (
                  <Button type="link" icon={<PlusOutlined />}>Liên kết ngay</Button>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProfilePayment;
