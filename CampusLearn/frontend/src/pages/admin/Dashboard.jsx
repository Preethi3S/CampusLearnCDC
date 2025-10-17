import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, deleteCourse } from '../../features/courses/courseSlice';
import CourseCard from '../../components/CourseCard'; 
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import userApi from '../../api/userApi';
import AdminMessageBoard from './AdminMessageBoard';

// --- THEME CONSTANTS ---
const PRIMARY_COLOR = '#473E7A'; // MongoDB Purple
const ACCENT_COLOR = '#4B6CB7';
const SOFT_BG = '#F8F8F8';
const WHITE = '#FFFFFF';
const DANGER_COLOR = '#E53935';
const MUTE_GRAY = '#6B7280';
const SUCCESS_COLOR = '#10B981';
const SOFT_BORDER_COLOR = '#EBEBEB';

// --- STYLES ---
const buttonBaseStyle = {
    padding: '10px 18px',
    borderRadius: 6,
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: 14,
};

const getStatusDisplay = (status) => {
    switch (status) {
        case 'approved':
            return { text: 'Approved', color: SUCCESS_COLOR, bg: '#E6F6EC' };
        case 'rejected':
            return { text: 'Rejected', color: DANGER_COLOR, bg: '#FEE2E2' };
        case 'pending':
        default:
            return { text: 'Pending Approval', color: '#D97706', bg: '#FEF3C7' };
    }
};

const statusBadgeStyle = (color, bg) => ({
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 500,
    minWidth: '90px',
    textAlign: 'center',
    backgroundColor: bg,
    color: color,
});

