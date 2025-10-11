import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyCourses } from '../../features/progress/progressSlice';
import { Link } from 'react-router-dom';

export default function EnrolledCourses() {
  const dispatch = useDispatch();
  const { courses, loading, error } = useSelector(s => s.progress);

  useEffect(() => { dispatch(fetchMyCourses()); }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>My Courses</h2>
      {courses.length === 0 && <p>No enrolled courses yet.</p>}
      {courses.map(c => (
        <div key={c._id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12, borderRadius: 6 }}>
          <h3>{c.course.title}</h3>
          <p>{c.course.description}</p>
          <Link to={`/student/course/${c.course._id}`}>
            <button>Go to Course</button>
          </Link>
        </div>
      ))}
    </div>
  );
}
