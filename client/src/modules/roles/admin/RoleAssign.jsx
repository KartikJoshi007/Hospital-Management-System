import { useState, useEffect } from 'react'
import { Stethoscope, Star, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../../api/axios'

// Frontend display labels (Title Case)
const DOCTOR_LEVELS = ['Senior Doctor', 'Junior Doctor', 'Resident Doctor', 'Consultant', 'Intern', 'Other']

// Convert display label → backend enum (lowercase)
const toBackend = (level) => level.toLowerCase()

// Convert backend enum → display label (Title Case)
const toDisplay = (level) => {
  if (!level) return 'Other'
  return level.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const LEVEL_COLORS = {
  'Senior Doctor':   'bg-blue-50 text-blue-700 border-blue-200',
  'Junior Doctor':   'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Resident Doctor': 'bg-purple-50 text-purple-700 border-purple-200',
  'Consultant':      'bg-amber-50 text-amber-700 border-amber-200',
  'Intern':          'bg-pink-50 text-pink-700 border-pink-200',
  'Other':           'bg-slate-50 text-slate-600 border-slate-200',
}

function RoleAssign() {
  const [doctors,   setDoctors]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [search,    setSearch]    = useState('')
  const [editId,    setEditId]    = useState(null)   // which row is in edit mode
  const [editLevel, setEditLevel] = useState('')     // selected level in edit mode
  const [saving,    setSaving]    = useState(false)
  const [savedId,   setSavedId]   = useState(null)   // show ✓ Saved for this id

  // GET /api/doctors
  useEffect(() => {
    api.get('/doctors')
      .then(res => setDoctors(res.data.data || []))
      .catch(() => setError('Failed to load doctors.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (doc) => {
    setEditId(doc._id)
    setEditLevel(toDisplay(doc.roleLevel))
  }

  const handleCancel = () => {
    setEditId(null)
    setEditLevel('')
  }

  // PATCH /api/doctors/:id/role-level
  const handleSave = async (doc) => {
    setSaving(true)
    try {
      await api.patch(`/doctors/${doc._id}/role-level`, {
        roleLevel: toBackend(editLevel),
      })
      setDoctors(prev => prev.map(d => d._id === doc._id ? { ...d, roleLevel: toBackend(editLevel) } : d))
      setEditId(null)
      setEditLevel('')
      setSavedId(doc._id)
      setTimeout(() => setSavedId(null), 2500)
    } catch {
      setError('Failed to update role. Please try again.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">Role Management</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">Assign role levels to doctors</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
          <Stethoscope size={14} className="text-emerald-500" />
          <span className="text-xs font-black text-emerald-700">{doctors.length} Doctors</span>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-5 py-3 rounded-2xl bg-rose-50 border border-rose-100 text-xs font-black text-rose-600">
            ✗ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input
          type="text"
          placeholder="Search by name or specialization..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Doctor', 'Specialization', 'Experience', 'Current Level', 'Assign Role'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-xs font-bold text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-xs font-bold text-slate-400">No doctors found</td></tr>
              ) : filtered.map((doc, idx) => {
                const displayLevel = toDisplay(doc.roleLevel)
                const isEditing    = editId === doc._id
                return (
                  <motion.tr key={doc._id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
                    className="hover:bg-slate-50/40 transition-colors group">

                    {/* Doctor */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                          {doc.name?.split(' ').slice(1).map(n => n[0]).join('') || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{doc.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{doc.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Specialization */}
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                        {doc.specialization}
                      </span>
                    </td>

                    {/* Experience */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Star size={11} className="text-amber-400 fill-current" />
                        <span className="text-xs font-bold text-slate-700">{doc.experience}</span>
                      </div>
                    </td>

                    {/* Current Level */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${LEVEL_COLORS[displayLevel] || LEVEL_COLORS['Other']}`}>
                        {displayLevel}
                      </span>
                    </td>

                    {/* Assign Role */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <select
                              value={editLevel}
                              onChange={e => setEditLevel(e.target.value)}
                              className="px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all appearance-none cursor-pointer">
                              {DOCTOR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            <button onClick={() => handleSave(doc)} disabled={saving}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50">
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={handleCancel} disabled={saving}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(doc)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 transition-all">
                              Edit
                            </button>
                            {savedId === doc._id && (
                              <span className="text-[10px] font-black text-emerald-500">✓ Saved</span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default RoleAssign
