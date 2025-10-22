import React, { useState, useEffect } from 'react';
import courseApi from "../../api/courseApi";
import enrollmentApi from "../../api/enrollmentApi";

const CourseEnrollments = ({ token }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [error, setError] = useState(null);

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
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
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <div>Loading enrollments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        color: 'red', 
        padding: '20px', 
        textAlign: 'center' 
      }}>
        Error: {error}
      </div>
    );
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
                <div>
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
                    fontSize: '14px'
                  }}>
                    <span>Students: {course.studentCount || 0}</span>
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
                  {course.enrollments.length === 0 ? (
                    <div style={{ 
                      padding: '20px', 
                      textAlign: 'center',
                      color: '#666',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '4px'
                    }}>
                      No students enrolled in this course yet.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ 
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                      }}>
                        <thead>
                          <tr style={{ 
                            backgroundColor: '#f5f7fa',
                            textAlign: 'left',
                            borderBottom: '1px solid #e0e6ed'
                          }}>
                            <th style={{ padding: '12px 16px' }}>Student Name</th>
                            <th style={{ padding: '12px 16px' }}>Email</th>
                            <th style={{ padding: '12px 16px' }}>Enrolled On</th>
                            <th style={{ padding: '12px 16px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {course.enrollments.map(enrollment => (
                            <tr 
                              key={enrollment._id}
                              style={{
                                borderBottom: '1px solid #f0f2f5',
                                backgroundColor: '#fff',
                                transition: 'background-color 0.2s'
                              }}
                            >
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
                    </div>
                  )}
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
