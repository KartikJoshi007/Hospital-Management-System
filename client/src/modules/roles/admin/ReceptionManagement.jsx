import { useState, useMemo, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, X, AlertCircle, Loader2, User, Eye, EyeOff, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getAllReceptionists, createReceptionist, updateReceptionist, deleteReceptionist } from '../../reception/receptionApi'

const SHIFTS = ['Morning', 'Afternoon', 'Night']
const emptyForm = { name: '', email: '', contact: '', experience: '', shift: 'Morning', deskNumber: '', status: 'Active', password: '' }

function ReceptionManagement() {
  const navigate = useNavigate()
  const [receptionists, setReceptionists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRec, setEditingRec] = useState(null)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [message, setMessage] = useState({ text: '', error: false })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const notify = (text, error = false) => {
    setMessage({ text, error })
    setTimeout(() => setMessage({ text: '', error: false }), 3000)
  }

  const fetchReceptionists = async () => {
    try {
      setLoading(true)
      const res = await getAllReceptionists()
      setReceptionists(res?.data?.data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching receptionists:', err)
      setError('Failed to load receptionists directory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReceptionists()
  }, [])

  const filtered = useMemo(() => receptionists.filter(r => {
    return r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase())
  }), [receptionists, search])

  const openAdd = () => { setEditingRec(null); setFormData(emptyForm); setIsFormOpen(true) }
  const openEdit = (rec) => { 
    setEditingRec(rec); 
    setFormData({ ...rec }); 
    setIsFormOpen(true) 
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (editingRec) {
        await updateReceptionist(editingRec._id, formData)
        notify('Receptionist updated successfully')
      } else {
        await createReceptionist(formData)
        notify('Receptionist added successfully')
      }
      fetchReceptionists()
      setIsFormOpen(false)
    } catch (err) {
      notify(err?.response?.data?.message || 'Error saving receptionist data', true)
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteReceptionist(deleteCandidate._id)
      setReceptionists(prev => prev.filter(r => r._id !== deleteCandidate._id))
      setDeleteCandidate(null)
      notify('Receptionist removed successfully')
    } catch (err) {
      notify('Error removing receptionist', true)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">Reception Management</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">Add, edit, and manage reception staff</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl hover:bg-emerald-500 transition-all font-black text-xs uppercase tracking-widest shadow-lg">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {message.text && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`px-5 py-3 rounded-2xl text-xs font-black border ${message.error ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
          {message.error ? '✕' : '✓'} {message.text}
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all placeholder:text-slate-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Staff', 'Shift', 'Desk', 'Contact', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                   <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading staff...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-slate-400">No staff found</td></tr>
              ) : filtered.map((rec, idx) => (
                <motion.tr key={rec._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                  className="hover:bg-emerald-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                        {rec.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'R'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{rec.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{rec.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider border border-blue-100">{rec.shift}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700">{rec.deskNumber || '—'}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{rec.contact}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${rec.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${rec.status === 'Active' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                      {rec.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(rec)} className="p-2 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => setDeleteCandidate(rec)} className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{editingRec ? 'Edit Staff' : 'Add New Staff'}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">{editingRec ? 'Update staff information' : 'Register a new receptionist'}</p>
                  </div>
                  <button onClick={() => setIsFormOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Jane Doe' },
                    { label: 'Email', key: 'email', type: 'email', placeholder: 'jane@domain.com' },
                    { label: 'Contact', key: 'contact', type: 'tel', placeholder: '10-digit Phone No.' },
                    { label: 'Experience', key: 'experience', type: 'text', placeholder: '2 Years' },
                    { label: 'Desk Number', key: 'deskNumber', type: 'text', placeholder: 'Desk 101' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                      <input required type={f.type} placeholder={f.placeholder} value={formData[f.key]}
                        onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                        pattern={f.type === 'tel' ? "\\d{10}" : undefined}
                        minLength={f.type === 'tel' ? 10 : undefined}
                        maxLength={f.type === 'tel' ? 10 : undefined}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all" />
                    </div>
                  ))}
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      {editingRec ? 'Reset Password (Optional)' : 'Login Password'}
                    </label>
                    <div className="relative border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50 transition-all bg-slate-50">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                      <input 
                        required={!editingRec} 
                        type={showPassword ? "text" : "password"} 
                        placeholder={editingRec ? "Leave blank to keep current" : "••••••••"} 
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
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Shift</label>
                    <select value={formData.shift} onChange={e => setFormData({ ...formData, shift: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all appearance-none">
                      {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sm:col-span-2">
                    <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                    <button type="submit" disabled={isSaving} className="px-8 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 shadow-lg flex items-center gap-2">
                      {isSaving && <Loader2 size={14} className="animate-spin" />}
                      {editingRec ? 'Update' : 'Save'}
                    </button>
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
              <div className="h-16 w-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900">Remove Staff Member?</h3>
              <p className="text-sm font-bold text-slate-400 mt-2 mb-8">Remove <span className="text-slate-900 font-black">{deleteCandidate.name}</span> from the directory?</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteCandidate(null)} className="flex-1 py-3 rounded-2xl bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all border border-slate-100">Cancel</button>
                <button onClick={confirmDelete} disabled={isDeleting}
                  className="flex-1 py-3 rounded-2xl bg-rose-500 text-xs font-black uppercase tracking-widest text-white hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                  {isDeleting && <Loader2 size={13} className="animate-spin" />}
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ReceptionManagement
