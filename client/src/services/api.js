import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agregar JWT a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  registerStudent: (data) => api.post('/auth/register/student', data),
  registerElderly: (data) => api.post('/auth/register/elderly', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
};

// Solicitudes API
export const solicitudesAPI = {
  getAll: (params) => api.get('/solicitudes', { params }),
  getById: (id) => api.get(`/solicitudes/${id}`),
  getMine: () => api.get('/solicitudes/mine'),
  create: (data) => api.post('/solicitudes', data),
  update: (id, data) => api.put(`/solicitudes/${id}`, data),
  cancel: (id) => api.delete(`/solicitudes/${id}`),
  accept: (id) => api.post(`/solicitudes/${id}/accept`),
  complete: (id) => api.post(`/solicitudes/${id}/complete`),
  confirm: (id) => api.post(`/solicitudes/${id}/confirm`),
  cancelAcceptance: (id) => api.post(`/solicitudes/${id}/cancel-acceptance`),
};

// Categorías API
export const categoriasAPI = {
  getAll: () => api.get('/categorias'),
};

// Evaluaciones API
export const evaluacionesAPI = {
  create: (data) => api.post('/evaluaciones', data),
  getBySolicitud: (solicitudId) => api.get(`/evaluaciones/solicitud/${solicitudId}`),
};

export default api;
