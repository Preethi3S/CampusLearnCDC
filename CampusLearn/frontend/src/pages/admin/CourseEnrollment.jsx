import React, { useState, useEffect, useMemo } from 'react';
import courseApi from "../../api/courseApi";
import enrollmentApi from "../../api/enrollmentApi";
import { FiChevronDown, FiUsers, FiBook, FiUser, FiMail, FiCalendar, FiLoader, FiAlertCircle, FiSearch, FiX } from 'react-icons/fi';

// Custom Components
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div style={{
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
    border: '1px solid #f0f2f5',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
    }
  }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    }}>
      <span style={{
        fontSize: '14px',
        color: '#64748b',
        fontWeight: '500'
      }}>{title}</span>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        <Icon size={20} />
      </div>
    </div>
    <div style={{
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b',
      lineHeight: '1.2'
    }}>{value}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusConfig = useMemo(() => ({
    'completed': {
      bg: '#f0fdf4',
      color: '#16a34a',
      icon: '✓',
      text: 'Completed'
    },
    'in-progress': {
      bg: '#eff6ff',
      color: '#2563eb',
      icon: '⟳',
      text: 'In Progress'
    },
    'enrolled': {
      bg: '#f8fafc',
      color: '#64748b',
      icon: '•',
      text: 'Enrolled'
    },
    'dropped': {
      bg: '#fff1f2',
      color: '#dc2626',
      icon: '✕',
      text: 'Dropped'
    }
  }), []);

  const config = statusConfig[status] || statusConfig['enrolled'];

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '600',
      backgroundColor: config.bg,
      color: config.color,
      border: `1px solid ${config.color}20`
    }}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </div>
  );
};

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '16px'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '3px solid #e2e8f0',
      borderTopColor: '#4f46e5',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <div style={{
      fontSize: '16px',
      color: '#475569',
      fontWeight: '500'
    }}>Loading enrollments...</div>
    <style>{
      `@keyframes spin { to { transform: rotate(360deg); } }`
    }</style>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div style={{
    background: '#fff5f5',
    borderLeft: '4px solid #ef4444',
    padding: '24px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    maxWidth: '800px',
    margin: '0 auto'
  }}>
    <FiAlertCircle size={24} color="#ef4444" />
    <div>
      <div style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#b91c1c',
        marginBottom: '8px'
      }}>Error Loading Data</div>
      <div style={{
        color: '#7f1d1d',
        lineHeight: '1.5',
        fontSize: '15px'
      }}>{message}</div>
    </div>
  </div>
);

