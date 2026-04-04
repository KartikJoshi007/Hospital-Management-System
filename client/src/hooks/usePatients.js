import { useCallback, useEffect, useState } from 'react'
import {
  createPatient,
  deletePatient,
  getAllPatients,
  updatePatient,
} from '../modules/patients/patientApi'
import useApi from './useApi'

const normalizeList = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  return []
}

const fallbackPatients = [
  {
    id: 'pat-1',
    name: 'Ava Sharma',
    age: 29,
    gender: 'Female',
    contact: '9876543210',
    medicalHistory: 'Asthma (mild). Allergic to penicillin.',
  },
  {
    id: 'pat-2',
    name: 'Rohan Mehta',
    age: 41,
    gender: 'Male',
    contact: '8765432109',
    medicalHistory: 'Diabetes Type 2. Takes metformin daily.',
  },
  {
    id: 'pat-3',
    name: 'Sara Khan',
    age: 34,
    gender: 'Other',
    contact: '9123456789',
    medicalHistory: 'No known chronic conditions.',
  },
]

const usePatients = (enabled = true) => {
  const [patients, setPatients] = useState([])
  const [message, setMessage] = useState('')
  const [isFallbackMode, setIsFallbackMode] = useState(false)

  const {
    execute: executeGetPatients,
    loading: loadingGet,
    error: errorGet,
    clearError: clearGetError,
  } = useApi(getAllPatients)
  const {
    execute: executeCreatePatient,
    loading: loadingCreate,
    error: errorCreate,
    clearError: clearCreateError,
  } = useApi(createPatient)
  const {
    execute: executeUpdatePatient,
    loading: loadingUpdate,
    error: errorUpdate,
    clearError: clearUpdateError,
  } = useApi(updatePatient)
  const {
    execute: executeDeletePatient,
    loading: loadingDelete,
    error: errorDelete,
    clearError: clearDeleteError,
  } = useApi(deletePatient)

  const fetchPatients = useCallback(async () => {
    try {
      const result = await executeGetPatients()
      const list = normalizeList(result)

      if (import.meta.env.DEV && list.length === 0) {
        setPatients(fallbackPatients)
        setIsFallbackMode(true)
        return
      }

      setPatients(list)
      setIsFallbackMode(false)
    } catch {
      if (import.meta.env.DEV) {
        setPatients(fallbackPatients)
        setIsFallbackMode(true)
        return
      }
      throw new Error('Unable to fetch patients')
    }
  }, [executeGetPatients])

  useEffect(() => {
    if (!enabled) return
    fetchPatients().catch(() => null)
  }, [fetchPatients, enabled])

  const savePatient = async (payload, editingId) => {
    if (isFallbackMode) {
      if (editingId) {
        setPatients((prev) =>
          prev.map((patient) => {
            const id = patient.id || patient._id
            return id === editingId ? { ...patient, ...payload } : patient
          }),
        )
        setMessage('Patient updated successfully')
      } else {
        setPatients((prev) => [
          ...prev,
          { id: `pat-${Date.now()}`, ...payload },
        ])
        setMessage('Patient added successfully')
      }
      return
    }

    if (editingId) {
      await executeUpdatePatient(editingId, payload)
      setMessage('Patient updated successfully')
    } else {
      await executeCreatePatient(payload)
      setMessage('Patient added successfully')
    }
    await fetchPatients()
  }

  const removePatient = async (id) => {
    if (isFallbackMode) {
      setPatients((prev) =>
        prev.filter((patient) => (patient.id || patient._id) !== id),
      )
      setMessage('Patient deleted successfully')
      return
    }

    await executeDeletePatient(id)
    setMessage('Patient deleted successfully')
    await fetchPatients()
  }

  const clearError = () => {
    clearGetError()
    clearCreateError()
    clearUpdateError()
    clearDeleteError()
  }

  return {
    patients,
    message,
    setMessage,
    fetchPatients,
    savePatient,
    removePatient,
    loading: loadingGet || loadingCreate || loadingUpdate || loadingDelete,
    error: errorGet || errorCreate || errorUpdate || errorDelete,
    clearError,
  }
}

export default usePatients
