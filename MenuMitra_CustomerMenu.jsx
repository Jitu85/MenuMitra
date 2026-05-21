import { useState, useEffect, useRef } from "react";

// ─── MOCK BUSINESS DATA (fetched via slug in production) ─────────────────────
const BUSINESS = {
  name: "Sharma's Dhaba",
  nameHi: "शर्मा का ढाबा",
  tagline: "Home-style food with love",
  taglineHi: "घर जैसा खाना, प्यार के साथ",
  city: "Patna", state: "Bihar",
  tableCount: 12,
  paymentPref: "both",
  upiId: "ramesh@upi",
  slug: "sharmas-dhaba-patna",
};

const CATEGORIES = [
  { id:"all",   nameEn:"All",       nameHi:"सभी" },
  { id:"CAT1",  nameEn:"Main Course", nameHi:"मुख्य व्यंजन" },
  { id:"CAT2",  nameEn:"Breads",    nameHi:"रोटी" },
  { id:"CAT3",  nameEn:"Beverages", nameHi:"पेय पदार्थ" },
  { id:"CAT4",  nameEn:"Starters",  nameHi:"स्टार्टर" },
  { id:"CAT5",  nameEn:"Desserts",  nameHi:"मिठाई" },
];

const ITEMS = [
  { id:"I1",  cat:"CAT1", nameEn:"Dal Makhani",         nameHi:"दाल मखनी",          descEn:"Creamy black lentil curry",          descHi:"मलाईदार काली दाल करी",      price:180, veg:true,  photo:"🍛",  popular:true  },
  { id:"I2",  cat:"CAT1", nameEn:"Paneer Butter Masala", nameHi:"पनीर बटर मसाला",   descEn:"Cottage cheese in rich tomato gravy",descHi:"पनीर टमाटर की ग्रेवी",      price:220, veg:true,  photo:"🧆",  popular:true  },
  { id:"I3",  cat:"CAT1", nameEn:"Chicken Curry",        nameHi:"चिकन करी",          descEn:"Traditional homestyle chicken curry",descHi:"देसी चिकन करी",             price:280, veg:false, photo:"🍗",  popular:false },
  { id:"I4",  cat:"CAT1", nameEn:"Mutton Rogan Josh",    nameHi:"मटन रोगन जोश",     descEn:"Slow-cooked mutton in aromatic spices",descHi:"मसालेदार मटन",            price:380, veg:false, photo:"🥘",  popular:false },
  { id:"I5",  cat:"CAT2", nameEn:"Butter Naan",          nameHi:"बटर नान",           descEn:"Soft leavened bread with butter",    descHi:"मक्खन के साथ नरम नान",      price:40,  veg:true,  photo:"🫓",  popular:true  },
  { id:"I6",  cat:"CAT2", nameEn:"Tandoori Roti",        nameHi:"तंदूरी रोटी",       descEn:"Whole wheat bread from tandoor",     descHi:"तंदूर की गेहूं की रोटी",   price:25,  veg:true,  photo:"🫓",  popular:false },
  { id:"I7",  cat:"CAT2", nameEn:"Paratha",              nameHi:"पराठा",             descEn:"Flaky layered whole-wheat flatbread", descHi:"परतदार पराठा",              price:35,  veg:true,  photo:"🫓",  popular:false },
  { id:"I8",  cat:"CAT3", nameEn:"Masala Chai",          nameHi:"मसाला चाय",         descEn:"Indian spiced milk tea",             descHi:"भारतीय मसाला चाय",          price:30,  veg:true,  photo:"☕",  popular:true  },
  { id:"I9",  cat:"CAT3", nameEn:"Lassi (Sweet)",        nameHi:"मीठी लस्सी",        descEn:"Chilled sweet yoghurt drink",        descHi:"ठंडी मीठी लस्सी",           price:60,  veg:true,  photo:"🥛",  popular:false },
  { id:"I10", cat:"CAT3", nameEn:"Nimbu Pani",           nameHi:"नींबू पानी",        descEn:"Fresh lime water with mint",         descHi:"पुदीने के साथ नींबू पानी",  price:40,  veg:true,  photo:"🍋",  popular:false },
  { id:"I11", cat:"CAT4", nameEn:"Paneer Tikka",         nameHi:"पनीर टिक्का",       descEn:"Grilled cottage cheese with spices", descHi:"मसालेदार ग्रिल्ड पनीर",    price:240, veg:true,  photo:"🧆",  popular:true  },
  { id:"I12", cat:"CAT4", nameEn:"Chicken Tandoori",     nameHi:"तंदूरी चिकन",       descEn:"Marinated chicken from the tandoor", descHi:"तंदूरी मैरिनेट चिकन",      price:320, veg:false, photo:"🍗",  popular:false },
  { id:"I13", cat:"CAT5", nameEn:"Gulab Jamun",          nameHi:"गुलाब जामुन",       descEn:"Soft milk dumplings in sugar syrup", descHi:"चाशनी में मीठे गुलाब जामुन",price:80,  veg:true,  photo:"🍮",  popular:false },
  { id:"I14", cat:"CAT5", nameEn:"Kheer",                nameHi:"खीर",               descEn:"Rice pudding with cardamom & saffron",descHi:"केसर इलाइची की खीर",      price:90,  veg:true,  photo:"🥣",  popular:false },
];

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    scanOrder: "Scan & Order",
    selectTable: "Select Your Table",
    tableLabel: "Table Number",
    tablePlaceholder: "Choose table…",
    yourName: "Your Name (Optional)",
    namePlaceholder: "e.g. Rahul",
    notes: "Special Instructions",
    notesPlaceholder: "Any allergies or requests…",
    addToCart: "Add",
    cart: "Your Order",
    emptyCart: "Your cart is empty",
    emptyCartSub: "Add items from the menu above",
    subtotal: "Subtotal",
    placeOrder: "Place Order",
    payNow: "Pay Now",
    choosePayment: "Choose Payment Method",
    payUpi: "Pay via UPI QR",
    payRazorpay: "Pay via Razorpay",
    upiInstructions: "Scan the QR code below using any UPI app",
    upiId: "UPI ID",
    iHavePaid: "I Have Paid ✓",
    orderPlaced: "Order Placed!",
    orderConfirmed: "Payment Confirmed",
    orderNumber: "Order Number",
    thankYou: "Thank you for ordering!",
    thankYouSub: "Your order has been received. Food is being prepared.",
    items: "items",
    veg: "VEG",
    nonVeg: "NON-VEG",
    popular: "Popular",
    search: "Search dishes…",
    allDay: "All Day Menu",
    tableRequired: "Please select a table number before placing your order.",
    processing: "Processing…",
    orderSummary: "Order Summary",
    backToMenu: "← Back to Menu",
    newOrder: "Place New Order",
    tableNo: "Table No.",
    total: "Total",
  },
  hi: {
    scanOrder: "स्कैन और ऑर्डर करें",
    selectTable: "अपनी मेज चुनें",
    tableLabel: "मेज नंबर",
    tablePlaceholder: "मेज चुनें…",
    yourName: "आपका नाम (वैकल्पिक)",
    namePlaceholder: "जैसे राहुल",
    notes: "विशेष निर्देश",
    notesPlaceholder: "कोई एलर्जी या अनुरोध…",
    addToCart: "जोड़ें",
    cart: "आपका ऑर्डर",
    emptyCart: "आपकी कार्ट खाली है",
    emptyCartSub: "ऊपर मेनू से आइटम जोड़ें",
    subtotal: "कुल राशि",
    placeOrder: "ऑर्डर करें",
    payNow: "भुगतान करें",
    choosePayment: "भुगतान का तरीका चुनें",
    payUpi: "UPI QR से भुगतान",
    payRazorpay: "Razorpay से भुगतान",
    upiInstructions: "किसी भी UPI ऐप से नीचे दिया QR स्कैन करें",
    upiId: "UPI आईडी",
    iHavePaid: "मैंने भुगतान कर दिया ✓",
    orderPlaced: "ऑर्डर हो गया!",
    orderConfirmed: "भुगतान की पुष्टि हुई",
    orderNumber: "ऑर्डर नंबर",
    thankYou: "ऑर्डर के लिए धन्यवाद!",
    thankYouSub: "आपका ऑर्डर मिल गया है। खाना तैयार हो रहा है।",
    items: "आइटम",
    veg: "शाकाहारी",
    nonVeg: "मांसाहारी",
    popular: "लोकप्रिय",
    search: "व्यंजन खोजें…",
    allDay: "पूरे दिन का मेनू",
    tableRequired: "ऑर्डर देने से पहले कृपया मेज नंबर चुनें।",
    processing: "प्रक्रिया हो रही है…",
    orderSummary: "ऑर्डर सारांश",
    backToMenu: "← मेनू पर वापस",
    newOrder: "नया ऑर्डर करें",
    tableNo: "मेज नं.",
    total: "कुल",
  }
};

