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
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
        color: '#111827'
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
        borderCollapse: 'collapse'
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
        gap: '8px'
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        color: '#7C3AED',
        border: '1px solid #7C3AED',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        marginRight: '8px'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px'
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
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
    },
    errorIcon: {
        color: '#EF4444',
        flexShrink: 0,
        marginTop: '2px'
    },
    avatar: {
        backgroundColor: '#EDE9FE',
        color: '#7C3AED',
        borderRadius: '50%',
        width: '64px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
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
        borderRadius: '4px'
    }
};

const StudentProfile = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const auth = useSelector(state => state.auth);
    const [student, setStudent] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const allStudents = await userApi.getUsers(auth.token, 'student');
                const foundStudent = allStudents.find(s => s._id === studentId);
                
                if (!foundStudent) {
                    throw new Error(`No student found with ID: ${studentId}`);
                }
                
                setStudent(foundStudent);
                
                try {
                    const enrollmentsData = await userApi.getStudentEnrollments(auth.token, studentId);
                    setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
                } catch (enrollError) {
                    console.warn('Could not load enrollments:', enrollError.message);
                    setEnrollments([]);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching student data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        if (auth.token && studentId) {
            fetchStudentData();
        }
    }, [auth.token, studentId]);

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading student data...</p>
            </div>
        );
    }

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
        );
    }

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
        );
    }

    return (
        <div style={styles.container}>
            <Link to="/admin/dashboard" style={styles.backButton}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Students
            </Link>

            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={styles.avatar}>
                        {student.name ? student.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                            {student.name || 'Student Profile'}
                        </h1>
                        <p style={{ margin: '4px 0 0 0', color: '#6B7280' }}>Student ID: {studentId}</p>
                    </div>
                </div>
                <span style={student.status === 'active' ? styles.statusActive : styles.statusInactive}>
                    {student.status || 'inactive'}
                </span>
            </div>

            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Student Information</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#4B5563' }}>Contact Information</h3>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 4px 0' }}>Email</p>
                                <p style={{ margin: 0, fontWeight: '500' }}>{student.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 4px 0' }}>Phone</p>
                                <p style={{ margin: 0 }}>{student.phone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#4B5563' }}>Account Details</h3>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 4px 0' }}>Registration Date</p>
                                <p style={{ margin: 0 }}>
                                    {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 4px 0' }}>Last Active</p>
                                <p style={{ margin: 0 }}>
                                    {student.lastLogin ? new Date(student.lastLogin).toLocaleString() : 'Never'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Enrollments</h2>
                    <span style={{ fontSize: '14px', color: '#050609ff' }}>{enrollments.length} courses</span>
                </div>

                {enrollments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <p style={{ color: '#6B7280' }}>No enrollments found for this student.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Course</th>
                                    <th style={styles.th}>Enrollment Date</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map((enrollment) => (
                                    <tr key={enrollment._id}>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: '500' }}>{enrollment.course?.title || 'Unknown Course'}</div>
                                            <div style={{ fontSize: '14px', color: '#000000ff' }}>
                                                {/* {enrollment.course?.code || ''} */}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={enrollment.status === 'active' ? styles.statusActive : styles.statusInactive}>
                                                {enrollment.status || 'inactive'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.progressBar}>
                                                <div 
                                                    style={{
                                                        ...styles.progressFill,
                                                        width: `${enrollment.progress || 0}%`
                                                    }}
                                                />
                                            </div>
                                            <div style={{ textAlign: 'right', fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
                                                {enrollment.progress || 0}%
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button 
                    onClick={() => window.history.back()}
                    style={styles.buttonOutline}
                >
                    Back
                </button>
                <button 
                    onClick={() => navigate(`/admin/students/edit/${studentId}`)}
                    style={styles.button}
                >
                    Edit Student
                </button>
            </div>
        </div>
    );
};

export default StudentProfile;
