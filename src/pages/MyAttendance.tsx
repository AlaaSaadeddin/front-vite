import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface AttendanceRecord {
  id: string;
  date: string;
  checkInAt: string;
  checkOutAt?: string;
  workHours: string;
  location: string;
  type: string;
  status: string;
}

interface TodayStatus {
  checkedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: string;
}

const MyAttendance: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [todayStatus, setTodayStatus] = useState<TodayStatus>({ checkedIn: false });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const statuses = ['All Status', 'Present', 'Late', 'Missing Check-out', 'Absent'];

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const fetchMyAttendance = async () => {
    try {
      const res = await api.get('/attendance/my-attendance');
      setAttendanceRecords(res.data.records || []);
      setTodayStatus(res.data.todayStatus || { checkedIn: false });
    } catch (error) {
      console.error('Failed to fetch attendance', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await api.post('/attendance/check-in', {
        location: 'Head Office',
        type: 'Office'
      });
      toast.success('Checked in successfully!');
      fetchMyAttendance();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      await api.post('/attendance/check-out');
      toast.success('Checked out successfully!');
      fetchMyAttendance();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to check out');
    } finally {
      setCheckingOut(false);
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (statusFilter === 'All Status') return true;
    return record.status === statusFilter;
  });

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return { bg: '#dcfce7', text: '#166534' };
      case 'late':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'missing check-out':
        return { bg: '#fee2e2', text: '#991b1b' };
      case 'absent':
        return { bg: '#f3f4f6', text: '#6b7280' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Attendance &gt; My Attendance
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          My Attendance
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Track your daily attendance, check-ins and work hours
        </p>
      </div>

      {/* Check-in/Check-out Card */}
      <div style={{ 
        background: 'white', 
        borderRadius: '0.75rem', 
        padding: '1.5rem', 
        boxShadow: 'var(--shadow-sm)', 
        marginBottom: '2rem',
        border: todayStatus.checkedIn ? '2px solid var(--primary)' : '1px solid var(--border)'
      }}>
        {!todayStatus.checkedIn ? (
          <div>
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              style={{
                padding: '0.75rem 2rem',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: checkingIn ? 'not-allowed' : 'pointer',
                opacity: checkingIn ? 0.6 : 1,
                marginBottom: '0.5rem'
              }}
            >
              {checkingIn ? 'Checking in...' : 'Check-in'}
            </button>
            <button
              disabled
              style={{
                padding: '0.75rem 2rem',
                background: '#e5e7eb',
                color: '#9ca3af',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'not-allowed',
                marginLeft: '1rem'
              }}
            >
              Check-out
            </button>
          </div>
        ) : (
          <div>
            <div style={{ 
              padding: '1rem', 
              background: '#f0fdfa', 
              borderRadius: '0.5rem',
              border: '1px solid #99f6e4',
              marginBottom: '1rem'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Checked-in : </span>
                <span style={{ color: 'var(--text-main)' }}>{todayStatus.checkInTime}</span>
              </div>
              {todayStatus.checkOutTime && (
                <>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Checked-out : </span>
                    <span style={{ color: 'var(--text-main)' }}>{todayStatus.checkOutTime}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Total : </span>
                    <span style={{ color: 'var(--text-main)' }}>{todayStatus.totalHours}</span>
                  </div>
                </>
              )}
            </div>

            {!todayStatus.checkOutTime && (
              <button
                onClick={handleCheckOut}
                disabled={checkingOut}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: checkingOut ? 'not-allowed' : 'pointer',
                  opacity: checkingOut ? 0.6 : 1
                }}
              >
                {checkingOut ? 'Checking out...' : 'Check-out'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.6rem 1rem',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            outline: 'none',
            minWidth: '150px'
          }}
        >
          {statuses.map(status => <option key={status}>{status}</option>)}
        </select>
      </div>

      {/* Attendance Table */}
      <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Check-in</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Check-out</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Work hours</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Location</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Type</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
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
                    <td style={{ padding: '1rem' }}>{record.date}</td>
                    <td style={{ padding: '1rem' }}>{record.checkInAt}</td>
                    <td style={{ padding: '1rem' }}>{record.checkOutAt || '-'}</td>
                    <td style={{ padding: '1rem' }}>{record.workHours || '-'}</td>
                    <td style={{ padding: '1rem' }}>{record.location || '-'}</td>
                    <td style={{ padding: '1rem' }}>{record.type}</td>
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
    </div>
  );
};

export default MyAttendance;
