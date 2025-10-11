import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useAuth from '../../hooks/useAuth';
import { logout } from '../../features/auth/authSlice';
import { useDispatch } from 'react-redux';
import courseApi from '../../api/courseApi';
import progressApi from '../../api/progressApi';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const dispatch = useDispatch();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all courses posted by staff/admin
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const allCourses = await courseApi.getCourses(token); // all courses
      const enrolled = await progressApi.getMyCourses(token); // student's enrolled courses
      setCourses(allCourses);
      setEnrolledCourses(enrolled.map(c => c.course._id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Enroll in a course
  const handleEnroll = async (courseId) => {
    try {
      await progressApi.enrollCourse(courseId, token);
      fetchCourses(); // refresh enrolled courses
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to enroll');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <p>Loading courses...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Student Dashboard</h2>
      <p>Welcome, {user?.name}</p>
      <button onClick={() => dispatch(logout())}>Logout</button>

      <h3 style={{ marginTop: 20 }}>Available Courses</h3>
      {courses.length === 0 && <p>No courses available yet.</p>}

      <div>
        {courses.map(c => (
          <div key={c._id} style={{
            border: '1px solid #ddd',
            padding: 12,
            marginBottom: 12,
            borderRadius: 6,
            background: '#fff'
          }}>
            <h4>{c.title}</h4>
            <p>{c.description || 'No description'}</p>
            {enrolledCourses.includes(c._id) ? (
              <Link to={`/student/course/${c._id}`}>
                <button style={{ background: '#4B6CB7', color: '#fff', padding: '6px 12px', borderRadius: 4 }}>Go to Course</button>
              </Link>
            ) : (
              <button 
                onClick={() => handleEnroll(c._id)} 
                style={{ background: '#10B981', color: '#fff', padding: '6px 12px', borderRadius: 4 }}
              >
                Enroll
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
