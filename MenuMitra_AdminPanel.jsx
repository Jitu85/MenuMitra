import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_OWNERS = [
  { id:"OWN001", businessName:"Sharma's Dhaba", ownerName:"Ramesh Sharma", businessType:"dhaba", email:"ramesh@sharma.com", phone:"9876543210", city:"Patna", state:"Bihar", joined:"2026-01-12", subscription:"active", expires:"2026-06-12", orders:342, revenue:68400, items:28, tables:12, gstin:"", fssai:"10012345678901", lastLogin:"2026-05-17", status:"active" },
  { id:"OWN002", businessName:"Raj Hotel & Restaurant", ownerName:"Sunil Rajput", businessType:"hotel", email:"sunil@rajhotel.com", phone:"9812345678", city:"Jaipur", state:"Rajasthan", joined:"2026-02-03", subscription:"active", expires:"2026-07-03", orders:891, revenue:267300, items:64, tables:30, gstin:"08ABCDE1234F1Z2", fssai:"10023456789012", lastLogin:"2026-05-18", status:"active" },
  { id:"OWN003", businessName:"Chai Corner", ownerName:"Meena Devi", businessType:"tea_stall", email:"meena@chaicorner.com", phone:"9765432109", city:"Varanasi", state:"Uttar Pradesh", joined:"2026-01-28", subscription:"expired", expires:"2026-04-28", orders:1203, revenue:36090, items:18, tables:8, gstin:"", fssai:"", lastLogin:"2026-04-25", status:"active" },
  { id:"OWN004", businessName:"Spice Garden Restaurant", ownerName:"Arjun Mehta", businessType:"restaurant", email:"arjun@spicegarden.com", phone:"9654321098", city:"Pune", state:"Maharashtra", joined:"2026-03-15", subscription:"active", expires:"2026-08-15", orders:456, revenue:136800, items:52, tables:20, gstin:"27FGHIJ5678K1Z3", fssai:"10034567890123", lastLogin:"2026-05-16", status:"active" },
  { id:"OWN005", businessName:"Café Monsoon", ownerName:"Priya Nair", businessType:"cafe", email:"priya@cafemonsoon.com", phone:"9543210987", city:"Kochi", state:"Kerala", joined:"2026-02-20", subscription:"active", expires:"2026-07-20", orders:678, revenue:135600, items:41, tables:15, gstin:"32KLMNO9012P1Z4", fssai:"10045678901234", lastLogin:"2026-05-17", status:"active" },
  { id:"OWN006", businessName:"Gupta Sweet House", ownerName:"Deepak Gupta", businessType:"bakery", email:"deepak@guptasweets.com", phone:"9432109876", city:"Agra", state:"Uttar Pradesh", joined:"2026-04-01", subscription:"trial", expires:"2026-05-31", orders:89, revenue:22250, items:35, tables:6, gstin:"", fssai:"10056789012345", lastLogin:"2026-05-15", status:"active" },
  { id:"OWN007", businessName:"Highway Dhaba 66", ownerName:"Harpreet Singh", businessType:"dhaba", email:"harpreet@hw66.com", phone:"9321098765", city:"Ludhiana", state:"Punjab", joined:"2026-01-05", subscription:"suspended", expires:"2026-02-05", orders:2341, revenue:468200, items:33, tables:25, gstin:"03PQRST3456U1Z5", fssai:"10067890123456", lastLogin:"2026-02-10", status:"suspended" },
  { id:"OWN008", businessName:"Nizam's Kitchen", ownerName:"Mohammed Nizam", businessType:"restaurant", email:"nizam@nizamskitchen.com", phone:"9210987654", city:"Hyderabad", state:"Telangana", joined:"2026-03-22", subscription:"active", expires:"2026-08-22", orders:534, revenue:160200, items:48, tables:18, gstin:"36UVWXY7890V1Z6", fssai:"10078901234567", lastLogin:"2026-05-18", status:"active" },
];

const MOCK_AUDIT_LOGS = [
  { id:"LOG001", timestamp:"2026-05-18 14:32:11", actor:"Jitu", role:"admin", action:"PASSWORD_RESET", target:"OWN003 - Meena Devi", ip:"103.21.58.44", details:"Force reset initiated. Reset email dispatched to meena@chaicorner.com." },
  { id:"LOG002", timestamp:"2026-05-18 11:20:05", actor:"Jitu", role:"admin", action:"ACCOUNT_SUSPENDED", target:"OWN007 - Harpreet Singh", ip:"103.21.58.44", details:"Account suspended due to non-payment for 90+ days." },
  { id:"LOG018", timestamp:"2026-05-18 09:15:33", actor:"sunil@rajhotel.com", role:"owner", action:"ITEM_ADDED", target:"OWN002 - Raj Hotel", ip:"49.36.12.100", details:"New item added: 'Butter Chicken' — ₹320." },
  { id:"LOG017", timestamp:"2026-05-17 22:44:18", actor:"ramesh@sharma.com", role:"owner", action:"PAYMENT_RECEIVED", target:"OWN001 - Sharma's Dhaba", ip:"49.15.33.77", details:"Order ORD-20260517-0089 paid. Amount: ₹490. Method: Razorpay." },
  { id:"LOG016", timestamp:"2026-05-17 18:30:02", actor:"Jitu", role:"admin", action:"SUBSCRIPTION_EXTENDED", target:"OWN005 - Priya Nair", ip:"103.21.58.44", details:"Subscription manually extended by 30 days as goodwill gesture." },
  { id:"LOG015", timestamp:"2026-05-17 16:12:55", actor:"deepak@guptasweets.com", role:"owner", action:"QR_DOWNLOADED", target:"OWN006 - Gupta Sweet House", ip:"59.88.12.201", details:"QR code downloaded in PNG format." },
  { id:"LOG014", timestamp:"2026-05-17 14:08:33", actor:"Jitu", role:"admin", action:"ACCOUNT_ACTIVATED", target:"OWN008 - Mohammed Nizam", ip:"103.21.58.44", details:"Account manually activated after email verification override." },
  { id:"LOG013", timestamp:"2026-05-16 20:55:11", actor:"priya@cafemonsoon.com", role:"owner", action:"PASSWORD_CHANGED", target:"OWN005 - Priya Nair", ip:"125.63.22.88", details:"Owner changed their account password via Settings." },
  { id:"LOG012", timestamp:"2026-05-16 17:33:44", actor:"arjun@spicegarden.com", role:"owner", action:"UPI_QR_UPLOADED", target:"OWN004 - Spice Garden", ip:"103.56.90.11", details:"New UPI QR image uploaded. Previous image replaced." },
  { id:"LOG011", timestamp:"2026-05-15 11:22:09", actor:"Jitu", role:"admin", action:"PLAN_PRICE_UPDATED", target:"MenuMitra Standard Plan", ip:"103.21.58.44", details:"Plan price updated from ₹200 to ₹100/month." },
];

