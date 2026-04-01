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
  {
    to: '/patient/profile',
    label: 'My Profile',
    icon: <UserCircle className="h-4 w-4" />
  },
]

function PatientSidebar({ collapsed }) {
  const { pathname } = useLocation()

  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center py-6 gap-2">
        {/* Logo icon */}
        <Link to="/patient/dashboard" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 mb-10 group">
          <Activity className="h-6 w-6 group-hover:scale-110 transition-transform" />
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
          <Link to="/sign-in" className="h-10 w-10 shrink-0 rounded-xl bg-rose-50 hover:bg-rose-500 flex items-center justify-center text-rose-500 hover:text-white transition-all shadow-sm">
            <LogOut size={18} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-6">
      {/* Patient Logo */}
      <Link to="/patient/dashboard" className="flex items-center gap-3 mb-10 px-2 text-emerald-500 group no-underline">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F172A] text-emerald-400 shadow-xl group-hover:rotate-12 transition-transform">
           <Activity size={24} />
        </div>
        <div className="flex flex-col">
            <span className="text-lg font-black uppercase tracking-[0.15em] text-[#0F172A] leading-none">PATIENT</span>
            <span className="text-[10px] font-black text-emerald-500 leading-none mt-1 uppercase tracking-widest">Portal</span>
        </div>
      </Link>

      <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        {patientNavigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center justify-between rounded-xl px-4 py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-200 border ${isActive
                ? 'bg-emerald-50 text-emerald-600 shadow-sm border-emerald-100'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Logout etc */}
      <div className="mt-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden group mb-6">
         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Activity size={60} strokeWidth={1} />
         </div>
         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</h4>
         <div className="flex items-center gap-1.5 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-black text-slate-900 uppercase">Connected</span>
         </div>
      </div>

      <div className="mt-auto border-t border-slate-100 pt-6 px-2">
        <Link 
          to="/sign-in"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/20 transition-all font-black text-xs uppercase tracking-widest border border-rose-100/50"
        >
          <LogOut size={16} className="shrink-0" />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  )
}

export default PatientSidebar
