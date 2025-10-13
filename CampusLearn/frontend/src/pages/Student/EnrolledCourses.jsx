import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyCourses } from '../../features/progress/progressSlice';
import { Link } from 'react-router-dom';

// --- THEME CONSTANTS ---
const PRIMARY_COLOR = '#473E7A'; // MongoDB Purple
const ACCENT_COLOR = '#4B6CB7'; // Secondary Blue/Accent
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const SOFT_BG = '#F8F8F8';
const WHITE = '#FFFFFF';
const DANGER_COLOR = '#E53935'; 
const MUTE_GRAY = '#666666';

// Shared button style
const buttonPrimaryStyle = {
    background: PRIMARY_COLOR,
    color: WHITE,
    padding: '10px 18px',
    borderRadius: 4,
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
};

export default function EnrolledCourses() {
  const dispatch = useDispatch();
  const { courses, loading, error } = useSelector(s => s.progress); 

  useEffect(() => { dispatch(fetchMyCourses()); }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: DANGER_COLOR }}>{error}</p>;

  return (
    <div style={{ padding: 30, background: SOFT_BG, minHeight: '100vh' }}>
      <h2 style={{ color: PRIMARY_COLOR, borderBottom: `2px solid ${SOFT_BORDER_COLOR}`, paddingBottom: 10, marginBottom: 30 }}>
          My Enrolled Courses
      </h2>
      {courses.length === 0 && <p style={{ color: MUTE_GRAY }}>No enrolled courses yet. Go to the dashboard to enroll!</p>}
      
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {courses.map(c => {
          if (!c.course) return null; 

          return (
            <div 
                key={c._id} 
                style={{ 
                    border: `1px solid ${SOFT_BORDER_COLOR}`, 
                    padding: 20, 
                    borderRadius: 8, 
                    background: WHITE,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                    borderLeft: `5px solid ${ACCENT_COLOR}`
                }}
            >
              <h3>{c.course.title}</h3>
              <p style={{ color: MUTE_GRAY, fontSize: '0.9em' }}>{c.course.description}</p>
              
              <Link to={`/student/course/${c.course._id}`} style={{ textDecoration: 'none' }}>
                <button style={{ ...buttonPrimaryStyle, background: ACCENT_COLOR, marginTop: 10 }}>
                  Continue Learning 🚀
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}