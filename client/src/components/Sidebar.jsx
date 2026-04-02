import { useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { 
  LogOut, 
  Users, 
  Calendar, 
  CreditCard, 
  ShoppingBag, 
  LayoutDashboard 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const adminNavigation = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />
  },
  {
    label: 'Patients',
    icon: <Users className="h-4 w-4" />,
    children: [
      { to: '/patients/record', label: 'All Records' },
      { to: '/patients/add', label: 'New Patient' },
    ]
  },
  {
    label: 'Appointments',
    icon: <Calendar className="h-4 w-4" />,
    children: [
      { to: '/appointments/calendar', label: 'Calendar' },
      { to: '/appointments/view', label: 'Table View' },
      { to: '/appointments/book', label: 'Register' },
    ]
  },
  {
    to: '/doctors',
    label: 'Doctors',
    icon: <Users className="h-4 w-4" />
  },
  {
    to: '/billing',
    label: 'Billing',
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    to: '/pharmacy',
    label: 'Pharmacy',
    icon: <ShoppingBag className="h-4 w-4" />
  },
]

function Sidebar({ collapsed }) {
  const { pathname } = useLocation()
  
  const navigation = adminNavigation

  const [openMenus, setOpenMenus] = useState({
    Patients: pathname.startsWith('/patients'),
    Appointments: pathname.startsWith('/appointments')
  })

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }))
  }

  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center py-6 gap-2">
        {/* Logo icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-200 mb-6 group cursor-pointer">
          <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>

        {navigation.map((item) => {
          const to = item.to || (item.children ? item.children[0].to : '#')
          const isActive = item.to ? pathname === item.to : item.children?.some(c => pathname === c.to)

          return (
            <div key={item.label || item.to} className="relative group">
              <NavLink
                to={to}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${isActive
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
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 mb-10 px-2 text-emerald-500 group no-underline">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black uppercase tracking-[0.2em] text-[#0F172A] leading-none">HMS</span>
          <span className="text-[10px] font-bold text-slate-400 leading-none mt-1">Hospital Core</span>
        </div>
      </Link>

      <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        {navigation.map((item) => {
          if (item.children) {
            const isOpen = openMenus[item.label]
            const isParentActive = item.children.some(child => pathname === child.to)

            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full group flex items-center justify-between rounded-xl px-4 py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-200 ${isParentActive
                    ? 'bg-slate-50 text-slate-900 border border-slate-100/50 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`shrink-0 ${isParentActive ? 'text-emerald-500' : ''}`}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className={`h-3 w-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-1 ml-4 border-l-2 border-slate-100 pl-2 overflow-hidden"
                    >
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) =>
                            `flex items-center rounded-lg px-4 py-2.5 text-[11px] font-bold transition-all duration-200 ${isActive
                              ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100'
                              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700 border border-transparent'
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          }

          return (
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
          )
        })}
      </nav>

      {/* Logout button */}
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

export default Sidebar
