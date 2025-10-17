import axios from 'axios';

const API_URL = '/api/student-profile';

const getProfile = async (token) => {
  const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

const saveProfile = async (formData, token) => {
  const res = await axios.post(API_URL, formData, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export default { getProfile, saveProfile };
