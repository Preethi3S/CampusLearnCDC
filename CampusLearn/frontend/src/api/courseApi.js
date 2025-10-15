import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const instance = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });

// Optional Authorization header
const withToken = (token) => (token ? { headers: { Authorization: `Bearer ${token}` } } : {});

export default {
  // Fetch all courses (public)
  getCourses: async (token) => {
    const res = await instance.get('/courses', withToken(token));
    return res.data;
  },

  getCourse: async (id, token) => {
    const res = await instance.get(`/courses/${id}`, withToken(token));
    return res.data;
  },

  createCourse: async (payload, token) => {
    const res = await instance.post('/courses', payload, withToken(token));
    return res.data;
  },

  updateCourse: async (id, payload, token) => {
    const res = await instance.put(`/courses/${id}`, payload, withToken(token));
    return res.data;
  },

  deleteCourse: async (id, token) => {
    const res = await instance.delete(`/courses/${id}`, withToken(token));
    return res.data;
  },

  addLevel: async (courseId, levelPayload, token) => {
    const res = await instance.post(`/courses/${courseId}/levels`, levelPayload, withToken(token));
    return res.data;
  },

  addModule: async (courseId, levelId, modulePayload, token) => {
    const res = await instance.post(`/courses/${courseId}/levels/${levelId}/modules`, modulePayload, withToken(token));
    return res.data;
  }
,
  removeModule: async (courseId, levelId, moduleId, token) => {
    const res = await instance.delete(`/courses/${courseId}/levels/${levelId}/modules/${moduleId}`, withToken(token));
    return res.data;
  }
};
