import React, { useCallback, useEffect, useState } from 'react';
import { Table, Button, Tag, message, Select, Input, Popconfirm } from 'antd';
import {
    ReloadOutlined,
    CheckCircleOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import adminService from '@services/adminService';
import styles from './PendingPayments.module.css';

const STATUS_OPTIONS = [
    { label: 'Chờ thanh toán', value: 'pending' },
    { label: 'Đã thanh toán', value: 'paid' },
    { label: 'Hết hạn', value: 'expired' },
];

const STATUS_COLORS = {
    pending: { color: '#d97706', bg: '#fef3c7' },
    paid: { color: '#059669', bg: '#ecfdf5' },
    expired: { color: '#dc2626', bg: '#fee2e2' },
};

const PendingPayments = () => {
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [search, setSearch] = useState('');
    const [confirmingId, setConfirmingId] = useState(null);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminService.getPendingPayments({
                status: statusFilter,
                page,
                limit: pageSize,
            });
            if (res.success) {
                const list = res.data.payments || [];
                const filtered = search
                    ? list.filter(
                          (item) =>
                              item.payment_id
                                  ?.toLowerCase()
                                  .includes(search.toLowerCase()) ||
                              item.payment_code
                                  ?.toLowerCase()
                                  .includes(search.toLowerCase()) ||
                              item.user?.fullname
                                  ?.toLowerCase()
                                  .includes(search.toLowerCase()) ||
                              item.user?.phoneNumber?.includes(search),
                      )
                    : list;
                setPayments(filtered);
                setTotal(res.data.total || filtered.length);
            }
        } catch {
            message.error('Không thể tải danh sách thanh toán');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, page, pageSize, search]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleConfirm = async (paymentId) => {
        setConfirmingId(paymentId);
        try {
            await adminService.confirmPendingPayment(paymentId);
            message.success('Đã xác nhận thanh toán');
            fetchPayments();
        } catch (error) {
            message.error(
                error?.response?.data?.message || 'Xác nhận thất bại',
            );
        } finally {
            setConfirmingId(null);
        }
    };

    const columns = [
        {
            title: 'Mã thanh toán',
            dataIndex: 'payment_code',
            key: 'payment_code',
            width: '16%',
            render: (code, record) => (
                <div className={styles.codeCell}>
                    <div className={styles.codePrimary}>{code || '—'}</div>
                    <div className={styles.codeSub}>
                        #{record.payment_id?.slice(0, 8).toUpperCase()}
                    </div>
                </div>
            ),
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            width: '20%',
            render: (_, record) => (
                <div className={styles.customerCell}>
                    <div className={styles.customerName}>
                        {record.user?.fullname || '—'}
                    </div>
                    <div className={styles.customerPhone}>
                        {record.user?.phoneNumber || record.user?.email || ''}
                    </div>
                </div>
            ),
        },
        {
            title: 'Số tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            width: '12%',
            render: (amount) => (
                <span className={styles.amountText}>
                    {Number(amount || 0).toLocaleString('vi-VN')}₫
                </span>
            ),
        },
        {
            title: 'Nội dung',
            dataIndex: 'payment_code',
            key: 'payment_code_info',
            width: '16%',
            render: (code) => (
                <span className={styles.noteText}>{code || '—'}</span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'payment_status',
            key: 'payment_status',
            width: '12%',
            render: (status) => {
                const cfg = STATUS_COLORS[status] || STATUS_COLORS.pending;
                return (
                    <Tag
                        className={styles.statusTag}
                        style={{ color: cfg.color, background: cfg.bg }}
                    >
                        {STATUS_OPTIONS.find((opt) => opt.value === status)
                            ?.label || 'Chờ thanh toán'}
                    </Tag>
                );
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '12%',
            render: (date) =>
                date ? (
                    <div className={styles.dateCell}>
                        <div>{new Date(date).toLocaleDateString('vi-VN')}</div>
                        <div className={styles.dateTime}>
                            {new Date(date).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                    </div>
                ) : (
                    '—'
                ),
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: '12%',
            align: 'center',
            render: (_, record) => (
                <Popconfirm
                    title="Xác nhận đã nhận tiền?"
                    okText="Xác nhận"
                    cancelText="Huỷ"
                    onConfirm={() => handleConfirm(record.payment_id)}
                    disabled={record.payment_status !== 'pending'}
                >
                    <Button
                        size="small"
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        loading={confirmingId === record.payment_id}
                        disabled={record.payment_status !== 'pending'}
                    >
                        Đã nhận tiền
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Thanh toán VietQR</h1>
                    <p className={styles.pageSub}>
                        Danh sách phiên thanh toán đang chờ
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <Button icon={<ReloadOutlined />} onClick={fetchPayments}>
                        Làm mới
                    </Button>
                </div>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="Tìm theo mã / tên / SĐT"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                    <Select
                        value={statusFilter}
                        options={STATUS_OPTIONS}
                        onChange={(val) => setStatusFilter(val)}
                        className={styles.filterSelect}
                    />
                </div>
            </div>

            <Table
                rowKey="payment_id"
                loading={loading}
                columns={columns}
                dataSource={payments}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    onChange: (nextPage, nextSize) => {
                        setPage(nextPage);
                        setPageSize(nextSize);
                    },
                }}
                className={styles.table}
            />
        </div>
    );
};

export default PendingPayments;