// ─── UPI QR SVG ───────────────────────────────────────────────────────────────
function UpiQR({ size = 160 }) {
  return (
    <div style={{ background: "white", padding: 12, borderRadius: 12, display: "inline-block", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
      <svg viewBox="0 0 160 160" width={size} height={size}>
        <rect width="160" height="160" fill="white"/>
        <rect x="8" y="8" width="44" height="44" fill="none" stroke="#1A1A1A" strokeWidth="5.5"/>
        <rect x="19" y="19" width="22" height="22" fill="#1A1A1A"/>
        <rect x="108" y="8" width="44" height="44" fill="none" stroke="#1A1A1A" strokeWidth="5.5"/>
        <rect x="119" y="19" width="22" height="22" fill="#1A1A1A"/>
        <rect x="8" y="108" width="44" height="44" fill="none" stroke="#1A1A1A" strokeWidth="5.5"/>
        <rect x="19" y="119" width="22" height="22" fill="#1A1A1A"/>
        {[[64,8],[72,8],[64,16],[72,24],[64,32],[72,32],[64,40],[72,40],[80,8],[88,8],[88,24],[80,32],[88,40],[80,48]].map(([x,y],i)=>(
          <rect key={i} x={x} y={y} width="6" height="6" fill="#1A1A1A"/>
        ))}
        {[[64,64],[72,64],[80,64],[88,64],[96,64],[64,72],[80,72],[96,72],[64,80],[72,80],[88,80],[96,80],[64,88],[72,88],[80,88],[64,96],[80,96],[88,96],[96,96]].map(([x,y],i)=>(
          <rect key={"d"+i} x={x} y={y} width="6" height="6" fill="#1A1A1A"/>
        ))}
        {[[108,64],[116,64],[124,64],[132,64],[140,64],[108,72],[124,72],[140,72],[108,80],[116,80],[132,80],[108,88],[124,88],[108,96],[116,96],[124,96],[132,96],[140,96]].map(([x,y],i)=>(
          <rect key={"e"+i} x={x} y={y} width="6" height="6" fill="#1A1A1A"/>
        ))}
        {[[108,108],[124,108],[140,108],[108,116],[116,116],[132,116],[108,124],[124,124],[140,124],[108,132],[116,132],[124,132],[108,140],[116,140],[132,140],[140,140]].map(([x,y],i)=>(
          <rect key={"f"+i} x={x} y={y} width="6" height="6" fill="#1A1A1A"/>
        ))}
        <rect x="68" y="68" width="24" height="24" rx="4" fill="white"/>
        <rect x="71" y="71" width="18" height="18" rx="3" fill="#E8650A"/>
        <text x="80" y="83" textAnchor="middle" fontSize="9" fill="white" fontWeight="900">UPI</text>
      </svg>
    </div>
  );
}

// ─── ORDER RECEIPT ────────────────────────────────────────────────────────────
function Receipt({ order, business, lang, t, onNewOrder }) {
  const orderNum = `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.floor(1000+Math.random()*9000)}`;
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(145deg,#FFFAF5,#FEF0DF)", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        {/* Success animation */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#2D6A4F,#40916C)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 16px", boxShadow:"0 12px 40px rgba(45,106,79,0.4)", animation:"bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}>✓</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:"#1A1A1A", marginBottom:6 }}>
            {order.paymentMethod==="upi" ? t.orderPlaced : t.orderConfirmed}
          </h1>
          <p style={{ fontSize:14, color:"#888", lineHeight:1.6 }}>{t.thankYouSub}</p>
        </div>

        {/* Receipt card */}
        <div style={{ background:"white", borderRadius:20, boxShadow:"0 12px 50px rgba(0,0,0,0.1)", overflow:"hidden", marginBottom:16 }}>
          {/* Header */}
          <div style={{ background:"linear-gradient(135deg,#E8650A,#C9920A)", padding:"20px 22px" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:900, color:"white" }}>{business.name}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", marginTop:2 }}>{business.city}, {business.state}</div>
          </div>

          <div style={{ padding:"18px 22px" }}>
            {/* Order meta */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16, padding:"12px", background:"#f9f4ef", borderRadius:10 }}>
              {[
                [t.orderNumber, orderNum],
                [t.tableNo, order.tableNumber],
                ["Date", new Date().toLocaleDateString("en-IN")],
                ["Time", new Date().toLocaleTimeString("en-IN", {hour:"2-digit",minute:"2-digit"})],
              ].map(([k,v],i)=>(
                <div key={i}>
                  <div style={{ fontSize:10, color:"#bbb", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, marginBottom:2 }}>{k}</div>
                  <div style={{ fontSize:12, fontWeight:800, color:"#1A1A1A" }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Items */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>{t.orderSummary}</div>
              {order.items.map((item,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom: i < order.items.length-1 ? "1px solid #f5ede5":"none", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:14, height:14, border:`2px solid ${item.veg?"#2D6A4F":"#c0392b"}`, borderRadius:3, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:item.veg?"#2D6A4F":"#c0392b" }}/>
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:"#333" }}>{lang==="hi"?item.nameHi:item.nameEn}</div>
                      <div style={{ fontSize:10, color:"#bbb" }}>× {item.qty} @ ₹{item.price}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:800, color:"#1A1A1A" }}>₹{item.qty * item.price}</div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ borderTop:"2px dashed #f0e8df", paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:16, fontWeight:800, color:"#1A1A1A" }}>{t.total}</span>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:"#E8650A" }}>₹{order.total}</span>
            </div>

            {/* Payment method */}
            <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:6, padding:"8px 12px", background:"rgba(45,106,79,0.06)", borderRadius:8 }}>
              <span style={{ fontSize:14 }}>{order.paymentMethod==="upi"?"📱":"💳"}</span>
              <span style={{ fontSize:12, fontWeight:700, color:"#2D6A4F" }}>
                {order.paymentMethod==="upi"?"Paid via UPI":"Paid via Razorpay"}
              </span>
            </div>
          </div>

          {/* Branding footer */}
          <div style={{ background:"#f9f4ef", padding:"12px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:10, color:"#bbb" }}>Powered by</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:13, fontWeight:900, color:"#E8650A" }}>MenuMitra</div>
            <div style={{ fontSize:9, color:"#ccc" }}>Developed by Abhijit Kumar Misra</div>
          </div>
        </div>

        <button onClick={onNewOrder} style={{
          width:"100%", padding:"14px", borderRadius:50, border:"2px solid #E8650A",
          background:"transparent", color:"#E8650A", fontWeight:800, fontSize:15,
          cursor:"pointer", fontFamily:"'DM Sans',sans-serif"
        }}>
          {t.newOrder}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function MenuMitraCustomerMenu() {
  const [lang, setLang] = useState("en");
  const [activeCat, setActiveCat] = useState("all");
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [view, setView] = useState("menu"); // menu | payment | confirm
  const [payMethod, setPayMethod] = useState(null);
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [tableError, setTableError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const catBarRef = useRef();

  const t = T[lang];

  // Cart helpers
  const qty = (id) => cart[id] || 0;
  const addItem = (id) => setCart(c => ({ ...c, [id]: (c[id]||0)+1 }));
  const removeItem = (id) => setCart(c => { const n={...c}; if(n[id]>1) n[id]--; else delete n[id]; return n; });

  const cartItems = ITEMS.filter(i => cart[i.id]).map(i => ({ ...i, qty: cart[i.id] }));
  const cartCount = Object.values(cart).reduce((s,v)=>s+v,0);
  const cartTotal = cartItems.reduce((s,i)=>s+i.price*i.qty,0);

  // Filtered items
  const filteredItems = ITEMS.filter(item => {
    const matchCat = activeCat==="all" || item.cat===activeCat;
    const q = search.toLowerCase();
    const matchSearch = !q || item.nameEn.toLowerCase().includes(q) || item.nameHi.includes(q) || item.descEn.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handlePlaceOrder = () => {
    if (!tableNumber) { setTableError(true); return; }
    setTableError(false);
    setView("payment");
    setCartOpen(false);
  };

  const handleUpiPaid = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setCompletedOrder({ items: cartItems, total: cartTotal, tableNumber, paymentMethod:"upi" });
      setView("confirm");
    }, 1800);
  };

  const handleRazorpay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setCompletedOrder({ items: cartItems, total: cartTotal, tableNumber, paymentMethod:"razorpay" });
      setView("confirm");
    }, 2200);
  };

  const resetOrder = () => {
    setCart({}); setView("menu"); setTableNumber(""); setCustomerName("");
    setNotes(""); setPayMethod(null); setCompletedOrder(null);
  };

  // ── Confirmation screen ──
  if (view==="confirm" && completedOrder) {
    return <Receipt order={completedOrder} business={BUSINESS} lang={lang} t={t} onNewOrder={resetOrder}/>;
  }

  return (
    <div style={{ minHeight:"100vh", background:"#FFFAF5", fontFamily:"'DM Sans',sans-serif", paddingBottom:120 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0}to{opacity:1} }
        @keyframes bounceIn{ 0%{transform:scale(0.3);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes cartPop { 0%{transform:scale(0.8)}60%{transform:scale(1.15)}100%{transform:scale(1)} }
        @keyframes shimmer { 0%{background-position:200% center}100%{background-position:-200% center} }
        .item-card { transition:transform 0.2s, box-shadow 0.2s; }
        .item-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,0.1) !important; }
        .cat-tab { transition:all 0.2s; white-space:nowrap; }
        .cat-tab:hover { background:rgba(232,101,10,0.08) !important; }
        .cat-tab.active { background:#E8650A !important; color:white !important; }
        .qty-btn { transition:all 0.15s; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; }
        .qty-btn:hover { filter:brightness(0.9); }
        input:focus, select:focus { outline:none; border-color:#E8650A !important; box-shadow:0 0 0 3px rgba(232,101,10,0.12) !important; }
        input::placeholder, textarea::placeholder { color:#c4b5a5; }
        ::-webkit-scrollbar { height:3px; width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(232,101,10,0.3); border-radius:3px; }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div style={{ background:"linear-gradient(135deg,#E8650A 0%,#C9920A 100%)", padding:"18px 16px 14px", position:"sticky", top:0, zIndex:200, boxShadow:"0 4px 20px rgba(232,101,10,0.35)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"white", lineHeight:1.1 }}>
              {lang==="hi" ? BUSINESS.nameHi : BUSINESS.name}
            </div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", marginTop:3 }}>
              {lang==="hi" ? BUSINESS.taglineHi : BUSINESS.tagline}
            </div>
          </div>
          {/* Lang toggle */}
          <button onClick={()=>setLang(l=>l==="en"?"hi":"en")}
            style={{ background:"rgba(255,255,255,0.2)", border:"1.5px solid rgba(255,255,255,0.4)", borderRadius:20, padding:"6px 14px", color:"white", fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", backdropFilter:"blur(8px)" }}>
            {lang==="en"?"हिंदी":"English"}
          </button>
        </div>
        <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:8, fontSize:11, color:"rgba(255,255,255,0.65)" }}>
          <span>📍</span><span>{BUSINESS.city}, {BUSINESS.state}</span>
          <span>·</span><span>🪑 {BUSINESS.tableCount} tables</span>
          <span>·</span><span>💳 UPI &amp; Cards</span>
        </div>
      </div>

      {/* ═══ SEARCH ═══ */}
      <div style={{ padding:"14px 16px 10px", background:"white", borderBottom:"1px solid #f0e8df" }}>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:15 }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={t.search}
            style={{ width:"100%", paddingLeft:36, paddingRight:14, paddingTop:10, paddingBottom:10, border:"1.5px solid #f0e8df", borderRadius:12, fontSize:13, background:"#faf6f2", fontFamily:"'DM Sans',sans-serif", color:"#1A1A1A" }}/>
        </div>
      </div>

      {/* ═══ CATEGORY TABS ═══ */}
      <div ref={catBarRef} style={{ background:"white", borderBottom:"1px solid #f0e8df", overflowX:"auto", display:"flex", gap:8, padding:"10px 16px", scrollbarWidth:"none", position:"sticky", top:88, zIndex:100 }}>
        <style>{`.cat-bar::-webkit-scrollbar{display:none}`}</style>
        {CATEGORIES.map(cat=>(
          <button key={cat.id} onClick={()=>setActiveCat(cat.id)}
            className={`cat-tab${activeCat===cat.id?" active":""}`}
            style={{ padding:"7px 16px", borderRadius:20, border:"1.5px solid",
              borderColor:activeCat===cat.id?"#E8650A":"#f0e8df",
              background:activeCat===cat.id?"#E8650A":"white",
              color:activeCat===cat.id?"white":"#888",
              fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              boxShadow:activeCat===cat.id?"0 4px 14px rgba(232,101,10,0.35)":"none" }}>
            {lang==="hi" ? cat.nameHi : cat.nameEn}
          </button>
        ))}
      </div>

      {/* ═══ PAYMENT PAGE ═══ */}
      {view==="payment" && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"#FFFAF5", overflowY:"auto", animation:"slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both" }}>
          <div style={{ background:"linear-gradient(135deg,#E8650A,#C9920A)", padding:"18px 16px 14px" }}>
            <button onClick={()=>setView("menu")} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:20, padding:"6px 14px", color:"white", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginBottom:10 }}>
              {t.backToMenu}
            </button>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"white" }}>{t.payNow}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", marginTop:2 }}>{t.tableNo} {tableNumber} · ₹{cartTotal}</div>
          </div>

          <div style={{ padding:"20px 16px" }}>
            {/* Order summary */}
            <div style={{ background:"white", borderRadius:16, padding:"16px", marginBottom:16, boxShadow:"0 2px 16px rgba(0,0,0,0.06)", border:"1px solid #f0e8df" }}>
              <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>{t.orderSummary}</div>
              {cartItems.map((item,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:i<cartItems.length-1?"1px solid #f5ede5":"none", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:16 }}>{item.photo}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:"#333" }}>{lang==="hi"?item.nameHi:item.nameEn}</div>
                      <div style={{ fontSize:10, color:"#bbb" }}>× {item.qty}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:800 }}>₹{item.price*item.qty}</div>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12, borderTop:"2px dashed #f0e8df", marginTop:6 }}>
                <span style={{ fontSize:15, fontWeight:800 }}>{t.total}</span>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"#E8650A" }}>₹{cartTotal}</span>
              </div>
            </div>

            {/* Choose payment */}
            {!payMethod && (
              <>
                <div style={{ fontSize:14, fontWeight:800, color:"#1A1A1A", marginBottom:12, textAlign:"center" }}>{t.choosePayment}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {(BUSINESS.paymentPref==="both"||BUSINESS.paymentPref==="upi_qr") && (
                    <button onClick={()=>setPayMethod("upi")}
                      style={{ padding:"16px 20px", borderRadius:14, border:"2px solid #f0e8df", background:"white", cursor:"pointer", display:"flex", alignItems:"center", gap:14, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="#E8650A";e.currentTarget.style.background="rgba(232,101,10,0.03)"}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="#f0e8df";e.currentTarget.style.background="white"}}>
                      <div style={{ width:46, height:46, borderRadius:12, background:"rgba(232,101,10,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>📱</div>
                      <div style={{ textAlign:"left" }}>
                        <div style={{ fontSize:14, fontWeight:800, color:"#1A1A1A" }}>{t.payUpi}</div>
                        <div style={{ fontSize:11, color:"#bbb", marginTop:2 }}>GPay · PhonePe · Paytm · Any UPI app</div>
                      </div>
                      <span style={{ marginLeft:"auto", fontSize:18, color:"#bbb" }}>›</span>
                    </button>
                  )}
                  {(BUSINESS.paymentPref==="both"||BUSINESS.paymentPref==="razorpay") && (
                    <button onClick={()=>setPayMethod("razorpay")}
                      style={{ padding:"16px 20px", borderRadius:14, border:"2px solid #f0e8df", background:"white", cursor:"pointer", display:"flex", alignItems:"center", gap:14, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="#E8650A";e.currentTarget.style.background="rgba(232,101,10,0.03)"}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="#f0e8df";e.currentTarget.style.background="white"}}>
                      <div style={{ width:46, height:46, borderRadius:12, background:"rgba(232,101,10,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>💳</div>
                      <div style={{ textAlign:"left" }}>
                        <div style={{ fontSize:14, fontWeight:800, color:"#1A1A1A" }}>{t.payRazorpay}</div>
                        <div style={{ fontSize:11, color:"#bbb", marginTop:2 }}>Cards · Net Banking · UPI · Wallets</div>
                      </div>
                      <span style={{ marginLeft:"auto", fontSize:18, color:"#bbb" }}>›</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {/* UPI QR screen */}
            {payMethod==="upi" && (
              <div style={{ animation:"slideUp 0.3s ease both" }}>
                <button onClick={()=>setPayMethod(null)} style={{ background:"none", border:"none", color:"#bbb", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginBottom:16 }}>← Change method</button>
                <div style={{ background:"white", borderRadius:16, padding:"24px 16px", boxShadow:"0 2px 20px rgba(0,0,0,0.07)", border:"1px solid #f0e8df", textAlign:"center" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#555", marginBottom:16 }}>{t.upiInstructions}</div>
                  <UpiQR size={180}/>
                  <div style={{ marginTop:16, padding:"10px 14px", background:"#f9f4ef", borderRadius:10, display:"inline-flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11, color:"#888", fontWeight:600 }}>{t.upiId}:</span>
                    <span style={{ fontSize:13, fontWeight:800, color:"#E8650A", fontFamily:"monospace" }}>{BUSINESS.upiId}</span>
                    <button onClick={()=>{navigator.clipboard?.writeText(BUSINESS.upiId)}} style={{ background:"rgba(232,101,10,0.1)", border:"none", borderRadius:6, padding:"3px 8px", fontSize:10, color:"#E8650A", fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Copy</button>
                  </div>
                  <div style={{ marginTop:14, fontSize:14, fontWeight:900, fontFamily:"'Playfair Display',serif", color:"#1A1A1A" }}>
                    Amount: <span style={{ color:"#E8650A" }}>₹{cartTotal}</span>
                  </div>
                  <div style={{ marginTop:6, fontSize:11, color:"#bbb" }}>Pay exactly ₹{cartTotal} — do not change the amount</div>
                </div>
                <button onClick={handleUpiPaid} disabled={processing}
                  style={{ width:"100%", marginTop:16, padding:"16px", borderRadius:50, border:"none",
                    background: processing?"#c8a07a":"linear-gradient(135deg,#2D6A4F,#40916C)",
                    color:"white", fontWeight:800, fontSize:15, cursor:processing?"not-allowed":"pointer",
                    fontFamily:"'DM Sans',sans-serif", boxShadow:"0 6px 24px rgba(45,106,79,0.4)",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                  {processing
                    ? <><span style={{ width:18, height:18, border:"2.5px solid rgba(255,255,255,0.4)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }}/>{t.processing}</>
                    : t.iHavePaid}
                </button>
                <div style={{ textAlign:"center", marginTop:10, fontSize:11, color:"#bbb" }}>Only tap after completing payment in your UPI app</div>
              </div>
            )}

            {/* Razorpay screen */}
            {payMethod==="razorpay" && (
              <div style={{ animation:"slideUp 0.3s ease both" }}>
                <button onClick={()=>setPayMethod(null)} style={{ background:"none", border:"none", color:"#bbb", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginBottom:16 }}>← Change method</button>
                <div style={{ background:"white", borderRadius:16, padding:"24px 16px", boxShadow:"0 2px 20px rgba(0,0,0,0.07)", border:"1px solid #f0e8df", textAlign:"center", marginBottom:16 }}>
                  <div style={{ fontSize:28, marginBottom:12 }}>💳</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"#1A1A1A", marginBottom:6 }}>Pay ₹{cartTotal}</div>
                  <div style={{ fontSize:12, color:"#bbb", marginBottom:16 }}>You will be redirected to Razorpay's secure checkout.</div>
                  <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginBottom:16 }}>
                    {["GPay","PhonePe","Paytm","Visa","Mastercard","NetBanking"].map(m=>(
                      <span key={m} style={{ fontSize:10, background:"#f5ede5", color:"#888", borderRadius:6, padding:"4px 8px", fontWeight:600 }}>{m}</span>
                    ))}
                  </div>
                  <div style={{ fontSize:11, color:"#bbb", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                    <span>🔒</span> Secured by Razorpay · 256-bit SSL
                  </div>
                </div>
                <button onClick={handleRazorpay} disabled={processing}
                  style={{ width:"100%", padding:"16px", borderRadius:50, border:"none",
                    background:processing?"#c8a07a":"linear-gradient(135deg,#E8650A,#C9920A)",
                    color:"white", fontWeight:800, fontSize:15, cursor:processing?"not-allowed":"pointer",
                    fontFamily:"'DM Sans',sans-serif", boxShadow:"0 6px 24px rgba(232,101,10,0.4)",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                  {processing
                    ? <><span style={{ width:18, height:18, border:"2.5px solid rgba(255,255,255,0.4)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }}/>{t.processing}</>
                    : `💳 Pay ₹${cartTotal} via Razorpay`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ MENU ITEMS ═══ */}
      {view==="menu" && (
        <div style={{ padding:"14px 16px" }}>
          {filteredItems.length===0 ? (
            <div style={{ textAlign:"center", padding:"60px 20px", color:"#bbb" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#999" }}>No items found</div>
              <div style={{ fontSize:12, marginTop:6 }}>Try a different search or category</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {filteredItems.map((item, i) => (
                <div key={item.id} className="item-card" style={{
                  background:"white", borderRadius:16, padding:"14px",
                  boxShadow:"0 2px 14px rgba(0,0,0,0.06)", border:"1px solid #f5ede5",
                  display:"flex", gap:12, alignItems:"stretch",
                  animation:`slideUp 0.4s ${i*0.04}s both`
                }}>
                  {/* Photo */}
                  <div style={{ width:70, height:70, borderRadius:12, background:"linear-gradient(135deg,#fef0df,#fff5ea)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, flexShrink:0 }}>
                    {item.photo}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                      <div style={{ minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:3 }}>
                          {/* Veg indicator */}
                          <div style={{ width:14, height:14, border:`2px solid ${item.veg?"#2D6A4F":"#c0392b"}`, borderRadius:3, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <div style={{ width:6, height:6, borderRadius:"50%", background:item.veg?"#2D6A4F":"#c0392b" }}/>
                          </div>
                          <span style={{ fontSize:13, fontWeight:800, color:"#1A1A1A", lineHeight:1.2 }}>{lang==="hi" ? item.nameHi : item.nameEn}</span>
                          {item.popular && (
                            <span style={{ fontSize:9, fontWeight:800, background:"linear-gradient(135deg,#E8650A,#C9920A)", color:"white", borderRadius:10, padding:"2px 7px", letterSpacing:0.5 }}>
                              ★ {t.popular}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize:11, color:"#aaa", lineHeight:1.5, marginBottom:8, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {lang==="hi" ? item.descHi : item.descEn}
                        </div>
                      </div>
                    </div>

                    {/* Price + Add to cart */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:900, color:"#E8650A" }}>₹{item.price}</div>

                      {qty(item.id) === 0 ? (
                        <button onClick={()=>addItem(item.id)}
                          style={{ background:"linear-gradient(135deg,#E8650A,#C9920A)", color:"white", border:"none", borderRadius:10, padding:"7px 18px", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 3px 12px rgba(232,101,10,0.35)", transition:"all 0.2s" }}
                          onMouseEnter={e=>e.target.style.transform="scale(1.05)"}
                          onMouseLeave={e=>e.target.style.transform="scale(1)"}>
                          + {t.addToCart}
                        </button>
                      ) : (
                        <div style={{ display:"flex", alignItems:"center", gap:0, background:"#f5ede5", borderRadius:10, overflow:"hidden" }}>
                          <button className="qty-btn" onClick={()=>removeItem(item.id)}
                            style={{ width:34, height:34, background:"transparent", color:"#E8650A", fontSize:18, fontWeight:900 }}>
                            −
                          </button>
                          <span style={{ minWidth:28, textAlign:"center", fontSize:14, fontWeight:900, color:"#1A1A1A" }}>{qty(item.id)}</span>
                          <button className="qty-btn" onClick={()=>addItem(item.id)}
                            style={{ width:34, height:34, background:"#E8650A", color:"white", fontSize:18, fontWeight:900 }}>
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ FLOATING CART BUTTON ═══ */}
      {view==="menu" && cartCount > 0 && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:300, padding:"12px 16px", background:"linear-gradient(to top, rgba(255,250,245,1) 70%, transparent)" }}>
          <button onClick={()=>setCartOpen(true)}
            style={{ width:"100%", padding:"15px 20px", borderRadius:16, border:"none",
              background:"linear-gradient(135deg,#1A1A1A,#2A2A2A)",
              color:"white", fontWeight:800, fontSize:15, cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif", boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
              display:"flex", justifyContent:"space-between", alignItems:"center",
              animation:"slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
            <span style={{ background:"#E8650A", borderRadius:8, padding:"2px 10px", fontSize:13, fontWeight:900 }}>{cartCount} {t.items}</span>
            <span>{t.cart}</span>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:900, color:"#E8650A" }}>₹{cartTotal}</span>
          </button>
        </div>
      )}

      {/* ═══ CART DRAWER ═══ */}
      {cartOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:400, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
          {/* Backdrop */}
          <div onClick={()=>setCartOpen(false)} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)", animation:"fadeIn 0.2s ease both" }}/>

          {/* Sheet */}
          <div style={{ position:"relative", background:"white", borderRadius:"24px 24px 0 0", maxHeight:"85vh", display:"flex", flexDirection:"column", animation:"slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both", boxShadow:"0 -20px 60px rgba(0,0,0,0.25)" }}>

            {/* Handle */}
            <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
              <div style={{ width:40, height:4, borderRadius:2, background:"#e8ddd4" }}/>
            </div>

            {/* Header */}
            <div style={{ padding:"8px 20px 14px", borderBottom:"1px solid #f5ede5", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900 }}>{t.cart}</div>
                <div style={{ fontSize:12, color:"#bbb", marginTop:1 }}>{cartCount} {t.items} · {BUSINESS.name}</div>
              </div>
              <button onClick={()=>setCartOpen(false)} style={{ width:32, height:32, borderRadius:10, background:"#f5ede5", border:"none", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>

            {/* Scrollable body */}
            <div style={{ overflowY:"auto", flex:1, padding:"14px 20px" }}>

              {/* Items */}
              {cartItems.map((item,i)=>(
                <div key={item.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:i<cartItems.length-1?"1px solid #f5ede5":"none" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <span style={{ fontSize:20 }}>{item.photo}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#1A1A1A" }}>{lang==="hi"?item.nameHi:item.nameEn}</div>
                      <div style={{ fontSize:11, color:"#bbb" }}>₹{item.price} each</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:0, background:"#f5ede5", borderRadius:10, overflow:"hidden" }}>
                    <button className="qty-btn" onClick={()=>removeItem(item.id)} style={{ width:32, height:32, background:"transparent", color:"#E8650A", fontSize:16, fontWeight:900 }}>−</button>
                    <span style={{ minWidth:26, textAlign:"center", fontSize:13, fontWeight:900, color:"#1A1A1A" }}>{item.qty}</span>
                    <button className="qty-btn" onClick={()=>addItem(item.id)} style={{ width:32, height:32, background:"#E8650A", color:"white", fontSize:16, fontWeight:900 }}>+</button>
                  </div>
                  <div style={{ fontSize:13, fontWeight:800, color:"#1A1A1A", minWidth:48, textAlign:"right" }}>₹{item.price*item.qty}</div>
                </div>
              ))}

              {/* Table selector */}
              <div style={{ marginTop:18, padding:"16px", background:"#f9f4ef", borderRadius:14, border:`1.5px solid ${tableError?"#c0392b":"#f0e8df"}` }}>
                <label style={{ fontSize:12, fontWeight:800, color:"#E8650A", display:"block", marginBottom:10, textTransform:"uppercase", letterSpacing:0.5 }}>
                  🪑 {t.tableLabel} *
                </label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6 }}>
                  {Array.from({length:BUSINESS.tableCount},(_,i)=>i+1).map(n=>(
                    <button key={n} onClick={()=>{setTableNumber(String(n));setTableError(false);}}
                      style={{ padding:"8px 4px", borderRadius:8, border:`2px solid ${tableNumber===String(n)?"#E8650A":"#e8ddd4"}`, background:tableNumber===String(n)?"#E8650A":"white", color:tableNumber===String(n)?"white":"#555", fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
                      {n}
                    </button>
                  ))}
                </div>
                {tableError && <div style={{ fontSize:11, color:"#c0392b", marginTop:8, fontWeight:700 }}>⚠ {t.tableRequired}</div>}
              </div>

              {/* Customer name */}
              <div style={{ marginTop:12 }}>
                <label style={{ fontSize:12, fontWeight:700, color:"#666", display:"block", marginBottom:6 }}>{t.yourName}</label>
                <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder={t.namePlaceholder}
                  style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #f0e8df", borderRadius:10, fontSize:13, background:"white", fontFamily:"'DM Sans',sans-serif", color:"#1A1A1A" }}/>
              </div>

              {/* Notes */}
              <div style={{ marginTop:12 }}>
                <label style={{ fontSize:12, fontWeight:700, color:"#666", display:"block", marginBottom:6 }}>{t.notes}</label>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder={t.notesPlaceholder} rows={2}
                  style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #f0e8df", borderRadius:10, fontSize:13, background:"white", fontFamily:"'DM Sans',sans-serif", color:"#1A1A1A", resize:"none" }}/>
              </div>

              {/* Subtotal */}
              <div style={{ marginTop:14, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:"white", borderRadius:12, border:"1px solid #f0e8df" }}>
                <span style={{ fontSize:15, fontWeight:700, color:"#555" }}>{t.subtotal}</span>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"#E8650A" }}>₹{cartTotal}</span>
              </div>
            </div>

            {/* Place order button */}
            <div style={{ padding:"14px 20px", borderTop:"1px solid #f5ede5" }}>
              <button onClick={handlePlaceOrder} style={{
                width:"100%", padding:"16px", borderRadius:50, border:"none",
                background:"linear-gradient(135deg,#E8650A,#C9920A)",
                color:"white", fontWeight:800, fontSize:16, cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif", boxShadow:"0 6px 24px rgba(232,101,10,0.4)"
              }}>
                {t.placeOrder} · ₹{cartTotal} →
              </button>
              <div style={{ textAlign:"center", marginTop:8, fontSize:11, color:"#bbb" }}>
                No login required · Secure payment
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      {view==="menu" && cartCount===0 && (
        <div style={{ textAlign:"center", padding:"30px 16px 20px", borderTop:"1px solid #f0e8df", marginTop:20 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            <span style={{ fontSize:12, color:"#ccc" }}>Powered by</span>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:900, color:"#E8650A" }}>MenuMitra</span>
          </div>
          <div style={{ fontSize:10, color:"#ddd", marginTop:4 }}>Developed by Abhijit Kumar Misra</div>
        </div>
      )}
    </div>
  );
}
