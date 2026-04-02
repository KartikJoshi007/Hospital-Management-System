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

   const categories = ['All', 'Prescription']

   const filteredRecords = medicalRecords.filter(record => {
      const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         record.doctor.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = activeCategory === 'All' || record.type === activeCategory
      return matchesSearch && matchesCategory
   })

   return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div className="flex flex-col gap-1">
               <button 
                  onClick={() => navigate(-1)} 
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest mb-2 group w-fit"
               >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Go Back
               </button>
               <h1 className="text-3xl font-black tracking-tight text-slate-900">Medical Records</h1>
               <p className="text-slate-500 font-bold text-sm tracking-tight text-emerald-500/80 uppercase tracking-widest text-[10px] mt-1">Vault: Secure Medical Storage</p>
            </div>
         </div>

         {/* Records Archive & Controls - Full Width Focus */}
         <div className="p-4 md:p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm overflow-hidden">
            {/* Table Controls Header */}
            <div className="flex flex-col gap-8 mb-10 px-2">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-emerald-500 pl-3 leading-none">Record Archive</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest pl-4">Digital documentation of your health history</p>
                  </div>
                  <button className="flex items-center gap-2 px-8 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95">
                     <FileDown size={18} />
                     Download Complete Dossier
                  </button>
               </div>

               <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="relative group flex-1 w-full">
                     <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                     <input
                        type="text"
                        placeholder="Search diagnosis, reports, or doctors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-100/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-xs font-bold text-slate-900"
                     />
                  </div>
                  <div className="flex p-1.5 bg-slate-100/50 border border-slate-100 rounded-2xl overflow-x-auto scroller-hide w-full md:w-auto shadow-inner">
                     {categories.map(cat => (
                        <button
                           key={cat}
                           onClick={() => setActiveCategory(cat)}
                           className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-white text-emerald-600 shadow-md border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                           {cat === 'All' ? 'Full Archive' : cat}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="overflow-x-auto scroller-hide px-2">
               <table className="w-full min-w-[800px]">
                  <thead>
                     <tr className="border-b-2 border-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                        <th className="text-left py-6 px-4 font-black">Document Details & Metadata</th>
                        <th className="text-left py-6 px-4 font-black">Dept</th>
                        <th className="text-left py-6 px-4 font-black">Date Listed</th>
                        <th className="text-left py-6 px-4 font-black">Volume</th>
                        <th className="text-right py-6 px-4 font-black">Control</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50">
                     {filteredRecords.map((record) => (
                        <MedicalRecordRow key={record.id} {...record} />
                     ))}
                  </tbody>
               </table>
            </div>

            {filteredRecords.length === 0 && (
               <div className="py-32 text-center space-y-6">
                  <div className="mx-auto w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 shadow-inner">
                     <Search size={48} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-600 font-black text-xs uppercase tracking-widest">No matching records indexed.</p>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Try adjusting your filters or search keywords.</p>
                  </div>
               </div>
            )}
         </div>
      </div>
   )
}

export default MyRecords
