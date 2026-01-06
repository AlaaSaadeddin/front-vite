import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Bell, Mail, Smartphone } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface NotificationSettings {
    attendance_check_in_out_email: boolean;
    attendance_check_in_out_in_app: boolean;
    attendance_late_arrival_email: boolean;
    attendance_late_arrival_in_app: boolean;
    attendance_early_departure_email: boolean;
    attendance_early_departure_in_app: boolean;
    leave_new_request_email: boolean;
    leave_new_request_in_app: boolean;
    leave_request_approved_email: boolean;
    leave_request_approved_in_app: boolean;
    leave_request_rejected_email: boolean;
    leave_request_rejected_in_app: boolean;
    activity_new_assigned_email: boolean;
    activity_new_assigned_in_app: boolean;
    activity_completed_email: boolean;
    activity_completed_in_app: boolean;
    activity_overdue_email: boolean;
    activity_overdue_in_app: boolean;
}

const NotificationSettings: React.FC = () => {
    const [settings, setSettings] = useState<NotificationSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/notifications/settings');
            setSettings(res.data.data);
        } catch (error) {
            console.error('Failed to fetch notification settings', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key: keyof NotificationSettings) => {
        if (!settings) return;
        setSettings({ ...settings, [key]: !settings[key] });
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            await api.put('/notifications/settings', settings);
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save notification settings', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (!settings) return;
        // Reset to default values (all true)
        const defaults: NotificationSettings = Object.keys(settings).reduce((acc, key) => {
            if (key !== 'user_id' && key !== 'updated_at') {
                (acc as any)[key] = true;
            }
            return acc;
        }, {} as NotificationSettings);
        setSettings(defaults);
        toast.success('Settings reset to defaults');
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
    if (!settings) return <div style={{ padding: '2rem' }}>Error loading settings</div>;

    const sections = [
        {
            title: 'Attendance Notifications',
            description: 'Manage how you receive notifications about system activities',
            icon: <Bell size={20} color="var(--primary)" />,
            items: [
                {
                    label: 'Check-in/Check-out',
                    description: 'Email & In-app notifications',
                    emailKey: 'attendance_check_in_out_email' as const,
                    inAppKey: 'attendance_check_in_out_in_app' as const
                },
                {
                    label: 'Late Arrival',
                    description: 'Email & In-app notifications',
                    emailKey: 'attendance_late_arrival_email' as const,
                    inAppKey: 'attendance_late_arrival_in_app' as const
                },
                {
                    label: 'Early Departure',
                    description: 'Email & In-app notifications',
                    emailKey: 'attendance_early_departure_email' as const,
                    inAppKey: 'attendance_early_departure_in_app' as const
                }
            ]
        },
        {
            title: 'Leave Notifications',
            description: 'Receive updates on leave requests and approvals',
            icon: <Bell size={20} color="var(--primary)" />,
            items: [
                {
                    label: 'New Leave Request',
                    description: 'Notify when a new request is submitted',
                    emailKey: 'leave_new_request_email' as const,
                    inAppKey: 'leave_new_request_in_app' as const
                },
                {
                    label: 'Request Approved',
                    description: 'Notify when a request is approved',
                    emailKey: 'leave_request_approved_email' as const,
                    inAppKey: 'leave_request_approved_in_app' as const
                },
                {
                    label: 'Request Rejected',
                    description: 'Notify when a request is rejected',
                    emailKey: 'leave_request_rejected_email' as const,
                    inAppKey: 'leave_request_rejected_in_app' as const
                }
            ]
        },
        {
            title: 'Activity Notifications',
            description: 'Stay updated on field activities and reports',
            icon: <Bell size={20} color="var(--primary)" />,
            items: [
                {
                    label: 'New Activity Assigned',
                    description: 'Notify when a new activity is created',
                    emailKey: 'activity_new_assigned_email' as const,
                    inAppKey: 'activity_new_assigned_in_app' as const
                },
                {
                    label: 'Activity Completed',
                    description: 'Notify when an activity is completed',
                    emailKey: 'activity_completed_email' as const,
                    inAppKey: 'activity_completed_in_app' as const
                },
                {
                    label: 'Activity Overdue',
                    description: 'Notify when an activity is overdue',
                    emailKey: 'activity_overdue_email' as const,
                    inAppKey: 'activity_overdue_in_app' as const
                }
            ]
        }
    ];

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                More &gt; Notifications Settings
            </div>

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    Notifications Settings
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Manage how you receive notifications about system activities
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {sections.map((section, sIdx) => (
                    <div key={sIdx} style={{
                        background: 'white',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '0.5rem',
                                background: 'rgba(5, 150, 105, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {section.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{section.title}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{section.description}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ color: 'transparent' }}>Label</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    <Mail size={14} /> Email Notifications
                                </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    <Smartphone size={14} /> In-App Notifications
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {section.items.map((item, iIdx) => (
                                <div key={iIdx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', alignItems: 'center', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{item.label}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.description}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <Toggle
                                            checked={settings[item.emailKey]}
                                            onChange={() => handleToggle(item.emailKey)}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <Toggle
                                            checked={settings[item.inAppKey]}
                                            onChange={() => handleToggle(item.inAppKey)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-start', gap: '1rem' }}>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 2rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                >
                    {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                    onClick={handleReset}
                    style={{
                        background: 'white',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    Reset to Defaults
                </button>
            </div>
        </div>
    );
};

// Simple Toggle Component
const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => {
    return (
        <div
            onClick={onChange}
            style={{
                width: '40px',
                height: '20px',
                background: checked ? 'var(--primary)' : '#D1D5DB',
                borderRadius: '10px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                padding: '0 2px'
            }}
        >
            <div style={{
                width: '16px',
                height: '16px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                left: checked ? '22px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
        </div>
    );
};

export default NotificationSettings;
