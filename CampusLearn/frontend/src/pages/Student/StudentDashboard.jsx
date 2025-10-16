import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import useAuth from '../../hooks/useAuth';
import { logout } from '../../features/auth/authSlice';
import courseApi from '../../api/courseApi';
import progressApi from '../../api/progressApi';
import { Link } from 'react-router-dom';
import StudentMessageBoard from './StudentMessageBoard'; // Corrected component import

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
    const [query, setQuery] = useState('');
    const [onlyEnrolled, setOnlyEnrolled] = useState(false);

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

    const filteredCourses = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = courses;
        if (onlyEnrolled) list = list.filter(c => enrolledCourseIds.includes(String(c._id)));
        if (!q) return list;
        return list.filter(c => (c.title || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q));
    }, [courses, query, onlyEnrolled, enrolledCourseIds]);

  if (loading) return <p>Loading courses...</p>;

    return (
        <div style={{ padding: 30, background: SOFT_BG, minHeight: '100vh' }}>
            <h2 style={{ color: PRIMARY_COLOR, borderBottom: `2px solid ${SOFT_BORDER_COLOR}`, paddingBottom: 10, marginBottom: 15 }}>
                    Student Dashboard
            </h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div>
                    <p style={{ margin: 0, fontWeight: 'bold', color: MUTE_GRAY }}>Welcome, <span style={{ color: PRIMARY_COLOR }}>{user?.name}</span> 👋</p>
                    <p style={{ margin: '6px 0 0', color: '#475569' }}>Ready to learn? Browse available courses or continue where you left off.</p>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ padding: 12, background: WHITE, borderRadius: 8, boxShadow: '0 6px 12px rgba(0,0,0,0.04)', minWidth: 120 }}>
                            <div style={{ fontSize: 12, color: MUTE_GRAY }}>Enrolled</div>
                            <div style={{ fontSize: 20, fontWeight: '700', color: PRIMARY_COLOR }}>{enrolledCourseIds.length}</div>
                        </div>
                        <div style={{ padding: 12, background: WHITE, borderRadius: 8, boxShadow: '0 6px 12px rgba(0,0,0,0.04)', minWidth: 120 }}>
                            <div style={{ fontSize: 12, color: MUTE_GRAY }}>Available</div>
                            <div style={{ fontSize: 20, fontWeight: '700', color: PRIMARY_COLOR }}>{courses.length}</div>
                        </div>
                    </div>

                    <button 
                        onClick={() => dispatch(logout())} 
                        style={{ ...buttonBaseStyle, background: DANGER_COLOR, color: WHITE, padding: '8px 15px' }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Search and filter */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
                <input
                    placeholder="Search courses by title or description"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e6e6' }}
                />
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
                    <input type="checkbox" checked={onlyEnrolled} onChange={() => setOnlyEnrolled(v => !v)} /> Only enrolled
                </label>
            </div>

            <h3 style={{ marginTop: 6, marginBottom: 8, color: PRIMARY_COLOR }}>Courses</h3>
            {filteredCourses.length === 0 && <p style={{ color: MUTE_GRAY }}>No matching courses.</p>}

            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {filteredCourses.map(c => {
                    const isEnrolled = enrolledCourseIds.includes(String(c._id));

                    return (
                        <div key={c._id} style={{
                            border: `1px solid ${SOFT_BORDER_COLOR}`,
                            padding: 20,
                            borderRadius: 8,
                            background: WHITE,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.04)',
                            borderLeft: isEnrolled ? `6px solid ${ACCENT_COLOR}` : '6px solid transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                                    <h4 style={{ color: PRIMARY_COLOR, marginTop: 0, marginBottom: 6 }}>{c.title}</h4>
                                    {isEnrolled && <div style={{ fontSize: 12, color: WHITE, background: ACCENT_COLOR, padding: '6px 8px', borderRadius: 6 }}>Enrolled</div>}
                                </div>
                                <p style={{ color: MUTE_GRAY, fontSize: '0.95em', minHeight: 42 }}>{c.description || 'No description'}</p>
                            </div>

                            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-start', gap: 10 }}>
                                {isEnrolled ? (
                                    <Link to={`/student/course/${c._id}`} style={{ textDecoration: 'none' }}>
                                        <button style={{ ...buttonBaseStyle, background: ACCENT_COLOR, color: WHITE }}>Go to Course</button>
                                    </Link>
                                ) : (
                                    <button onClick={() => handleEnroll(c._id)} style={{ ...buttonBaseStyle, background: SUCCESS_COLOR, color: WHITE }}>Enroll</button>
                                )}
                                <Link to={`/student/course/${c._id}`} style={{ alignSelf: 'center', color: '#6B7280', textDecoration: 'none', fontSize: 13 }}>View details</Link>
                            </div>
                        </div>
                    );
                })}
            </div>
            <StudentMessageBoard />
        </div>
    );
}