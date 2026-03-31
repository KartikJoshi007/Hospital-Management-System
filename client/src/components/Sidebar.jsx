import { useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'

const navigation = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
  },
  {
    label: 'Patients',
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    children: [
      { to: '/patients/record', label: 'All Records' },
      { to: '/patients/add', label: 'New Patient' },
    ]
  },
  {
    label: 'Appointments',
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    children: [
      { to: '/appointments/calendar', label: 'Calendar' },
      { to: '/appointments/view', label: 'Table View' },
      { to: '/appointments/book', label: 'Register' },
    ]
  },
  {
    to: '/doctors',
    label: 'Doctors',
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  },
  {
    to: '/billing',
    label: 'Billing',
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  {
    to: '/pharmacy',
    label: 'Pharmacy',
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.812.683c-.328.328-.328.859 0 1.187l1.187 1.187a2 2 0 001.187.583l2.387.477a6 6 0 003.86-.517l.318-.158a6 6 0 013.86-.517l2.387.477a2 2 0 001.187-.583l1.187-1.187a2 2 0 00.582-1.187l-.477-2.387z" /></svg>
  },
]

function Sidebar({ collapsed }) {
  const { pathname } = useLocation()
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
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-200 mb-6">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
              </NavLink>
              {/* Tooltip */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                  {item.label}
                </div>
              </div>
            </div>
          )
        })}

        {/* Logout icon */}
        <div className="mt-auto relative group">
          <Link to="/sign-in" className="h-10 w-10 shrink-0 rounded-lg border border-transparent bg-rose-50 hover:bg-rose-500 hover:border-rose-400 flex items-center justify-center text-rose-500 hover:text-white font-black text-xs transition-all shadow-sm">
            <LogOut size={18} />
          </Link>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
              Logout
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2 text-emerald-500">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-200">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <span className="text-xl font-black uppercase tracking-widest text-[#0F172A]">HMS</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
        {navigation.map((item) => {
          if (item.children) {
            const isOpen = openMenus[item.label]
            const isParentActive = item.children.some(child => pathname === child.to)

            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isParentActive
                    ? 'bg-slate-50 text-slate-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`shrink-0 ${isParentActive ? 'text-emerald-500' : ''}`}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="space-y-1 ml-4 border-l-2 border-slate-100 pl-2">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `flex items-center rounded-lg px-4 py-2 text-[12px] font-bold transition-all duration-200 ${isActive
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
                `group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isActive
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
