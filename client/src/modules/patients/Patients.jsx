import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Loader from '../../components/Loader'
import Modal from '../../components/Modal'
import AddPatient from './AddPatient'
import PatientTable from './PatientTable'
import usePatients from '../../hooks/usePatients'
import { GENDERS } from '../../utils/constants'

const PAGE_SIZE = 5

function Patients({ view = 'record' }) {
  const navigate = useNavigate()
  const {
    patients,
    loading,
    error,
    clearError,
    message,
    setMessage,
    savePatient,
    removePatient,
  } = usePatients()
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [viewCandidate, setViewCandidate] = useState(null)
  const [page, setPage] = useState(1)

  const filteredPatients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return patients.filter((patient) => {
      const byQuery = query
        ? [patient.name, patient.contact, patient.gender]
          .join(' ')
          .toLowerCase()
          .includes(query)
        : true
      const byGender = genderFilter ? patient.gender === genderFilter : true
      return byQuery && byGender
    })
  }, [patients, searchTerm, genderFilter])

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE))
  const paginatedPatients = filteredPatients.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  )

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const visiblePages = useMemo(() => {
    const maxButtons = 5
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const half = Math.floor(maxButtons / 2)
    let start = Math.max(1, page - half)
    let end = Math.min(totalPages, start + maxButtons - 1)
    start = Math.max(1, end - maxButtons + 1)

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [page, totalPages])

  const handleSavePatient = async (payload, editingId) => {
    try {
      await savePatient(payload, editingId)
      setSelectedPatient(null)
      setIsFormOpen(false)
      if (view === 'add') {
        navigate('/patients/record')
      }
    } catch {
      // Error is handled in custom hook state.
    }
  }

  const handleAddPatient = () => {
    navigate('/patients/add')
  }

  const handleEditPatient = (row) => {
    setSelectedPatient(row)
    setIsFormOpen(true)
  }

  const handleCancelForm = () => {
    setSelectedPatient(null)
    setIsFormOpen(false)
    if (view === 'add') {
      navigate('/patients/record')
    }
  }

  const handleDeletePatient = async () => {
    if (!deleteCandidate) return
    const id = deleteCandidate.id || deleteCandidate._id
    if (!id) return
    try {
      await removePatient(id)
      setDeleteCandidate(null)
    } catch {
      // Error is handled in custom hook state.
    }
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
    setPage(1)
  }

  const handleGenderFilter = (event) => {
    setGenderFilter(event.target.value)
    setPage(1)
  }

  const movePage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return
    setPage(nextPage)
  }

  return (
    <div className="space-y-8 pb-10">
      <Alert type="success" message={message} onClose={() => setMessage('')} />
      <Alert type="error" message={error} onClose={clearError} />

      {view === 'add' ? (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl w-full xl:max-w-6xl mx-auto animate-in fade-in zoom-in duration-300">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100 shrink-0">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Onboard New Patient</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Required clinical information</p>
              </div>
            </div>
            <button onClick={() => navigate('/patients/record')} className="px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">Cancel</button>
          </div>
          <AddPatient
            selectedPatient={null}
            onSubmit={handleSavePatient}
            onCancel={() => navigate('/patients/record')}
            loading={loading}
          />
        </div>
      ) : (
        <>
          {isFormOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
              <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden scale-in-center">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Patient Records</h3>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Editing existing patient profile</p>
                    </div>
                    <button onClick={handleCancelForm} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors border border-slate-100">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <AddPatient
                    selectedPatient={selectedPatient}
                    onSubmit={handleSavePatient}
                    onCancel={handleCancelForm}
                    loading={loading}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden text-slate-900">
            {/* Contextual Header */}
            <div className="border-b border-slate-100 px-8 pt-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-6 mb-8">
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    Patient Directory
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  </h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Management of clinical records & waitlists</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <button className="text-[11px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest pr-4 border-r border-slate-200 h-8 font-bold">Reports</button>
                  <Button variant="primary" onClick={handleAddPatient} className="!bg-[#0F172A] !hover:bg-slate-800 !rounded-xl px-6 h-11 flex items-center gap-2 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200 transition-transform active:scale-95">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Add Patient
                  </Button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-8">
                {['All Records', 'New Patients'].map((tab, idx) => (
                  <button
                    key={tab}
                    onClick={() => {
                      if (tab === 'New Patients') navigate('/patients/add');
                    }}
                    className={`pb-4 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all px-1 ${idx === 0 ? 'border-emerald-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {tab}
                    {idx === 1 && <span className="ml-2 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] font-bold">+24</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Filter Area */}
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center justify-between bg-slate-50/70 p-5 rounded-2xl border border-slate-100/50">
                <div className="flex-1 max-w-xl relative group">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    name="search"
                    placeholder="Search by name, ID, or contact number..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full bg-white border border-slate-200/60 rounded-xl py-3 pl-11 pr-4 text-[13px] font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 shadow-sm uppercase tracking-wide"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Filter by:</span>
                  <select
                    name="genderFilter"
                    value={genderFilter}
                    onChange={handleGenderFilter}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-[11px] font-black text-slate-600 uppercase tracking-widest outline-none transition-all hover:border-slate-300 focus:border-emerald-400 shadow-sm appearance-none min-w-[140px] text-center cursor-pointer"
                  >
                    <option value="">All Genders</option>
                    {GENDERS.map((gender) => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading && patients.length === 0 ? (
                <div className="py-20 text-slate-900">
                  <Loader label="Decrypting secure records..." />
                </div>
              ) : (
                <div className="space-y-6 text-slate-900">
                  <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                    <PatientTable
                      patients={paginatedPatients}
                      onEdit={handleEditPatient}
                      onDelete={setDeleteCandidate}
                      onView={setViewCandidate}
                    />
                  </div>

                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2 pt-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-200"></span>
                      Page {page} <span className="text-slate-200">/</span> {totalPages} <span className="text-slate-200">/</span> {filteredPatients.length} entries
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => movePage(page - 1)}
                        disabled={page <= 1}
                        className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                      </button>

                      <div className="flex items-center gap-1.5 px-1">
                        {visiblePages.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => movePage(p)}
                            className={`min-w-[36px] h-9 px-2 rounded-xl text-xs font-black transition-all ${p === page
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 scale-105'
                              : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
                              }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => movePage(page + 1)}
                        disabled={page >= totalPages}
                        className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Modal
            isOpen={Boolean(deleteCandidate)}
            title="Archival Confirmation"
            description="Are you sure you want to remove this patient from active directory? This record will be moved to archives."
            onCancel={() => setDeleteCandidate(null)}
            onConfirm={handleDeletePatient}
            loading={loading}
          />

          {viewCandidate && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
              <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-black shrink-0">
                        {viewCandidate.name ? viewCandidate.name.charAt(0) : 'P'}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{viewCandidate.name}</h3>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">ID: {viewCandidate.id || viewCandidate._id}</p>
                      </div>
                    </div>
                    <button onClick={() => setViewCandidate(null)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors border border-slate-100">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Age / Gender</p>
                        <p className="text-sm font-bold text-slate-900">{viewCandidate.age} Yrs • {viewCandidate.gender}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Group</p>
                        <p className="text-sm font-bold text-rose-500">{viewCandidate.bloodGroup || 'Not Specified'}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Details</p>
                        <p className="text-sm font-bold text-slate-900">{viewCandidate.contact || 'No contact'}</p>
                        {viewCandidate.email && <p className="text-xs font-bold text-emerald-600 mt-1">{viewCandidate.email}</p>}
                      </div>
                      <div className="pt-3 border-t border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Residential Address</p>
                        <p className="text-sm font-bold text-slate-900">{viewCandidate.address || 'Address not on file'}</p>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Medical History</p>
                      <p className="text-sm font-bold text-amber-900 leading-relaxed">{viewCandidate.medicalHistory || 'No prior medical history recorded.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Patients
