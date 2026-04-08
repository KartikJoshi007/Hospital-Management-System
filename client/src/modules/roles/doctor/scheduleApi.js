import axios from "../../../api/axios";

export const getDoctorSchedule = async (doctorId) => {
  try {
    const response = await axios.get(`/schedule/doctor/${doctorId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createScheduleEvent = async (eventData) => {
  try {
    const response = await axios.post("/schedule", eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteScheduleEvent = async (eventId) => {
  try {
    const response = await axios.delete(`/schedule/${eventId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
