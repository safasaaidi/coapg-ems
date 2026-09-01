import axios from 'axios';

// Ajout explicite de /api à l'URL de base
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5109/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Intercepteur de Requête : Alignement sur 'authToken'
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); //  Modifié pour correspondre à App.tsx
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// 2. Intercepteur de Réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;