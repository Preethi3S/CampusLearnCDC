import React from 'react';
import { Link } from 'react-router-dom';

export default function CourseCard({ course, onDelete }) {
  return (
    <div style={{
      border: '1px solid #ddd',
      padding: 12,
      borderRadius: 6,
      marginBottom: 12,
      background: '#fff'
    }}>
      <h3 style={{ margin: 0 }}>{course.title}</h3>
      <p style={{ margin: '6px 0' }}>{course.description || 'No description'}</p>
      <small>Levels: {course.levels?.length || 0} • Created by: {course.createdBy?.name || '—'}</small>

      <div style={{ marginTop: 8 }}>
        <button onClick={() => alert('Edit not implemented yet')} style={{ marginRight: 8 }}>Edit</button>
        <button onClick={() => onDelete(course._id)} style={{ color: 'white', background: '#e53935', border: 0, padding: '6px 10px', marginRight: 8 }}>Delete</button>
        
        {/* Manage button */}
        <Link to={`/admin/manage-course/${course._id}`}>
          <button style={{ background: '#4B6CB7', color: 'white', border: 0, padding: '6px 10px', borderRadius: 4 }}>
            Manage
          </button>
        </Link>
      </div>
    </div>
  );
}
