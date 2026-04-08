import axios from "../../api/axios";

// Get medical records for a patient
export const getPatientRecords = async (patientId) => {
  try {
    const response = await axios.get(`/records/patient/${patientId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create a new medical record
export const createRecord = async (recordData) => {
  try {
    const response = await axios.post(`/records`, recordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
