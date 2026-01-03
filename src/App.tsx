import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeEdit from './pages/EmployeeEdit';
import EmployeeAdd from './pages/EmployeeAdd';
import ProfilePage from './pages/ProfilePage';
import RolesPermissions from './pages/RolesPermissions';
import Departments from './pages/Departments';
import DailyAttendance from './pages/DailyAttendance';
import MyAttendance from './pages/MyAttendance';
import Activities from './pages/Activities';
import LogActivity from './pages/LogActivity';
import TeamMembers from './pages/TeamMembers';
import TeamAttendance from './pages/TeamAttendance';
import LocationTypes from './pages/LocationTypes';
import Locations from './pages/Locations';
import LocationAssignment from './pages/LocationAssignment';
import LeaveRequests from './pages/LeaveRequests';
import MyLeave from './pages/MyLeave';
import DashboardLayout from './components/layout/DashboardLayout';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/new" element={<EmployeeAdd />} />
          <Route path="employees/:id" element={<EmployeeEdit />} />
          <Route path="roles" element={<RolesPermissions />} />
          <Route path="departments" element={<Departments />} />
          <Route path="attendance/daily" element={<DailyAttendance />} />
          <Route path="attendance/my" element={<MyAttendance />} />
          <Route path="activities" element={<Activities />} />
          <Route path="activities/log" element={<LogActivity />} />
          <Route path="team/members" element={<TeamMembers />} />
          <Route path="team/attendance" element={<TeamAttendance />} />
          <Route path="locations" element={<Locations />} />
          <Route path="locations/types" element={<LocationTypes />} />
          <Route path="locations/assign" element={<LocationAssignment />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="leaves/requests" element={<LeaveRequests />} />
          <Route path="leaves/my" element={<MyLeave />} />
          {/* Add more routes */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
