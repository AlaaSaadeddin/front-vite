import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Calendar,
  Contact,
  Shield,
  Briefcase,
  Lock,
  Building,
  AlertTriangle, // Used for emergency icon
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Personal');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile/me');
      setProfile(res.data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        setLoading(true);
        await api.patch('/profile/me', { avatarUrl: base64String });
        await fetchProfile();
        toast.success('Profile picture updated!');
      } catch (error) {
        console.error('Failed to update profile picture', error);
        toast.error('Failed to update profile picture');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Tabs configuration
  const tabs = [
    { id: 'Personal', label: 'Personal' },
    { id: 'Job', label: 'Job' },
    { id: 'Locations', label: 'Locations' },
    { id: 'Schedule', label: 'Schedule' },
    { id: 'Emergency', label: 'Emergency Contact' },
    { id: 'Security', label: 'Security' },
  ];

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', background: '#f8fafc', minHeight: '100%' }}>
      {/* Top Header Section */}
      <div style={{
        background: 'var(--primary)',
        borderRadius: '1rem',
        padding: '2rem 2rem 0 2rem',
        color: 'white',
        position: 'relative',
        marginBottom: '4rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '3rem', paddingLeft: '220px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{profile?.name || user?.name || 'Firas Alijla'}</h1>
            <p style={{ opacity: 0.9 }}>{user?.roles?.[0] || 'Super Admin'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2rem', paddingLeft: '220px', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem 0.5rem 0 0',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: activeTab === tab.id ? 1 : 0.8,
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Image & Left Sidebar (floating) */}
        <div style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          width: '240px',
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          color: 'var(--text-main)'
        }}>
          {/* Image Area */}
          <div style={{ height: '240px', background: '#e2e8f0', position: 'relative', overflow: 'hidden' }}>
            <img
              src={profile?.employee?.avatar_url || profile?.avatarUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D"}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <label style={{
              position: 'absolute',
              bottom: '1rem',
              right: '1rem',
              background: 'white',
              padding: '0.5rem',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              <Camera size={18} color="var(--primary)" />
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </label>
          </div>

          {/* Left Info */}
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Briefcase size={16} />
              <span>#{profile?.employee?.employeeCode || '15489'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Phone size={16} />
              <span>{profile?.employee?.phone || 'Not Provided'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Mail size={16} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email || 'elijlafiras@gmail.com'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <MapPin size={16} />
              <span>Palestine, Gaza</span>
            </div>

            {/* Social Icons Placeholder */}
            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ width: '24px', height: '24px', background: '#cbd5e1', borderRadius: '4px' }}></div>
              <div style={{ width: '24px', height: '24px', background: '#cbd5e1', borderRadius: '4px' }}></div>
              <div style={{ width: '24px', height: '24px', background: '#cbd5e1', borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem', padding: '0 2rem' }}>
        <div /> {/* Spacer for the floating sidebar */}

        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          {activeTab === 'Personal' && <PersonalContent data={profile} onRefresh={fetchProfile} />}
          {activeTab === 'Job' && <JobContent data={profile} onRefresh={fetchProfile} />}
          {activeTab === 'Locations' && <LocationsContent data={profile} onRefresh={fetchProfile} />}
          {activeTab === 'Schedule' && <ScheduleContent />}
          {activeTab === 'Emergency' && <EmergencyContent data={profile} onRefresh={fetchProfile} />}
          {activeTab === 'Security' && <SecurityContent />}
        </div>
      </div>
    </div>
  );
};

/* --- Sub-Components for Tabs --- */

interface TabProps {
  data: any;
  onRefresh: () => void;
}

const PersonalContent: React.FC<TabProps> = ({ data, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    employeeNo: '',
    status: '',
    firstName: '',
    middleName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    maritalStatus: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (data) {
      // Fallback name parsing if employee record is missing
      let fName = data.employee?.firstName || '';
      let lName = data.employee?.lastName || '';

      if (!fName && !lName && data.name) {
        const parts = data.name.split(' ');
        fName = parts[0];
        lName = parts.slice(1).join(' ');
      }

      setFormData({
        employeeNo: data.employee?.employeeCode || '',
        status: data.employee?.status || 'Active',
        firstName: fName,
        middleName: data.employee?.middleName || '',
        lastName: lName,
        birthDate: data.employee?.birthDate ? new Date(data.employee.birthDate).toISOString().split('T')[0] : '',
        gender: data.employee?.gender || '',
        maritalStatus: data.employee?.maritalStatus || '',
        email: data.email || '',
        phone: data.employee?.phone || ''
      });
    }
  }, [data]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onSave = async () => {
    try {
      await api.patch('/profile/me', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        phone: formData.phone,
        birthDate: formData.birthDate,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus
      });
      setIsEditing(false);
      onRefresh();
      toast.success('Personal details updated successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save changes');
    }
  };

  return (
    <>
      <HeaderSection title="Personal" icon={Contact} isEditing={isEditing} onEdit={() => setIsEditing(true)} onSave={onSave} onCancel={() => setIsEditing(false)} />
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={16} /> Basic Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <InputGroup label="Employee #" value={formData.employeeNo} onChange={v => handleChange('employeeNo', v)} readOnly={true} />
          <InputGroup label="Status" value={formData.status} onChange={v => handleChange('status', v)} readOnly={true} />
          <InputGroup label="First Name" value={formData.firstName} onChange={v => handleChange('firstName', v)} readOnly={!isEditing} />
          <InputGroup label="Middle Name" value={formData.middleName} onChange={v => handleChange('middleName', v)} readOnly={!isEditing} />
          <InputGroup label="Last Name" value={formData.lastName} onChange={v => handleChange('lastName', v)} readOnly={!isEditing} />
          <InputGroup label="Birth Date" value={formData.birthDate} onChange={v => handleChange('birthDate', v)} readOnly={!isEditing} type="date" suffix={formData.birthDate ? `Age: ${new Date().getFullYear() - new Date(formData.birthDate).getFullYear()}` : ''} />
          <SelectGroup label="Gender" value={formData.gender} options={['Male', 'Female']} onChange={v => handleChange('gender', v)} disabled={!isEditing} />
          <SelectGroup label="Marital Status" value={formData.maritalStatus} options={['Single', 'Married', 'Divorced']} onChange={v => handleChange('maritalStatus', v)} disabled={!isEditing} />
        </div>
      </div>
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Phone size={16} /> Contact Details
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <InputGroup label="Email Address" value={formData.email} onChange={v => handleChange('email', v)} readOnly={true} fullWidth />
          <InputGroup label="Phone Number" value={formData.phone} onChange={v => handleChange('phone', v)} readOnly={!isEditing} fullWidth />
        </div>
      </div>
    </>
  );
};

