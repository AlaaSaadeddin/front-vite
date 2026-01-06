import React, { useState, useEffect } from 'react';
import {
    Mail, MessageSquare, HelpCircle, Send, Plus,
    FileText, Clock, AlertCircle, ChevronRight, Upload, X
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Ticket {
    id: string;
    subject: string;
    category: string;
    status: 'In Progress' | 'Resolved' | 'Closed';
    created_at: string;
}

const Support: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        subject: '',
        category: '',
        message: '',
        attachment_url: ''
    });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await api.get('/support/tickets');
            setTickets(res.data.data);
        } catch (error) {
            console.error('Failed to fetch tickets', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subject || !formData.category || !formData.message) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post('/support/tickets', formData);
            toast.success('Support ticket submitted successfully');
            setTickets([res.data.data, ...tickets]);
            setFormData({ subject: '', category: '', message: '', attachment_url: '' });
        } catch (error) {
            console.error('Failed to submit ticket', error);
            toast.error('Failed to submit ticket');
        } finally {
            setSubmitting(false);
        }
    };

    const clearForm = () => {
        setFormData({ subject: '', category: '', message: '', attachment_url: '' });
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                More &gt; Support
            </div>

            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    Support
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Get help and support from our team
                </p>
            </div>

            {/* Quick Contact Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', background: 'rgba(5, 150, 105, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Mail size={20} color="var(--primary)" />
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Contact Support</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Get in touch with our support team via email</p>
                        <button style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Email Us</button>
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', background: 'rgba(5, 150, 105, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MessageSquare size={20} color="var(--primary)" />
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Submit a Ticket</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Create a support ticket and track its status</p>
                        <button style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Create Ticket</button>
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', background: 'rgba(5, 150, 105, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <HelpCircle size={20} color="var(--primary)" />
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>FAQ</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Find answers to commonly asked questions</p>
                        <button style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>View FAQ</button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '2rem' }}>
                {/* Submit Ticket Form */}
                <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Submit a Support Ticket</h3>
                    </div>
                    <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>Subject</label>
                            <input
                                type="text"
                                name="subject"
                                placeholder="Brief description of your issue"
                                value={formData.subject}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', background: 'white' }}
                            >
                                <option value="">Select Category</option>
                                <option value="Technical">Technical Issue</option>
                                <option value="Account">Account Access</option>
                                <option value="Attendance">Attendance/GPS</option>
                                <option value="Leave">Leave Management</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>Message</label>
                            <textarea
                                name="message"
                                placeholder="Describe your issue detail..."
                                rows={6}
                                value={formData.message}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', resize: 'vertical' }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Please provide as much detail as possible to help us resolve your issue quickly</p>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>Attach File <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span></label>
                            <div style={{
                                border: '2px dashed var(--border)',
                                borderRadius: '0.5rem',
                                padding: '2rem',
                                textAlign: 'center',
                                background: '#F9FAFB',
                                cursor: 'pointer'
                            }}>
                                <Upload size={24} color="#9CA3AF" style={{ marginBottom: '0.75rem' }} />
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>Click to upload or drag and drop</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>PDF, DOC, or Image (max 10MB)</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 2rem',
                                    borderRadius: '0.5rem',
                                    fontWeight: 600,
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Send size={18} />
                                {submitting ? 'Submitting...' : 'Submit Ticket'}
                            </button>
                            <button
                                type="button"
                                onClick={clearForm}
                                style={{
                                    background: 'white',
                                    color: 'var(--text-main)',
                                    border: '1px solid var(--border)',
                                    padding: '0.75rem 2rem',
                                    borderRadius: '0.5rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Clear Form
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Recent Tickets */}
                    <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Recent Tickets</h3>
                        </div>
                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {tickets.length === 0 ? (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No recent tickets</p>
                            ) : tickets.map((ticket) => (
                                <div key={ticket.id} style={{ padding: '0.85rem', borderRadius: '0.5rem', background: '#F0FDF4', border: '1px solid #DCFCE7' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>TICK-{ticket.id.substring(0, 4).toUpperCase()}</span>
                                        <span style={{
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            padding: '0.15rem 0.5rem',
                                            borderRadius: '4px',
                                            background: ticket.status === 'In Progress' ? '#E5E7EB' : '#D1FAE5',
                                            color: ticket.status === 'In Progress' ? '#4B5563' : '#047857'
                                        }}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{ticket.subject}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                </div>
                            ))}
                            <button style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}>View All Tickets</button>
                        </div>
                    </div>

                    {/* Support Hours */}
                    <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Support Hours</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <Clock size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Business Hours</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mon - Fri: 9:00 AM - 6:00 PM</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <Clock size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Average Response Time</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>4 hours during business hours</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Support */}
                    <div style={{ background: 'linear-gradient(to right, #FEF2F2, #FFF1F2)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #FECACA', textAlign: 'center' }}>
                        <button style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            background: '#991B1B',
                            color: 'white',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(153, 27, 27, 0.2)'
                        }}>
                            Contact Emergency Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
