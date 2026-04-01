import { useState } from 'react'
import {
   Search,
   Filter,
   FileDown,
   ArrowLeft,
   ArrowRight,
   ShieldCheck,
   Stethoscope,
   Activity,
   History,
   FileText
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MedicalRecordRow from '../../../components/patientcomponents/MedicalRecordRow'

const medicalRecords = [
   {
      id: 1,
      title: 'Post-Surgery Prescription',
      type: 'Prescription',
      date: 'Oct 12, 2023',
      doctor: 'Dr. Rahul Patil',
      dept: 'Orthopedics',
      status: 'Ready',
      size: '1.2 MB'
   },
   {
      id: 2,
      title: 'Complete Blood Count (CBC)',
      type: 'Lab Report',
      date: 'Oct 10, 2023',
      doctor: 'Dr. Sneha Verma',
      dept: 'Neurology',
      status: 'Ready',
      size: '3.4 MB'
   },
   {
      id: 3,
      title: 'Chest X-Ray Digital Scan',
      type: 'Radiology',
      date: 'Sep 28, 2023',
      doctor: 'Dr. Nisha Iyer',
      dept: 'Dermatology',
      status: 'Archived',
      size: '12.8 MB'
   },
   {
      id: 4,
      title: 'Cardiac Follow-up Prescription',
      type: 'Prescription',
      date: 'Sep 15, 2023',
      doctor: 'Dr. Aryan Mehta',
      dept: 'Cardiology',
      status: 'Ready',
      size: '0.8 MB'
   },
]

function MyRecords() {
   const navigate = useNavigate()
   const [searchTerm, setSearchTerm] = useState('')
   const [activeCategory, setActiveCategory] = useState('All')

   const categories = ['All', 'Prescription', 'Lab Report', 'Radiology']

   const filteredRecords = medicalRecords.filter(record => {
      const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         record.doctor.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = activeCategory === 'All' || record.type === activeCategory
      return matchesSearch && matchesCategory
   })

   return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
               <button 
                  onClick={() => navigate(-1)} 
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest mb-2 group w-fit"
               >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Go Back
               </button>
               <h1 className="text-3xl font-black tracking-tight text-slate-900 italic">My Medical Records</h1>
               <p className="text-slate-500 font-bold text-sm tracking-wide">Secure access to your health history and test reports.</p>
            </div>

            <div className="relative group w-full md:w-80">
               <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
               <input
                  type="text"
                  placeholder="Search diagnosis, reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 shadow-sm shadow-slate-200/50"
               />
            </div>
         </div>

         {/* Quick Stats / Category Bar */}
         <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-6">
            <div className="flex p-1 bg-slate-50 border border-slate-200 rounded-2xl mr-4 overflow-x-auto scroller-hide max-w-full">
               {categories.map(cat => (
                  <button
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     {cat === 'All' ? 'Complete history' : cat}
                  </button>
               ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-500 transition-colors">
               <Filter size={14} />
               Advanced Filters
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={120} strokeWidth={1} />
               </div>
               <div className="relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                     <Activity size={24} />
                  </div>
                  <h3 className="text-xl font-black mb-1">Health Status</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-2">You are up to date</p>
                  <div className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/10 w-fit">


                  </div>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
               <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <FileText size={20} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Records</p>
               <h3 className="text-2xl font-black text-slate-900">{medicalRecords.length} Files</h3>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
               <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Stethoscope size={20} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prescriptions</p>
               <h3 className="text-2xl font-black text-slate-900">12 Ready</h3>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
               <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <History size={20} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Oldest Record</p>
               <h3 className="text-2xl font-black text-slate-900">2.4 Yrs</h3>
            </div>
         </div>

         {/* Records Table/List */}
         <div className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8 px-2">
               <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest border-l-4 border-emerald-500 pl-4">All My Records</h3>
               <button className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95">
                  <FileDown size={16} />
                  Download All
               </button>
            </div>

            <div className="overflow-x-auto scroller-hide">
               <table className="w-full min-w-[800px]">
                  <thead>
                     <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="text-left py-4 px-4">Document Name</th>
                        <th className="text-left py-4 px-4">Department</th>
                        <th className="text-left py-4 px-4">Date Added</th>
                        <th className="text-left py-4 px-4">File Size</th>
                        <th className="text-right py-4 px-4">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredRecords.map((record) => (
                        <MedicalRecordRow key={record.id} {...record} />
                     ))}
                  </tbody>
               </table>
            </div>

            {filteredRecords.length === 0 && (
               <div className="py-20 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                     <Search size={32} />
                  </div>
                  <p className="text-slate-400 font-bold text-sm">Target documents not found.</p>
               </div>
            )}
         </div>
      </div>
   )
}

export default MyRecords
