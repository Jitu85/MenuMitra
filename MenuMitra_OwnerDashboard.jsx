import { useState, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const OWNER = {
  businessName: "Sharma's Dhaba",
  ownerName: "Ramesh Sharma",
  email: "ramesh@sharma.com",
  phone: "9876543210",
  city: "Patna", state: "Bihar",
  businessType: "dhaba",
  slug: "sharmas-dhaba-patna",
  tableCount: 12,
  subscriptionStatus: "active",
  subscriptionExpires: "2026-06-12",
  upiId: "ramesh@upi",
  paymentPref: "both",
};

const INIT_CATEGORIES = [
  { id:"CAT1", name:"Main Course", nameHi:"मुख्य व्यंजन", items:6 },
  { id:"CAT2", name:"Breads", nameHi:"रोटी / ब्रेड", items:4 },
  { id:"CAT3", name:"Beverages", nameHi:"पेय पदार्थ", items:5 },
  { id:"CAT4", name:"Starters", nameHi:"स्टार्टर", items:3 },
  { id:"CAT5", name:"Desserts", nameHi:"मिठाई", items:2 },
];

const INIT_ITEMS = [
  { id:"ITM001", categoryId:"CAT1", nameEn:"Dal Makhani", nameHi:"दाल मखनी", descEn:"Creamy black lentil curry", descHi:"मलाईदार दाल करी", price:180, isVeg:true, isAvailable:true, photo:"🍛", sales:142 },
  { id:"ITM002", categoryId:"CAT1", nameEn:"Paneer Butter Masala", nameHi:"पनीर बटर मसाला", descEn:"Cottage cheese in rich tomato gravy", descHi:"पनीर टमाटर की ग्रेवी में", price:220, isVeg:true, isAvailable:true, photo:"🧆", sales:98 },
  { id:"ITM003", categoryId:"CAT1", nameEn:"Chicken Curry", nameHi:"चिकन करी", descEn:"Traditional homestyle chicken curry", descHi:"देसी चिकन करी", price:280, isVeg:false, isAvailable:true, photo:"🍗", sales:211 },
  { id:"ITM004", categoryId:"CAT1", nameEn:"Mutton Rogan Josh", nameHi:"मटन रोगन जोश", descEn:"Slow-cooked mutton in aromatic spices", descHi:"धीमी आंच पर पका मटन", price:380, isVeg:false, isAvailable:false, photo:"🥘", sales:67 },
  { id:"ITM005", categoryId:"CAT2", nameEn:"Butter Naan", nameHi:"बटर नान", descEn:"Soft leavened bread with butter", descHi:"मक्खन के साथ नरम नान", price:40, isVeg:true, isAvailable:true, photo:"🫓", sales:289 },
  { id:"ITM006", categoryId:"CAT2", nameEn:"Tandoori Roti", nameHi:"तंदूरी रोटी", descEn:"Whole wheat bread from tandoor", descHi:"तंदूर की गेहूं की रोटी", price:25, isVeg:true, isAvailable:true, photo:"🫓", sales:334 },
  { id:"ITM007", categoryId:"CAT3", nameEn:"Masala Chai", nameHi:"मसाला चाय", descEn:"Indian spiced milk tea", descHi:"भारतीय मसाला चाय", price:30, isVeg:true, isAvailable:true, photo:"☕", sales:512 },
  { id:"ITM008", categoryId:"CAT3", nameEn:"Lassi (Sweet)", nameHi:"मीठी लस्सी", descEn:"Chilled sweet yoghurt drink", descHi:"ठंडी मीठी लस्सी", price:60, isVeg:true, isAvailable:true, photo:"🥛", sales:178 },
  { id:"ITM009", categoryId:"CAT4", nameEn:"Paneer Tikka", nameHi:"पनीर टिक्का", descEn:"Grilled cottage cheese with spices", descHi:"मसालेदार ग्रिल्ड पनीर", price:240, isVeg:true, isAvailable:true, photo:"🧆", sales:134 },
  { id:"ITM010", categoryId:"CAT5", nameEn:"Gulab Jamun", nameHi:"गुलाब जामुन", descEn:"Soft milk dumplings in sugar syrup", descHi:"चाशनी में डूबे गुलाब जामुन", price:80, isVeg:true, isAvailable:true, photo:"🍮", sales:89 },
];

const MOCK_ORDERS = [
  { id:"ORD-20260518-0042", table:"5", items:[{name:"Dal Makhani",qty:2,price:180},{name:"Butter Naan",qty:4,price:40},{name:"Masala Chai",qty:2,price:30}], total:580, status:"paid", method:"razorpay", time:"14:32", date:"2026-05-18" },
  { id:"ORD-20260518-0041", table:"3", items:[{name:"Chicken Curry",qty:1,price:280},{name:"Tandoori Roti",qty:3,price:25}], total:355, status:"paid", method:"upi", time:"13:55", date:"2026-05-18" },
  { id:"ORD-20260518-0040", table:"8", items:[{name:"Paneer Butter Masala",qty:2,price:220},{name:"Butter Naan",qty:3,price:40},{name:"Lassi (Sweet)",qty:2,price:60}], total:680, status:"paid", method:"razorpay", time:"13:20", date:"2026-05-18" },
  { id:"ORD-20260518-0039", table:"1", items:[{name:"Paneer Tikka",qty:1,price:240},{name:"Masala Chai",qty:3,price:30}], total:330, status:"pending", method:"upi", time:"12:48", date:"2026-05-18" },
  { id:"ORD-20260517-0089", table:"7", items:[{name:"Mutton Rogan Josh",qty:1,price:380},{name:"Butter Naan",qty:2,price:40},{name:"Gulab Jamun",qty:2,price:80}], total:620, status:"paid", method:"razorpay", time:"20:15", date:"2026-05-17" },
  { id:"ORD-20260517-0088", table:"2", items:[{name:"Dal Makhani",qty:1,price:180},{name:"Tandoori Roti",qty:2,price:25},{name:"Lassi (Sweet)",qty:1,price:60}], total:290, status:"paid", method:"upi", time:"19:40", date:"2026-05-17" },
];

const DAILY_REVENUE = [
  { day:"Mon", revenue:4200 }, { day:"Tue", revenue:3800 }, { day:"Wed", revenue:5100 },
  { day:"Thu", revenue:4700 }, { day:"Fri", revenue:6800 }, { day:"Sat", revenue:8200 }, { day:"Sun", revenue:7400 },
];

const MONTHLY_REVENUE = [
  { month:"Jan", revenue:68000 }, { month:"Feb", revenue:72000 }, { month:"Mar", revenue:81000 },
  { month:"Apr", revenue:76000 }, { month:"May", revenue:68400 },
];

const TOP_ITEMS = INIT_ITEMS.sort((a,b)=>b.sales-a.sales).slice(0,5);

const PAYMENT_SPLIT = [
  { name:"Razorpay", value:58, color:"#E8650A" },
  { name:"UPI QR", value:42, color:"#C9920A" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const inputStyle = (err) => ({
  width:"100%", padding:"11px 14px",
  border:`1.5px solid ${err?"#e74c3c":"#e8ddd4"}`,
  borderRadius:10, fontSize:13, color:"#1A1A1A",
  background:"white", fontFamily:"'DM Sans',sans-serif",
  outline:"none", transition:"border-color 0.2s",
});

const selectStyle = {
  width:"100%", padding:"11px 14px",
  border:"1.5px solid #e8ddd4", borderRadius:10,
  fontSize:13, color:"#1A1A1A", background:"white",
  fontFamily:"'DM Sans',sans-serif", outline:"none",
  appearance:"none", cursor:"pointer",
  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23E8650A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", paddingRight:32,
};

// QR SVG generator
function QRCode({ size=200 }) {
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ display:"block" }}>
        <rect width="200" height="200" fill="white"/>
        {/* TL finder */}
        <rect x="10" y="10" width="56" height="56" fill="none" stroke="#1A1A1A" strokeWidth="7"/>
        <rect x="24" y="24" width="28" height="28" fill="#1A1A1A"/>
        {/* TR finder */}
        <rect x="134" y="10" width="56" height="56" fill="none" stroke="#1A1A1A" strokeWidth="7"/>
        <rect x="148" y="24" width="28" height="28" fill="#1A1A1A"/>
        {/* BL finder */}
        <rect x="10" y="134" width="56" height="56" fill="none" stroke="#1A1A1A" strokeWidth="7"/>
        <rect x="24" y="148" width="28" height="28" fill="#1A1A1A"/>
        {/* Timing dots */}
        {[80,88,96,104,112,120,128].map((x,i)=>i%2===0&&<rect key={x} x={x} y="78" width="7" height="7" fill="#1A1A1A"/>)}
        {[80,88,96,104,112,120,128].map((x,i)=>i%2===0&&<rect key={x+"v"} x="78" y={x} width="7" height="7" fill="#1A1A1A"/>)}
        {/* Data modules */}
        {[[80,100],[88,108],[96,100],[104,116],[112,100],[120,108],[128,116],
          [80,124],[96,116],[104,100],[120,124],[128,100],
          [80,132],[88,124],[96,132],[112,124],[120,132],[128,108],
          [80,140],[104,132],[112,140],[120,108],[128,140],
          [80,148],[88,140],[96,148],[104,140],[112,148],[128,132],
          [80,156],[96,156],[104,148],[112,156],[120,148],[128,156],
          [80,164],[88,156],[96,164],[104,164],[112,164],[120,164],[128,164]
        ].map(([x,y],i)=><rect key={i} x={x} y={y} width="7" height="7" fill="#1A1A1A"/>)}
        {/* Logo center */}
        <rect x="88" y="88" width="24" height="24" rx="4" fill="white"/>
        <rect x="91" y="91" width="18" height="18" rx="3" fill="#E8650A"/>
        <text x="100" y="103" textAnchor="middle" fontSize="10" fill="white" fontWeight="900">M</text>
      </svg>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function MenuMitraOwnerDashboard() {
  const [page, setPage] = useState("dashboard");
  const [categories, setCategories] = useState(INIT_CATEGORIES);
  const [items, setItems] = useState(INIT_ITEMS);
  const [orders] = useState(MOCK_ORDERS);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chartRange, setChartRange] = useState("daily");

  // Menu management state
  const [itemModal, setItemModal] = useState(null);
  const [catModal, setCatModal] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderFilter, setOrderFilter] = useState("all");
  const [analyticsRange, setAnalyticsRange] = useState("weekly");

  // Settings state
  const [settings, setSettings] = useState({ upiId: OWNER.upiId, paymentPref: OWNER.paymentPref, tableCount: OWNER.tableCount });
  const [pwForm, setPwForm] = useState({ current:"", newPw:"", confirm:"" });
  const [pwError, setPwError] = useState("");

  const fileInputRef = useRef();
  const upiFileRef = useRef();

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Item modal helpers ──
  const BLANK_ITEM = { id:null, categoryId:"CAT1", nameEn:"", nameHi:"", descEn:"", descHi:"", price:"", isVeg:true, isAvailable:true, photo:"🍽️" };

  const saveItem = (item) => {
    if (!item.nameEn || !item.price) { showToast("❌ Name and price are required.", "error"); return; }
    if (item.id) {
      setItems(prev => prev.map(i => i.id===item.id ? {...item, price:Number(item.price)} : i));
      showToast("✅ Item updated successfully.");
    } else {
      const newItem = { ...item, id:"ITM"+Date.now(), price:Number(item.price), sales:0 };
      setItems(prev => [...prev, newItem]);
      showToast("✅ New item added to your menu.");
    }
    setItemModal(null);
  };

  const deleteItem = (id) => {
    setItems(prev => prev.filter(i => i.id!==id));
    showToast("🗑️ Item removed from menu.", "warning");
    setItemModal(null);
  };

  const toggleAvailability = (id) => {
    setItems(prev => prev.map(i => i.id===id ? {...i, isAvailable:!i.isAvailable} : i));
  };

  const saveCat = (cat) => {
    if (!cat.name) { showToast("❌ Category name is required.", "error"); return; }
    if (cat.id) {
      setCategories(prev => prev.map(c => c.id===cat.id ? cat : c));
      showToast("✅ Category updated.");
    } else {
      setCategories(prev => [...prev, { ...cat, id:"CAT"+Date.now(), items:0 }]);
      showToast("✅ Category created.");
    }
    setCatModal(null);
  };

  const deleteCat = (id) => {
    setCategories(prev => prev.filter(c => c.id!==id));
    setItems(prev => prev.filter(i => i.categoryId!==id));
    showToast("🗑️ Category and its items removed.", "warning");
    setCatModal(null);
  };

  const savePw = () => {
    if (!pwForm.current) { setPwError("Enter your current password."); return; }
    if (pwForm.newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError("New passwords do not match."); return; }
    setPwError(""); setPwForm({ current:"", newPw:"", confirm:"" });
    showToast("✅ Password changed successfully.");
  };

  const daysLeft = Math.ceil((new Date(OWNER.subscriptionExpires)-new Date())/(1000*60*60*24));

  const navItems = [
    { id:"dashboard", icon:"📊", label:"Dashboard" },
    { id:"menu", icon:"🍽️", label:"Menu Management" },
    { id:"orders", icon:"📦", label:"Orders" },
    { id:"qr", icon:"📲", label:"My QR Code" },
    { id:"analytics", icon:"📈", label:"Analytics" },
    { id:"payments", icon:"💳", label:"Payment Settings" },
    { id:"settings", icon:"⚙️", label:"Settings" },
  ];

  const toastColors = { success:"#2D6A4F", error:"#c0392b", warning:"#C9920A", info:"#1A1A1A" };

  const todayOrders = orders.filter(o=>o.date==="2026-05-18");
  const todayRevenue = todayOrders.filter(o=>o.status==="paid").reduce((s,o)=>s+o.total,0);
  const monthRevenue = 68400;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F5EFE8", fontFamily:"'DM Sans',sans-serif", color:"#1A1A1A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:rgba(0,0,0,0.04); }
        ::-webkit-scrollbar-thumb { background:rgba(232,101,10,0.25); border-radius:4px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .page-anim { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .nav-item { transition:all 0.2s; border-radius:12px; cursor:pointer; }
        .nav-item:hover { background:rgba(232,101,10,0.08) !important; }
        .nav-item.active { background:rgba(232,101,10,0.12) !important; }
        .card { background:white; border-radius:18px; border:1px solid rgba(232,101,10,0.08); box-shadow:0 2px 20px rgba(0,0,0,0.05); }
        .table-row:hover { background:rgba(232,101,10,0.04) !important; }
        .table-row { transition:background 0.15s; }
        .toggle-track { transition:background 0.2s; }
        input:focus, select:focus, textarea:focus { border-color:#E8650A !important; box-shadow:0 0 0 3px rgba(232,101,10,0.1) !important; outline:none; }
        input::placeholder, textarea::placeholder { color:#c4b5a5; }
        .item-card:hover { box-shadow:0 8px 32px rgba(0,0,0,0.1) !important; transform:translateY(-2px); }
        .item-card { transition:all 0.2s; }
        .btn-primary { background:linear-gradient(135deg,#E8650A,#C9920A); color:white; border:none; border-radius:50px; padding:11px 22px; font-size:13px; font-weight:800; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; box-shadow:0 4px 16px rgba(232,101,10,0.35); }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(232,101,10,0.45); }
        .btn-ghost { background:transparent; color:#E8650A; border:2px solid #E8650A; border-radius:50px; padding:9px 18px; font-size:12px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
        .btn-ghost:hover { background:#E8650A; color:white; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:9999,
          background:toastColors[toast.type]||"#1A1A1A", color:"white",
          padding:"12px 22px", borderRadius:12, fontWeight:700, fontSize:13,
          boxShadow:"0 8px 32px rgba(0,0,0,0.25)", whiteSpace:"nowrap",
          animation:"toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both"
        }}>{toast.msg}</div>
      )}

      {/* ── Item Modal ── */}
      {itemModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:8000, display:"flex", alignItems:"center", justifyContent:"center", padding:20, overflowY:"auto" }}>
          <div style={{ background:"white", borderRadius:24, padding:"32px", maxWidth:560, width:"100%", animation:"modalIn 0.3s cubic-bezier(0.22,1,0.36,1) both", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900 }}>{itemModal.id?"Edit Item":"Add New Item"}</h2>
              <button onClick={()=>setItemModal(null)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#999" }}>✕</button>
            </div>

            {/* Photo emoji selector */}
            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:12, fontWeight:700, color:"#666", display:"block", marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>Item Photo / Icon</label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {["🍛","🍗","🥘","🧆","🫓","☕","🥛","🍮","🍕","🥗","🍜","🍱","🥙","🍢","🧁"].map(e=>(
                  <button key={e} onClick={()=>setItemModal(m=>({...m,photo:e}))}
                    style={{ width:40, height:40, borderRadius:10, border:`2px solid ${itemModal.photo===e?"#E8650A":"#e8ddd4"}`, background:itemModal.photo===e?"rgba(232,101,10,0.08)":"white", fontSize:20, cursor:"pointer", transition:"all 0.15s" }}>
                    {e}
                  </button>
                ))}
                <button onClick={()=>fileInputRef.current?.click()}
                  style={{ width:40, height:40, borderRadius:10, border:"2px dashed #e8ddd4", background:"transparent", fontSize:12, cursor:"pointer", color:"#999" }}>
                  📷
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={()=>showToast("📷 Photo upload ready in full build.")}/>
              </div>
              <div style={{ fontSize:11, color:"#aaa", marginTop:6 }}>Select an emoji icon or upload a photo (max 2MB, JPG/PNG).</div>
            </div>

            {/* Veg / Non-Veg */}
            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:12, fontWeight:700, color:"#666", display:"block", marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>Type</label>
              <div style={{ display:"flex", gap:10 }}>
                {[{v:true,label:"🟢 Vegetarian"},{v:false,label:"🔴 Non-Vegetarian"}].map(opt=>(
                  <button key={String(opt.v)} onClick={()=>setItemModal(m=>({...m,isVeg:opt.v}))}
                    style={{ flex:1, padding:"10px", border:`2px solid ${itemModal.isVeg===opt.v?"#E8650A":"#e8ddd4"}`, borderRadius:10, background:itemModal.isVeg===opt.v?"rgba(232,101,10,0.07)":"white", fontWeight:700, fontSize:13, cursor:"pointer", color:itemModal.isVeg===opt.v?"#E8650A":"#888" }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[
                {label:"Name (English) *",key:"nameEn",hi:false,placeholder:"e.g. Dal Makhani"},
                {label:"नाम (हिंदी) *",key:"nameHi",hi:true,placeholder:"e.g. दाल मखनी"},
              ].map(f=>(
                <div key={f.key}>
                  <label style={{ fontSize:12, fontWeight:700, color:"#666", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>{f.label}</label>
                  <input value={itemModal[f.key]} onChange={e=>setItemModal(m=>({...m,[f.key]:e.target.value}))}
                    placeholder={f.placeholder} style={inputStyle(false)}/>
                </div>
              ))}
            </div>

            <div style={{ margin:"14px 0", display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[
                {label:"Description (English)",key:"descEn",placeholder:"Brief description…"},
                {label:"विवरण (हिंदी)",key:"descHi",placeholder:"संक्षिप्त विवरण…"},
              ].map(f=>(
                <div key={f.key}>
                  <label style={{ fontSize:12, fontWeight:700, color:"#666", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>{f.label}</label>
                  <textarea value={itemModal[f.key]} onChange={e=>setItemModal(m=>({...m,[f.key]:e.target.value}))}
                    placeholder={f.placeholder} style={{ ...inputStyle(false), resize:"vertical", minHeight:64 }}/>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#666", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Price (₹) *</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:13, fontWeight:700, color:"#E8650A" }}>₹</span>
                  <input type="number" value={itemModal.price} onChange={e=>setItemModal(m=>({...m,price:e.target.value}))}
                    placeholder="0" style={{ ...inputStyle(false), paddingLeft:28 }}/>
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#666", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Category</label>
                <select value={itemModal.categoryId} onChange={e=>setItemModal(m=>({...m,categoryId:e.target.value}))} style={selectStyle}>
                  {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Available toggle */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"#f9f4ef", borderRadius:12, marginBottom:20 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700 }}>Available on Menu</div>
                <div style={{ fontSize:11, color:"#999", marginTop:1 }}>Customers can see and order this item.</div>
              </div>
              <div onClick={()=>setItemModal(m=>({...m,isAvailable:!m.isAvailable}))}
                className="toggle-track"
                style={{ width:46, height:26, borderRadius:13, background:itemModal.isAvailable?"#E8650A":"#ddd", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:"white", position:"absolute", top:3, left:itemModal.isAvailable?23:3, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
              </div>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              {itemModal.id && (
                <button onClick={()=>deleteItem(itemModal.id)}
                  style={{ padding:"11px 18px", background:"rgba(192,57,43,0.08)", color:"#c0392b", border:"1px solid rgba(192,57,43,0.2)", borderRadius:50, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  🗑️ Delete
                </button>
              )}
              <button onClick={()=>setItemModal(null)} style={{ flex:1, padding:"11px", background:"#f5f0eb", color:"#888", border:"none", borderRadius:50, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
              <button onClick={()=>saveItem(itemModal)} className="btn-primary" style={{ flex:2 }}>
                {itemModal.id?"💾 Save Changes":"➕ Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Category Modal ── */}
      {catModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:8000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"white", borderRadius:22, padding:"28px", maxWidth:420, width:"100%", animation:"modalIn 0.3s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900 }}>{catModal.id?"Edit Category":"Add Category"}</h2>
              <button onClick={()=>setCatModal(null)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#999" }}>✕</button>
            </div>
            {[{label:"Category Name (English) *",key:"name",placeholder:"e.g. Main Course"},{label:"श्रेणी का नाम (हिंदी) *",key:"nameHi",placeholder:"e.g. मुख्य व्यंजन"}].map(f=>(
              <div key={f.key} style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, fontWeight:700, color:"#666", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:0.5 }}>{f.label}</label>
                <input value={catModal[f.key]||""} onChange={e=>setCatModal(m=>({...m,[f.key]:e.target.value}))}
                  placeholder={f.placeholder} style={inputStyle(false)}/>
              </div>
            ))}
            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              {catModal.id && (
                <button onClick={()=>deleteCat(catModal.id)}
                  style={{ padding:"10px 16px", background:"rgba(192,57,43,0.08)", color:"#c0392b", border:"1px solid rgba(192,57,43,0.2)", borderRadius:50, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  🗑️
                </button>
              )}
              <button onClick={()=>setCatModal(null)} style={{ flex:1, padding:"11px", background:"#f5f0eb", color:"#888", border:"none", borderRadius:50, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
              <button onClick={()=>saveCat(catModal)} className="btn-primary" style={{ flex:2 }}>{catModal.id?"💾 Save":"➕ Create"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════ */}
      <aside style={{
        width:sidebarOpen?230:68, flexShrink:0,
        background:"white", borderRight:"1px solid rgba(232,101,10,0.1)",
        display:"flex", flexDirection:"column",
        transition:"width 0.3s cubic-bezier(0.22,1,0.36,1)",
        overflow:"hidden", position:"sticky", top:0, height:"100vh", zIndex:100
      }}>
        {/* Logo */}
        <div style={{ padding:"20px 16px 14px", borderBottom:"1px solid #f0e8df", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#E8650A,#C9920A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>🍽️</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:16, color:"#1A1A1A", whiteSpace:"nowrap" }}>MenuMitra</div>
              <div style={{ fontSize:8, color:"#E8650A", fontWeight:700, letterSpacing:1.5, textTransform:"uppercase" }}>Owner Portal</div>
            </div>
          )}
        </div>

        {/* Business info */}
        {sidebarOpen && (
          <div style={{ margin:"10px 12px", background:"linear-gradient(135deg,rgba(232,101,10,0.08),rgba(201,146,10,0.06))", border:"1px solid rgba(232,101,10,0.15)", borderRadius:12, padding:"10px 12px" }}>
            <div style={{ fontSize:12, fontWeight:800, color:"#1A1A1A", marginBottom:1 }}>{OWNER.businessName}</div>
            <div style={{ fontSize:10, color:"#E8650A", fontWeight:600, marginBottom:4 }}>{OWNER.city}, {OWNER.state}</div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#2D6A4F" }}/>
              <span style={{ fontSize:10, color:"#2D6A4F", fontWeight:700 }}>Active · {daysLeft} days left</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, padding:"8px 10px", overflowY:"auto" }}>
          {navItems.map(item=>(
            <div key={item.id} className={`nav-item${page===item.id?" active":""}`}
              onClick={()=>setPage(item.id)}
              style={{ display:"flex", alignItems:"center", gap:11, padding:"10px 11px", marginBottom:3,
                background:page===item.id?"rgba(232,101,10,0.12)":"transparent" }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize:13, fontWeight:page===item.id?700:500, color:page===item.id?"#E8650A":"#666", whiteSpace:"nowrap" }}>{item.label}</span>}
            </div>
          ))}
        </nav>

        <div style={{ padding:"10px", borderTop:"1px solid #f0e8df" }}>
          <div className="nav-item" onClick={()=>setSidebarOpen(v=>!v)}
            style={{ display:"flex", alignItems:"center", gap:11, padding:"9px 11px", marginBottom:4 }}>
            <span style={{ fontSize:13, flexShrink:0 }}>{sidebarOpen?"◀":"▶"}</span>
            {sidebarOpen && <span style={{ fontSize:11, color:"#bbb" }}>Collapse</span>}
          </div>
          <div className="nav-item" style={{ display:"flex", alignItems:"center", gap:11, padding:"9px 11px" }}>
            <span style={{ fontSize:13, flexShrink:0 }}>🚪</span>
            {sidebarOpen && <span style={{ fontSize:11, color:"#bbb" }}>Sign Out</span>}
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <main style={{ flex:1, overflowY:"auto", overflowX:"hidden", minWidth:0 }}>

        {/* Top bar */}
        <div style={{ background:"white", borderBottom:"1px solid #f0e8df", padding:"14px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 12px rgba(0,0,0,0.04)" }}>
          <div>
            <div style={{ fontSize:11, color:"#bbb", textTransform:"uppercase", letterSpacing:0.5, fontWeight:600, marginBottom:1 }}>
              {navItems.find(n=>n.id===page)?.icon} {navItems.find(n=>n.id===page)?.label}
            </div>
            <div style={{ fontSize:12, color:"#ccc" }}>Monday, 18 May 2026</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {/* Subscription badge */}
            <div style={{ background:"rgba(45,106,79,0.08)", border:"1px solid rgba(45,106,79,0.2)", borderRadius:20, padding:"5px 12px", display:"flex", gap:6, alignItems:"center" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#2D6A4F" }}/>
              <span style={{ fontSize:11, color:"#2D6A4F", fontWeight:700 }}>Active · {daysLeft} days</span>
            </div>
            {/* Menu link */}
            <a href={`https://menumitra.in/menu/${OWNER.slug}`} target="_blank" rel="noreferrer"
              style={{ fontSize:12, color:"#E8650A", fontWeight:700, textDecoration:"none", background:"rgba(232,101,10,0.08)", borderRadius:20, padding:"5px 12px" }}>
              🔗 My Menu
            </a>
          </div>
        </div>

        <div style={{ padding:"24px" }}>

          {/* ════════════════════════════════════
              DASHBOARD
          ════════════════════════════════════ */}
          {page==="dashboard" && (
            <div className="page-anim">
              <div style={{ marginBottom:22 }}>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, marginBottom:4 }}>
                  Welcome back, <em style={{ color:"#E8650A" }}>{OWNER.ownerName.split(" ")[0]}</em> 👋
                </h1>
                <p style={{ fontSize:13, color:"#999" }}>Here is your business snapshot for today.</p>
              </div>

              {/* Stat cards */}
              <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:22 }}>
                {[
                  {icon:"📦",label:"Today's Orders",val:todayOrders.length,sub:"18 May 2026",color:"#E8650A"},
                  {icon:"💰",label:"Today's Revenue",val:`₹${todayRevenue.toLocaleString()}`,sub:"Paid orders only",color:"#2D6A4F"},
                  {icon:"📅",label:"Monthly Revenue",val:`₹${monthRevenue.toLocaleString()}`,sub:"May 2026",color:"#C9920A"},
                  {icon:"🍽️",label:"Menu Items",val:items.length,sub:`${items.filter(i=>i.isAvailable).length} available`,color:"#5B8DB8"},
                  {icon:"🟢",label:"Live Orders",val:orders.filter(o=>o.status==="pending").length,sub:"Awaiting payment confirm",color:"#c0392b"},
                ].map((s,i)=>(
                  <div key={i} className="card" style={{ flex:"1 1 160px", padding:"20px", minWidth:160 }}>
                    <div style={{ width:38, height:38, borderRadius:11, background:`${s.color}12`, border:`1.5px solid ${s.color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:14 }}>{s.icon}</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:900, color:"#1A1A1A", lineHeight:1, marginBottom:4 }}>{s.val}</div>
                    <div style={{ fontSize:12, color:"#555", fontWeight:600 }}>{s.label}</div>
                    <div style={{ fontSize:10, color:"#bbb", marginTop:2 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:18, marginBottom:18 }}>
                <div className="card" style={{ padding:"22px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                    <div>
                      <div style={{ fontSize:11, color:"#bbb", textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>Revenue</div>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:800 }}>Daily This Week</div>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      {["daily","monthly"].map(r=>(
                        <button key={r} onClick={()=>setChartRange(r)}
                          style={{ padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'DM Sans',sans-serif", background:chartRange===r?"#E8650A":"#f5ede5", color:chartRange===r?"white":"#888" }}>
                          {r.charAt(0).toUpperCase()+r.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartRange==="daily"?DAILY_REVENUE:MONTHLY_REVENUE} margin={{top:4,right:8,left:-20,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)"/>
                      <XAxis dataKey={chartRange==="daily"?"day":"month"} tick={{fill:"#bbb",fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:"#bbb",fontSize:11}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{background:"white",border:"1px solid #f0e8df",borderRadius:10,fontSize:12}} formatter={v=>`₹${v.toLocaleString()}`}/>
                      <Line type="monotone" dataKey="revenue" stroke="#E8650A" strokeWidth={2.5} dot={{fill:"#E8650A",r:3}} activeDot={{r:5}}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="card" style={{ padding:"22px" }}>
                  <div style={{ fontSize:11, color:"#bbb", textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>Payment Split</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:800, marginBottom:14 }}>This Month</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={PAYMENT_SPLIT} cx="50%" cy="50%" innerRadius={40} outerRadius:60 paddingAngle={3} dataKey="value">
                        {PAYMENT_SPLIT.map((e,i)=><Cell key={i} fill={e.color}/>)}
                      </Pie>
                      <Tooltip contentStyle={{background:"white",border:"1px solid #f0e8df",borderRadius:10,fontSize:12}} formatter={v=>`${v}%`}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
                    {PAYMENT_SPLIT.map((s,i)=>(
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <div style={{ width:8, height:8, borderRadius:2, background:s.color }}/>
                        <span style={{ fontSize:11, color:"#888" }}>{s.name} ({s.value}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top items + Recent orders */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
                <div className="card" style={{ padding:"22px" }}>
                  <div style={{ fontSize:11, color:"#bbb", textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>Best Sellers</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:800, marginBottom:16 }}>Top 5 Items</div>
                  {TOP_ITEMS.map((item,i)=>(
                    <div key={item.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 0", borderBottom:i<4?"1px solid #f5ede5":"none" }}>
                      <div style={{ width:28, height:28, borderRadius:8, background:i===0?"rgba(232,101,10,0.12)":"#f5ede5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{item.photo}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:"#1A1A1A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.nameEn}</div>
                        <div style={{ fontSize:10, color:"#bbb" }}>{item.sales} orders · ₹{item.price}</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <span style={{ fontSize:13, color:i===0?"#E8650A":i===1?"#C9920A":"#bbb" }}>
                          {i===0?"🥇":i===1?"🥈":i===2?"🥉":"  "}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding:"22px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                    <div>
                      <div style={{ fontSize:11, color:"#bbb", textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>Activity</div>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:800 }}>Recent Orders</div>
                    </div>
                    <button onClick={()=>setPage("orders")} style={{ fontSize:12, color:"#E8650A", fontWeight:700, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View All →</button>
                  </div>
                  {orders.slice(0,4).map((o,i)=>(
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:i<3?"1px solid #f5ede5":"none" }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:"#1A1A1A" }}>{o.id.slice(-6)} · Table {o.table}</div>
                        <div style={{ fontSize:10, color:"#bbb", marginTop:1 }}>{o.date} {o.time} · {o.items.length} item{o.items.length!==1?"s":""}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:13, fontWeight:800, color:"#1A1A1A" }}>₹{o.total}</div>
                        <span style={{ fontSize:10, fontWeight:700, color:o.status==="paid"?"#2D6A4F":"#E8650A", background:o.status==="paid"?"rgba(45,106,79,0.1)":"rgba(232,101,10,0.1)", borderRadius:6, padding:"1px 6px" }}>
                          {o.status==="paid"?"✓ Paid":"⏳ Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════
              MENU MANAGEMENT
          ════════════════════════════════════ */}
          {page==="menu" && (
            <div className="page-anim">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:22, flexWrap:"wrap", gap:12 }}>
                <div>
                  <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, marginBottom:4 }}>Menu Management</h1>
                  <p style={{ fontSize:13, color:"#999" }}>{items.length} items across {categories.length} categories · {items.filter(i=>i.isAvailable).length} currently available</p>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button className="btn-ghost" onClick={()=>setCatModal({id:null,name:"",nameHi:""})}>+ Add Category</button>
                  <button className="btn-primary" onClick={()=>setItemModal({...BLANK_ITEM})}>+ Add Item</button>
                </div>
              </div>

              {/* Category chips */}
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:22 }}>
                {categories.map(cat=>(
                  <div key={cat.id} style={{ display:"flex", alignItems:"center", gap:0, background:"white", border:"1px solid #f0e8df", borderRadius:20, overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                    <span style={{ padding:"7px 14px", fontSize:12, fontWeight:700, color:"#555" }}>{cat.name}</span>
                    <span style={{ padding:"7px 8px", fontSize:11, color:"#E8650A", fontWeight:700 }}>{items.filter(i=>i.categoryId===cat.id).length}</span>
                    <button onClick={()=>setCatModal({...cat})}
                      style={{ padding:"7px 10px", background:"rgba(232,101,10,0.07)", border:"none", cursor:"pointer", fontSize:12, color:"#E8650A" }}>✏️</button>
                  </div>
                ))}
              </div>

              {/* Items by category */}
              {categories.map(cat=>{
                const catItems = items.filter(i=>i.categoryId===cat.id);
                if (catItems.length===0) return null;
                return (
                  <div key={cat.id} style={{ marginBottom:28 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                      <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:800 }}>{cat.name}</h3>
                      <span style={{ fontSize:11, color:"#bbb" }}>/ {cat.nameHi}</span>
                      <span style={{ fontSize:11, color:"#E8650A", background:"rgba(232,101,10,0.08)", borderRadius:10, padding:"2px 8px", fontWeight:700 }}>{catItems.length} items</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
                      {catItems.map(item=>(
                        <div key={item.id} className="item-card card" style={{ padding:"16px", boxShadow:"0 2px 14px rgba(0,0,0,0.06)", opacity:item.isAvailable?1:0.65 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                              <div style={{ width:44, height:44, borderRadius:12, background:"#f5ede5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{item.photo}</div>
                              <div>
                                <div style={{ fontSize:14, fontWeight:800, color:"#1A1A1A", lineHeight:1.2 }}>{item.nameEn}</div>
                                <div style={{ fontSize:11, color:"#aaa", marginTop:1 }}>{item.nameHi}</div>
                              </div>
                            </div>
                            {/* Veg badge */}
                            <div style={{ width:16, height:16, border:`2px solid ${item.isVeg?"#2D6A4F":"#c0392b"}`, borderRadius:3, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                              <div style={{ width:8, height:8, borderRadius:"50%", background:item.isVeg?"#2D6A4F":"#c0392b" }}/>
                            </div>
                          </div>
                          {item.descEn && <div style={{ fontSize:11, color:"#aaa", marginBottom:10, lineHeight:1.5 }}>{item.descEn}</div>}
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <div style={{ fontSize:18, fontWeight:900, color:"#E8650A", fontFamily:"'Playfair Display',serif" }}>₹{item.price}</div>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              {/* Availability toggle */}
                              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                <span style={{ fontSize:10, color:"#bbb", fontWeight:600 }}>{item.isAvailable?"Live":"Off"}</span>
                                <div onClick={()=>toggleAvailability(item.id)}
                                  className="toggle-track"
                                  style={{ width:38, height:21, borderRadius:11, background:item.isAvailable?"#E8650A":"#ddd", cursor:"pointer", position:"relative" }}>
                                  <div style={{ width:15, height:15, borderRadius:"50%", background:"white", position:"absolute", top:3, left:item.isAvailable?20:3, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
                                </div>
                              </div>
                              <button onClick={()=>setItemModal({...item})}
                                style={{ padding:"5px 12px", background:"rgba(232,101,10,0.1)", color:"#E8650A", border:"none", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                                Edit
                              </button>
                            </div>
                          </div>
                          <div style={{ fontSize:10, color:"#ddd", marginTop:8 }}>{item.sales} orders total</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ════════════════════════════════════
              ORDERS
          ════════════════════════════════════ */}
          {page==="orders" && (
            <div className="page-anim">
              <div style={{ marginBottom:22 }}>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, marginBottom:4 }}>Orders</h1>
                <p style={{ fontSize:13, color:"#999" }}>{orders.length} total orders · ₹{orders.filter(o=>o.status==="paid").reduce((s,o)=>s+o.total,0).toLocaleString()} collected</p>
              </div>

              {/* Filters */}
              <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
                {[["all","All Orders"],["paid","Paid"],["pending","Pending"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setOrderFilter(v)}
                    style={{ padding:"7px 16px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif",
                      background:orderFilter===v?"#E8650A":"white",
                      color:orderFilter===v?"white":"#888",
                      boxShadow:orderFilter===v?"0 4px 14px rgba(232,101,10,0.35)":"none",
                      border:orderFilter===v?"none":"1px solid #f0e8df" }}>
                    {l}
                  </button>
                ))}
                <button style={{ marginLeft:"auto", padding:"7px 16px", borderRadius:20, border:"1px solid #f0e8df", background:"white", color:"#888", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  ⬇ Export CSV
                </button>
              </div>

              <div className="card" style={{ overflow:"hidden" }}>
                {orders.filter(o=>orderFilter==="all"||o.status===orderFilter).map((order,i,arr)=>(
                  <div key={order.id}>
                    <div className="table-row" onClick={()=>setExpandedOrder(expandedOrder===order.id?null:order.id)}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", cursor:"pointer", flexWrap:"wrap", gap:10 }}>
                      <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                        <div style={{ width:40, height:40, borderRadius:12, background:"rgba(232,101,10,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🪑</div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:800, color:"#1A1A1A" }}>{order.id}</div>
                          <div style={{ fontSize:11, color:"#bbb", marginTop:1 }}>Table {order.table} · {order.date} {order.time} · {order.items.length} item{order.items.length!==1?"s":""}</div>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                        <span style={{ fontSize:11, fontWeight:700, background:order.method==="razorpay"?"rgba(232,101,10,0.08)":"rgba(201,146,10,0.1)", color:order.method==="razorpay"?"#E8650A":"#C9920A", borderRadius:8, padding:"3px 10px" }}>
                          {order.method==="razorpay"?"Razorpay":"UPI QR"}
                        </span>
                        <span style={{ fontSize:11, fontWeight:700, background:order.status==="paid"?"rgba(45,106,79,0.1)":"rgba(232,101,10,0.1)", color:order.status==="paid"?"#2D6A4F":"#E8650A", borderRadius:8, padding:"3px 10px" }}>
                          {order.status==="paid"?"✓ Paid":"⏳ Pending"}
                        </span>
                        <div style={{ fontSize:18, fontWeight:900, color:"#1A1A1A", fontFamily:"'Playfair Display',serif" }}>₹{order.total}</div>
                        <span style={{ color:"#bbb", transition:"transform 0.2s", display:"inline-block", transform:expandedOrder===order.id?"rotate(180deg)":"none" }}>▾</span>
                      </div>
                    </div>

                    {/* Expanded */}
                    {expandedOrder===order.id && (
                      <div style={{ padding:"0 20px 16px", background:"rgba(232,101,10,0.02)", borderTop:"1px solid #f5ede5" }}>
                        <div style={{ background:"white", borderRadius:12, padding:"14px", marginTop:12, border:"1px solid #f0e8df" }}>
                          <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Order Items</div>
                          {order.items.map((item,j)=>(
                            <div key={j} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:j<order.items.length-1?"1px solid #f5ede5":"none", fontSize:13 }}>
                              <span style={{ color:"#555" }}>× {item.qty}  {item.name}</span>
                              <span style={{ fontWeight:700, color:"#1A1A1A" }}>₹{item.price * item.qty}</span>
                            </div>
                          ))}
                          <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0 0", fontSize:14, fontWeight:900, borderTop:"1px solid #f0e8df", marginTop:4 }}>
                            <span>Total</span>
                            <span style={{ color:"#E8650A" }}>₹{order.total}</span>
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:10, marginTop:10 }}>
                          <button onClick={()=>showToast("🖨️ Print receipt — ready in full build.")}
                            style={{ padding:"9px 18px", background:"rgba(232,101,10,0.1)", color:"#E8650A", border:"none", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                            🖨️ Print Receipt
                          </button>
                          {order.status==="pending" && (
                            <button onClick={()=>showToast("✅ Order marked as paid.")}
                              style={{ padding:"9px 18px", background:"rgba(45,106,79,0.1)", color:"#2D6A4F", border:"none", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                              ✅ Mark as Paid
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {i<arr.length-1&&<div style={{ height:1, background:"#f5ede5", margin:"0 20px" }}/>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════
              QR CODE PAGE
          ════════════════════════════════════ */}
          {page==="qr" && (
            <div className="page-anim">
              <div style={{ marginBottom:22 }}>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, marginBottom:4 }}>My QR Code</h1>
                <p style={{ fontSize:13, color:"#999" }}>Download and print this QR code. Place it on every table so customers can scan and order.</p>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                {/* QR display */}
                <div className="card" style={{ padding:"36px", display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{ background:"white", borderRadius:20, padding:"24px", boxShadow:"0 8px 40px rgba(0,0,0,0.1)", border:"2px solid rgba(232,101,10,0.15)", marginBottom:20 }}>
                    <div style={{ textAlign:"center", marginBottom:14 }}>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:900, color:"#1A1A1A" }}>{OWNER.businessName}</div>
                      <div style={{ fontSize:10, color:"#bbb", marginTop:2 }}>Scan to view menu & order</div>
                    </div>
                    <QRCode size={180}/>
                    <div style={{ textAlign:"center", marginTop:14 }}>
                      <div style={{ fontSize:9, color:"#bbb", letterSpacing:0.5 }}>menumitra.in/menu/{OWNER.slug}</div>
                      <div style={{ marginTop:8, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                        <span style={{ fontSize:8, color:"#E8650A", fontWeight:700 }}>Powered by</span>
                        <span style={{ fontSize:9, fontFamily:"'Playfair Display',serif", fontWeight:800, color:"#E8650A" }}>MenuMitra</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display:"flex", gap:10, width:"100%" }}>
                    <button className="btn-primary" style={{ flex:1 }} onClick={()=>showToast("📥 QR downloaded as PNG.")}>
                      📥 Download PNG
                    </button>
                    <button className="btn-ghost" style={{ flex:1 }} onClick={()=>{navigator.clipboard?.writeText(`https://menumitra.in/menu/${OWNER.slug}`);showToast("🔗 Menu link copied!");}}>
                      🔗 Copy Link
                    </button>
                  </div>
                </div>

                {/* Instructions + preview */}
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div className="card" style={{ padding:"22px" }}>
                    <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>Your Menu URL</div>
                    <div style={{ background:"#f9f4ef", borderRadius:10, padding:"12px 14px", fontFamily:"monospace", fontSize:12, color:"#555", border:"1px solid #f0e8df", wordBreak:"break-all", marginBottom:10 }}>
                      https://menumitra.in/menu/{OWNER.slug}
                    </div>
                    <div style={{ fontSize:11, color:"#bbb" }}>Share this link on WhatsApp, Instagram, or anywhere online to let customers order from you.</div>
                  </div>

                  <div className="card" style={{ padding:"22px" }}>
                    <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>📋 Placement Tips</div>
                    {["Print and laminate the QR code for durability.","Place one on each table — use a table tent or frame.","Stick one at the entrance so walk-ins can pre-browse.","Share the link on your WhatsApp status daily.","Add it to your Google Business listing."].map((tip,i)=>(
                      <div key={i} style={{ display:"flex", gap:10, padding:"7px 0", borderBottom:i<4?"1px solid #f5ede5":"none", alignItems:"flex-start" }}>
                        <span style={{ color:"#E8650A", fontWeight:900, flexShrink:0, fontSize:12 }}>→</span>
                        <span style={{ fontSize:12, color:"#666", lineHeight:1.5 }}>{tip}</span>
                      </div>
                    ))}
                  </div>

                  <div className="card" style={{ padding:"22px" }}>
                    <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:12 }}>QR Code Stats</div>
                    {[["Total Scans",1240],["This Month",342],["Orders Placed",289],["Conversion Rate","23.3%"]].map(([k,v],i)=>(
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:i<3?"1px solid #f5ede5":"none", fontSize:13 }}>
                        <span style={{ color:"#888" }}>{k}</span>
                        <span style={{ fontWeight:800, color:"#1A1A1A" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════
              ANALYTICS
          ════════════════════════════════════ */}
          {page==="analytics" && (
            <div className="page-anim">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:22, flexWrap:"wrap", gap:12 }}>
                <div>
                  <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, marginBottom:4 }}>Analytics</h1>
                  <p style={{ fontSize:13, color:"#999" }}>Detailed sales performance and item-wise breakdown.</p>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  {["weekly","monthly"].map(r=>(
                    <button key={r} onClick={()=>setAnalyticsRange(r)}
                      style={{ padding:"8px 16px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif", background:analyticsRange===r?"#E8650A":"white", color:analyticsRange===r?"white":"#888", border:analyticsRange===r?"none":"1px solid #f0e8df" }}>
                      {r.charAt(0).toUpperCase()+r.slice(1)}
                    </button>
                  ))}
                  <button onClick={()=>showToast("📥 Report exported.")}
                    style={{ padding:"8px 16px", borderRadius:20, border:"1px solid #f0e8df", background:"white", color:"#888", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    ⬇ Export
                  </button>
                </div>
              </div>

              {/* Revenue chart */}
              <div className="card" style={{ padding:"24px", marginBottom:18 }}>
                <div style={{ fontSize:11, color:"#bbb", textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>Revenue Trend</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, marginBottom:18 }}>{analyticsRange==="weekly"?"This Week":"Past 5 Months"}</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analyticsRange==="weekly"?DAILY_REVENUE:MONTHLY_REVENUE} margin={{top:4,right:8,left:-10,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)"/>
                    <XAxis dataKey={analyticsRange==="weekly"?"day":"month"} tick={{fill:"#bbb",fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#bbb",fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:"white",border:"1px solid #f0e8df",borderRadius:10,fontSize:12}} formatter={v=>`₹${v.toLocaleString()}`}/>
                    <Bar dataKey="revenue" fill="#E8650A" radius={[6,6,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Item performance table */}
              <div className="card" style={{ overflow:"hidden" }}>
                <div style={{ padding:"20px 22px 16px", borderBottom:"1px solid #f5ede5" }}>
                  <div style={{ fontSize:11, color:"#bbb", textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>Performance</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800 }}>Item-wise Sales Breakdown</div>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid #f5ede5" }}>
                        {["Item","Category","Units Sold","Revenue","Avg/Day","Status"].map(h=>(
                          <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:10, fontWeight:800, color:"#bbb", letterSpacing:1, textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...items].sort((a,b)=>b.sales-a.sales).map((item,i)=>{
                        const cat = categories.find(c=>c.id===item.categoryId);
                        return (
                          <tr key={item.id} className="table-row" style={{ borderBottom:"1px solid #f5ede5" }}>
                            <td style={{ padding:"12px 16px" }}>
                              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                                <span style={{ fontSize:18 }}>{item.photo}</span>
                                <div>
                                  <div style={{ fontSize:13, fontWeight:700, color:"#1A1A1A" }}>{item.nameEn}</div>
                                  <div style={{ fontSize:10, color:"#bbb" }}>{item.nameHi}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding:"12px 16px" }}>
                              <span style={{ fontSize:11, background:"#f5ede5", color:"#888", borderRadius:6, padding:"3px 8px" }}>{cat?.name||"-"}</span>
                            </td>
                            <td style={{ padding:"12px 16px", fontSize:14, fontWeight:800, color:"#1A1A1A" }}>{item.sales}</td>
                            <td style={{ padding:"12px 16px", fontSize:14, fontWeight:800, color:"#E8650A" }}>₹{(item.sales*item.price).toLocaleString()}</td>
                            <td style={{ padding:"12px 16px", fontSize:12, color:"#888" }}>{(item.sales/30).toFixed(1)}</td>
                            <td style={{ padding:"12px 16px" }}>
                              <span style={{ fontSize:11, fontWeight:700, background:item.isAvailable?"rgba(45,106,79,0.1)":"rgba(192,57,43,0.1)", color:item.isAvailable?"#2D6A4F":"#c0392b", borderRadius:6, padding:"3px 8px" }}>
                                {item.isAvailable?"Available":"Unavailable"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════
              PAYMENT SETTINGS
          ════════════════════════════════════ */}
          {page==="payments" && (
            <div className="page-anim" style={{ maxWidth:680 }}>
              <div style={{ marginBottom:22 }}>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, marginBottom:4 }}>Payment Settings</h1>
                <p style={{ fontSize:13, color:"#999" }}>Configure how your customers pay. All payment info is encrypted and stored securely.</p>
              </div>

              {/* Payment method preference */}
              <div className="card" style={{ padding:"24px", marginBottom:18 }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Payment Method Preference</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:8 }}>
                  {[
                    {v:"upi_qr",icon:"📱",label:"UPI QR Only",desc:"Show your UPI QR image to customers."},
                    {v:"razorpay",icon:"💳",label:"Razorpay Only",desc:"Live gateway — cards, UPI, wallets."},
                    {v:"both",icon:"🔀",label:"Both Options",desc:"Customer chooses at checkout."},
                  ].map(opt=>(
                    <div key={opt.v} onClick={()=>setSettings(s=>({...s,paymentPref:opt.v}))}
                      style={{ padding:"14px", border:`2px solid ${settings.paymentPref===opt.v?"#E8650A":"#f0e8df"}`, borderRadius:14, cursor:"pointer", background:settings.paymentPref===opt.v?"rgba(232,101,10,0.05)":"white", transition:"all 0.2s" }}>
                      <div style={{ fontSize:22, marginBottom:8 }}>{opt.icon}</div>
                      <div style={{ fontSize:13, fontWeight:800, color:settings.paymentPref===opt.v?"#E8650A":"#1A1A1A", marginBottom:4 }}>{opt.label}</div>
                      <div style={{ fontSize:11, color:"#aaa", lineHeight:1.5 }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* UPI Settings */}
              <div className="card" style={{ padding:"24px", marginBottom:18 }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>📱 UPI Details</div>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:12, fontWeight:700, color:"#666", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:0.5 }}>UPI ID</label>
                  <input value={settings.upiId} onChange={e=>setSettings(s=>({...s,upiId:e.target.value}))}
                    placeholder="e.g. yourname@upi" style={inputStyle(false)}/>
                  <div style={{ fontSize:11, color:"#bbb", marginTop:5 }}>Customers on UPI QR mode will see this ID below your QR image.</div>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:"#666", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:0.5 }}>Upload UPI QR Image</label>
                  <div onClick={()=>upiFileRef.current?.click()}
                    style={{ border:"2px dashed #e8ddd4", borderRadius:12, padding:"24px", textAlign:"center", cursor:"pointer", background:"#faf6f2", transition:"border-color 0.2s" }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor="#E8650A"}
                    onMouseLeave={e=>e.currentTarget.style.borderColor="#e8ddd4"}>
                    <div style={{ fontSize:28, marginBottom:8 }}>📱</div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#555", marginBottom:4 }}>Click to upload your UPI QR image</div>
                    <div style={{ fontSize:11, color:"#bbb" }}>JPG, PNG or WEBP · Max 2MB</div>
                  </div>
                  <input ref={upiFileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={()=>showToast("📱 UPI QR image uploaded!")}/>
                </div>
              </div>

              {/* Razorpay Settings */}
              <div className="card" style={{ padding:"24px", marginBottom:18 }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>💳 Razorpay Gateway</div>
                {[
                  {label:"Razorpay Key ID", key:"rzpKeyId", placeholder:"rzp_live_XXXXXXXXXXXX", type:"text"},
                  {label:"Razorpay Key Secret", key:"rzpKeySecret", placeholder:"••••••••••••••••", type:"password"},
                ].map(f=>(
                  <div key={f.key} style={{ marginBottom:14 }}>
                    <label style={{ fontSize:12, fontWeight:700, color:"#666", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:0.5 }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} style={inputStyle(false)}/>
                  </div>
                ))}
                <div style={{ background:"rgba(232,101,10,0.05)", border:"1px solid rgba(232,101,10,0.15)", borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ fontSize:11, color:"#8A6A4A", lineHeight:1.7 }}>
                    🔒 Your Razorpay credentials are encrypted with AES-256 before storage. Never share your Key Secret with anyone.
                    Get your keys from your <span style={{ color:"#E8650A", fontWeight:700" }}>Razorpay Dashboard → Settings → API Keys</span>.
                  </div>
                </div>
              </div>

              <button className="btn-primary" style={{ width:"100%", padding:15, fontSize:15 }} onClick={()=>showToast("✅ Payment settings saved.")}>
                💾 Save Payment Settings
              </button>
            </div>
          )}

          {/* ════════════════════════════════════
              SETTINGS
          ════════════════════════════════════ */}
          {page==="settings" && (
            <div className="page-anim" style={{ maxWidth:680 }}>
              <div style={{ marginBottom:22 }}>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, marginBottom:4 }}>Settings</h1>
                <p style={{ fontSize:13, color:"#999" }}>Manage your business profile, table count, and account security.</p>
              </div>

              {/* Business profile */}
              <div className="card" style={{ padding:"24px", marginBottom:18 }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>🏪 Business Profile</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  {[
                    {label:"Business Name",val:OWNER.businessName},
                    {label:"Owner Name",val:OWNER.ownerName},
                    {label:"Email Address",val:OWNER.email},
                    {label:"Mobile Number",val:`+91 ${OWNER.phone}`},
                    {label:"City",val:OWNER.city},
                    {label:"State",val:OWNER.state},
                  ].map((f,i)=>(
                    <div key={i}>
                      <label style={{ fontSize:12, fontWeight:700, color:"#666", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:0.5 }}>{f.label}</label>
                      <input defaultValue={f.val} style={inputStyle(false)}/>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:14 }}>
                  <label style={{ fontSize:12, fontWeight:700, color:"#666", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:0.5 }}>Number of Tables</label>
                  <select value={settings.tableCount} onChange={e=>setSettings(s=>({...s,tableCount:Number(e.target.value)}))} style={{ ...selectStyle, width:200 }}>
                    {Array.from({length:50},(_,i)=>i+1).map(n=><option key={n} value={n}>{n} tables</option>)}
                  </select>
                </div>
                <button className="btn-primary" style={{ marginTop:18 }} onClick={()=>showToast("✅ Profile saved.")}>💾 Save Profile</button>
              </div>

              {/* Subscription card */}
              <div className="card" style={{ padding:"24px", marginBottom:18, background:"linear-gradient(135deg,rgba(232,101,10,0.04),rgba(201,146,10,0.04))", border:"1.5px solid rgba(232,101,10,0.15)" }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>💳 Subscription</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
                  <div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, marginBottom:4 }}>MenuMitra Standard</div>
                    <div style={{ fontSize:14, color:"#555" }}>₹100/month · Active</div>
                    <div style={{ fontSize:12, color:"#aaa", marginTop:4 }}>Renews on {OWNER.subscriptionExpires} · {daysLeft} days remaining</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ background:"rgba(45,106,79,0.1)", color:"#2D6A4F", borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:800, marginBottom:8 }}>✓ Active</div>
                    <button className="btn-ghost" onClick={()=>showToast("Renew flow — coming in Phase 7.")}>Renew Now</button>
                  </div>
                </div>
              </div>

              {/* Change password */}
              <div className="card" style={{ padding:"24px" }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>🔐 Change Password</div>
                {[
                  {label:"Current Password",key:"current",placeholder:"Enter current password"},
                  {label:"New Password",key:"newPw",placeholder:"Min. 8 characters"},
                  {label:"Confirm New Password",key:"confirm",placeholder:"Re-enter new password"},
                ].map(f=>(
                  <div key={f.key} style={{ marginBottom:14 }}>
                    <label style={{ fontSize:12, fontWeight:700, color:"#666", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:0.5 }}>{f.label}</label>
                    <input type="password" value={pwForm[f.key]} onChange={e=>setPwForm(p=>({...p,[f.key]:e.target.value}))}
                      placeholder={f.placeholder} style={inputStyle(pwError&&f.key!=="current")}/>
                  </div>
                ))}
                {pwError && <div style={{ fontSize:12, color:"#c0392b", fontWeight:700, marginBottom:12 }}>⚠ {pwError}</div>}
                <button className="btn-primary" onClick={savePw}>🔐 Change Password</button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"18px 24px", borderTop:"1px solid #f0e8df", fontSize:11, color:"#ccc" }}>
          ✦ Developed by <strong style={{ color:"#E8650A" }}>Abhijit Kumar Misra</strong> · MenuMitra Owner Portal · © 2026
        </div>
      </main>
    </div>
  );
}
