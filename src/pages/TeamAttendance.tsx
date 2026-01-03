import React, { useState, useEffect } from 'react';
import { Users, UserX, Clock, Calendar, Eye, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  checkInAt: string;
  checkOutAt?: string;
  attendanceType: string;
  location: string;
  status: string;
  avatarUrl?: string;
}

interface AttendanceStats {
  presentToday: number;
  absentToday: number;
  lateArrivals: number;
}

const TeamAttendance: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({ presentToday: 0, absentToday: 0, lateArrivals: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AttendanceRecord | null>(null);

  const locations = ['All Locations', 'Head Office', 'Hattin School', 'Branch Office'];
  const statuses = ['All Status', 'Present', 'Late', 'In progress', 'Missing Check-out'];

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/team?date=${selectedDate}`);
      setAttendanceRecords(res.data.records || []);
      setStats(res.data.stats || { presentToday: 0, absentToday: 0, lateArrivals: 0 });
    } catch (error: any) {
      console.error('Failed to fetch team attendance', error);
      if (error.response?.status === 404) {
        toast.error('Employee record not found. Please contact administrator.');
      } else {
        toast.error('Failed to load team attendance data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/attendance/${deleteTarget.id}`);
      toast.success('Attendance record deleted');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchAttendance();
    } catch (error) {
      toast.error('Failed to delete attendance record');
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = searchTerm === '' ||
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === 'All Locations' || record.location === locationFilter;
    const matchesStatus = statusFilter === 'All Status' || record.status === statusFilter;
    
    return matchesSearch && matchesLocation && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return { bg: '#dcfce7', text: '#166534' };
      case 'late':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'in progress':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'missing check-out':
        return { bg: '#fee2e2', text: '#991b1b' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const calculateWorkHours = (checkIn: string, checkOut?: string) => {
    if (!checkOut) return '-';
    const checkInTime = new Date(checkIn).getTime();
    const checkOutTime = new Date(checkOut).getTime();
    const diff = checkOutTime - checkInTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        My Team &gt; Team Attendance
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Team Attendance
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              View & manage your team's attendance
            </p>
          </div>
          <button
            style={{
              padding: '0.6rem 1.25rem',
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            Export All ⬇
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--background-card)', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Users size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Present Today</h3>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>{stats.presentToday}</p>
        </div>
        <div style={{ background: 'var(--background-card)', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <UserX size={20} color="#ef4444" />
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Absent Today</h3>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>{stats.absentToday}</p>
        </div>
        <div style={{ background: 'var(--background-card)', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Clock size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Late Arrivals</h3>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>{stats.lateArrivals}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        background: 'var(--background-card)', 
        padding: '1.5rem', 
        borderRadius: '0.75rem', 
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
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
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          style={{
            padding: '0.6rem 1rem',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            outline: 'none'
          }}
        >
          {locations.map(loc => <option key={loc}>{loc}</option>)}
        </select>
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
        <input
          type="text"
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.6rem 1rem',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            flexGrow: 1,
            minWidth: '200px',
            outline: 'none'
          }}
        />
      </div>

      {/* Attendance Table */}
      <div style={{ background: 'var(--background-card)', borderRadius: '0.75rem', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Employee</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Check In</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Check Out</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Work Hours</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Location</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No attendance records found
                </td>
              </tr>
            ) : (
              filteredRecords.map(record => {
                const statusStyle = getStatusStyle(record.status);
                return (
                  <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}>
                          {record.employeeName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{record.employeeName}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{record.employeeCode}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{formatTime(record.checkInAt)}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{formatTime(record.checkOutAt || '')}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{calculateWorkHours(record.checkInAt, record.checkOutAt)}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{record.location}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        background: statusStyle.bg,
                        color: statusStyle.text
                      }}>
                        {record.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
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
                            setDeleteTarget(record);
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

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'var(--background-card)', padding: '2rem', borderRadius: '0.75rem', width: '90%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.5rem' }}>Attendance Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong>Employee:</strong> {selectedRecord.employeeName} ({selectedRecord.employeeCode})
              </div>
              <div>
                <strong>Check In:</strong> {formatTime(selectedRecord.checkInAt)}
              </div>
              <div>
                <strong>Check Out:</strong> {formatTime(selectedRecord.checkOutAt || '')}
              </div>
              <div>
                <strong>Work Hours:</strong> {calculateWorkHours(selectedRecord.checkInAt, selectedRecord.checkOutAt)}
              </div>
              <div>
                <strong>Location:</strong> {selectedRecord.location}
              </div>
              <div>
                <strong>Type:</strong> {selectedRecord.attendanceType}
              </div>
              <div>
                <strong>Status:</strong> 
                <span style={{
                  marginLeft: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  ...getStatusStyle(selectedRecord.status)
                }}>
                  {selectedRecord.status}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: 'var(--primary-button-bg)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'var(--background-card)', padding: '2rem', borderRadius: '0.75rem', width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>Confirm Delete</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              Are you sure you want to delete the attendance record for {deleteTarget.employeeName}?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                onClick={handleDelete}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#ef4444',
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
                onClick={() => setShowDeleteModal(false)}
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
    </div>
  );
};

export default TeamAttendance;

