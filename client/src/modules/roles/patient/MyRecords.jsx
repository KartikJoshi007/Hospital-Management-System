import { useState } from 'react'
import {
   Search,
   Filter,
   ArrowLeft,
   ShieldCheck,
   FileText,
   Download,
   ExternalLink
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const medicalRecords = [
   {
      id: 1,
      title: 'Post-Surgery Prescription',
      type: 'Prescription',
      date: '2023-10-12',
      doctor: 'Dr. Rahul Patil',
      dept: 'Orthopedics',
      status: 'Ready',
      size: '1.2 MB'
   },
   {
      id: 4,
      title: 'Cardiac Follow-up Prescription',
      type: 'Prescription',
      date: '2023-09-15',
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
      <div className="space-y-8 pb-10 animate-in fade-in duration-500 w-full px-4">
         
         {/* Header Section */}
         <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h1 className="text-3xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase leading-none">Medical Records</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 pl-5">Access your health history, prescriptions, and diagnostic reports</p>
            </div>
            <div className="flex items-center gap-3">
               <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95">
                  <Download size={14} strokeWidth={3} />
                  Download All
               </button>
               <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
               >
                  <ArrowLeft size={14} strokeWidth={3} />
                  Back
               </button>
            </div>
         </div>

         {/* Filters & Search */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-5 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex p-1 bg-white rounded-xl border border-slate-100">
               {categories.map(cat => (
                  <button
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}
                  >
                     {cat}
                  </button>
               ))}
            </div>

            <div className="flex items-center gap-3 flex-1 md:max-w-md">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} strokeWidth={3} />
                  <input
                     type="text"
                     placeholder="Search records, doctors..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none shadow-sm"
                  />
               </div>
               <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm">
                  <Filter size={16} strokeWidth={3} />
               </button>
            </div>
         </div>

         {/* Records Table Card */}
         <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Name</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => (
                           <tr key={record.id} className="hover:bg-slate-50/50 transition-all group">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-100 text-slate-400 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all border border-slate-200 group-hover:border-emerald-400">
                                       <FileText size={18} strokeWidth={3} />
                                    </div>
                                    <div>
                                       <p className="text-sm font-black text-slate-900 leading-tight">{record.title}</p>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{record.size}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="inline-flex px-3 py-1 rounded-full text-[9px] font-black bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-widest">
                                    {record.type}
                                 </span>
                              </td>
                              <td className="px-8 py-6">
                                 <div>
                                    <p className="text-sm font-black text-slate-700 leading-tight">{record.dept}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{record.doctor}</p>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-xs font-black text-slate-600 whitespace-nowrap">
                                 {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex justify-end gap-2">
                                    <button className="p-2.5 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
                                       <Download size={16} strokeWidth={3} />
                                    </button>
                                    <button className="p-2.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                                       <ExternalLink size={16} strokeWidth={3} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))
                     ) : (
                        <tr>
                           <td colSpan={5} className="py-24 text-center">
                              <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-slate-50 text-slate-200 mb-6 border border-slate-100">
                                 <FileText size={32} strokeWidth={1} />
                              </div>
                              <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest">No entries found</h3>
                              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Try adjusting your filters</p>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Footer Note */}
         <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-[2rem] flex gap-4 items-start shadow-sm shadow-blue-50">
            <ShieldCheck className="text-blue-500 shrink-0" size={20} strokeWidth={3} />
            <p className="text-[10px] text-blue-700 uppercase tracking-widest font-bold leading-relaxed">
               All medical records are encrypted and stored securely. Only authorized healthcare professionals attending to you can access these documents.
            </p>
         </div>
      </div>
   )
}

export default MyRecords
