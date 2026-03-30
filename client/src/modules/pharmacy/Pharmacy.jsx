import React, { useEffect, useState } from "react";
import {
  getMedicines,
  addMedicine,
  deleteMedicine,
  getLowStock,
} from "./pharmacyApi";

const Pharmacy = () => {
  const [medicines, setMedicines] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    price: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getMedicines();
    const alerts = await getLowStock();

    setMedicines(data);
    setLowStock(alerts);
  };

  // ADD
  const handleSubmit = async (e) => {
    e.preventDefault();

    await addMedicine({
      name: form.name,
      quantity: Number(form.quantity),
      price: Number(form.price),
    });

    setForm({ name: "", quantity: "", price: "" });
    fetchData();
  };

  // DELETE
  const handleDelete = async (id) => {
    await deleteMedicine(id);
    fetchData();
  };

  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">

      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-xl mb-4">
        <h2 className="text-xl font-semibold">💊 Pharmacy Management</h2>
        <p className="text-sm opacity-80">Manage medicines & stock</p>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
          ⚠ Low Stock: {lowStock.map((m) => m.name).join(", ")}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-2 mb-4"
      >
        <input
          type="text"
          placeholder="Medicine Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="border p-2 rounded w-full md:w-auto"
        />

        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.value })
          }
          className="border p-2 rounded w-full md:w-auto"
        />

        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: e.target.value })
          }
          className="border p-2 rounded w-full md:w-auto"
        />

        <button className="bg-green-500 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="text-gray-500 text-sm text-left">
              <th>Name</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {medicines.map((med) => (
              <tr key={med._id} className="border-t hover:bg-gray-50">
                <td className="py-3 font-medium">{med.name}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      med.quantity < 10
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {med.quantity} units
                  </span>
                </td>

                <td className="font-semibold">₹{med.price}</td>

                <td>
                  <button
                    onClick={() => handleDelete(med._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pharmacy;