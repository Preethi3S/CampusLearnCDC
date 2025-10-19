import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import courseApi from '../api/courseApi';

export default function CourseCard({ course, onDelete, onUpdated }) {
    const token = useSelector(s => s.auth.token);
    const navigate = useNavigate();
    const published = !!course.isPublished;
    
    // Check if the new subCourses structure is present
    const hasSubCourses = Array.isArray(course.subCourses) && course.subCourses.length > 0;

    // --- UPDATED COUNTING LOGIC ---
    let totalLevels = 0;
    let totalModules = 0;

    if (hasSubCourses) {
        course.subCourses.forEach(subCourse => {
            if (Array.isArray(subCourse.levels)) {
                totalLevels += subCourse.levels.length;
                subCourse.levels.forEach(level => {
                    if (Array.isArray(level.modules)) {
                        totalModules += level.modules.length;
                    }
                });
            }
        });
    } else {
        totalLevels = Array.isArray(course.levels) ? course.levels.length : 0;
        totalModules = (course.levels || []).reduce((sum, l) => sum + ((l.modules && l.modules.length) || 0), 0);
    }
    
    const displayLevels = totalLevels;
    const displayModules = totalModules;
    
    const updated = course.updatedAt ? new Date(course.updatedAt) : (course.createdAt ? new Date(course.createdAt) : null);
    const price = course.price !== undefined ? course.price.toFixed(2) : null;

    return (
        <div style={{
            border: '1px solid #e6e6e6',
            padding: 20,
            borderRadius: 10,
            marginBottom: 18,
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 260, // increased height
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, color: '#1F2937' }}>{course.title}</h3>
                        <p style={{ margin: '6px 0 0', color: '#374151', fontSize: 14 }}>
                            {course.description || 'No description'}
                        </p>
                        {hasSubCourses && (
                            <div style={{ 
                                marginTop: 6, 
                                fontSize: 12, 
                                color: '#4B6CB7', 
                                fontWeight: 700 
                            }}>
                                ({course.subCourses.length} Sections)
                            </div>
                        )}
                    </div>
                    <div style={{ marginLeft: 12, textAlign: 'right' }}>
                        <div style={{ display: 'inline-block', padding: '6px 10px', borderRadius: 999, background: published ? '#10B981' : '#F97316', color: '#fff', fontWeight: 700, fontSize: 12 }}>
                            {published ? 'Published' : 'Unpublished'}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 50, display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center', color: '#6B7280', fontSize: 13 }}>
                    <div>Levels: <strong style={{ color: '#111827' }}>{displayLevels}</strong></div>
                    <div>Modules: <strong style={{ color: '#111827' }}>{displayModules}</strong></div>
                    {price && <div>Price: <strong style={{ color: '#111827' }}>${price}</strong></div>}
                    <div>By: <strong style={{ color: '#111827' }}>{course.createdBy?.name || '—'}</strong></div>
                    {updated && <div>Updated: <strong style={{ color: '#111827' }}>{updated.toLocaleDateString()}</strong></div>}
                </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <Link to={`/admin/manage-course/${course._id}`}>
                    <button style={{ background: '#4B6CB7', color: 'white', border: 0, padding: '10px 14px', borderRadius: 6, cursor: 'pointer' }}>Manage</button>
                </Link>

                <button onClick={() => onDelete(course._id)} style={{ color: 'white', background: '#e53935', border: 0, padding: '10px 14px', borderRadius: 6, cursor: 'pointer' }}>Delete</button>

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
                    style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid #e6e6e6', background: published ? '#fff' : '#10B981', color: published ? '#111' : '#fff', cursor: 'pointer' }}
                >
                    {published ? 'Unpublish' : 'Publish'}
                </button>

                <button
                    onClick={() => navigate(`/admin/course-progress/${course._id}`)}
                    style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid #4B6CB7', background: '#4B6CB7', color: '#fff', cursor: 'pointer' }}
                >
                    Progress
                </button>
            </div>
        </div>
    );
}

