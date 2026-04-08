import { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreVertical, Star, Clock, Phone, Mail, Edit, Trash2, X, User, AlertCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { getAllDoctors, createDoctor, updateDoctor, deleteDoctor } from './doctorApi'

const specializationsList = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Pediatrics', 'General Medicine'
]

const categories = [
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'orthopedic', label: 'Orthopedic' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'pediatric', label: 'Pediatric' },
  { value: 'general', label: 'General Medicine' }
]

const roleLevels = [
  { value: 'senior doctor', label: 'Senior Doctor' },
  { value: 'junior doctor', label: 'Junior Doctor' },
  { value: 'resident doctor', label: 'Resident' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'intern', label: 'Intern' },
  { value: 'other', label: 'Other' }
]

const shifts = ['Morning', 'Afternoon', 'Night', 'On Call']

function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('list') // list, add or edit
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpec, setSelectedSpec] = useState('All')
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const res = await getAllDoctors()
      setDoctors(res.data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching doctors:', err)
      setError('Could not load doctor records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    category: 'general',
    roleLevel: 'other',
    experience: '',
    availability: '',
    contact: '',
    email: '',
    status: 'Active',
    shift: 'Morning',
    rating: 0
  })

  // Filter logic
  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpec = selectedSpec === 'All' || doc.specialization === selectedSpec
    return matchesSearch && matchesSpec
  })

  const openAddForm = () => {
    setEditingDoctor(null)
    setFormData({ 
      name: '', 
      specialization: '', 
      category: 'general',
      roleLevel: 'other',
      experience: '',
      availability: '', 
      contact: '', 
      email: '', 
      status: 'Active',
      shift: 'Morning',
      rating: 0
    })
    setIsFormOpen(true)
  }

  const openEditForm = (doc) => {
    setEditingDoctor(doc)
    setFormData({ ...doc })
    setIsFormOpen(true)
    setActiveDropdown(null)
  }

  const handleDeleteClick = (doc) => {
    setDeleteCandidate(doc)
    setActiveDropdown(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (editingDoctor) {
        await updateDoctor(editingDoctor._id, formData)
        toast.success('Doctor record updated successfully! ✅')
      } else {
        await createDoctor(formData)
        toast.success('New doctor added successfully! ✅')
      }
      setIsFormOpen(false)
      fetchDoctors()
    } catch (err) {
      console.error('Error saving doctor:', err)
      toast.error(err.message || 'Error saving doctor data')
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    try {
      await deleteDoctor(deleteCandidate._id)
      setDeleteCandidate(null)
      fetchDoctors()
      toast.success('Doctor record deleted successfully! ✅')
    } catch (err) {
      console.error('Error deleting doctor:', err)
      toast.error(err.message || 'Error deleting record')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">Doctor Management</h1>
          <p className="text-slate-500 font-medium text-xs mt-1 pl-5">Add, view, and manage doctor directory and availability.</p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-bold text-sm shadow-md shadow-emerald-200 transform hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Add Doctor
        </button>
      </div>

      {/* Main List View */}
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search doctors by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar shrink-0">
            {['All', ...specializationsList].map(spec => (
              <button
                key={spec}
                onClick={() => setSelectedSpec(spec)}
                className={`px-4 py-3 whitespace-nowrap rounded-2xl text-xs font-bold transition-all ${selectedSpec === spec
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-center">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Doctor Info</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Spec & Rank</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Shift</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Availability</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-center">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fetching records...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs font-black text-rose-400">
                      {error}
                    </td>
                  </tr>
                ) : filteredDoctors.map((doc, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    key={doc._id}
                    className="hover:bg-emerald-50/30 transition-colors group text-center"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          {doc.name.startsWith('Dr.')
                            ? (doc.name.split(' ').slice(1).map(n => n[0]).join('').toUpperCase() || 'D')
                            : (doc.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'D')}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-slate-900 leading-tight">{doc.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{doc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100/50">
                          {doc.specialization}
                        </span>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{doc.roleLevel || 'Assistant'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-blue-400" />
                          <span className="text-xs font-bold text-slate-700">{doc.shift || 'Morning'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-1">
                          <Star size={12} className="text-amber-400 fill-current" />
                          <span className="text-xs font-bold text-slate-700">{doc.experience}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{doc.availability}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                          ${doc.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${doc.status === 'Active' ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                          {doc.status}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-emerald-500 transition-all border border-transparent hover:border-slate-100">
                          <Phone size={14} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-emerald-500 transition-all border border-transparent hover:border-slate-100">
                          <Mail size={14} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === doc.id ? null : doc.id)}
                            className={`p-2 rounded-lg transition-all border border-transparent ${activeDropdown === doc.id ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-400 hover:bg-white hover:shadow-sm hover:text-slate-900 hover:border-slate-100'}`}
                          >
                            <MoreVertical size={14} />
                          </button>

                          <AnimatePresence>
                            {activeDropdown === doc.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActiveDropdown(null)}
                                />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100 py-2 z-20 overflow-hidden"
                                >
                                  <button
                                    onClick={() => openEditForm(doc)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                  >
                                    <Edit size={14} /> Edit Record
                                  </button>
                                  <div className="h-px bg-slate-50 mx-2 my-1" />
                                  <button
                                    onClick={() => handleDeleteClick(doc)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                                  >
                                    <Trash2 size={14} /> Delete Doctor
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredDoctors.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">No Doctors Found</h3>
            <p className="text-sm font-medium text-slate-500">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal with Blur Effect */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-3xl bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-emerald-500 shadow-emerald-100">
                      {editingDoctor ? <Edit size={24} /> : <Plus size={24} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {editingDoctor ? 'Edit Doctor Record' : 'Add New Doctor'}
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                        {editingDoctor ? 'Update clinical information' : 'Register a new medical professional'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            required
                            type="text"
                            placeholder="e.g. Dr. Jane Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Specialization</label>
                        <select
                          required
                          value={formData.specialization}
                          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 appearance-none"
                        >
                          <option value="" disabled>Select Department</option>
                          {specializationsList.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Clinical Category</label>
                          <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 appearance-none"
                          >
                            {categories.map(cat => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Current Role</label>
                          <select
                            required
                            value={formData.roleLevel}
                            onChange={(e) => setFormData({ ...formData, roleLevel: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 appearance-none"
                          >
                            {roleLevels.map(role => (
                              <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Experience</label>
                          <input
                            required
                            type="text"
                            placeholder="e.g. 5 Years"
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
                          />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Rating (0.0 - 5.0)</label>
                           <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={formData.rating}
                            onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Assigned Shift</label>
                            <select
                              value={formData.shift}
                              onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 appearance-none"
                            >
                              {shifts.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                            <select
                              value={formData.status}
                              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 appearance-none"
                            >
                              <option value="Active">Active</option>
                              <option value="On Leave">On Leave</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                         </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Clinic Hours</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            required
                            type="text"
                            placeholder="e.g. Mon-Fri (10AM - 2PM)"
                            value={formData.availability}
                            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contact Details</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            required
                            type="tel"
                            placeholder="+91"
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            required
                            type="email"
                            placeholder="doctor@hospital.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-8 py-3 rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 bg-slate-900 shadow-slate-200 hover:bg-emerald-500 flex items-center gap-2"
                    >
                      {isSaving && <Loader2 size={14} className="animate-spin" />}
                      {editingDoctor ? 'Update Records' : 'Save Record'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteCandidate && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-[2rem] border border-rose-100 shadow-2xl p-8 text-center"
            >
              <div className="h-20 w-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Delete Doctor?</h3>
              <p className="text-sm font-bold text-slate-400 mt-2 mb-8">
                Are you sure you want to remove <span className="text-slate-900 font-black">{deleteCandidate.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteCandidate(null)}
                  className="flex-1 py-4 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-all border border-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-4 rounded-2xl bg-rose-500 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all shadow-lg active:scale-95"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Doctors
