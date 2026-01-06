import {
  LayoutDashboard,
  Users,
  Calendar,
  Activity,
  MapPin,
  FileText,
  BarChart2,
  MoreHorizontal
} from 'lucide-react';

export interface NavItem {
  label: string;
  icon?: any;
  path?: string;
  children?: NavItem[];
}

export const ROLE_NAVIGATION: Record<string, NavItem[]> = {
  'Office Staff': [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    {
      label: 'Attendance',
      icon: Calendar,
      children: [
        { label: 'My Attendance', path: '/attendance/my' },
      ]
    },
    {
      label: 'Leave',
      icon: FileText,
      children: [
        { label: 'My Leave', path: '/leaves/my' },
      ]
    },
    {
      label: 'More',
      icon: MoreHorizontal,
      children: [
        { label: 'My Profile', path: '/profile' },
        { label: 'Notifications Settings', path: '/settings/notifications' },
        { label: 'Help Center', path: '/help' },
        { label: 'Support', path: '/support' },
      ]
    }
  ],
  'Field Worker': [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    {
      label: 'Attendance',
      icon: Calendar,
      children: [
        { label: 'My Attendance', path: '/attendance/my' },
      ]
    },
    {
      label: 'Activities',
      icon: Activity,
      children: [
        { label: 'Log Activity', path: '/activities/log' },
        { label: 'My Activities', path: '/activities/my' },
      ]
    },
    {
      label: 'Leave',
      icon: FileText,
      children: [
        { label: 'My Leave', path: '/leaves/my' },
      ]
    },
    {
      label: 'More',
      icon: MoreHorizontal,
      children: [
        { label: 'My Profile', path: '/profile' },
        { label: 'Notifications Settings', path: '/settings/notifications' },
        { label: 'Help Center', path: '/help' },
        { label: 'Support', path: '/support' },
      ]
    }
  ],
  'Manager': [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    {
      label: 'My Team',
      icon: Users,
      children: [
        { label: 'Team Members', path: '/team/members' },
        { label: 'Team Attendance', path: '/team/attendance' },
        { label: 'Team Activities', path: '/team/activities' },
        { label: 'Team Leave Requests', path: '/team/leaves' },
      ]
    },
    {
      label: 'Attendance',
      icon: Calendar,
      children: [
        { label: 'Daily Attendance', path: '/attendance/daily' }, // Maybe team view?
        { label: 'My Attendance', path: '/attendance/my' },
      ]
    },
    {
      label: 'Activities',
      icon: Activity,
      children: [
        { label: 'Activity Approval', path: '/activities/approval' },
        { label: 'Log Activity', path: '/activities/log' },
        { label: 'My Activities', path: '/activities/my' },
      ]
    },
    {
      label: 'Leave',
      icon: FileText,
      children: [
        { label: 'Leave Requests', path: '/leaves/requests' },
        { label: 'My Leave', path: '/leaves/my' },
      ]
    },
    {
      label: 'Reports',
      icon: BarChart2,
      children: [
        { label: 'Team Reports', path: '/reports/team' },
        { label: 'Attendance Reports', path: '/reports/attendance' },
        { label: 'Leave Reports', path: '/reports/leave' },
      ]
    },
    {
      label: 'More',
      icon: MoreHorizontal,
      children: [
        { label: 'My Profile', path: '/profile' },
        { label: 'Notifications Settings', path: '/settings/notifications' },
        { label: 'Help Center', path: '/help' },
        { label: 'Support', path: '/support' },
      ]
    }
  ],
  'HR Admin': [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    {
      label: 'User Management',
      icon: Users,
      children: [
        { label: 'Employees', path: '/employees' },
        { label: 'Departments', path: '/departments' },
      ]
    },
    {
      label: 'Attendance',
      icon: Calendar,
      children: [
        { label: 'Daily Attendance', path: '/attendance/daily' },
        { label: 'GPS Verification', path: '/attendance/gps' },
        { label: 'My Attendance', path: '/attendance/my' },
      ]
    },
    { label: 'Activities', icon: Activity, path: '/activities' }, // Just a link in screenshot? No, likely expanded.
    // Screenshot shows simple "Activities" button style actually. But following pattern.
    {
      label: 'Leave Management',
      icon: FileText,
      children: [
        { label: 'Leave Requests', path: '/leaves/requests' },
        { label: 'My Leave', path: '/leaves/my' },
      ]
    },
    {
      label: 'Reports',
      icon: BarChart2,
      children: [
        { label: 'HR Reports', path: '/reports/hr' },
        { label: 'Attendance Reports', path: '/reports/attendance' },
        { label: 'Leave Reports', path: '/reports/leave' },
        { label: 'Field Activity Reports', path: '/reports/activity' },
      ]
    },
    {
      label: 'More',
      icon: MoreHorizontal,
      children: [
        { label: 'My Profile', path: '/profile' },
        { label: 'Notifications Settings', path: '/settings/notifications' },
        { label: 'Help Center', path: '/help' },
        { label: 'Support', path: '/support' },
      ]
    }
  ],
  'Super Admin': [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    {
      label: 'User Management',
      icon: Users,
      children: [
        { label: 'Employees', path: '/employees' },
        { label: 'Roles & Permissions', path: '/roles' },
        { label: 'Departments', path: '/departments' },
      ]
    },
    {
      label: 'Attendance',
      icon: Calendar,
      children: [
        { label: 'Daily Attendance', path: '/attendance/daily' },
        { label: 'GPS Verification', path: '/attendance/gps' },
        { label: 'My Attendance', path: '/attendance/my' },
      ]
    },
    { label: 'Activities', icon: Activity, path: '/activities' },
    {
      label: 'Locations Management',
      icon: MapPin,
      children: [
        { label: 'Locations', path: '/locations' },
        { label: 'Location Type', path: '/locations/types' },
        { label: 'Location Assignment', path: '/locations/assign' },
      ]
    },
    {
      label: 'Leave Management',
      icon: FileText,
      children: [
        { label: 'Leave Requests', path: '/leaves/requests' },
        { label: 'My Leave', path: '/leaves/my' },
      ]
    },
    {
      label: 'Reports',
      icon: BarChart2,
      children: [
        { label: 'Attendance Reports', path: '/reports/attendance' },
        { label: 'Field Activity Reports', path: '/reports/activity' },
        { label: 'Leave Reports', path: '/reports/leave' },
        { label: 'HR Reports', path: '/reports/hr' },
      ]
    },
    {
      label: 'More',
      icon: MoreHorizontal,
      children: [
        { label: 'My Profile', path: '/profile' },
        { label: 'System Configuration', path: '/settings' },
        { label: 'Notifications Settings', path: '/settings/notifications' },
        { label: 'API Keys', path: '/settings/api' },
        { label: 'Help Center', path: '/help' },
        { label: 'Support', path: '/support' },
      ]
    }
  ]
};
