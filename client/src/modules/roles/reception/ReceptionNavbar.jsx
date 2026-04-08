import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import API from '../../../api/axios'
import { Bell, X, CalendarClock, CheckCircle2, Ban, Calendar } from 'lucide-react'

function ReceptionNavbar({ title, onToggle }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [bellOpen, setBellOpen] = useState(false)
  const searchRef = useRef(null)
  const bellRef = useRef(null)
  const prevSnapshotRef = useRef(null) // null = first load, skip diff — map of id → status
  const navigate = useNavigate()
  const { user } = useAuth()

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  // close search dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // close bell dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // poll all appointments every 30s — detect cancellations, new bookings, reschedules
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await API.get('/appointments', { params: { limit: 200 } })
        const data = res.data?.data
        const fresh = Array.isArray(data) ? data : (data?.appointments || [])

        if (prevSnapshotRef.current === null) {
          // first load — build snapshot map of id → status, no notifications
          prevSnapshotRef.current = Object.fromEntries(fresh.map(a => [a._id, a.status]))
          return
        }

        const prev = prevSnapshotRef.current
        const newNotifs = []

        fresh.forEach(a => {
          const prevStatus = prev[a._id]

          if (prevStatus === undefined) {
            // brand new appointment booked by doctor
            newNotifs.push({ ...a, _notifId: a._id + Date.now(), _type: 'new' })
          } else if (prevStatus !== 'Cancelled' && a.status === 'Cancelled') {
            // existing appointment just got cancelled
            newNotifs.push({ ...a, _notifId: a._id + Date.now(), _type: 'cancelled' })
          } else if (prevStatus === 'Cancelled' && a.status === 'Scheduled') {
            // cancelled appointment just got rescheduled
            newNotifs.push({ ...a, _notifId: a._id + Date.now(), _type: 'rescheduled' })
          }
        })

        if (newNotifs.length > 0) {
          setNotifications(prev => [...newNotifs, ...prev])
        }

        // update snapshot with latest statuses
        prevSnapshotRef.current = Object.fromEntries(fresh.map(a => [a._id, a.status]))
      } catch {
        // silent fail — polling should never break the UI
      }
    }

    poll()
    const interval = setInterval(poll, 30000)
    return () => clearInterval(interval)
  }, [])

  const dismissNotification = (notifId) => {
    setNotifications(prev => prev.filter(n => n._notifId !== notifId))
  }

  const clearAll = () => setNotifications([])

  const quickLinks = [
    { label: 'Register Patients', path: '/reception/patients' },
    { label: 'Book Appointment', path: '/reception/appointments' },
    { label: 'Check Queue Status', path: '/reception/queue' },
    { label: 'Generate Billing', path: '/reception/billing' },
  ]

  const filtered = quickLinks.filter(l =>
    l.label.toLowerCase().includes(searchTerm.trim().toLowerCase())
  )

  return (
    <header className="flex h-16 w-full items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        
        {/* Search */}
        <div className="hidden md:flex items-center max-w-md w-full relative group" ref={searchRef}>
          <svg className="absolute left-4 h-4 w-4 text-slate-400 group-focus-within:text-purple-500 transition-colors pointer-events-none z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search reception tools..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true) }}
            onFocus={() => setIsOpen(true)}
            className="w-full bg-slate-50 border border-transparent rounded-xl py-2 pl-11 pr-4 text-xs font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-50"
          />

          {isOpen && searchTerm.trim() && (
            <div className="absolute top-[3.25rem] left-0 w-full bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50">
              {filtered.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs font-bold text-slate-400">No results for "{searchTerm}"</p>
                </div>
              ) : (
                <div className="py-2">
                  <div className="px-4 py-2 bg-slate-50/50">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reception Actions</span>
                  </div>
                  {filtered.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => { navigate(link.path); setIsOpen(false); setSearchTerm('') }}
                      className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors flex items-center gap-3 group/item"
                    >
                      <div className="h-7 w-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black shrink-0 group-hover/item:bg-purple-500 group-hover/item:text-white transition-colors">
                        {link.label.charAt(0)}
                      </div>
                      <p className="text-sm font-black text-slate-900">{link.label}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Date */}
        <div className="hidden lg:block text-right">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{today}</p>
        </div>

        {/* Notification Bell */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen(prev => !prev)}
            className="relative h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:border-purple-300 hover:text-purple-600 transition-all"
          >
            <Bell size={16} />
            {notifications.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Activity Alerts</p>
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="text-[9px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors">
                    Clear All
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell size={20} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">All caught up</p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {notifications.map(n => {
                    const config = {
                      cancelled:   { bg: 'bg-rose-100',   text: 'text-rose-600',   icon: <Ban size={10} />,          label: 'Cancelled',   action: 'Reschedule',  actionColor: 'text-amber-600 hover:text-amber-700' },
                      new:         { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: <Calendar size={10} />,     label: 'New Booking', action: 'View',        actionColor: 'text-blue-600 hover:text-blue-700' },
                      rescheduled: { bg: 'bg-blue-100',   text: 'text-blue-600',   icon: <CalendarClock size={10} />, label: 'Rescheduled', action: 'View',        actionColor: 'text-blue-600 hover:text-blue-700' },
                    }[n._type] || { bg: 'bg-slate-100', text: 'text-slate-600', icon: <Bell size={10} />, label: 'Update', action: 'View', actionColor: 'text-slate-600' }

                    return (
                      <div key={n._notifId} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                        <div className={`h-8 w-8 rounded-lg ${config.bg} ${config.text} flex items-center justify-center text-xs font-black shrink-0 mt-0.5`}>
                          {n.patient?.charAt(0) || 'P'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${config.text}`}>
                              {config.icon}{config.label}
                            </span>
                          </div>
                          <p className="text-xs font-black text-slate-900 truncate">{n.patient}</p>
                          <p className="text-[10px] font-bold text-slate-400 truncate">Dr. {n.doctor} · {new Date(n.date).toLocaleDateString()}</p>
                          <button
                            onClick={() => { navigate('/reception/appointments'); setBellOpen(false) }}
                            className={`mt-1.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${config.actionColor}`}
                          >
                            <CalendarClock size={10} /> {config.action}
                          </button>
                        </div>
                        <button onClick={() => dismissNotification(n._notifId)} className="text-slate-300 hover:text-rose-400 transition-colors shrink-0 mt-0.5">
                          <X size={12} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right mr-2 hidden sm:block">
            <p className="text-xs font-black text-slate-900">{user?.fullName || 'Reception'}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Front Desk</p>
          </div>
          <div
            className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200 hover:border-purple-500 hover:scale-105 transition-all cursor-pointer overflow-hidden group shadow-sm"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${user?.fullName || 'Reception'}&background=8b5cf6&color=fff&bold=true`}
              alt="Profile"
              className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default ReceptionNavbar
