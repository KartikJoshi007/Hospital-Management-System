import { Navigate } from 'react-router-dom'

const ROLE_HOME = {
  admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
  patient: '/patient/dashboard',
  reception: '/reception/dashboard',
}

function RoleRoutes() {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })()

  if (!user) return <Navigate to="/login" replace />

  const path = ROLE_HOME[user.role] || '/login'
  return <Navigate to={path} replace />
}

export default RoleRoutes
