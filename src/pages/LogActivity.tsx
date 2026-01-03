import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Activity {
  id: string;
  name: string;
  type: string;
  project: string;
  date: string;
  duration: string;
  location: string;
  status: string;
  description: string;
}

const LogActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Workshop',
    project: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    location: '',
    status: 'Planned',
    description: ''
  });

  const activityTypes = ['Workshop', 'Group Session', 'Training', 'Meeting', 'Field Visit'];
  const statuses = ['Planned', 'Implemented', 'Pending'];

  useEffect(() => {
    fetchMyActivities();
  }, []);

  const fetchMyActivities = async () => {
    try {
      const res = await api.get('/location-activities/my-activities');
      setActivities(res.data || []);
    } catch (error) {
      console.error('Failed to fetch activities', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Workshop',
      project: '',
      date: new Date().toISOString().split('T')[0],
      duration: '',
      location: '',
      status: 'Planned',
      description: ''
    });
    setEditingActivity(null);
  };

  const handleOpenModal = (activity?: Activity) => {
    if (activity) {
      setEditingActivity(activity);
      setFormData({
        name: activity.name,
        type: activity.type,
        project: activity.project,
        date: activity.date,
        duration: activity.duration,
        location: activity.location,
        status: activity.status,
        description: activity.description
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingActivity) {
        await api.put(`/location-activities/${editingActivity.id}`, formData);
        toast.success('Activity updated successfully');
      } else {
        await api.post('/location-activities', formData);
        toast.success('Activity logged successfully');
      }
      setShowModal(false);
      resetForm();
      fetchMyActivities();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to save activity');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/location-activities/${deleteTarget.id}`);
      toast.success('Activity deleted successfully');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchMyActivities();
    } catch (error) {
      toast.error('Failed to delete activity');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'implemented':
        return { bg: '#dcfce7', text: '#166534' };
      case 'planned':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'pending':
        return { bg: '#fef3c7', text: '#92400e' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Activities &gt; Log Activity
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            My Activities
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Log and manage your activities
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={20} /> Log New Activity
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Activity Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Type</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Project</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Duration</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Location</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No activities logged yet. Click "Log New Activity" to get started.
                </td>
              </tr>
            ) : (
              activities.map(activity => {
                const statusStyle = getStatusStyle(activity.status);
                return (
                  <tr key={activity.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{activity.name}</td>
                    <td style={{ padding: '1rem' }}>{activity.type}</td>
                    <td style={{ padding: '1rem' }}>{activity.project}</td>
                    <td style={{ padding: '1rem' }}>{activity.date}</td>
                    <td style={{ padding: '1rem' }}>{activity.duration}</td>
                    <td style={{ padding: '1rem' }}>{activity.location}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        background: statusStyle.bg,
                        color: statusStyle.text
                      }}>
                        {activity.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleOpenModal(activity)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '0.25rem',
                            padding: '0.4rem',
                            cursor: 'pointer',
                            display: 'flex'
                          }}
                          title="Edit"
                        >
                          <Edit size={16} color="#6b7280" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(activity);
                            setShowDeleteModal(true);
                          }}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '0.25rem',
                            padding: '0.4rem',
                            cursor: 'pointer',
                            display: 'flex'
                          }}
                          title="Delete"
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                {editingActivity ? 'Edit Activity' : 'Log New Activity'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <X size={24} color="#6b7280" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Activity Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter activity name"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                  >
                    {activityTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Status <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                  >
                    {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Project <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter project name"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Date <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                    placeholder="e.g., 2 hr"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter location"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  placeholder="Enter activity description"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {editingActivity ? 'Update Activity' : 'Log Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <div style={{ fontSize: '2rem', color: '#dc2626', fontWeight: 'bold' }}>!</div>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#dc2626' }}>Warning</h3>
            <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Are you sure you want to delete this activity?</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>This action can't be undone</p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogActivity;
