import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Hash, Users, Edit3, Trash2, Save, UserPlus, Search, Activity, Droplet } from "lucide-react";
import API from "../../../api/axios";

const PatientHandler = () => {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    contact: "",
    address: "",
    bloodGroup: "O+",
    medicalHistory: ""
  });

  const [patients, setPatients] = useState([]);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔄 Fetch patients from backend
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await API.get("/patients");
      // The backend returns new ApiResponse(200, patients, "...")
      // and axios instance doesn't have a response interceptor that unwraps 'data' completely
      setPatients(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add / Update patient
  const handleSubmit = async () => {
    const { name, age, contact } = form;

    if (!name || !age || !contact) {
      alert("Name, Age and Contact are required!");
      return;
    }

    try {
      if (editId !== null) {
        // Update existing patient
        await API.put(`/patients/${editId}`, form);
        alert("Patient record updated! ✅");
      } else {
        // Create new patient
        await API.post("/patients", form);
        alert("Patient registered successfully! ✅");
      }
      
      // Reset form and refresh list
      setForm({
        name: "",
        age: "",
        gender: "Male",
        contact: "",
        address: "",
        bloodGroup: "O+",
        medicalHistory: ""
      });
      setEditId(null);
      fetchPatients();
    } catch (err) {
      console.error("Error saving patient:", err);
      alert(err.response?.data?.message || "Failed to save patient record.");
    }
  };

  const handleEdit = (patient) => {
    setForm({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      contact: patient.contact,
      address: patient.address || "",
      bloodGroup: patient.bloodGroup || "O+",
      medicalHistory: patient.medicalHistory || ""
    });
    setEditId(patient._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this patient record permanently?")) {
      try {
        await API.delete(`/patients/${id}`);
        fetchPatients();
      } catch (err) {
        console.error("Error deleting patient:", err);
        alert(err.response?.data?.message || "Unauthorized or Error deleting.");
      }
    }
  };

  // 🔍 Optional: Backend Search Integration
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        try {
          const res = await API.get(`/patients/search/${searchTerm}`);
          setPatients(res.data?.data || []);
        } catch (err) {
          console.error("Search failed:", err);
        }
      } else {
        fetchPatients();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="space-y-8 animate-in mt-10 fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Patient Registry</h2>
          <p className="text-slate-500 font-medium text-xs mt-1">Integrated with Hospital HMS Cloud Database.</p>
        </div>
        
        {/* Search Bar - Backend Integrated */}
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-500 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-11 pr-4 text-xs font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORM SECTION */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 h-fit lg:sticky lg:top-24"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              {editId !== null ? <Edit3 size={18} /> : <UserPlus size={18} />}
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {editId !== null ? "Update Record" : "Registration"}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={14} />
                <input
                  type="text"
                  name="name"
                  placeholder="Patient Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-50"
                />
              </div>
            </div>

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone</label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={14} />
                  <input
                    type="text"
                    name="contact"
                    placeholder="Contact"
                    value={form.contact}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-50"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Blood Group</label>
                <div className="relative group">
                   <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={14} />
                   <select
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-50 appearance-none"
                   >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Address</label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-3 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={14} />
                <textarea
                  name="address"
                  placeholder="Street, City..."
                  rows={2}
                  value={form.address}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-50 resize-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Condition / Note</label>
              <div className="relative group">
                <Activity className="absolute left-3 top-3 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={14} />
                <textarea
                  name="medicalHistory"
                  placeholder="Medical notes..."
                  rows={2}
                  value={form.medicalHistory}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-50 resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className={`w-full mt-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
                editId !== null ? "bg-purple-600 text-white shadow-purple-500/20" : "bg-slate-900 text-white"
              }`}
            >
              {editId !== null ? <Save size={14} /> : <UserPlus size={14} />}
              {editId !== null ? "Update Cloud Record" : "Register to Cloud"}
            </button>
            {editId !== null && (
              <button 
                onClick={() => {
                  setEditId(null);
                  setForm({ name: "", age: "", gender: "Male", contact: "", address: "", bloodGroup: "O+", medicalHistory: "" });
                }}
                className="w-full py-3 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </motion.div>

        {/* LIST SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]"
        >
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Global Master Data</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{patients.length} records in Database</p>
            </div>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users size={18} />
            </div>
          </div>

          <div className="p-4 flex-1">
            {loading ? (
               <div className="py-20 text-center flex flex-col items-center">
                  <div className="h-10 w-10 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying database...</p>
               </div>
            ) : patients.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-2">
                  <User size={24} />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No matching records found in cloud</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {patients.map((p) => (
                  <div
                    key={p._id}
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:px-6 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-purple-100 border border-transparent transition-all group"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="h-10 w-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-black shrink-0 transition-all group-hover:bg-purple-500 group-hover:text-white">
                        {p.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-black text-slate-900 truncate">{p.name}</p>
                          <span className="text-[9px] px-2 py-1 bg-purple-50 rounded text-purple-500 font-black uppercase tracking-widest border border-purple-100">{p.bloodGroup || "O+"}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                             {p.age} Yrs • {p.gender}
                          </p>
                          <span className="h-1 w-1 rounded-full bg-slate-300 hidden sm:block" />
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tight">
                            <Phone size={10} /> {p.contact}
                          </p>
                          <span className="h-1 w-1 rounded-full bg-slate-300 hidden sm:block" />
                          <p className="text-[10px] font-bold text-purple-400 flex items-center gap-1 uppercase truncate max-w-[150px]">
                            <MapPin size={10} /> {p.address || "Local"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
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

export default PatientHandler;