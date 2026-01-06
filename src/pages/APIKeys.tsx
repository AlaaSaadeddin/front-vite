import React, { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, Copy, Trash2, RotateCw, AlertTriangle, Shield, Calendar, CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface APIKey {
    id: string;
    name: string;
    api_key: string;
    permissions: string[];
    status: 'Active' | 'Revoked';
    created_at: string;
    last_used_at: string | null;
}

const APIKeys: React.FC = () => {
    const [keys, setKeys] = useState<APIKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['Read']);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const res = await api.get('/api-keys');
            setKeys(res.data.data);
        } catch (error) {
            console.error('Failed to fetch API keys', error);
            toast.error('Failed to load API keys');
        } finally {
            setLoading(false);
        }
    };

    const toggleKeyVisibility = (id: string) => {
        const next = new Set(visibleKeys);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setVisibleKeys(next);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('API Key copied to clipboard');
    };

    const handleCreateKey = async () => {
        if (!newKeyName) {
            toast.error('Please enter a key name');
            return;
        }
        setCreating(true);
        try {
            const res = await api.post('/api-keys', {
                name: newKeyName,
                permissions: newKeyPermissions
            });
            setKeys([res.data.data, ...keys]);
            setShowModal(false);
            setNewKeyName('');
            setNewKeyPermissions(['Read']);
            toast.success('API Key generated successfully');
        } catch (error) {
            console.error('Failed to generate API key', error);
            toast.error('Failed to generate API key');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteKey = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) return;
        try {
            await api.delete(`/api-keys/${id}`);
            setKeys(keys.filter(k => k.id !== id));
            toast.success('API Key deleted');
        } catch (error) {
            console.error('Failed to delete API key', error);
            toast.error('Failed to delete API key');
        }
    };

    const handleRotateKey = async (id: string) => {
        if (!window.confirm('Are you sure you want to rotate this API key? The old key will stop working immediately.')) return;
        try {
            const res = await api.put(`/api-keys/${id}/rotate`);
            setKeys(keys.map(k => k.id === id ? res.data.data : k));
            toast.success('API Key rotated');
        } catch (error) {
            console.error('Failed to rotate API key', error);
            toast.error('Failed to rotate API key');
        }
    };

    const maskKey = (key: string) => {
        const prefix = key.substring(0, 8);
        return `${prefix}${'•'.repeat(16)}`;
    };

    const togglePermission = (perm: string) => {
        if (newKeyPermissions.includes(perm)) {
            setNewKeyPermissions(newKeyPermissions.filter(p => p !== perm));
        } else {
            setNewKeyPermissions([...newKeyPermissions, perm]);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                More &gt; API Keys
            </div>

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    API Keys
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Manage API keys for integrations and third-party access
                </p>
            </div>

            {/* Warning Alert */}
            <div style={{
                background: '#FFFBEB',
                border: '1px solid #FEF3C7',
                borderRadius: '0.5rem',
                padding: '1rem',
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <AlertTriangle size={24} color="#D97706" />
                <div>
                    <h4 style={{ fontWeight: 600, color: '#92400E', fontSize: '0.95rem' }}>Important</h4>
                    <p style={{ color: '#B45309', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Keep your API keys secure and never share them publicly. API keys provide access to sensitive data and system operations.
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <Plus size={20} />
                    Generate New API Key
                </button>
            </div>

            {/* API Keys Table */}
            <div style={{
                background: 'white',
                borderRadius: '0.75rem',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border)',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>Your API Keys</h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Key Name</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>API Key</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Permissions</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Created Date</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No API keys generated yet
                                    </td>
                                </tr>
                            ) : keys.map((key) => (
                                <tr key={key.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{key.name}</div>
                                        {key.last_used_at && <div style={{ fontSize: '0.75rem', color: 'var(--green-main)', marginTop: '4px' }}>Last used: {new Date(key.last_used_at).toLocaleDateString()}</div>}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'monospace', fontSize: '0.9rem', color: '#374151', background: '#F3F4F6', padding: '0.35rem 0.6rem', borderRadius: '0.35rem', width: 'fit-content' }}>
                                            {visibleKeys.has(key.id) ? key.api_key : maskKey(key.api_key)}
                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                <button onClick={() => toggleKeyVisibility(key.id)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#6B7280' }}>
                                                    {visibleKeys.has(key.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                                <button onClick={() => copyToClipboard(key.api_key)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#6B7280' }}>
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {key.permissions.map(p => (
                                                <span key={p} style={{ background: '#E0F2FE', color: '#0369A1', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>{p}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#4B5563' }}>
                                        {new Date(key.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span style={{
                                            background: key.status === 'Active' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: key.status === 'Active' ? 'var(--green-main)' : 'var(--red-main)',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '999px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            width: 'fit-content'
                                        }}>
                                            {key.status === 'Active' && <CheckCircle2 size={12} />}
                                            {key.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button onClick={() => handleRotateKey(key.id)} title="Rotate Key" style={{ background: 'none', border: '1px solid var(--border)', padding: '6px', borderRadius: '0.35rem', cursor: 'pointer', color: '#6B7280' }}>
                                                <RotateCw size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteKey(key.id)} title="Delete Key" style={{ background: 'none', border: '1px solid var(--border)', padding: '6px', borderRadius: '0.35rem', cursor: 'pointer', color: '#EF4444' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Mock) */}
                <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{ background: 'none', border: '1px solid var(--border)', padding: '4px', borderRadius: '0.35rem', color: '#9CA3AF', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
                        {[1, 2, 3].map(p => (
                            <button key={p} style={{
                                background: p === 1 ? 'rgba(5, 150, 105, 0.1)' : 'none',
                                color: p === 1 ? 'var(--primary)' : 'var(--text-muted)',
                                border: 'none',
                                width: '32px',
                                height: '32px',
                                borderRadius: '0.35rem',
                                fontWeight: p === 1 ? 600 : 400,
                                cursor: 'pointer'
                            }}>{p}</button>
                        ))}
                        <button style={{ background: 'none', border: '1px solid var(--border)', padding: '4px', borderRadius: '0.35rem', color: '#6B7280', cursor: 'pointer' }}><ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        width: '450px',
                        padding: '1.5rem',
                        position: 'relative',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                        >
                            <X size={24} />
                        </button>

                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Generate New API Key</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Create a new security key to access the system API.</p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Key Name</label>
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="e.g. Production API"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    outline: 'none',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>Permissions</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {['Read', 'Write'].map((perm) => (
                                    <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={newKeyPermissions.includes(perm)}
                                            onChange={() => togglePermission(perm)}
                                            style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                                        />
                                        <span style={{ fontSize: '0.95rem' }}>{perm}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'white',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateKey}
                                disabled={creating}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: creating ? 'not-allowed' : 'pointer',
                                    opacity: creating ? 0.7 : 1
                                }}
                            >
                                {creating ? 'Generating...' : 'Generate Key'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default APIKeys;
