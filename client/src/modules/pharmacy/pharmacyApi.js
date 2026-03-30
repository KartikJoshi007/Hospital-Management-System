import axios from "../../api/axios";

// GET all medicines
export const getMedicines = async () => {
  const res = await axios.get("/medicines");
  return res.data.data;
};

// ADD medicine
export const addMedicine = async (data) => {
  const res = await axios.post("/medicines", data);
  return res.data.data;
};

// UPDATE medicine
export const updateMedicine = async (id, data) => {
  const res = await axios.put(`/medicines/${id}`, data);
  return res.data.data;
};

// DELETE medicine
export const deleteMedicine = async (id) => {
  await axios.delete(`/medicines/${id}`);
};

// LOW STOCK ALERT
export const getLowStock = async () => {
  const res = await axios.get("/medicines/stock-alerts");
  return res.data.data;
};