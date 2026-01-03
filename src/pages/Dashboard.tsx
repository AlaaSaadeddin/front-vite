import React, { useState, useEffect } from 'react';
import { ChevronDown, Users, MapPin, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface DashboardStats {
  totalEmployees: number;
  activeLocations: number;
  attendanceCount: number;
  pendingLeaves: number;
  approvedLeaves: number;
  activeEmployees: number;
  inactiveEmployees: number;
  newEmployees: number;
}

interface ChartDataPoint {
  date?: string;
  day: string;
  count: number;
}

const StatCard: React.FC<{ title: string; value: string; subtext: string; stripText: string; stripColor: string }> = ({ title, value, subtext, stripText, stripColor }) => (
  <div style={{ 
    background: 'white', 
    borderRadius: '1rem', 
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '160px'
  }}>
    <div style={{ padding: '1.5rem', flex: 1 }}>
       <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</div>
       <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{value}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtext}</span>
       </div>
    </div>
    <div style={{ 
      background: stripColor, 
      padding: '0.6rem 1.5rem', 
      fontSize: '0.75rem', 
      color: '#fff', 
      display: 'flex', 
      alignItems: 'center',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }}>
      {stripText}
    </div>
  </div>
);

const QuickAction: React.FC<{ icon: any; label: string; onClick: () => void }> = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} style={{
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'white',
    border: 'none',
    padding: '1rem',
    borderRadius: '0.75rem',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
    color: 'var(--secondary-text)',
    fontWeight: 600
  }}>
    <Icon size={20} color="var(--primary)" />
    {label}
  </button>
);

