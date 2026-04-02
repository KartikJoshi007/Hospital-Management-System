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

  // Doctor-specific routes are currently disabled; send doctors to legacy dashboard.
  if (role === 'doctor' || role === 'patient') {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/unauthorized" replace />
}

export default RoleRoutes
