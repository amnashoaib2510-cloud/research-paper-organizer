import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const api = axios.create({ baseURL: `${API_URL}/api` });

export const getPapers = () => api.get('/papers').then((r) => r.data);

export const searchPapers = (q, tag) =>
  api.get('/papers/search', { params: { q, tag } }).then((r) => r.data);

export const getTags = () => api.get('/papers/tags').then((r) => r.data);

export const uploadPaper = (formData) =>
  api
    .post('/papers/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const updatePaper = (id, data) =>
  api.put(`/papers/${id}`, data).then((r) => r.data);

export const deletePaper = (id) => api.delete(`/papers/${id}`).then((r) => r.data);

export const fileUrl = (id) => `${API_URL}/api/papers/${id}/file`;
