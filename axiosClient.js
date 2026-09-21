import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // El super_admin puede estar "viendo" un negocio específico; los demás
  // roles ya tienen su empresa fija en el token, pero mandar el header no
  // hace daño y simplifica la lógica en el backend.
  const empresaActivaId = localStorage.getItem('empresaActivaId');
  if (empresaActivaId) config.headers['x-empresa-id'] = empresaActivaId;

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
