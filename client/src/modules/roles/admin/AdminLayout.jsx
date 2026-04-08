import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminNavbar from './AdminNavbar'

const PAGE_TITLES = {
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/users': 'User Management',
  '/admin/roles': 'Role Management',
  '/admin/doctors': 'Doctor Management',
  '/admin/doctors/add': 'Add Doctor',
  '/admin/patients': 'Patient Management',
  '/admin/appointments': 'Appointment Management',
  '/admin/billing': 'Billing & Finance',
  '/admin/profile': 'My Profile',
  '/admin/notifications': 'Notification Center',
}

const getTitle = (pathname) => {
  // exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // prefix match for nested routes
  const match = Object.keys(PAGE_TITLES)
    .filter(k => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0]
  return PAGE_TITLES[match] || 'Admin Panel'
}

function AdminLayout() {
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
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(prev => !prev)} />
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar
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

export default AdminLayout
