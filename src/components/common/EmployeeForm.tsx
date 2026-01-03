import React, { useEffect, useState } from 'react';
import { Camera, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface EmployeeFormProps {
  mode: 'add' | 'edit';
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onDelete?: () => void;
  onClose?: () => void;
  loading?: boolean;
}

interface Department {
  id: string;
  name: string;
}

interface Position {
  id: string;
  title: string;
  department_id?: string;
}

interface Role {
  id: string;
  name: string;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onDelete,
  onClose,
  loading
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    department_id: '',
    position_id: '',
    role_id: '',
    status: 'active',
    avatar_url: '',
    employment_type: 'Full-Time',
    supervisor_id: ''
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  useEffect(() => {
    if (initialData) {
      const data = {
        first_name: initialData.first_name || initialData.firstName || '',
        last_name: initialData.last_name || initialData.lastName || '',
        department_id: initialData.department_id || initialData.departmentId || '',
        position_id: initialData.position_id || initialData.positionId || '',
        role_id: initialData.role_id || initialData.roleId || '',
        status: initialData.status || 'active',
        avatar_url: initialData.avatar_url || '',
        employment_type: initialData.employment_type || initialData.employmentType || 'Full-Time',
        supervisor_id: initialData.supervisor_id || initialData.supervisorId || ''
      };
      setFormData(data);
      if (data.avatar_url) {
        setAvatarPreview(data.avatar_url);
      }
    }
  }, [initialData]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingMetadata(true);
      try {
        const [deptRes, posRes, roleRes, empRes] = await Promise.all([
          api.get('/departments'),
          api.get('/positions'),
          api.get('/rbac/roles'),
          api.get('/employees')
        ]);

        const deptData = deptRes.data.data || deptRes.data || [];
        const posData = posRes.data.data || posRes.data || [];
        const roleData = roleRes.data.data || roleRes.data || [];
        const empData = empRes.data.data || empRes.data || [];

        setDepartments(deptData);
        setPositions(posData);
        setRoles(roleData);
        setEmployees(empData);
      } catch (e) {
        console.error("Failed to load metadata", e);
        toast.error('Failed to load form data');
      } finally {
        setIsLoadingMetadata(false);
      }
    };
    fetchData();
  }, []);

  // Filter positions based on selected department and role
  useEffect(() => {
    let filtered: Position[] = [...positions];

    // 3. Prioritize Role Filtering
    if (formData.role_id && roles.length) {
      const selectedRole = roles.find(r => r.id === formData.role_id);
      if (selectedRole) {
        const roleMappings: Record<string, string[]> = {
          'Manager': ['Project Manager', 'Team Leader', 'Field Supervisor'],
          'Field Worker': ['Activity Facilitator', 'Trainer', 'Social Worker'],
          'Office Staff': ['Administrative Assistant', 'Data Entry', 'Office Coordinator'],
          'Super Admin': ['System Administration'],
          'HR Admin': ['HR Manager']
        };

        const allowedTitles = roleMappings[selectedRole.name];
        if (allowedTitles) {
          filtered = positions.filter(p => allowedTitles.includes(p.title));
        }
      }
    } else if (formData.department_id) {
      // 4. Fallback to Department Filtering if no Role is selected
      filtered = positions.filter(p => p.department_id === formData.department_id);
    }

    // 5. CRITICAL: Ensure the currently selected position is ALWAYS in the list
    // This prevents existing data from being wiped if it's currently "invalid" under new strict filters
    if (formData.position_id) {
      const currentPos = positions.find(p => p.id === formData.position_id);
      if (currentPos && !filtered.find(p => p.id === currentPos.id)) {
        filtered.push(currentPos);
      }
    }

    setFilteredPositions(filtered);

    // 5. Intelligent Reset: Clear position if it's no longer valid under the current filters
    // SECURITY: Only reset IF we have finished loading positions/roles.
    // Otherwise, we might wipe valid existing data while metadata is still in transit.
    if (!isLoadingMetadata && positions.length > 0 && formData.position_id && !filtered.find((p: Position) => p.id === formData.position_id)) {
      setFormData(prev => ({ ...prev, position_id: '' }));
    }
  }, [formData.department_id, formData.role_id, roles, positions, isLoadingMetadata]);

  // Auto-select Role AND Department based on Position
  useEffect(() => {
    if (!formData.position_id || !positions.length || !roles.length || !departments.length) return;

    const selectedPosition = positions.find(p => p.id === formData.position_id);
    if (!selectedPosition) return;

    // 1. Sync Department (Only if empty or invalid for this position)
    if (selectedPosition.department_id) {
      const currentDeptId = formData.department_id;
      const posDeptId = selectedPosition.department_id;

      const isDeptEmpty = !currentDeptId;
      const isDeptInvalid = currentDeptId !== posDeptId;

      // Only auto-update if the user hasn't set a valid department for this position yet
      if (isDeptEmpty || isDeptInvalid) {
        setFormData(prev => ({ ...prev, department_id: posDeptId }));
      }
    }

    // 2. Sync Role
    const title = selectedPosition.title;
    let targetRoleName = '';
    const roleMappings: Record<string, string[]> = {
      'Manager': ['Project Manager', 'Team Leader', 'Field Supervisor'],
      'Field Worker': ['Activity Facilitator', 'Trainer', 'Social Worker'],
      'Office Staff': ['Administrative Assistant', 'Data Entry', 'Office Coordinator'],
      'Super Admin': ['System Administration'],
      'HR Admin': ['HR Manager']
    };

    for (const [roleName, titles] of Object.entries(roleMappings)) {
      if (titles.includes(title)) {
        targetRoleName = roleName;
        break;
      }
    }

    if (targetRoleName) {
      const targetRole = roles.find(r => r.name === targetRoleName);
      if (targetRole && targetRole.id !== formData.role_id) {
        setFormData(prev => ({ ...prev, role_id: targetRole.id }));
      }
    }
  }, [formData.position_id, positions, roles, departments]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, just create a preview. Actual upload would be handled separately
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatar_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name) {
      toast.error('First name and last name are required');
      return;
    }

    try {
      const submitData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        status: formData.status
      };

      if (formData.department_id) submitData.department_id = formData.department_id;
      if (formData.position_id) submitData.position_id = formData.position_id;
      if (formData.role_id) submitData.role_id = formData.role_id;
      if (formData.avatar_url) submitData.avatar_url = formData.avatar_url;
      if (formData.employment_type) submitData.employment_type = formData.employment_type;
      if (formData.supervisor_id) submitData.supervisor_id = formData.supervisor_id;

      await onSubmit(submitData);
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error(error?.response?.data?.message || 'Failed to save employee');
    }
  };

  if (loading) {
    return (
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
        <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading...</div>
      </div>
    );
  }

  return (
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
        borderRadius: '0.5rem',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#166534',
            margin: 0
          }}>
            {mode === 'add' ? 'Add Employee' : 'Edit Employee'}
          </h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {mode === 'edit' && onDelete && (
              <button
                onClick={onDelete}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Delete"
              >
                <Trash2 size={20} color="#9ca3af" />
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Profile Picture */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: avatarPreview ? `url(${avatarPreview})` : '#f3f4f6',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: avatarPreview ? 'none' : '2px dashed #d1d5db',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              {!avatarPreview && (
                <Camera size={32} color="#9ca3af" />
              )}
            </div>
            <label
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '3px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <Camera size={18} color="white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* First Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{
                minWidth: '120px',
                fontWeight: 500,
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                First Name
              </label>
              <input
                required
                type="text"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                placeholder="Enter the First Name"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Last Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{
                minWidth: '120px',
                fontWeight: 500,
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                Last Name
              </label>
              <input
                required
                type="text"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                placeholder="Enter the Last Name"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Department */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{
                minWidth: '120px',
                fontWeight: 500,
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                Department
              </label>
              <select
                value={formData.department_id}
                onChange={(e) => handleChange('department_id', e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  outline: 'none',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{
                minWidth: '120px',
                fontWeight: 500,
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                Role
              </label>
              <select
                value={formData.role_id}
                onChange={(e) => handleChange('role_id', e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  outline: 'none',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Role</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Position */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{
                minWidth: '120px',
                fontWeight: 500,
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                Position
              </label>
              <select
                value={formData.position_id}
                onChange={(e) => handleChange('position_id', e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  outline: 'none',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Position</option>
                {filteredPositions.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            {/* Employment Type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{
                minWidth: '120px',
                fontWeight: 500,
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                Employment Type
              </label>
              <select
                value={formData.employment_type}
                onChange={(e) => handleChange('employment_type', e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  outline: 'none',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract-Based">Contract-Based</option>
                <option value="Consultant">Consultant</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            {/* Supervisor */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{
                minWidth: '120px',
                fontWeight: 500,
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                Supervisor
              </label>
              <select
                value={formData.supervisor_id}
                onChange={(e) => handleChange('supervisor_id', e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  outline: 'none',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">None</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.full_name || `${e.first_name} ${e.last_name}`}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{
                minWidth: '120px',
                fontWeight: 500,
                color: '#374151',
                fontSize: '0.9rem'
              }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  outline: 'none',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <button
              type="submit"
              style={{
                padding: '0.75rem 3rem',
                background: '#166534',
                color: 'white',
                fontWeight: 600,
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {mode === 'add' ? 'Save' : 'Update'}
            </button>
            <button
              type="button"
              onClick={onClose || (() => window.history.back())}
              style={{
                padding: '0.75rem 3rem',
                background: '#9ca3af',
                color: 'white',
                fontWeight: 600,
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
