import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import usePatients from '../hooks/usePatients'

function Navbar({ title, onToggle }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { patients } = usePatients()
  const searchRef = useRef(null)
  const navigate = useNavigate()

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Static doctors for global search
  const mockDoctors = [
    { name: 'Dr. Aryan Mehta', spec: 'Cardiology' },
    { name: 'Dr. Sneha Verma', spec: 'Neurology' },
    { name: 'Dr. Rahul Patil', spec: 'Orthopedics' },
    { name: 'Dr. Nisha Iyer', spec: 'Dermatology' }
  ]

  const term = searchTerm.trim().toLowerCase()
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(term) || p.contact?.includes(term)
  ).slice(0, 3)
  
  const filteredDoctors = mockDoctors.filter(d => 
    d.name.toLowerCase().includes(term) || d.spec.toLowerCase().includes(term)
  ).slice(0, 3)

  const handleResultClick = (route) => {
    navigate(route)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <header className="flex h-16 w-full items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        {/* Hamburger Toggle */}
        <button
          onClick={onToggle}
          className="flex flex-col justify-center gap-1.5 w-8 h-8 shrink-0 group"
          aria-label="Toggle sidebar"
        >
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-emerald-500 transition-colors rounded-full"></span>
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-emerald-500 transition-colors rounded-full"></span>
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-emerald-500 transition-colors rounded-full"></span>
        </button>

        <h1 className="text-lg font-black text-slate-900 tracking-tight">{title}</h1>

        {/* Search Bar */}
        <div className="hidden md:flex items-center max-w-md w-full relative group" ref={searchRef}>
          <svg className="absolute left-4 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search patients, doctors..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full bg-slate-50 border border-transparent rounded-xl py-2 pl-11 pr-4 text-xs font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50"
          />

          {/* Autocomplete Dropdown */}
          {isOpen && searchTerm.trim() && (
            <div className="absolute top-[3.25rem] left-0 w-full bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 transform origin-top animate-in fade-in zoom-in-95 duration-200">
              {filteredPatients.length === 0 && filteredDoctors.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs font-bold text-slate-400 leading-relaxed">
                    No matching records <br/> found for "{searchTerm}"
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {/* Patients Section */}
                  {filteredPatients.length > 0 && (
                    <div>
                      <div className="px-4 py-2 flex items-center gap-2 bg-slate-50/50">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Patients</span>
                      </div>
                      <div className="flex flex-col">
                        {filteredPatients.map((p) => (
                          <button
                            key={p.id || p._id}
                            onClick={() => handleResultClick('/patients')}
                            className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors flex items-center gap-3 group/item border-b border-transparent last:border-b-empty"
                          >
                            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black shrink-0 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-colors">
                              {p.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-slate-900 truncate">{p.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">ID: {p.id || p._id} • {p.contact}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctors Section */}
                  {filteredDoctors.length > 0 && (
                    <div>
                      <div className="px-4 py-2 flex items-center gap-2 bg-slate-50/50 border-t border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Doctors</span>
                      </div>
                      <div className="flex flex-col">
                        {filteredDoctors.map((d, i) => (
                          <button
                            key={i}
                            onClick={() => handleResultClick('/doctors')}
                            className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors flex items-center gap-3 group/item"
                          >
                            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black shrink-0 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-colors">
                              {d.name.split(' ').slice(1).map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-slate-900 truncate">{d.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{d.spec}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Date Time */}
        <div className="hidden lg:block text-right">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{today}</p>
        </div>

        {/* Profile Card */}
        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200 hover:border-emerald-500 hover:scale-105 transition-all cursor-pointer overflow-hidden group shadow-sm">
          <img
            src={`https://ui-avatars.com/api/?name=Admin&background=10b981&color=fff&bold=true`}
            alt="Profile"
            className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all"
          />
        </div>
      </div>
    </header>
  )
}

export default Navbar
