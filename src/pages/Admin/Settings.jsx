import React from "react";
import { Card, Form, Input, Button, Switch, Select, Row, Col, Divider, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import styles from "./Settings.module.css";

const Settings = () => {
    const [form] = Form.useForm();

    const handleSave = () => {
        message.success("Settings saved successfully!");
    };

    return (
        <div className={styles.settingsPage}>
            <Row gutter={[24, 24]}>
                {/* General Settings */}
                <Col xs={24} lg={12}>
                    <Card title="⚙️ General Settings">
                        <Form layout="vertical" form={form}>
                            <Form.Item label="Application Name" name="appName">
                                <Input placeholder="Enter app name" defaultValue="Eatsy" />
                            </Form.Item>

                            <Form.Item label="Support Email" name="supportEmail">
                                <Input type="email" placeholder="support@eatsy.com" defaultValue="support@eatsy.com" />
                            </Form.Item>

                            <Form.Item label="Phone Number" name="phone">
                                <Input placeholder="Enter phone" defaultValue="+84 123 456 789" />
                            </Form.Item>

                            <Form.Item label="Address" name="address">
                                <Input.TextArea placeholder="Enter address" defaultValue="123 Main Street, City" />
                            </Form.Item>

                            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} block>
                                Save Changes
                            </Button>
                        </Form>
                    </Card>
                </Col>

                {/* Notification Settings */}
                <Col xs={24} lg={12}>
                    <Card title="🔔 Notification Settings">
                        <Form layout="vertical">
                            <Form.Item label="Email Notifications">
                                <Switch defaultChecked /> Enable email notifications
                            </Form.Item>

                            <Form.Item label="SMS Notifications">
                                <Switch defaultChecked /> Enable SMS notifications
                            </Form.Item>

                            <Form.Item label="Push Notifications">
                                <Switch defaultChecked /> Enable push notifications
                            </Form.Item>

                            <Form.Item label="Notification Frequency">
                                <Select
                                    defaultValue="realtime"
                                    options={[
                                        { label: "Real-time", value: "realtime" },
                                        { label: "Hourly", value: "hourly" },
                                        { label: "Daily", value: "daily" },
                                    ]}
                                />
                            </Form.Item>

                            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} block>
                                Save Changes
                            </Button>
                        </Form>
                    </Card>
                </Col>

                {/* Payment Settings */}
                <Col xs={24} lg={12}>
                    <Card title="💳 Payment Settings">
                        <Form layout="vertical">
                            <Form.Item label="Payment Gateway">
                                <Select
                                    defaultValue="stripe"
                                    options={[
                                        { label: "Stripe", value: "stripe" },
                                        { label: "PayPal", value: "paypal" },
                                        { label: "Vnpay", value: "vnpay" },
                                    ]}
                                />
                            </Form.Item>

                            <Form.Item label="API Key">
                                <Input.Password placeholder="Enter API key" />
                            </Form.Item>

                            <Form.Item label="Enable Test Mode">
                                <Switch defaultChecked /> Use test mode
                            </Form.Item>

                            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} block>
                                Save Changes
                            </Button>
                        </Form>
                    </Card>
                </Col>

                {/* Security Settings */}
                <Col xs={24} lg={12}>
                    <Card title="🔐 Security Settings">
                        <Form layout="vertical">
                            <Form.Item label="Two-Factor Authentication">
                                <Switch /> Enable 2FA
                            </Form.Item>

                            <Form.Item label="Session Timeout (minutes)">
                                <Input type="number" defaultValue={30} />
                            </Form.Item>

                            <Form.Item label="Password Expiry (days)">
                                <Input type="number" defaultValue={90} />
                            </Form.Item>

                            <Form.Item label="IP Whitelist">
                                <Input.TextArea placeholder="Enter IP addresses (one per line)" rows={3} />
                            </Form.Item>

                            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} block>
                                Save Changes
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>

            {/* Danger Zone */}
            <Card title="⚠️ Danger Zone" style={{ marginTop: 24 }} className={styles.dangerZone}>
                <Divider />
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Button danger block>
                            Clear Cache
                        </Button>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Button danger block>
                            Reset to Default
                        </Button>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Settings;
