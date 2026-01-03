import React, { useState, useEffect } from 'react';
import { X, Upload, Calendar } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface Employee {
    id: string;
    full_name: string;
}

interface AddLeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    isSelfMode?: boolean;
}

const AddLeaveModal: React.FC<AddLeaveModalProps> = ({ isOpen, onClose, onSuccess, isSelfMode = false }) => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);

    // Simplified: now using the prop passed from the parent page

    const [formData, setFormData] = useState({
        employee_id: '',
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
        document_url: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (isSelfMode && user?.employeeId) {
                setFormData(prev => ({ ...prev, employee_id: user.employeeId }));
            } else if (!isSelfMode) {
                fetchEmployees();
            }
        }
    }, [isOpen, isSelfMode, user]);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees');
            setEmployees(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    };

    const calculateTotalDays = () => {
        if (!formData.start_date || !formData.end_date) return 0;
        const start = new Date(formData.start_date);
        const end = new Date(formData.end_date);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays > 0 ? diffDays : 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const submissionData = {
            ...formData,
            employee_id: isSelfMode ? user?.employeeId : formData.employee_id
        };

        if (!submissionData.employee_id || !submissionData.leave_type || !submissionData.start_date || !submissionData.end_date) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            await api.post('/leaves', submissionData);
            toast.success('Leave request submitted successfully');
            onSuccess();
            onClose();
            setFormData({
                employee_id: '',
                leave_type: '',
                start_date: '',
                end_date: '',
                reason: '',
                document_url: ''
            });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to submit leave request');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const Label = ({ children }: { children: React.ReactNode }) => (
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>
            {children}
        </label>
    );

    const InputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.6rem 0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        outline: 'none',
        fontSize: '0.9rem'
    };

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

                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#004d40', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Request Leave
                </h2>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: '1.5rem' }} />

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {!isSelfMode && (
                        <div>
                            <Label>Employee</Label>
                            <select
                                value={formData.employee_id}
                                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                style={InputStyle}
                            >
                                <option value="">Select an Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <Label>Leave Type</Label>
                        <select
                            value={formData.leave_type}
                            onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                            style={InputStyle}
                        >
                            <option value="">Select Leave Type</option>
                            <option value="Annual Leave">Annual Leave</option>
                            <option value="Sick Leave">Sick Leave</option>
                            <option value="Emergency Leave">Emergency Leave</option>
                            <option value="Unpaid Leave">Unpaid Leave</option>
                            <option value="Compensatory Time Off">Compensatory Time Off</option>
                            <option value="Maternity Leave">Maternity Leave</option>
                            <option value="Paternity Leave">Paternity Leave</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <Label>Start Date</Label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    style={{ ...InputStyle, paddingRight: '2.5rem' }}
                                />
                                <Calendar size={18} color="#6b7280" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            </div>
                        </div>
                        <div>
                            <Label>End Date</Label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    style={{ ...InputStyle, paddingRight: '2.5rem' }}
                                />
                                <Calendar size={18} color="#6b7280" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>Total Days</Label>
                        <input
                            type="text"
                            readOnly
                            value={calculateTotalDays() ? `${calculateTotalDays()} days` : 'Select dates to calculate'}
                            style={{ ...InputStyle, background: '#f3f4f6', color: '#6b7280' }}
                        />
                    </div>

                    <div>
                        <Label>Reason</Label>
                        <textarea
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="Please provide a reason for leave request..."
                            rows={4}
                            style={{ ...InputStyle, resize: 'none' }}
                        />
                    </div>

                    <div>
                        <Label>Supporting Document <span style={{ fontWeight: 400, color: '#6b7280' }}>(Optional)</span></Label>
                        <div style={{
                            border: '1px dashed #d1d5db',
                            borderRadius: '0.375rem',
                            padding: '1.5rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Upload size={24} color="#6b7280" />
                            <div style={{ fontSize: '0.85rem', color: '#374151' }}>Click to upload or drag and drop</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>PDF, DOC, or Image (max 10MB)</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', background: 'white', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1, padding: '0.75rem', border: 'none', background: '#004d40', color: 'white', borderRadius: '0.375rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLeaveModal;
