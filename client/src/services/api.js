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

// Control de refresco de tokens
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor: manejar errores de autenticación con renovación automática
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es una re-petición ya intentada
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Encolar peticiones concurrentes mientras se realiza el refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // No hay refresh token, forzar cierre de sesión
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Usar una instancia limpia de axios para evitar loops infinitos con interceptores
        const res = await axios.post('/api/auth/refresh', { refreshToken }, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data.data;

        // Guardar nuevos tokens
        localStorage.setItem('token', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Actualizar headers
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Reintentar petición original
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // El refresco falló o el token expiró/fue revocado
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
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
  logout: (data) => api.post('/auth/logout', data),
  logoutAll: () => api.post('/auth/logout-all'),
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
