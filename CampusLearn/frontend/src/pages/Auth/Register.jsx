import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiUser, FiMail } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../features/auth/authSlice';
import { Navigate, Link } from 'react-router-dom';

export default function Register() {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);

  if (auth.user) {
    return <Navigate to={auth.user.role === 'admin' ? "/admin/dashboard" : "/student/dashboard"} replace />;
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(register(form));
  };

  const card = {
    maxWidth: 420,
    margin: '40px auto',
    padding: 28,
    borderRadius: 12,
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    background: '#fff',
    boxSizing: 'border-box',
  };

  const inputWrapper = {
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  };

  const input = {
    width: '100%',
    padding: '10px 40px 10px 40px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 14,
    color: '#111',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const iconStyle = (isFilled) => ({
    position: 'absolute',
    left: 12,
    color: isFilled ? '#473E7A' : '#999',
    pointerEvents: 'none',
  });

  return (
    <div style={{ padding: 20 }}>
      <div style={card}>
        <h2 style={{ marginTop: 0, marginBottom: 6, color: '#473E7A' }}>Create account</h2>
        <p style={{ marginTop: 0, marginBottom: 18, fontSize: 13, color: '#666' }}>
          Register to access courses and quizzes.
        </p>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Name */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#333' }}>Name</label>
            <div style={inputWrapper}>
              <FiUser style={iconStyle(form.name)} />
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                required
                placeholder="Your full name"
                style={input}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#333' }}>Email</label>
            <div style={inputWrapper}>
              <FiMail style={iconStyle(form.email)} />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                placeholder="you@company.com"
                style={input}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#333' }}>Password</label>
            <div style={inputWrapper}>
              <FiLock style={iconStyle(form.password)} />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={onChange}
                required
                placeholder="Choose a password"
                style={input}
              />
              {/* <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  padding: 4,
                }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button> */}
            </div>
            
          </div>

          {/* Role */}
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#333' }}>Role</label>
            <select
              name="role"
              value={form.role}
              onChange={onChange}
              style={{
                ...input,
                paddingLeft: 12,
                paddingRight: 12,
                appearance: 'none',
              }}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={auth.loading}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: '#473E7A',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: auth.loading ? 'not-allowed' : 'pointer',
              opacity: auth.loading ? 0.7 : 1,
            }}
          >
            {auth.loading ? 'Creating account...' : 'Create account'}
          </button>

          {auth.error && (
            <div
              style={{
                marginTop: 8,
                padding: 10,
                background: '#FFEFEF',
                border: '1px solid #F5C2C2',
                color: '#B00020',
                borderRadius: 6,
                fontSize: 13,
              }}
            >
              {auth.error}
            </div>
          )}
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13 }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
