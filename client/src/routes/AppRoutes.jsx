import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import RoleRoutes from './RoleRoutes'

import Login from '../modules/auth/Login'
import SignUp from '../modules/auth/SignUp'

// Shared layout (legacy)
import DashboardLayout from '../components/DashboardLayout'
import Dashboard from '../modules/dashboard/Dashboard'
import Patients from '../modules/patients/Patients'
import Appointments from '../modules/appointments/Appointments'
import Doctors from '../modules/doctors/Doctors'
import Billing from '../modules/billing/Billing'
import Pharmacy from '../modules/pharmacy/Pharmacy'

// Admin
import AdminLayout from '../modules/roles/admin/AdminLayout'
import AdminDashboard from '../modules/roles/admin/AdminDashboard'
import UserManagement from '../modules/roles/admin/UserManagement'
import RoleAssign from '../modules/roles/admin/RoleAssign'
import DoctorManagement from '../modules/roles/admin/DoctorManagement'
import PatientManagement from '../modules/roles/admin/PatientManagement'
import AppointmentManagement from '../modules/roles/admin/AppointmentManagement'
import RevenueDashboard from '../modules/roles/admin/RevenueDashboard'
import AdminProfile from '../modules/roles/admin/AdminProfile'

// Doctor
import DoctorLayout from '../modules/roles/doctor/DoctorLayout'
import DoctorDashboard from '../modules/roles/doctor/DoctorDashboard'
import DoctorAppointments from '../modules/roles/doctor/DoctorAppointments'
import PatientDetails from '../modules/roles/doctor/PatientDetails'
import MedicalRecords from '../modules/roles/doctor/MedicalRecords'
import Schedule from '../modules/roles/doctor/Schedule'

function ComingSoon({ label }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4 text-2xl font-black border border-emerald-100">
          🚧
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-1">{label}</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coming soon — under construction</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Auth ── */}
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />

      {/* ── Root → role redirect ── */}
      <Route path="/" element={<RoleRoutes />} />

      {/* ── Unauthorized ── */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="text-center">
              <h1 className="text-4xl font-black text-slate-900 mb-2">403</h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Access Denied</p>
              <a href="/login" className="text-xs font-black text-emerald-500 uppercase tracking-widest hover:underline">
                Back to Login
              </a>
            </div>
          </div>
        }
      />

      {/* ── Admin routes ── */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/roles" element={<RoleAssign />} />
          <Route path="/admin/doctors" element={<DoctorManagement />} />
          <Route path="/admin/doctors/add" element={<DoctorManagement view="add" />} />
          <Route path="/admin/patients" element={<PatientManagement />} />
          <Route path="/admin/appointments" element={<AppointmentManagement />} />
          <Route path="/admin/billing" element={<RevenueDashboard />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>
      </Route>

      {/* ── Doctor routes ── */}
      <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
        <Route element={<DoctorLayout />}>
          <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<DoctorAppointments />} />
          <Route path="/doctor/patients" element={<PatientDetails />} />
          <Route path="/doctor/records" element={<MedicalRecords />} />
          <Route path="/doctor/schedule" element={<Schedule />} />
        </Route>
      </Route>

      {/* ── Legacy shared dashboard (any authenticated role) ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
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
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
