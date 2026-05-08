import React from 'react';
import { List, Switch, Select, Divider, Button } from 'antd';
import { 
  BellOutlined, 
  GlobalOutlined, 
  SafetyCertificateOutlined,
  EyeOutlined
} from '@ant-design/icons';
import styles from './ProfileSettings.module.css';

const ProfileSettings = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Thiết lập tài khoản</h2>
        <p className={styles.subtitle}>Quản lý các tùy chọn và thông báo của bạn</p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}><BellOutlined /> Thông báo</h3>
        <List className={styles.settingsList}>
          <List.Item actions={[<Switch defaultChecked />]}>
            <List.Item.Meta
              title="Thông báo email"
              description="Nhận cập nhật về đơn hàng và khuyến mãi qua email"
            />
          </List.Item>
          <List.Item actions={[<Switch defaultChecked />]}>
            <List.Item.Meta
              title="Thông báo đẩy (Push)"
              description="Nhận thông báo tức thì trên trình duyệt hoặc điện thoại"
            />
          </List.Item>
          <List.Item actions={[<Switch />]}>
            <List.Item.Meta
              title="Thông báo tin nhắn (SMS)"
              description="Nhận mã OTP và trạng thái đơn hàng qua SMS"
            />
          </List.Item>
        </List>
      </div>

      <Divider />

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}><GlobalOutlined /> Tùy chọn hiển thị</h3>
        <List className={styles.settingsList}>
          <List.Item actions={[
            <Select defaultValue="vi" style={{ width: 120 }}>
              <Select.Option value="vi">Tiếng Việt</Select.Option>
              <Select.Option value="en">English</Select.Option>
            </Select>
          ]}>
            <List.Item.Meta
              title="Ngôn ngữ"
              description="Chọn ngôn ngữ hiển thị trên website"
            />
          </List.Item>
          <List.Item actions={[
            <Select defaultValue="vnd" style={{ width: 120 }}>
              <Select.Option value="vnd">VNĐ (₫)</Select.Option>
              <Select.Option value="usd">USD ($)</Select.Option>
            </Select>
          ]}>
            <List.Item.Meta
              title="Tiền tệ"
              description="Chọn đơn vị tiền tệ hiển thị"
            />
          </List.Item>
        </List>
      </div>

      <Divider />

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}><SafetyCertificateOutlined /> Quyền riêng tư</h3>
        <List className={styles.settingsList}>
          <List.Item actions={[<Switch />]}>
            <List.Item.Meta
              title="Hồ sơ công khai"
              description="Cho phép người khác thấy danh sách món ăn yêu thích của bạn"
            />
          </List.Item>
          <List.Item actions={[<Button type="link">Quản lý</Button>]}>
            <List.Item.Meta
              title="Dữ liệu cá nhân"
              description="Yêu cầu xuất dữ liệu hoặc xóa tài khoản vĩnh viễn"
            />
          </List.Item>
        </List>
      </div>
    </div>
  );
};

export default ProfileSettings;
