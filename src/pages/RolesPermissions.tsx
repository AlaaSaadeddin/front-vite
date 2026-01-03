import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Permission {
  id: string;
  resource: string;
  action: string;
  permissionType: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

const RolesPermissions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole);
    }
  }, [selectedRole]);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/rbac/roles');
      setRoles(res.data);
      if (res.data.length > 0) {
        setSelectedRole(res.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch roles', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await api.get('/rbac/permissions');
      setPermissions(res.data);
    } catch (error) {
      console.error('Failed to fetch permissions', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      const res = await api.get(`/rbac/roles/${roleId}`);
      const permIds = res.data.permissions?.map((p: any) => p.permissionId) || [];
      setSelectedPermissions(new Set(permIds));
    } catch (error) {
      console.error('Failed to fetch role permissions', error);
    }
  };

  const togglePermission = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleSave = async () => {
    try {
      await api.put(`/rbac/roles/${selectedRole}`, {
        permissions: Array.from(selectedPermissions)
      });
      toast.success('Permissions updated successfully');
    } catch (error: any) {
      console.error('Failed to update permissions', error);
      console.error('Error response:', error?.response?.data);

      const errorMsg = error?.response?.data?.error?.message
        || error?.response?.data?.message
        || error?.message
        || 'Failed to update permissions';

      toast.error(errorMsg);
    }
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = { menu: [], action: [] };
    }
    if (perm.permissionType === 'menu_access') {
      acc[perm.resource].menu.push(perm);
    } else {
      acc[perm.resource].action.push(perm);
    }
    return acc;
  }, {} as Record<string, { menu: Permission[], action: Permission[] }>);

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        User Management &gt; Roles & Permissions
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Roles & Permissions
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Control access levels and permissions across your organization
        </p>
      </div>

      {/* Role Selector */}
      <div style={{ marginBottom: '2rem' }}>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            fontSize: '0.95rem',
            minWidth: '200px',
            outline: 'none'
          }}
        >
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      </div>

      {/* Permissions Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        background: 'white',
        borderRadius: '0.75rem',
        padding: '2rem',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)'
      }}>
        {/* Menu Access Column */}
        <div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid var(--border)'
          }}>
            Menu Access
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.entries(groupedPermissions).map(([resource, perms]) => (
              perms.menu.length > 0 && (
                <div key={`menu-${resource}`}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={perms.menu.every(p => selectedPermissions.has(p.id))}
                      onChange={() => {
                        const allSelected = perms.menu.every(p => selectedPermissions.has(p.id));
                        const newSelected = new Set(selectedPermissions);
                        perms.menu.forEach(p => {
                          if (allSelected) {
                            newSelected.delete(p.id);
                          } else {
                            newSelected.add(p.id);
                          }
                        });
                        setSelectedPermissions(newSelected);
                      }}
                      style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                    />
                    {resource}
                  </label>

                  <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {perms.menu.map(perm => (
                      <label
                        key={perm.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.has(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          style={{ accentColor: 'var(--primary)', width: '14px', height: '14px' }}
                        />
                        - {perm.action.replace(/_/g, ' ')}
                      </label>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Actions Permissions Column */}
        <div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid var(--border)'
          }}>
            Actions Permissions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.entries(groupedPermissions).map(([resource, perms]) => (
              perms.action.length > 0 && (
                <div key={`action-${resource}`}>
                  <h4 style={{
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                    color: 'var(--text-main)'
                  }}>
                    {resource} Actions
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {perms.action.map(perm => (
                      <label
                        key={perm.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.has(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          style={{ accentColor: 'var(--primary)', width: '14px', height: '14px' }}
                        />
                        - {perm.action.replace(/_/g, ' ')}
                      </label>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Save size={18} />
          Save
        </button>
      </div>
    </div>
  );
};

export default RolesPermissions;
