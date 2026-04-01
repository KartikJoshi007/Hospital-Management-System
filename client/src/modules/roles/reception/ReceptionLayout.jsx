import { Outlet, Link } from "react-router-dom";

const ReceptionLayout = () => {
  return (
    <div className="flex">

      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white min-h-screen p-4">
        <h2 className="font-bold mb-4">Reception</h2>

      

<li><Link to="/reception/dashboard">Dashboard</Link></li>
<li><Link to="/reception/patients">Patients</Link></li>
<li><Link to="/reception/appointments">Appointments</Link></li>
<li><Link to="/reception/billing">Billing</Link></li>
      </div>

      {/* Main */}
      <div className="flex-1 p-4">
        <Outlet />
      </div>

    </div>
  );
};

export default ReceptionLayout;