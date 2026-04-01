import { useState } from "react";

const QueueManagement = () => {
  const [form, setForm] = useState({
    name: "",
    status: "Waiting",
  });

  const [queue, setQueue] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add / Update patient
  const handleSubmit = () => {
    if (!form.name) {
      alert("Patient name is required!");
      return;
    }

    if (editIndex !== null) {
      const updatedQueue = [...queue];
      updatedQueue[editIndex] = form;
      setQueue(updatedQueue);
      setEditIndex(null);
    } else {
      setQueue([...queue, form]);
    }

    setForm({ name: "", status: "Waiting" });
  };

  // Edit patient
  const handleEdit = (index) => {
    setForm(queue[index]);
    setEditIndex(index);
  };

  // Delete patient
  const handleDelete = (index) => {
    const updatedQueue = queue.filter((_, i) => i !== index);
    setQueue(updatedQueue);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="font-bold mb-4">Patient Queue</h2>

      {/* Form */}
      <div className="grid gap-3 mb-4">
        <input
          type="text"
          name="name"
          placeholder="Patient Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="Waiting">Waiting</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <button
          onClick={handleSubmit}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          {editIndex !== null ? "Update Patient" : "Add Patient"}
        </button>
      </div>

      {/* Queue List */}
      <div>
        {queue.length === 0 ? (
          <p className="text-gray-500 text-sm">No patients in queue.</p>
        ) : (
          queue.map((q, index) => (
            <div
              key={index}
              className="flex justify-between items-center border p-3 mb-2 rounded"
            >
              <div>
                <p className="font-semibold">{q.name}</p>
                <p className="text-sm text-blue-500">{q.status}</p>
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

export default QueueManagement;