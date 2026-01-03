import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface LocationType {
  id: string;
  name: string;
  description?: string;
  status: string;
}

const LocationTypes: React.FC = () => {
  const [locationTypes, setLocationTypes] = useState<LocationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLocationType, setSelectedLocationType] = useState<LocationType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    fetchLocationTypes();
  }, []);

  const fetchLocationTypes = async () => {
    try {
      const res = await api.get('/location-types');
      setLocationTypes(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch location types:', error);
      toast.error('Failed to load location types');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error('Type name is required');
      return;
    }

    try {
      await api.post('/location-types', formData);
      toast.success('Location type added successfully');
      setShowAddModal(false);
      resetForm();
      fetchLocationTypes();
    } catch (error: any) {
      console.error('Error creating location type:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Failed to add location type';
      toast.error(errorMessage);
    }
  };

  const handleEdit = async () => {
    if (!selectedLocationType) return;
    try {
      await api.put(`/location-types/${selectedLocationType.id}`, formData);
      toast.success('Location type updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchLocationTypes();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update location type');
    }
  };

  const handleDelete = async () => {
    if (!selectedLocationType) return;
    try {
      await api.delete(`/location-types/${selectedLocationType.id}`);
      toast.success('Location type deleted successfully');
      setShowDeleteModal(false);
      setSelectedLocationType(null);
      fetchLocationTypes();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete location type');
    }
  };

  const openEditModal = (locationType: LocationType) => {
    setSelectedLocationType(locationType);
    setFormData({
      name: locationType.name,
      description: locationType.description || '',
      status: locationType.status
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (locationType: LocationType) => {
    setSelectedLocationType(locationType);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', status: 'active' });
    setSelectedLocationType(null);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(filteredLocationTypes.map(lt => lt.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredLocationTypes = locationTypes.filter(lt => {
    const matchesSearch = lt.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || 
      (statusFilter === 'Active' && lt.status === 'active') ||
      (statusFilter === 'Inactive' && lt.status === 'inactive');
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLocationTypes.length / itemsPerPage);
  const paginatedLocationTypes = filteredLocationTypes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Locations Management &gt; Location Type
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Location Type
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Define how attendance is recorded
        </p>
      </div>

      {/* Filters and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
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
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <input
            type="text"
            placeholder="Search by type name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              outline: 'none',
              flex: 1,
              maxWidth: '300px'
            }}
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: '#0ea5e9',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.5rem',
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
          Add Location Type
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)', width: '50px' }}>
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredLocationTypes.length && filteredLocationTypes.length > 0}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Type name</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Description</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLocationTypes.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No location types found
                </td>
              </tr>
            ) : (
              paginatedLocationTypes.map((lt) => (
                <tr key={lt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(lt.id)}
                      onChange={() => handleSelectItem(lt.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{lt.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{lt.description || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      background: lt.status === 'active' ? '#dbeafe' : '#f3f4f6',
                      color: lt.status === 'active' ? '#1e40af' : '#6b7280'
                    }}>
                      {lt.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => openEditModal(lt)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          padding: '0.4rem',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Edit"
                      >
                        <Edit2 size={16} color="#6b7280" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(lt)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          padding: '0.4rem',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Delete"
                      >
                        <Trash2 size={16} color="#6b7280" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
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
                  background: currentPage === i + 1 ? '#0ea5e9' : 'white',
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
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              &gt;
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
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
            width: '90%',
            position: 'relative'
          }}>
            <button
              onClick={() => { setShowAddModal(false); resetForm(); }}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Add New Location Type</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Type Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Type Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Type Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Description
                </label>
                <textarea
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={handleAdd}
                style={{
                  flex: 1,
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                style={{
                  flex: 1,
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
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

      {/* Edit Modal */}
      {showEditModal && (
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
            width: '90%',
            position: 'relative'
          }}>
            <button
              onClick={() => { setShowEditModal(false); resetForm(); }}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <X size={20} />
            </button>

            <button
              onClick={() => {
                if (selectedLocationType) {
                  openDeleteModal(selectedLocationType);
                  setShowEditModal(false);
                }
              }}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '3rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
              title="Delete"
            >
              <Trash2 size={20} color="#6b7280" />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Edit Location Type</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Type Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Type Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={handleEdit}
                style={{
                  flex: 1,
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Update
              </button>
              <button
                onClick={() => { setShowEditModal(false); resetForm(); }}
                style={{
                  flex: 1,
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
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

      {/* Delete Confirmation Modal */}
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
              <div style={{
                fontSize: '2rem',
                color: '#dc2626',
                fontWeight: 'bold'
              }}>!</div>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#dc2626' }}>
              Warning
            </h3>
            <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
              Are you Sure to delete this Location Type?
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              This action can't be undone
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedLocationType(null); }}
                style={{
                  flex: 1,
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
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

export default LocationTypes;

