import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import userApi from '../../api/userApi';

// Styles
const styles = {
    container: {
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    backButton: {
        display: 'inline-flex',
        alignItems: 'center',
        color: '#7C3AED',
        textDecoration: 'none',
        marginBottom: '24px',
        fontSize: '14px',
        fontWeight: '500'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #E5E7EB'
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        marginBottom: '24px'
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#111827',
        margin: '0 0 16px 0'
    },
    statusActive: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '9999px',
        backgroundColor: '#D1FAE5',
        color: '#065F46',
        fontSize: '14px',
        fontWeight: '500'
    },
    statusInactive: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '9999px',
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
        fontSize: '14px',
        fontWeight: '500'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '16px'
    },
    th: {
        textAlign: 'left',
        padding: '12px',
        backgroundColor: '#F9FAFB',
        color: '#6B7280',
        fontSize: '14px',
        fontWeight: '500',
        borderBottom: '1px solid #E5E7EB'
    },
    td: {
        padding: '16px 12px',
        borderBottom: '1px solid #E5E7EB',
        verticalAlign: 'top'
    },
    button: {
        backgroundColor: '#7C3AED',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        marginRight: '8px'
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        color: '#7C3AED',
        border: '1px solid #7C3AED',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        marginRight: '8px'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #E5E7EB',
        borderTop: '4px solid #7C3AED',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px'
    },
    errorBox: {
        backgroundColor: '#FEF2F2',
        borderLeft: '4px solid #EF4444',
        padding: '16px',
        marginBottom: '24px',
        borderRadius: '4px'
    },
    errorIcon: {
        color: '#EF4444',
        marginRight: '12px'
    },
    avatar: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: '#EDE9FE',
        color: '#7C3AED',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: '600',
        marginRight: '16px'
    },
    progressBar: {
        height: '8px',
        backgroundColor: '#E5E7EB',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '8px'
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#7C3AED',
        borderRadius: '4px',
        transition: 'width 0.3s ease'
    },
    '@keyframes spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' }
    }
};

