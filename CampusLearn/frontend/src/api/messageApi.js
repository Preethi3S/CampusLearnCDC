// src/api/messageApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/messages';

// --- Get all messages ---
const getAllMessages = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(API_URL, config);
  return response.data;
};

// --- Create new message (Admin only) ---
const createMessage = async (data, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.post(API_URL, data, config);
  return response.data;
};

// --- Delete message (Admin only) ---
const deleteMessage = async (id, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.delete(`${API_URL}/${id}`, config);
  return response.data;
};

export default {
  getAllMessages,
  createMessage,
  deleteMessage,
};
