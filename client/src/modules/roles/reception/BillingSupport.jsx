import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, User, Activity, IndianRupee, Plus, Receipt, Trash2, Edit3, Save, Search, CheckCircle2, AlertCircle, Filter } from "lucide-react";
import API from "../../../api/axios";

const BillingSupport = () => {
  const [form, setForm] = useState({
    patientName: "",
    service: "",
    amount: "",
    type: "OPD",
    status: "Pending",
  });

  const [bills, setBills] = useState([]);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalRevenue: 0, totalPending: 0 });

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await API.get("/bills");
      // The backend returns { status: '...', data: { bills: [], pagination: {} } }
      setBills(res.data?.data?.bills || []);
      
      // Also fetch stats to show real revenue
      const statsRes = await API.get("/bills/stats");
      setStats(statsRes.data?.data?.summary || { totalRevenue: 0, totalPending: 0 });
    } catch (err) {
      console.error("Error fetching bills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.patientName || !form.service || !form.amount) {
      alert("All basic fields are required!");
      return;
    }

    try {
      if (editId !== null) {
        await API.put(`/bills/${editId}`, form);
        alert("Invoice updated! ✅");
      } else {
        await API.post("/bills", form);
        alert("Invoice generated! ✅");
      }
      
      setForm({ patientName: "", service: "", amount: "", type: "OPD", status: "Pending" });
      setEditId(null);
      fetchBills();
    } catch (err) {
      console.error("Error saving bill:", err);
      alert(err.response?.data?.message || "Failed to save invoice.");
    }
  };

  const handleEdit = (bill) => {
    setForm({
      patientName: bill.patientName,
      service: bill.service || bill.notes || "Medical Service",
      amount: bill.amount,
      type: bill.type || "OPD",
      status: bill.paymentStatus || "Pending",
    });
    setEditId(bill._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this invoice records permanently?")) {
      try {
        await API.delete(`/bills/${id}`);
        fetchBills();
      } catch (err) {
        console.error("Error deleting bill:", err);
      }
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await API.patch(`/bills/${id}/pay`, { paymentMethod: "cash" });
      alert("Marked as Paid! ✅");
      fetchBills();
    } catch (err) {
       console.error("Failed to mark as paid:", err);
    }
  };

  const filteredBills = bills.filter(b => 
    b.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.service?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 mt-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Billing & Finance</h2>
          <p className="text-slate-500 font-medium text-xs mt-1">Live HMS Financial Dashboard Integrated with Backend.</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2 flex items-center gap-3">
              <div className="p-2 bg-emerald-500 text-white rounded-lg">
                <IndianRupee size={14} />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Revenue (Paid)</p>
                <p className="text-sm font-black text-slate-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
              </div>
           </div>
           <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-2 flex items-center gap-3">
              <div className="p-2 bg-orange-500 text-white rounded-lg">
                <AlertCircle size={14} />
              </div>
              <div>
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Pending</p>
                <p className="text-sm font-black text-slate-900">₹{stats.totalPending.toLocaleString('en-IN')}</p>
              </div>
           </div>
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
              {editId !== null ? <Edit3 size={18} /> : <Receipt size={18} />}
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {editId !== null ? "Edit Document" : "Generator"}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Patient Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={14} />
                <input
                  type="text"
                  name="patientName"
                  placeholder="Full Name"
                  value={form.patientName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
              <div className="relative group">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={14} />
                <input
                  type="text"
                  name="service"
                  placeholder="Service description"
                  value={form.service}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Dept/Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 px-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-50 appearance-none"
                >
                  <option value="OPD">OPD</option>
                  <option value="IPD">IPD</option>
                  <option value="Lab">Lab</option>
                  <option value="Pharmacy">Pharmacy</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Amount</label>
                <div className="relative group">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={14} />
                  <input
                    type="number"
                    name="amount"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Status</label>
              <div className="flex gap-2">
                 {["Pending", "Paid"].map(s => (
                   <button
                    key={s}
                    type="button"
                    onClick={() => setForm({...form, status: s})}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      form.status === s ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                    }`}
                   >
                     {s}
                   </button>
                 ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className={`w-full mt-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
                editId !== null ? "bg-purple-600 text-white shadow-purple-500/20" : "bg-slate-900 text-white"
              }`}
            >
              {editId !== null ? <Save size={14} /> : <Plus size={14} />}
              {editId !== null ? "Update Invoice" : "Generate Invoice"}
            </button>
            {editId !== null && (
              <button 
                onClick={() => {
                  setEditId(null);
                  setForm({ patientName: "", service: "", amount: "", type: "OPD", status: "Pending" });
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
          <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-b border-slate-50 gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Database Ledger</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{filteredBills.length} Invoices available</p>
            </div>
            
            <div className="relative group w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="text"
                placeholder="Patient or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-transparent rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-purple-200"
              />
            </div>
          </div>

          <div className="p-4 flex-1">
            {loading ? (
                <div className="py-20 text-center flex flex-col items-center">
                  <div className="h-10 w-10 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying cloud ledger...</p>
               </div>
            ) : filteredBills.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-2">
                  <Receipt size={24} />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No financial records found</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredBills.map((bill) => (
                  <div
                    key={bill._id}
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:px-6 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-purple-100 border border-transparent transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                        bill.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500' : 'bg-orange-100 text-orange-600 group-hover:bg-orange-500'
                      } group-hover:text-white`}>
                        <IndianRupee size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-black text-slate-900 truncate">{bill.patientName || "Anonymous"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 rounded text-slate-500 font-black uppercase tracking-widest">{bill.type || "OPD"}</span>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">
                            {bill.service || "General Care"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-black text-slate-900">₹{bill.amount.toLocaleString('en-IN')}</p>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${bill.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-orange-500'}`}>
                          {bill.paymentStatus}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {bill.paymentStatus !== "Paid" && (
                           <button
                             onClick={() => handleMarkAsPaid(bill._id)}
                             title="Mark as Paid"
                             className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                           >
                             <CheckCircle2 size={14} />
                           </button>
                        )}
                        <button
                          onClick={() => handleEdit(bill)}
                          className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(bill._id)}
                          className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          <Trash2 size={14} />
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

export default BillingSupport;