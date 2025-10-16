import axios from 'axios';
const API_URL = '/api/messages'; // Ensure this matches your backend route

// --- GET all messages ---
const getAllMessages = async (token) => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// --- CREATE new message (Admin only) ---
const createMessage = async (messageData, token) => {
  const res = await axios.post(API_URL, messageData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// --- UPDATE message (Admin only) ---
const updateMessage = async (id, messageData, token) => {
  const res = await axios.put(`${API_URL}/${id}`, messageData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// --- DELETE message (Admin only) ---
const deleteMessage = async (id, token) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// --- ADD reply (User only, not Student) ---
const addReply = async (id, replyData, token) => {
  // replyData should be { text: "..." }
  const res = await axios.post(`${API_URL}/${id}/reply`, replyData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// --- ADD thumbs-up (User/Student) ---
const addThumb = async (id, token) => {
  // 🚨 FIX: Ensure the endpoint uses '/thumb' which matches the final backend route
  const res = await axios.post(`${API_URL}/${id}/thumb`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export default {
  getAllMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  addReply,
  addThumb,
};