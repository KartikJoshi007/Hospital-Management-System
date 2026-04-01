import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  MapPin,
  Phone,
  Mail,
  Droplet,
  Dna,
  AlertCircle,
  Save,
  Camera,
  ArrowLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GENDERS, BLOOD_GROUPS } from '../../../utils/constants'
import useAuth from '../../../hooks/useAuth'

const initialState = {
  name: 'Kartik Joshi',
  age: '28',
  gender: 'Male',
  contact: '+91 98765 43210',
  email: 'kartik.joshi@example.com',
  bloodGroup: 'O+',
  address: '123, Emerald City, Sector 45, Gurgaon, Haryana - 122001',
  allergies: 'Peanuts, Penicillin',
  chronicConditions: 'None',
}

function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formValues, setFormValues] = useState(initialState)

  useEffect(() => {
    if (user) {
      setFormValues(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        contact: user.contact || prev.contact,
        gender: user.gender || prev.gender,
        bloodGroup: user.bloodGroup || prev.bloodGroup,
        address: user.address || prev.address,
        allergies: user.allergies || prev.allergies,
        chronicConditions: user.chronicConditions || prev.chronicConditions,
      }))
    }
  }, [user])

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setLoading(false)
    alert('Profile updated successfully!')
  }

  const Label = ({ children }) => (
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
      {children}
    </label>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest mb-2 group w-fit"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Go Back
        </button>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Health Profile</h1>
        <p className="text-slate-500 font-bold text-sm tracking-tight text-emerald-500/80 uppercase tracking-widest text-[10px] mt-1">Identity: Secure Personal Records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="h-32 w-32 rounded-3xl bg-emerald-500 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-emerald-500/20">
                KJ
              </div>
              <button className="absolute -right-2 -bottom-2 p-2.5 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-400 hover:text-emerald-500 transition-colors">
                <Camera size={18} />
              </button>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">{formValues.name}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Patient ID: HMS-8842-P</p>

            <div className="w-full space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <Droplet size={14} className="text-rose-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase">Blood type</span>
                </div>
                <span className="text-xs font-black text-slate-900">{formValues.bloodGroup}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <User size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase">Gender</span>
                </div>
                <span className="text-xs font-black text-slate-900">{formValues.gender}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0F172A] text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <AlertCircle size={18} />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest">Medical Alerts</h4>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-emerald-500/60">Known Allergies</p>
                <p className="text-xs font-bold text-slate-200">{formValues.allergies || 'None reported'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-emerald-500/60">Chronic conditions</p>
                <p className="text-xs font-bold text-slate-200">{formValues.chronicConditions || 'None reported'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Update Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2 border-b border-emerald-500/10 pb-2">Basic Information</h4>
                <div>
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="name"
                      value={formValues.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Age (Yrs)</Label>
                    <input
                      name="age"
                      type="number"
                      value={formValues.age}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <select
                      name="gender"
                      value={formValues.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
                    >
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2 border-b border-emerald-500/10 pb-2">Contact Details</h4>
                <div>
                  <Label>Mobile Number</Label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="contact"
                      value={formValues.contact}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="email"
                      type="email"
                      value={formValues.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label>Permanent Address</Label>
              <div className="relative">
                <MapPin size={14} className="absolute left-4 top-4 text-slate-400" />
                <textarea
                  name="address"
                  rows={3}
                  value={formValues.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-6 border-b border-rose-500/10 pb-2 flex items-center gap-2">
                <Dna size={14} />
                Health History Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Known Allergies</Label>
                  <textarea
                    name="allergies"
                    value={formValues.allergies}
                    onChange={handleChange}
                    placeholder="e.g. Peanuts, Penicillin"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-sm font-bold text-slate-900 min-h-[80px]"
                  />
                </div>
                <div>
                  <Label>Chronic Conditions</Label>
                  <textarea
                    name="chronicConditions"
                    value={formValues.chronicConditions}
                    onChange={handleChange}
                    placeholder="e.g. Diabetes, Hypertension"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-sm font-bold text-slate-900 min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile
