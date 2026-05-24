import api from './api';

export const getAdminStats = async () => {
  const res = await api.get('/admin/stats');
  return res.data;
};

export const getOwners = async (params = {}) => {
  const res = await api.get('/admin/owners', { params });
  return res.data;
};

export const getOwnerDetails = async (id) => {
  const res = await api.get(`/admin/owners/${id}`);
  return res.data;
};

export const updateOwnerStatus = async (id, isActive) => {
  const res = await api.put(`/admin/owners/${id}/status`, { isActive });
  return res.data;
};

export const overrideSubscription = async (id, status, expiresAt) => {
  const res = await api.put(`/admin/owners/${id}/override-subscription`, { status, expiresAt });
  return res.data;
};

export const getAuditLogs = async () => {
  const res = await api.get('/admin/audit');
  return res.data;
};

export const initiatePasswordReset = async (email) => {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
};
