import axios from 'axios';

// Get backend URL from environment variables, fallback for local dev
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create an Axios instance with base configuration
const patientAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically attach JWT token to all requests
patientAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================
// 🏥 PATIENT PROFILE APIs
// ==========================

export const fetchPatientProfile = async (userId) => {
  try {
    const response = await patientAPI.get(`/patients/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    throw error;
  }
};

export const updatePatientProfile = async (patientId, data) => {
  try {
    const response = await patientAPI.put(`/patients/${patientId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating patient profile:", error);
    throw error;
  }
};

// ==========================
// 📅 APPOINTMENT APIs
// ==========================

export const fetchPatientAppointments = async (patientId, status = '') => {
  try {
    const query = status ? `?status=${status}` : '';
    const response = await patientAPI.get(`/appointments/patient/${patientId}${query}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

export const bookAppointment = async (appointmentData) => {
  try {
    const response = await patientAPI.post('/appointments', appointmentData);
    return response.data;
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw error;
  }
};

export const cancelAppointment = async (appointmentId) => {
  try {
    const response = await patientAPI.put(`/appointments/${appointmentId}/cancel`);
    return response.data;
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    throw error;
  }
};

// ==========================
// 🧾 BILLS & INVOICE APIs
// ==========================

export const fetchPatientBills = async (patientId) => {
  try {
    const response = await patientAPI.get(`/bills/patient/${patientId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching patient bills:", error);
    throw error;
  }
};

export default patientAPI;
