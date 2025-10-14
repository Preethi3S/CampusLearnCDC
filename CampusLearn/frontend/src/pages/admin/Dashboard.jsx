import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, deleteCourse } from '../../features/courses/courseSlice';
import CourseCard from '../../components/CourseCard';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';

// --- THEME CONSTANTS ---
const PRIMARY_COLOR = '#473E7A'; // MongoDB Purple
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const SOFT_BG = '#F8F8F8';
const WHITE = '#FFFFFF';
const DANGER_COLOR = '#E53935'; 

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

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(s => s.courses);
  const auth = useSelector(s => s.auth);
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [showPublishedOnly, setShowPublishedOnly] = useState(false);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = items || [];
        if (showPublishedOnly) list = list.filter(c => c.isPublished);
        if (!q) return list;
        return list.filter(c => (c.title || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q));
    }, [items, query, showPublishedOnly]);

    const stats = useMemo(() => ({
        total: items.length || 0,
        published: items.filter(c => c.isPublished).length || 0,
        unpublished: items.filter(c => !c.isPublished).length || 0
    }), [items]);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this course?')) return;
    dispatch(deleteCourse(id));
  };

  return (
    <div style={{ padding: 30, background: SOFT_BG, minHeight: '100vh' }}>
      <h2 style={{ 
          color: PRIMARY_COLOR, 
          borderBottom: `2px solid ${SOFT_BORDER_COLOR}`, 
          paddingBottom: 10, 
          marginBottom: 20 
      }}>
          Admin Dashboard
      </h2>
      
            <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Link to="/admin/create-course" style={{ textDecoration: 'none' }}>
                        <button style={buttonPrimaryStyle}>+ Create New Course</button>
                    </Link>
                    <button
                        style={{ ...buttonPrimaryStyle, background: '#A63E3E' }}
                        onClick={() => { dispatch(logout()); navigate('/login'); }}
                    >
                        Logout
                    </button>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ padding: 12, background: WHITE, borderRadius: 8, boxShadow: '0 6px 12px rgba(0,0,0,0.04)', minWidth: 110, textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: '#6B7280' }}>Total</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: PRIMARY_COLOR }}>{stats.total}</div>
                        </div>
                        <div style={{ padding: 12, background: WHITE, borderRadius: 8, boxShadow: '0 6px 12px rgba(0,0,0,0.04)', minWidth: 110, textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: '#6B7280' }}>Published</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#0EA5A4' }}>{stats.published}</div>
                        </div>
                        <div style={{ padding: 12, background: WHITE, borderRadius: 8, boxShadow: '0 6px 12px rgba(0,0,0,0.04)', minWidth: 110, textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: '#6B7280' }}>Unpublished</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#F97316' }}>{stats.unpublished}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input placeholder="Search courses" value={query} onChange={(e) => setQuery(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #e6e6e6' }} />
                        <label style={{ fontSize: 13, color: '#475569', display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="checkbox" checked={showPublishedOnly} onChange={() => setShowPublishedOnly(v => !v)} /> Published only
                        </label>
                        <button onClick={() => dispatch(fetchCourses())} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e6e6e6', background: '#fff', cursor: 'pointer' }}>Refresh</button>
                    </div>
                </div>
            </div>

      {loading && <p>Loading courses...</p>}
      {error && <p style={{ color: DANGER_COLOR }}>Error: {error}</p>}

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {items.length === 0 && !loading && <p>No courses have been created yet.</p>}
    {items.map(c => <CourseCard key={c._id} course={c} onDelete={handleDelete} onUpdated={() => dispatch(fetchCourses())} />)}
      </div>

    </div>
  );
}