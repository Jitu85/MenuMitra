import api from './api';

// Called by customer after selecting items
export const placeOrder = (data) => api.post('/orders', data);

// Called by customer after UPI manual payment
export const confirmUpiPayment = (orderId) =>
  api.patch(`/orders/${orderId}/upi-confirm`);

// Called by owner to fetch their orders
export const getOwnerOrders = (filters) =>
  api.get('/orders', { params: filters });

// Called by owner to manually mark order as paid
export const markOrderPaid = (orderId) =>
  api.patch(`/orders/${orderId}/mark-paid`);
