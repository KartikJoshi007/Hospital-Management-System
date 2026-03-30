import axios from "../../api/axios";

export const getBills = async () => {
  const res = await axios.get("/bills");
  return res.data.data;
};

export const createBill = async (data) => {
  const res = await axios.post("/bills", data);
  return res.data.data;
};

export const updateBill = async (id, data) => {
  const res = await axios.put(`/bills/${id}`, data);
  return res.data.data;
};

export const deleteBill = async (id) => {
  await axios.delete(`/bills/${id}`);
};