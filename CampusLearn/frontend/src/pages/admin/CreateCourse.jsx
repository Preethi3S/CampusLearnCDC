import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCourse } from '../../features/courses/courseSlice';
import { useNavigate } from 'react-router-dom';

export default function CreateCourse() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.courses);
  const [form, setForm] = useState({ title: '', description: '', isPublished: false });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const action = await dispatch(createCourse(form)).unwrap();
      // navigate to admin dashboard after create
      navigate('/admin/dashboard');
    } catch (err) {
      // handled in slice
      console.error('Create failed', err);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <h2>Create Course</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Title</label>
          <input name="title" value={form.title} onChange={onChange} required />
        </div>
        <div>
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={onChange} rows={4} />
        </div>
        <div>
          <label>
            <input name="isPublished" type="checkbox" checked={form.isPublished} onChange={onChange} /> Publish
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Course'}</button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