const CourseEnrollments = ({ token }) => {
  // Animation variants for framer-motion like transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [searchQueries, setSearchQueries] = useState({});
  const [error, setError] = useState(null);

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));  
  };

  const handleSearchChange = (courseId, value) => {
    setSearchQueries(prev => ({
      ...prev,
      [courseId]: value.toLowerCase()
    }));
  };

  const clearSearch = (courseId, e) => {
    e.stopPropagation();
    setSearchQueries(prev => ({
      ...prev,
      [courseId]: ''
    }));
  };

  const filterEnrollments = (enrollments, query) => {
    if (!query) return enrollments;
    return enrollments.filter(enrollment => {
      const studentName = enrollment.student?.name?.toLowerCase() || '';
      const studentEmail = enrollment.student?.email?.toLowerCase() || '';
      const status = enrollment.status?.toLowerCase() || '';
      
      return (
        studentName.includes(query) ||
        studentEmail.includes(query) ||
        status.includes(query)
      );
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!token) {
          throw new Error('No authentication token available');
        }
        
        console.log('Fetching enrollment data...');
        
        // 1. Fetch all courses first
        const allCourses = await courseApi.getCourses(token, false);
        console.log('All courses:', allCourses);
        
        // 2. Fetch enrollment stats
        let stats = [];
        try {
          const statsResponse = await enrollmentApi.getEnrollmentStats(token);
          stats = Array.isArray(statsResponse) ? statsResponse : [];
          console.log('Enrollment stats:', stats);
        } catch (statsError) {
          console.warn('Could not fetch enrollment stats, using fallback:', statsError);
          // Fallback: Create stats from courses with 0 enrollments
          stats = allCourses.map(course => ({
            _id: course._id,
            studentCount: 0
          }));
        }
        
        // 3. Merge course data with enrollment stats
        const coursesWithStats = allCourses.map(course => {
          // Convert both IDs to strings for comparison to avoid type mismatches
          const stat = stats.find(s => String(s._id) === String(course._id));
          console.log(`Course ${course.title} (${course._id}) - Stat:`, stat);
          return {
            ...course,
            studentCount: stat ? stat.studentCount : 0
          };
        });
        
        // 4. For each course, fetch the detailed enrollment info
        console.log('Fetching detailed enrollments for all courses...');
        const coursesWithEnrollments = await Promise.all(
          coursesWithStats.map(async (course) => {
            console.log(`Processing course: ${course.title} (${course._id})`);
            
            try {
              console.log(`Fetching enrollments for course: ${course.title} (${course._id})`);
              const response = await enrollmentApi.getEnrollmentsByCourse(course._id, token);
              console.log(`Enrollments for ${course.title}:`, response);
              
              // If response is an array, use it directly, otherwise look for an enrollments property
              const enrollments = Array.isArray(response) 
                ? response 
                : (response.enrollments || []);
                
              console.log(`Found ${enrollments.length} enrollments for ${course.title}`);
              
              return {
                ...course,
                enrollments: enrollments.map(enrollment => ({
                  ...enrollment,
                  student: enrollment.student || {
                    _id: 'unknown',
                    name: 'Unknown Student',
                    email: 'No email available'
                  },
                  enrolledAt: enrollment.enrolledAt || new Date().toISOString(),
                  status: enrollment.status || 'enrolled'
                }))
              };
            } catch (error) {
              console.error(`Error fetching enrollments for course ${course._id}:`, error);
              return { ...course, enrollments: [] };
            }
          })
        );
        
        setCourses(coursesWithEnrollments);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError(error.message || 'Failed to load enrollment data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ 
        marginBottom: '24px', 
        color: '#2c3e50',
        fontWeight: '500',
        fontSize: '24px'
      }}>
        Course Enrollments
      </h2>
      
      {courses.length === 0 ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          color: '#666',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px'
        }}>
          No courses found with enrollments.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {courses.map(course => (
            <div 
              key={course._id}
              style={{
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{ 
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: expandedCourses[course._id] ? '#f5f7fa' : '#fff',
                  borderBottom: '1px solid #eee',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => toggleCourse(course._id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 4px 0',
                      color: '#2c3e50',
                      fontSize: '18px'
                    }}>
                      {course.title || 'Untitled Course'}
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      gap: '16px',
                      color: '#666',
                      fontSize: '14px',
                      alignItems: 'center'
                    }}>
                      <span>Students: {course.studentCount || 0}</span>
                    </div>
                  </div>
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    transition: 'transform 0.2s',
                    transform: expandedCourses[course._id] ? 'rotate(180deg)' : 'none'
                  }}>
                    <FiChevronDown size={20} />
                  </div>
                </div>
                <div style={{ 
                  transform: expandedCourses[course._id] ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s'
                }}>
                  ▼
                </div>
              </div>
              
              {expandedCourses[course._id] && (
                <div style={{ padding: '16px', borderTop: '1px solid #eee' }}>
                  <div style={{ 
                    position: 'relative',
                    width: '100%',
                    marginBottom: '16px',
                    maxWidth: '300px'
                  }}>
                    <input
                      type="text"
                      placeholder="Search students in this course..."
                      value={searchQueries[course._id] || ''}
                      onChange={(e) => handleSearchChange(course._id, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 36px 8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    />
                    {searchQueries[course._id] ? (
                      <FiX 
                        onClick={(e) => clearSearch(course._id, e)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '50%',
                          padding: '2px'
                        }}
                        size={16}
                      />
                    ) : (
                      <FiSearch 
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#94a3b8',
                          pointerEvents: 'none'
                        }}
                        size={16}
                      />
                    )}
                  </div>
                  {(() => {
                    const filteredEnrollments = filterEnrollments(
                      course.enrollments || [],
                      searchQueries[course._id]
                    );

                    if (!filteredEnrollments || filteredEnrollments.length === 0) {
                      return (
                        <div style={{ 
                          padding: '40px 20px', 
                          textAlign: 'center',
                          color: '#666',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '8px',
                          margin: '16px',
                          border: '1px dashed #e2e8f0'
                        }}>
                          {searchQueries[course._id] ? (
                            <>
                              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                              <div style={{ marginBottom: '8px', fontWeight: '500' }}>No matching students found</div>
                              <div style={{ color: '#94a3b8', marginBottom: '16px' }}>
                                No students match "{searchQueries[course._id]}"
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearSearch(course._id, e);
                                }}
                                style={{
                                  background: 'none',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  color: '#4f46e5',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  '&:hover': {
                                    backgroundColor: '#f8fafc'
                                  }
                                }}
                              >
                                <FiX size={14} />
                                Clear search
                              </button>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                              <div style={{ marginBottom: '8px', fontWeight: '500' }}>No students enrolled</div>
                              <div style={{ color: '#94a3b8' }}>There are no students enrolled in this course yet.</div>
                            </>
                          )}
                        </div>
                      );
                    }

                    return (
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '14px',
                        color: '#2c3e50'
                      }}>
                        <thead>
                          <tr style={{ 
                            backgroundColor: '#f5f7fa',
                            color: '#2c3e50',
                            fontWeight: '600',
                            fontSize: '14px',
                            padding: '8px 16px',
                            borderBottom: '1px solid #e2e8f0'
                          }}>
                            <th style={{ padding: '12px 16px' }}>Student</th>
                            <th style={{ padding: '12px 16px' }}>Email</th>
                            <th style={{ padding: '12px 16px' }}>Enrolled At</th>
                            <th style={{ padding: '12px 16px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEnrollments.map((enrollment, idx) => (
                            <tr key={idx} style={{ 
                              padding: '12px 16px',
                              borderBottom: '1px solid #e2e8f0',
                              '&:hover': {
                                backgroundColor: '#f8fafc'
                              }
                            }}>
                            
                              <td style={{ 
                                padding: '12px 16px',
                                color: '#2c3e50'
                              }}>
                                {enrollment.student?.name || 'Unknown Student'}
                              </td>
                              <td style={{ 
                                padding: '12px 16px',
                                color: '#4a6fa5',
                                wordBreak: 'break-all'
                              }}>
                                {enrollment.student?.email || 'N/A'}
                              </td>
                              <td style={{ 
                                padding: '12px 16px',
                                color: '#666',
                                whiteSpace: 'nowrap'
                              }}>
                                {formatDate(enrollment.enrolledAt)}
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  backgroundColor: enrollment.status === 'completed' ? '#e3f9e5' : 
                                                 enrollment.status === 'in-progress' ? '#e3f0ff' : '#f0f0f0',
                                  color: enrollment.status === 'completed' ? '#1b5e20' :
                                         enrollment.status === 'in-progress' ? '#0d47a1' : '#424242',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  textTransform: 'capitalize'
                                }}>
                                  {enrollment.status || 'enrolled'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseEnrollments;
