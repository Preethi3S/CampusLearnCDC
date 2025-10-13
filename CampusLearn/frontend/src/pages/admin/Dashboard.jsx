import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, deleteCourse } from '../../features/courses/courseSlice';
import CourseCard from '../../components/CourseCard';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

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
      
      <div style={{ marginBottom: 30 }}>
        <Link to="/admin/create-course" style={{ textDecoration: 'none' }}>
            <button style={buttonPrimaryStyle}>+ Create New Course</button>
        </Link>
      </div>

      {loading && <p>Loading courses...</p>}
      {error && <p style={{ color: DANGER_COLOR }}>Error: {error}</p>}

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {items.length === 0 && !loading && <p>No courses have been created yet.</p>}
        {items.map(c => <CourseCard key={c._id} course={c} onDelete={handleDelete} />)}
      </div>

    </div>
  );
}