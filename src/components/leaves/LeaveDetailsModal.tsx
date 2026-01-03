import React from 'react';
import { X, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface LeaveRequest {
    id: string;
    employee_id: string;
    employee_name: string;
    employee_avatar?: string;
    position_name?: string;
    department_name?: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    total_days: number;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string;
    created_at: string;
}

interface LeaveDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    leave: LeaveRequest | null;
    onApprove?: (leave: LeaveRequest) => void;
    onReject?: (leave: LeaveRequest) => void;
}

const LeaveDetailsModal: React.FC<LeaveDetailsModalProps> = ({
    isOpen, onClose, leave, onApprove, onReject
}) => {
    if (!isOpen || !leave) return null;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved':
                return { bg: '#ccfbf1', color: '#0d9488', label: 'Approved' };
            case 'rejected':
                return { bg: '#fee2e2', color: '#ef4444', label: 'Rejected' };
            default:
                return { bg: '#f3f4f6', color: '#6b7280', label: 'Pending' };
        }
    };

    const statusStyle = getStatusStyle(leave.status);

    const Label = ({ children }: { children: React.ReactNode }) => (
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
            {children}
        </label>
    );

    const ReadOnlyField = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
        <div style={{
            padding: '0.6rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            background: '#f9fafb',
            color: '#374151',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            minHeight: '42px'
        }}>
            <span style={{ flex: 1 }}>{children}</span>
            {Icon && <Icon size={18} color="#6b7280" />}
        </div>
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'white', borderRadius: '0.5rem', padding: '1.5rem 2rem 2rem', maxWidth: '500px', width: '90%',
                position: 'relative', maxHeight: '90vh', overflowY: 'auto'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem'
                    }}
                >
                    <X size={20} color="#6b7280" />
                </button>

                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#004d40', marginBottom: '1.50rem', textAlign: 'center' }}>
                    Leave Request Details
                </h2>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: '1.5rem' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Only show employee info if available (Admin View) */}
                    {leave.employee_name && (
                        <div style={{ marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
                                Employee Information
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <Label>Name</Label>
                                    <ReadOnlyField>{leave.employee_name}</ReadOnlyField>
                                </div>
                                <div>
                                    <Label>Position</Label>
                                    <ReadOnlyField>{leave.position_name || 'N/A'}</ReadOnlyField>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
                            Leave Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <Label>Leave Type</Label>
                                <ReadOnlyField>{leave.leave_type}</ReadOnlyField>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <div style={{
                                    padding: '0.35rem 1rem',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    background: statusStyle.bg,
                                    color: statusStyle.color,
                                    display: 'inline-block',
                                    marginTop: '0.15rem'
                                }}>
                                    {statusStyle.label}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <Label>Start Date</Label>
                                <ReadOnlyField icon={Calendar}>
                                    {format(new Date(leave.start_date), 'MM/dd/yyyy')}
                                </ReadOnlyField>
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <ReadOnlyField icon={Calendar}>
                                    {format(new Date(leave.end_date), 'MM/dd/yyyy')}
                                </ReadOnlyField>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <Label>Total Days</Label>
                            <ReadOnlyField>{leave.total_days} days</ReadOnlyField>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <Label>Reason</Label>
                            <div style={{
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                background: '#f9fafb',
                                color: '#374151',
                                fontSize: '0.9rem',
                                minHeight: '60px'
                            }}>
                                {leave.reason || 'No reason provided'}
                            </div>
                        </div>

                        {(leave.status !== 'pending' || leave.admin_notes) && (
                            <div style={{ marginBottom: '1rem' }}>
                                <Label>Admin Notes</Label>
                                <div style={{
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    background: '#f9fafb',
                                    color: '#374151',
                                    fontSize: '0.9rem',
                                    minHeight: '60px'
                                }}>
                                    {leave.admin_notes || 'No notes provided'}
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '0.5rem' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>Submitted Date</div>
                            <div style={{ fontSize: '0.9rem', color: '#111827' }}>
                                {format(new Date(leave.created_at), 'MM/dd/yyyy')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer for Admin Actions if needed */}
                {leave.status === 'pending' && onApprove && onReject && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button
                            onClick={() => onReject(leave)}
                            style={{
                                flex: 1, padding: '0.75rem', border: '1px solid #fb7185', color: '#e11d48',
                                background: 'white', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            Reject
                        </button>
                        <button
                            onClick={() => onApprove(leave)}
                            style={{
                                flex: 1, padding: '0.75rem', border: 'none', color: 'white',
                                background: '#00695c', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            Approve
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaveDetailsModal;
