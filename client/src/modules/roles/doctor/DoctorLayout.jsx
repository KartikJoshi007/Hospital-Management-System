import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import DoctorSidebar from './DoctorSidebar'
import DoctorNavbar from './DoctorNavbar'

const PAGE_TITLES = {
  '/doctor/dashboard': 'Doctor Dashboard',
  '/doctor/appointments': 'My Appointments',
  '/doctor/patients': 'My Patients',
  '/doctor/schedule': 'My Schedule',
  '/doctor/profile':   'My Profile',
  '/doctor/medical-records': 'Medical Records',
}

const getTitle = (pathname) => {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const match = Object.keys(PAGE_TITLES).filter(k => pathname.startsWith(k)).sort((a, b) => b.length - a.length)[0]
  return PAGE_TITLES[match] || 'Doctor Portal'
}

function DoctorLayout() {
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      <aside className={`shrink-0 border-r border-slate-200 bg-white hidden lg:block transition-all duration-300 ${collapsed ? 'w-16' : 'w-72'}`}>
        <DoctorSidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <DoctorNavbar title={getTitle(pathname)} onToggle={() => setCollapsed(p => !p)} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth text-slate-900">
          <div className="mx-auto w-full"><Outlet /></div>
        </main>
      </div>
    </div>
  )
}

export default DoctorLayout
