import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, CalendarCheck, CreditCard, LogOut, Clock, ClipboardList, User
} from 'lucide-react'
import useAuth from '../../../hooks/useAuth'

const navigation = [
  { to: '/reception/dashboard',    label: 'Dashboard',          icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: '/reception/patients',     label: 'Patients',           icon: <ClipboardList className="h-4 w-4" /> },
  { to: '/reception/appointments', label: 'Appointments',       icon: <CalendarCheck className="h-4 w-4" /> },
  { to: '/reception/billing',      label: 'Billing',            icon: <CreditCard className="h-4 w-4" /> },
  { to: '/reception/queue',        label: 'Queue Status',       icon: <Clock className="h-4 w-4" /> },
]

function ReceptionSidebar({ collapsed, onToggle }) {
  const { pathname } = useLocation()
  const { logout } = useAuth()

  /* ── Collapsed mode ── */
  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center py-6 gap-2">
        <button
          onClick={onToggle}
          className="flex flex-col justify-center gap-1.5 w-8 h-8 shrink-0 group mb-4"
          aria-label="Toggle sidebar"
        >
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-purple-500 transition-colors rounded-full" />
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-purple-500 transition-colors rounded-full" />
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-purple-500 transition-colors rounded-full" />
        </button>

        {navigation.map((item) => {
          const isActive = pathname === item.to
          return (
            <div key={item.to} className="relative group">
              <NavLink
                to={item.to}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-purple-50 text-purple-500 border border-purple-100'
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
      <div className="flex items-center mb-8">
        <button
          onClick={onToggle}
          className="flex flex-col justify-center gap-1.5 w-8 h-8 shrink-0 group"
          aria-label="Toggle sidebar"
        >
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-purple-500 transition-colors rounded-full" />
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-purple-500 transition-colors rounded-full" />
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-purple-500 transition-colors rounded-full" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-purple-50 text-purple-600 shadow-sm border border-purple-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

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

export default ReceptionSidebar
