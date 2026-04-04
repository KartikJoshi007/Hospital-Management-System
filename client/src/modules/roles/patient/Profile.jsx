import { useState, useEffect } from 'react'
import { User, Mail, Phone, Lock, Eye, EyeOff, Edit2, Check, X, Activity, MapPin, Droplet, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuth from '../../../hooks/useAuth'
import { GENDERS, BLOOD_GROUPS } from '../../../utils/constants'
import { getPatientByUserId, updatePatient } from '../../patients/patientApi'
import { updateProfile, changePassword } from '../../auth/authApi'

function PatientProfile() {
  const { user, login } = useAuth()

  const [editMode, setEditMode] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const [patientId, setPatientId] = useState(null)
  const [loading, setLoading] = useState(true)

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    contact: '',
    age: '',
    gender: 'other',
    bloodGroup: 'O+',
    address: '',
    allergies: '',
    chronicConditions: '',
    height: '',
    weight: '',
    admissionDate: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await getPatientByUserId(user.id)
        const p = res.data
        console.log('Fetched Patient Profile:', p)
        setPatientId(p?._id)
        setProfileForm({
          name: p.name || p.userId?.fullName || user?.fullName || '',
          email: p.userId?.email || user?.email || '',
          contact: p.contact || p.userId?.phone || user?.phone || '',
          age: p.age || '',
          gender: (p.gender || 'other').toLowerCase(),
          bloodGroup: p.bloodGroup || 'O+',
          address: p.address || '',
          chronicConditions: p.medicalHistory || '',
          height: p.height || '',
          weight: p.weight || '',
          admissionDate: p.admissionDate || '',
        })
      } catch (err) {
        console.error('Profile fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchProfile()
  }, [user.id])

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const notify = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    try {
      const userRes = await updateProfile({
        fullName: profileForm.name,
        phone: profileForm.contact
      })

      const patientPayload = {
        bloodGroup: profileForm.bloodGroup,
        gender: profileForm.gender.toLowerCase(),
        medicalHistory: profileForm.chronicConditions,
        address: profileForm.address,
        age: Number(profileForm.age)
      }

      if (profileForm.height) patientPayload.height = Number(profileForm.height)
      if (profileForm.weight) patientPayload.weight = Number(profileForm.weight)

      await updatePatient(patientId, patientPayload)

      await updatePatient(patientId, patientPayload)

      const updatedUserObj = {
        ...user,
        id: user._id || user.id,
        fullName: userRes.data.fullName,
        email: userRes.data.email,
        phone: userRes.data.phone
      }
      localStorage.setItem('user', JSON.stringify(updatedUserObj))
      login(updatedUserObj)

      setEditMode(false)
      notify('Profile updated successfully')
    } catch (err) {
      notify(err.message || 'Update failed', 'error')
    }
  }

  const handleProfileCancel = () => {
    setEditMode(false)
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify('New passwords do not match', 'error')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      notify('Password must be at least 6 characters', 'error')
      return
    }
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      notify('Password changed successfully')
    } catch (err) {
      notify(err.message || 'Password change failed', 'error')
    }
  }

  const stats = [
    { label: 'Height', value: profileForm.height ? `${profileForm.height} cm` : 'N/A', icon: User, color: 'blue' },
    { label: 'Weight', value: profileForm.weight ? `${profileForm.weight} kg` : 'N/A', icon: Activity, color: 'orange' },
    { label: 'Admission Date', value: profileForm.admissionDate ? new Date(profileForm.admissionDate).toLocaleDateString() : 'None', icon: MapPin, color: 'emerald' },
    { label: 'Blood Group', value: profileForm.bloodGroup, icon: Droplet, color: 'emerald' },
  ]

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500 w-full px-2 sm:px-4 max-w-[100vw] overflow-x-hidden">

      {/* Toast */}
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-6 py-4 rounded-2xl text-sm font-black border shadow-lg ${message.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
            {message.type === 'error' ? '✗' : '✓'} {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Hero Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-slate-900 to-emerald-900 relative flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 py-6 gap-6">
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <img
                src={`https://ui-avatars.com/api/?name=${profileForm.name}&background=ffffff&color=10b981&bold=true&size=100`}
                alt="Patient"
                className="h-20 w-20 rounded-[1.5rem] object-cover border-4 border-white/20 shadow-2xl"
              />
              <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-black text-white leading-tight truncate">{profileForm.name}</h2>
              <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest mt-1 opacity-80">Patient Portal Account</p>
              <p className="text-[11px] font-black text-emerald-100 mt-1 opacity-60">{profileForm.contact}</p>
            </div>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl bg-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
              >
                <Edit2 size={16} strokeWidth={3} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={handleProfileCancel}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
                  <X size={16} strokeWidth={3} /> Cancel
                </button>
                <button form="profile-form" type="submit"
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-emerald-600 text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-2xl">
                  <Check size={16} strokeWidth={3} /> Save Change
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats + Form */}
        <div className="px-6 sm:px-10 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-5 p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 group hover:shadow-md transition-all">
                <div className={`p-3.5 rounded-2xl transition-all shadow-sm ${s.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white'}`}>
                  <s.icon size={20} strokeWidth={3} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-base font-black text-slate-900 truncate leading-none">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Profile Form */}
          <form id="profile-form" onSubmit={handleProfileSave} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5" strokeWidth={3} />
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50' : 'bg-slate-50 border-transparent text-slate-600'}`}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Verified Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5" strokeWidth={3} />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50' : 'bg-slate-50 border-transparent text-slate-600'}`}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5" strokeWidth={3} />
                  <input
                    type="tel"
                    value={profileForm.contact}
                    onChange={e => setProfileForm({ ...profileForm, contact: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50' : 'bg-slate-50 border-transparent text-slate-600'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="130"
                    step="1"
                    value={profileForm.age}
                    onChange={e => setProfileForm({ ...profileForm, age: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-5 py-4 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400' : 'bg-slate-50 border-transparent'}`}
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                  <select
                    value={profileForm.gender}
                    onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-5 py-4 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 cursor-pointer' : 'bg-slate-50 border-transparent appearance-none'}`}
                  >
                    {GENDERS.map(g => <option key={g} value={g.toLowerCase()}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Height (cm)</label>
                  <input
                    type="number"
                    value={profileForm.height}
                    onChange={e => setProfileForm({ ...profileForm, height: e.target.value })}
                    disabled={!editMode}
                    placeholder="175"
                    className={`w-full px-5 py-4 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400' : 'bg-slate-50 border-transparent'}`}
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={profileForm.weight}
                    onChange={e => setProfileForm({ ...profileForm, weight: e.target.value })}
                    disabled={!editMode}
                    placeholder="70"
                    className={`w-full px-5 py-4 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400' : 'bg-slate-50 border-transparent'}`}
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                  <select
                    value={profileForm.bloodGroup}
                    onChange={e => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-5 py-4 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 cursor-pointer' : 'bg-slate-50 border-transparent appearance-none'}`}
                  >
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Chronic Conditions / Medical History</label>
                <div className="relative">
                  <Activity className="absolute left-4 top-4 text-slate-300 h-5 w-5" strokeWidth={3} />
                  <textarea
                    rows={3}
                    placeholder="List your existing medical conditions, surgeries, or chronic illnesses..."
                    value={profileForm.chronicConditions}
                    onChange={e => setProfileForm({ ...profileForm, chronicConditions: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all resize-none ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50' : 'bg-slate-50 border-transparent text-slate-600'}`}
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Residential Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-slate-300 h-5 w-5" strokeWidth={3} />
                  <textarea
                    rows={2}
                    value={profileForm.address}
                    onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all resize-none ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400' : 'bg-slate-50 border-transparent'}`}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 sm:px-10 py-8 border-b border-slate-50 bg-slate-50/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-600 shadow-sm">
              <Lock size={18} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">Security Credentials</h3>
              <p className="text-xs font-bold text-slate-400 mt-1">Update your account access password</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordSave} className="px-6 sm:px-10 py-10 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-end">
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Key</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all shadow-sm"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secure Key</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all shadow-sm"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Verify Key</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className={`w-full px-5 py-4 rounded-xl border bg-white text-sm font-bold text-slate-900 outline-none transition-all shadow-sm ${passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword ? 'border-rose-300' : 'border-slate-200 focus:border-emerald-400'}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit"
              className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95">
              <ShieldCheck size={18} strokeWidth={3} /> Change Keys
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}

export default PatientProfile
