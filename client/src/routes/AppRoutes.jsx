import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import Appointments from '../modules/appointments/Appointments'
import Patients from '../modules/patients/Patients'
import Billing from '../modules/billing/Billing'
import Pharmacy from '../modules/pharmacy/Pharmacy'

import Dashboard from '../modules/dashboard/Dashboard'

import Doctors from '../modules/doctors/Doctors'

// import SignIn from '../modules/auth/SignIn'
// import SignUp from '../modules/auth/SignUp'

function AppRoutes() {
  return (
    <Routes>
      {/* <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} /> */}

      <Route element={<DashboardLayout />}>
        {/* Redirect root to dashboard by default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/patients">
          <Route index element={<Navigate to="record" replace />} />
          <Route path="record" element={<Patients view="record" />} />
          <Route path="add" element={<Patients view="add" />} />
        </Route>

        <Route path="/appointments">
          <Route index element={<Navigate to="calendar" replace />} />
          <Route path="calendar" element={<Appointments view="calendar" />} />
          <Route path="view" element={<Appointments view="view" />} />
          <Route path="book" element={<Appointments view="book" />} />
        </Route>
        
        <Route path="/doctors" element={<Doctors />} />

        <Route path="/billing" element={<Billing />} />
        <Route path="/pharmacy" element={<Pharmacy />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
