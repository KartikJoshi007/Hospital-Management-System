# Hospital Management System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Common URL Mistakes
- Correct patient create URL: POST http://localhost:5000/api/patients
- Wrong patient create URL: POST http://localhost:5000/api/auth/patients
- Correct appointment create URL: POST http://localhost:5000/api/appointments
- Wrong appointment create URL: POST http://localhost:5000/api/auth/appointments

Note: Use valid JSON in Postman Body -> raw -> JSON. Do not include inline comments inside JSON.

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication APIs

### Register User
**POST** `/auth/register`
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "phone": "+1234567890",
  "role": "patient" // admin, doctor, patient, staff
}
```
**Response:** Returns user data and JWT token

### Login User
**POST** `/auth/login`
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```
**Response:** Returns user data and JWT token

### Get Current User
**GET** `/auth/me`
- Requires: Authorization header
- Returns: Current user details

### Update Profile
**PUT** `/auth/profile`
- Requires: Authorization header
```json
{
  "fullName": "Jane Doe",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Change Password
**PUT** `/auth/change-password`
- Requires: Authorization header
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

### Logout
**GET** `/auth/logout`
- Requires: Authorization header

### Deactivate Account
**PUT** `/auth/deactivate`
- Requires: Authorization header
- Deactivates user account and clears session

### Get All Users (Admin Only)
**GET** `/auth/users`
- Requires: Authorization header with admin role

### Get User by ID (Admin Only)
**GET** `/auth/users/:id`
- Requires: Authorization header with admin role

---

## 2. Patient APIs

### Create Patient
**POST** `/patients`
- Requires: Authorization header
```json
{
  "userId": "user_id",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "bloodGroup": "O+",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+1234567890"
  },
  "allergies": ["Penicillin", "Shellfish"],
  "medicalHistory": ["Hypertension", "Diabetes"],
  "insurance": {
    "provider": "BlueCross",
    "id": "BC123456789",
    "expiry": "2025-12-31"
  },
  "height": 180,
  "weight": 75
}
```

Working full URL example:
- POST http://localhost:5000/api/patients

### Get All Patients
**GET** `/patients?page=1&limit=10&search=john`
- Requires: Authorization header with admin or doctor role
- Query Parameters:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search by name or email

### Get Patient by ID
**GET** `/patients/:id`
- Requires: Authorization header

### Get Patient by User ID
**GET** `/patients/user/:userId`
- Requires: Authorization header

### Update Patient
**PUT** `/patients/:id`
- Requires: Authorization header with admin or doctor role
```json
{
  "address": { "city": "Boston" },
  "allergies": ["Penicillin"],
  "medicalHistory": ["Hypertension"],
  "height": 180,
  "weight": 75,
  "notes": "Patient notes"
}
```

### Delete Patient
**DELETE** `/patients/:id`
- Requires: Authorization header with admin role

### Get Patient Statistics
**GET** `/patients/stats`
- Requires: Authorization header with admin or doctor role
- Returns: Statistics on gender, blood group, etc.

### Search Patients
**GET** `/patients/search/:query`
- Requires: Authorization header with admin or doctor role
- Returns: Patients matching the search query

---

## 3. Appointment APIs

### Create Appointment
**POST** `/appointments`
- Requires: Authorization header
```json
{
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "appointmentDate": "2025-12-20",
  "appointmentTime": "14:30",
  "reason": "Regular checkup",
  "symptoms": "Fever and cough",
  "duration": 30,
  "isFollowUp": false,
  "followUpAppointmentId": null
}
```

Working full URL example:
- POST http://localhost:5000/api/appointments

### Get All Appointments
**GET** `/appointments?page=1&limit=10&status=scheduled&doctorId=doc_id&date=2025-12-20`
- Requires: Authorization header
- Query Parameters:
  - `page`: Page number
  - `limit`: Items per page
  - `status`: Filter by status (scheduled, completed, cancelled, no-show, rescheduled)
  - `doctorId`: Filter by doctor
  - `patientId`: Filter by patient
  - `date`: Filter by date (YYYY-MM-DD)

### Get Appointment by ID
**GET** `/appointments/:id`
- Requires: Authorization header

### Get Patient Appointments
**GET** `/appointments/patient/:patientId?page=1&limit=10&status=scheduled`
- Requires: Authorization header

### Get Doctor Appointments
**GET** `/appointments/doctor/:doctorId?page=1&limit=10&date=2025-12-20`
- Requires: Authorization header

### Update Appointment
**PUT** `/appointments/:id`
- Requires: Authorization header
```json
{
  "appointmentDate": "2025-12-21",
  "appointmentTime": "15:00",
  "status": "rescheduled",
  "reason": "Regular checkup",
  "symptoms": "Fever",
  "notes": "Doctor's notes after appointment"
}
```

### Cancel Appointment
**PUT** `/appointments/:id/cancel`
- Requires: Authorization header
- Changes appointment status to 'cancelled'

### Delete Appointment
**DELETE** `/appointments/:id`
- Requires: Authorization header with admin or doctor role

### Get Appointment Statistics
**GET** `/appointments/stats`
- Requires: Authorization header with admin or doctor role
- Returns: Statistics by status and doctor

---

## Error Handling

All errors are returned in the following format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [],
  "stack": "Stack trace (only in development)"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

---

## Environment Variables

### Server (.env)
```
MONGO_URI=mongodb://localhost:27017/hospital_management
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
```

### Client (.env.local)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Installation & Setup

### Server Setup
```bash
cd server
npm install
npm run dev
```

### Client Setup
```bash
cd client
npm install
npm run dev
```

---

## Security Notes
- Always change the JWT_SECRET in production
- Use HTTPS in production
- Validate all user inputs
- Use strong passwords
- Implement rate limiting for production
- Store tokens securely in localStorage or cookies
- Implement CSRF protection
