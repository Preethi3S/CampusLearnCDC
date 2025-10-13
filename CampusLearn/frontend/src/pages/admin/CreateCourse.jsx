import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCourse } from '../../features/courses/courseSlice';
import { useNavigate } from 'react-router-dom';

// --- THEME CONSTANTS ---
const PRIMARY_COLOR = '#473E7A'; // MongoDB Purple
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const WHITE = '#FFFFFF';
const DANGER_COLOR = '#E53935'; 

// Shared style for input and textarea
const inputStyle = {
    padding: '10px 12px',
    border: `1px solid ${SOFT_BORDER_COLOR}`,
    borderRadius: 4,
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: 15,
    marginTop: 5,
    backgroundColor: WHITE
};

const buttonPrimaryStyle = {
    background: PRIMARY_COLOR,
    color: WHITE,
    padding: '12px 20px',
    borderRadius: 4,
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
};

export default function CreateCourse() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.courses);
  const [form, setForm] = useState({ title: '', description: '', isPublished: false });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createCourse(form)).unwrap();
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Create failed', err);
    }
  };

  return (
    <div style={{ 
        maxWidth: 720, 
        margin: '30px auto', 
        padding: 30, 
        backgroundColor: WHITE,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: PRIMARY_COLOR, borderBottom: `2px solid ${SOFT_BORDER_COLOR}`, paddingBottom: 10, marginBottom: 20 }}>
          Create New Course
      </h2>
      <form onSubmit={onSubmit}>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block' }}>Title</label>
          <input name="title" value={form.title} onChange={onChange} required style={inputStyle} />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block' }}>Description</label>
          <textarea 
              name="description" 
              value={form.description} 
              onChange={onChange} 
              rows={4} 
              style={{ ...inputStyle, resize: 'vertical' }} 
            />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input 
                name="isPublished" 
                type="checkbox" 
                checked={form.isPublished} 
                onChange={onChange} 
                style={{ width: 'auto', marginRight: 8, marginTop: 0 }}
            /> Publish Course Now
          </label>
        </div>
        <div style={{ marginTop: 20 }}>
          <button 
                type="submit" 
                disabled={loading} 
                style={{ 
                    ...buttonPrimaryStyle, 
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Creating...' : 'Create Course'}
            </button>
        </div>
        {error && <p style={{ color: DANGER_COLOR, marginTop: 15, fontWeight: 'bold' }}>Error: {error}</p>}
      </form>
    </div>
  );
}