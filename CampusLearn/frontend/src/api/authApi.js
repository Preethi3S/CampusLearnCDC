import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const instance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// helper to attach token
const withToken = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export default {
  register: async ({ name, email, password, role }) => {
    const res = await instance.post('/auth/register', { name, email, password, role });
    return res.data;
  },
  login: async ({ email, password }) => {
    const res = await instance.post('/auth/login', { email, password });
    return res.data;
  },
  getMe: async (token) => {
    const res = await instance.get('/auth/me', withToken(token));
    return res.data;
  }
};
