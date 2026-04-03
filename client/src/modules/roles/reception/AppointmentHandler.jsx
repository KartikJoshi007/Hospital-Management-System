import { useEffect, useState } from "react";
import API from "../../../api/axios";

const AppointmentHandler = () => {
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  });

  const [appointments, setAppointments] = useState([]);

  // 🔄 Fetch appointments
  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data.data.appointments);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // ✏️ Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ➕ Create appointment
  const handleSubmit = async () => {
    try {
      await API.post("/appointments", form);
      fetchAppointments();
      alert("Appointment created ✅");

      setForm({
        patientId: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    try {
      await API.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="font-bold mb-4">Appointment Management</h2>

      {/* FORM */}
      <div className="grid gap-3 mb-5">
        <input
          type="text"
          name="patientId"
          placeholder="Patient ID"
          value={form.patientId}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="text"
          name="doctorId"
          placeholder="Doctor ID"
          value={form.doctorId}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="date"
          name="appointmentDate"
          value={form.appointmentDate}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="time"
          name="appointmentTime"
          value={form.appointmentTime}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="text"
          name="reason"
          placeholder="Reason"
          value={form.reason}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Book Appointment
        </button>
      </div>

      {/* LIST */}
      <div>
        {appointments.length === 0 ? (
          <p>No appointments</p>
        ) : (
          appointments.map((a) => (
            <div
              key={a._id}
              className="flex justify-between border p-3 mb-2 rounded"
            >
              <div>
                <p className="font-semibold">
                  {a.patientId?.userId?.fullName}
                </p>
                <p className="text-sm">
                  Dr. {a.doctorId?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {a.appointmentDate?.slice(0, 10)} | {a.appointmentTime}
                </p>
                <p className="text-green-600">{a.status}</p>
              </div>

              <button
                onClick={() => handleDelete(a._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentHandler;