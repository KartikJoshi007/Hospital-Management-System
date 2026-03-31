import { useState } from 'react'
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Table from '../../components/Table'

function PatientTable({ patients, onEdit, onDelete, onView }) {
  const [activeDropdown, setActiveDropdown] = useState(null)

  const columns = [
    {
      key: 'name',
      title: 'Patient Info',
      align: 'center',
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black group-hover:bg-emerald-500 group-hover:text-white transition-all">
            {row.name ? row.name.split(' ').map(n => n[0]).join('') : 'P'}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 leading-tight">{row.name || '-'}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{row.email || 'No email'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'details',
      title: 'Details',
      align: 'center',
      render: (row) => (
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-700">{row.age} Yrs • {row.gender}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{row.bloodGroup || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'contact',
      title: 'Contact',
      align: 'center',
      render: (row) => (
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-700">{row.contact || '-'}</span>
          <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">{row.address || 'No address'}</span>
        </div>
      ),
    },
    {
      key: 'medicalHistory',
      title: 'Medical History',
      align: 'center',
      render: (row) => (
        <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-wider border border-slate-100/50 block max-w-[150px] truncate mx-auto">
          {row.medicalHistory || 'Clean Record'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={() => onView && onView(row)}
            className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 transition-all border border-transparent hover:border-emerald-100 shadow-sm"
          >
            <Eye size={16} />
          </button>
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === row.id || activeDropdown === row._id ? null : (row.id || row._id))}
              className={`p-2 rounded-lg transition-all border border-transparent ${activeDropdown === (row.id || row._id) ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-400 hover:bg-white hover:shadow-sm hover:text-slate-900 hover:border-slate-100'}`}
            >
              <MoreVertical size={14} />
            </button>

            <AnimatePresence>
              {(activeDropdown === row.id || activeDropdown === row._id) && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setActiveDropdown(null)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100 py-2 z-20 overflow-hidden text-left"
                  >
                    <button
                      onClick={() => {
                        onEdit(row)
                        setActiveDropdown(null)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      <Edit size={14} /> Edit Patient
                    </button>
                    <div className="h-px bg-slate-50 mx-2 my-1" />
                    <button
                      onClick={() => {
                        onDelete(row)
                        setActiveDropdown(null)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={14} /> Delete Patient
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      ),
    },
  ]

  return <Table columns={columns} data={patients} emptyText="No patients found" />
}

export default PatientTable
