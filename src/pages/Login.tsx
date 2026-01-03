import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Atom } from 'lucide-react';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      // Small delay to ensure state is updated
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Invalid credentials';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* Left Side - Brand / Sign Up Call to Action */}
      <div style={{ 
        flex: 1, 
        background: 'var(--primary)', 
        color: 'white',
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '4rem',
        position: 'relative'
      }}>
         {/* Logo Placeholder */}
         <div style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
             <Atom size={32} />
             <div style={{ lineHeight: 1.1 }}>
                 <div>The Center for</div>
                 <div>Mind-Body Medicine</div>
             </div>
         </div>

         {/* Decorative Background Shapes (Optional simplified representation) */}
         <div style={{ position: 'absolute', top: '10%', right: '10%', width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', transform: 'rotate(45deg)', borderRadius: '1rem' }}></div>
         <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

         <div style={{ maxWidth: '400px', textAlign: 'center', zIndex: 1 }}>
             <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.2 }}>
                Create your organization account
             </h2>
             <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2.5rem', lineHeight: 1.6 }}>
                 Manage your team's workflow and support their well-being programs.
             </p>
             <button 
                onClick={() => navigate('/signup')} // We'll need to create this route
                style={{ 
                    background: 'transparent', 
                    border: '2px solid white', 
                    color: 'white', 
                    padding: '0.8rem 2.5rem', 
                    borderRadius: '2rem', 
                    fontSize: '0.9rem', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    letterSpacing: '0.5px'
                }}
             >
                 SIGN UP
             </button>
         </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{ 
          flex: 1, 
          background: 'white', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '2rem'
      }}>
         <div style={{ width: '100%', maxWidth: '420px' }}>
             <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                 <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Welcome back</h2>
                 <p style={{ color: 'var(--text-muted)' }}>Manage your work and support your journey</p>
             </div>

             <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ 
                          padding: '0.75rem', 
                          border: '1px solid var(--border)', 
                          borderRadius: '0.5rem',
                          outline: 'none',
                          fontSize: '1rem',
                          color: 'var(--text-main)'
                      }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ 
                          padding: '0.75rem', 
                          border: '1px solid var(--border)', 
                          borderRadius: '0.5rem',
                          outline: 'none',
                          fontSize: '1rem',
                          color: 'var(--text-main)'
                      }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                        Remember me
                    </label>
                    <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>Forgot Password?</span>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ 
                      marginTop: '1rem',
                      background: 'var(--primary)', 
                      color: 'white', 
                      border: 'none', 
                      padding: '1rem', 
                      borderRadius: '0.5rem', 
                      fontSize: '0.95rem', 
                      fontWeight: 700, 
                      cursor: 'pointer',
                      letterSpacing: '0.5px'
                  }}
                >
                  {loading ? 'SIGNING IN...' : 'SIGN IN'}
                </button>
             </form>
         </div>
      </div>
    </div>
  );
};

export default Login;