const SIGNUP_TREND = [
  { month:"Dec", signups:3 }, { month:"Jan", signups:12 }, { month:"Feb", signups:18 },
  { month:"Mar", signups:24 }, { month:"Apr", signups:19 }, { month:"May", signups:31 },
];

const REVENUE_TREND = [
  { month:"Dec", revenue:300 }, { month:"Jan", revenue:1200 }, { month:"Feb", revenue:1800 },
  { month:"Mar", revenue:2400 }, { month:"Apr", revenue:1900 }, { month:"May", revenue:3100 },
];

const SUB_STATUS = [
  { name:"Active", value:5, color:"#2D6A4F" },
  { name:"Trial", value:1, color:"#E8650A" },
  { name:"Expired", value:1, color:"#C9920A" },
  { name:"Suspended", value:1, color:"#c0392b" },
];

const BIZ_TYPE_DATA = [
  { type:"Restaurant", count:2, color:"#E8650A" },
  { type:"Dhaba", count:2, color:"#C9920A" },
  { type:"Hotel", count:1, color:"#2D6A4F" },
  { type:"Café", count:1, color:"#5B8DB8" },
  { type:"Tea Stall", count:1, color:"#8B5CF6" },
  { type:"Bakery", count:1, color:"#EC4899" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const SUB_BADGE = {
  active:    { bg:"rgba(45,106,79,0.15)",   color:"#40916C", label:"Active"    },
  trial:     { bg:"rgba(232,101,10,0.15)",   color:"#E8650A", label:"Trial"     },
  expired:   { bg:"rgba(201,146,10,0.15)",   color:"#C9920A", label:"Expired"   },
  suspended: { bg:"rgba(192,57,43,0.15)",    color:"#e74c3c", label:"Suspended" },
};

const BIZ_LABELS = {
  restaurant:"Restaurant", hotel:"Hotel / Lodge", dhaba:"Dhaba",
  tea_stall:"Tea Stall", cafe:"Café", bakery:"Bakery", food_court:"Food Court", other:"Other",
};

function Badge({ status }) {
  const s = SUB_BADGE[status] || SUB_BADGE.expired;
  return (
    <span style={{ background:s.bg, color:s.color, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:800, letterSpacing:0.3 }}>
      {s.label}
    </span>
  );
}

function StatCard({ icon, label, value, sub, color="#E8650A", trend }) {
  return (
    <div style={{ background:"#1E1E1E", borderRadius:18, padding:"22px 24px", border:"1px solid rgba(255,255,255,0.06)", flex:"1 1 180px", minWidth:180 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div style={{ width:40, height:40, borderRadius:12, background:`${color}18`, border:`1.5px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:19 }}>{icon}</div>
        {trend && <span style={{ fontSize:11, fontWeight:700, color: trend>0?"#40916C":"#e74c3c" }}>{trend>0?"▲":"▼"} {Math.abs(trend)}%</span>}
      </div>
      <div style={{ fontSize:28, fontWeight:900, color:"white", fontFamily:"'Playfair Display',serif", lineHeight:1, marginBottom:4 }}>{value}</div>
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", fontWeight:500 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:4 }}>{sub}</div>}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function MenuMitraAdminPanel() {
  const [page, setPage] = useState("dashboard");
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterSub, setFilterSub] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("joined");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [resetModal, setResetModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [owners, setOwners] = useState(MOCK_OWNERS);
  const [auditFilter, setAuditFilter] = useState("all");
  const [planEdit, setPlanEdit] = useState(false);
  const [plan, setPlan] = useState({ name:"MenuMitra Standard", price:"100", trial:"30" });
  const PER_PAGE = 5;

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Filtered owners ──
  const filtered = owners.filter(o => {
    const q = searchQ.toLowerCase();
    const matchQ = !q || o.businessName.toLowerCase().includes(q) || o.ownerName.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) || o.city.toLowerCase().includes(q);
    const matchSub = filterSub==="all" || o.subscription===filterSub;
    const matchType = filterType==="all" || o.businessType===filterType;
    return matchQ && matchSub && matchType;
  }).sort((a,b) => {
    let va = a[sortBy], vb = b[sortBy];
    if (sortBy==="joined"||sortBy==="expires") { va=new Date(va); vb=new Date(vb); }
    if (va < vb) return sortDir==="asc"?-1:1;
    if (va > vb) return sortDir==="asc"?1:-1;
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageOwners = filtered.slice((currentPage-1)*PER_PAGE, currentPage*PER_PAGE);

  const toggleSort = (col) => {
    if (sortBy===col) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const handleStatusToggle = (owner) => {
    setConfirmModal({
      title: owner.status==="active" ? `Suspend ${owner.businessName}?` : `Activate ${owner.businessName}?`,
      msg: owner.status==="active"
        ? "This will immediately deactivate the owner's account and show a 'Menu Unavailable' message to their customers. This action is logged."
        : "This will restore full access to the owner's account. This action is logged.",
      action: () => {
        setOwners(prev => prev.map(o => o.id===owner.id ? {...o, status:o.status==="active"?"suspended":"active", subscription: o.status==="active"?"suspended":o.subscription} : o));
        showToast(`${owner.businessName} has been ${owner.status==="active"?"suspended":"activated"}.`, owner.status==="active"?"error":"success");
        setConfirmModal(null);
        if (selectedOwner?.id===owner.id) setSelectedOwner(prev => ({...prev, status:prev.status==="active"?"suspended":"active"}));
      }
    });
  };

  const handleForceReset = (owner) => {
    setResetModal(owner);
  };

  const sendReset = () => {
    showToast(`✅ Password reset email sent to ${resetModal.email}`, "success");
    setResetModal(null);
  };

  const handleExtendSub = (owner) => {
    setOwners(prev => prev.map(o => {
      if (o.id!==owner.id) return o;
      const newExp = new Date(o.expires);
      newExp.setDate(newExp.getDate()+30);
      return {...o, subscription:"active", expires:newExp.toISOString().split("T")[0]};
    }));
    showToast(`Subscription extended 30 days for ${owner.businessName}.`, "success");
  };

  const navItems = [
    { id:"dashboard", icon:"📊", label:"Dashboard" },
    { id:"owners", icon:"🏪", label:"Owner Management" },
    { id:"audit", icon:"📋", label:"Audit Logs" },
    { id:"plans", icon:"💳", label:"Subscription Plans" },
    { id:"resets", icon:"🔑", label:"Password Resets" },
  ];

  const toastColors = { success:"#2D6A4F", error:"#c0392b", info:"#1A1A1A", warning:"#C9920A" };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#111", fontFamily:"'DM Sans',sans-serif", color:"white" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(12px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)} }
        .page-anim { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .nav-item { transition:all 0.2s; border-radius:12px; cursor:pointer; }
        .nav-item:hover { background:rgba(255,255,255,0.06) !important; }
        .nav-item.active { background:rgba(232,101,10,0.15) !important; }
        .table-row:hover { background:rgba(255,255,255,0.04) !important; }
        .table-row { transition:background 0.15s; }
        .action-btn { transition:all 0.2s; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; border-radius:8px; }
        .action-btn:hover { filter:brightness(1.15); transform:translateY(-1px); }
        input:focus, select:focus { outline:none; border-color:#E8650A !important; box-shadow:0 0 0 3px rgba(232,101,10,0.12) !important; }
        input::placeholder, textarea::placeholder { color:#444; }
        .sort-th { cursor:pointer; user-select:none; }
        .sort-th:hover { color:white !important; }
        .custom-tooltip { background:#1E1E1E; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 14px; font-size:12px; }
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:9999,
          background:toastColors[toast.type]||"#1A1A1A", color:"white",
          padding:"12px 22px", borderRadius:12, fontWeight:700, fontSize:13,
          boxShadow:"0 12px 40px rgba(0,0,0,0.6)", whiteSpace:"nowrap",
          animation:"toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both"
        }}>{toast.msg}</div>
      )}

      {/* ── Confirm Modal ── */}
      {confirmModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:8000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#1E1E1E", borderRadius:20, padding:"32px", maxWidth:420, width:"100%", border:"1px solid rgba(255,255,255,0.1)", animation:"modalIn 0.3s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div style={{ fontSize:28, marginBottom:12 }}>⚠️</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, marginBottom:10 }}>{confirmModal.title}</h3>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", lineHeight:1.7, marginBottom:24 }}>{confirmModal.msg}</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirmModal(null)} style={{ flex:1, padding:"11px", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.6)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
              <button onClick={confirmModal.action} style={{ flex:1, padding:"11px", background:"linear-gradient(135deg,#E8650A,#C9920A)", color:"white", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {resetModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:8000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#1E1E1E", borderRadius:20, padding:"32px", maxWidth:440, width:"100%", border:"1px solid rgba(255,255,255,0.1)", animation:"modalIn 0.3s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🔑</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, marginBottom:6 }}>Force Password Reset</h3>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:20 }}>
              Owner: <strong style={{ color:"white" }}>{resetModal.ownerName}</strong> — {resetModal.businessName}
            </p>
            <div style={{ background:"rgba(232,101,10,0.08)", border:"1px solid rgba(232,101,10,0.2)", borderRadius:12, padding:"14px 16px", marginBottom:22 }}>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.75 }}>
                📧 A secure password reset link will be sent to:<br/>
                <strong style={{ color:"#E8650A", fontSize:13 }}>{resetModal.email}</strong><br/>
                The link will expire in <strong>30 minutes</strong>. This action will be recorded in the audit log.
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setResetModal(null)} style={{ flex:1, padding:"11px", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
              <button onClick={sendReset} style={{ flex:1, padding:"11px", background:"linear-gradient(135deg,#E8650A,#C9920A)", color:"white", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>📧 Send Reset Email</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════ */}
      <aside style={{
        width: sidebarOpen ? 230 : 70, flexShrink:0,
        background:"#141414", borderRight:"1px solid rgba(255,255,255,0.06)",
        display:"flex", flexDirection:"column",
        transition:"width 0.3s cubic-bezier(0.22,1,0.36,1)",
        overflow:"hidden", position:"sticky", top:0, height:"100vh", zIndex:100
      }}>
        {/* Logo */}
        <div style={{ padding:"22px 18px 16px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#E8650A,#C9920A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>🍽️</div>
          {sidebarOpen && (
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:16, color:"white", whiteSpace:"nowrap" }}>MenuMitra</div>
              <div style={{ fontSize:8, color:"#E8650A", fontWeight:700, letterSpacing:1.5, textTransform:"uppercase" }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* Admin badge */}
        {sidebarOpen && (
          <div style={{ margin:"12px 14px", background:"rgba(232,101,10,0.1)", border:"1px solid rgba(232,101,10,0.2)", borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", marginBottom:2 }}>🔐 Super Admin</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>Abhijit Kumar Misra</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.2)", marginTop:1 }}>ID: Jitu</div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, padding:"8px 10px", overflowY:"auto" }}>
          {navItems.map(item => (
            <div key={item.id} className={`nav-item${page===item.id?" active":""}`}
              onClick={() => { setPage(item.id); setSelectedOwner(null); }}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 12px", marginBottom:4,
                background: page===item.id ? "rgba(232,101,10,0.15)" : "transparent"
              }}>
              <span style={{ fontSize:17, flexShrink:0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize:13, fontWeight:page===item.id?700:500, color:page===item.id?"#E8650A":"rgba(255,255,255,0.55)", whiteSpace:"nowrap" }}>{item.label}</span>}
            </div>
          ))}
        </nav>

        {/* Collapse toggle + logout */}
        <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <div className="nav-item" onClick={() => setSidebarOpen(v=>!v)}
            style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", marginBottom:6 }}>
            <span style={{ fontSize:15, flexShrink:0 }}>{sidebarOpen?"◀":"▶"}</span>
            {sidebarOpen && <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)", fontWeight:500 }}>Collapse</span>}
          </div>
          <div className="nav-item"
            style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px" }}>
            <span style={{ fontSize:15, flexShrink:0 }}>🚪</span>
            {sidebarOpen && <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)", fontWeight:500 }}>Sign Out</span>}
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <main style={{ flex:1, overflowY:"auto", overflowX:"hidden", minWidth:0 }}>

        {/* Top bar */}
        <div style={{ background:"#141414", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"16px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50 }}>
          <div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontWeight:500, letterSpacing:0.5, textTransform:"uppercase", marginBottom:2 }}>
              MenuMitra Admin · {navItems.find(n=>n.id===page)?.icon} {navItems.find(n=>n.id===page)?.label}
            </div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.2)" }}>Monday, 18 May 2026</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#40916C", boxShadow:"0 0 0 3px rgba(64,145,108,0.2)", animation:"pulse 2s ease-in-out infinite" }}/>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)", fontWeight:600 }}>System Online</span>
          </div>
        </div>

        <div style={{ padding:"28px" }}>

          {/* ════════════════════════════════════
              PAGE: DASHBOARD
          ════════════════════════════════════ */}
          {page==="dashboard" && (
            <div className="page-anim">
              <div style={{ marginBottom:28 }}>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:900, marginBottom:4 }}>
                  Good morning, <em style={{ color:"#E8650A" }}>Abhijit</em> 👋
                </h1>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)" }}>Here is an overview of the MenuMitra platform as of today.</p>
              </div>

              {/* Stat cards */}
              <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:24 }}>
                <StatCard icon="🏪" label="Total Registered Owners" value="8" sub="Platform-wide" color="#E8650A" trend={23}/>
                <StatCard icon="✅" label="Active Subscriptions" value="5" sub="Paying accounts" color="#2D6A4F" trend={8}/>
                <StatCard icon="⏳" label="On Free Trial" value="1" sub="Expires May 31" color="#C9920A"/>
                <StatCard icon="❌" label="Expired / Suspended" value="2" sub="Needs attention" color="#c0392b"/>
                <StatCard icon="💰" label="Platform Revenue" value="₹700" sub="This month" color="#E8650A" trend={15}/>
                <StatCard icon="📦" label="Total Orders Today" value="127" sub="Across all businesses" color="#2D6A4F" trend={6}/>
              </div>

              {/* Charts row */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
                {/* Signup trend */}
                <div style={{ background:"#1E1E1E", borderRadius:18, padding:"24px", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ marginBottom:18 }}>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>New Owner Signups</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800 }}>Monthly Trend</div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={SIGNUP_TREND} margin={{top:4,right:8,left:-20,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                      <XAxis dataKey="month" tick={{fill:"rgba(255,255,255,0.35)",fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:"rgba(255,255,255,0.35)",fontSize:11}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{background:"#1E1E1E",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12}} labelStyle={{color:"white"}} itemStyle={{color:"#E8650A"}}/>
                      <Line type="monotone" dataKey="signups" stroke="#E8650A" strokeWidth={2.5} dot={{fill:"#E8650A",r:4}} activeDot={{r:6}}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Subscription donut */}
                <div style={{ background:"#1E1E1E", borderRadius:18, padding:"24px", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>Subscription Status</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800 }}>Breakdown</div>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={SUB_STATUS} cx="50%" cy="50%" innerRadius={46} outerRadius={72} paddingAngle={3} dataKey="value">
                        {SUB_STATUS.map((e,i) => <Cell key={i} fill={e.color}/>)}
                      </Pie>
                      <Tooltip contentStyle={{background:"#1E1E1E",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12}} itemStyle={{color:"white"}}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 14px", marginTop:4 }}>
                    {SUB_STATUS.map((s,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <div style={{ width:8, height:8, borderRadius:2, background:s.color }}/>
                        <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>{s.name} ({s.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Revenue + business type row */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
                {/* Revenue */}
                <div style={{ background:"#1E1E1E", borderRadius:18, padding:"24px", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ marginBottom:18 }}>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>Platform Subscription Revenue</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800 }}>Monthly (₹)</div>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={REVENUE_TREND} margin={{top:4,right:8,left:-20,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                      <XAxis dataKey="month" tick={{fill:"rgba(255,255,255,0.35)",fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:"rgba(255,255,255,0.35)",fontSize:11}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{background:"#1E1E1E",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12}} labelStyle={{color:"white"}} itemStyle={{color:"#C9920A"}} formatter={v=>`₹${v}`}/>
                      <Bar dataKey="revenue" fill="#C9920A" radius={[6,6,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Business types */}
                <div style={{ background:"#1E1E1E", borderRadius:18, padding:"24px", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ marginBottom:18 }}>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>Owner Categories</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800 }}>By Business Type</div>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={BIZ_TYPE_DATA} layout="vertical" margin={{top:0,right:8,left:10,bottom:0}}>
                      <XAxis type="number" tick={{fill:"rgba(255,255,255,0.35)",fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis dataKey="type" type="category" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} axisLine={false} tickLine={false} width={70}/>
                      <Tooltip contentStyle={{background:"#1E1E1E",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12}} labelStyle={{color:"white"}}/>
                      <Bar dataKey="count" radius={[0,6,6,0]}>
                        {BIZ_TYPE_DATA.map((e,i) => <Cell key={i} fill={e.color}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent activity */}
              <div style={{ background:"#1E1E1E", borderRadius:18, padding:"24px", border:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                  <div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>Latest Activity</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800 }}>Audit Feed</div>
                  </div>
                  <button onClick={() => setPage("audit")} style={{ fontSize:12, color:"#E8650A", fontWeight:700, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View All →</button>
                </div>
                {MOCK_AUDIT_LOGS.slice(0,5).map((log,i) => (
                  <div key={i} style={{ display:"flex", gap:14, padding:"11px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", alignItems:"flex-start" }}>
                    <div style={{ fontSize:18, flexShrink:0, marginTop:1 }}>
                      {log.action.includes("RESET")?"🔑":log.action.includes("SUSPEND")?"🔒":log.action.includes("ACTIV")?"✅":log.action.includes("PAYMENT")?"💳":log.action.includes("ITEM")?"🍽️":"📋"}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"white", marginBottom:2 }}>
                        <span style={{ color:"#E8650A" }}>{log.actor}</span> · <span style={{ color:"rgba(255,255,255,0.5)" }}>{log.action.replace(/_/g," ")}</span>
                      </div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{log.details}</div>
                    </div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.2)", flexShrink:0, textAlign:"right" }}>
                      {log.timestamp.split(" ")[1]}<br/>
                      <span style={{ color:"rgba(255,255,255,0.15)" }}>{log.timestamp.split(" ")[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════
              PAGE: OWNER MANAGEMENT
          ════════════════════════════════════ */}
          {page==="owners" && !selectedOwner && (
            <div className="page-anim">
              <div style={{ marginBottom:24 }}>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:900, marginBottom:4 }}>Owner Management</h1>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)" }}>{owners.length} registered business owners · {owners.filter(o=>o.subscription==="active").length} active subscriptions</p>
              </div>

              {/* Filters */}
              <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:20 }}>
                <div style={{ position:"relative", flex:"1 1 220px" }}>
                  <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14 }}>🔍</span>
                  <input value={searchQ} onChange={e=>{setSearchQ(e.target.value);setCurrentPage(1);}}
                    placeholder="Search by name, email or city…"
                    style={{ width:"100%", paddingLeft:36, paddingRight:14, paddingTop:10, paddingBottom:10,
                      background:"#1E1E1E", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10,
                      color:"white", fontSize:13, fontFamily:"'DM Sans',sans-serif" }}/>
                </div>
                {[
                  { label:"Status", key:"filterSub", val:filterSub, set:v=>{setFilterSub(v);setCurrentPage(1);}, opts:[["all","All Status"],["active","Active"],["trial","Trial"],["expired","Expired"],["suspended","Suspended"]] },
                  { label:"Type", key:"filterType", val:filterType, set:v=>{setFilterType(v);setCurrentPage(1);}, opts:[["all","All Types"],["restaurant","Restaurant"],["hotel","Hotel"],["dhaba","Dhaba"],["tea_stall","Tea Stall"],["cafe","Café"],["bakery","Bakery"]] },
                ].map(f => (
                  <select key={f.key} value={f.val} onChange={e=>f.set(e.target.value)}
                    style={{ padding:"10px 14px", background:"#1E1E1E", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, color:f.val==="all"?"rgba(255,255,255,0.4)":"white", fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:"pointer",
                      backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23E8650A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", paddingRight:32, appearance:"none" }}>
                    {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                ))}
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", paddingLeft:4 }}>
                  {filtered.length} result{filtered.length!==1?"s":""}
                </div>
              </div>

              {/* Table */}
              <div style={{ background:"#1E1E1E", borderRadius:18, border:"1px solid rgba(255,255,255,0.06)", overflow:"hidden" }}>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", minWidth:780 }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                        {[
                          ["Business","businessName"],["Owner","ownerName"],["Type",null],
                          ["City","city"],["Joined","joined"],["Sub","subscription"],
                          ["Revenue","revenue"],["Actions",null]
                        ].map(([label,col]) => (
                          <th key={label} onClick={col?()=>toggleSort(col):undefined}
                            className={col?"sort-th":""}
                            style={{ padding:"13px 16px", textAlign:"left", fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.35)", letterSpacing:1.2, textTransform:"uppercase", whiteSpace:"nowrap", cursor:col?"pointer":"default" }}>
                            {label} {col && sortBy===col ? (sortDir==="asc"?"↑":"↓") : ""}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageOwners.map(owner => (
                        <tr key={owner.id} className="table-row" style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding:"13px 16px" }}>
                            <div style={{ fontWeight:700, fontSize:13, color:"white", cursor:"pointer" }} onClick={()=>setSelectedOwner(owner)}>{owner.businessName}</div>
                            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:1 }}>{owner.id}</div>
                          </td>
                          <td style={{ padding:"13px 16px", fontSize:12, color:"rgba(255,255,255,0.6)" }}>{owner.ownerName}</td>
                          <td style={{ padding:"13px 16px" }}>
                            <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.06)", borderRadius:6, padding:"3px 8px" }}>{BIZ_LABELS[owner.businessType]||owner.businessType}</span>
                          </td>
                          <td style={{ padding:"13px 16px", fontSize:12, color:"rgba(255,255,255,0.5)" }}>{owner.city}, {owner.state.split(" ")[0]}</td>
                          <td style={{ padding:"13px 16px", fontSize:11, color:"rgba(255,255,255,0.4)" }}>{owner.joined}</td>
                          <td style={{ padding:"13px 16px" }}><Badge status={owner.subscription}/></td>
                          <td style={{ padding:"13px 16px", fontSize:12, fontWeight:700, color:"#C9920A" }}>₹{owner.revenue.toLocaleString()}</td>
                          <td style={{ padding:"13px 16px" }}>
                            <div style={{ display:"flex", gap:6 }}>
                              <button className="action-btn" onClick={()=>setSelectedOwner(owner)}
                                style={{ padding:"5px 10px", background:"rgba(232,101,10,0.15)", color:"#E8650A", fontSize:11, fontWeight:700 }}>
                                View
                              </button>
                              <button className="action-btn" onClick={()=>handleForceReset(owner)}
                                style={{ padding:"5px 10px", background:"rgba(201,146,10,0.15)", color:"#C9920A", fontSize:11, fontWeight:700 }}>
                                Reset
                              </button>
                              <button className="action-btn" onClick={()=>handleStatusToggle(owner)}
                                style={{ padding:"5px 10px", background:owner.status==="active"?"rgba(192,57,43,0.15)":"rgba(45,106,79,0.15)", color:owner.status==="active"?"#e74c3c":"#40916C", fontSize:11, fontWeight:700 }}>
                                {owner.status==="active"?"Suspend":"Activate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pageOwners.length===0 && (
                        <tr><td colSpan={8} style={{ padding:"40px", textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:14 }}>No owners match your filters.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ padding:"14px 16px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>Page {currentPage} of {totalPages}</span>
                    <div style={{ display:"flex", gap:6 }}>
                      {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                        <button key={p} onClick={()=>setCurrentPage(p)}
                          style={{ width:30, height:30, borderRadius:8, border:"none", cursor:"pointer", fontWeight:700, fontSize:12, fontFamily:"'DM Sans',sans-serif",
                            background:p===currentPage?"#E8650A":"rgba(255,255,255,0.06)",
                            color:p===currentPage?"white":"rgba(255,255,255,0.4)" }}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════
              PAGE: OWNER DETAIL
          ════════════════════════════════════ */}
          {page==="owners" && selectedOwner && (
            <div className="page-anim">
              <button onClick={()=>setSelectedOwner(null)}
                style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:13, fontWeight:600, cursor:"pointer", marginBottom:20, display:"flex", alignItems:"center", gap:6, fontFamily:"'DM Sans',sans-serif" }}>
                ← Back to Owner List
              </button>

              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>
                {/* Main info */}
                <div>
                  {/* Header card */}
                  <div style={{ background:"#1E1E1E", borderRadius:18, padding:"28px", border:"1px solid rgba(255,255,255,0.06)", marginBottom:20 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                      <div>
                        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:900, marginBottom:4 }}>{selectedOwner.businessName}</h1>
                        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                          <Badge status={selectedOwner.subscription}/>
                          <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{selectedOwner.id}</span>
                          <span style={{ fontSize:11, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.4)", borderRadius:6, padding:"2px 8px" }}>{BIZ_LABELS[selectedOwner.businessType]}</span>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        <button className="action-btn" onClick={()=>handleForceReset(selectedOwner)}
                          style={{ padding:"8px 14px", background:"rgba(201,146,10,0.15)", color:"#C9920A", fontSize:12, fontWeight:700 }}>
                          🔑 Reset Password
                        </button>
                        <button className="action-btn" onClick={()=>handleExtendSub(selectedOwner)}
                          style={{ padding:"8px 14px", background:"rgba(45,106,79,0.15)", color:"#40916C", fontSize:12, fontWeight:700 }}>
                          📅 +30 Days
                        </button>
                        <button className="action-btn" onClick={()=>handleStatusToggle(selectedOwner)}
                          style={{ padding:"8px 14px", background:selectedOwner.status==="active"?"rgba(192,57,43,0.15)":"rgba(45,106,79,0.15)", color:selectedOwner.status==="active"?"#e74c3c":"#40916C", fontSize:12, fontWeight:700 }}>
                          {selectedOwner.status==="active"?"🔒 Suspend":"✅ Activate"}
                        </button>
                      </div>
                    </div>

                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
                      {[
                        {icon:"📦",label:"Total Orders",val:selectedOwner.orders.toLocaleString()},
                        {icon:"💰",label:"Total Revenue",val:`₹${selectedOwner.revenue.toLocaleString()}`},
                        {icon:"🍽️",label:"Menu Items",val:selectedOwner.items},
                        {icon:"🪑",label:"Tables",val:selectedOwner.tables},
                        {icon:"📅",label:"Sub. Expires",val:selectedOwner.expires},
                        {icon:"🕐",label:"Last Login",val:selectedOwner.lastLogin},
                      ].map((s,i)=>(
                        <div key={i} style={{ background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"14px", border:"1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ fontSize:16, marginBottom:6 }}>{s.icon}</div>
                          <div style={{ fontSize:16, fontWeight:800, color:"white", marginBottom:2 }}>{s.val}</div>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:500 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Registration details */}
                  <div style={{ background:"#1E1E1E", borderRadius:18, padding:"24px", border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Registration Details</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1px", background:"rgba(255,255,255,0.05)", borderRadius:10, overflow:"hidden" }}>
                      {[
                        ["Owner Name",selectedOwner.ownerName],["Email",selectedOwner.email],
                        ["Mobile",`+91 ${selectedOwner.phone}`],["City",selectedOwner.city],
                        ["State",selectedOwner.state],["GSTIN",selectedOwner.gstin||"Not provided"],
                        ["FSSAI Licence",selectedOwner.fssai||"Not provided"],["Joined On",selectedOwner.joined],
                        ["Unique Slug",`${selectedOwner.businessName.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")}-${selectedOwner.city.toLowerCase()}`],
                        ["Menu URL",`menumitra.in/menu/…`],
                      ].map(([k,v],i)=>(
                        <div key={i} style={{ padding:"12px 16px", background:"#1E1E1E" }}>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:700, letterSpacing:0.5, marginBottom:4, textTransform:"uppercase" }}>{k}</div>
                          <div style={{ fontSize:13, color: v==="Not provided"?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.75)", fontWeight:500 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar: subscription + recent audit */}
                <div>
                  <div style={{ background:"#1E1E1E", borderRadius:18, padding:"22px", border:"1px solid rgba(255,255,255,0.06)", marginBottom:16 }}>
                    <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>Subscription</div>
                    <div style={{ textAlign:"center", padding:"16px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", marginBottom:14 }}>
                      <Badge status={selectedOwner.subscription}/>
                      <div style={{ fontSize:22, fontWeight:900, fontFamily:"'Playfair Display',serif", marginTop:10 }}>₹100/mo</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:4 }}>MenuMitra Standard</div>
                    </div>
                    {[
                      ["Start","2026-"+selectedOwner.joined.slice(5)],
                      ["Expires",selectedOwner.expires],
                      ["Auto-renew",selectedOwner.subscription==="active"?"Yes":"No"],
                    ].map(([k,v],i)=>(
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:12 }}>
                        <span style={{ color:"rgba(255,255,255,0.35)" }}>{k}</span>
                        <span style={{ color:"white", fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                    <button onClick={()=>handleExtendSub(selectedOwner)}
                      style={{ width:"100%", marginTop:14, padding:"10px", background:"rgba(45,106,79,0.15)", color:"#40916C", border:"1px solid rgba(45,106,79,0.25)", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                      + Extend 30 Days (Manual)
                    </button>
                  </div>

                  <div style={{ background:"#1E1E1E", borderRadius:18, padding:"22px", border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>Recent Activity</div>
                    {MOCK_AUDIT_LOGS.slice(0,4).map((log,i)=>(
                      <div key={i} style={{ padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:11 }}>
                        <div style={{ fontWeight:700, color:"rgba(255,255,255,0.55)", marginBottom:2 }}>{log.action.replace(/_/g," ")}</div>
                        <div style={{ color:"rgba(255,255,255,0.25)" }}>{log.timestamp}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════
              PAGE: AUDIT LOGS
          ════════════════════════════════════ */}
          {page==="audit" && (
            <div className="page-anim">
              <div style={{ marginBottom:24 }}>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:900, marginBottom:4 }}>Audit Logs</h1>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)" }}>Complete chronological record of all system actions for accountability and compliance.</p>
              </div>

              {/* Filter row */}
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
                {[["all","All Actions"],["admin","Admin Actions"],["owner","Owner Actions"],["PASSWORD_RESET","Password Resets"],["PAYMENT","Payments"],["ACCOUNT","Account Changes"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setAuditFilter(v)}
                    style={{ padding:"7px 14px", borderRadius:20, border:"none", cursor:"pointer", fontWeight:700, fontSize:11, fontFamily:"'DM Sans',sans-serif",
                      background:auditFilter===v?"#E8650A":"rgba(255,255,255,0.06)",
                      color:auditFilter===v?"white":"rgba(255,255,255,0.4)" }}>
                    {l}
                  </button>
                ))}
                <button style={{ marginLeft:"auto", padding:"7px 16px", borderRadius:20, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  ⬇ Export CSV
                </button>
              </div>

              <div style={{ background:"#1E1E1E", borderRadius:18, border:"1px solid rgba(255,255,255,0.06)", overflow:"hidden" }}>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                        {["Timestamp","Actor","Role","Action","Target","IP Address","Details"].map(h=>(
                          <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.3)", letterSpacing:1, textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_AUDIT_LOGS
                        .filter(log => auditFilter==="all" || log.role===auditFilter || log.action.includes(auditFilter.toUpperCase()))
                        .map((log,i)=>(
                        <tr key={i} className="table-row" style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding:"12px 16px", fontSize:11, color:"rgba(255,255,255,0.4)", whiteSpace:"nowrap" }}>
                            <div>{log.timestamp.split(" ")[0]}</div>
                            <div style={{ color:"rgba(255,255,255,0.6)", fontWeight:600 }}>{log.timestamp.split(" ")[1]}</div>
                          </td>
                          <td style={{ padding:"12px 16px", fontSize:12, fontWeight:700, color:log.role==="admin"?"#E8650A":"rgba(255,255,255,0.65)" }}>{log.actor}</td>
                          <td style={{ padding:"12px 16px" }}>
                            <span style={{ fontSize:10, fontWeight:700, background:log.role==="admin"?"rgba(232,101,10,0.15)":"rgba(255,255,255,0.06)", color:log.role==="admin"?"#E8650A":"rgba(255,255,255,0.4)", borderRadius:6, padding:"2px 8px", textTransform:"uppercase", letterSpacing:0.5 }}>
                              {log.role}
                            </span>
                          </td>
                          <td style={{ padding:"12px 16px" }}>
                            <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.7)", whiteSpace:"nowrap" }}>{log.action.replace(/_/g," ")}</span>
                          </td>
                          <td style={{ padding:"12px 16px", fontSize:11, color:"rgba(255,255,255,0.45)", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{log.target}</td>
                          <td style={{ padding:"12px 16px", fontSize:11, color:"rgba(255,255,255,0.3)", fontFamily:"monospace" }}>{log.ip}</td>
                          <td style={{ padding:"12px 16px", fontSize:11, color:"rgba(255,255,255,0.3)", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.25)" }}>Showing {Math.min(MOCK_AUDIT_LOGS.length,10)} of {MOCK_AUDIT_LOGS.length} entries · Logs retained for 365 days</span>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>All times in IST (UTC+5:30)</span>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════
              PAGE: SUBSCRIPTION PLANS
          ════════════════════════════════════ */}
          {page==="plans" && (
            <div className="page-anim">
              <div style={{ marginBottom:28 }}>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:900, marginBottom:4 }}>Subscription Plans</h1>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)" }}>Manage the MenuMitra subscription plan and pricing. Changes take effect for new subscribers immediately.</p>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                {/* Current plan display */}
                <div style={{ background:"#1E1E1E", borderRadius:18, padding:"28px", border:"1px solid rgba(232,101,10,0.2)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>Current Active Plan</div>
                      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900 }}>{plan.name}</h2>
                    </div>
                    <div style={{ background:"rgba(45,106,79,0.15)", color:"#40916C", borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:800 }}>LIVE</div>
                  </div>

                  <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:6 }}>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontSize:48, fontWeight:900, color:"#E8650A" }}>₹{plan.price}</span>
                    <span style={{ fontSize:16, color:"rgba(255,255,255,0.4)" }}>/month</span>
                  </div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.35)", marginBottom:24 }}>First {plan.trial} days free for all new signups</div>

                  <div style={{ marginBottom:24 }}>
                    {["Unlimited menu items & categories","English + Hindi bilingual menu","Unique QR code","UPI QR & Razorpay payments","Browser & Thermal print receipts","Sales analytics dashboard","Real-time order notifications","Zero delivery commission"].map((f,i)=>(
                      <div key={i} style={{ display:"flex", gap:10, alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ color:"#40916C", fontWeight:900, fontSize:13, flexShrink:0 }}>✓</span>
                        <span style={{ fontSize:13, color:"rgba(255,255,255,0.55)" }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[["Active Subscribers","5"],["On Trial","1"],["Total Subscribers","8"],["Monthly Revenue","₹500"]].map(([k,v],i)=>(
                      <div key={i} style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"12px", border:"1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize:18, fontWeight:800, color:"white", fontFamily:"'Playfair Display',serif" }}>{v}</div>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:2 }}>{k}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Edit plan */}
                <div style={{ background:"#1E1E1E", borderRadius:18, padding:"28px", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:20 }}>Edit Plan Settings</div>

                  {[
                    {label:"Plan Name", key:"name", type:"text", hint:"Displayed on the pricing page and owner's subscription tab."},
                    {label:"Monthly Price (₹)", key:"price", type:"number", hint:"Amount charged from Month 2 onwards. Changes apply to new subscriptions only."},
                    {label:"Free Trial Duration (days)", key:"trial", type:"number", hint:"Number of free days given to new signups before first charge."},
                  ].map(f=>(
                    <div key={f.key} style={{ marginBottom:20 }}>
                      <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:0.8, textTransform:"uppercase", marginBottom:8 }}>{f.label}</label>
                      <input type={f.type} value={plan[f.key]} onChange={e=>setPlan(p=>({...p,[f.key]:e.target.value}))} disabled={!planEdit}
                        style={{ width:"100%", padding:"12px 14px", background:planEdit?"rgba(255,255,255,0.07)":"rgba(255,255,255,0.03)", border:`1.5px solid ${planEdit?"rgba(232,101,10,0.4)":"rgba(255,255,255,0.07)"}`, borderRadius:10, color:planEdit?"white":"rgba(255,255,255,0.45)", fontSize:14, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}/>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)", marginTop:5 }}>{f.hint}</div>
                    </div>
                  ))}

                  <div style={{ background:"rgba(192,57,43,0.08)", border:"1px solid rgba(192,57,43,0.2)", borderRadius:10, padding:"12px 14px", marginBottom:20 }}>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", lineHeight:1.7 }}>
                      ⚠️ <strong style={{ color:"rgba(255,255,255,0.55)" }}>Warning:</strong> Changing the price will affect all future billing cycles but will not retroactively change active subscriptions. All plan changes are recorded in the audit log.
                    </div>
                  </div>

                  {!planEdit ? (
                    <button onClick={()=>setPlanEdit(true)}
                      style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#E8650A,#C9920A)", color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                      ✏️ Edit Plan Settings
                    </button>
                  ) : (
                    <div style={{ display:"flex", gap:10 }}>
                      <button onClick={()=>setPlanEdit(false)}
                        style={{ flex:1, padding:"12px", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                        Cancel
                      </button>
                      <button onClick={()=>{ setPlanEdit(false); showToast("✅ Plan settings saved and logged.", "success"); }}
                        style={{ flex:2, padding:"12px", background:"linear-gradient(135deg,#2D6A4F,#40916C)", color:"white", border:"none", borderRadius:12, fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                        ✅ Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════
              PAGE: PASSWORD RESETS
          ════════════════════════════════════ */}
          {page==="resets" && (
            <div className="page-anim">
              <div style={{ marginBottom:24 }}>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:900, marginBottom:4 }}>Password Reset Management</h1>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)" }}>Initiate force password resets for any owner. All reset actions are logged in the audit trail.</p>
              </div>

              {/* Quick reset box */}
              <div style={{ background:"#1E1E1E", borderRadius:18, padding:"24px", border:"1px solid rgba(255,255,255,0.06)", marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>🔑 Force Reset — Select Owner</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
                  {owners.map(owner=>(
                    <div key={owner.id} style={{ background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"white", marginBottom:2 }}>{owner.businessName}</div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{owner.ownerName}</div>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:1 }}>{owner.email}</div>
                      </div>
                      <button className="action-btn" onClick={()=>handleForceReset(owner)}
                        style={{ padding:"7px 12px", background:"rgba(201,146,10,0.15)", color:"#C9920A", fontSize:11, fontWeight:800, flexShrink:0 }}>
                        Reset
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset audit history */}
              <div style={{ background:"#1E1E1E", borderRadius:18, padding:"24px", border:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Recent Password Reset Log</div>
                {MOCK_AUDIT_LOGS.filter(l=>l.action.includes("PASSWORD") || l.action.includes("RESET")).map((log,i)=>(
                  <div key={i} style={{ display:"flex", gap:14, padding:"13px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", alignItems:"flex-start" }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:"rgba(201,146,10,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>🔑</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"white", marginBottom:3 }}>{log.target}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginBottom:2 }}>{log.details}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.2)" }}>By <strong style={{ color:"rgba(255,255,255,0.35)" }}>{log.actor}</strong> · {log.timestamp} · IP: {log.ip}</div>
                    </div>
                    <span style={{ fontSize:10, background:"rgba(201,146,10,0.12)", color:"#C9920A", borderRadius:6, padding:"3px 8px", fontWeight:800, flexShrink:0 }}>LOGGED</span>
                  </div>
                ))}
                {MOCK_AUDIT_LOGS.filter(l=>l.action.includes("PASSWORD")).length===0 && (
                  <div style={{ textAlign:"center", padding:"30px", color:"rgba(255,255,255,0.2)", fontSize:13 }}>No password reset events logged yet.</div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer credit */}
        <div style={{ textAlign:"center", padding:"20px 28px", borderTop:"1px solid rgba(255,255,255,0.05)", fontSize:11, color:"rgba(255,255,255,0.15)" }}>
          ✦ Developed by <strong style={{ color:"rgba(255,255,255,0.28)" }}>Abhijit Kumar Misra</strong> · MenuMitra Admin Panel · © 2026
        </div>
      </main>
    </div>
  );
}
