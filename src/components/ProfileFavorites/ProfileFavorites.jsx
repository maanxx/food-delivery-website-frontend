import React from 'react';
import { Row, Col, Empty } from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import DishCard from '../DishCard/DishCard';
import styles from './ProfileFavorites.module.css';

const ProfileFavorites = () => {
  // Mock favorites for now as it's not implemented in backend
  const favorites = []; 

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Món ăn yêu thích</h2>
        <p className={styles.subtitle}>Lưu lại những món ăn bạn yêu thích để đặt lại nhanh chóng</p>
      </div>

      {favorites.length > 0 ? (
        <Row gutter={[16, 16]}>
          {favorites.map((dish) => (
            <Col xs={24} sm={12} md={8} key={dish.id}>
              <DishCard dish={dish} />
            </Col>
          ))}
        </Row>
      ) : (
        <div className={styles.empty}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className={styles.emptyText}>
                Bạn chưa yêu thích món ăn nào.
              </span>
            }
          >
            <p className={styles.emptyHint}>Hãy nhấn vào biểu tượng trái tim trên các món ăn để thêm vào đây!</p>
          </Empty>
        </div>
      )}
    </div>
  );
};

export default ProfileFavorites;
