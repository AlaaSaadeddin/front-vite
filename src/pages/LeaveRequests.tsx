import React, { useState, useEffect } from 'react';
import { Plus, Eye, Check, X, Search, Filter } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import AddLeaveModal from '../components/leaves/AddLeaveModal';
import LeaveDetailsModal from '../components/leaves/LeaveDetailsModal';
import StatusActionModal from '../components/leaves/StatusActionModal';
import DeleteModal from '../components/common/DeleteModal';

interface LeaveRequest {
    id: string;
    employee_id: string;
    employee_name: string;
    employee_avatar?: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
    submitted_date?: string;
    created_at: string;
    total_days: number;
    position_name?: string;
    department_name?: string;
    admin_notes?: string;
}

interface LeaveStats {
    pending_count: number;
    approved_count: number;
    rejected_count: number;
}

const LeaveRequests: React.FC = () => {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [stats, setStats] = useState<LeaveStats>({ pending_count: 0, approved_count: 0, rejected_count: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchLeaves();
    }, [typeFilter, statusFilter]);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await api.get('/leaves', {
                params: {
                    search: searchTerm,
                    type: typeFilter,
                    status: statusFilter
                }
            });
            setLeaves(res.data.data || []);
            setStats(res.data.stats || { pending_count: 0, approved_count: 0, rejected_count: 0 });
        } catch (error) {
            console.error('Failed to fetch leaves:', error);
            toast.error('Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLeaves();
    };

    const handleUpdateStatus = async (id: string, notes: string) => {
        try {
            setActionLoading(true);
            await api.put(`/leaves/${id}/status`, {
                status: actionType === 'approve' ? 'approved' : 'rejected',
                admin_notes: notes
            });
            toast.success(`Leave request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
            setShowActionModal(false);
            setShowDetailsModal(false);
            fetchLeaves();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || `Failed to ${actionType} leave request`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedLeave && selectedIds.length === 0) return;
        try {
            setActionLoading(true);
            const ids = selectedLeave ? [selectedLeave.id] : selectedIds;
            await api.delete('/leaves', { data: { ids } });
            toast.success(`Successfully deleted ${ids.length} leave request(s)`);
            setShowDeleteModal(false);
            setShowDetailsModal(false);
            setSelectedLeave(null);
            setSelectedIds([]);
            fetchLeaves();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to delete leave request(s)');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBulkReview = async () => {
        toast.success(`Marked ${selectedIds.length} requests as reviewed`);
        setSelectedIds([]);
    };

    const openActionModal = (leave: LeaveRequest, type: 'approve' | 'reject') => {
        setSelectedLeave(leave);
        setActionType(type);
        setShowActionModal(true);
    };

    const openDeleteModal = (leave: LeaveRequest | null = null) => {
        setSelectedLeave(leave);
        setShowDeleteModal(true);
    };

    const filteredLeaves = leaves;

    const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
    const paginatedLeaves = filteredLeaves.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Leave Management &gt; Leave Requests
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        Leave Requests
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Review and manage employee leave requests
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

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: '#f0fdfa', padding: '1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ background: '#2dd4bf', padding: '0.75rem', borderRadius: '0.75rem', color: 'white' }}>
                        <Filter size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f766e' }}>{stats.pending_count}</div>
                        <div style={{ color: '#0f766e', opacity: 0.8, fontSize: '0.9rem' }}>Pending</div>
                    </div>
                </div>
                <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ background: '#0ea5e9', padding: '0.75rem', borderRadius: '0.75rem', color: 'white' }}>
                        <Check size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0369a1' }}>{stats.approved_count}</div>
                        <div style={{ color: '#0369a1', opacity: 0.8, fontSize: '0.9rem' }}>Approved</div>
                    </div>
                </div>
                <div style={{ background: '#fff1f2', padding: '1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ background: '#f43f5e', padding: '0.75rem', borderRadius: '0.75rem', color: 'white' }}>
                        <X size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#9f1239' }}>{stats.rejected_count}</div>
                        <div style={{ color: '#9f1239', opacity: 0.8, fontSize: '0.9rem' }}>Rejected</div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        outline: 'none',
                        minWidth: '180px'
                    }}
                >
                    <option value="">All Leave Type</option>
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                    <option value="Unpaid Leave">Unpaid Leave</option>
                    <option value="Compensatory Time Off">Compensatory Time Off</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Paternity Leave">Paternity Leave</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        outline: 'none',
                        minWidth: '150px'
                    }}
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>

                <form onSubmit={handleSearch} style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by employee name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border)',
                            outline: 'none'
                        }}
                    />
                </form>

                {selectedIds.length > 0 && (
                    <select
                        onChange={(e) => {
                            if (e.target.value === 'delete') openDeleteModal();
                            else if (e.target.value === 'review') handleBulkReview();
                            e.target.value = '';
                        }}
                        style={{
                            padding: '0.6rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border)',
                            background: 'white',
                            cursor: 'pointer',
                            minWidth: '150px'
                        }}
                    >
                        <option value="">Bulk Actions</option>
                        <option value="delete">✕ Delete selected</option>
                        <option value="review">✓ Mark as reviewed</option>
                    </select>
                )}
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === paginatedLeaves.length && paginatedLeaves.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedIds(paginatedLeaves.map(l => l.id));
                                        } else {
                                            setSelectedIds([]);
                                        }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                />
                            </th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Employee name</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Leave Type</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Date Range</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Submitted Date</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : paginatedLeaves.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>No leave requests found</td></tr>
                        ) : (
                            paginatedLeaves.map((leave) => {
                                const statusStyle = getStatusStyle(leave.status);
                                return (
                                    <tr key={leave.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(leave.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedIds([...selectedIds, leave.id]);
                                                    } else {
                                                        setSelectedIds(selectedIds.filter(id => id !== leave.id));
                                                    }
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <img
                                                    src={leave.employee_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.employee_name)}&background=random`}
                                                    alt=""
                                                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                                <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{leave.employee_name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{leave.leave_type}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-main)' }}>
                                            {format(new Date(leave.start_date), 'MM/dd/yyyy')} - {format(new Date(leave.end_date), 'MM/dd/yyyy')}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            {format(new Date(leave.created_at), 'MM/dd/yyyy')}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '0.375rem',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                background: statusStyle.bg,
                                                color: statusStyle.color
                                            }}>
                                                {statusStyle.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button
                                                    title="View Details"
                                                    onClick={() => { setSelectedLeave(leave); setShowDetailsModal(true); }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid var(--border)',
                                                        padding: '0.4rem',
                                                        borderRadius: '0.25rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <Eye size={16} color="#6b7280" />
                                                </button>
                                                <button
                                                    title="Approve"
                                                    disabled={leave.status !== 'pending'}
                                                    onClick={() => openActionModal(leave, 'approve')}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid var(--border)',
                                                        padding: '0.4rem',
                                                        borderRadius: '0.25rem',
                                                        cursor: leave.status !== 'pending' ? 'not-allowed' : 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        opacity: leave.status !== 'pending' ? 0.3 : 1
                                                    }}
                                                >
                                                    <Check size={16} color="#0d9488" />
                                                </button>
                                                <button
                                                    title="Reject"
                                                    disabled={leave.status !== 'pending'}
                                                    onClick={() => openActionModal(leave, 'reject')}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid var(--border)',
                                                        padding: '0.4rem',
                                                        borderRadius: '0.25rem',
                                                        cursor: leave.status !== 'pending' ? 'not-allowed' : 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        opacity: leave.status !== 'pending' ? 0.3 : 1
                                                    }}
                                                >
                                                    <X size={16} color="#dc2626" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', borderTop: '1px solid var(--border)' }}>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '0.5rem 0.75rem',
                                border: '1px solid var(--border)',
                                background: 'white',
                                borderRadius: '0.25rem',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            &lt;
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    border: '1px solid var(--border)',
                                    background: currentPage === i + 1 ? '#0d9488' : 'white',
                                    color: currentPage === i + 1 ? 'white' : 'var(--text-main)',
                                    borderRadius: '0.25rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '0.5rem 0.75rem',
                                border: '1px solid var(--border)',
                                background: 'white',
                                borderRadius: '0.25rem',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                            }}
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddLeaveModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchLeaves}
                isSelfMode={false}
            />

            <LeaveDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                leave={selectedLeave}
                onApprove={(l) => openActionModal(l, 'approve')}
                onReject={(l) => openActionModal(l, 'reject')}
            />

            <StatusActionModal
                isOpen={showActionModal}
                onClose={() => setShowActionModal(false)}
                leave={selectedLeave}
                type={actionType}
                onConfirm={handleUpdateStatus}
                loading={actionLoading}
            />

            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Warning"
                message={selectedLeave ? "Are you sure you want to delete this leave request?" : `Are you sure you want to delete ${selectedIds.length} leave requests?`}
            />
        </div>
    );
};

export default LeaveRequests;
