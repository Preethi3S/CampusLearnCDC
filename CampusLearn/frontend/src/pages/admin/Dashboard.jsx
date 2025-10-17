import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, deleteCourse } from '../../features/courses/courseSlice';
import CourseCard from '../../components/CourseCard';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import userApi from '../../api/userApi';

const PRIMARY_COLOR = '#473E7A';
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const SOFT_BG = '#F8F8F8';
const WHITE = '#FFFFFF';
const DANGER_COLOR = '#E53935'; 
const MUTE_GRAY = '#6B7280';
const SUCCESS_COLOR = '#10B981';

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
};

const buttonDangerSmallStyle = {
    background: DANGER_COLOR,
    color: WHITE,
    padding: '6px 12px',
    borderRadius: 4,
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
};

export default function AdminDashboard() {
    const dispatch = useDispatch();
    const { items, loading, error } = useSelector(s => s.courses);
    const auth = useSelector(s => s.auth);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('courses');
    const [query, setQuery] = useState('');
    const [showPublishedOnly, setShowPublishedOnly] = useState(false);
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState(null);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [deletingStudentId, setDeletingStudentId] = useState(null);

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

    const filteredStudents = useMemo(() => {
        const q = studentSearchQuery.trim().toLowerCase();
        if (!q) return students;
        return students.filter(s => 
            (s.name || '').toLowerCase().includes(q) ||
            (s.username || '').toLowerCase().includes(q) ||
            (s.email || '').toLowerCase().includes(q)
        );
    }, [students, studentSearchQuery]);

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

    const handleDeleteStudent = async (studentId, studentName) => {
        if (!window.confirm(`Are you sure you want to remove ${studentName}? This action cannot be undone.`)) return;
        
        setDeletingStudentId(studentId);
        try {
            await userApi.deleteUser(auth.token, studentId);
            setStudents(prev => prev.filter(s => s._id !== studentId));
        } catch (err) {
            console.error('Error deleting student:', err);
            alert(err.response?.data?.message || 'Failed to delete student');
        } finally {
            setDeletingStudentId(null);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <div style={{ minHeight: '100vh', background: SOFT_BG }}>
            {/* Navbar */}
            <nav style={{ 
                background: WHITE, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ 
                    padding: '16px 30px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                        <h2 style={{ color: PRIMARY_COLOR, margin: 0, fontSize: 24 }}>
                            Admin Dashboard
                        </h2>
                        
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => setActiveTab('courses')}
                                style={{
                                    padding: '10px 20px',
                                    background: activeTab === 'courses' ? PRIMARY_COLOR : 'transparent',
                                    color: activeTab === 'courses' ? WHITE : PRIMARY_COLOR,
                                    border: `2px solid ${PRIMARY_COLOR}`,
                                    borderRadius: 6,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Manage Courses
                            </button>
                            <button
                                onClick={() => setActiveTab('students')}
                                style={{
                                    padding: '10px 20px',
                                    background: activeTab === 'students' ? PRIMARY_COLOR : 'transparent',
                                    color: activeTab === 'students' ? WHITE : PRIMARY_COLOR,
                                    border: `2px solid ${PRIMARY_COLOR}`,
                                    borderRadius: 6,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Students
                                <span style={{ 
                                    marginLeft: 8, 
                                    background: activeTab === 'students' ? WHITE : PRIMARY_COLOR,
                                    color: activeTab === 'students' ? PRIMARY_COLOR : WHITE,
                                    padding: '2px 8px',
                                    borderRadius: 12,
                                    fontSize: 12,
                                    fontWeight: 700
                                }}>
                                    {students.length}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ textAlign: 'right', marginRight: 8 }}>
                            <div style={{ fontSize: 13, color: '#374151' }}>Signed in as</div>
                            <div style={{ fontWeight: 700, color: PRIMARY_COLOR }}>
                                {auth?.user?.username || auth?.user?.name || 'Admin'}
                            </div>
                        </div>
                        <button style={buttonLogoutStyle} onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div style={{ padding: 30 }}>
                {activeTab === 'courses' && (
                    <>
                        <div style={{ 
                            marginBottom: 25, 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            gap: 20,
                            flexWrap: 'wrap'
                        }}>
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

                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <Link to="/admin/create-course" style={{ textDecoration: 'none' }}>
                                    <button style={buttonPrimaryStyle}>+ Create New Course</button>
                                </Link>
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
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                    <div>Loading courses...</div>
                                </div>
                            ) : error ? (
                                <div style={{ padding: '16px', backgroundColor: '#FEE2E2', color: DANGER_COLOR, borderRadius: '8px', marginBottom: '20px' }}>
                                    Error: {error}
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                                    {filtered.length === 0 ? (
                                        <div style={{ 
                                            gridColumn: '1 / -1', 
                                            textAlign: 'center', 
                                            padding: '40px 20px',
                                            backgroundColor: WHITE,
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                        }}>
                                            <div style={{ fontSize: '18px', fontWeight: '600', color: MUTE_GRAY, marginBottom: '8px' }}>
                                                No courses found
                                            </div>
                                            <div style={{ color: '#9CA3AF', marginBottom: '16px' }}>
                                                {query || showPublishedOnly ? 'Try adjusting your search or filter criteria' : 'Create your first course to get started'}
                                            </div>
                                            <Link to="/admin/create-course">
                                                <button style={{ ...buttonPrimaryStyle, padding: '8px 16px', fontSize: '14px' }}>
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
                    </>
                )}

                {activeTab === 'students' && (
                    <div>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: 20
                        }}>
                            <div>
                                <h3 style={{ margin: 0, color: PRIMARY_COLOR, fontSize: 24 }}>Students Management</h3>
                                <p style={{ margin: '4px 0 0 0', color: MUTE_GRAY, fontSize: 14 }}>
                                    Manage all registered students
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <input 
                                    placeholder="Search students by name or email..." 
                                    value={studentSearchQuery} 
                                    onChange={(e) => setStudentSearchQuery(e.target.value)} 
                                    style={{ 
                                        padding: '10px 16px', 
                                        borderRadius: 6, 
                                        border: `1px solid ${SOFT_BORDER_COLOR}`,
                                        minWidth: '300px',
                                        fontSize: 14
                                    }} 
                                />
                                <div style={{ 
                                    padding: '10px 16px',
                                    background: PRIMARY_COLOR,
                                    color: WHITE,
                                    borderRadius: 6,
                                    fontWeight: 600,
                                    fontSize: 14
                                }}>
                                    Total: {filteredStudents.length}
                                </div>
                            </div>
                        </div>

                        <div style={{ 
                            background: WHITE, 
                            borderRadius: 12, 
                            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                            overflow: 'hidden'
                        }}>
                            {studentsLoading ? (
                                <div style={{ textAlign: 'center', padding: '60px' }}>
                                    <div style={{ fontSize: 16, color: MUTE_GRAY }}>Loading students...</div>
                                </div>
                            ) : studentsError ? (
                                <div style={{ 
                                    color: DANGER_COLOR, 
                                    textAlign: 'center', 
                                    padding: '60px',
                                    background: '#FEE2E2',
                                    borderRadius: 8,
                                    margin: 20
                                }}>
                                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Error Loading Students</div>
                                    <div>{studentsError}</div>
                                </div>
                            ) : !Array.isArray(students) || students.length === 0 ? (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '60px',
                                    color: MUTE_GRAY
                                }}>
                                    <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Students Yet</div>
                                    <div style={{ fontSize: 14 }}>Students will appear here once they register</div>
                                </div>
                            ) : filteredStudents.length === 0 ? (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '60px',
                                    color: MUTE_GRAY
                                }}>
                                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Results Found</div>
                                    <div style={{ fontSize: 14 }}>Try adjusting your search criteria</div>
                                </div>
                            ) : (
                                <div style={{ overflow: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: SOFT_BG, borderBottom: `2px solid ${SOFT_BORDER_COLOR}` }}>
                                                <th style={{ padding: '16px 20px', textAlign: 'left', color: PRIMARY_COLOR, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Student
                                                </th>
                                                <th style={{ padding: '16px 20px', textAlign: 'left', color: PRIMARY_COLOR, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Email
                                                </th>
                                                <th style={{ padding: '16px 20px', textAlign: 'left', color: PRIMARY_COLOR, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Username
                                                </th>
                                                <th style={{ padding: '16px 20px', textAlign: 'left', color: PRIMARY_COLOR, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Joined Date
                                                </th>
                                                <th style={{ padding: '16px 20px', textAlign: 'center', color: PRIMARY_COLOR, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map((student, index) => (
                                                <tr 
                                                    key={student._id || index}
                                                    style={{ 
                                                        borderBottom: `1px solid ${SOFT_BORDER_COLOR}`,
                                                        transition: 'background 0.2s',
                                                        background: WHITE
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = SOFT_BG}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = WHITE}
                                                >
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <div style={{ 
                                                                width: 40, 
                                                                height: 40, 
                                                                borderRadius: '50%', 
                                                                background: PRIMARY_COLOR,
                                                                color: WHITE,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontWeight: 700,
                                                                fontSize: 16
                                                            }}>
                                                                {(student.name || student.username || 'S')[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, color: '#1F2937', fontSize: 15 }}>
                                                                    {student.name || 'N/A'}
                                                                </div>
                                                                <div style={{ fontSize: 12, color: MUTE_GRAY }}>
                                                                    ID: {student._id.slice(-8)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <div style={{ color: '#374151', fontSize: 14 }}>
                                                            {student.email || 'No email'}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <div style={{ 
                                                            color: PRIMARY_COLOR, 
                                                            fontSize: 14,
                                                            fontWeight: 500
                                                        }}>
                                                            @{student.username || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <div style={{ color: '#374151', fontSize: 14 }}>
                                                            {new Date(student.createdAt).toLocaleDateString('en-US', { 
                                                                year: 'numeric', 
                                                                month: 'short', 
                                                                day: 'numeric' 
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => handleDeleteStudent(student._id, student.name || student.username)}
                                                            disabled={deletingStudentId === student._id}
                                                            style={{
                                                                ...buttonDangerSmallStyle,
                                                                opacity: deletingStudentId === student._id ? 0.6 : 1,
                                                                cursor: deletingStudentId === student._id ? 'not-allowed' : 'pointer'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (deletingStudentId !== student._id) {
                                                                    e.currentTarget.style.background = '#C62828';
                                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = DANGER_COLOR;
                                                                e.currentTarget.style.transform = 'scale(1)';
                                                            }}
                                                        >
                                                            {deletingStudentId === student._id ? '🔄 Removing...' : '🗑️ Remove'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}