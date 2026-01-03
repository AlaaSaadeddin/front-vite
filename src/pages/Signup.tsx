import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Atom } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      // Combine names for the basic 'name' field if needed by backend, 
      // or send separately if backend supports it. 
      // Based on previous edits, backend supports firstName/lastName in profile but register usually takes 'name'.
      // I'll send 'name' as combination and also specific fields if possible, or just 'name'.
      // Let's assume standard register endpoint takes name, email, password.

      const payload = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirm_password: formData.confirmPassword
      };

      await authService.register(payload);
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      let msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Registration failed';

      // If validation error with details
      if (err?.response?.data?.error?.details && Array.isArray(err.response.data.error.details)) {
        msg = `${msg}: ${err.response.data.error.details.join(', ')}`;
      }

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>

      {/* Left Side - Signup Form */}
      <div style={{
        flex: 1,
        background: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        position: 'relative'
      }}>
        {/* Logo - Top Left */}
        <div style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>
          <Atom size={28} />
          <div style={{ lineHeight: 1.1, fontSize: '0.9rem' }}>
            <div>The Center for</div>
            <div>Mind-Body Medicine</div>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '480px', marginTop: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Create account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Create your account and begin your journey</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Name Fields */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                  style={{ padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '0.4rem', outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                  style={{ padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '0.4rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                style={{ padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '0.4rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                style={{ padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '0.4rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                style={{ padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '0.4rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                style={{ padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '0.4rem', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '0.4rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.5px'
              }}
            >
              {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              <span style={{ padding: '0 0.5rem' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            </div>

            <button
              type="button"
              style={{
                background: 'white',
                color: 'var(--text-main)',
                border: '1px solid var(--border)',
                padding: '0.75rem',
                borderRadius: '0.4rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontWeight: 'bold', color: '#EA4335' }}>G</span> Sign up with Google
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Branding / Sign In CTA */}
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
        {/* Decorative Background Shapes */}
        <div style={{ position: 'absolute', top: '5%', left: '50%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.03)', transform: 'rotate(45deg)', borderRadius: '2rem' }}></div>

        <div style={{ maxWidth: '450px', textAlign: 'center', zIndex: 1 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.2 }}>
            Support your team to support others
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Manage therapists, staff schedules, and well-being programs. in one secure platform.
          </p>
          <button
            onClick={() => navigate('/login')}
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
            SIGN IN
          </button>
        </div>
      </div>

    </div>
  );
};

export default Signup;
