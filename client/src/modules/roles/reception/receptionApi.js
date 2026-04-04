import API from "../../../api/axios";

// ================= PATIENTS =================

// Get all patients
export const getPatients = async () => {
  const res = await API.get("/patients");
  return res.data.data.patients;
};

// Create patient
export const createPatient = async (data) => {
  const res = await API.post("/patients", data);
  return res.data.data.patient;
};

// Delete patient
export const deletePatient = async (id) => {
  await API.delete(`/patients/${id}`);
};

// ================= BILLING =================

// Get bills
export const getBills = async () => {
  const res = await API.get("/billing");
  return res.data.data.bills;
};

// Create bill
export const createBill = async (data) => {
  const res = await API.post("/billing", data);
  return res.data.data.bill;
};

// Delete bill
export const deleteBill = async (id) => {
  await API.delete(`/billing/${id}`);
};