import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { Navigate, Link } from 'react-router-dom';

export default function Login() {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  if (auth.user) {
    if (auth.user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 20, border: '1px solid #ddd' }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div><label>Email</label><input name="email" type="email" value={form.email} onChange={onChange} required /></div>
        <div><label>Password</label><input name="password" type="password" value={form.password} onChange={onChange} required /></div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={auth.loading}>{auth.loading ? 'Logging in...' : 'Login'}</button>
        </div>
        {auth.error && <p style={{ color: 'red' }}>{auth.error}</p>}
      </form>
      <p>Don't have account? <Link to="/register">Register</Link></p>
    </div>
  );
}