const JobContent: React.FC<TabProps> = ({ data, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [managers, setManagers] = useState<any[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    position: '',
    employeeType: '',
    supervisorId: '',
    supervisorName: '',
    employmentType: ''
  });

  const fetchManagers = async () => {
    try {
      setLoadingManagers(true);
      const res = await api.get('/employees');
      const employeesData = res.data.data || res.data || [];
      setManagers(employeesData);
    } catch (error: any) {
      console.error('Failed to fetch managers', error);
      // Only show error if it's not a permission error or if we explicitly want to warn
      if (error?.response?.status !== 403) {
        toast.error('Failed to load managers');
      }
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    fetchManagers();
  };

  useEffect(() => {
    if (data) {
      const supervisorName = data.employee?.supervisor?.name || 'None';
      const supervisorId = data.employee?.supervisorId || '';

      setFormData({
        department: data.employee?.department?.name || '',
        position: data.employee?.position?.title || '',
        employeeType: data.roles?.[0] || 'Super Admin',
        supervisorId: supervisorId,
        supervisorName: supervisorName,
        employmentType: data.employee?.employment_type || 'Full-Time'
      });
    }
  }, [data]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSupervisorChange = (supervisorId: string) => {
    if (supervisorId === '') {
      handleChange('supervisorId', '');
      handleChange('supervisorName', 'None');
    } else {
      const selectedManager = managers.find(m => m.id === supervisorId);
      handleChange('supervisorId', supervisorId);
      handleChange('supervisorName', selectedManager?.fullName || 'None');
    }
  };

  const onSave = async () => {
    try {
      // Explicitly send null if supervisorId is empty string to clear supervisor
      const supervisorIdToSend = formData.supervisorId === '' ? null : (formData.supervisorId || null);

      await api.patch('/profile/me', {
        employmentType: formData.employmentType,
        supervisorId: supervisorIdToSend,
        // department and position likely read-only or need ID lookup
      });
      setIsEditing(false);
      onRefresh();
      toast.success('Job details updated successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save changes');
    }
  };

  return (
    <>
      <HeaderSection title="Job" icon={Briefcase} isEditing={isEditing} onEdit={handleEdit} onSave={onSave} onCancel={() => setIsEditing(false)} />
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building size={16} /> Job Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <InputGroup label="Department" value={formData.department} readOnly={true} />
          <InputGroup label="Position" value={formData.position} readOnly={true} />
          <InputGroup label="Employee Type" value={formData.employeeType} readOnly={true} />
          {isEditing ? (
            <SelectGroup
              label="Supervisor"
              value={formData.supervisorId}
              options={
                loadingManagers
                  ? [{ value: '', label: 'Loading managers...' }]
                  : [
                    { value: '', label: 'None' },
                    ...managers.map(m => ({ value: m.id, label: `${m.fullName} (${m.employeeCode || 'N/A'})` }))
                  ]
              }
              onChange={handleSupervisorChange}
              disabled={loadingManagers}
            />
          ) : (
            <InputGroup label="Supervisor" value={formData.supervisorName} readOnly={true} />
          )}
          <SelectGroup label="Employment Type" value={formData.employmentType} options={['Full-Time', 'Part-Time']} onChange={v => handleChange('employmentType', v)} disabled={!isEditing} />
        </div>
      </div>
    </>
  );
};

const LocationsContent: React.FC<TabProps> = () => {
  const [isEditing, setIsEditing] = useState(false);
  // Mock data state could be extended similarly
  const onSave = () => setIsEditing(false);

  return (
    <>
      <HeaderSection title="Locations" icon={MapPin} isEditing={isEditing} onEdit={() => setIsEditing(true)} onSave={onSave} onCancel={() => setIsEditing(false)} />
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={16} /> Assigned Locations
        </h3>

        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Primary Location</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <SelectGroup label="Location Type" value="Office" options={['Office', 'School']} disabled={!isEditing} />
          <SelectGroup label="Location Name" value="Foundation Office" options={['Foundation Office']} disabled={!isEditing} />
          <InputGroup label="Location Code" value="159786" readOnly={!isEditing} />
          <SelectGroup label="Status" value="Active" options={['Active', 'Inactive']} disabled={!isEditing} />
          <InputGroup label="Physical Address" value="Dair Albalah, Alsalam street" readOnly={!isEditing} />
          <SelectGroup label="Operating Days" value="Sun-Thu" options={['Sun-Thu', 'Sat-Thu']} disabled={!isEditing} />
          <InputGroup label="Contact Person Name" value="Noor Aljourani" readOnly={!isEditing} />
          <InputGroup label="Contact Person Phone" value="0597560309" readOnly={!isEditing} />
          <InputGroup label="Opening Time / Closing Time" value="8:00 AM - 4:00 PM" readOnly={!isEditing} />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', margin: '1.5rem 0' }}></div>

        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Secondary Location</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <SelectGroup label="Location Type" value="School" options={['Office', 'School']} disabled={!isEditing} />
          <SelectGroup label="Location Name" value="Httin School" options={['Httin School']} disabled={!isEditing} />
          <InputGroup label="Location Code" value="123456" readOnly={!isEditing} />
          <SelectGroup label="Status" value="Active" options={['Active', 'Inactive']} disabled={!isEditing} />
          <InputGroup label="Physical Address" value="Gaza, Bagdad street" readOnly={!isEditing} />
          <SelectGroup label="Operating Days" value="Sat" options={['Sat', 'Sun-Thu']} disabled={!isEditing} />
          <InputGroup label="Contact Person Name" value="Sami Jaber" readOnly={!isEditing} />
          <InputGroup label="Contact Person Phone" value="0597894562" readOnly={!isEditing} />
          <InputGroup label="Opening Time / Closing Time" value="11:00 AM - 3:00 PM" readOnly={!isEditing} />
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Current Location</h4>
        <div style={{ width: '100%', height: '200px', borderRadius: '0.5rem', overflow: 'hidden', position: 'relative' }}>
          {/* Map Placeholder Image */}
          <img
            src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/34.45,31.5,13,0/600x200?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2xiaDN3Z20wMDBqMndvN3R4cnZ5bzJzIn0.7-3sC-q-q-q-q"
            alt="Map Location"
            style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#1e293b' }}
          />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', textAlign: 'center' }}>
            <MapPin size={32} fill="#ea4335" color="white" />
          </div>
        </div>
      </div>
    </>
  );
};

const ScheduleContent: React.FC = () => {
  // Mock Schedule Data
  const weekDays = [
    { day: 'Sun', date: '7', time: '9:00 AM - 2:00 PM', type: 'Office', location: 'Head Office', color: '#fbcfe8' },
    { day: 'Mon', date: '8', time: '10:00 AM - 4:00 PM', type: 'Office', location: 'Head Office', color: '#bfdbfe' },
    { day: 'Tue', date: '9', time: '9:00 AM - 2:00 PM', type: 'Office', location: 'Head Office', color: '#fed7aa' },
    { day: 'Wed', date: '10', time: '8:00 AM - 2:00 PM', type: 'Office', location: 'Head Office', color: '#bbf7d0' },
    { day: 'Thu', date: '11', time: '10:00 AM - 3:00 PM', type: 'Office', location: 'Head Office', color: '#f5d0fe' }
  ];

  return (
    <>
      <HeaderSection title="Schedule" icon={Calendar} />
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={16} /> Work Schedule
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '50%', padding: '0.25rem', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
          <span style={{ fontWeight: 600 }}>7 Dec - 11 Dec</span>
          <button style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '50%', padding: '0.25rem', cursor: 'pointer' }}><ChevronRight size={16} /></button>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 1fr) repeat(5, minmax(140px, 1fr))', minWidth: '800px' }}>

            {/* Header Row */}
            <div style={{ padding: '1rem', background: '#fff', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}></div>
            {weekDays.map(d => (
              <div key={d.day} style={{ padding: '0.75rem', textAlign: 'center', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: '#fff' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.day}</div>
                <div style={{ fontWeight: 'bold' }}>{d.date}</div>
              </div>
            ))}

            {/* Time Row */}
            <div style={{ padding: '1rem', textAlign: 'center', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, color: 'var(--text-muted)' }}>Time</div>
            {weekDays.map(d => (
              <div key={d.day} style={{ padding: '1rem 0.5rem', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{
                  background: d.color,
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  width: '100%',
                  textAlign: 'center'
                }}>
                  {d.time}
                </div>
              </div>
            ))}

            {/* Type Row */}
            <div style={{ padding: '1rem', textAlign: 'center', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, color: '#0066cc', textDecoration: 'underline' }}>Shift Type</div>
            {weekDays.map(d => (
              <div key={d.day} style={{ padding: '1rem', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', textAlign: 'center', fontSize: '0.9rem' }}>
                {d.type}
              </div>
            ))}

            {/* Location Row */}
            <div style={{ padding: '1rem', textAlign: 'center', borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, color: 'var(--text-muted)' }}>Location</div>
            {weekDays.map(d => (
              <div key={d.day} style={{ padding: '1rem', borderRight: '1px solid var(--border)', textAlign: 'center', fontSize: '0.9rem' }}>
                {d.location}
              </div>
            ))}

          </div>
        </div>

      </div>
    </>
  );
}

const EmergencyContent: React.FC<TabProps> = ({ data, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    altPhone: '',
    address: '',
    email: ''
  });

  useEffect(() => {
    if (data) {
      // Use first emergency contact for now as the UI shows single form
      const contact = data.employee?.emergencyContacts?.[0] || {};
      setFormData({
        name: contact.name || '',
        relationship: contact.relationship || '',
        phone: contact.phone || '',
        altPhone: contact.altPhone || '',
        address: contact.address || '',
        email: contact.email || ''
      });
    }
  }, [data]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onSave = async () => {
    try {
      await api.patch('/profile/me', {
        emergencyContacts: [{
          name: formData.name,
          relationship: formData.relationship,
          phone: formData.phone,
          altPhone: formData.altPhone,
          address: formData.address,
          email: formData.email
        }]
      });
      setIsEditing(false);
      onRefresh();
      toast.success('Emergency contact updated successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save changes');
    }
  };

  return (
    <>
      <HeaderSection title="Emergency Contact" icon={AlertTriangle} isEditing={isEditing} onEdit={() => setIsEditing(true)} onSave={onSave} onCancel={() => setIsEditing(false)} />
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={16} /> Emergency Contact
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <InputGroup label="Name" value={formData.name} onChange={v => handleChange('name', v)} readOnly={!isEditing} />
          <SelectGroup label="Relationship" value={formData.relationship} options={['brother', 'sister', 'parent', 'spouse']} onChange={v => handleChange('relationship', v)} disabled={!isEditing} />
          <InputGroup label="Phone Number" value={formData.phone} onChange={v => handleChange('phone', v)} readOnly={!isEditing} />
          <InputGroup label="Alternate Phone" value={formData.altPhone} onChange={v => handleChange('altPhone', v)} readOnly={!isEditing} />
          <InputGroup label="Address" value={formData.address} onChange={v => handleChange('address', v)} readOnly={!isEditing} />
          <InputGroup label="Email Address" value={formData.email} onChange={v => handleChange('email', v)} readOnly={!isEditing} />
        </div>
      </div>
    </>
  );
};

const SecurityContent: React.FC = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const onSave = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      await api.patch('/profile/me', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || 'Failed to update password');
    }
  };

  return (
    <>
      <HeaderSection title="Security" icon={Shield} />
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={16} /> Account Security
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600, color: 'var(--primary)' }}>
          <Lock size={16} /> Change Password
        </div>

        <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <InputGroup
            label="Current Password"
            value={passwords.currentPassword}
            onChange={v => handleChange('currentPassword', v)}
            placeholder="Enter current password"
            readOnly={false}
            type="password"
          />
          <InputGroup
            label="New Password"
            value={passwords.newPassword}
            onChange={v => handleChange('newPassword', v)}
            placeholder="Enter new password"
            readOnly={false}
            type="password"
          />
          <InputGroup
            label="Confirm New Password"
            value={passwords.confirmPassword}
            onChange={v => handleChange('confirmPassword', v)}
            placeholder="Confirm new password"
            readOnly={false}
            type="password"
          />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={onSave}
            style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};


