import api from './api';

export const getCategories = () => api.get('/menu/categories');

export const createCategory = (data) => api.post('/menu/categories', data);

export const updateCategory = (id, data) => api.put(`/menu/categories/${id}`, data);

export const deleteCategory = (id) => api.delete(`/menu/categories/${id}`);

export const getItems = () => api.get('/menu/items');

export const createItem = (data) => api.post('/menu/items', data);

export const updateItem = (id, data) => api.put(`/menu/items/${id}`, data);

export const deleteItem = (id) => api.delete(`/menu/items/${id}`);

export const toggleAvailability = (id) => api.patch(`/menu/items/${id}/toggle`);
