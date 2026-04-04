import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor — attach JWT token to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors and redirect appropriately
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    if (error.response?.status === 403) {
      window.location.href = "/unauthorized";
    }
    return Promise.reject(error);
  }
);

export default instance;