import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, User, Mail, Phone, Building, Briefcase, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface TeamMember {
  id: string;
  fullName: string;
  employeeCode: string;
  email?: string;
  phone?: string;
  departmentId?: string;
  departmentName?: string;
  positionId?: string;
  status: string;
  roleName?: string;
  hiredAt?: string;
}

const TeamMembers: React.FC = () => {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employees/team/members');
      setTeamMembers(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch team members', err);
      if (err.response?.status === 404) {
        toast.error('Employee record not found. Please contact administrator.');
      } else {
        toast.error('Failed to load team members');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Filter team members based on search
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = searchTerm === '' || 
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active': return { bg: '#dcfce7', text: '#166534' };
      case 'inactive': return { bg: '#f1f5f9', text: '#64748b' };
      case 'terminated': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading team members...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          My Team Members
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          View and manage your team members
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} 
          />
          <input
            type="text"
            placeholder="Search by name, code, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Team Members List */}
      {filteredMembers.length === 0 ? (
        <div style={{
          background: 'var(--background-card)',
          padding: '3rem',
          borderRadius: '0.75rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <AlertCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            {teamMembers.length === 0 ? 'No Team Members' : 'No Results Found'}
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {teamMembers.length === 0 
              ? 'You don\'t have any team members assigned yet.'
              : 'Try adjusting your search terms.'}
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {filteredMembers.map(member => {
            const statusColor = getStatusColor(member.status);
            return (
              <div
                key={member.id}
                style={{
                  background: 'var(--background-card)',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-light)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                onClick={() => navigate(`/employees/${member.id}`)}
              >
                {/* Member Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1.125rem'
                  }}>
                    {member.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '1rem', 
                      fontWeight: 600, 
                      color: 'var(--text-main)',
                      marginBottom: '0.25rem'
                    }}>
                      {member.fullName}
                    </h3>
                    <p style={{ 
                      fontSize: '0.85rem', 
                      color: 'var(--text-muted)' 
                    }}>
                      {member.employeeCode}
                    </p>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    background: statusColor.bg,
                    color: statusColor.text
                  }}>
                    {member.status}
                  </span>
                </div>

                {/* Member Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {member.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <Mail size={16} color="var(--text-muted)" />
                      <span style={{ color: 'var(--text-muted)' }}>{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <Phone size={16} color="var(--text-muted)" />
                      <span style={{ color: 'var(--text-muted)' }}>{member.phone}</span>
                    </div>
                  )}
                  {member.departmentName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <Building size={16} color="var(--text-muted)" />
                      <span style={{ color: 'var(--text-muted)' }}>{member.departmentName}</span>
                    </div>
                  )}
                  {member.roleName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <Briefcase size={16} color="var(--text-muted)" />
                      <span style={{ color: 'var(--text-muted)' }}>{member.roleName}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {filteredMembers.length > 0 && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'var(--background-card)',
          borderRadius: '0.5rem',
          display: 'flex',
          gap: '2rem',
          fontSize: '0.875rem',
          color: 'var(--text-muted)'
        }}>
          <span>Total Team Members: <strong style={{ color: 'var(--text-main)' }}>{filteredMembers.length}</strong></span>
          <span>Active: <strong style={{ color: 'var(--text-main)' }}>
            {filteredMembers.filter(m => m.status.toLowerCase() === 'active').length}
          </strong></span>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;

