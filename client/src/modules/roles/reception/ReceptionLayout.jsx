import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import ReceptionSidebar from './ReceptionSidebar'
import ReceptionNavbar from './ReceptionNavbar'

const PAGE_TITLES = {
  '/reception/dashboard': 'Reception Dashboard',
  '/reception/patients': 'Patient Management',
  '/reception/appointments': 'Appointment Handling',
  '/reception/billing': 'Billing & Invoicing',
  '/reception/queue': 'Queue Management',
  '/reception/notifications': 'Notification Center',
}

const getTitle = (pathname) => {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const match = Object.keys(PAGE_TITLES)
    .filter(k => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0]
  return PAGE_TITLES[match] || 'Reception Desk'
}

function ReceptionLayout() {
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside
        className={`shrink-0 border-r border-slate-200 bg-white hidden lg:block transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-72'
        }`}
      >
        <ReceptionSidebar collapsed={collapsed} onToggle={() => setCollapsed(prev => !prev)} />
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <ReceptionNavbar
          title={getTitle(pathname)}
          onToggle={() => setCollapsed(prev => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth text-slate-900">
          <div className="mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default ReceptionLayout