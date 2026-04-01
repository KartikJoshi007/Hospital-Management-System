import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, ShieldCheck, Stethoscope,
  ClipboardList, CalendarCheck, CreditCard, UserCircle, LogOut
} from 'lucide-react'
import useAuth from '../../../hooks/useAuth'

const navigation = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    to: '/admin/users',
    label: 'User Management',
    icon: <Users className="h-4 w-4" />,
  },
  {
    to: '/admin/roles',
    label: 'Role Management',
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    label: 'Doctor Management',
    icon: <Stethoscope className="h-4 w-4" />,
    children: [
      { to: '/admin/doctors', label: 'All Doctors' },
      { to: '/admin/doctors/add', label: 'Add Doctor' },
    ],
  },
  {
    label: 'Patient Management',
    icon: <ClipboardList className="h-4 w-4" />,
    children: [
      { to: '/admin/patients', label: 'All Patients' },
    ],
  },
  {
    label: 'Appointments',
    icon: <CalendarCheck className="h-4 w-4" />,
    children: [
      { to: '/admin/appointments', label: 'All Appointments' },
    ],
  },
  {
    to: '/admin/billing',
    label: 'Billing & Finance',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    to: '/admin/profile',
    label: 'My Profile',
    icon: <UserCircle className="h-4 w-4" />,
  },
]

function AdminSidebar({ collapsed, onToggle }) {
  const { pathname } = useLocation()
  const { logout, user } = useAuth()

  const initOpen = navigation.reduce((acc, item) => {
    if (item.children) {
      acc[item.label] = item.children.some(c => pathname.startsWith(c.to))
    }
    return acc
  }, {})

  const [openMenus, setOpenMenus] = useState(initOpen)

  const toggle = (label) => setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }))

  /* ── Collapsed mode ── */
  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center py-6 gap-2">
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="flex flex-col justify-center gap-1.5 w-8 h-8 shrink-0 group mb-4"
          aria-label="Toggle sidebar"
        >
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-emerald-500 transition-colors rounded-full" />
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-emerald-500 transition-colors rounded-full" />
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-emerald-500 transition-colors rounded-full" />
        </button>

        {/* Admin Avatar in Collapsed Mode */}
        <div className="mb-4 relative group">
          <img
            src={`https://ui-avatars.com/api/?name=Admin&background=10b981&color=fff&bold=true`}
            alt="admin"
            className="h-10 w-10 rounded-xl object-cover shrink-0"
          />
          <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
              <p className="font-black">Admin</p>
              <p className="text-[9px] mt-0.5">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {navigation.map((item) => {
          const to = item.to || item.children?.[0]?.to || '#'
          const isActive = item.to
            ? pathname === item.to
            : item.children?.some(c => pathname.startsWith(c.to))

          return (
            <div key={item.label || item.to} className="relative group">
              <NavLink
                to={to}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
              </NavLink>
              <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                  {item.label}
                </div>
              </div>
            </div>
          )
        })}

        {/* Logout */}
        <div className="mt-auto relative group">
          <button
            onClick={logout}
            className="h-10 w-10 shrink-0 rounded-lg border border-transparent bg-rose-50 hover:bg-rose-500 hover:border-rose-400 flex items-center justify-center text-rose-500 hover:text-white transition-all shadow-sm"
          >
            <LogOut size={18} />
          </button>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
              Logout
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Expanded mode ── */
  return (
    <div className="flex h-full flex-col p-6">
      {/* Top Header with Toggle and Admin Info */}
      <div className="flex items-center gap-4 mb-8">
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="flex flex-col justify-center gap-1.5 w-8 h-8 shrink-0 group"
          aria-label="Toggle sidebar"
        >
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-emerald-500 transition-colors rounded-full" />
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-emerald-500 transition-colors rounded-full" />
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-emerald-500 transition-colors rounded-full" />
        </button>

        {/* Admin info card */}
        <div className="flex-1 px-3 py-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=Admin&background=10b981&color=fff&bold=true`}
            alt="admin"
            className="h-9 w-9 rounded-xl object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-900 truncate">Admin</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
        {navigation.map((item) => {
          if (item.children) {
            const isOpen = openMenus[item.label]
            const isParentActive = item.children.some(c => pathname.startsWith(c.to))

            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggle(item.label)}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                    isParentActive
                      ? 'bg-slate-50 text-slate-900'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`shrink-0 ${isParentActive ? 'text-emerald-500' : ''}`}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <svg
                    className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="space-y-1 ml-4 border-l-2 border-slate-100 pl-2">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `flex items-center rounded-lg px-4 py-2 text-[12px] font-bold transition-all duration-200 ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
            </NavLink>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto border-t border-slate-100 pt-6 px-2">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/20 transition-all font-black text-xs uppercase tracking-widest border border-rose-100/50"
        >
          <LogOut size={16} className="shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar
