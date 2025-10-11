import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../features/auth/authSlice';
import { Navigate, Link } from 'react-router-dom';

export default function Register() {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });

  if (auth.user) {
    // redirect based on role
    if (auth.user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(register(form));
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 20, border: '1px solid #ddd' }}>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <div><label>Name</label><input name="name" value={form.name} onChange={onChange} required /></div>
        <div><label>Email</label><input name="email" type="email" value={form.email} onChange={onChange} required /></div>
        <div><label>Password</label><input name="password" type="password" value={form.password} onChange={onChange} required /></div>
        <div>
          <label>Role</label>
          <select name="role" value={form.role} onChange={onChange}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={auth.loading}>{auth.loading ? 'Please wait...' : 'Register'}</button>
        </div>
        {auth.error && <p style={{ color: 'red' }}>{auth.error}</p>}
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
