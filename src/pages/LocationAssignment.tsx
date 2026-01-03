import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Eye, Calendar } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Location {
  id: string;
  name: string;
  location_type?: string;
  status: string;
  employee_count?: number;
}

interface Activity {
  id: string;
  name: string;
  location_id: string;
  location_name?: string;
  employee_count: number;
  start_date: string;
  end_date: string;
  activity_days?: number;
  status: string;
}

interface Employee {
  id: string;
  employee_id?: string;
  employee_code: string;
  employee_name: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  department?: string;
  department_name?: string;
  position?: string;
  position_title?: string;
}

const LocationAssignment: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [selectedLocationEmployees, setSelectedLocationEmployees] = useState<Employee[]>([]);
  const [selectedActivityEmployees, setSelectedActivityEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [showLocationEmployeesModal, setShowLocationEmployeesModal] = useState(false);
  const [showActivityEmployeesModal, setShowActivityEmployeesModal] = useState(false);
  const [showAssignEmployeesModal, setShowAssignEmployeesModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Type');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    location_id: '',
    employee_ids: [] as string[],
    activity_days: 1,
    dates: [] as string[]
  });

  const [locationAssignmentData, setLocationAssignmentData] = useState({
    location_id: '',
    employee_ids: [] as string[]
  });

  useEffect(() => {
    fetchLocations();
    fetchAllEmployees();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchLocations();
    }
  }, [statusFilter, typeFilter, searchTerm]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const params: any = { withStats: 'true' };
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

  const fetchAllEmployees = async () => {
    try {
      const res = await api.get('/employees');
      const employees = res.data.data || res.data || [];
      setAllEmployees(employees);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchLocationActivities = async (locationId: string) => {
    try {
      const res = await api.get(`/locations/${locationId}/activities`);
      setActivities(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      toast.error('Failed to load activities');
    }
  };

  const fetchLocationEmployees = async (locationId: string) => {
    try {
      const res = await api.get(`/locations/${locationId}/employees`);
      setSelectedLocationEmployees(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch location employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const fetchActivityEmployees = async (activityId: string) => {
    try {
      const res = await api.get(`/location-activities/${activityId}/employees`);
      setSelectedActivityEmployees(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch activity employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const handleViewActivities = async (location: Location) => {
    setSelectedLocation(location);
    await fetchLocationActivities(location.id);
    setShowActivitiesModal(true);
  };

  const handleViewLocationEmployees = async (location: Location) => {
    setSelectedLocation(location);
    await fetchLocationEmployees(location.id);
    setShowLocationEmployeesModal(true);
  };

  const handleAssignEmployeesToLocation = async (location: Location) => {
    setSelectedLocation(location);
    await fetchLocationEmployees(location.id);
    setLocationAssignmentData({
      location_id: location.id,
      employee_ids: selectedLocationEmployees.map(e => e.id || e.employee_id || '').filter(Boolean)
    });
    setShowAssignEmployeesModal(true);
  };

  const handleLocationEmployeeToggle = (employeeId: string) => {
    setLocationAssignmentData(prev => ({
      ...prev,
      employee_ids: prev.employee_ids.includes(employeeId)
        ? prev.employee_ids.filter(id => id !== employeeId)
        : [...prev.employee_ids, employeeId]
    }));
  };

  const handleSaveLocationAssignments = async () => {
    if (!selectedLocation) return;

    try {
      // Get current employees at location
      await fetchLocationEmployees(selectedLocation.id);
      const currentEmployeeIds = selectedLocationEmployees.map(e => e.id || e.employee_id || '').filter(Boolean);
      
      // Find employees to add
      const toAdd = locationAssignmentData.employee_ids.filter(id => !currentEmployeeIds.includes(id));
      
      // Find employees to remove
      const toRemove = currentEmployeeIds.filter(id => !locationAssignmentData.employee_ids.includes(id));

      // Add new assignments
      for (const employeeId of toAdd) {
        await api.post('/location-assignments', {
          employee_id: employeeId,
          location_id: selectedLocation.id
        });
      }

      // Remove assignments
      for (const employeeId of toRemove) {
        await api.delete(`/location-assignments/${employeeId}/${selectedLocation.id}`);
      }

      toast.success('Employees assigned successfully');
      setShowAssignEmployeesModal(false);
      await fetchLocationEmployees(selectedLocation.id);
      fetchLocations();
    } catch (error: any) {
      console.error('Error assigning employees:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Failed to assign employees';
      toast.error(errorMessage);
    }
  };

  const handleViewActivityEmployees = async (activity: Activity) => {
    setSelectedActivity(activity);
    await fetchActivityEmployees(activity.id);
    setShowActivityEmployeesModal(true);
  };

  const handleEditActivity = async (activity: Activity) => {
    setSelectedActivity(activity);
    
    // Fetch activity employees
    await fetchActivityEmployees(activity.id);
    
    // Generate dates array from start_date to end_date
    const dates: string[] = [];
    const start = new Date(activity.start_date);
    const end = new Date(activity.end_date);
    const days = activity.activity_days || 1;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    setFormData({
      name: activity.name,
      location_id: activity.location_id,
      employee_ids: selectedActivityEmployees.map(e => e.id || e.employee_id || ''),
      activity_days: days,
      dates: dates
    });
    
    setShowEditModal(true);
  };

  const handleAddActivity = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleCreateActivity = async () => {
    if (!formData.name.trim()) {
      toast.error('Activity name is required');
      return;
    }
    if (!formData.location_id) {
      toast.error('Location is required');
      return;
    }
    if (formData.employee_ids.length === 0) {
      toast.error('At least one employee must be selected');
      return;
    }
    if (formData.dates.length === 0) {
      toast.error('At least one date is required');
      return;
    }

    try {
      await api.post('/location-activities', formData);
      toast.success('Activity created successfully');
      setShowAddModal(false);
      resetForm();
      if (selectedLocation) {
        await fetchLocationActivities(selectedLocation.id);
      }
      fetchLocations();
    } catch (error: any) {
      console.error('Error creating activity:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Failed to create activity';
      toast.error(errorMessage);
    }
  };

  const handleUpdateActivity = async () => {
    if (!selectedActivity) return;
    if (!formData.name.trim()) {
      toast.error('Activity name is required');
      return;
    }
    if (formData.employee_ids.length === 0) {
      toast.error('At least one employee must be selected');
      return;
    }
    if (formData.dates.length === 0) {
      toast.error('At least one date is required');
      return;
    }

    try {
      await api.put(`/location-activities/${selectedActivity.id}`, formData);
      toast.success('Activity updated successfully');
      setShowEditModal(false);
      resetForm();
      if (selectedLocation) {
        await fetchLocationActivities(selectedLocation.id);
      }
      fetchLocations();
    } catch (error: any) {
      console.error('Error updating activity:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Failed to update activity';
      toast.error(errorMessage);
    }
  };

  const handleDeleteActivity = async () => {
    if (!selectedActivity) return;
    try {
      await api.delete(`/location-activities/${selectedActivity.id}`);
      toast.success('Activity deleted successfully');
      setShowDeleteModal(false);
      setSelectedActivity(null);
      if (selectedLocation) {
        await fetchLocationActivities(selectedLocation.id);
      }
      fetchLocations();
    } catch (error: any) {
      console.error('Error deleting activity:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Failed to delete activity';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location_id: '',
      employee_ids: [],
      activity_days: 1,
      dates: [''] as string[]
    });
    setSelectedActivity(null);
  };

  const handleEmployeeToggle = (employeeId: string) => {
    if (!employeeId) return; // Prevent adding empty IDs
    
    setFormData(prev => {
      const currentIds = prev.employee_ids || [];
      const isSelected = currentIds.includes(employeeId);
      
      return {
        ...prev,
        employee_ids: isSelected
          ? currentIds.filter(id => id !== employeeId)
          : [...currentIds, employeeId]
      };
    });
  };

  const handleActivityDaysChange = (days: number) => {
    const newDates = Array(days).fill('').map((_, i) => formData.dates[i] || '');
    setFormData(prev => ({
      ...prev,
      activity_days: days,
      dates: newDates
    }));
  };

  const handleDateChange = (index: number, value: string) => {
    const newDates = [...formData.dates];
    newDates[index] = value;
    setFormData(prev => ({
      ...prev,
      dates: newDates
    }));
  };

  const removeDate = (index: number) => {
    const newDates = formData.dates.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      dates: newDates,
      activity_days: newDates.length
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const filteredLocations = locations;

  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const paginatedLocations = filteredLocations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Locations Management &gt; Location Assignment
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Location Assignment
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage locations, activities, and employee assignments
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
            {Array.from(new Set(locations.map(l => l.location_type).filter(Boolean))).map(type => (
              <option key={type} value={type}>{type}</option>
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

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              outline: 'none',
              minWidth: '150px'
            }}
          >
            <option value="All Locations">All Locations</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
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
          onClick={handleAddActivity}
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
          Assign Location
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)', width: '50px' }}>
                <input type="checkbox" style={{ cursor: 'pointer' }} />
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Location name</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Employee count</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Type</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLocations.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No locations found
                </td>
              </tr>
            ) : (
              paginatedLocations.map((loc) => (
                <tr key={loc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>{loc.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{loc.employee_count || 0}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{loc.location_type || '-'}</td>
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
                        onClick={() => handleViewActivities(loc)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          padding: '0.4rem',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="View Activities"
                      >
                        <Eye size={16} color="#6b7280" />
                      </button>
                      <button
                        onClick={() => handleViewLocationEmployees(loc)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          padding: '0.4rem',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="View Employees"
                      >
                        <Eye size={16} color="#6b7280" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLocation(loc);
                          handleAssignEmployeesToLocation(loc);
                        }}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          padding: '0.4rem',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Assign Employees"
                      >
                        <Edit2 size={16} color="#6b7280" />
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

      {/* Add Activity Modal - continued in next part due to length */}
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

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Add New Assign Location</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Location
                </label>
                <select
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                >
                  <option value="">Select Location</option>
                  {locations.filter(l => l.status === 'active').map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                <a href="/locations" style={{ fontSize: '0.85rem', color: '#0ea5e9', marginTop: '0.25rem', display: 'inline-block' }}>+ Add New Location</a>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Activity Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Activity Name"
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
                  Assign Employee
                </label>
                <div style={{
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {allEmployees.filter(e => {
                    const empId = e.id || e.employee_id;
                    return (e.status === 'active' || !e.status) && empId;
                  }).map(emp => {
                    const empId = emp.id || emp.employee_id || '';
                    const empName = emp.full_name || emp.employee_name || `${emp.first_name || ''} ${emp.last_name || ''}`;
                    const department = emp.department_name || emp.department || '';
                    const position = emp.position_title || emp.position || '';
                    const empDisplay = department && position 
                      ? `${empName} (${department} • ${position})`
                      : empName;
                    
                    return (
                      <div key={empId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                        <input
                          type="checkbox"
                          checked={formData.employee_ids.includes(empId)}
                          onChange={() => handleEmployeeToggle(empId)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{empDisplay}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {formData.employee_ids.length} employee{formData.employee_ids.length !== 1 ? 's' : ''} selected
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Number of Activity Days
                </label>
                <select
                  value={formData.activity_days}
                  onChange={(e) => {
                    const days = parseInt(e.target.value);
                    handleActivityDaysChange(days);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(day => (
                    <option key={day} value={day}>{day} {day === 1 ? 'day' : 'days'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Activity Dates
                </label>
                {formData.dates.map((date, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <div style={{ minWidth: '80px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Day {index + 1}
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => handleDateChange(index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                        outline: 'none'
                      }}
                    />
                    {formData.dates.length > 1 && (
                      <button
                        onClick={() => removeDate(index)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Trash2 size={18} color="#dc2626" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={handleCreateActivity}
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
                Assign Location
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

      {/* Activities Modal */}
      {showActivitiesModal && selectedLocation && (
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
              onClick={() => { setShowActivitiesModal(false); setSelectedLocation(null); }}
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

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Activities at {selectedLocation.name}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {activities.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No activities found
                </div>
              ) : (
                activities.map(activity => (
                  <div key={activity.id} style={{
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{activity.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {activity.employee_count} employees - {formatDate(activity.start_date)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setShowActivitiesModal(false);
                          handleViewActivityEmployees(activity);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#0ea5e9',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        View Employees
                      </button>
                      <button
                        onClick={() => {
                          setShowActivitiesModal(false);
                          handleEditActivity(activity);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        Edit Activity
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => { setShowActivitiesModal(false); setSelectedLocation(null); }}
              style={{
                width: '100%',
                padding: '0.75rem',
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
      )}

      {/* Edit Activity Modal - Similar structure to Add but with pre-filled data and delete button */}
      {showEditModal && selectedActivity && (
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
                setShowEditModal(false);
                setShowDeleteModal(true);
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

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Edit {selectedActivity.name}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Activity Name
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
                  Location
                </label>
                <select
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                >
                  {locations.filter(l => l.status === 'active').map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Assign Employee
                </label>
                <div style={{
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {allEmployees.filter(e => {
                    const empId = e.id || e.employee_id;
                    return (e.status === 'active' || !e.status) && empId;
                  }).map(emp => {
                    const empId = emp.id || emp.employee_id || '';
                    const empName = emp.full_name || emp.employee_name || `${emp.first_name || ''} ${emp.last_name || ''}`;
                    const department = emp.department_name || emp.department || '';
                    const position = emp.position_title || emp.position || '';
                    const empDisplay = department && position 
                      ? `${empName} (${department} • ${position})`
                      : empName;
                    
                    return (
                      <div key={empId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                        <input
                          type="checkbox"
                          checked={formData.employee_ids.includes(empId)}
                          onChange={() => handleEmployeeToggle(empId)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{empDisplay}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {formData.employee_ids.length} employee{formData.employee_ids.length !== 1 ? 's' : ''} selected
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Number of Activity Days
                </label>
                <select
                  value={formData.activity_days}
                  onChange={(e) => {
                    const days = parseInt(e.target.value);
                    handleActivityDaysChange(days);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(day => (
                    <option key={day} value={day}>{day} {day === 1 ? 'day' : 'days'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Activity Dates
                </label>
                {formData.dates.map((date, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <div style={{ minWidth: '80px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Day {index + 1}
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => handleDateChange(index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                        outline: 'none'
                      }}
                    />
                    {formData.dates.length > 1 && (
                      <button
                        onClick={() => removeDate(index)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Trash2 size={18} color="#dc2626" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={handleUpdateActivity}
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

      {/* Employees Modal (for both location and activity) */}
      {(showLocationEmployeesModal || showActivityEmployeesModal) && (
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
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowLocationEmployeesModal(false);
                setShowActivityEmployeesModal(false);
                setSelectedLocation(null);
                setSelectedActivity(null);
              }}
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

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Employees {showLocationEmployeesModal ? `at ${selectedLocation?.name}` : `in ${selectedActivity?.name}`}
            </h2>
            
            <div style={{ background: 'white', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Employee Name</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Department</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)' }}>Position</th>
                  </tr>
                </thead>
                <tbody>
                  {(showLocationEmployeesModal ? selectedLocationEmployees : selectedActivityEmployees).length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    (showLocationEmployeesModal ? selectedLocationEmployees : selectedActivityEmployees).map((emp) => (
                      <tr key={emp.id || emp.employee_id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {emp.avatar_url ? (
                            <img src={emp.avatar_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                          ) : (
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#6b7280'
                            }}>
                              {(emp.full_name || emp.employee_name || `${emp.first_name} ${emp.last_name}`).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span>{emp.full_name || emp.employee_name || `${emp.first_name} ${emp.last_name}`}</span>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                          {emp.department || emp.department_name || '-'}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                          {emp.position || emp.position_title || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              {showLocationEmployeesModal && selectedLocation && (
                <button
                  onClick={() => {
                    setShowLocationEmployeesModal(false);
                    handleAssignEmployeesToLocation(selectedLocation);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#0ea5e9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Assign Employees
                </button>
              )}
              <button
                onClick={() => {
                  setShowLocationEmployeesModal(false);
                  setShowActivityEmployeesModal(false);
                  setSelectedLocation(null);
                  setSelectedActivity(null);
                }}
                style={{
                  flex: showLocationEmployeesModal ? 1 : 1,
                  padding: '0.75rem',
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

      {/* Assign Employees to Location Modal */}
      {showAssignEmployeesModal && selectedLocation && (
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
              onClick={() => {
                setShowAssignEmployeesModal(false);
                setSelectedLocation(null);
                setLocationAssignmentData({ location_id: '', employee_ids: [] });
              }}
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

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Assign Employees to {selectedLocation.name}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Assign Employee
                </label>
                <div style={{
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {allEmployees.filter(e => e.status === 'active' || !e.status).map(emp => (
                    <div key={emp.id || emp.employee_id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                      <input
                        type="checkbox"
                        checked={locationAssignmentData.employee_ids.includes(emp.id || emp.employee_id || '')}
                        onChange={() => handleLocationEmployeeToggle(emp.id || emp.employee_id || '')}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{emp.full_name || emp.employee_name || `${emp.first_name} ${emp.last_name}`}</span>
                      {emp.department_name && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {emp.department_name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {locationAssignmentData.employee_ids.length} employees selected
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={handleSaveLocationAssignments}
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
                Save Assignments
              </button>
              <button
                onClick={() => {
                  setShowAssignEmployeesModal(false);
                  setSelectedLocation(null);
                  setLocationAssignmentData({ location_id: '', employee_ids: [] });
                }}
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
      {showDeleteModal && selectedActivity && (
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
              Are you Sure to delete this Activity?
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              This action can't be undone
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleDeleteActivity}
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
                onClick={() => { setShowDeleteModal(false); setSelectedActivity(null); }}
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

export default LocationAssignment;

