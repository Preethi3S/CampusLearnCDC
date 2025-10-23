import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
const instance = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });

const withToken = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export default {
  enrollCourse: async (courseId, token) => {
    const res = await instance.post(`/progress/${courseId}/enroll`, {}, withToken(token));
    return res.data;
  },
  getMyCourses: async (token) => {
    const res = await instance.get('/progress/my-courses', withToken(token));
    return res.data;
  },
  getCourseProgress: async (courseId, token) => {
    const res = await instance.get(`/progress/${courseId}`, withToken(token));
    return res.data;
  },
  completeModule: async (courseId, levelId, moduleId, token, evidence) => {
    const body = evidence || {};
    const res = await instance.post(`/progress/${courseId}/levels/${levelId}/modules/${moduleId}/complete`, body, withToken(token));
    return res.data;
  }
};