import { useState } from 'react'
import {
   Search,
   Filter,
   ArrowLeft,
   ShieldCheck,
   FileText,
   Download,
   ExternalLink,
   Check,
   Loader2,
   X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ModernTable from './ModernTable'

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
   const [selectedDept, setSelectedDept] = useState('All')
   const [isFilterOpen, setIsFilterOpen] = useState(false)
   const [downloadingId, setDownloadingId] = useState(null)
   const [isDownloadingAll, setIsDownloadingAll] = useState(false)

   const categories = ['All', 'Prescription']
   const departments = ['All', 'Cardiology', 'Orthopedics', 'Neurology', 'Dermatology']

   const filteredRecords = medicalRecords.filter(record => {
      const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         record.doctor.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = activeCategory === 'All' || record.type === activeCategory
      const matchesDept = selectedDept === 'All' || record.dept === selectedDept
      return matchesSearch && matchesCategory && matchesDept
   })

   const handleDownload = (record) => {
      setDownloadingId(record.id)
      setTimeout(() => {
         setDownloadingId(null)
         alert(`Success! "${record.title}" has been saved to your downloads.`)
      }, 1500)
   }

   const handleDownloadAll = () => {
      setIsDownloadingAll(true)
      setTimeout(() => {
         setIsDownloadingAll(false)
         alert(`Success! All ${filteredRecords.length} medical records have been bundled and downloaded.`)
      }, 2500)
   }

   const handleViewDetail = (record) => {
      alert(`Navigating to detailed view for: ${record.title}\nDoctor: ${record.doctor}\nDepartment: ${record.dept}`)
   }

   const tableHeaders = ['Document Name', 'Category', 'Department', 'Date', 'Actions']

   const renderRecordRow = (record) => (
      <tr key={record.id} className="hover:bg-slate-50/50 transition-all group">
         <td className="px-6 py-6 border-none">
            <div className="flex items-center gap-4 text-left">
               <div className="p-3.5 bg-slate-100 text-slate-400 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all border border-slate-200 group-hover:border-emerald-400 shrink-0">
                  <FileText size={18} strokeWidth={3} />
               </div>
               <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 leading-tight truncate max-w-[200px] sm:max-w-[300px]">{record.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{record.size}</p>
               </div>
            </div>
         </td>
         <td className="px-6 py-6 text-center">
            <span className="inline-flex px-3 py-1.5 rounded-lg text-[10px] font-black bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-widest">
               {record.type}
            </span>
         </td>
         <td className="px-6 py-6 text-center text-sm">
            <div className="flex flex-col items-center">
               <p className="font-black text-slate-700 leading-tight">{record.dept}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{record.doctor}</p>
            </div>
         </td>
         <td className="px-6 py-6 text-center">
            <span className="text-xs font-black text-slate-600 whitespace-nowrap">
               {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
         </td>
         <td className="px-6 py-6">
            <div className="flex justify-center items-center gap-3">
               <button 
                  onClick={() => handleDownload(record)}
                  disabled={downloadingId === record.id}
                  className="p-2.5 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" 
                  title="Download"
               >
                  {downloadingId === record.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} strokeWidth={3} />}
               </button>
               <button 
                  onClick={() => handleViewDetail(record)}
                  className="p-2.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" 
                  title="View Detail"
               >
                  <ExternalLink size={18} strokeWidth={3} />
               </button>
            </div>
         </td>
      </tr>
   );

   return (
      <div className="space-y-6 pb-10 animate-in fade-in duration-500 w-full px-2 sm:px-4 max-w-[100vw] overflow-x-hidden">

         {/* Header Section */}
         <div className="p-6 sm:p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
            <div className="min-w-0">
               <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4 uppercase leading-none truncate">Medical Records</h1>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-3 pl-5 line-clamp-1 sm:line-clamp-none">Access health history and diagnostic reports</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
               <button 
                  onClick={handleDownloadAll}
                  disabled={isDownloadingAll || filteredRecords.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
               >
                  {isDownloadingAll ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} strokeWidth={3} />}
                  {isDownloadingAll ? 'Preparing...' : 'Download All'}
               </button>
               <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors shrink-0"
               >
                  <ArrowLeft size={16} strokeWidth={3} />
                  Back
               </button>
            </div>
         </div>

         {/* Filters & Search */}
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 p-4 sm:p-5 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex p-1 bg-white rounded-xl border border-slate-100 self-start lg:self-auto overflow-x-auto max-w-full">
               {categories.map(cat => (
                  <button
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}
                  >
                     {cat}
                  </button>
               ))}
            </div>

            <div className="flex items-center gap-3 flex-1 w-full lg:max-w-md">
               <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={3} />
                  <input
                     type="text"
                     placeholder="Search records..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none shadow-sm min-w-0"
                  />
               </div>
               
               <div className="relative shrink-0">
                  <button 
                     onClick={() => setIsFilterOpen(!isFilterOpen)}
                     className={`p-3.5 rounded-xl transition-all shadow-sm border ${isFilterOpen ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-900'}`}
                  >
                     {isFilterOpen ? <X size={18} strokeWidth={3} /> : <Filter size={18} strokeWidth={3} />}
                  </button>

                  <AnimatePresence>
                     {isFilterOpen && (
                        <motion.div
                           initial={{ opacity: 0, y: 10, scale: 0.95 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           exit={{ opacity: 0, y: 10, scale: 0.95 }}
                           className="absolute right-0 top-full mt-3 w-60 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 py-4 z-[150]"
                        >
                           <div className="px-5 py-2 border-b border-slate-50 mb-3 text-left">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department Filter</p>
                           </div>
                           <div className="space-y-1 px-2">
                              {departments.map((dept) => (
                                 <button
                                    key={dept}
                                    onClick={() => {
                                       setSelectedDept(dept)
                                       setIsFilterOpen(false)
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${selectedDept === dept ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                 >
                                    {dept}
                                    {selectedDept === dept && <Check size={14} strokeWidth={4} />}
                                 </button>
                              ))}
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </div>
         </div>

         {/* Records Table Card */}
         <div className="min-h-[400px]">
            <ModernTable 
               headers={tableHeaders} 
               data={filteredRecords} 
               renderRow={renderRecordRow} 
            />
         </div>

         {/* Footer Note */}
         <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-[2rem] flex gap-5 items-start shadow-sm shadow-blue-50">
            <ShieldCheck className="text-blue-500 shrink-0" size={24} strokeWidth={3} />
            <p className="text-[11px] text-blue-700 uppercase tracking-widest font-black leading-relaxed">
               All records are encrypted and secure. Authorized healthcare professionals can access these documents.
            </p>
         </div>
      </div>
   )
}

export default MyRecords
