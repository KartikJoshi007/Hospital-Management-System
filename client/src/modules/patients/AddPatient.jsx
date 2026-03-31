import { useEffect, useState } from 'react'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { GENDERS, BLOOD_GROUPS } from '../../utils/constants'
import { validatePatientForm } from '../../utils/validators'

const initialState = {
  name: '',
  age: '',
  gender: '',
  contact: '',
  email: '',
  bloodGroup: '',
  address: '',
  medicalHistory: '',
}

function AddPatient({ selectedPatient, onSubmit, onCancel, loading }) {
  const [formValues, setFormValues] = useState(initialState)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (selectedPatient) {
      setFormValues({
        name: selectedPatient.name || '',
        age: selectedPatient.age || '',
        gender: selectedPatient.gender || '',
        contact: selectedPatient.contact || '',
        email: selectedPatient.email || '',
        bloodGroup: selectedPatient.bloodGroup || '',
        address: selectedPatient.address || '',
        medicalHistory: selectedPatient.medicalHistory || '',
      })
    } else {
      setFormValues(initialState)
    }
  }, [selectedPatient])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validatePatientForm(formValues)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length) return

    await onSubmit(
      {
        ...formValues,
        age: Number(formValues.age),
      },
      selectedPatient?.id || selectedPatient?._id,
    )

    if (!selectedPatient) {
      setFormValues(initialState)
    }
    setErrors({})
  }

  const Label = ({ children }) => (
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
      {children}
    </label>
  )

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Basic Info */}
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <input
                required
                name="name"
                value={formValues.name}
                onChange={handleChange}
                placeholder="e.g. Ava Sharma"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
              />
              {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{errors.name}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age</Label>
                <input
                  required
                  name="age"
                  type="number"
                  value={formValues.age}
                  onChange={handleChange}
                  placeholder="Yrs"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
                />
              </div>
              <div>
                <Label>Gender</Label>
                <select
                  required
                  name="gender"
                  value={formValues.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 appearance-none bg-white"
                >
                  <option value="" disabled>Select</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div>
              <Label>Blood Group</Label>
              <select
                required
                name="bloodGroup"
                value={formValues.bloodGroup}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 appearance-none bg-white"
              >
                <option value="" disabled>Select Type</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>

          {/* Column 2: Contact Flow */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Contact Number</Label>
                <input
                  required
                  name="contact"
                  value={formValues.contact}
                  onChange={handleChange}
                  placeholder="+91 00000 00000"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
                />
              </div>
              <div>
                <Label>Email Address</Label>
                <input
                  required
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleChange}
                  placeholder="ava.sharma@email.com"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <Label>Permanent Address</Label>
              <textarea
                required
                name="address"
                rows={2}
                value={formValues.address}
                onChange={handleChange}
                placeholder="Street address, City, Pincode"
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 min-h-[92px]"
              />
            </div>
          </div>
        </div>

        {/* Full-width medical history row */}
        <div className="pt-1">
          <Label>Medical History & Notes</Label>
          <textarea
            name="medicalHistory"
            rows={2}
            value={formValues.medicalHistory}
            onChange={handleChange}
            placeholder="Allergies, chronic conditions, medication..."
            className="w-full px-6 py-3 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 min-h-[84px]"
          />
        </div>

        <div className="pt-5 border-t border-slate-100 flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
          >
            Discard
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 bg-[#0F172A] hover:bg-emerald-500 h-11"
            disabled={loading}
          >
            {loading ? 'Transmitting...' : selectedPatient ? 'Update Profile' : 'Register Patient'}
          </button>
        </div>
      </form>
    </div>
  )
 }
 
 export default AddPatient
