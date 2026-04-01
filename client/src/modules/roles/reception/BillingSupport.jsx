import { useState } from "react";

const BillingSupport = () => {
  const [form, setForm] = useState({
    patientName: "",
    service: "",
    amount: "",
  });

  const [bills, setBills] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or Update bill
  const handleSubmit = () => {
    if (!form.patientName || !form.service || !form.amount) {
      alert("All fields are required!");
      return;
    }

    if (editIndex !== null) {
      const updatedBills = [...bills];
      updatedBills[editIndex] = form;
      setBills(updatedBills);
      setEditIndex(null);
    } else {
      setBills([...bills, form]);
    }

    setForm({ patientName: "", service: "", amount: "" });
  };

  // Edit bill
  const handleEdit = (index) => {
    setForm(bills[index]);
    setEditIndex(index);
  };

  // Delete bill
  const handleDelete = (index) => {
    const updatedBills = bills.filter((_, i) => i !== index);
    setBills(updatedBills);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="font-bold mb-4">Billing Support</h2>

      {/* Form */}
      <div className="grid gap-3 mb-4">
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
          name="service"
          placeholder="Service (e.g. X-Ray)"
          value={form.service}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <button
          onClick={handleSubmit}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          {editIndex !== null ? "Update Bill" : "Generate Bill"}
        </button>
      </div>

      {/* Bills List */}
      <div>
        {bills.length === 0 ? (
          <p className="text-gray-500 text-sm">No bills generated yet.</p>
        ) : (
          bills.map((bill, index) => (
            <div
              key={index}
              className="flex justify-between items-center border p-3 mb-2 rounded"
            >
              <div>
                <p className="font-semibold">{bill.patientName}</p>
                <p className="text-sm text-gray-600">
                  {bill.service} - ₹{bill.amount}
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

export default BillingSupport;