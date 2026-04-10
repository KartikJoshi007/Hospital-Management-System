import api from '../../api/axios'

export const getAllReceptionists = (params) => api.get('/receptionists', { params })
export const getReceptionistById = (id) => api.get(`/receptionists/${id}`)
export const createReceptionist = (data) => api.post('/receptionists', data)
export const updateReceptionist = (id, data) => api.put(`/receptionists/${id}`, data)
export const deleteReceptionist = (id) => api.delete(`/receptionists/${id}`)
export const getReceptionistByUserId = (userId) => api.get(`/receptionists/user/${userId}`)
