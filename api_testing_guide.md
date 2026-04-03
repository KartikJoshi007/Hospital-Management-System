# Testing API with Postman

## 1. Environment Setup
- **Base URL**: `http://localhost:5000/api`
- **Method**: Set the appropriate HTTP method (GET, POST, PUT, DELETE).

## 2. API Endpoints

### 🏥 Doctors (`/doctors`)
| Method | Endpoint | Description | Body (JSON) Example |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Get all doctors | N/A |
| **GET** | `/:id` | Get doctor by ID | N/A |
| **GET** | `/stats` | Get clinic statistics | N/A |
| **POST** | `/` | Create new doctor | `{"name": "Dr. Smith", "specialization": "Cardiology", "qualification": "MD", "experience": 10, "contact": "1234567890", "email": "smith@hospital.com", "fees": 500}` |
| **PUT** | `/:id` | Update doctor | `{"name": "Dr. John Smith", "fees": 600}` |
| **DELETE** | `/:id` | Delete doctor | N/A |

### 💊 Medicines (`/medicines`)
| Method | Endpoint | Description | Body (JSON) Example |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Get all medicines | N/A |
| **GET** | `/stock-alerts`| Low stock alerts | N/A |
| **POST** | `/` | Add medicine | `{"name": "Paracetamol", "quantity": 100, "price": 15}` |
| **PUT** | `/:id` | Update medicine | `{"quantity": 150}` |
| **DELETE** | `/:id` | Delete medicine | N/A |

### 🧾 Billing (`/bills`)
| Method | Endpoint | Description | Body (JSON) Example |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Get all bills | N/A |
| **GET** | `/:id` | Get bill by ID | N/A |
| **GET** | `/revenue` | Revenue report | N/A |
| **POST** | `/` | Create bill | `{"patientId": "65f1a... (Valid MongoID)", "amount": 1200}` |

## 3. How to Test
1. **Start the Server**: Run `npm start` or `npm run dev` in the `server` directory.
2. **Open Postman**:
   - Create a new **Collection** (e.g., "Hospital API").
   - Create an **Environment** with a variable `base_url` set to `http://localhost:5000/api`.
3. **Add Requests**:
   - Use `{{base_url}}/doctors` for doctor requests.
   - For **POST** and **PUT**, go to **Body** -> **raw** -> **JSON** and paste the examples above.
4. **Headers**: Ensure `Content-Type: application/json` is set (Postman usually does this automatically when JSON is selected).
