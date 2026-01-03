import React, { useState, useEffect } from 'react';
import { Plus, Eye } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import AddLeaveModal from '../components/leaves/AddLeaveModal';
import LeaveDetailsModal from '../components/leaves/LeaveDetailsModal';

interface LeaveRequest {
    id: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    total_days: number;
    admin_notes?: string;
}

interface LeaveBalance {
    leave_type: string;
    total_days: number;
    used_days: number;
    remaining_days: number;
}

const MyLeave: React.FC = () => {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [leavesRes, statsRes] = await Promise.all([
                api.get('/leaves/my'),
                api.get('/leaves/my-stats')
            ]);
            setLeaves(leavesRes.data.data || []);
            setBalances(statsRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch my leave data:', error);
            toast.error('Failed to load leave data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved':
                return { bg: '#e6f4f1', color: '#2dd4bf', label: 'Approved' };
            case 'rejected':
                return { bg: '#fee2e2', color: '#ef4444', label: 'Rejected' };
            default:
                return { bg: '#f3f4f6', color: '#6b7280', label: 'Pending' };
        }
    };

    const filteredLeaves = leaves.filter(leave => {
        const matchesType = !typeFilter || leave.leave_type === typeFilter;
        const matchesStatus = !statusFilter || leave.status === statusFilter;
        return matchesType && matchesStatus;
    });

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Leave Management &gt; My Leave
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        Leave Requests
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        View your leave balance and history
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                        background: '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Plus size={18} />
                    Request Leave
                </button>
            </div>

            {/* Balance Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {balances.map((balance, index) => {
                    const progress = (balance.used_days / balance.total_days) * 100;
                    return (
                        <div key={index} style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                            <div style={{ color: '#0d9488', fontWeight: 600, marginBottom: '1rem', fontSize: '1rem' }}>{balance.leave_type}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>{balance.remaining_days}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ {balance.total_days} days</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: '#0d9488', borderRadius: '4px' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Used: {balance.used_days}</span>
                                <span style={{ color: 'var(--text-muted)' }}>Remaining: {balance.remaining_days}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', minWidth: '180px' }}
                >
                    <option value="">All Leave Type</option>
                    {balances.map(b => <option key={b.leave_type} value={b.leave_type}>{b.leave_type}</option>)}
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', minWidth: '150px' }}
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Leave Type</th>
                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Date Range</th>
                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Days</th>
                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Submitted Date</th>
                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Status</th>
                            <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : filteredLeaves.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No leave requests found</td></tr>
                        ) : (
                            filteredLeaves.map((leave) => {
                                const statusStyle = getStatusStyle(leave.status);
                                return (
                                    <tr key={leave.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1.25rem 1rem', fontWeight: 500, color: 'var(--text-main)' }}>{leave.leave_type}</td>
                                        <td style={{ padding: '1.25rem 1rem', color: 'var(--text-main)' }}>
                                            {format(new Date(leave.start_date), 'MM/dd/yyyy')} - {format(new Date(leave.end_date), 'MM/dd/yyyy')}
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem', color: 'var(--text-main)', fontWeight: 600 }}>{leave.total_days}</td>
                                        <td style={{ padding: '1.25rem 1rem', color: 'var(--text-muted)' }}>
                                            {format(new Date(leave.created_at), 'MM/dd/yyyy')}
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem' }}>
                                            <span style={{
                                                padding: '0.35rem 0.85rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                background: statusStyle.bg,
                                                color: statusStyle.color
                                            }}>
                                                {statusStyle.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                                            <button
                                                onClick={() => { setSelectedLeave(leave); setShowDetailsModal(true); }}
                                                style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.4rem', borderRadius: '0.25rem', cursor: 'pointer' }}
                                            >
                                                <Eye size={18} color="#6b7280" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <AddLeaveModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchData}
                isSelfMode={true}
            />

            {selectedLeave && (
                <LeaveDetailsModal
                    isOpen={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    leave={selectedLeave as any}
                />
            )}
        </div>
    );
};

export default MyLeave;
