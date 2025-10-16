import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, deleteCourse } from '../../features/courses/courseSlice';
import CourseCard from '../../components/CourseCard';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import userApi from '../../api/userApi';

// --- THEME CONSTANTS ---
const PRIMARY_COLOR = '#473E7A';
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const SOFT_BG = '#F8F8F8';
const WHITE = '#FFFFFF';
const DANGER_COLOR = '#E53935'; 
const MUTE_GRAY = '#6B7280';

const buttonPrimaryStyle = {
    background: PRIMARY_COLOR,
    color: WHITE,
    padding: '12px 20px',
    borderRadius: 4,
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
};

const buttonLogoutStyle = {
    ...buttonPrimaryStyle,
    background: DANGER_COLOR,
    marginLeft: 15,
};

export default function AdminDashboard() {
    const dispatch = useDispatch();
    const { items, loading, error } = useSelector(s => s.courses);
    const auth = useSelector(s => s.auth);
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [showPublishedOnly, setShowPublishedOnly] = useState(false);
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState(null);

    useEffect(() => {
        dispatch(fetchCourses());
        
        const loadStudents = async () => {
            if (!auth?.user || auth.user.role !== 'admin') return;
            
            setStudentsLoading(true);
            try {
                const response = await userApi.getUsers(auth.token, 'student');
                const studentsList = Array.isArray(response) ? response : [];
                setStudents(studentsList);
                setStudentsError(null);
            } catch (err) {
                console.error('Error loading students:', err);
                setStudentsError(err.response?.data?.message || err.message || 'Failed to load students');
                setStudents([]);
            } finally {
                setStudentsLoading(false);
            }
        };
        
        loadStudents();
    }, [dispatch, auth?.user, auth?.token]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = Array.isArray(items) ? [...items] : [];
        if (showPublishedOnly) list = list.filter(c => c.isPublished);
        if (!q) return list;
        return list.filter(c => 
            (c.title || '').toLowerCase().includes(q) || 
            (c.description || '').toLowerCase().includes(q)
        );
    }, [items, query, showPublishedOnly]);

    const stats = useMemo(() => {
        const list = Array.isArray(items) ? items : [];
        return {
            total: list.length,
            published: list.filter(c => c.isPublished).length,
            unpublished: list.filter(c => !c.isPublished).length
        };
    }, [items]);

    const handleDelete = (id) => {
        if (!window.confirm('Delete this course?')) return;
        dispatch(deleteCourse(id));
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <div style={{ padding: 30, background: SOFT_BG, minHeight: '100vh' }}>
            {/* Header Section */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: `2px solid ${SOFT_BORDER_COLOR}`, 
                paddingBottom: 10, 
                marginBottom: 20 
            }}>
                <h2 style={{ color: PRIMARY_COLOR, margin: 0 }}>Admin Dashboard</h2>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ textAlign: 'right', marginRight: 8 }}>
                        <div style={{ fontSize: 13, color: '#374151' }}>Signed in as</div>
                        <div style={{ fontWeight: 700, color: PRIMARY_COLOR }}>
                            {auth?.user?.username || auth?.user?.name || 'Admin'}
                        </div>
                    </div>
                    <Link to="/admin/create-course" style={{ textDecoration: 'none' }}>
                        <button style={buttonPrimaryStyle}>+ Create New Course</button>
                    </Link>
                    <button style={buttonLogoutStyle} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Controls, Stats, and Filter Section */}
            <div style={{ 
                marginBottom: 25, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                gap: 20,
                flexWrap: 'wrap'
            }}>
                {/* Stats */}
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ padding: 12, background: WHITE, borderRadius: 8, boxShadow: '0 6px 12px rgba(0,0,0,0.04)', minWidth: 110, textAlign: 'center' }}>
                        <div style={{ fontSize: 12, color: MUTE_GRAY }}>Total</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: PRIMARY_COLOR }}>{stats.total}</div>
                    </div>
                    <div style={{ padding: 12, background: WHITE, borderRadius: 8, boxShadow: '0 6px 12px rgba(0,0,0,0.04)', minWidth: 110, textAlign: 'center' }}>
                        <div style={{ fontSize: 12, color: MUTE_GRAY }}>Published</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#0EA5A4' }}>{stats.published}</div>
                    </div>
                    <div style={{ padding: 12, background: WHITE, borderRadius: 8, boxShadow: '0 6px 12px rgba(0,0,0,0.04)', minWidth: 110, textAlign: 'center' }}>
                        <div style={{ fontSize: 12, color: MUTE_GRAY }}>Unpublished</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#F97316' }}>{stats.unpublished}</div>
                    </div>
                </div>

                {/* Search, Filter, and Refresh */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input 
                        placeholder="Search courses" 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)} 
                        style={{ 
                            padding: '8px 12px', 
                            borderRadius: 6, 
                            border: `1px solid ${SOFT_BORDER_COLOR}`,
                            minWidth: '250px'
                        }} 
                    />
                    <label style={{ 
                        fontSize: 13, 
                        color: '#475569', 
                        display: 'flex', 
                        gap: 8, 
                        alignItems: 'center', 
                        cursor: 'pointer' 
                    }}>
                        <input 
                            type="checkbox" 
                            checked={showPublishedOnly} 
                            onChange={() => setShowPublishedOnly(v => !v)} 
                        /> 
                        Published only
                    </label>
                    <button 
                        onClick={() => dispatch(fetchCourses())} 
                        style={{ 
                            padding: '8px 16px', 
                            borderRadius: 6, 
                            border: `1px solid ${SOFT_BORDER_COLOR}`, 
                            background: WHITE, 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <span>🔄</span> Refresh
                    </button>
                </div>
            </div>

            {/* Students Panel (Admin only) */}
            {auth?.user?.role === 'admin' && (
                <div style={{ marginBottom: 30 }}>
                    <h3 style={{ margin: '8px 0', color: PRIMARY_COLOR }}>Students</h3>
                    <div style={{ 
                        padding: 16, 
                        background: WHITE, 
                        borderRadius: 8, 
                        boxShadow: '0 6px 12px rgba(0,0,0,0.04)',
                        marginBottom: 24
                    }}>
                        {studentsLoading ? (
                            <div>Loading students...</div>
                        ) : studentsError ? (
                            <div style={{ color: DANGER_COLOR }}>Error: {studentsError}</div>
                        ) : (
                            <div style={{ 
                                display: 'grid', 
                                gap: 12, 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' 
                            }}>
                                {!Array.isArray(students) || students.length === 0 ? (
                                    <div style={{ 
                                        gridColumn: '1 / -1', 
                                        textAlign: 'center', 
                                        padding: '20px',
                                        color: MUTE_GRAY
                                    }}>
                                        No students found
                                    </div>
                                ) : (
                                    students.map(u => (
                                        <div 
                                            key={u._id || Math.random()}
                                            style={{ 
                                                padding: '12px',
                                                borderRadius: 8,
                                                border: `1px solid ${SOFT_BORDER_COLOR}`,
                                                backgroundColor: WHITE,
                                                transition: 'all 0.2s ease',
                                                ':hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }
                                            }}
                                        >
                                            <div style={{ 
                                                fontWeight: 600, 
                                                color: PRIMARY_COLOR,
                                                marginBottom: 4,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {u.name || u.username || 'Student'}
                                            </div>
                                            <div style={{ 
                                                fontSize: 13, 
                                                color: MUTE_GRAY,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {u.email || 'No email'}
                                            </div>
                                            <div style={{ 
                                                fontSize: 12, 
                                                color: '#6B7280',
                                                marginTop: 6,
                                                paddingTop: 6,
                                                borderTop: `1px dashed ${SOFT_BORDER_COLOR}`
                                            }}>
                                                Joined: {new Date(u.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Course List Section */}
            <div>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 16
                }}>
                    <h3 style={{ margin: 0, color: PRIMARY_COLOR }}>Courses</h3>
                    <div style={{ fontSize: 14, color: MUTE_GRAY }}>
                        Showing {filtered.length} of {items?.length || 0} courses
                    </div>
                </div>

                {loading ? (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        minHeight: '200px'
                    }}>
                        <div>Loading courses...</div>
                    </div>
                ) : error ? (
                    <div style={{ 
                        padding: '16px', 
                        backgroundColor: '#FEE2E2', 
                        color: DANGER_COLOR, 
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        Error: {error}
                    </div>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gap: '20px', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' 
                    }}>
                        {filtered.length === 0 ? (
                            <div style={{ 
                                gridColumn: '1 / -1', 
                                textAlign: 'center', 
                                padding: '40px 20px',
                                backgroundColor: WHITE,
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ 
                                    fontSize: '18px', 
                                    fontWeight: '600',
                                    color: MUTE_GRAY,
                                    marginBottom: '8px'
                                }}>
                                    No courses found
                                </div>
                                <div style={{ 
                                    color: '#9CA3AF',
                                    marginBottom: '16px'
                                }}>
                                    {query || showPublishedOnly 
                                        ? 'Try adjusting your search or filter criteria' 
                                        : 'Create your first course to get started'}
                                </div>
                                <Link to="/admin/create-course">
                                    <button style={{
                                        ...buttonPrimaryStyle,
                                        padding: '8px 16px',
                                        fontSize: '14px'
                                    }}>
                                        + Create New Course
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            filtered.map(course => (
                                <CourseCard 
                                    key={course._id}
                                    course={course}
                                    onDelete={handleDelete}
                                    onUpdated={() => dispatch(fetchCourses())}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}