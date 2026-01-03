import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { ROLE_NAVIGATION, type NavItem } from '../../config/navigation';

const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 
    'User Management': true,
    'Attendance': true,
    'Activities': true,
    'Locations Management': true,
    'Leave Management': true,
    'Leave': true,
    'Reports': true,
    'More': false 
  }); // Default expanded for demo

  const toggleExpand = (label: string) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string) => location.pathname === path;

  // Determine items based on role
  const navItems = useMemo(() => {
    if (!user || !user.roles || user.roles.length === 0) return [];
    
    // Priority: Super Admin > HR Admin > Manager > Field Worker > Office Staff
    const rolePriority = ['Super Admin', 'HR Admin', 'Manager', 'Field Worker', 'Office Staff'];
    
    for (const role of rolePriority) {
        if (user.roles.includes(role)) {
            return ROLE_NAVIGATION[role] || [];
        }
    }
    
    return [];
  }, [user]);

  const renderNavItem = (item: NavItem, level: number = 0) => {
      const isExpanded = expanded[item.label];
      const isItemActive = item.path ? isActive(item.path) : false;
      const Icon = item.icon;
      
      const hasChildren = item.children && item.children.length > 0;

      return (
        <div key={item.label} style={{ marginBottom: '0.25rem' }}>
            <div 
              onClick={() => hasChildren ? toggleExpand(item.label) : null}
              style={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: '0.75rem', 
                padding: '0.75rem 1rem', 
                borderRadius: '0.5rem', 
                textDecoration: 'none',
                color: isItemActive ? 'var(--sidebar-text)' : 'var(--sidebar-text-muted)',
                background: isItemActive ? 'var(--sidebar-active)' : 'transparent',
                fontWeight: isItemActive || level === 0 ? 500 : 400,
                cursor: item.path ? 'pointer' : (hasChildren ? 'pointer' : 'default'),
                paddingLeft: level === 0 ? '1rem' : '2.5rem',
                fontSize: level === 0 ? '0.9rem' : '0.85rem'
              }}
            >
               {item.path && !hasChildren ? (
                   <Link to={item.path} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, color: 'inherit', textDecoration: 'none' }}>
                        {level === 0 && Icon && <Icon size={20} />}
                        <span>{item.label}</span>
                   </Link>
               ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                        {level === 0 && Icon && <Icon size={20} />}
                        <span>{item.label}</span>
                    </div>
               )}
               
               {hasChildren && (
                   <div style={{ opacity: 0.7 }}>
                       {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                   </div>
               )}
            </div>
            
            {hasChildren && isExpanded && (
                <div style={{ marginTop: '0.1rem' }}>
                    {item.children!.map(child => renderNavItem(child, level + 1))}
                </div>
            )}
        </div>
      );
  };

  return (
    <aside style={{ 
      width: '260px', 
      background: 'var(--sidebar-bg)', 
      color: 'var(--sidebar-text)',
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      flexShrink: 0,
      overflowY: 'auto',
      borderRight: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* Brand / Logo */}
      <div style={{ padding: '2rem 1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.7rem', opacity: 0.8, letterSpacing: '1px' }}>THE CENTER FOR</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', lineHeight: '1.2' }}>Mind-Body<br/>Medicine</span>
        </div>
      </div>
      
      <div style={{ paddingLeft: '1.5rem', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--sidebar-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Menu
      </div>

      <nav style={{ flex: 1, padding: '0 0.75rem 2rem 0.75rem' }}>
         {navItems.map(item => renderNavItem(item))}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
         <button 
           onClick={logout} 
           style={{ 
             display: 'flex', 
             alignItems: 'center', 
             gap: '0.75rem', 
             width: '100%',
             padding: '0.75rem', 
             background: 'transparent', 
             color: 'var(--sidebar-text-muted)', 
             border: 'none', 
             cursor: 'pointer',
             fontSize: '0.95rem'
           }}
         >
            <LogOut size={20} /> Log out
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;
