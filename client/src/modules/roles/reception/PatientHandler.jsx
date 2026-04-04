import { useState } from "react";

const PatientHandler = () => {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    contact: "",
    address: "",
  });

  const [patients, setPatients] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add / Update patient
  const handleSubmit = () => {
    const { name, age, contact } = form;

    if (!name || !age || !contact) {
      alert("Name, Age and Contact are required!");
      return;
    }

    if (editIndex !== null) {
      const updated = [...patients];
      updated[editIndex] = form;
      setPatients(updated);
      setEditIndex(null);
    } else {
      setPatients([...patients, form]);
    }

    // Reset form
    setForm({
      name: "",
      age: "",
      gender: "Male",
      contact: "",
      address: "",
    });
  };

  // Edit
  const handleEdit = (index) => {
    setForm(patients[index]);
    setEditIndex(index);
  };

  // Delete
  const handleDelete = (index) => {
    const updated = patients.filter((_, i) => i !== index);
    setPatients(updated);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="font-bold mb-4">Patient Management</h2>

      {/* Form */}
      <div className="grid gap-3 mb-5">
        <input
          type="text"
          name="name"
          placeholder="Patient Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="number"
          name="age"
          min="1"
          max="130"
          step="1"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={form.contact}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <textarea
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editIndex !== null ? "Update Patient" : "Register Patient"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Age</th>
              <th className="p-2 border">Gender</th>
              <th className="p-2 border">Contact</th>
              <th className="p-2 border">Address</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-3 text-gray-500">
                  No patients registered
                </td>
              </tr>
            ) : (
              patients.map((p, index) => (
                <tr key={index} className="text-center">
                  <td className="p-2 border">{p.name}</td>
                  <td className="p-2 border">{p.age}</td>
                  <td className="p-2 border">{p.gender}</td>
                  <td className="p-2 border">{p.contact}</td>
                  <td className="p-2 border">{p.address}</td>

                  <td className="p-2 border">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(index)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientHandler;