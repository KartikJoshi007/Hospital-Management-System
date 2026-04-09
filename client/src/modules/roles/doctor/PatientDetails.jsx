import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Eye, Loader2, AlertCircle, ChevronDown } from 'lucide-react'
import DoctorPatientModal from './DoctorPatientModal'
import { getAllPatients } from '../../patients/patientApi'
import { getPatientAppointments } from '../../appointments/appointmentApi'

const STATUS_COLORS = {
  Active:     'bg-emerald-50 text-emerald-600 border-emerald-100',
  Admitted:   'bg-blue-50 text-blue-600 border-blue-100',
  Discharged: 'bg-slate-50 text-slate-500 border-slate-100',
}

function PatientDetails() {
  const [patients,  setPatients]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [search,    setSearch]    = useState('')
  const [gender,    setGender]    = useState('')
  const [selected,  setSelected]  = useState(null)

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res  = await getAllPatients(1, 100, search, gender, '')
      const data = res?.data?.data ?? res?.data ?? {}
      const list = Array.isArray(data) ? data : (data?.patients ?? [])
      setPatients(list)
    } catch (err) {
      setError(err?.message || 'Failed to load patients')
    } finally {
      setLoading(false)
    }
  }, [search, gender])

  // debounce search, instant for status
  useEffect(() => {
    const t = setTimeout(() => fetchPatients(), search ? 400 : 0)
    return () => clearTimeout(t)
  }, [fetchPatients, search, gender])

  const openPatient = async (p) => {
    // start with '...' while we fetch, so modal opens instantly
    setSelected({
      ...p,
      id:            p._id,
      blood:         p.bloodGroup,
      condition:     p.medicalHistory || 'No known conditions',
      lastVisit:     p.lastVisit  ? new Date(p.lastVisit).toISOString().slice(0, 10)
                   : p.updatedAt ? new Date(p.updatedAt).toISOString().slice(0, 10)
                   : '—',
      admissionDate: p.admissionDate ? new Date(p.admissionDate).toISOString().slice(0, 10) : '—',
      totalVisits:   '...',
      nextVisit:     null,
      appointments:  [],
      phone:         p.contact,
      address:       p.address || '—',
      department:    p.department || '—',
      notes:         p.medicalHistory || 'No notes available.',
      vitals:        p.vitals || null,
    })

    try {
      const res  = await getPatientAppointments(p._id, 1, 1000)
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.appointments ?? [])
      const todayStr = new Date().toISOString().slice(0, 10)
      const completed = list.filter(a => a.status === 'Completed').length
      const nextAppt  = list
        .filter(a => a.status !== 'Cancelled' && new Date(a.date).toISOString().slice(0, 10) >= todayStr)
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0]
      const nextVisit = nextAppt ? new Date(nextAppt.date).toISOString().slice(0, 10) : null
      setSelected(prev => prev ? { ...prev, totalVisits: completed, nextVisit, appointments: list } : prev)
    } catch {
      setSelected(prev => prev ? { ...prev, totalVisits: '—', nextVisit: null, appointments: [] } : prev)
    }
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">My Patients</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Patients currently under your care.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative group">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search patient or contact..."
            className="pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all w-52" />
        </div>

        {/* Gender Filter */}
        <div className="relative group">
          <select value={gender} onChange={e => setGender(e.target.value)}
            className="pl-4 pr-10 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all appearance-none cursor-pointer min-w-[140px]">
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
        </div>

        {(search || gender) && (
          <button onClick={() => { setSearch(''); setGender('') }}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
            Reset Filters
          </button>
        )}
        <span className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {loading ? '...' : `${patients.length} patients`}
        </span>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-xs font-bold">Loading patients...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 gap-2 text-rose-400">
            <AlertCircle size={16} />
            <span className="text-xs font-bold">{error}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  {['Patient', 'Age', 'Gender', 'Blood Group', 'Medical History', 'Contact', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patients.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-xs font-bold text-slate-400">No patients found</td></tr>
                ) : patients.map((p, idx) => (
                  <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div onClick={() => openPatient(p)}
                          className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-xs font-black group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0 cursor-pointer">
                          {p.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 whitespace-nowrap">{p.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-600">{p.age} yrs</td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-600">{p.gender}</td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-500 text-[9px] font-black uppercase tracking-wider border border-rose-100">
                        {p.bloodGroup}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-600 max-w-[160px] truncate">
                      {p.medicalHistory || '—'}
                    </td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-600 whitespace-nowrap">{p.contact}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[p.status] || STATUS_COLORS.Active}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <button onClick={() => openPatient(p)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors border border-slate-100 hover:border-blue-100">
                        <Eye size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selected && <DoctorPatientModal patient={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

    </div>
  )
}

export default PatientDetails
