import { useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { 
  LogOut, 
  Activity, 
  Calendar, 
  FileText, 
  CreditCard, 
  UserCircle,
  Plus
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuth from '../../hooks/useAuth'

const patientNavigation = [
  {
    to: '/patient/dashboard',
    label: 'Home',
    icon: <Activity className="h-4 w-4" />
  },
  {
    to: '/patient/appointments',
    label: 'Appointments',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    to: '/patient/records',
    label: 'My Records',
    icon: <FileText className="h-4 w-4" />
  },
  {
    to: '/patient/billing',
    label: 'My Bills',
    icon: <CreditCard className="h-4 w-4" />
  },
]

function PatientSidebar({ collapsed, onToggle }) {
  const { pathname } = useLocation()
  const { logout, user } = useAuth()

  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center py-6 gap-2">
        {/* Toggle Button */}
         <button
          onClick={onToggle}
          className="flex flex-col justify-center gap-1.5 w-8 h-8 shrink-0 group mb-6"
          aria-label="Toggle sidebar"
        >
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-emerald-500 transition-colors rounded-full" />
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-emerald-500 transition-colors rounded-full" />
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-emerald-500 transition-colors rounded-full" />
        </button>

        {/* Logo/Icon icon */}
        <Link to="/patient/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-emerald-500 shadow-xl mb-10 group">
          <Activity className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </Link>

        {patientNavigation.map((item) => {
          const isActive = pathname === item.to

          return (
            <div key={item.to} className="relative group">
              <NavLink
                to={item.to}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-500 border border-emerald-100 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                {item.icon}
              </NavLink>
              {/* Tooltip */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-slate-700">
                  {item.label}
                </div>
              </div>
            </div>
          )
        })}

        {/* Logout icon */}
        <div className="mt-auto relative group">
          <button 
            onClick={logout}
            className="h-10 w-10 shrink-0 rounded-xl bg-rose-50 hover:bg-rose-500 flex items-center justify-center text-rose-500 hover:text-white transition-all shadow-sm"
          >
            <LogOut size={18} />
          </button>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-slate-700">
                  Logout
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-6">
      {/* Top Header with Toggle and Patient Info */}
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

        {/* Patient info card */}
        <div className="flex-1 px-3 py-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-950 flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
             <Activity size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-900 truncate capitalize">{user?.name?.split(' ')[0] || 'Patient'}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
        {patientNavigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 border ${isActive
                ? 'bg-emerald-50 text-emerald-600 shadow-sm border-emerald-100'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <span className={`shrink-0 ${item.icon ? (pathname === item.to ? 'text-emerald-500' : 'text-slate-400') : ''}`}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </div>
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

export default PatientSidebar
