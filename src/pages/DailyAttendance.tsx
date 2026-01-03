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

const DailyAttendance: React.FC = () => {
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
      const res = await api.get(`/attendance/daily?date=${selectedDate}`);
      setAttendanceRecords(res.data.records || []);
      setStats(res.data.stats || { presentToday: 0, absentToday: 0, lateArrivals: 0 });
    } catch (error) {
      console.error('Failed to fetch attendance', error);
      toast.error('Failed to load attendance data');
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

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Attendance &gt; Daily Attendance
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Daily Attendance
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              View & manage today's attendance across all employee
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
              <Users size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0c4a6e' }}>{stats.presentToday}</div>
              <div style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>Present Today</div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fee2e2', padding: '1.5rem', borderRadius: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: '#ef4444', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <UserX size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7f1d1d' }}>{stats.absentToday}</div>
              <div style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>Absent Today</div>
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
              <Clock size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#78350f' }}>{stats.lateArrivals}</div>
              <div style={{ fontSize: '0.85rem', color: '#78350f' }}>Late Arrivals</div>
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
            placeholder="Search by name or ID"
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
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', width: '40px' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Employee</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Employee ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Check-in</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Check-out</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Attendance Type</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Location</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No attendance records found
                </td>
              </tr>
            ) : (
              filteredRecords.map(record => {
                const statusStyle = getStatusStyle(record.status);
                return (
                  <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '36px', 
                          height: '36px', 
                          borderRadius: '50%', 
                          background: '#e2e8f0', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          {record.avatarUrl ? (
                            <img src={record.avatarUrl} alt="" style={{ width: '100%', height: '100%' }} />
                          ) : (
                            <span style={{ fontWeight: 'bold', color: '#64748b' }}>{record.employeeName[0]}</span>
                          )}
                        </div>
                        <span style={{ fontWeight: 500 }}>{record.employeeName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{record.employeeCode}</td>
                    <td style={{ padding: '1rem' }}>{formatTime(record.checkInAt)}</td>
                    <td style={{ padding: '1rem' }}>{formatTime(record.checkOutAt || '')}</td>
                    <td style={{ padding: '1rem' }}>{record.attendanceType}</td>
                    <td style={{ padding: '1rem' }}>{record.location}</td>
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
                    <td style={{ padding: '1rem' }}>
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

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
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
            position: 'relative'
          }}>
            <button
              onClick={() => setShowDetailsModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '0.25rem',
                padding: '0.25rem',
                cursor: 'pointer',
                display: 'flex'
              }}
            >
              <Trash2 size={18} />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Attendance Details</h2>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {selectedRecord.avatarUrl ? (
                  <img src={selectedRecord.avatarUrl} alt="" style={{ width: '100%', height: '100%' }} />
                ) : (
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#64748b' }}>{selectedRecord.employeeName[0]}</span>
                )}
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>{selectedRecord.employeeName}</div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>#{selectedRecord.employeeCode}</div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{selectedDate}</div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {formatTime(selectedRecord.checkInAt)} – {formatTime(selectedRecord.checkOutAt || '')}
                </div>
                <div style={{ fontWeight: 500 }}>{selectedRecord.location}</div>
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
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
            <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Are you Sure to delete this Employee Attendance?</p>
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

export default DailyAttendance;
