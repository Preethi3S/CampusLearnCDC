import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, deleteCourse } from '../../features/courses/courseSlice';
import CourseCard from '../../components/CourseCard';
import { Link } from 'react-router-dom';

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
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>
      <div style={{ marginBottom: 16 }}>
        <Link to="/admin/create-course"><button>Create new course</button></Link>
      </div>

      {loading && <p>Loading courses...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        {items.length === 0 && <p>No courses yet.</p>}
        {items.map(c => <CourseCard key={c._id} course={c} onDelete={handleDelete} />)}
      </div>

    </div>
  );
}
