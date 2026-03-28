import axios from "../api/axios";

// Create appointment
export const createAppointment = async (appointmentData) => {
  try {
    const response = await axios.post("/appointments", appointmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all appointments
export const getAllAppointments = async (page = 1, limit = 10, filters = {}) => {
  try {
    const response = await axios.get("/appointments", {
      params: { page, limit, ...filters },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get appointment by ID
export const getAppointmentById = async (appointmentId) => {
  try {
    const response = await axios.get(`/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update appointment
export const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const response = await axios.put(`/appointments/${appointmentId}`, appointmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Cancel appointment
export const cancelAppointment = async (appointmentId) => {
  try {
    const response = await axios.put(`/appointments/${appointmentId}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete appointment
export const deleteAppointment = async (appointmentId) => {
  try {
    const response = await axios.delete(`/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get appointments for a specific patient
export const getPatientAppointments = async (patientId, page = 1, limit = 10, status = "") => {
  try {
    const response = await axios.get(`/appointments/patient/${patientId}`, {
      params: { page, limit, status },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get appointments for a specific doctor
export const getDoctorAppointments = async (doctorId, page = 1, limit = 10, date = "") => {
  try {
    const response = await axios.get(`/appointments/doctor/${doctorId}`, {
      params: { page, limit, date },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get appointment statistics
export const getAppointmentStats = async () => {
  try {
    const response = await axios.get("/appointments/stats");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
