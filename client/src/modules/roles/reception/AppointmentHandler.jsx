import { useEffect, useState, useRef } from "react";
import API from "../../../api/axios";
import { updateAppointment } from "../../appointments/appointmentApi";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Calendar, Clock, User, Stethoscope, FileText, Trash2, CheckCircle2, Plus, LayoutGrid, Loader2, ChevronDown, CalendarClock, X } from "lucide-react";

const AppointmentHandler = () => {
  const [form, setForm] = useState({
    patient: "",
    patientId: "",
    doctor: "",
    doctorId: "",
    dept: "General",
    date: "",
    time: "",
    reason: "",
    historicalReport: "",
  });

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientList, setShowPatientList] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDocs, setFetchingDocs] = useState(false);
  const [rescheduleId, setRescheduleId] = useState(null);
  const formRef = useRef(null);

  // 🔄 Fetch everything
  const fetchData = async () => {
    setLoading(true);
    setFetchingDocs(true);
    try {
      const [appRes, docRes, patRes] = await Promise.all([
        API.get("/appointments"),
        API.get("/doctors"),
        API.get("/patients")
      ]);
      const apptsData = appRes.data?.data;
      const patsData = patRes.data?.data;
      setAppointments(Array.isArray(apptsData) ? apptsData : (apptsData?.appointments || []));
      setDoctors(docRes.data?.data || []);
      setPatients(Array.isArray(patsData) ? patsData : (patsData?.patients || []));
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
      setFetchingDocs(false);
    }
  };

  useEffect(() => {
    fetchData();
    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // ✏️ Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    // If moving from select doctor, update name and department automatically
    if (name === "doctorSelection") {
      const selectedDoc = doctors.find(d => d._id === value);
      if (selectedDoc) {
        setForm({
          ...form,
          doctor: selectedDoc.name,
          doctorId: selectedDoc._id,
          dept: selectedDoc.specialization || form.dept
        });
      }
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const resetForm = () => {
    setForm({ patient: "", patientId: "", doctor: "", doctorId: "", dept: "General", date: "", time: "", reason: "", historicalReport: "" });
    setPatientSearch("");
    setRescheduleId(null);
  };

  // 🔁 Pre-fill form for rescheduling a cancelled appointment
  const handleReschedule = (appt) => {
    setRescheduleId(appt._id);
    setForm({
      patient: appt.patient,
      patientId: appt.patientId || "",
      doctor: appt.doctor,
      doctorId: appt.doctorId || "",
      dept: appt.dept || "General",
      date: "",
      time: "",
      reason: appt.reason || "",
      historicalReport: "",
    });
    setPatientSearch(appt.patient);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ➕ Create or reschedule appointment
  const handleSubmit = async () => {
    if (!form.patient || !form.doctor || !form.date) {
      toast.warning("Please fill all required fields!");
      return;
    }

    try {
      if (rescheduleId) {
        await updateAppointment(rescheduleId, { date: form.date, time: form.time, status: "Scheduled", reason: form.reason });
        toast.success("Appointment rescheduled successfully! ✅");
      } else {
        await API.post("/appointments", form);
        toast.success("Appointment scheduled successfully! ✅");
      }
      fetchData();
      resetForm();
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors && errorData.errors.length > 0) {
        const errorMsg = errorData.errors.map(e => e.msg).join(", ");
        toast.error(`⚠️ BACKEND ERROR: ${errorMsg}`);
      } else {
        toast.error(errorData?.message || "Booking failed: Please check console.");
      }
    }
  };

  // ❌ Delete
  const handleDelete = async (e, id) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!window.confirm("Are you sure?")) return;
    try {
      await API.delete(`/appointments/${id}`);
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Appointment Desk</h2>
          <p className="text-slate-500 font-medium text-xs mt-1">Real-time scheduling with live Doctor availability.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* FORM SECTION */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 h-fit lg:sticky lg:top-24"
        >
          <div ref={formRef} className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${rescheduleId ? "bg-amber-50 text-amber-600" : "bg-purple-50 text-purple-600"}`}>
                {rescheduleId ? <CalendarClock size={18} /> : <Plus size={18} />}
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                {rescheduleId ? "Reschedule" : "New Booking"}
              </h3>
            </div>
            {rescheduleId && (
              <button onClick={resetForm} className="h-7 w-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Link Patient</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={14} />
                <input
                  type="text"
                  placeholder="Search existing patient..."
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setShowPatientList(true);
                  }}
                  onFocus={() => setShowPatientList(true)}
                  className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200"
                />
              </div>

              {/* Suggestions List */}
              {showPatientList && patientSearch && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-200">
                  {patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase())).length > 0 ? (
                    patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase())).map(p => (
                      <button
                        key={p._id}
                        onClick={() => {
                          setForm({ ...form, patient: p.name, patientId: p._id });
                          setPatientSearch(p.name);
                          setShowPatientList(false);
                        }}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-600 border-b border-slate-50 last:border-0 transition-colors flex items-center justify-between"
                      >
                        <span>{p.name}</span>
                        <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase font-mono">ID: {p._id.slice(-6)}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-400 font-bold italic">No matching patient found</div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Choose Doctor</label>
              <div className="relative group">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={14} />
                <select
                  name="doctorSelection"
                  value={form.doctorId}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200 appearance-none"
                >
                  <option value="">Select available doctor</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id} disabled={doc.status !== 'Active'}>
                      {doc.name} ({doc.specialization}) — {doc.status === 'Active' ? '✅ Online' : '❌ ' + doc.status}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Department</label>
              <div className="relative group">
                <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={14} />
                <input
                  type="text"
                  name="dept"
                  value={form.dept}
                  readOnly
                  className="w-full bg-slate-100 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-500 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="date"
                    name="date"
                    required
                    value={form.date}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-2 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Time</label>
                <div className="relative group">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="time"
                    name="time"
                    required
                    value={form.time}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-2 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Clinical Reason</label>
              <div className="relative group">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  name="reason"
                  placeholder="Short reason"
                  required
                  value={form.reason}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Medical History (Optional)</label>
              <div className="relative group">
                <FileText className="absolute left-3 top-3 text-slate-400" size={14} />
                <textarea
                  name="historicalReport"
                  placeholder="Reference clinical history..."
                  rows={2}
                  value={form.historicalReport}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200 resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!form.doctorId}
              className={`w-full mt-4 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${
                rescheduleId
                  ? "bg-amber-500 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/20 disabled:hover:bg-amber-500"
                  : "bg-slate-900 hover:bg-purple-600 hover:shadow-xl hover:shadow-purple-500/20 disabled:hover:bg-slate-900"
              }`}
            >
              {rescheduleId ? "Confirm Reschedule" : "Confirm Appointment"}
            </button>
          </div>
        </motion.div>

        {/* LIST SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]"
        >
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Schedule</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{appointments.length} Total visits</p>
            </div>
            <div className="flex items-center gap-2">
              {fetchingDocs && <Loader2 className="h-4 w-4 animate-spin text-purple-500" />}
              <button onClick={fetchData} className="p-2 hover:bg-slate-50 rounded-lg">
                <CheckCircle2 size={18} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="h-10 w-10 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying Cloud...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-2">
                  <Calendar size={24} />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No visiting slots booked</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {appointments.map((a) => (
                  <div
                    key={a._id}
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:px-6 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-purple-100 border border-transparent transition-all group"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black shrink-0 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        {a.patient?.charAt(0) || "P"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-black text-slate-900 truncate">
                          {a.patient}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                            <Stethoscope size={10} /> Dr. {a.doctor}
                          </p>
                          <span className="h-1 w-1 rounded-full bg-slate-300 hidden sm:block" />
                          <p className="text-[10px] font-bold text-purple-500 flex items-center gap-1 uppercase tracking-tight">
                            <Clock size={10} /> {new Date(a.date).toLocaleDateString()} | {a.time}
                          </p>
                          <span className="h-1 w-1 rounded-full bg-slate-300 hidden sm:block" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-200 px-1.5 rounded">{a.dept || "General"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                        a.status === "Cancelled" ? "border-rose-100 bg-rose-50 text-rose-600" :
                        a.status === "Completed" ? "border-emerald-100 bg-emerald-50 text-emerald-600" :
                        a.status === "In Progress" ? "border-blue-100 bg-blue-50 text-blue-600" :
                        "border-emerald-100 bg-emerald-50 text-emerald-600"
                      }`}>
                        {a.status || "Scheduled"}
                      </span>
                      {a.status === "Cancelled" && (
                        <button
                          onClick={() => handleReschedule(a)}
                          title="Reschedule this appointment"
                          className="p-2 rounded-xl bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          <CalendarClock size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, a._id)}
                        className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AppointmentHandler;