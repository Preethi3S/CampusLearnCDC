import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useAuth from '../../hooks/useAuth';
import { logout } from '../../features/auth/authSlice';
import courseApi from '../../api/courseApi';
import progressApi from '../../api/progressApi';
import { Link } from 'react-router-dom';

// --- THEME CONSTANTS ---
const PRIMARY_COLOR = '#473E7A'; // MongoDB Purple (Dark)
const ACCENT_COLOR = '#4B6CB7'; // Secondary Blue/Accent (Go to Course)
const SUCCESS_COLOR = '#10B981'; // Teal/Green (Enroll Button)
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const SOFT_BG = '#F8F8F8';
const WHITE = '#FFFFFF';
const DANGER_COLOR = '#E53935';
const MUTE_GRAY = '#6B7280';

// Shared button style
const buttonBaseStyle = {
    padding: '10px 18px',
    borderRadius: 6,
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginRight: '10px',
};

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const dispatch = useDispatch();
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all courses posted by staff/admin and student's progress
  const fetchCourses = async () => {
    setLoading(true);
    try {
      // 1. Fetch all available courses
      const allCourses = await courseApi.getCourses(token); 
      // 2. Fetch student's progress documents (which contain the course object)
      const enrolledProgresses = await progressApi.getMyCourses(token); 
      
      const enrolledIds = enrolledProgresses
        .filter(p => p.course?._id)
        .map(p => String(p.course._id));

      setCourses(allCourses);
      setEnrolledCourseIds(enrolledIds); 
    } catch (err) {
      console.error(err);
      alert('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  // Enroll in a course
  const handleEnroll = async (courseId) => {
    try {
      await progressApi.enrollCourse(courseId, token);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to enroll');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [token]);

  if (loading) return <p>Loading courses...</p>;

  return (
    <div style={{ padding: 30, background: SOFT_BG, minHeight: '100vh' }}>
      <h2 style={{ color: PRIMARY_COLOR, borderBottom: `2px solid ${SOFT_BORDER_COLOR}`, paddingBottom: 10, marginBottom: 15 }}>
          Student Dashboard
      </h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: MUTE_GRAY }}>Welcome, <span style={{ color: PRIMARY_COLOR }}>{user?.name}</span> 👋</p>
        <button 
            onClick={() => dispatch(logout())} 
            style={{ ...buttonBaseStyle, background: DANGER_COLOR, color: WHITE, padding: '8px 15px' }}
        >
            Logout
        </button>
      </div>

      <h3 style={{ marginTop: 20, color: PRIMARY_COLOR }}>Available Courses (Enrollment)</h3>
      {courses.length === 0 && <p style={{ color: MUTE_GRAY }}>No courses available yet.</p>}

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {courses.map(c => {
          const isEnrolled = enrolledCourseIds.includes(String(c._id));

          return (
            <div key={c._id} style={{
              border: `1px solid ${SOFT_BORDER_COLOR}`,
              padding: 20,
              borderRadius: 8,
              background: WHITE,
              boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
              borderLeft: isEnrolled ? `5px solid ${ACCENT_COLOR}` : '5px solid transparent'
            }}>
              <h4 style={{ color: PRIMARY_COLOR, marginTop: 0 }}>{c.title}</h4>
              <p style={{ color: MUTE_GRAY, fontSize: '0.9em' }}>{c.description || 'No description'}</p>
              
              {isEnrolled ? (
                <Link to={`/student/course/${c._id}`} style={{ textDecoration: 'none' }}>
                  <button style={{ ...buttonBaseStyle, background: ACCENT_COLOR, color: WHITE }}>
                    Go to Course
                  </button>
                </Link>
              ) : (
                <button 
                  onClick={() => handleEnroll(c._id)} 
                  style={{ ...buttonBaseStyle, background: SUCCESS_COLOR, color: WHITE }}
                >
                  Enroll
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}