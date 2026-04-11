import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import RoleRoutes from './RoleRoutes'

// Patient
import PatientDashboard from '../modules/roles/patient/PatientDashboard'
import PatientProfile from '../modules/roles/patient/Profile'
import MyAppointments from '../modules/roles/patient/MyAppointments'
import MyRecords from '../modules/roles/patient/MyRecords'
import MyBills from '../modules/roles/patient/MyBills'

// Auth
import Login from '../modules/auth/Login'
import SignUp from '../modules/auth/SignUp'

// Shared layout
import DashboardLayout from '../components/DashboardLayout'
import NotificationsPage from '../modules/notifications/NotificationsPage'
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
import DoctorManagement from '../modules/roles/admin/DoctorManagement'
import ReceptionManagement from '../modules/roles/admin/ReceptionManagement'
import PatientManagement from '../modules/roles/admin/PatientManagement'
import RevenueDashboard from '../modules/roles/admin/RevenueDashboard'
import AdminProfile from '../modules/roles/admin/AdminProfile'

// Doctor
import DoctorLayout from '../modules/roles/doctor/DoctorLayout'
import DoctorDashboard from '../modules/roles/doctor/DoctorDashboard'
import DoctorAppointments from '../modules/roles/doctor/DoctorAppointments'
import PatientDetails from '../modules/roles/doctor/PatientDetails'
import Schedule from '../modules/roles/doctor/Schedule'
import DoctorProfile from '../modules/roles/doctor/DoctorProfile'

// Reception
import ReceptionLayout from '../modules/roles/reception/ReceptionLayout'
import ReceptionDashboard from '../modules/roles/reception/ReceptionDashboard'
import PatientHandler from '../modules/roles/reception/PatientHandler'
import AppointmentHandler from '../modules/roles/reception/AppointmentHandler'
import QueueManagement from '../modules/roles/reception/QueueManagement'
import BillingSupport from '../modules/roles/reception/BillingSupport'
import ReceptionProfile from '../modules/roles/reception/ReceptionProfile'


function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />

      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="text-center">
              <h1 className="text-4xl font-black text-slate-900 mb-2">403</h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
                Access Denied
              </p>
              <a href="/login" className="text-xs font-black text-emerald-500 uppercase tracking-widest hover:underline">
                Back to Login
              </a>
            </div>
          </div>
        }
      />

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/doctors" element={<DoctorManagement />} />
          <Route path="/admin/doctors/add" element={<DoctorManagement view="add" />} />
          <Route path="/admin/reception" element={<ReceptionManagement />} />
          <Route path="/admin/patients" element={<PatientManagement />} />
          <Route path="/admin/billing" element={<RevenueDashboard />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* Doctor */}
      <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
        <Route element={<DoctorLayout />}>
          <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<DoctorAppointments />} />
          <Route path="/doctor/patients" element={<PatientDetails />} />
          <Route path="/doctor/schedule" element={<Schedule />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/doctor/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* Reception */}
      <Route element={<ProtectedRoute allowedRoles={['reception']} />}>
        <Route element={<ReceptionLayout />}>
          <Route path="/reception" element={<Navigate to="/reception/dashboard" replace />} />
          <Route path="/reception/dashboard" element={<ReceptionDashboard />} />
          <Route path="/reception/patients" element={<PatientHandler />} />
          <Route path="/reception/patients/add" element={<PatientHandler />} />
          <Route path="/reception/appointments" element={<AppointmentHandler />} />
          <Route path="/reception/appointments/book" element={<AppointmentHandler />} />
          <Route path="/reception/queue" element={<QueueManagement />} />
          <Route path="/reception/billing" element={<BillingSupport />} />
          <Route path="/reception/profile" element={<ReceptionProfile />} />
          <Route path="/reception/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* Patient */}
      <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/profile" element={<PatientProfile />} />
          <Route path="/patient/appointments" element={<MyAppointments />} />
          <Route path="/patient/records" element={<MyRecords />} />
          <Route path="/patient/billing" element={<MyBills />} />
          <Route path="/patient/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* Root redirect */}
      <Route path="/*" element={<RoleRoutes />} />

      {/* Shared Dashboard — staff only (admin, doctor, reception) */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'reception']} />}>
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

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes