import { useState, useMemo } from 'react'
import { Search, Edit, Trash2, Eye, X, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PatientProfileModal from './PatientProfileModal'

const initialPatients = [
  { id: 'P-001', name: 'Rohan Sharma', age: 34, gender: 'Male', contact: '9876543210', bloodGroup: 'B+', status: 'Active', address: 'Mumbai, MH', medicalHistory: 'Diabetes Type 2' },
  { id: 'P-002', name: 'Priya Verma', age: 28, gender: 'Female', contact: '8765432109', bloodGroup: 'O+', status: 'Admitted', address: 'Pune, MH', medicalHistory: 'Asthma (mild)' },
  { id: 'P-003', name: 'Amit Patel', age: 45, gender: 'Male', contact: '9123456789', bloodGroup: 'A+', status: 'Discharged', address: 'Ahmedabad, GJ', medicalHistory: 'Hypertension' },
  { id: 'P-004', name: 'Sara Khan', age: 31, gender: 'Female', contact: '7654321098', bloodGroup: 'AB-', status: 'Active', address: 'Delhi, DL', medicalHistory: 'No known conditions' },
  { id: 'P-005', name: 'Vikram Singh', age: 52, gender: 'Male', contact: '9000111222', bloodGroup: 'O-', status: 'Admitted', address: 'Jaipur, RJ', medicalHistory: 'Cardiac history' },
]

const STATUS_COLORS = {
  Active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Admitted: 'bg-blue-50 text-blue-600 border-blue-100',
  Discharged: 'bg-slate-50 text-slate-500 border-slate-100',
}

function PatientManagement() {
  const [patients, setPatients] = useState(initialPatients)
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewPatient, setViewPatient]       = useState(null)
  const [editPatient, setEditPatient] = useState(null)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [formData, setFormData] = useState({})
  const [message, setMessage] = useState('')

  const filtered = useMemo(() => patients.filter(p => {
    const bySearch = search ? p.name.toLowerCase().includes(search.toLowerCase()) || p.contact.includes(search) : true
    const byGender = genderFilter ? p.gender === genderFilter : true
    const byStatus = statusFilter ? p.status === statusFilter : true
    return bySearch && byGender && byStatus
  }), [patients, search, genderFilter, statusFilter])

  const openEdit = (p) => { setEditPatient(p); setFormData({ ...p }) }

  const handleSave = (e) => {
    e.preventDefault()
    setPatients(prev => prev.map(p => p.id === editPatient.id ? { ...formData, id: editPatient.id } : p))
    setMessage('Patient updated successfully')
    setEditPatient(null)
    setTimeout(() => setMessage(''), 3000)
  }

  const confirmDelete = () => {
    setPatients(prev => prev.filter(p => p.id !== deleteCandidate.id))
    setMessage('Patient removed successfully')
    setDeleteCandidate(null)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">Patient Management</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">View, edit and manage all patient records</p>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs font-black text-emerald-700">
          ✓ {message}
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
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
                <motion.tr key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                          onClick={() => setViewPatient(p)}
                          className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0 cursor-pointer"
                        >
                          {p.name.charAt(0)}
                        </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{p.name}</p>
                        <p className="text-[9px] font-bold text-slate-400">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{p.age} yrs • {p.gender}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{p.contact}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-[9px] font-black border border-rose-100">{p.bloodGroup}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewPatient(p)} className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-all"><Eye size={14} /></button>
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all"><Edit size={14} /></button>
                      <button onClick={() => setDeleteCandidate(p)} className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
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
                    { label: 'Age', key: 'age', type: 'number' },
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
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setEditPatient(null)} className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                    <button type="submit" className="px-8 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95">Update</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteCandidate && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-[2rem] border border-rose-100 shadow-2xl p-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4"><AlertCircle size={32} /></div>
              <h3 className="text-xl font-black text-slate-900">Remove Patient?</h3>
              <p className="text-sm font-bold text-slate-400 mt-2 mb-8">Remove <span className="text-slate-900 font-black">{deleteCandidate.name}</span> from records?</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteCandidate(null)} className="flex-1 py-3 rounded-2xl bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-400 border border-slate-100 hover:bg-slate-100 transition-all">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-3 rounded-2xl bg-rose-500 text-xs font-black uppercase tracking-widest text-white hover:bg-rose-600 transition-all active:scale-95">Remove</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PatientManagement
