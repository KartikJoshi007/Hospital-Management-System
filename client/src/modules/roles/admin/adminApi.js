import api from '../../../api/axios'

// ─── helper ───────────────────────────────────────────────────────────────────
const extractError = (err) => {
  const d = err.response?.data
  if (d?.message) throw new Error(d.message)
  if (d?.errors?.length) throw new Error(d.errors[0].msg || d.errors[0].message)
  throw new Error(err.message || 'Something went wrong')
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const fetchDashboardStats = async () => {
  try {
    const res = await api.get('/dashboard/stats')
    return res.data.data
  } catch (e) { extractError(e) }
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const fetchAllUsers = async () => {
  try {
    const res = await api.get('/auth/users')
    return res.data.data          // array of users
  } catch (e) { extractError(e) }
}

export const apiToggleUserActive = async (id) => {
  try {
    const res = await api.put(`/auth/users/${id}/toggle-active`)
    return res.data.data          // updated user
  } catch (e) { extractError(e) }
}

export const apiUpdateUserRole = async (id, role) => {
  try {
    const res = await api.put(`/auth/users/${id}/role`, { role })
    return res.data.data          // updated user
  } catch (e) { extractError(e) }
}

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const fetchAllDoctors = async (params = {}) => {
  try {
    const res = await api.get('/doctors', { params })
    return res.data.data          // array of doctors
  } catch (e) { extractError(e) }
}

export const apiCreateDoctor = async (data) => {
  try {
    const res = await api.post('/doctors', data)
    return res.data.data
  } catch (e) { extractError(e) }
}

export const apiUpdateDoctor = async (id, data) => {
  try {
    const res = await api.put(`/doctors/${id}`, data)
    return res.data.data
  } catch (e) { extractError(e) }
}

export const apiDeleteDoctor = async (id) => {
  try {
    await api.delete(`/doctors/${id}`)
  } catch (e) { extractError(e) }
}

// ─── Patients ─────────────────────────────────────────────────────────────────
export const fetchAllPatients = async (params = {}) => {
  try {
    const res = await api.get('/patients', { params })
    return res.data.data          // { patients: [], pagination: {} }
  } catch (e) { extractError(e) }
}

export const apiUpdatePatient = async (id, data) => {
  try {
    const res = await api.put(`/patients/${id}`, data)
    return res.data.data
  } catch (e) { extractError(e) }
}

export const apiDeletePatient = async (id) => {
  try {
    await api.delete(`/patients/${id}`)
  } catch (e) { extractError(e) }
}

// ─── Appointments ─────────────────────────────────────────────────────────────
export const fetchAllAppointments = async (params = {}) => {
  try {
    const res = await api.get('/appointments', { params })
    return res.data.data          // { appointments: [], pagination: {} }
  } catch (e) { extractError(e) }
}

export const apiUpdateAppointment = async (id, data) => {
  try {
    const res = await api.put(`/appointments/${id}`, data)
    return res.data.data
  } catch (e) { extractError(e) }
}

export const apiCancelAppointment = async (id) => {
  try {
    const res = await api.put(`/appointments/${id}/cancel`)
    return res.data.data
  } catch (e) { extractError(e) }
}

// ─── Billing ──────────────────────────────────────────────────────────────────
export const fetchBillingStats = async () => {
  try {
    const res = await api.get('/bills/stats')
    return res.data.data          // { monthlyRevenue, revenueByType, summary }
  } catch (e) { extractError(e) }
}

export const fetchAllBills = async (params = {}) => {
  try {
    const res = await api.get('/bills', { params })
    return res.data.data          // { bills: [], pagination: {} }
  } catch (e) { extractError(e) }
}

// ─── Profile (admin self) ─────────────────────────────────────────────────────
export const apiUpdateProfile = async (data) => {
  try {
    const res = await api.put('/auth/profile', data)
    return res.data.data          // updated user
  } catch (e) { extractError(e) }
}

export const apiChangePassword = async (data) => {
  try {
    const res = await api.put('/auth/change-password', data)
    return res.data
  } catch (e) { extractError(e) }
}