const StudentProfile = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const auth = useSelector(state => state.auth);
    
    const [student, setStudent] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingEnrollments, setLoadingEnrollments] = useState(true);
    const [error, setError] = useState(null);

    // Fetch student data
    useEffect(() => {
        const fetchStudentData = async () => {
            if (!auth.token || !studentId) return;
            
            try {
                setLoading(true);
                setError(null);
                
                console.log('Fetching student data for ID:', studentId);
                const allStudents = await userApi.getUsers(auth.token, 'student');
                const foundStudent = allStudents.find(s => s._id === studentId);
                
                if (!foundStudent) {
                    throw new Error(`No student found with ID: ${studentId}`);
                }
                
                console.log('Student data loaded:', foundStudent);
                setStudent(foundStudent);
                setLoading(false);
            } catch (err) {
                console.error('Error in fetchStudentData:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [auth.token, studentId]);

    // Fetch enrollments separately
    useEffect(() => {
        const fetchEnrollments = async () => {
            if (!auth.token || !studentId) return;
            
            try {
                setLoadingEnrollments(true);
                console.log('Fetching enrollments for student:', studentId);
                const enrollmentsData = await userApi.getStudentEnrollments(auth.token, studentId);
                console.log('Enrollments data received:', enrollmentsData);
                
                if (Array.isArray(enrollmentsData)) {
                    setEnrollments(enrollmentsData);
                } else {
                    console.warn('Expected array but received:', typeof enrollmentsData, enrollmentsData);
                    setEnrollments([]);
                }
            } catch (err) {
                console.error('Error fetching enrollments:', err);
                setEnrollments([]);
            } finally {
                setLoadingEnrollments(false);
            }
        };

        // Only fetch enrollments if we have a valid student
        if (student) {
            fetchEnrollments();
        }
    }, [auth.token, studentId, student]);

    // Loading state
    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading student data...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={styles.container}>
                <Link to="/admin/students" style={styles.backButton}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Students
                </Link>
                <div style={styles.errorBox}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.errorIcon}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div>
                            <h3 style={{ margin: '0 0 8px 0', color: '#1F2937' }}>Error Loading Student</h3>
                            <p style={{ margin: 0, color: '#6B7280' }}>{error}</p>
                            {error.includes('401') && (
                                <button 
                                    onClick={() => window.location.reload()}
                                    style={{
                                        marginTop: '12px',
                                        padding: '8px 16px',
                                        backgroundColor: '#EF4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Refresh Page
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Student not found
    if (!student) {
        return (
            <div style={styles.container}>
                <Link to="/admin/students" style={styles.backButton}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Students
                </Link>
                <div style={styles.errorBox}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.errorIcon}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div>
                            <h3 style={{ margin: '0 0 8px 0', color: '#1F2937' }}>Student Not Found</h3>
                            <p style={{ margin: 0, color: '#6B7280' }}>The requested student could not be found.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main render
    return (
        <div style={styles.container}>
            <Link to="/admin/students" style={styles.backButton}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Students
            </Link>

            {/* Student Header */}
            <div style={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={styles.avatar}>
                        {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                        <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                            {student.name || 'Student'}
                        </h1>
                        <p style={{ margin: '0 0 8px 0', color: '#6B7280' }}>{student.email || 'No email provided'}</p>
                        <span style={student.status === 'active' ? styles.statusActive : styles.statusInactive}>
                            {student.status || 'inactive'}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6B7280' }}>Student ID</h3>
                        <p style={{ margin: 0, fontWeight: '500' }}>{studentId}</p>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6B7280' }}>Registration Date</h3>
                        <p style={{ margin: 0, fontWeight: '500' }}>
                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6B7280' }}>Last Login</h3>
                        <p style={{ margin: 0, fontWeight: '500' }}>
                            {student.lastLogin ? new Date(student.lastLogin).toLocaleString() : 'Never'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Enrollments Section */}
            <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={styles.sectionTitle}>Enrolled Courses</h2>
                    <button 
                        onClick={() => navigate(`/admin/students/${studentId}/enroll`)}
                        style={styles.button}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Enroll in Course
                    </button>
                </div>

                {loadingEnrollments ? (
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p>Loading enrollments...</p>
                    </div>
                ) : enrollments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <svg 
                            width="64" 
                            height="64" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="#E5E7EB" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            style={{ marginBottom: '16px' }}
                        >
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                        <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '16px', fontWeight: '600' }}>No Enrollments</h3>
                        <p style={{ margin: 0, color: '#6B7280', maxWidth: '400px', margin: '0 auto' }}>
                            This student hasn't enrolled in any courses yet.
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Course</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Progress</th>
                                    <th style={styles.th}>Enrolled On</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map((enrollment) => (
                                    <tr key={enrollment._id}>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: '500' }}>{enrollment.course?.title || 'Unknown Course'}</div>
                                            <div style={{ fontSize: '14px', color: '#6B7280' }}>
                                                {enrollment.course?.code || 'N/A'}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={enrollment.status === 'active' ? styles.statusActive : styles.statusInactive}>
                                                {enrollment.status || 'inactive'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ marginBottom: '4px' }}>
                                                {enrollment.progress || 0}% complete
                                            </div>
                                            <div style={styles.progressBar}>
                                                <div style={{ ...styles.progressFill, width: `${enrollment.progress || 0}%` }}></div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td style={styles.td}>
                                            <button 
                                                onClick={() => navigate(`/admin/courses/${enrollment.course?._id}/students/${studentId}`)}
                                                style={{
                                                    ...styles.buttonOutline,
                                                    padding: '4px 8px',
                                                    fontSize: '13px',
                                                    margin: 0
                                                }}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={styles.buttonOutline}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back
                </button>
                <button 
                    onClick={() => navigate(`/admin/students/edit/${studentId}`)}
                    style={styles.button}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit Student
                </button>
            </div>
        </div>
    );
};

export default StudentProfile;
