import api from './api';

export const ownerLogin = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data; // Returns { user, token }
};

export const adminLogin = async (loginId, password) => {
  const res = await api.post('/auth/admin/login', { login_id: loginId, password });
  return res.data;
};

export const ownerSignup = async (formData) => {
  const res = await api.post('/auth/signup', formData);
  return res.data;
};
