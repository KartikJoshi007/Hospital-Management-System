
// import axios from "../api/axios";
import axios from "../../api/axios";
// Create patient
export const createPatient = async (patientData) => {
  try {
    const response = await axios.post("/patients", patientData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all patients
export const getAllPatients = async (page = 1, limit = 10, search = "") => {
  try {
    const response = await axios.get("/patients", {
      params: { page, limit, search },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get patient by ID
export const getPatientById = async (patientId) => {
  try {
    const response = await axios.get(`/patients/${patientId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get patient by user ID
export const getPatientByUserId = async (userId) => {
  try {
    const response = await axios.get(`/patients/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update patient
export const updatePatient = async (patientId, patientData) => {
  try {
    const response = await axios.put(`/patients/${patientId}`, patientData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete patient
export const deletePatient = async (patientId) => {
  try {
    const response = await axios.delete(`/patients/${patientId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get patient statistics
export const getPatientStats = async () => {
  try {
    const response = await axios.get("/patients/stats");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Search patients
export const searchPatients = async (query) => {
  try {
    const response = await axios.get(`/patients/search/${query}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
