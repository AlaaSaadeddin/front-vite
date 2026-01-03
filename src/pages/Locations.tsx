import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, MapPin } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Location {
  id: string;
  name: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  location_type?: string;
  status: string;
}

interface LocationType {
  id: string;
  name: string;
  status: string;
}

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationTypes, setLocationTypes] = useState<LocationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Type');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    location_type: '',
    status: 'active'
  });

  useEffect(() => {
    fetchLocationTypes();
  }, []);

  const fetchLocationTypes = async () => {
    try {
      const res = await api.get('/location-types');
      const types = res.data.data || res.data || [];
      setLocationTypes(types.filter((t: LocationType) => t.status === 'active'));
    } catch (error) {
      console.error('Failed to fetch location types:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'All Status') {
        params.status = statusFilter.toLowerCase();
      }
      if (typeFilter !== 'All Type') {
        params.type = typeFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const res = await api.get('/locations', { params });
      setLocations(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [statusFilter, typeFilter, searchTerm]);

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error('Location name is required');
      return;
    }

    try {
      await api.post('/locations', formData);
      toast.success('Location added successfully');
      setShowAddModal(false);
      resetForm();
      fetchLocations();
    } catch (error: any) {
      console.error('Error creating location:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Failed to add location';
      toast.error(errorMessage);
    }
  };

  const handleEdit = async () => {
    if (!selectedLocation) return;
    if (!formData.name.trim()) {
      toast.error('Location name is required');
      return;
    }

    try {
      await api.put(`/locations/${selectedLocation.id}`, formData);
      toast.success('Location updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchLocations();
    } catch (error: any) {
      console.error('Error updating location:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Failed to update location';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!selectedLocation) return;
    try {
      await api.delete(`/locations/${selectedLocation.id}`);
      toast.success('Location deleted successfully');
      setShowDeleteModal(false);
      setSelectedLocation(null);
      fetchLocations();
    } catch (error: any) {
      console.error('Error deleting location:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Failed to delete location';
      toast.error(errorMessage);
    }
  };

  const openEditModal = (location: Location) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      address: location.address || '',
      latitude: location.latitude?.toString() || '',
      longitude: location.longitude?.toString() || '',
      location_type: location.location_type || '',
      status: location.status
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (location: Location) => {
    setSelectedLocation(location);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      address: '', 
      latitude: '', 
      longitude: '', 
      location_type: '', 
      status: 'active' 
    });
    setSelectedLocation(null);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(paginatedLocations.map(loc => loc.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const totalPages = Math.ceil(locations.length / itemsPerPage);
  const paginatedLocations = locations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Locations Management &gt; Locations
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Locations
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage work and activity locations
        </p>
      </div>

      {/* Filters and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              outline: 'none',
              minWidth: '150px'
            }}
          >
            <option value="All Type">All Type</option>
            {locationTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
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
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <input
            type="text"
            placeholder="Search by location name"
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
          Add Location
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
                  checked={selectedItems.length === paginatedLocations.length && paginatedLocations.length > 0 && selectedItems.length > 0}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Location name</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Type</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Latitude</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Longitude</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLocations.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No locations found
                </td>
              </tr>
            ) : (
              paginatedLocations.map((loc) => (
                <tr key={loc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(loc.id)}
                      onChange={() => handleSelectItem(loc.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{loc.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{loc.location_type || '-'}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{loc.latitude || '-'}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{loc.longitude || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      background: loc.status === 'active' ? '#dbeafe' : '#f3f4f6',
                      color: loc.status === 'active' ? '#1e40af' : '#6b7280'
                    }}>
                      {loc.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => openEditModal(loc)}
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
                        onClick={() => openDeleteModal(loc)}
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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
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

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Add New Location</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Location Name
                </label>
                <input
                  type="text"
                  placeholder="Enter the Location Name"
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
                  Location Type
                </label>
                <select
                  value={formData.location_type}
                  onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                >
                  <option value="">Select Type</option>
                  {locationTypes.map(type => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Location Status
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                    Latitude
                  </label>
                  <input
                    type="text"
                    placeholder="Enter latitude"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
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
                    Longitude
                  </label>
                  <input
                    type="text"
                    placeholder="Enter longitude"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Map Placeholder */}
              <div style={{
                width: '100%',
                height: '200px',
                background: '#f3f4f6',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border)',
                position: 'relative'
              }}>
                <MapPin size={48} color="#9ca3af" />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '20px',
                  height: '20px',
                  background: '#dc2626',
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
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
                if (selectedLocation) {
                  openDeleteModal(selectedLocation);
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

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Edit Location</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Location Name
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
                  Location Type
                </label>
                <select
                  value={formData.location_type}
                  onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                >
                  <option value="">Select Type</option>
                  {locationTypes.map(type => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Location Status
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
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
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Map Placeholder */}
              <div style={{
                width: '100%',
                height: '200px',
                background: '#f3f4f6',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border)',
                position: 'relative'
              }}>
                <MapPin size={48} color="#9ca3af" />
                {formData.latitude && formData.longitude && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '20px',
                    height: '20px',
                    background: '#dc2626',
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                )}
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
              Are you Sure to delete this Location?
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
                onClick={() => { setShowDeleteModal(false); setSelectedLocation(null); }}
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

export default Locations;

