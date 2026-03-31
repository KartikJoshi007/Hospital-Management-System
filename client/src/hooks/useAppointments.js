import { useCallback, useEffect, useState } from 'react'
import {
  createAppointment,
  deleteAppointment,
  getAllAppointments,
  updateAppointment,
} from '../modules/appointments/appointmentApi'
import useApi from './useApi'

const normalizeList = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  return []
}

const useAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [message, setMessage] = useState('')

  const {
    execute: executeGetAppointments,
    loading: loadingGet,
    error: errorGet,
    clearError: clearGetError,
  } = useApi(getAllAppointments)
  const {
    execute: executeCreateAppointment,
    loading: loadingCreate,
    error: errorCreate,
    clearError: clearCreateError,
  } = useApi(createAppointment)

  const fetchAppointments = useCallback(async () => {
    const result = await executeGetAppointments()
    setAppointments(normalizeList(result))
  }, [executeGetAppointments])

  useEffect(() => {
    fetchAppointments().catch(() => null)
  }, [fetchAppointments])

  const addAppointment = async (payload) => {
    await executeCreateAppointment(payload)
    setMessage('Appointment booked successfully')
    await fetchAppointments()
  }

  const clearError = () => {
    clearGetError()
    clearCreateError()
  }

  return {
    appointments,
    message,
    setMessage,
    addAppointment,
    fetchAppointments,
    loading: loadingGet || loadingCreate,
    error: errorGet || errorCreate,
    clearError,
  }
}

export default useAppointments
