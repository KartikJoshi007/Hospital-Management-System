import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'

function ReceptionNavbar({ title, onToggle }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