const getSidebarItemStyle = (isActive) => ({
    padding: '12px 16px',
    borderRadius: 8,
    backgroundColor: isActive ? ACCENT_COLOR : 'transparent',
    color: isActive ? WHITE : PRIMARY_COLOR,
    fontWeight: isActive ? 'bold' : '500',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
});


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
    const [pendingCount, setPendingCount] = useState(0);
    const [approvalsLoading, setApprovalsLoading] = useState(false);

    // --- Data Loaders ---
    const loadStudentsAndApprovals = useCallback(async () => {
        if (!auth?.user || auth.user.role !== 'admin' || !auth.token) {
            return;
        }

        // Load Students
        setStudentsLoading(true);
        try {
            const response = await userApi.getUsers(auth.token, 'student');
            const studentsList = Array.isArray(response) ? response : [];
            setStudents(studentsList);
            setStudentsError(null);
        } catch (err) {
            setStudentsError(err.response?.data?.message || 'Failed to load students');
            setStudents([]);
        } finally {
            setStudentsLoading(false);
        }

        // Load Pending Approvals (for the badge count)
        setApprovalsLoading(true);
        try {
            const response = await userApi.getPendingApprovals(auth.token);
            const pendingList = Array.isArray(response) ? response : [];
            setPendingCount(pendingList.length);
        } catch (err) {
            console.error('Error loading pending approvals:', err);
            setPendingCount(0);
        } finally {
            setApprovalsLoading(false);
        }
    }, [auth.user, auth.token]);
    
    useEffect(() => {
        dispatch(fetchCourses());
        loadStudentsAndApprovals();
    }, [dispatch, loadStudentsAndApprovals]);


    // --- Data Filtering and Memoization ---
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

    // --- Action Handlers ---
    const handleDeleteCourse = (id) => {
        if (window.confirm('Delete this course? This action cannot be undone.')) dispatch(deleteCourse(id));
    };

    const handleDeleteStudent = async (studentId, studentName) => {
        if (!window.confirm(`Remove ${studentName}? This will permanently delete their account and progress.`)) return;
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
    
    const handleApproveStudent = async (studentId) => {
        try {
            await userApi.approveUser(auth.token, studentId);
            setStudents(prev => 
                prev.map(s => s._id === studentId ? { ...s, status: 'approved' } : s)
            );
            setPendingCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error approving student:', err);
            alert(err.response?.data?.message || 'Failed to approve student');
        }
    };

    const handleRejectStudent = async (studentId) => {
        if (!window.confirm('Are you sure you want to reject this student? Their account will be deactivated.')) {
            return;
        }
        
        try {
            await userApi.rejectUser(auth.token, studentId, 'Rejected by admin');
            setStudents(prev => 
                prev.map(s => s._id === studentId ? { ...s, status: 'rejected' } : s)
            );
            setPendingCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error rejecting student:', err);
            alert(err.response?.data?.message || 'Failed to reject student');
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    // --- RENDER ---
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: SOFT_BG }}>
            {/* --- VERTICAL SIDEBAR --- */}
            <aside style={{
                width: 250,
                background: WHITE,
                boxShadow: '4px 0 10px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                padding: '30px 20px',
                zIndex: 10,
            }}>
                <div style={{ marginBottom: 40 }}>
                    <h2 style={{ color: PRIMARY_COLOR, margin: 0, fontSize: 22 }}>
                        Admin Console
                    </h2>
                    <div style={{ fontSize: 13, color: MUTE_GRAY, marginTop: 4 }}>
                        {auth?.user?.username || auth?.user?.name || 'Administrator'}
                    </div>
                </div>

                {/* Navigation Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexGrow: 1 }}>
                    <button onClick={() => setActiveTab('courses')} style={getSidebarItemStyle(activeTab === 'courses')}>
                        <span>📚 Course Management</span>
                    </button>
                    <button onClick={() => setActiveTab('students')} style={getSidebarItemStyle(activeTab === 'students')}>
                        <span>👥 Student Approvals</span>
                        {pendingCount > 0 && (
                            <span style={{
                                backgroundColor: DANGER_COLOR,
                                color: 'white',
                                borderRadius: '50%',
                                width: 22, height: 22,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 'bold',
                            }}>
                                {pendingCount > 9 ? '9+' : pendingCount}
                            </span>
                        )}
                    </button>
                    <button onClick={() => setActiveTab('messages')} style={getSidebarItemStyle(activeTab === 'messages')}>
                        <span>💬 Messages</span>
                    </button>
                </div>

                {/* Logout Button */}
                <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: `1px solid ${SOFT_BORDER_COLOR}` }}>
                    <button style={{ ...buttonBaseStyle, background: DANGER_COLOR, color: WHITE, width: '100%' }} onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main style={{ flex: 1, padding: 32, maxWidth: '100%', overflowX: 'hidden' }}>
                {activeTab === 'courses' && (
                    <>
                        <h1 style={{ color: PRIMARY_COLOR, borderBottom: `2px solid ${SOFT_BORDER_COLOR}`, paddingBottom: 10, marginBottom: 24 }}>
                            Course Management
                        </h1>

                        {/* Stats Cards */}
                        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 30 }}>
                            <div style={{ background: WHITE, borderRadius: 10, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', borderBottom: `4px solid ${PRIMARY_COLOR}` }}>
                                <div style={{ fontSize: 13, color: MUTE_GRAY }}>Total Courses</div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: PRIMARY_COLOR, marginTop: 4 }}>{stats.total}</div>
                            </div>
                            <div style={{ background: WHITE, borderRadius: 10, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', borderBottom: `4px solid ${SUCCESS_COLOR}` }}>
                                <div style={{ fontSize: 13, color: MUTE_GRAY }}>Published</div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: SUCCESS_COLOR, marginTop: 4 }}>{stats.published}</div>
                            </div>
                            <div style={{ background: WHITE, borderRadius: 10, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', borderBottom: `4px solid #F97316` }}>
                                <div style={{ fontSize: 13, color: MUTE_GRAY }}>Unpublished</div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: '#F97316', marginTop: 4 }}>{stats.unpublished}</div>
                            </div>
                        </div>

                        {/* Controls: Search, Filter, Create */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center', background: WHITE, padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <Link to="/admin/create-course" style={{ textDecoration: 'none' }}>
                                <button style={{ ...buttonBaseStyle, background: ACCENT_COLOR, color: WHITE }}>+ Create New Course</button>
                            </Link>
                            <input
                                placeholder="Search courses by title or description..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                style={{ padding: '10px 14px', borderRadius: 6, border: `1px solid ${SOFT_BORDER_COLOR}`, flex: 1, minWidth: 200 }}
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: MUTE_GRAY }}>
                                <input type="checkbox" checked={showPublishedOnly} onChange={() => setShowPublishedOnly(v => !v)} style={{ transform: 'scale(1.1)' }} />
                                Published only
                            </label>
                        </div>

                        {/* Course List Grid */}
                        {loading ? (
                            <div style={{ padding: 40, textAlign: 'center', color: MUTE_GRAY }}>Loading courses...</div>
                        ) : error ? (
                            <div style={{ color: DANGER_COLOR, padding: 20, textAlign: 'center', background: '#FEE2E2', borderRadius: 8 }}>Error: {error}</div>
                        ) : (
                            <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                                {filteredCourses.length === 0 ? (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: MUTE_GRAY, padding: 40, background: WHITE, borderRadius: 8 }}>
                                        No courses found matching your criteria.
                                    </div>
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
                        <h1 style={{ color: PRIMARY_COLOR, borderBottom: `2px solid ${SOFT_BORDER_COLOR}`, paddingBottom: 10, marginBottom: 24 }}>
                            Student Management
                        </h1>
                        
                        {/* Student Controls */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center', background: WHITE, padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                             <input
                                placeholder="Search students by name, email, or username..."
                                value={studentSearchQuery}
                                onChange={e => setStudentSearchQuery(e.target.value)}
                                style={{ padding: '10px 14px', borderRadius: 6, border: `1px solid ${SOFT_BORDER_COLOR}`, flex: 1, minWidth: 250 }}
                            />
                            {!approvalsLoading && pendingCount > 0 && (
                                <div style={{ color: DANGER_COLOR, fontWeight: 600 }}>
                                    {pendingCount} {pendingCount === 1 ? 'student' : 'students'} pending approval.
                                </div>
                            )}
                            {(studentsLoading || approvalsLoading) && <div style={{ color: MUTE_GRAY }}>Loading data...</div>}
                        </div>
                        

                        {/* Student Table */}
                        <div style={{ 
                            background: WHITE, 
                            borderRadius: 12, 
                            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                            overflow: 'hidden'
                        }}>
                            {studentsLoading && students.length === 0 ? (
                                <div style={{ padding: 60, textAlign: 'center', color: MUTE_GRAY }}>Loading students list...</div>
                            ) : filteredStudents.length === 0 ? (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '60px',
                                    color: MUTE_GRAY
                                }}>
                                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Students Found</div>
                                    <div style={{ fontSize: 14 }}>
                                        {studentSearchQuery 
                                            ? 'No students match your search criteria.'
                                            : `There are no student accounts registered yet.`}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: SOFT_BG }}>
                                                <th style={{ padding: '16px 20px', textAlign: 'left', color: PRIMARY_COLOR, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', borderBottom: `2px solid ${SOFT_BORDER_COLOR}` }}>Student</th>
                                                <th style={{ padding: '16px 20px', textAlign: 'left', color: PRIMARY_COLOR, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', borderBottom: `2px solid ${SOFT_BORDER_COLOR}` }}>Email</th>
                                                <th style={{ padding: '16px 20px', textAlign: 'left', color: PRIMARY_COLOR, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', borderBottom: `2px solid ${SOFT_BORDER_COLOR}` }}>Username</th>
                                                <th style={{ padding: '16px 20px', textAlign: 'left', color: PRIMARY_COLOR, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', borderBottom: `2px solid ${SOFT_BORDER_COLOR}` }}>Joined</th>
                                                <th style={{ padding: '16px 20px', textAlign: 'left', color: PRIMARY_COLOR, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', borderBottom: `2px solid ${SOFT_BORDER_COLOR}` }}>Status</th>
                                                <th style={{ padding: '16px 20px', textAlign: 'center', color: PRIMARY_COLOR, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', borderBottom: `2px solid ${SOFT_BORDER_COLOR}` }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map((student, index) => {
                                                const status = getStatusDisplay(student.status);
                                                const isDeleting = deletingStudentId === student._id;

                                                return (
                                                    <tr key={student._id} style={{ borderBottom: `1px solid ${SOFT_BORDER_COLOR}`, background: index % 2 === 0 ? WHITE : SOFT_BG }}>
                                                        <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 600 }}>{student.name}</td>
                                                        <td style={{ padding: '12px 20px', fontSize: 14, color: MUTE_GRAY }}>{student.email}</td>
                                                        <td style={{ padding: '12px 20px', fontSize: 14 }}>{student.username || '-'}</td>
                                                        <td style={{ padding: '12px 20px', fontSize: 14, color: MUTE_GRAY }}>
                                                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td style={{ padding: '12px 20px', fontSize: 14 }}>
                                                            <span style={statusBadgeStyle(status.color, status.bg)}>
                                                                {status.text}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                                                            {student.status === 'pending' && (
                                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                                    <button
                                                                        onClick={() => handleApproveStudent(student._id)}
                                                                        style={{
                                                                            ...buttonBaseStyle,
                                                                            padding: '6px 12px',
                                                                            fontSize: 12,
                                                                            background: SUCCESS_COLOR,
                                                                            color: WHITE,
                                                                            minWidth: '80px',
                                                                            margin: 0,
                                                                        }}
                                                                        disabled={isDeleting}
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRejectStudent(student._id)}
                                                                        style={{
                                                                            ...buttonBaseStyle,
                                                                            padding: '6px 12px',
                                                                            fontSize: 12,
                                                                            background: DANGER_COLOR,
                                                                            color: WHITE,
                                                                            minWidth: '80px',
                                                                            margin: 0,
                                                                        }}
                                                                        disabled={isDeleting}
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {(student.status === 'approved' || student.status === 'rejected') && (
                                                                <button
                                                                    onClick={() => handleDeleteStudent(student._id, student.name)}
                                                                    style={{
                                                                        ...buttonBaseStyle,
                                                                        padding: '6px 12px',
                                                                        fontSize: 12,
                                                                        background: '#FFD1D1',
                                                                        color: DANGER_COLOR,
                                                                        border: `1px solid ${DANGER_COLOR}`,
                                                                        margin: 0,
                                                                    }}
                                                                    disabled={isDeleting}
                                                                >
                                                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div style={{ maxWidth: 800, margin: '0 auto' }}>
                        <h2 style={{ color: PRIMARY_COLOR, borderBottom: `2px solid ${SOFT_BORDER_COLOR}`, paddingBottom: 10, marginBottom: 24 }}>Admin Messages</h2>
                        <AdminMessageBoard />
                    </div>
                )}
            </main>
        </div>
    );
}
