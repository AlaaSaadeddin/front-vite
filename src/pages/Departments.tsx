import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Department {
  id: string;
  name: string;
  description?: string;
  status: string;
  employeeCount?: number;
  employee_count?: number; // Backend returns snake_case
}

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await api.post('/departments', formData);
      toast.success('Department added successfully');
      setShowAddModal(false);
      resetForm();
      fetchDepartments();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to add department');
    }
  };

  const handleEdit = async () => {
    if (!selectedDepartment) return;
    try {
      await api.put(`/departments/${selectedDepartment.id}`, formData);
      toast.success('Department updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchDepartments();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to update department');
    }
  };

  const handleDelete = async () => {
    if (!selectedDepartment) return;
    try {
      await api.delete(`/departments/${selectedDepartment.id}`);
      toast.success('Department deleted successfully');
      setShowDeleteModal(false);
      setSelectedDepartment(null);
      fetchDepartments();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to delete department');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await api.post('/departments/bulk-action', {
        action: 'delete',
        ids: selectedIds
      });
      toast.success(`Successfully deleted ${selectedIds.length} department(s)`);
      setSelectedIds([]);
      fetchDepartments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete departments');
    }
  };

  const handleBulkReview = async () => {
    try {
      await api.post('/departments/bulk-action', {
        action: 'review',
        ids: selectedIds
      });
      toast.success(`Successfully marked ${selectedIds.length} department(s) as reviewed`);
      setSelectedIds([]);
      fetchDepartments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to mark departments as reviewed');
    }
  };

  const openEditModal = (dept: Department) => {
    setSelectedDepartment(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      status: dept.status
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (dept: Department) => {
    setSelectedDepartment(dept);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', status: 'active' });
    setSelectedDepartment(null);
  };

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dept.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || dept.id === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        User Management &gt; Departments
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Departments
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your organization departments
        </p>
      </div>

      {/* Filters and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              outline: 'none',
              minWidth: '150px'
            }}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
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
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <input
            type="text"
            placeholder="Search by department name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              outline: 'none',
              flex: 1,
              maxWidth: '400px'
            }}
          />
        </div>

        {/* Bulk Actions - Shows when items are selected */}
        {selectedIds.length > 0 && (
          <div style={{ position: 'relative' }}>
            <select
              onChange={(e) => {
                if (e.target.value === 'delete') {
                  if (window.confirm(`Delete ${selectedIds.length} selected department(s)?`)) {
                    handleBulkDelete();
                  }
                } else if (e.target.value === 'review') {
                  handleBulkReview();
                }
                e.target.value = '';
              }}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                outline: 'none',
                background: 'white',
                cursor: 'pointer',
                minWidth: '150px'
              }}
            >
              <option value="">Bulk Actions</option>
              <option value="delete">✕ Delete selected</option>
              <option value="review">✓ Mark as reviewed</option>
            </select>
          </div>
        )}

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
          Add Department
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === paginatedDepartments.length && paginatedDepartments.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(paginatedDepartments.map(d => d.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Department Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Employee Count</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDepartments.map((dept) => (
              <tr key={dept.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(dept.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds([...selectedIds, dept.id]);
                      } else {
                        setSelectedIds(selectedIds.filter(id => id !== dept.id));
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>{dept.name}</td>
                <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{dept.employee_count || dept.employeeCount || 0}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    background: dept.status === 'active' ? '#ccfbf1' : '#f3f4f6',
                    color: dept.status === 'active' ? '#0f766e' : '#6b7280'
                  }}>
                    {dept.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      onClick={() => openEditModal(dept)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        padding: '0.4rem',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Edit2 size={16} color="#6b7280" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(dept)}
                      disabled={(dept.employee_count || dept.employeeCount || 0) > 0}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        padding: '0.4rem',
                        borderRadius: '0.25rem',
                        cursor: (dept.employee_count || dept.employeeCount || 0) > 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: (dept.employee_count || dept.employeeCount || 0) > 0 ? 0.4 : 1,
                        filter: (dept.employee_count || dept.employeeCount || 0) > 0 ? 'grayscale(1)' : 'none'
                      }}
                      title={(dept.employee_count || dept.employeeCount || 0) > 0 ? "Cannot delete department with employees" : "Delete"}
                    >
                      <Trash2 size={16} color="#6b7280" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
                  background: currentPage === i + 1 ? 'var(--primary)' : 'white',
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
            width: '90%'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Add Department</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Department Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Department Name"
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
                  Department Status
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
                  Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
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
                onClick={() => { setShowAddModal(false); resetForm(); }}
                style={{
                  flex: 1,
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                style={{
                  flex: 1,
                  background: '#0d9488',
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

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Edit Department</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Department Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Department Name"
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
                  Department Status
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
                  Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
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
                onClick={() => { setShowEditModal(false); openDeleteModal(selectedDepartment!); }}
                disabled={(selectedDepartment?.employee_count || selectedDepartment?.employeeCount || 0) > 0}
                style={{
                  background: 'transparent',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: (selectedDepartment?.employee_count || selectedDepartment?.employeeCount || 0) > 0 ? 'not-allowed' : 'pointer',
                  opacity: (selectedDepartment?.employee_count || selectedDepartment?.employeeCount || 0) > 0 ? 0.5 : 1,
                  filter: (selectedDepartment?.employee_count || selectedDepartment?.employeeCount || 0) > 0 ? 'grayscale(1)' : 'none'
                }}
                title={(selectedDepartment?.employee_count || selectedDepartment?.employeeCount || 0) > 0 ? "Cannot delete department with employees" : ""}
              >
                Delete
              </button>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => { setShowEditModal(false); resetForm(); }}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                style={{
                  background: '#0d9488',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Update
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
              Are you Sure to delete this Department?
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
                onClick={() => { setShowDeleteModal(false); setSelectedDepartment(null); }}
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

export default Departments;
