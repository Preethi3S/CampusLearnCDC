import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const withToken = (token) => (token ? { headers: { Authorization: `Bearer ${token}` } } : {});

export default {
  getQuiz: async (courseId, levelId, moduleId, token) => {
    const res = await axios.get(`${API_BASE}/quizzes/${courseId}/${levelId}/${moduleId}`, withToken(token));
    return res.data;
  },
  submitQuiz: async (courseId, levelId, moduleId, answers, token) => {
    const res = await axios.post(`${API_BASE}/quizzes/${courseId}/${levelId}/${moduleId}`, { answers }, withToken(token));
    return res.data;
  }
};
