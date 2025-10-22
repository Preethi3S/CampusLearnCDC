import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { logout } from '../../features/auth/authSlice';
import courseApi from '../../api/courseApi';
import progressApi from '../../api/progressApi';
import StudentMessageBoard from './StudentMessageBoard';
import StudentProfilePopup from './StudentProfilePopup/StudentProfilePopup';
import { fetchProfile } from '../../features/profile/studentProfileSlice';

// --- THEME CONSTANTS ---
const PRIMARY_COLOR = '#473E7A';
const ACCENT_COLOR = '#4B6CB7';
const SUCCESS_COLOR = '#10B981';
const SOFT_BORDER_COLOR = '#EBEBEB';
const SOFT_BG = '#F8F8F8';
const WHITE = '#FFFFFF';
const DANGER_COLOR = '#E53935';
const MUTE_GRAY = '#6B7280';

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
  const { profile } = useSelector((s) => s.studentProfile);

  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [onlyEnrolled, setOnlyEnrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('courses'); // sidebar tab: courses / profile / messages

  // Fetch student profile
  useEffect(() => {
    dispatch(fetchProfile(token));
  }, [dispatch, token]);

  useEffect(() => {
    if (!profile) setShowProfile(true);
  }, [profile]);

  // Fetch courses and enrolled courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Only fetch published courses for students
      const allCourses = await courseApi.getCourses(token, true);
      const enrolledProgresses = await progressApi.getMyCourses(token);
      const enrolledIds = enrolledProgresses
        .filter((p) => p.course?._id)
        .map((p) => String(p.course._id));

      setCourses(allCourses);
      setEnrolledCourseIds(enrolledIds);
    } catch (err) {
      console.error(err);
      alert('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [token]);

  const handleEnroll = async (courseId) => {
    try {
      await progressApi.enrollCourse(courseId, token);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to enroll');
    }
  };

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = courses;
    if (onlyEnrolled) list = list.filter((c) => enrolledCourseIds.includes(String(c._id)));
    if (!q) return list;
    return list.filter(
      (c) =>
        (c.title || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
    );
  }, [courses, query, onlyEnrolled, enrolledCourseIds]);

  if (loading) return <p>Loading courses...</p>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: SOFT_BG }}>
      {/* --- LEFT SIDEBAR --- */}
      <div
        style={{
          width: 220,
          background: WHITE,
          borderRight: `1px solid ${SOFT_BORDER_COLOR}`,
          display: 'flex',
          flexDirection: 'column',
          padding: 20,
          gap: 20,
        }}
      >
        <h3 style={{ color: PRIMARY_COLOR, marginBottom: 20 }}>Dashboard</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => setActiveTab('courses')}
            style={{
              padding: '10px 12px',
              background: activeTab === 'courses' ? ACCENT_COLOR : 'transparent',
              color: activeTab === 'courses' ? WHITE : PRIMARY_COLOR,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '10px 12px',
              background: activeTab === 'profile' ? ACCENT_COLOR : 'transparent',
              color: activeTab === 'profile' ? WHITE : PRIMARY_COLOR,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            style={{
              padding: '10px 12px',
              background: activeTab === 'messages' ? ACCENT_COLOR : 'transparent',
              color: activeTab === 'messages' ? WHITE : PRIMARY_COLOR,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Messages
          </button>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={() => dispatch(logout())}
            style={{ ...buttonBaseStyle, background: DANGER_COLOR, color: WHITE, width: '100%' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div style={{ flex: 1, padding: 30, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {activeTab === 'courses' && (
          <>
            <h2
              style={{
                color: PRIMARY_COLOR,
                borderBottom: `2px solid ${SOFT_BORDER_COLOR}`,
                paddingBottom: 10,
                marginBottom: 15,
              }}
            >
              Courses
            </h2>

            <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
              <input
                placeholder="Search courses by title or description"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e6e6' }}
              />
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
                <input type="checkbox" checked={onlyEnrolled} onChange={() => setOnlyEnrolled((v) => !v)} /> Only
                enrolled
              </label>
            </div>

            <div
              style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
            >
              {filteredCourses.map((c) => {
                const isEnrolled = enrolledCourseIds.includes(String(c._id));
                return (
                  <div
                    key={c._id}
                    style={{
                      border: `1px solid ${SOFT_BORDER_COLOR}`,
                      padding: 20,
                      borderRadius: 8,
                      background: WHITE,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.04)',
                      borderLeft: isEnrolled ? `6px solid ${ACCENT_COLOR}` : '6px solid transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                        <h4 style={{ color: PRIMARY_COLOR, marginTop: 0, marginBottom: 6 }}>{c.title}</h4>
                        {isEnrolled && (
                          <div
                            style={{
                              fontSize: 12,
                              color: WHITE,
                              background: ACCENT_COLOR,
                              padding: '6px 8px',
                              borderRadius: 6,
                            }}
                          >
                            Enrolled
                          </div>
                        )}
                      </div>
                      <p style={{ color: MUTE_GRAY, fontSize: '0.95em', minHeight: 42 }}>
                        {c.description || 'No description'}
                      </p>
                    </div>

                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-start', gap: 10 }}>
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
                      <Link
                        to={`/student/course/${c._id}`}
                        style={{ alignSelf: 'center', color: '#6B7280', textDecoration: 'none', fontSize: 13 }}
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'profile' && (
          <StudentProfilePopup isOpen={true} onClose={() => setShowProfile(false)} token={token} />
        )}

        {activeTab === 'messages' && <StudentMessageBoard />}
      </div>
    </div>
  );
}
