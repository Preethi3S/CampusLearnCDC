import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_URL = `${BASE_URL}/api/studentProfile`;

/**
 * ========================
 * 🧑 Student (self)
 * ========================
 */

// Get logged-in student's profile
const getProfile = async (token) => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Create or update student's own profile
const saveProfile = async (formData, token) => {
  const res = await axios.post(API_URL, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Explicitly patch (student updating own profile)
const updateProfile = async (formData, token) => {
  const res = await axios.patch(API_URL, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

/**
 * ========================
 * 🧑‍💼 Admin
 * ========================
 */

// Get profile of any student (by ID)
const getProfileById = async (id, token) => {
  const res = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// (Optional) Admin can update student profile by ID
const updateProfileById = async (id, formData, token) => {
  const res = await axios.patch(`${API_URL}/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

/**
 * ========================
 * Export
 * ========================
 */
const studentProfileService = {
  getProfile,
  saveProfile,
  updateProfile,
  getProfileById,
  updateProfileById,
};

export default studentProfileService;
