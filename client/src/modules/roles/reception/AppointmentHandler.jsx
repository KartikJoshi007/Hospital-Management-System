import { useState } from "react";

const AppointmentHandler = () => {
  const [form, setForm] = useState({
    patientName: "",
    doctorName: "",
    date: "",
    time: "",
    status: "Scheduled",
  });

  const [appointments, setAppointments] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add / Update appointment
  const handleSubmit = () => {
    const { patientName, doctorName, date, time } = form;

    if (!patientName || !doctorName || !date || !time) {
      alert("All fields are required!");
      return;
    }

    if (editIndex !== null) {
      const updated = [...appointments];
      updated[editIndex] = form;
      setAppointments(updated);
      setEditIndex(null);
    } else {
      setAppointments([...appointments, form]);
    }

    // Reset form
    setForm({
      patientName: "",
      doctorName: "",
      date: "",
      time: "",
      status: "Scheduled",
    });
  };

  // Edit
  const handleEdit = (index) => {
    setForm(appointments[index]);
    setEditIndex(index);
  };

  // Delete
  const handleDelete = (index) => {
    const updated = appointments.filter((_, i) => i !== index);
    setAppointments(updated);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="font-bold mb-4">Appointment Management</h2>

      {/* Form */}
      <div className="grid gap-3 mb-5">
        <input
          type="text"
          name="patientName"
          placeholder="Patient Name"
          value={form.patientName}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="text"
          name="doctorName"
          placeholder="Doctor Name"
          value={form.doctorName}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {editIndex !== null ? "Update Appointment" : "Book Appointment"}
        </button>
      </div>

      {/* Appointment List */}
      <div>
        {appointments.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No appointments booked yet.
          </p>
        ) : (
          appointments.map((appt, index) => (
            <div
              key={index}
              className="flex justify-between items-center border p-3 mb-2 rounded"
            >
              <div>
                <p className="font-semibold">
                  {appt.patientName} (Dr. {appt.doctorName})
                </p>
                <p className="text-sm text-gray-600">
                  {appt.date} | {appt.time}
                </p>
                <p className="text-sm text-green-600">
                  {appt.status}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(index)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(index)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentHandler;