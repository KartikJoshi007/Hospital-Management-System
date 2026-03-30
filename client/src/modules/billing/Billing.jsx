import React, { useEffect, useState } from "react";
import { getBills, createBill, deleteBill } from "./billingApi";


const Billing = () => {
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    amount: "",
  });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    const data = await getBills();
    setBills(data);
  };

  // CREATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    await createBill({
      patientId: form.patientId,
      amount: Number(form.amount),
    });

    setForm({ patientId: "", amount: "" });
    fetchBills();
  };

  // DELETE
  const handleDelete = async (id) => {
    await deleteBill(id);
    fetchBills();
  };

  return (
    <div className="bg-blue-200 p-6 rounded-xl shadow-lg">

      {/* Form */}
      <h2 className="text-xl font-bold mb-3">Generate Bill</h2>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Patient ID"
          value={form.patientId}
          onChange={(e) =>
            setForm({ ...form, patientId: e.target.value })
          }
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
          className="border p-2 rounded"
        />

        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-500">
            <th>Patient</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {bills.map((bill) => (
            <tr key={bill._id} className="border-t">
              <td>{bill.patientId?.name}</td>
              <td>₹{bill.amount}</td>
              <td>{bill.paymentStatus}</td>

              <td>
                <button
                  onClick={() => handleDelete(bill._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default Billing;