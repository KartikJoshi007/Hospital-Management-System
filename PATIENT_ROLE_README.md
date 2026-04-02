# Patient Role Module - Technical Documentation

This document provides a comprehensive overview of the **Patient Role** implementation in the Hospital Management System. It details the component structure, routing, backend integration, and data flow to facilitate seamless integration or migration of the patient-specific module.

---

## 📂 File Structure & Locations

### 🎨 Frontend (Client)

The patient role is divided into primary views (modules) and reusable components.

#### **Modules (Pages)**
Located in `client/src/modules/roles/patient/`:
- `PatientDashboard.jsx`: The main landing page for patients, providing health summaries and upcoming appointments.
- `Profile.jsx`: View and update patient-specific information (personal details, emergency contacts, etc.).
- `MyAppointments.jsx`: History and management of a patient's appointments.
- `MyRecords.jsx`: Digital medical records, prescriptions, and lab results.
- `MyBills.jsx`: Billing history and payment status.

#### **Components (UI Elements)**
Located in `client/src/components/patientcomponents/`:
- `PatientSidebar.jsx`: Sidebar navigation tailored specifically for the patient portal.
- `AppointmentCard.jsx`: Reusable card for displaying appointment details.
- `HealthSummaryCard.jsx`: Dashboard stats cards (blood group, height, weight summary).
- `MedicalRecordRow.jsx`: List items for medical records.
- `BillingRow.jsx`: List items for invoices.

---

## 🚦 Routing & Navigation

### **Routes Configuration**
Patient routes are prefixed with `/patient` and are managed within `client/src/routes/AppRoutes.jsx`.

```javascript
// Patient Role Routes in AppRoutes.jsx
<Route path="/patient">
  <Route index element={<Navigate to="dashboard" replace />} />
  <Route path="dashboard" element={<PatientDashboard />} />
  <Route path="profile" element={<PatientProfile />} />
  <Route path="appointments" element={<MyAppointments />} />
  <Route path="records" element={<MyRecords />} />
  <Route path="billing" element={<MyBills />} />
</Route>
```

### **Layout Integration**
The `DashboardLayout.jsx` component dynamically renders the `PatientSidebar` when the URL matches a `/patient` path:

```javascript
const isPatientPath = pathname === '/patient' || pathname.startsWith('/patient/')

{isPatientPath ? (
   <PatientSidebar collapsed={collapsed} />
) : (
   <Sidebar collapsed={collapsed} />
)}
```

---

## ⚙️ Backend Integration

### **API Endpoints**
The backend API is accessible at `/api/patients`.

- **Base URL**: `http://localhost:5000/api/patients`
- **GET** `/` : List all patients (Admin/Doctor only).
- **GET** `/:id` : Get specific patient details.
- **GET** `/user/:userId` : Retrieve patient profile by their Auth User ID (Used on login).
- **POST** `/` : Create a new patient profile.
- **PUT** `/:id` : Update patient profile.
- **DELETE** `/:id` : Remove patient profile.

### **Server-side Files**
- **Route Definitions**: `server/routes/patientRoutes.js`
- **Controller Logic**: `server/controllers/patientController.js`
- **Database Model**: `server/models/Patient.js`

---

## 🗄️ Database Schema (Patient Model)

The patient document is linked to a `User` document via `userId` and contains the following fields:

| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId | Reference to the main auth user account. |
| `dateOfBirth` | Date | Date of birth for medical age calculation. |
| `gender` | Enum | `male`, `female`, `other`. |
| `bloodGroup` | Enum | `O+`, `A+`, `B+`, etc. |
| `address` | Object | Street, City, State, ZIP, Country. |
| `medicalHistory` | Array[String]| List of past medical conditions. |
| `allergies` | Array[String]| List of patient allergies. |
| `height` / `weight`| Number | Physical measurements in cm/kg. |

---

## 🔄 Integration Workflow

If you are moving this folder to a new project:

1. **Copy Folders**:
   - Move `client/src/modules/roles/patient/` to the target project's module dir.
   - Move `client/src/components/patientcomponents/` to target components dir.
2. **Setup Routes**:
   - Add the patient routes to your `AppRoutes` or equivalent router.
   - Ensure the layout component switch logic is implemented.
3. **API Alignment**:
   - Ensure your `axios.js` or API caller instances are configured to match the server URL.
4. **Auth State**:
   - The patient views depend on a `useAuth()` hook to verify the current user's role. Ensure this hook is available in the new project.

---

## 🛡️ Access Control & Permissions

The patient portal uses role-based access control (RBAC):
- **Authorization**: Only users with the `role: 'patient'` assigned in their Auth token can access the `/patient` prefixed routes.
- **Data Protection**: Backend controllers ensure that a patient can only retrieve their own medical records and bills using `req.user.id` comparison.
