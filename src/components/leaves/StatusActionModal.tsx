import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface LeaveRequest {
    id: string;
    employee_name: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    total_days: number;
}

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    leave: LeaveRequest | null;
    type: 'approve' | 'reject';
    onConfirm: (id: string, notes: string) => void;
    loading?: boolean;
}

const StatusActionModal: React.FC<ActionModalProps> = ({
    isOpen, onClose, leave, type, onConfirm, loading
}) => {
    const [notes, setNotes] = useState('');

    if (!isOpen || !leave) return null;

    const isReject = type === 'reject';

    const handleConfirm = () => {
        if (isReject && !notes.trim()) {
            return;
        }
        onConfirm(leave.id, notes);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
            <div style={{
                background: 'white', borderRadius: '0.75rem', padding: '2rem', maxWidth: '500px', width: '90%',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f766e' }}>
                        {isReject ? 'Reject Leave Request' : 'Approve Leave Request'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#6b7280" />
                    </button>
                </div>

                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Request Summary</div>
                    <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Employee:</span>
                            <span style={{ fontWeight: 500 }}>{leave.employee_name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Leave Type:</span>
                            <span style={{ fontWeight: 500 }}>{leave.leave_type}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                            <span style={{ fontWeight: 500 }}>{leave.total_days} days</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                            <span style={{ fontWeight: 500 }}>
                                {format(new Date(leave.start_date), 'MM/dd/yyyy')} - {format(new Date(leave.end_date), 'MM/dd/yyyy')}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Admin Notes <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({isReject ? 'Required' : 'Optional'})</span>
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={isReject ? "Please provide a reason for rejection..." : "Add any notes or comments about this approval..."}
                        rows={4}
                        style={{
                            width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem', outline: 'none',
                            borderColor: isReject && !notes.trim() ? '#fca5a5' : 'var(--border)'
                        }}
                    />
                    {isReject && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', padding: '0.75rem', background: '#fff7ed', borderRadius: '0.5rem', border: '1px solid #ffedd1' }}>
                            <AlertCircle size={18} color="#f97316" style={{ flexShrink: 0 }} />
                            <div style={{ fontSize: '0.75rem', color: '#9a3412' }}>
                                <div style={{ fontWeight: 700, marginBottom: '2px' }}>Important</div>
                                Please provide a clear reason for rejecting this leave request. The employee will be notified with your comments.
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border)', background: 'white', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading || (isReject && !notes.trim())}
                        style={{
                            flex: 1, padding: '0.75rem', border: 'none',
                            background: isReject ? '#7f1d1d' : '#0f766e',
                            color: 'white', borderRadius: '0.5rem', fontWeight: 600,
                            cursor: (loading || (isReject && !notes.trim())) ? 'not-allowed' : 'pointer',
                            opacity: (loading || (isReject && !notes.trim())) ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Processing...' : (isReject ? 'Confirm Rejection' : 'Confirm Approval')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusActionModal;
