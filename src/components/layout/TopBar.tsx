import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, MessageSquare, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TopBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditProfile = () => {
    setShowDropdown(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/login');
  };

  // Get user's role display
  const userRole = user?.roles?.[0] || 'User';

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Search */}
      <div style={{ flex: 1, maxWidth: '400px' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Search size={18} style={{ 
            position: 'absolute', 
            left: '12px', 
            color: 'var(--text-muted)' 
          }} />
          <input 
            type="text" 
            placeholder="Search" 
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.5rem',
              borderRadius: '999px',
              border: '1px solid var(--border)',
              outline: 'none',
              fontSize: '0.9rem',
              color: 'var(--text-main)',
            }}
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
          }}>
             <MessageSquare size={20} />
          </button>
          <button style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
          }}>
             <Bell size={20} />
          </button>
        </div>

        {/* User Menu */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              borderLeft: '1px solid var(--border)',
              paddingLeft: '1.5rem',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Hi, {user?.name?.split(' ')[0] || 'User'}!</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{userRole}</span>
            </div>
            <ChevronDown 
              size={16} 
              color="var(--text-muted)" 
              style={{ 
                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            />
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              right: 0,
              background: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '1px solid var(--border)',
              minWidth: '200px',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              {/* User Info Header */}
              <div style={{
                padding: '1rem',
                borderBottom: '1px solid var(--border)',
                background: '#f9fafb'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  {user?.email}
                </div>
              </div>

              {/* Menu Items */}
              <div style={{ padding: '0.5rem 0' }}>
                <button
                  onClick={handleEditProfile}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                    textAlign: 'left',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <User size={18} />
                  Edit Profile
                </button>

                <div style={{ 
                  height: '1px', 
                  background: 'var(--border)', 
                  margin: '0.5rem 0' 
                }} />

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#ef4444',
                    textAlign: 'left',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={18} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
