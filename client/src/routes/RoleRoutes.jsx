import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

function RoleRoutes() {
  const { role, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (role === 'reception') {
    return <Navigate to="/reception/dashboard" replace />
  }

  if (role === 'doctor') {
    return <Navigate to="/doctor/dashboard" replace />
  }

  if (role === 'patient') {
    return <Navigate to="/patient/dashboard" replace />
  }

  return <Navigate to="/unauthorized" replace />
}

export default RoleRoutes
