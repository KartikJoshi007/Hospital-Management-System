import { useState, useEffect, useCallback } from 'react'
import { Search, Edit, Eye, X, AlertCircle, Loader2, EyeOff, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PatientProfileModal from './PatientProfileModal'
import { getAllPatients, updatePatient } from '../../patients/patientApi'

const STATUS_COLORS = {
  Active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Admitted: 'bg-blue-50 text-blue-600 border-blue-100',
  Discharged: 'bg-slate-50 text-slate-500 border-slate-100',
}

function PatientManagement() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewPatient, setViewPatient] = useState(null)
  const [editPatient, setEditPatient] = useState(null)
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isError,  setIsError]  = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const showMsg = (msg, error = false) => {
    setMessage(msg)
    setIsError(error)
    setTimeout(() => { setMessage(''); setIsError(false) }, 3000)
  }

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res  = await getAllPatients(1, 100, search, genderFilter, statusFilter)
      const data = res?.data?.data ?? res?.data ?? {}
      const list = Array.isArray(data) ? data : (data?.patients ?? [])
      setPatients(list)
    } catch (err) {
      setError(err?.message || 'Failed to load patients')
    } finally {
      setLoading(false)
    }
  }, [search, genderFilter, statusFilter])

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchPatients(), 400)
    return () => clearTimeout(t)
  }, [fetchPatients])

  // client-side filter only used as fallback if backend doesn't filter
  const filtered = patients

  const openEdit = (p) => {
    setEditPatient(p)
    setFormData({ 
      name: p.name, 
      email: p.email || p.userId?.email || '', 
      dob: p.dob ? new Date(p.dob).toISOString().split('T')[0] : '', 
      contact: p.contact, 
      address: p.address, 
      medicalHistory: p.medicalHistory 
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res     = await updatePatient(editPatient._id, formData)
      const updated = res?.data?.data ?? res?.data ?? {}
      setPatients(prev => prev.map(p => p._id === editPatient._id ? { ...p, ...updated } : p))
      setEditPatient(null)
      showMsg('Patient updated successfully')
    } catch (err) {
      showMsg(err?.message || 'Update failed', true)
    } finally {
      setSaving(false)
    }
  }



  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">Patient Management</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">View, edit and manage all patient records</p>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`px-5 py-3 rounded-2xl text-xs font-black border ${isError ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
          {isError ? '✕' : '✓'} {message}
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Search by name or contact..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all placeholder:text-slate-400" />
        </div>
        <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all appearance-none min-w-[130px]">
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all appearance-none min-w-[130px]">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Admitted">Admitted</option>
          <option value="Discharged">Discharged</option>
        </select>
        {(genderFilter || statusFilter) && (
          <button onClick={() => { setGenderFilter(''); setStatusFilter('') }}
            className="px-4 py-3 rounded-xl bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
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
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['Patient', 'Age / Gender', 'Contact', 'Blood Group', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-slate-400">No patients found</td></tr>
                ) : filtered.map((p, idx) => (
                  <motion.tr key={p._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div onClick={() => setViewPatient(p)}
                          className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0 cursor-pointer">
                          {p.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{p.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{p.userId?.email || p.email || 'No Email'}</p>

                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{p.age} yrs • {p.gender}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{p.contact}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-[9px] font-black border border-rose-100">{p.bloodGroup}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[p.status] || STATUS_COLORS.Active}`}>{p.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewPatient(p)} className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-all"><Eye size={14} /></button>
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all"><Edit size={14} /></button>

                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewPatient && (
        <PatientProfileModal patient={viewPatient} onClose={() => setViewPatient(null)} />
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editPatient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-900">Edit Patient</h3>
                  <button onClick={() => setEditPatient(null)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"><X size={18} /></button>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text' },
                    { label: 'Email', key: 'email', type: 'email' },
                    { label: 'Date of Birth', key: 'dob', type: 'date' },
                    { label: 'Contact', key: 'contact', type: 'tel' },
                    { label: 'Address', key: 'address', type: 'text' },
                    { label: 'Medical History', key: 'medicalHistory', type: 'text' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                      <input type={f.type} value={formData[f.key] || ''} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all" />
                    </div>
                  ))}

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Reset Password (Optional)</label>
                    <div className="relative border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50 transition-all bg-slate-50">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Leave blank to keep current" 
                        value={formData.password || ''}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-11 pr-11 py-3 bg-transparent text-sm font-bold text-slate-900 outline-none" 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setEditPatient(null)} className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                    <button type="submit" disabled={saving}
                      className="px-8 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2">
                      {saving && <Loader2 size={13} className="animate-spin" />}
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  )
}

export default PatientManagement
