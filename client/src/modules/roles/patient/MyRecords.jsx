import { useState, useEffect } from 'react'
import {
   Search,
   Filter,
   ArrowLeft,
   ShieldCheck,
   FileText,
   Download,
   Check,
   Loader2,
   X,
   Activity,
   Eye,
   Upload,
   Plus,
   File
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ModernTable from './ModernTable'
import useAuth from '../../../hooks/useAuth'
import { getPatientRecords, uploadPatientReport } from '../../patients/medicalRecordApi'
import { getPatientByUserId } from '../../patients/patientApi'

function MyRecords() {
   const navigate = useNavigate()
   const { user } = useAuth()
   
   const [medicalRecords, setMedicalRecords] = useState([])
   const [isLoading, setIsLoading] = useState(true)
   const [selectedRecord, setSelectedRecord] = useState(null)

   const [searchTerm, setSearchTerm] = useState('')
   const [activeCategory, setActiveCategory] = useState('All')
   const [selectedDept, setSelectedDept] = useState('All')
   const [isFilterOpen, setIsFilterOpen] = useState(false)
   const [downloadingId, setDownloadingId] = useState(null)
   const [isDownloadingAll, setIsDownloadingAll] = useState(false)
   
   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
   const [isUploading, setIsUploading] = useState(false)
   const [uploadForm, setUploadForm] = useState({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      file: null
   })

   const categories = ['All', 'Prescription', 'Lab Report', 'Clinical Note']
   const departments = ['All', 'Cardiology', 'Orthopedics', 'Neurology', 'Dermatology', 'General']

   const fetchRecords = async () => {
      try {
         setIsLoading(true)
         const pRes = await getPatientByUserId(user.id)
         const patientId = pRes.data?._id
         if (!patientId) return
         const res = await getPatientRecords(patientId)
         const formattedRecords = (res?.data || []).map(r => ({
            id: r._id,
            title: r.title,
            type: r.type,
            date: r.date,
            source: r.source || 'Hospital',
            description: r.description,
            doctor: r.doctorId?.fullName || r.doctorId?.name || (r.source === 'External' ? 'N/A' : 'External Doctor'),
            dept: r.clinicName || (r.source === 'External' ? 'Self Uploaded' : 'General'),
            status: 'Ready',
            size: r.attachments?.length ? `${r.attachments.length} Document(s)` : 'Note',
            attachments: r.attachments || []
         }))
         setMedicalRecords(formattedRecords)
      } catch (error) {
         console.error("Failed to fetch medical records:", error)
      } finally {
         setIsLoading(false)
      }
   }

   useEffect(() => {
      if (user?.id) fetchRecords()
   }, [user.id])

   const filteredRecords = medicalRecords.filter(record => {
      const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         record.doctor.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = activeCategory === 'All' || record.type === activeCategory
      const matchesDept = selectedDept === 'All' || record.dept === selectedDept
      return matchesSearch && matchesCategory && matchesDept
   })

   const handleDownload = (record) => {
      setDownloadingId(record.id)
      try {
         const dateStr = new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
         const text = [
            '═══════════════════════════════════════════',
            '          HOSPITAL MANAGEMENT SYSTEM       ',
            '              MEDICAL RECORD               ',
            '═══════════════════════════════════════════',
            '',
            `  Record Title  :  ${record.title}`,
            `  Type          :  ${record.type}`,
            `  Doctor        :  ${record.doctor}`,
            `  Department    :  ${record.dept}`,
            `  Date          :  ${dateStr}`,
            `  Attachments   :  ${record.size}`,
            '',
            '───────────────────────────────────────────',
            `  Generated on  :  ${new Date().toLocaleString('en-IN')}`,
            '  This is a computer-generated document.',
            '═══════════════════════════════════════════',
         ].join('\n')
         const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
         const url = URL.createObjectURL(blob)
         const a = document.createElement('a')
         a.href = url
         a.download = `${record.title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')}_record.txt`
         a.click()
         URL.revokeObjectURL(url)
      } catch (e) {
         console.error('Download failed:', e)
      }
      setDownloadingId(null)
   }

   const handleDownloadAll = () => {
      if (!filteredRecords.length) return
      setIsDownloadingAll(true)
      try {
         const header = 'Title,Type,Doctor,Department,Date,Attachments'
         const rows = filteredRecords.map(r => {
            const d = new Date(r.date).toLocaleDateString('en-IN')
            return [r.title, r.type, r.doctor, r.dept, d, r.size].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(',')
         })
         const csv = header + '\n' + rows.join('\n')
         const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
         const url = URL.createObjectURL(blob)
         const a = document.createElement('a')
         a.href = url
         a.download = `Medical_Records_${new Date().toISOString().slice(0,10)}.csv`
         a.click()
         URL.revokeObjectURL(url)
      } catch (e) {
         console.error('Download all failed:', e)
      }
      setIsDownloadingAll(false)
   }

   const handleUploadReport = async (e) => {
      e.preventDefault()
      if (!uploadForm.file) return alert('Please select a file')
      
      try {
         setIsUploading(true)
         const pRes = await getPatientByUserId(user.id)
         const patientId = pRes.data?._id
         
         const formData = new FormData()
         formData.append('patientId', patientId)
         formData.append('title', uploadForm.title)
         formData.append('description', uploadForm.description)
         formData.append('date', uploadForm.date)
         formData.append('report', uploadForm.file)
         
         await uploadPatientReport(formData)
         setIsUploadModalOpen(false)
         setUploadForm({ title: '', description: '', date: new Date().toISOString().split('T')[0], file: null })
         fetchRecords()
      } catch (error) {
         console.error("Upload failed:", error)
         alert("Failed to upload report")
      } finally {
         setIsUploading(false)
      }
   }

   const handleViewDetail = (record) => {
      setSelectedRecord(record)
   }

   const tableHeaders = ['Document Name', 'Category', 'Dept / Practitioner', 'Date', 'Actions']

   const renderRecordRow = (record) => (
      <tr key={record.id} className="hover:bg-slate-50/50 transition-all group">
         <td className="px-6 py-4 border-none text-left">
            <div className="flex items-center gap-4">
               <div className="p-2.5 bg-slate-100 text-slate-400 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all border border-slate-200 group-hover:border-emerald-400 shrink-0">
                  <FileText size={16} strokeWidth={3} />
               </div>
               <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 leading-tight truncate max-w-[200px] sm:max-w-[300px]">{record.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{record.size}</p>
               </div>
            </div>
         </td>
         <td className="px-6 py-4 text-center">
            <span className="inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-widest">
               {record.type}
            </span>
         </td>
         <td className="px-6 py-4 text-center text-sm">
            <div className="flex flex-col items-center">
               <p className="text-[13px] font-black text-slate-700 leading-tight">{record.dept}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-70">{record.doctor}</p>
            </div>
         </td>
         <td className="px-6 py-4 text-center">
            <span className="text-xs font-black text-slate-600 whitespace-nowrap">
               {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
         </td>
         <td className="px-6 py-4">
            <div className="flex justify-center items-center gap-3">
               <button onClick={() => handleDownload(record)} title="Download Summary" disabled={downloadingId === record.id} className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all border border-slate-100">
                  {downloadingId === record.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} strokeWidth={3} />}
               </button>
               <button onClick={() => handleViewDetail(record)} title="View Detail" className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-slate-100">
                  <Eye size={16} strokeWidth={3} />
               </button>
            </div>
         </td>
      </tr>
   );

   return (
      <div className="space-y-6 pb-10 animate-in fade-in duration-700 w-full px-2 sm:px-4 max-w-[100vw] overflow-x-hidden text-center">
         {/* Loading State Overlay */}
         {isLoading && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
               <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
                  <Loader2 size={32} className="animate-spin text-emerald-500" strokeWidth={3} />
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Hydrating Records...</p>
               </div>
            </div>
         )}
         
         {/* 🏙️ Hero Area */}
         <div className="bg-slate-900 px-8 py-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="text-left">
                  <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 leading-none">Diagnostic Center</p>
                  <h1 className="text-3xl sm:text-4xl font-black text-white leading-none tracking-tight">Clinical Documentation</h1>
                  <p className="text-slate-400 text-xs font-bold mt-4 opacity-80 decoration-emerald-500/30 underline underline-offset-4">Access lab reports, prescriptions and practitioner notes.</p>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-2xl active:scale-95 border-none">
                     <Upload size={16} strokeWidth={4} className="text-emerald-500" />
                     Upload Report
                  </button>
                  <button onClick={handleDownloadAll} disabled={isDownloadingAll || filteredRecords.length === 0} className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-2xl active:scale-95 border-none">
                     {isDownloadingAll ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} strokeWidth={4} />}
                     Export All
                  </button>
                  <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors shrink-0 outline-none">
                     <ArrowLeft size={16} strokeWidth={3} /> Back
                  </button>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-500/20 transition-all duration-700" />
         </div>

         {/* 🔍 Filters */}
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex p-1.5 bg-slate-100 rounded-2xl self-start lg:self-auto overflow-x-auto max-w-full">
               {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                     {cat}
                  </button>
               ))}
            </div>

            <div className="flex items-center gap-3 flex-1 w-full lg:max-w-lg">
               <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} strokeWidth={3} />
                  <input type="text" placeholder="Quick search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50/50 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none shadow-sm" />
               </div>

               <div className="relative shrink-0">
                  <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`p-4 rounded-xl transition-all border ${isFilterOpen ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:text-slate-900'}`}>
                     <Filter size={20} strokeWidth={3} />
                  </button>

                  <AnimatePresence>
                     {isFilterOpen && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full mt-3 w-60 bg-white rounded-[2rem] shadow-2xl border border-slate-100 py-4 z-[150] overflow-hidden">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-6 py-2">Service Unit</p>
                           {departments.map((dept) => (
                              <button key={dept} onClick={() => { setSelectedDept(dept); setIsFilterOpen(false); }} className={`w-full flex items-center justify-between px-6 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-colors ${selectedDept === dept ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                 {dept} {selectedDept === dept && <Check size={14} strokeWidth={4} />}
                              </button>
                           ))}
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </div>
         </div>

         {/* 🧾 Table Card */}
         <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="px-8 py-5 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30 text-left">
               <Activity size={16} className="text-emerald-500" strokeWidth={3} />
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Diagnostic History</h3>
            </div>
            <div className="p-2 sm:p-4">
               <ModernTable headers={tableHeaders} data={filteredRecords} renderRow={renderRecordRow} />
               {!isLoading && filteredRecords.length === 0 && (
                  <div className="py-24 text-center flex flex-col items-center gap-4 opacity-40">
                     <FileText size={48} strokeWidth={1} className="text-slate-300" />
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No matching documentation found</p>
                  </div>
               )}
            </div>
         </div>

         {/* 🔐 Security Note */}
         <div className="bg-blue-50/30 border border-blue-100/50 p-10 rounded-[2.5rem] flex flex-col sm:flex-row gap-6 items-center shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-blue-500 shadow-xl shadow-blue-500/10 shrink-0"><ShieldCheck size={28} strokeWidth={3} /></div>
            <div className="text-left">
               <p className="text-[11px] text-blue-900 uppercase tracking-widest font-black leading-relaxed">Secure Health Information Technology</p>
               <p className="text-[10px] text-blue-600 font-bold mt-2 opacity-80">All records are dual-encrypted under HIPAA-aligned protocols. Practitioner access is logged and verified via clinical identifiers.</p>
            </div>
         </div>

         {/* Record Detail Modal */}
         <AnimatePresence>
            {selectedRecord && (
               <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     className="w-full max-w-2xl bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                     
                     <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                           <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${selectedRecord.type === 'Prescription' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                              {selectedRecord.type === 'Prescription' ? <Activity size={20} strokeWidth={3} /> : <FileText size={20} strokeWidth={3} />}
                           </div>
                           <div className="text-left">
                              <h2 className="text-lg font-black text-slate-900 leading-tight">{selectedRecord.title}</h2>
                              <div className="flex items-center gap-2 mt-1">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{selectedRecord.type}</span>
                                 <span className="h-1 w-1 rounded-full bg-slate-300" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(selectedRecord.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                           </div>
                        </div>
                        <button onClick={() => setSelectedRecord(null)} className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center">
                           <X size={18} strokeWidth={3} />
                        </button>
                     </div>

                     <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide text-left">
                        {/* Info Grid - Only show if Hospital Sourced */}
                        {selectedRecord.source !== 'External' && (
                           <div className="grid grid-cols-2 gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 text-left">
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Practitioner / Doctor</p>
                                 <p className="text-sm font-black text-slate-900">{selectedRecord.doctor}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinic / Department</p>
                                 <p className="text-sm font-black text-slate-900">{selectedRecord.dept}</p>
                              </div>
                           </div>
                        )}

                        {/* Content */}
                        <div className="space-y-4">
                           {selectedRecord.type === 'Prescription' ? (
                              <div className="space-y-4">
                                 <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500" /> Prescribed Medicines
                                 </p>
                                 <div className="divide-y divide-slate-100 border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                                    {(() => {
                                       try {
                                          const meds = JSON.parse(selectedRecord.description)
                                          if (!Array.isArray(meds)) throw new Error('Not an array')
                                          return meds.map((m, i) => (
                                             <div key={i} className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white hover:bg-slate-50/50 transition-colors">
                                                <div>
                                                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Drug Name</p>
                                                   <p className="text-xs font-black text-slate-900">{m.name}</p>
                                                </div>
                                                <div>
                                                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Dosage</p>
                                                   <p className="text-xs font-bold text-slate-600">{m.dose}</p>
                                                </div>
                                                <div>
                                                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Frequency</p>
                                                   <p className="text-xs font-bold text-slate-600">{m.freq} · {m.duration}</p>
                                                </div>
                                                <div>
                                                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Instructions</p>
                                                   <p className="text-xs font-bold text-blue-600">{m.instructions}</p>
                                                </div>
                                             </div>
                                          ))
                                       } catch (e) {
                                          return <p className="p-6 text-xs font-bold text-slate-500 text-center italic">{selectedRecord.description || 'No medicine list provided.'}</p>
                                       }
                                    })()}
                                 </div>
                              </div>
                           ) : (
                              <div className="space-y-4 text-left">
                                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Documentation & Notes
                                 </p>
                                 <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm italic text-sm font-medium text-slate-600 leading-relaxed">
                                    {selectedRecord.description || 'No detailed notes found for this record.'}
                                 </div>
                              </div>
                           )}

                           {/* Attachments Section */}
                           {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
                              <div className="space-y-4 pt-4 border-t border-slate-100">
                                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Attached Documents
                                 </p>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedRecord.attachments.map((file, idx) => (
                                       <a key={idx} href={`http://localhost:5000${file.fileUrl}`} target="_blank" rel="noopener noreferrer"
                                          className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 transition-all group no-underline text-slate-900 shadow-sm hover:shadow-md">
                                          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                             <FileText size={18} strokeWidth={3} />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-xs font-black truncate">{file.fileName}</p>
                                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">View / Download</p>
                                          </div>
                                          <Eye size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                       </a>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                        <p className="text-[10px] font-bold text-slate-400 italic">
                           {selectedRecord.source === 'External' ? 'Digital Copy · Encrypted for Privacy' : `Validated by ${selectedRecord.doctor} on HMS Cloud`}
                        </p>
                        <button onClick={() => handleDownload(selectedRecord)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                           <Download size={14} strokeWidth={3} /> Save Offline
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Report Upload Modal */}
         <AnimatePresence>
            {isUploadModalOpen && (
               <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     className="w-full max-w-lg bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
                     
                     <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between shadow-sm shrink-0">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                              <Upload size={20} strokeWidth={3} />
                           </div>
                           <div className="text-left">
                              <h2 className="text-lg font-black text-slate-900 leading-tight">Upload Lab Report</h2>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">External Documentation</p>
                           </div>
                        </div>
                        <button onClick={() => setIsUploadModalOpen(false)} className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:transition-all flex items-center justify-center">
                           <X size={18} strokeWidth={3} />
                        </button>
                     </div>

                     <form onSubmit={handleUploadReport} className="p-8 space-y-6">
                        <div className="space-y-4 text-left">
                           <div>
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Report Title</label>
                              <input type="text" required value={uploadForm.title} onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                                 placeholder="e.g. Blood Test Report - Q1" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50/50 transition-all text-sm font-bold text-slate-900 outline-none" />
                           </div>
                           
                           <div>
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">File Selection</label>
                              <div className="relative">
                                 <input type="file" required onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                 <div className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 flex items-center gap-2 overflow-hidden">
                                    <File size={16} className="text-emerald-500 shrink-0" />
                                    <span className="truncate">{uploadForm.file ? uploadForm.file.name : 'Choose PDF/Image'}</span>
                                 </div>
                              </div>
                           </div>

                           <div>
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Description / Notes</label>
                              <textarea rows="3" value={uploadForm.description} onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                                 placeholder="Briefly describe the report content..."
                                 className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50/50 transition-all text-sm font-bold text-slate-900 outline-none resize-none" />
                           </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                           <button type="button" onClick={() => setIsUploadModalOpen(false)} 
                              className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                              Cancel
                           </button>
                           <button type="submit" disabled={isUploading}
                              className="flex-[2] flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50">
                              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} strokeWidth={4} />}
                              {isUploading ? 'Uploading...' : 'Confirm Upload'}
                           </button>
                        </div>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   )
}

export default MyRecords;
