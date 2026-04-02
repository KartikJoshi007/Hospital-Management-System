import { useState, useEffect } from 'react'
import { User, Mail, Phone, Lock, Eye, EyeOff, Edit2, Check, X, ShieldCheck, Clock, Activity, MapPin, Droplet, Dna, AlertCircle, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuth from '../../../hooks/useAuth'
import { GENDERS, BLOOD_GROUPS } from '../../../utils/constants'

function PatientProfile() {
  const { user, login } = useAuth()

  const [editMode, setEditMode] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Kartik Joshi',
    email: user?.email || 'kartik.joshi@example.com',
    contact: user?.contact || '+91 98765 43210',
    age: user?.age || '28',
    gender: user?.gender || 'Male',
    bloodGroup: user?.bloodGroup || 'O+',
    address: user?.address || '123, Emerald City, Sector 45, Gurgaon, Haryana - 122001',
    allergies: user?.allergies || 'Peanuts, Penicillin',
    chronicConditions: user?.chronicConditions || 'None',
    height: user?.height || '175',
  })

  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        contact: user.contact || prev.contact,
        age: user.age || prev.age,
        gender: user.gender || prev.gender,
        bloodGroup: user.bloodGroup || prev.bloodGroup,
        address: user.address || prev.address,
        allergies: user.allergies || prev.allergies,
        chronicConditions: user.chronicConditions || prev.chronicConditions,
        height: user.height || prev.height,
      }))
    }
  }, [user])

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const notify = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const handleProfileSave = (e) => {
    e.preventDefault()
    const updated = { ...user, ...profileForm }
    localStorage.setItem('user', JSON.stringify(updated))
    login(updated)
    setEditMode(false)
    notify('Profile updated successfully')
  }

  const handleProfileCancel = () => {
    setProfileForm({
      name: user?.name || 'Kartik Joshi',
      email: user?.email || 'kartik.joshi@example.com',
      contact: user?.contact || '+91 98765 43210',
      age: user?.age || '28',
      gender: user?.gender || 'Male',
      bloodGroup: user?.bloodGroup || 'O+',
      address: user?.address || '123, Emerald City, Sector 45, Gurgaon, Haryana - 122001',
      allergies: user?.allergies || 'Peanuts, Penicillin',
      chronicConditions: user?.chronicConditions || 'None',
      height: user?.height || '175',
    })
    setEditMode(false)
  }

  const handlePasswordSave = (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify('New passwords do not match', 'error')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      notify('Password must be at least 6 characters', 'error')
      return
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    notify('Password changed successfully')
  }

  const stats = [
    { label: 'Height', value: `${profileForm.height} cm`, icon: User, color: 'blue' },
    { label: 'Blood Group', value: profileForm.bloodGroup, icon: Droplet, color: 'emerald' },
    { label: 'Patient ID', value: user?.id?.substring(0, 8) || 'P-44829', icon: Activity, color: 'blue' },
  ]

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500 w-full px-4">

      {/* Toast */}
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-5 py-3 rounded-2xl text-xs font-black border ${message.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
            {message.type === 'error' ? '✗' : '✓'} {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Hero Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-slate-900 to-emerald-900 relative flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={`https://ui-avatars.com/api/?name=${profileForm.name}&background=ffffff&color=10b981&bold=true&size=80`}
                alt="Patient"
                className="h-16 w-16 rounded-2xl object-cover border-4 border-white/30 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>
            <div>
              <h2 className="text-xl font-black text-white leading-tight">{profileForm.name}</h2>
              <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Patient Portal Account</p>
              <p className="text-[10px] font-bold text-emerald-100 mt-0.5">{profileForm.contact}</p>
            </div>
          </div>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 text-white text-xs font-black uppercase tracking-widest hover:bg-white/30 transition-all"
            >
              <Edit2 size={13} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleProfileCancel}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 text-white text-xs font-black uppercase tracking-widest hover:bg-white/30 transition-all">
                <X size={13} /> Cancel
              </button>
              <button form="profile-form" type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white text-emerald-600 text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-lg">
                <Check size={13} /> Save
              </button>
            </div>
          )}
        </div>

        {/* Stats + Form */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className={`p-2 rounded-xl ${s.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : s.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                  <s.icon size={15} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <p className="text-xs font-black text-slate-900 mt-0.5">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Profile Form */}
          <form id="profile-form" onSubmit={handleProfileSave}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50' : 'bg-slate-50 border-slate-100 text-slate-600 cursor-default'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50' : 'bg-slate-50 border-slate-100 text-slate-600 cursor-default'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                  <input
                    type="tel"
                    value={profileForm.contact}
                    onChange={e => setProfileForm({ ...profileForm, contact: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50' : 'bg-slate-50 border-slate-100 text-slate-600 cursor-default'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Age</label>
                  <input
                    type="number"
                    value={profileForm.age}
                    onChange={e => setProfileForm({ ...profileForm, age: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50' : 'bg-slate-50 border-slate-100 text-slate-600 cursor-default'}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gender</label>
                  <select
                    value={profileForm.gender}
                    onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 cursor-pointer' : 'bg-slate-50 border-slate-100 text-slate-600 cursor-default appearance-none'}`}
                  >
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={profileForm.height}
                    onChange={e => setProfileForm({ ...profileForm, height: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50' : 'bg-slate-50 border-slate-100 text-slate-600 cursor-default'}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Blood Group</label>
                  <select
                    value={profileForm.bloodGroup}
                    onChange={e => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 cursor-pointer' : 'bg-slate-50 border-slate-100 text-slate-600 cursor-default appearance-none'}`}
                  >
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Residential Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-slate-300 h-4 w-4" />
                  <textarea
                    rows={2}
                    value={profileForm.address}
                    onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                    disabled={!editMode}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-bold text-slate-900 outline-none transition-all resize-none ${editMode ? 'bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50' : 'bg-slate-50 border-slate-100 text-slate-600 cursor-default'}`}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
              <Lock size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Change Password</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Update your account security key</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordSave} className="px-8 py-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm New</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-white text-sm font-bold text-slate-900 outline-none focus:ring-4 transition-all shadow-sm ${passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-50'
                      : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-50'
                    }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex items-end">
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95">
                <Lock size={13} strokeWidth={3} /> Update Password
              </button>
            </div>
          </div>
        </form>
      </div>

    </div>
  )
}

export default PatientProfile
