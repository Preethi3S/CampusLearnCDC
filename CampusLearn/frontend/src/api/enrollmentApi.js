import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const instance = axios.create({ 
  baseURL: API_BASE, 
  headers: { 'Content-Type': 'application/json' } 
});

const withToken = (token) => ({
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

export default {
  /**
   * Get enrollment statistics (counts by course)
   */
  getEnrollmentStats: async (token) => {
    const res = await instance.get('/enrollments/stats', withToken(token));
    return res.data;
  },

  /**
   * Get all enrollments for a specific course
   */
  getEnrollmentsByCourse: async (courseId, token) => {
    const res = await instance.get(`/enrollments/course/${courseId}`, withToken(token));
    return res.data;
  },

  /**
   * Get all enrollments for a specific student
   */
  getStudentEnrollments: async (studentId, token) => {
    const res = await instance.get(`/enrollments/student/${studentId}`, withToken(token));
    return res.data;
  },

  /**
   * Enroll a student in a course
   */
  enrollStudent: async (courseId, studentId, token) => {
    const res = await instance.post(
      '/enrollments/enroll', 
      { courseId, studentId },
      withToken(token)
    );
    return res.data;
  }
};
