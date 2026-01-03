import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Search, Edit, Trash2, Plus, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';



interface Employee {
  id: string;
  fullName: string;
  employeeCode: string;
  departmentId: string;
  departmentName?: string; // Department name from join
  positionId?: string;
  positionTitle?: string; // Position title from join
  status: string;
  avatarUrl?: string;
  role?: string;
  roleName?: string; // Role name from join
}


const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  
  // Dynamic data from API
  const [departments, setDepartments] = useState<string[]>(['All Departments']);
  const [roles, setRoles] = useState<string[]>(['All Roles']);
  const statuses = ['All Status', 'Active', 'Inactive'];

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      const employeesData = res.data.data || res.data || [];
      
      // Map the API response to match the Employee interface
      const mappedEmployees = employeesData.map((emp: any) => ({
        id: emp.id,
        fullName: emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`,
        employeeCode: emp.employee_code,
        departmentId: emp.department_id || '',
        departmentName: emp.department_name,
        positionId: emp.position_id || '',
        positionTitle: emp.position_title,
        status: emp.status || 'active',
        avatarUrl: emp.avatar_url,
        role: emp.role_id || '',
        roleName: emp.role_name
      }));
      
      setEmployees(mappedEmployees);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      const deptData = res.data.data || res.data || [];
      const deptNames = deptData.map((d: any) => d.name);
      setDepartments(['All Departments', ...deptNames]);
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/rbac/roles');
      const roleData = res.data.data || res.data || [];
      const roleNames = roleData.map((r: any) => r.name);
      setRoles(['All Roles', ...roleNames]);
    } catch (err) {
      console.error('Failed to fetch roles', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchRoles();
  }, []);

  // Refresh employees when navigating back to this page (e.g., after adding/editing)
  useEffect(() => {
    if (location.pathname === '/employees' && !loading) {
      fetchEmployees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = searchTerm === '' || 
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'All Departments' || 
      emp.departmentName === departmentFilter;
    
    const matchesRole = roleFilter === 'All Roles' || 
      emp.roleName === roleFilter;
    
    const matchesStatus = statusFilter === 'All Status' || 
      emp.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active': return { bg: '#dcfce7', text: '#166534' }; // green
      case 'inactive': return { bg: '#f1f5f9', text: '#64748b' }; // gray
      case 'terminated': return { bg: '#fee2e2', text: '#991b1b' }; // red
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  /* Delete Modal State */
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/employees/${deleteTarget.id}`);
      setEmployees(prev => prev.filter(e => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete', err);
      // Could add toast error here
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Employees</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage all employees in your organization</p>
      </div>

      <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
           <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                 <select 
                   value={departmentFilter}
                   onChange={(e) => setDepartmentFilter(e.target.value)}
                   style={{ 
                   padding: '0.6rem 2.5rem 0.6rem 1rem', 
                   borderRadius: '0.5rem', 
                   border: '1px solid var(--border)', 
                   background: 'white',
                   appearance: 'none',
                   fontSize: '0.9rem',
                   color: 'var(--text-main)',
                   cursor: 'pointer'
                 }}>
                    {departments.map(d => <option key={d}>{d}</option>)}
                 </select>
                 <ChevronDownIcon style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} size={16} />
              </div>
              <div style={{ position: 'relative' }}>
                 <select
                   value={roleFilter}
                   onChange={(e) => setRoleFilter(e.target.value)}
                   style={{ 
                   padding: '0.6rem 2.5rem 0.6rem 1rem', 
                   borderRadius: '0.5rem', 
                   border: '1px solid var(--border)', 
                   background: 'white',
                   appearance: 'none',
                   fontSize: '0.9rem',
                   color: 'var(--text-main)',
                   cursor: 'pointer'
                 }}>
                    {roles.map(r => <option key={r}>{r}</option>)}
                 </select>
                 <ChevronDownIcon style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} size={16} />
              </div>
              <div style={{ position: 'relative' }}>
                 <select
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   style={{ 
                   padding: '0.6rem 2.5rem 0.6rem 1rem', 
                   borderRadius: '0.5rem', 
                   border: '1px solid var(--border)', 
                   background: 'white',
                   appearance: 'none',
                   fontSize: '0.9rem',
                   color: 'var(--text-main)',
                   cursor: 'pointer'
                 }}>
                    {statuses.map(s => <option key={s}>{s}</option>)}
                 </select>
                 <ChevronDownIcon style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} size={16} />
              </div>
           </div>

           <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                 <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                 <input 
                   type="text" 
                   placeholder="Search by name or ID"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   style={{
                     padding: '0.6rem 1rem 0.6rem 2.5rem',
                     borderRadius: '0.5rem',
                     border: '1px solid var(--border)',
                     fontSize: '0.9rem',
                     width: '250px'
                   }}
                 />
              </div>
              <button 
                onClick={() => navigate('/employees/new')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.6rem 1.25rem', 
                  background: '#007aff', // Bright blue as per screenshot (or generic primary)
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.5rem', 
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <Plus size={18} /> Add Employee
              </button>
           </div>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Employee</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Employee ID</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Department</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Position</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Role</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No employees found</td>
                </tr>
              ) : (
                filteredEmployees.map(emp => {
                  const statusStyle = getStatusColor(emp.status);
                  return (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                               {/* Placeholder Avatar */}
                               {emp.avatarUrl ? <img src={emp.avatarUrl} alt="" style={{ width: '100%', height: '100%' }} /> : <span style={{ fontWeight: 'bold', color: '#64748b' }}>{emp.fullName[0]}</span>}
                           </div>
                           <span style={{ fontWeight: 500 }}>{emp.fullName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{emp.employeeCode}</td>
                      <td style={{ padding: '1rem' }}>{emp.departmentName || '-'}</td> 
                      <td style={{ padding: '1rem' }}>{emp.positionTitle || '-'}</td>
                      <td style={{ padding: '1rem' }}>{emp.roleName || '-'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          background: statusStyle.bg, 
                          color: statusStyle.text, 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '999px',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}>
                          {emp.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => navigate(`/employees/${emp.id}`)}
                            style={{ 
                              background: 'transparent', 
                              border: '1px solid var(--border)', 
                              borderRadius: '4px',
                              padding: '0.4rem', 
                              color: 'var(--text-muted)', 
                              cursor: 'pointer',
                              display: 'flex' 
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleteTarget(emp)}
                            style={{ 
                              background: 'transparent', 
                              border: '1px solid var(--border)', 
                              borderRadius: '4px',
                              padding: '0.4rem', 
                              color: 'var(--danger)', 
                              cursor: 'pointer',
                              display: 'flex'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Mock */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
           <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
           <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>1</span>
           <span style={{ color: 'var(--text-muted)' }}>2</span>
           <span style={{ color: 'var(--text-muted)' }}>3</span>
           <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
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
          zIndex: 9999
        }}>
           <div style={{
             background: 'white',
             borderRadius: '0.5rem',
             padding: '2rem',
             width: '90%',
             maxWidth: '400px',
             textAlign: 'center',
             boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
           }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                 <AlertTriangle size={48} color="#b91c1c" />
              </div>
              <h2 style={{ color: '#b91c1c', marginBottom: '0.5rem', fontSize: '1.25rem' }}>Warning</h2>
              <p style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Are you Sure to delete this Employee ?</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>This action can't be undone</p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                 <button 
                   onClick={handleDelete}
                   style={{
                     background: '#b91c1c',
                     color: 'white',
                     padding: '0.6rem 2rem',
                     borderRadius: '0.3rem',
                     border: 'none',
                     cursor: 'pointer',
                     fontWeight: 'bold',
                     fontSize: '1rem'
                   }}
                 >
                   Delete
                 </button>
                 <button 
                   onClick={() => setDeleteTarget(null)}
                   style={{
                     background: '#888',
                     color: 'white',
                     padding: '0.6rem 2rem',
                     borderRadius: '0.3rem',
                     border: 'none',
                     cursor: 'pointer',
                     fontWeight: 'bold',
                     fontSize: '1rem'
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

/* Helper Component */
const ChevronDownIcon: React.FC<any> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={props.size || 24} 
    height={props.size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="m6 9 6 6 6-6"/>
  </svg>
)

export default EmployeeList;
