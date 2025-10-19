import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import courseApi from '../api/courseApi';

export default function CourseCard({ course, onDelete, onUpdated }) {
  const token = useSelector(s => s.auth.token);
  const published = !!course.isPublished;
  const levels = Array.isArray(course.levels) ? course.levels.length : 0;
  const moduleCount = (course.levels || []).reduce((sum, l) => sum + ((l.modules && l.modules.length) || 0), 0);
  const updated = course.updatedAt ? new Date(course.updatedAt) : (course.createdAt ? new Date(course.createdAt) : null);

  return (
    <div style={{
      border: '1px solid #e6e6e6',
      padding: 14,
      borderRadius: 8,
      marginBottom: 12,
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 200
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, color: '#1F2937' }}>{course.title}</h3>
            <p style={{ margin: '6px 15x 0', color: '#374151', fontSize: 14 }}>{course.description || 'No description'}</p>
          </div>

          <div style={{ marginLeft: 12, textAlign: 'right' }}>
            <div style={{ display: 'inline-block', padding: '6px 10px', borderRadius: 999, background: published ? '#10B981' : '#F97316', color: '#fff', fontWeight: 700, fontSize: 12 }}>
              {published ? 'Published' : 'Unpublished'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 45, display: 'flex', gap: 25, alignItems: 'center', color: '#6B7280', fontSize: 13 }}>
          <div>Levels: <strong style={{ color: '#111827' }}>{levels}</strong></div>
          <div>Modules: <strong style={{ color: '#111827' }}>{moduleCount}</strong></div>
          <div>By: <strong style={{ color: '#111827' }}>{course.createdBy?.name || '—'}</strong></div>
          {updated && <div>Updated: <strong style={{ color: '#111827' }}>{updated.toLocaleDateString()}</strong></div>}
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <Link to={`/admin/manage-course/${course._id}`}>
          <button style={{ background: '#4B6CB7', color: 'white', border: 0, padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>Manage</button>
        </Link>

        <button onClick={() => alert('Edit not implemented yet')} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e6e6e6', background: '#fff', cursor: 'pointer' }}>Edit</button>

        <button onClick={() => onDelete(course._id)} style={{ color: 'white', background: '#e53935', border: 0, padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>Delete</button>

        {/* Publish toggle */}
        <button
          onClick={async () => {
            try {
              await courseApi.updateCourse(course._id, { isPublished: !published }, token);
              if (typeof onUpdated === 'function') onUpdated();
            } catch (err) {
              console.error('Failed to toggle publish', err);
              alert(err.response?.data?.message || 'Failed to change publish state');
            }
          }}
          style={{ marginLeft: 6, padding: '8px 12px', borderRadius: 6, border: '1px solid #e6e6e6', background: published ? '#fff' : '#10B981', color: published ? '#111' : '#fff', cursor: 'pointer' }}
        >
          {published ? 'Unpublish' : 'Publish'}
        </button>
      </div>
    </div>
  );
}