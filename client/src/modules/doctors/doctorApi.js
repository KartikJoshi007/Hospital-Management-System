import axios from "../../api/axios";

// Create doctor
export const createDoctor = async (doctorData) => {
  try {
    const response = await axios.post("/doctors", doctorData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all doctors
export const getAllDoctors = async (page = 1, limit = 10, search = "") => {
  try {
    const response = await axios.get("/doctors", {
      params: { page, limit, search },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get doctor by ID
export const getDoctorById = async (doctorId) => {
  try {
    const response = await axios.get(`/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update doctor
export const updateDoctor = async (doctorId, doctorData) => {
  try {
    const response = await axios.put(`/doctors/${doctorId}`, doctorData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete doctor
export const deleteDoctor = async (doctorId) => {
  try {
    const response = await axios.delete(`/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get doctor stats
export const getDoctorStats = async () => {
  try {
    const response = await axios.get("/doctors/stats");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
