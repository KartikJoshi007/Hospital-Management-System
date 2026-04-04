import { useState, useMemo, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, X, Clock, Star, AlertCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DoctorProfileModal from './DoctorProfileModal'
import { getAllDoctors, createDoctor, updateDoctor, deleteDoctor } from '../../doctors/doctorApi'

const SPECIALIZATIONS = ['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Pediatrics', 'General Medicine']

const emptyForm = { name: '', specialization: '', experience: '', availability: '', contact: '', email: '', status: 'Active' }

function DoctorManagement({ view }) {
  const navigate = useNavigate()
  const [doctors, setDoctors]               = useState([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)
  const [search, setSearch]                 = useState('')
  const [specFilter, setSpecFilter]         = useState('All')
  const [isFormOpen, setIsFormOpen]         = useState(false)
  const [editingDoc, setEditingDoc]         = useState(null)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [selectedDoc, setSelectedDoc]       = useState(null)
  const [formData, setFormData]             = useState(emptyForm)
  const [message, setMessage]               = useState('')
  const [isSaving, setIsSaving]             = useState(false)

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const res = await getAllDoctors()
      setDoctors(res?.data?.data ?? res?.data ?? [])
      setError(null)
    } catch (err) {
      console.error('Error fetching doctors:', err)
      setError('Failed to load doctors directory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (view === 'add') { setEditingDoc(null); setFormData(emptyForm); setIsFormOpen(true) }
  }, [view])

  useEffect(() => {
    if (!isFormOpen && view === 'add') navigate('/admin/doctors')
  }, [isFormOpen, view, navigate])

  const filtered = useMemo(() => doctors.filter(d => {
    const bySearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase())
    const bySpec   = specFilter === 'All' || d.specialization === specFilter
    return bySearch && bySpec
  }), [doctors, search, specFilter])

  const openAdd  = () => { setEditingDoc(null); setFormData(emptyForm); setIsFormOpen(true) }
  const openEdit = (doc) => { setEditingDoc(doc); setFormData({ ...doc }); setIsFormOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (editingDoc) {
        await updateDoctor(editingDoc._id, formData)
        setMessage('Doctor updated successfully')
      } else {
        await createDoctor(formData)
        setMessage('Doctor added successfully')
      }
      setIsFormOpen(false)
      fetchDoctors()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Error saving doctor:', err)
      alert(err.message || 'Error saving doctor data')
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    try {
      await deleteDoctor(deleteCandidate._id)
      setMessage('Doctor removed successfully')
      setDeleteCandidate(null)
      fetchDoctors()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Error deleting doctor:', err)
      alert(err.message || 'Error removing doctor')
    }
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">Doctor Management</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">Add, edit, and manage doctor directory</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl hover:bg-emerald-500 transition-all font-black text-xs uppercase tracking-widest shadow-lg">
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs font-black text-emerald-700">
          ✓ {message}
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Search by name or specialization..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all placeholder:text-slate-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', ...SPECIALIZATIONS].map(s => (
            <button key={s} onClick={() => setSpecFilter(s)}
              className={`px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${specFilter === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Doctor', 'Specialization', 'Experience', 'Availability', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading physicians...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-rose-400">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-slate-400">No doctors found</td></tr>
              ) : filtered.map((doc, idx) => (
                <motion.tr key={doc._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                  className="hover:bg-emerald-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => setSelectedDoc({ ...doc, dept: doc.specialization })}
                        className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0 cursor-pointer"
                      >
                        {doc.name.startsWith('Dr.') 
                          ? doc.name.split(' ').slice(1).map(n => n[0]).join('').toUpperCase() || 'D'
                          : doc.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'D'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{doc.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{doc.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider border border-emerald-100">{doc.specialization}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Star size={11} className="text-amber-400 fill-current" />
                      <span className="text-xs font-bold text-slate-700">{doc.experience}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600 max-w-[140px] truncate">{doc.availability}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${doc.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${doc.status === 'Active' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(doc)} className="p-2 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => setDeleteCandidate(doc)} className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100">
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

      {/* Doctor Profile Modal */}
      {selectedDoc && (
        <DoctorProfileModal doctor={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{editingDoc ? 'Edit Doctor' : 'Add New Doctor'}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">{editingDoc ? 'Update clinical information' : 'Register a new physician'}</p>
                  </div>
                  <button onClick={() => setIsFormOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name',    key: 'name',         type: 'text',  placeholder: 'Dr. Jane Doe' },
                    { label: 'Experience',   key: 'experience',   type: 'text',  placeholder: '5 Years' },
                    { label: 'Contact',      key: 'contact',      type: 'tel',   placeholder: '+91 98765 43210' },
                    { label: 'Email',        key: 'email',        type: 'email', placeholder: 'doctor@hms.com' },
                    { label: 'Availability', key: 'availability', type: 'text',  placeholder: 'Mon–Fri (10AM–2PM)' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                      <input required type={f.type} placeholder={f.placeholder} value={formData[f.key]}
                        onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Specialization</label>
                    <select required value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all appearance-none">
                      <option value="" disabled>Select</option>
                      {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all appearance-none">
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                    <button type="submit" disabled={isSaving} className="px-8 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 shadow-lg flex items-center gap-2">
                      {isSaving && <Loader2 size={14} className="animate-spin" />}
                      {editingDoc ? 'Update' : 'Save'}
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
              <h3 className="text-xl font-black text-slate-900">Remove Doctor?</h3>
              <p className="text-sm font-bold text-slate-400 mt-2 mb-8">Remove <span className="text-slate-900 font-black">{deleteCandidate.name}</span> from the directory?</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteCandidate(null)} className="flex-1 py-3 rounded-2xl bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all border border-slate-100">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-3 rounded-2xl bg-rose-500 text-xs font-black uppercase tracking-widest text-white hover:bg-rose-600 transition-all active:scale-95">Remove</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DoctorManagement
