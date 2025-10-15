import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { Navigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';

export default function Login() {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  if (auth.user) {
    if (auth.user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  // simple styles
  const card = {
    maxWidth: 420,
    margin: '40px auto',
    padding: 28,
    borderRadius: 10,
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    background: '#fff',
  };
  const label = { display: 'block', marginBottom: 6, fontSize: 14, color: '#333' };
  const input = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #ddd',
    fontSize: 14,
    color: '#111',
    background: '#fff',
    boxSizing: 'border-box',
  };
  const btn = {
    width: '100%',
    padding: '12px 14px',
    background: '#473E7A',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  };
  const small = { fontSize: 13, color: '#666' };

  return (
    <div style={{ padding: 20 }}>
      <div style={card}>
        <h2 style={{ marginTop: 0, marginBottom: 6, color: '#473E7A' }}>Welcome back</h2>
        <p style={{ marginTop: 0, marginBottom: 18, ...small }}>Sign in to your account to continue.</p>

        <form onSubmit={onSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 12 }}>
            <label style={label}>Email</label>
            <div style={{ position: 'relative' }}>
              <FiMail
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: form.email ? '#473E7A' : '#999',
                }}
              />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                placeholder="you@company.com"
                style={{
                  ...input,
                  paddingLeft: '38px',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <label style={label}>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: form.password ? '#473E7A' : '#999',
                }}
              />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={onChange}
                required
                placeholder="Your password"
                style={{
                  ...input,
                  paddingLeft: '38px',
                  paddingRight: '38px', // <== FIX: adds space so the eye button doesn’t overlap
                }}
                autoComplete="current-password"
              />
              {/* <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button> */}
            </div>
          </div>

          {/* Remember + Forgot */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember((r) => !r)}
              />{' '}
              <span style={small}>Remember me</span>
            </label>
            <Link
              to="/forgot"
              style={{ color: '#473E7A', textDecoration: 'none', fontSize: 13 }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Button */}
          <div style={{ marginBottom: 12, marginTop: 24 }}>
            <button
              type="submit"
              disabled={auth.loading}
              style={{
                ...btn,
                opacity: auth.loading ? 0.8 : 1,
                pointerEvents: auth.loading ? 'none' : 'auto',
              }}
            >
              {auth.loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Error */}
          {auth.error && (
            <div
              style={{
                marginTop: 8,
                padding: 10,
                background: '#FFEFEF',
                border: '1px solid #F5C2C2',
                color: '#B00020',
                borderRadius: 6,
              }}
            >
              {auth.error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <p style={{ margin: 0, ...small }}>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
