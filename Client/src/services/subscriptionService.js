import api from './api';

export const getSubscription = () => api.get('/subscription/status');

export const createRazorpayOrder = (amount) =>
  api.post('/payment/subscription-order', { amount });

export const verifyPayment = (data) =>
  api.post('/payment/verify-subscription', data);
