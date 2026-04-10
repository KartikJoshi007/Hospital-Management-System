import { useState, useEffect, useRef } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Edit2, 
  Check, 
  X, 
  Activity, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Heart, 
  Calendar, 
  TrendingUp, 
  Loader2, 
  FileText,
  Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuth from '../../../hooks/useAuth'
import { GENDERS, BLOOD_GROUPS } from '../../../utils/constants'
import { getPatientByUserId, updatePatient } from '../../patients/patientApi'
import { updateProfile, changePassword } from '../../auth/authApi'

function PatientProfile() {
  const { user, login } = useAuth()
  const editSectionRef = useRef(null)

  const [editMode, setEditMode] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showIncompletePopup, setShowIncompletePopup] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const [patientId, setPatientId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    contact: '',
    age: '',
    gender: 'other',
    bloodGroup: 'O+',
    address: '',
    medicalHistory: '',
    height: '',
    weight: '',
    admissionDate: '',
  })

  // 📝 Dedicated state for editing to prevent UI leaks
  const [editForm, setEditForm] = useState({ ...profileForm })

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const notify = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await getPatientByUserId(user.id)
        const p = res.data
        setPatientId(p?._id)
        const initialForm = {
          name: p.name || p.userId?.fullName || user?.fullName || '',
          email: p.userId?.email || user?.email || '',
          contact: p.contact || p.userId?.phone || user?.phone || '',
          age: p.age || '',
          gender: (p.gender || 'other').toLowerCase(),
          bloodGroup: p.bloodGroup || 'O+',
          address: p.address || '',
          medicalHistory: p.medicalHistory || '',
          height: p.vitals?.height || '',
          weight: p.vitals?.weight || '',
          admissionDate: p.admissionDate ? p.admissionDate.split('T')[0] : '',
        }
        setProfileForm(initialForm)
        setEditForm(initialForm)
        
        // 🔍 Re-evaluate completeness
        const isIncomplete = !initialForm.height || !initialForm.weight || !initialForm.age || 
                           !initialForm.address || initialForm.address === 'Not Provided' ||
                           !initialForm.medicalHistory;
        setShowIncompletePopup(isIncomplete)
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchProfile()
  }, [user.id])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (!editForm.age) throw new Error('Age is required')
      if (editForm.age < 1 || editForm.age > 130) throw new Error('Age must be between 1 and 130')
      if (!editForm.height) throw new Error('Height is required')
      if (editForm.height < 30 || editForm.height > 300) throw new Error('Height must be between 30 and 300 cm')
      if (!editForm.weight) throw new Error('Weight is required')
      if (editForm.weight < 1 || editForm.weight > 500) throw new Error('Weight must be between 1 and 500 kg')

      if (!editForm.address?.trim() || editForm.address === 'Not Provided') throw new Error('Address is required')
      if (!editForm.medicalHistory?.trim()) throw new Error('Medical background is required')

      const countWords = (str) => str?.trim().split(/\s+/).filter(Boolean).length || 0;
      if (countWords(editForm.address) > 150) throw new Error("Address must not exceed 150 words!");
      if (countWords(editForm.medicalHistory) > 150) throw new Error("Medical background must not exceed 150 words!");

      await updatePatient(patientId, {
        ...editForm,
        medicalHistory: editForm.medicalHistory
      })
      setProfileForm({ ...editForm })
      
      // 🔍 Immediate UI update for completeness status
      const isIncomplete = !editForm.height || !editForm.weight || !editForm.age || 
                         !editForm.address || editForm.address === 'Not Provided' ||
                         !editForm.medicalHistory;
      setShowIncompletePopup(isIncomplete)

      notify('Profile updated successfully')
      setEditMode(false)
    } catch (err) {
      notify(err.message || 'Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEmailUpdate = async (e) => {
    e.preventDefault()
    const email = e.target.email.value.trim()
    const confirmEmail = e.target.confirmEmail.value.trim()
    if (email !== confirmEmail) return notify('Emails do not match', 'error')
    try {
      setSaving(true)
      await updateProfile({ email })
      setProfileForm(prev => ({ ...prev, email }))
      notify('Email updated successfully')
      e.target.reset()
    } catch (err) {
      notify(err.message || 'Failed to update email', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePhoneUpdate = async (e) => {
    e.preventDefault()
    const phone = e.target.phone.value.trim()
    try {
      setSaving(true)
      await updateProfile({ phone })
      setProfileForm(prev => ({ ...prev, contact: phone }))
      notify('Phone number updated successfully')
      e.target.reset()
    } catch (err) {
      notify(err.message || 'Failed to update phone', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return notify('Passwords do not match', 'error')
    }
    try {
      setSaving(true)
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      notify('Password changed successfully')
    } catch (err) {
      notify(err.message || 'Password change failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const completeness = [
    profileForm.age, profileForm.height, profileForm.weight, 
    profileForm.address, profileForm.medicalHistory, profileForm.contact
  ].filter(Boolean).length * 16.6

  const stats = [
    { label: 'Height (cm)', value: profileForm.height || 'N/A', icon: TrendingUp, color: 'emerald' },
    { label: 'Weight (kg)', value: profileForm.weight || 'N/A', icon: Activity, color: 'blue' },
    { label: 'Blood Group', value: profileForm.bloodGroup, icon: Heart, color: 'rose' },
    { label: 'Age', value: profileForm.age || '0', icon: User, color: 'orange' },
  ]

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" strokeWidth={3} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Profile...</p>
      </div>
    )
  }

  const inputClass = "w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 border-slate-100 text-sm font-bold text-slate-600 outline-none cursor-default"

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500 w-full px-2 sm:px-4 max-w-[100vw] overflow-x-hidden">
      
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-24 right-8 z-[100] px-6 py-3 rounded-2xl text-xs font-black border shadow-2xl flex items-center gap-3 ${message.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
            {message.type === 'error' ? <X size={14} strokeWidth={4} /> : <Check size={14} strokeWidth={4} />} {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏙️ Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-xl font-black border border-emerald-400 shadow-lg shrink-0">
             {profileForm.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">{profileForm.name || 'Patient Profile'}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">Manage your personal and clinical information</p>
          </div>
        </div>
        <button onClick={() => { 
          if(editMode) setEditForm({ ...profileForm }); // Reset on cancel
          setEditMode(!editMode); 
          if(!editMode) setTimeout(() => editSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); 
        }} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${editMode ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-emerald-500'}`}>
          {editMode ? <X size={14} strokeWidth={3} /> : <Edit2 size={14} strokeWidth={3} />}
          {editMode ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {/* 📊 Rapid Vitals & Account Overview */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/20">
          <div className="flex flex-wrap items-center justify-between gap-y-6">
            {stats.map((s, i) => (
              <div key={i} className={`flex items-center gap-4 flex-1 min-w-[120px] justify-center sm:justify-start ${i !== stats.length - 1 ? 'sm:border-r border-slate-100' : ''}`}>
                <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-100 text-emerald-500"><s.icon size={16} strokeWidth={3} /></div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{s.label}</p>
                   <h3 className="text-sm font-black text-slate-900 leading-none">{s.value}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                    <input type="text" value={profileForm.email} disabled className={inputClass} />
                 </div>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                 <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
                    <input type="text" value={profileForm.contact} disabled className={inputClass} />
                 </div>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Account Role</label>
                 <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 h-4 w-4" />
                    <input type="text" value="Registered Patient" disabled className="w-full pl-11 pr-4 py-3 rounded-xl border bg-emerald-50 border-emerald-100 text-sm font-black text-emerald-700 cursor-default" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* ✍️ Professional Edit Sections */}
      <AnimatePresence>
        {editMode && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" ref={editSectionRef}>
             
             {/* 🩺 Clinical Vitals Edit */}
             <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-500"><Activity size={18} strokeWidth={3} /></div>
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Update Medical Vitals</h3>
               </div>
               
               <form onSubmit={handleProfileSave} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                        <input type="number" min="1" max="130" value={editForm.age} onChange={e => setEditForm({...editForm, age: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Height (cm)</label>
                        <input type="number" min="30" max="300" value={editForm.height} onChange={e => setEditForm({...editForm, height: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                        <input type="number" min="1" max="500" value={editForm.weight} onChange={e => setEditForm({...editForm, weight: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                        <select value={editForm.bloodGroup} onChange={e => setEditForm({...editForm, bloodGroup: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 cursor-pointer">
                           {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Home Address</label>
                        <textarea rows={2} value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all resize-none" />
                        <p className={`text-[9px] font-bold mt-1 text-right ${editForm.address.trim().split(/\s+/).filter(Boolean).length > 150 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {editForm.address.trim().split(/\s+/).filter(Boolean).length} / 150 Words
                        </p>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical Background</label>
                        <textarea rows={2} value={editForm.medicalHistory} onChange={e => setEditForm({...editForm, medicalHistory: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-emerald-400 transition-all resize-none" />
                        <p className={`text-[9px] font-bold mt-1 text-right ${editForm.medicalHistory.trim().split(/\s+/).filter(Boolean).length > 150 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {editForm.medicalHistory.trim().split(/\s+/).filter(Boolean).length} / 150 Words
                        </p>
                     </div>
                  </div>

                  <button type="submit" disabled={saving} className="w-full py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95 disabled:bg-slate-300">
                     {saving ? <Loader2 size={16} className="animate-spin mx-auto" strokeWidth={3} /> : 'Save Vitals Update'}
                  </button>
               </form>
             </div>

             {/* 📧 Contact Info Update - Like Admin */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                   <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600"><Mail size={16} /></div>
                      <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Change Email</h3>
                   </div>
                   <form onSubmit={handleEmailUpdate} className="space-y-4">
                      <input type="email" name="email" required placeholder="New Email (e.g. name@domain.com)" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 transition-all" />
                      <input type="email" name="confirmEmail" required placeholder="Confirm New Email" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 transition-all" />
                      <button type="submit" disabled={saving} className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
                         Update Email
                      </button>
                   </form>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                   <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600"><Phone size={16} /></div>
                      <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Change Phone</h3>
                   </div>
                   <form onSubmit={handlePhoneUpdate} className="space-y-4">
                      <input type="tel" name="phone" required pattern="\d{10}" minLength={10} maxLength={10} placeholder="New 10-digit Phone Number" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 transition-all" />
                      <button type="submit" disabled={saving} className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all mt-[5.5rem]">
                         Update Phone
                      </button>
                   </form>
                </div>
             </div>

             {/* 🔐 Security Update */}
             <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                   <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600"><Lock size={16} /></div>
                   <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Change Password</h3>
                </div>
                <form onSubmit={handlePasswordSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="relative md:col-span-2">
                      <input type={showCurrent ? 'text' : 'password'} required placeholder="Current Password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 transition-all" />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                         {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                   </div>
                   <input type={showNew ? 'text' : 'password'} required placeholder="New Password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-400 transition-all" />
                   <input type={showConfirm ? 'text' : 'password'} required placeholder="Confirm New Password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className={`w-full px-5 py-3.5 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 outline-none focus:bg-white transition-all ${passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword ? 'border-rose-200' : 'border-slate-100 focus:border-emerald-400'}`} />
                   <button type="submit" disabled={saving} className="md:col-span-2 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95">
                      Update Secure Key
                   </button>
                </form>
             </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* 📊 Profile Summary Info */}
      <div className="bg-slate-50 rounded-[2.5rem] border border-slate-200/50 p-8 flex flex-col sm:flex-row items-center gap-6 shadow-inner">
         <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-500 shadow-sm shrink-0"><ShieldCheck size={28} /></div>
         <div className="text-left">
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">Profile Health Score: {Math.round(completeness)}%</h4>
            <div className="w-full max-w-sm h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: `${completeness}%` }} className="h-full bg-emerald-500" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-2">Completing all clinical vitals ensures the highest accuracy for your medical records and future consultations.</p>
         </div>
      </div>
    </div>
  )
}

export default PatientProfile
