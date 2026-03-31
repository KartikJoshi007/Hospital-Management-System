import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const getPageTitle = (path) => {
  if (path.startsWith('/dashboard')) return 'Hospital Dashboard'
  if (path.startsWith('/patients')) return 'Patient Management'
  if (path.startsWith('/appointments')) return 'Appointment Management'
  if (path.startsWith('/doctors')) return 'Doctor Directory'
  if (path.startsWith('/billing')) return 'Billing Center'
  if (path.startsWith('/pharmacy')) return 'Pharmacy Management'
  return 'Hospital Dashboard'
}

function DashboardLayout() {
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside
        className={`shrink-0 border-r border-slate-200 bg-white hidden lg:block transition-all duration-300 ${collapsed ? 'w-16' : 'w-72'
          }`}
      >
        <Sidebar collapsed={collapsed} />
      </aside>

      {/* Center + Right Section */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          title={getPageTitle(pathname)}
          onToggle={() => setCollapsed(prev => !prev)}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth text-slate-900">
            <div className="mx-auto w-full">
              <Outlet />
            </div>
          </main>

          {/* Right Sidebar - Dashboard Context Stats */}
          {pathname === '/dashboard' && (
            <aside className="w-80 shrink-0 border-l border-slate-200 bg-white overflow-y-auto hidden xl:block p-6 space-y-8">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-900 border-l-4 border-emerald-500 pl-3 uppercase tracking-wider">On-Duty Doctors</h3>
                  <button className="text-[10px] font-black text-emerald-600 hover:underline">All →</button>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Dr. Aryan Mehta', dept: 'Cardiology', status: 'Active', color: 'emerald' },
                    { name: 'Dr. Sneha Verma', dept: 'Neurology', status: 'Active', color: 'emerald' },
                    { name: 'Dr. Rahul Patil', dept: 'Orthopedics', status: 'In OT', color: 'orange' },
                    { name: 'Dr. Nisha Iyer', dept: 'Dermatology', status: 'Active', color: 'emerald' },
                  ].map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/10 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                          {doc.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{doc.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400">{doc.dept}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full bg-${doc.color}-500`}></span>
                        <span className={`text-[10px] font-black text-${doc.color}-600`}>{doc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-900 border-l-4 border-emerald-500 pl-3 uppercase tracking-wider">Hospital Performance</h3>
                  <button className="text-[10px] font-black text-emerald-600 hover:underline">Full report →</button>
                </div>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-emerald-200 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">OPD Collections</span>
                      <span className="text-sm font-black text-slate-900">₹1.2L</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400">47 visits today</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-emerald-200 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">IPD Revenue</span>
                      <span className="text-sm font-black text-slate-900">₹18.4L</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400">183 beds active</p>
                  </div>
                </div>
              </section>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
