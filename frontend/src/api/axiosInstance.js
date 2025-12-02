import axios from "axios";

// Determine backend URL - use environment variable or construct from current host
const getBackendURL = () => {
  // If VITE_BACKEND_URL is set, use it (can be relative or absolute)
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // In development, use relative URL to leverage Vite proxy
  // This works for both localhost and network IP access
  if (import.meta.env.DEV) {
    return "/api";
  }
  
  // In production, construct from current window location for network access
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const backendPort = import.meta.env.VITE_BACKEND_PORT || '5000';
    // Use same hostname but different port for backend
    return `${protocol}//${hostname}:${backendPort}/api`;
  }
  
  // Fallback for SSR or when window is not available
  return "/api";
};

const axiosInstance = axios.create({
  baseURL: getBackendURL(),
});

axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