/* --- Shared Helper Components --- */

interface HeaderSectionProps {
  title: string;
  icon: any;
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ title, icon: Icon, isEditing, onEdit, onSave, onCancel }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Icon color="var(--primary)" size={24} />
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>{title}</h2>
    </div>
    {onEdit && (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {!isEditing ? (
          <button onClick={onEdit} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Edit3 size={18} color="var(--text-muted)" /> <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Edit</span>
          </button>
        ) : (
          <>
            <button onClick={onSave} style={{ background: 'var(--primary)', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
              <Save size={18} /> <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Save</span>
            </button>
            <button onClick={onCancel} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
              <X size={18} />
            </button>
          </>
        )}
      </div>
    )}
  </div>
);

interface InputGroupProps {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  suffix?: string;
  fullWidth?: boolean;
  placeholder?: string;
  type?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, value, onChange, readOnly = true, suffix, fullWidth, placeholder, type = 'text' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', gridColumn: fullWidth ? 'span 2' : 'span 1' }}>
    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.3rem',
          border: readOnly ? '1px solid transparent' : '1px solid var(--border)',
          background: readOnly ? '#f8fafc' : 'white',
          color: 'var(--text-main)',
          fontSize: '0.9rem',
          outline: 'none',
          transition: 'all 0.2s'
        }}
      />
      {suffix && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{suffix}</span>}
    </div>
  </div>
);

interface SelectGroupProps {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
  options?: string[] | Array<{ value: string; label: string }>;
  fullWidth?: boolean;
}

const SelectGroup: React.FC<SelectGroupProps> = ({ label, value, onChange, disabled = true, options = [], fullWidth }) => {
  // Check if options are objects with value/label or just strings
  const isObjectOptions = options.length > 0 && typeof options[0] === 'object';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', gridColumn: fullWidth ? 'span 2' : 'span 1' }}>
      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <select
          disabled={disabled}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.3rem',
            border: disabled ? '1px solid transparent' : '1px solid var(--border)',
            background: disabled ? '#f8fafc' : 'white',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            appearance: 'none',
            opacity: disabled ? 1 : 1, // Keep opacity high for readability
            outline: 'none'
          }}
        >
          {options.length > 0 ? (
            isObjectOptions
              ? (options as Array<{ value: string; label: string }>).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))
              : (options as string[]).map(opt => <option key={opt} value={opt}>{opt}</option>)
          ) : <option>{value}</option>}
        </select>
        <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <ChevronLeft size={12} style={{ transform: 'rotate(-90deg)' }} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
