import { Route, Routes, Navigate } from 'react-router-dom'
import PatientDashboard from '../modules/roles/patient/PatientDashboard'
import Profile from '../modules/roles/patient/Profile'
import MyAppointments from '../modules/roles/patient/MyAppointments'
import MyRecords from '../modules/roles/patient/MyRecords'
import MyBills from '../modules/roles/patient/MyBills'
import DashboardLayout from '../components/DashboardLayout'
import useAuth from '../hooks/useAuth'

function RoleRoutes() {
  const { role } = useAuth()
  const user = { role } // Keep the user variable name if preferred, or use role directly

  return (
    <Routes>
      {/* Patient Specific Routes */}
      {user.role === 'patient' && (
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="/dashboard" element={<PatientDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/appointments" element={<MyAppointments />} />
          <Route path="/records" element={<MyRecords />} />
          <Route path="/billing" element={<MyBills />} />
        </Route>
      )}

      {/* Fallback for unauthorized or non-existent routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default RoleRoutes
