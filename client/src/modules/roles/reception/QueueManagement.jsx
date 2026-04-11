import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, User, Activity, Trash2, Edit3, Save, Plus, Search, CheckCircle2, Loader2, PlayCircle, SkipForward, Hash } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../../api/axios";

const QueueManagement = () => {
  const [form, setForm] = useState({
    name: "",
    status: "Waiting",
    doctorName: "",
    department: "General"
  });

  const [queue, setQueue] = useState([]);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await API.get("/queue");
      // The backend returns ApiResponse(200, entries, "...")
      setQueue(res.data?.data || []);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name) {
      toast.warning("Patient name is required!");
      return;
    }

    try {
      if (editId !== null) {
        await API.put(`/queue/${editId}`, { status: form.status });
        toast.success("Status updated! ✅");
      } else {
        await API.post("/queue", form);
        toast.success("Added to live queue! ✅");
      }
      
      setForm({ name: "", status: "Waiting", doctorName: "", department: "General" });
      setEditId(null);
      fetchQueue();
    } catch (err) {
      console.error("Queue action failed:", err);
      toast.error(err.response?.data?.message || "Operation failed.");
    }
  };

  const handleEdit = (entry) => {
    setForm({
      name: entry.name,
      status: entry.status,
      doctorName: entry.doctorName || "",
      department: entry.department || "General"
    });
    setEditId(entry._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove patient from queue?")) {
      try {
        await API.delete(`/queue/${id}`);
        fetchQueue();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleQuickStatus = async (id, newStatus) => {
     try {
        await API.put(`/queue/${id}`, { status: newStatus });
        fetchQueue();
     } catch (err) {
        console.error("Status update failed:", err);
     }
  };

  const filteredQueue = queue.filter(q => 
    q.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusIcons = {
    "Waiting": <Clock size={12} className="text-orange-500" />,
    "In Progress": <Loader2 size={12} className="text-blue-500 animate-spin" />,
    "Done": <CheckCircle2 size={12} className="text-emerald-500" />,
    "Skipped": <SkipForward size={12} className="text-slate-500" />,
  };

  const statusColors = {
    "Waiting": "bg-orange-50 text-orange-600 border-orange-100",
    "In Progress": "bg-blue-50 text-blue-600 border-blue-100",
    "Done": "bg-emerald-50 text-emerald-600 border-emerald-100",
    "Skipped": "bg-slate-50 text-slate-400 border-slate-100",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Queue Monitor</h2>

        </div>
        
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-white border border-slate-200 rounded-2xl p-1 gap-1 shadow-sm">
              {['Waiting', 'In Progress', 'Done'].map(s => (
                <div key={s} className="px-3 py-1 flex items-center gap-1.5">
                   <div className={`h-1.5 w-1.5 rounded-full ${s === 'Waiting' ? 'bg-orange-500' : s === 'In Progress' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s}</span>
                </div>
              ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 h-fit lg:sticky lg:top-5"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              {editId !== null ? <Edit3 size={18} /> : <Plus size={18} />}
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {editId !== null ? "Status Tweak" : "Manual Entry"}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Patient Identity</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={14} />
                <input
                  type="text"
                  name="name"
                  placeholder="Patient Name"
                  disabled={editId !== null}
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200 disabled:opacity-50"
                />
              </div>
            </div>

            {editId === null && (
              <>
                 <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Consultant</label>
                  <input
                    type="text"
                    name="doctorName"
                    placeholder="Doctor (optional)"
                    value={form.doctorName}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 px-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200"
                  />
                </div>
                 <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Dept</label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 px-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200 appearance-none"
                  >
                    <option value="General">General</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedic">Orthopedic</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 px-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-50 appearance-none"
              >
                <option value="Waiting">Waiting</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
                <option value="Skipped">Skipped</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              className={`w-full mt-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
                editId !== null ? "bg-orange-600 shadow-orange-500/20 text-white" : "bg-slate-900 text-white"
              }`}
            >
              {editId !== null ? <Save size={14} /> : <Plus size={14} />}
              {editId !== null ? "Update Monitor" : "Enter Queue"}
            </button>
            {editId !== null && (
               <button 
                onClick={() => { setEditId(null); setForm({ name: "", status: "Waiting", doctorName: "", department: "General" }); }}
                className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
               >
                 Cancel
               </button>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:max-h-[calc(100vh-180px)]"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-b border-slate-50 gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Patients</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{filteredQueue.length} records in live cloud</p>
            </div>
            
            <div className="relative group w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="text"
                placeholder="Find in queue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-transparent rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200"
              />
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {loading ? (
                <div className="py-20 text-center flex flex-col items-center">
                  <div className="h-10 w-10 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing monitor...</p>
               </div>
            ) : filteredQueue.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-2">
                  <Activity size={24} />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Front desk queue is empty</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredQueue.map((q) => (
                  <div
                    key={q._id}
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:px-6 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-purple-100 border border-transparent transition-all group"
                  >
                    <div className="flex items-center gap-4 w-full">
                       <div className="relative shrink-0">
                          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black transition-colors group-hover:bg-purple-600">
                            {q.token}
                          </div>
                          <div className={`absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white flex items-center justify-center ${q.status === 'Waiting' ? 'bg-orange-500' : q.status === 'In Progress' ? 'bg-blue-500' : q.status === 'Done' ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                             {q.status === 'In Progress' && <Loader2 size={8} className="text-white animate-spin" />}
                          </div>
                       </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-black text-slate-900 truncate uppercase tracking-tight">{q.name}</p>
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest border border-purple-100 px-1 bg-purple-50/50 rounded">{q.department || "General"}</span>
                           <span className="text-[10px] font-medium text-slate-400">Dr. {q.doctorName || "Pending Assign"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                      
                      <div className="flex items-center gap-1 mr-2">
                         {q.status === "Waiting" && (
                           <button onClick={() => handleQuickStatus(q._id, "In Progress")} title="Call Now" className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                              <PlayCircle size={14} />
                           </button>
                         )}
                         {q.status === "In Progress" && (
                           <button onClick={() => handleQuickStatus(q._id, "Done")} title="Complete" className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">
                              <CheckCircle2 size={14} />
                           </button>
                         )}
                      </div>

                      <span className={`px-2.5 py-1 flex items-center gap-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[q.status]}`}>
                        {statusIcons[q.status]}
                        {q.status}
                      </span>
                      
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => handleEdit(q)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
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

export default QueueManagement;