const MetricCard: React.FC<{ label: string; value: string; sub: string; color?: string; opacity?: number }> = ({ label, value, sub, color, opacity }) => (
   <div style={{ 
     background: '#f0fdfa',
     padding: '1rem', 
     borderRadius: '0.75rem', 
     textAlign: 'center',
     display: 'flex',
     flexDirection: 'column',
     alignItems: 'center',
     gap: '0.25rem',
     opacity: opacity || 1
   }}>
      <div style={{ 
        width: '32px', 
        height: '32px', 
        borderRadius: '50%', 
        background: color || '#2dd4bf', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        marginBottom: '0.25rem'
      }}>
        {value}
      </div>
      <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', opacity: 0.7 }}>{sub}</div>
   </div>
)

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attendanceChart, setAttendanceChart] = useState<ChartDataPoint[]>([]);
  const [activityStats, setActivityStats] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const dashboardRes = await api.get('/dashboard');
      const dashboardData = dashboardRes.data;

      // Map backend response to frontend format
      setStats({
        totalEmployees: dashboardData.totalEmployees || 0,
        activeLocations: dashboardData.activeLocations || 0,
        attendanceCount: dashboardData.attendance?.present_count || 0,
        pendingLeaves: dashboardData.leaveRequests?.pending || 0,
        approvedLeaves: dashboardData.leaveRequests?.approved || 0,
        activeEmployees: dashboardData.userMetrics?.active_users || 0,
        inactiveEmployees: dashboardData.userMetrics?.inactive_users || 0,
        newEmployees: dashboardData.userMetrics?.new_users || 0,
      });
      
      // Map chart data
      setAttendanceChart(dashboardData.charts?.attendance || []);
      setActivityStats(dashboardData.charts?.activities || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const calculateAttendancePercentage = () => {
    if (!stats || stats.totalEmployees === 0) return '0';
    return Math.round((stats.attendanceCount / stats.totalEmployees) * 100);
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;
  }

  const attendancePercentage = calculateAttendancePercentage();
  const maxAttendance = Math.max(...attendanceChart.map(d => d.count), 1);
  const maxActivity = Math.max(...activityStats.map(d => d.count), 1);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1.5rem' }}>
        {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!
      </h2>
      
      {/* 1. Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard 
          title="Total Employees" 
          value={stats?.totalEmployees.toString() || '0'} 
          subtext="Employees" 
          stripText="You're part of a growing team!" 
          stripColor="#5eead4"
        />
        <StatCard 
          title="Attendance" 
          value={`${attendancePercentage}%`} 
          subtext={`${stats?.attendanceCount || 0} Present this month`} 
          stripText="Great attendance keeps your team moving forward!" 
          stripColor="#99f6e4"
        />
        <StatCard 
          title="Leave Requests" 
          value={stats?.pendingLeaves.toString() || '0'} 
          subtext={`${stats?.approvedLeaves || 0} approved this month`} 
          stripText={`${(stats?.pendingLeaves || 0) + (stats?.approvedLeaves || 0)} total requests`} 
          stripColor="#5eead4" 
        />
        <StatCard 
          title="Active Locations" 
          value={stats?.activeLocations.toString() || '0'} 
          subtext="Locations" 
          stripText="Your organization is expanding its reach!" 
          stripColor="#2dd4bf" 
        />
      </div>

      {/* 2. Middle Row: Calendar + Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', marginBottom: '2rem', alignItems: 'start' }}>
        {/* Calendar Widget */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 'bold' }}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              <ChevronDown size={16} />
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '0.8rem', gap: '0.5rem' }}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} style={{ color: '#94a3b8' }}>{d}</div>)}
              {[...Array(31)].map((_, i) => (
                <div key={i} style={{ 
                  padding: '0.5rem', 
                  borderRadius: '50%', 
                  background: i === new Date().getDate() - 1 ? 'var(--primary)' : 'transparent',
                  color: i === new Date().getDate() - 1 ? 'white' : 'inherit'
                }}>
                  {i + 1}
                </div>
              ))}
           </div>
        </div>

        {/* Attendance Chart */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)', minHeight: '300px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
             <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Organization-wide Attendance</h3>
           </div>
           <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 1rem', borderLeft: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
               {attendanceChart.length > 0 ? (
                 <svg viewBox="0 0 700 200" style={{ width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
                   <polyline 
                     points={attendanceChart.map((d, i) => `${(i / (attendanceChart.length - 1)) * 700},${200 - (d.count / maxAttendance) * 180}`).join(' ')}
                     fill="none" 
                     stroke="var(--primary)" 
                     strokeWidth="3" 
                   />
                 </svg>
               ) : (
                 <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>No attendance data</div>
               )}
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
              {attendanceChart.map((d, i) => <span key={i}>{d.day}</span>)}
           </div>
        </div>
      </div>

      {/* 3. Bottom Row: Activity Stats, Metrics, Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '1.5rem' }}>
         {/* Activity Stats */}
         <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Activity Statistics</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '150px' }}>
               {activityStats.map((d, i) => (
                 <div 
                   key={i} 
                   style={{ 
                     flex: 1, 
                     background: i % 2 === 0 ? '#0d9488' : '#99f6e4', 
                     borderRadius: '4px', 
                     height: `${(d.count / maxActivity) * 100}%`,
                     minHeight: '10px'
                   }}
                 />
               ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: '#94a3b8' }}>
              {activityStats.map((d, i) => <span key={i}>{d.day}</span>)}
            </div>
         </div>

         {/* User Metrics */}
         <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)' }}>
             <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>User Metrics</h3>
             <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <MetricCard label="Active Users" value={stats?.activeEmployees.toString() || '0'} sub="Active Users" />
                <MetricCard label="Inactive Users" value={stats?.inactiveEmployees.toString() || '0'} sub="Inactive Users" opacity={0.6} />
                <MetricCard label="New Users" value={stats?.newEmployees.toString() || '0'} sub="30 Days" color="#22c55e" />
             </div>
         </div>

         {/* Quick Links */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <QuickAction icon={Users} label="Employees" onClick={() => navigate('/employees')} />
            <QuickAction icon={MapPin} label="Locations" onClick={() => navigate('/locations')} />
            <QuickAction icon={Activity} label="Activities" onClick={() => navigate('/activities')} />
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
