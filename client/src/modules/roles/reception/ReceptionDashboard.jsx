import { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, Clock, CreditCard } from "lucide-react";

const ReceptionDashboard = ({ patients = [], appointments = [], queue = [], bills = [] }) => {

  // 📊 Dynamic Stats
  const stats = useMemo(() => {
    return [
      {
        label: "Total Patients",
        value: patients.length,
        icon: Users,
      },
      {
        label: "Appointments",
        value: appointments.length,
        icon: Calendar,
      },
      {
        label: "Queue",
        value: queue.length,
        icon: Clock,
      },
      {
        label: "Revenue",
        value: `₹${bills.reduce((acc, b) => acc + Number(b.amount || 0), 0)}`,
        icon: CreditCard,
      },
    ];
  }, [patients, appointments, queue, bills]);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Reception Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Hospital Management Overview
          </p>
        </div>

        <div className="text-sm text-gray-500">
          Welcome, Admin 👋
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-5 rounded-xl shadow border cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <item.icon className="text-purple-500" />
              <span className="text-xl font-bold">{item.value}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Recent Appointments */}
        <div className="bg-white p-5 rounded-xl shadow border">
          <h2 className="font-semibold mb-4">Recent Appointments</h2>

          {appointments.length === 0 ? (
            <p className="text-gray-500 text-sm">No appointments</p>
          ) : (
            appointments.slice(0, 5).map((a, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b py-2"
              >
                <div>
                  <p className="font-medium">{a.patientName}</p>
                  <p className="text-xs text-gray-500">
                    {a.date} | {a.time}
                  </p>
                </div>

                <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">
                  {a.status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Queue Status */}
        <div className="bg-white p-5 rounded-xl shadow border">
          <h2 className="font-semibold mb-4">Queue Status</h2>

          {queue.length === 0 ? (
            <p className="text-gray-500 text-sm">No patients in queue</p>
          ) : (
            queue.slice(0, 5).map((q, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b py-2"
              >
                <p>{q.name}</p>
                <span className="text-xs text-blue-500">
                  {q.status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Recent Patients */}
        <div className="bg-white p-5 rounded-xl shadow border">
          <h2 className="font-semibold mb-4">New Patients</h2>

          {patients.length === 0 ? (
            <p className="text-gray-500 text-sm">No patients</p>
          ) : (
            patients.slice(0, 5).map((p, i) => (
              <div
                key={i}
                className="flex justify-between border-b py-2"
              >
                <p>{p.name}</p>
                <span className="text-xs text-gray-500">
                  {p.contact}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Billing Summary */}
        <div className="bg-white p-5 rounded-xl shadow border">
          <h2 className="font-semibold mb-4">Billing Summary</h2>

          {bills.length === 0 ? (
            <p className="text-gray-500 text-sm">No bills generated</p>
          ) : (
            bills.slice(0, 5).map((b, i) => (
              <div
                key={i}
                className="flex justify-between border-b py-2"
              >
                <p>{b.patientName}</p>
                <span className="text-xs text-purple-600">
                  ₹{b.amount}
                </span>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-white p-5 rounded-xl shadow border">
        <h2 className="font-semibold mb-4">Quick Actions</h2>

        <div className="flex flex-wrap gap-3">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Add Patient
          </button>

          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Book Appointment
          </button>

          <button className="bg-purple-500 text-white px-4 py-2 rounded">
            Generate Bill
          </button>

          <button className="bg-orange-500 text-white px-4 py-2 rounded">
            Manage Queue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceptionDashboard;