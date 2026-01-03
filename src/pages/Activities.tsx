import React, { useState, useEffect } from 'react';
import { Calendar, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Activity {
  id: string;
  name?: string;
  type?: string;
  project?: string;
  responsibleEmployee?: string;
  status?: string;
  approval?: string;
  approvalStatus?: string;
  date?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  duration?: string;
  team?: string[];
  description?: string;
  images?: string[];
}

interface ActivityStats {
  planned: number;
  implemented: number;
  approved: number;
  pending: number;
}

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({ planned: 6, implemented: 3, approved: 1, pending: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [approvalFilter, setApprovalFilter] = useState('Approval Status');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);

  const statuses = ['All Status', 'Implemented', 'Planned', 'Pending'];
  const approvalStatuses = ['Approval Status', 'Approved', 'Rejected', 'Pending', 'No Status'];

  useEffect(() => {
    fetchActivities();
  }, [selectedDate]);

  const fetchActivities = async () => {
    try {
      const res = await api.get(`/location-activities?date=${selectedDate}`);
      setActivities(res.data.activities || []);
      setStats(res.data.stats || { planned: 0, implemented: 0, approved: 0, pending: 0 });
    } catch (error) {
      console.error('Failed to fetch activities', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedActivity) return;
    try {
      await api.patch(`/location-activities/${selectedActivity.id}/approve`);
      toast.success('Activity approved');
      setShowApprovalModal(false);
      setSelectedActivity(null);
      fetchActivities();
    } catch (error) {
      toast.error('Failed to approve activity');
    }
  };

  const handleReject = async () => {
    if (!selectedActivity) return;
    try {
      await api.patch(`/location-activities/${selectedActivity.id}/reject`);
      toast.success('Activity rejected');
      setShowApprovalModal(false);
      setSelectedActivity(null);
      fetchActivities();
    } catch (error) {
      toast.error('Failed to reject activity');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/location-activities/${deleteTarget.id}`);
      toast.success('Activity deleted');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchActivities();
    } catch (error) {
      toast.error('Failed to delete activity');
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = searchTerm === '' ||
      (activity.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Status' || (activity.status || 'Planned') === statusFilter;
    const approvalValue = activity.approval || activity.approvalStatus || 'pending';
    const matchesApproval = approvalFilter === 'Approval Status' || approvalValue === approvalFilter;
    
    return matchesSearch && matchesStatus && matchesApproval;
  });

  const getStatusStyle = (status: string | undefined) => {
    if (!status) {
      return { bg: '#f3f4f6', text: '#374151' };
    }
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

  const getApprovalStyle = (approval: string | undefined) => {
    if (!approval) {
      return { bg: '#f3f4f6', text: '#6b7280' };
    }
    switch (approval.toLowerCase()) {
      case 'approved':
        return { bg: '#dcfce7', text: '#166534' };
      case 'rejected':
        return { bg: '#fee2e2', text: '#991b1b' };
      case 'pending':
        return { bg: '#fef3c7', text: '#92400e' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Activities
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Activities
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          View all planned & implemented activities across the organization
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#e0f2fe', padding: '1.5rem', borderRadius: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: '#0ea5e9', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Calendar size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0c4a6e' }}>{stats.planned}</div>
              <div style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>Planned Activities</div>
            </div>
          </div>
        </div>

        <div style={{ background: '#dcfce7', padding: '1.5rem', borderRadius: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: '#10b981', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <CheckCircle size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#065f46' }}>{stats.implemented}</div>
              <div style={{ fontSize: '0.85rem', color: '#065f46' }}>Implemented Activities</div>
            </div>
          </div>
        </div>

        <div style={{ background: '#d1fae5', padding: '1.5rem', borderRadius: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: '#059669', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <CheckCircle size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#064e3b' }}>{stats.approved}</div>
              <div style={{ fontSize: '0.85rem', color: '#064e3b' }}>Approved Activities</div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fef3c7', padding: '1.5rem', borderRadius: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: '#f59e0b', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Calendar size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#78350f' }}>{stats.pending}</div>
              <div style={{ fontSize: '0.85rem', color: '#78350f' }}>Pending Activities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--text-muted)" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '0.6rem',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              outline: 'none'
            }}
          >
            {statuses.map(status => <option key={status}>{status}</option>)}
          </select>

          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              outline: 'none'
            }}
          >
            {approvalStatuses.map(status => <option key={status}>{status}</option>)}
          </select>

          <input
            type="text"
            placeholder="Search by activity name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              outline: 'none',
              flex: 1,
              minWidth: '200px'
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Activity</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Type</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Project</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Responsible Employee</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Approval</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No activities found
                </td>
              </tr>
            ) : (
              filteredActivities.map(activity => {
                const statusStyle = getStatusStyle(activity.status || 'Planned');
                const approvalStyle = getApprovalStyle(activity.approval || activity.approvalStatus || 'pending');
                return (
                  <tr key={activity.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{activity.name || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{activity.type || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{activity.project || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{activity.responsibleEmployee || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        background: statusStyle.bg,
                        color: statusStyle.text
                      }}>
                        {activity.status || 'Planned'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        background: approvalStyle.bg,
                        color: approvalStyle.text
                      }}>
                        {activity.approval || activity.approvalStatus || 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedActivity(activity);
                            setShowDetailsModal(true);
                          }}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '0.25rem',
                            padding: '0.4rem',
                            cursor: 'pointer',
                            display: 'flex'
                          }}
                          title="View Details"
                        >
                          <Eye size={16} color="#6b7280" />
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
                          <Trash2 size={16} color="#6b7280" />
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
        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', borderTop: '1px solid var(--border)' }}>
          <button style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border)', background: 'white', borderRadius: '0.25rem', cursor: 'pointer' }}>&lt;</button>
          <button style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border)', background: 'var(--primary)', color: 'white', borderRadius: '0.25rem', cursor: 'pointer' }}>1</button>
          <button style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border)', background: 'white', borderRadius: '0.25rem', cursor: 'pointer' }}>2</button>
          <button style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border)', background: 'white', borderRadius: '0.25rem', cursor: 'pointer' }}>3</button>
          <button style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border)', background: 'white', borderRadius: '0.25rem', cursor: 'pointer' }}>&gt;</button>
        </div>
      </div>

      {/* Activity Details Modal */}
      {showDetailsModal && selectedActivity && (
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
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            {/* Header with Delete Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                Activity Details <span style={{ color: 'var(--primary)' }}>[ {selectedActivity.name} ]</span>
              </h2>
              <button
                onClick={() => {
                  setDeleteTarget(selectedActivity);
                  setShowDeleteModal(true);
                  setShowDetailsModal(false);
                }}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex'
                }}
                title="Delete Activity"
              >
                <Trash2 size={18} color="#6b7280" />
              </button>
            </div>

            {/* Images */}
            {selectedActivity.images && selectedActivity.images.length > 0 && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '1rem', 
                marginBottom: '1.5rem' 
              }}>
                {selectedActivity.images.map((img, idx) => (
                  <div key={idx} style={{
                    width: '100%',
                    height: '150px',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    background: '#f3f4f6'
                  }}>
                    <img 
                      src={img} 
                      alt={`Activity ${idx + 1}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Details */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600 }}>Location : </span>
                <span style={{ color: 'var(--text-muted)' }}>{selectedActivity.location || 'N/A'}</span>
              </div>
              
              {(selectedActivity.latitude || selectedActivity.longitude) && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>Assigned location coordinates : </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Lat : {selectedActivity.latitude} &nbsp;&nbsp; Lng : {selectedActivity.longitude}
                  </span>
                </div>
              )}
              
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600 }}>Date : </span>
                <span style={{ color: 'var(--text-muted)' }}>{selectedActivity.date}</span>
              </div>
              
              {selectedActivity.duration && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>Duration : </span>
                  <span style={{ color: 'var(--text-muted)' }}>{selectedActivity.duration}</span>
                </div>
              )}
              
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600 }}>Responsible Employee : </span>
                <span style={{ color: 'var(--text-muted)' }}>{selectedActivity.responsibleEmployee}</span>
              </div>
              
              {selectedActivity.team && selectedActivity.team.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>Team : </span>
                  <span style={{ color: 'var(--text-muted)' }}>{selectedActivity.team.join(', ')}</span>
                </div>
              )}
              
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600 }}>Status : </span>
                <span style={{ color: 'var(--text-muted)' }}>{selectedActivity.status}</span>
              </div>
              
              {selectedActivity.description && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Description :</div>
                  <div style={{ 
                    padding: '1rem', 
                    background: '#f9fafb', 
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    lineHeight: '1.6'
                  }}>
                    {selectedActivity.description}
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowDetailsModal(false); setSelectedActivity(null); }}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedActivity && (
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
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Activity Approval</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ marginBottom: '0.5rem' }}><strong>Activity:</strong> {selectedActivity.name}</p>
              <p style={{ marginBottom: '0.5rem' }}><strong>Type:</strong> {selectedActivity.type}</p>
              <p style={{ marginBottom: '0.5rem' }}><strong>Project:</strong> {selectedActivity.project}</p>
              <p style={{ marginBottom: '0.5rem' }}><strong>Responsible:</strong> {selectedActivity.responsibleEmployee}</p>
              <p style={{ marginBottom: '0.5rem' }}><strong>Current Status:</strong> {selectedActivity.approval}</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleApprove}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <CheckCircle size={18} /> Approve
              </button>
              <button
                onClick={handleReject}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <XCircle size={18} /> Reject
              </button>
              <button
                onClick={() => { setShowApprovalModal(false); setSelectedActivity(null); }}
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
            </div>
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

export default Activities;
