import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, deleteCourse } from '../../features/courses/courseSlice';
import CourseCard from '../../components/CourseCard';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import userApi from '../../api/userApi';
import AdminMessageBoard from './AdminMessageBoard';

const PRIMARY_COLOR = '#473E7A';
const SOFT_BG = '#F8F8F8';
const WHITE = '#FFFFFF';
const DANGER_COLOR = '#E53935';
const MUTE_GRAY = '#6B7280';
const SUCCESS_COLOR = '#10B981';
const SOFT_BORDER_COLOR = '#EBEBEB';

const buttonPrimaryStyle = {
    background: PRIMARY_COLOR,
    color: WHITE,
    padding: '12px 20px',
    borderRadius: 6,
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
};

const buttonLogoutStyle = { ...buttonPrimaryStyle, background: DANGER_COLOR };
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
    const navigate = useNavigate();
    const { items, loading, error } = useSelector(s => s.courses);
    const auth = useSelector(s => s.auth);

    const [activeTab, setActiveTab] = useState('courses');
    const [query, setQuery] = useState('');
    const [showPublishedOnly, setShowPublishedOnly] = useState(false);
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState(null);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [deletingStudentId, setDeletingStudentId] = useState(null);

    // Load courses and students
    useEffect(() => {
        dispatch(fetchCourses());

        const loadStudents = async () => {
            if (!auth?.user || auth.user.role !== 'admin') return;
            setStudentsLoading(true);
            try {
                const response = await userApi.getUsers(auth.token, 'student');
                setStudents(Array.isArray(response) ? response : []);
                setStudentsError(null);
            } catch (err) {
                setStudentsError(err.response?.data?.message || err.message || 'Failed to load students');
                setStudents([]);
            } finally {
                setStudentsLoading(false);
            }
        };
        loadStudents();
    }, [dispatch, auth?.user, auth?.token]);

    const filteredCourses = useMemo(() => {
        let list = Array.isArray(items) ? [...items] : [];
        if (showPublishedOnly) list = list.filter(c => c.isPublished);
        if (query) list = list.filter(c =>
            (c.title || '').toLowerCase().includes(query.toLowerCase()) ||
            (c.description || '').toLowerCase().includes(query.toLowerCase())
        );
        return list;
    }, [items, query, showPublishedOnly]);

    const filteredStudents = useMemo(() => {
        if (!studentSearchQuery) return students;
        return students.filter(s =>
            (s.name || '').toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
            (s.username || '').toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
            (s.email || '').toLowerCase().includes(studentSearchQuery.toLowerCase())
        );
    }, [students, studentSearchQuery]);

    const stats = useMemo(() => ({
        total: items.length,
        published: items.filter(c => c.isPublished).length,
        unpublished: items.filter(c => !c.isPublished).length,
    }), [items]);

    const handleDeleteCourse = (id) => {
        if (window.confirm('Delete this course?')) dispatch(deleteCourse(id));
    };

    const handleDeleteStudent = async (studentId, studentName) => {
        if (!window.confirm(`Remove ${studentName}? This cannot be undone.`)) return;
        setDeletingStudentId(studentId);
        try {
            await userApi.deleteUser(auth.token, studentId);
            setStudents(prev => prev.filter(s => s._id !== studentId));
        } catch (err) {
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
        <div style={{ display: 'flex', minHeight: '100vh', background: SOFT_BG }}>
            {/* Sidebar */}
            <aside style={{
                width: 240,
                background: WHITE,
                boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 16px',
            }}>
                <h2 style={{ color: PRIMARY_COLOR, marginBottom: 32 }}>Admin</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button
                        onClick={() => setActiveTab('courses')}
                        style={{
                            padding: '12px 16px',
                            borderRadius: 6,
                            border: 'none',
                            background: activeTab === 'courses' ? PRIMARY_COLOR : 'transparent',
                            color: activeTab === 'courses' ? WHITE : PRIMARY_COLOR,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Manage Courses
                    </button>
                    <button
                        onClick={() => setActiveTab('students')}
                        style={{
                            padding: '12px 16px',
                            borderRadius: 6,
                            border: 'none',
                            background: activeTab === 'students' ? PRIMARY_COLOR : 'transparent',
                            color: activeTab === 'students' ? WHITE : PRIMARY_COLOR,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Students ({students.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        style={{
                            padding: '12px 16px',
                            borderRadius: 6,
                            border: 'none',
                            background: activeTab === 'messages' ? PRIMARY_COLOR : 'transparent',
                            color: activeTab === 'messages' ? WHITE : PRIMARY_COLOR,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Messages
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{ ...buttonLogoutStyle, marginTop: 'auto' }}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Right Content */}
            <main style={{ flex: 1, padding: 32 }}>
                {activeTab === 'courses' && (
                    <>
                        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                            <div style={{
                                flex: '1 1 120px',
                                background: WHITE,
                                borderRadius: 8,
                                padding: 16,
                                textAlign: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                color: 'black'
                            }}>
                                <div style={{ fontSize: 12, color: MUTE_GRAY }}>Total</div>
                                <div style={{ fontSize: 18, fontWeight: 700 }}>{stats.total}</div>
                            </div>
                            <div style={{
                                flex: '1 1 120px',
                                background: WHITE,
                                borderRadius: 8,
                                padding: 16,
                                textAlign: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                color: 'black'
                            }}>
                                <div style={{ fontSize: 12, color: MUTE_GRAY }}>Published</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: SUCCESS_COLOR }}>{stats.published}</div>
                            </div>
                            <div style={{
                                flex: '1 1 120px',
                                background: WHITE,
                                borderRadius: 8,
                                padding: 16,
                                textAlign: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                color: 'black'
                            }}>
                                <div style={{ fontSize: 12, color: MUTE_GRAY }}>Unpublished</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: '#F97316' }}>{stats.unpublished}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                            <Link to="/admin/create-course">
                                <button style={buttonPrimaryStyle}>+ Create New Course</button>
                            </Link>
                            <input
                                placeholder="Search courses..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                style={{ padding: '10px 14px', borderRadius: 6, border: `1px solid ${SOFT_BORDER_COLOR}`, flex: 1, minWidth: 200 }}
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                                <input type="checkbox" checked={showPublishedOnly} onChange={() => setShowPublishedOnly(v => !v)} />
                                Published only
                            </label>
                        </div>

                        {loading ? (
                            <div>Loading courses...</div>
                        ) : error ? (
                            <div style={{ color: DANGER_COLOR }}>{error}</div>
                        ) : (
                            <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                                {filteredCourses.length === 0 ? (
                                    <div>No courses found</div>
                                ) : filteredCourses.map(course => (
                                    <CourseCard
                                        key={course._id}
                                        course={course}
                                        onDelete={handleDeleteCourse}
                                        onUpdated={() => dispatch(fetchCourses())}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'students' && (
                    <div>
                        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                            <h3 style={{ color: PRIMARY_COLOR }}>Students Management</h3>
                            <input
                                placeholder="Search students..."
                                value={studentSearchQuery}
                                onChange={e => setStudentSearchQuery(e.target.value)}
                                style={{ padding: '10px 14px', borderRadius: 6, border: `1px solid ${SOFT_BORDER_COLOR}`, minWidth: 250 }}
                            />
                        </div>

                        <div style={{ background: WHITE, borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflow: 'auto', color: 'black' }}>
                            {studentsLoading ? (
                                <div style={{ padding: 60, textAlign: 'center', color: MUTE_GRAY }}>Loading students...</div>
                            ) : filteredStudents.length === 0 ? (
                                <div style={{ padding: 60, textAlign: 'center', color: MUTE_GRAY }}>No students found</div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: SOFT_BG }}>
                                            <th style={{ padding: 16, textAlign: 'left', color: PRIMARY_COLOR }}>Student</th>
                                            <th style={{ padding: 16, textAlign: 'left', color: PRIMARY_COLOR }}>Email</th>
                                            <th style={{ padding: 16, textAlign: 'left', color: PRIMARY_COLOR }}>Username</th>
                                            <th style={{ padding: 16, textAlign: 'left', color: PRIMARY_COLOR }}>Joined Date</th>
                                            <th style={{ padding: 16, textAlign: 'center', color: PRIMARY_COLOR }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map(student => (
                                            <tr key={student._id} style={{ borderBottom: `1px solid ${SOFT_BORDER_COLOR}` }}>
                                                <td style={{ padding: 16 }}>{student.name}</td>
                                                <td style={{ padding: 16 }}>{student.email}</td>
                                                <td style={{ padding: 16 }}>@{student.username}</td>
                                                <td style={{ padding: 16 }}>{new Date(student.createdAt).toLocaleDateString()}</td>
                                                <td style={{ padding: 16, textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => handleDeleteStudent(student._id, student.name)}
                                                        disabled={deletingStudentId === student._id}
                                                        style={{
                                                            ...buttonDangerSmallStyle,
                                                            opacity: deletingStudentId === student._id ? 0.6 : 1,
                                                        }}
                                                    >
                                                        {deletingStudentId === student._id ? 'Removing...' : 'Remove'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div>
                        <h3 style={{ color: PRIMARY_COLOR, marginBottom: 16 }}>Admin Messages</h3>
                        <AdminMessageBoard />
                    </div>
                )}
            </main>
        </div>
    );
}
