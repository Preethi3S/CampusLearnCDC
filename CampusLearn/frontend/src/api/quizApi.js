import axios from 'axios';
const API_URL = 'http://localhost:3000/api/quizzes';

const quizApi = {
  getQuiz: async (courseId, levelId, moduleId, token) => {
    const res = await axios.get(`${API_URL}/${courseId}/${levelId}/${moduleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  
  // 🎯 CRITICAL FIX: Add the missing submitQuiz function
  submitQuiz: async (courseId, levelId, moduleId, answers, token) => {
    // Submitting a quiz uses POST to the same endpoint
    const res = await axios.post(
      `${API_URL}/${courseId}/${levelId}/${moduleId}`,
      { answers }, // Send the answers array in the request body
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  updateQuiz: async (courseId, levelId, moduleId, questions, token) => {
    const res = await axios.put(
      `${API_URL}/${courseId}/${levelId}/${moduleId}`,
      { questions },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },
};

export default quizApi;