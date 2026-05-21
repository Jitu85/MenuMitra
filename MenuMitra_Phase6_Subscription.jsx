import { useState, useEffect } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PLAN = {
  name: "MenuMitra Standard",
  price: 100,
  trialDays: 30,
  features: [
    "Unlimited menu items & categories",
    "English + Hindi bilingual menu",
    "Unique QR code for your business",
    "UPI QR & Razorpay payment support",
    "Browser & Thermal print receipts",
    "4-digit order confirmation codes",
    "Real-time order notifications",
    "Sales analytics dashboard",
    "Zero delivery commission — ever",
  ],
};

const PAYMENT_HISTORY = [
  { id: "PAY001", date: "2026-05-01", amount: 100, status: "paid",   method: "Razorpay", invoiceId: "INV-2026-05-001" },
  { id: "PAY002", date: "2026-04-01", amount: 100, status: "paid",   method: "Razorpay", invoiceId: "INV-2026-04-001" },
  { id: "PAY003", date: "2026-03-01", amount: 100, status: "paid",   method: "Razorpay", invoiceId: "INV-2026-03-001" },
  { id: "PAY004", date: "2026-02-01", amount: 0,   status: "free",   method: "Trial",    invoiceId: "TRIAL-2026-02"   },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function daysLeft(dateStr) {
  return Math.max(0, Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24)));
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function addMonths(dateStr, n) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().split("T")[0];
}

function StatusBadge({ status }) {
  const map = {
    active:    { bg: "rgba(45,106,79,0.12)",  color: "#2D6A4F", label: "✓ Active"    },
    trial:     { bg: "rgba(232,101,10,0.12)", color: "#E8650A", label: "⏳ Free Trial" },
    expired:   { bg: "rgba(192,57,43,0.12)", color: "#c0392b", label: "✕ Expired"   },
    suspended: { bg: "rgba(192,57,43,0.12)", color: "#c0392b", label: "🔒 Suspended" },
    grace:     { bg: "rgba(201,146,10,0.12)", color: "#C9920A", label: "⚠ Grace Period" },
  };
  const s = map[status] || map.expired;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 800, letterSpacing: 0.3 }}>
      {s.label}
    </span>
  );
}

// ─── RAZORPAY CHECKOUT MODAL (simulated) ─────────────────────────────────────

function RazorpayModal({ amount, purpose, onSuccess, onClose }) {
  const [step, setStep]       = useState("method"); // method | upi | card | processing | done
  const [upiId, setUpiId]     = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry]   = useState("");
  const [cvv, setCvv]         = useState("");
  const [name, setName]       = useState("");
  const [error, setError]     = useState("");

  const processPayment = () => {
    setStep("processing");
    setTimeout(() => { setStep("done"); setTimeout(onSuccess, 1200); }, 2200);
  };

  const validateUpi = () => {
    if (!upiId.includes("@")) { setError("Enter a valid UPI ID (e.g. name@upi)"); return; }
    setError(""); processPayment();
  };

  const validateCard = () => {
    if (cardNum.replace(/\s/g, "").length < 16) { setError("Enter a valid 16-digit card number."); return; }
    if (!expiry.match(/^\d{2}\/\d{2}$/))         { setError("Enter expiry as MM/YY.");              return; }
    if (cvv.length < 3)                           { setError("Enter a valid 3-digit CVV.");          return; }
    if (!name.trim())                             { setError("Enter cardholder name.");              return; }
    setError(""); processPayment();
  };

  const formatCard = (val) => val.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9500, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.65)", backdropFilter:"blur(4px)", padding:16 }}>
      <div style={{ background:"white", borderRadius:22, maxWidth:400, width:"100%", overflow:"hidden", boxShadow:"0 40px 80px rgba(0,0,0,0.4)", animation:"modalIn 0.35s cubic-bezier(0.22,1,0.36,1) both" }}>
        <style>{`
          @keyframes modalIn{from{opacity:0;transform:scale(0.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes checkIn{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
          input:focus{outline:none;border-color:#E8650A!important;box-shadow:0 0 0 3px rgba(232,101,10,0.12)!important}
          input::placeholder{color:#ccc}
        `}</style>

        {/* Razorpay header */}
        <div style={{ background:"linear-gradient(135deg,#072654,#1a3a6b)", padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:6, background:"#2EB2FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>💳</div>
              <span style={{ color:"white", fontWeight:800, fontSize:15 }}>Razorpay Checkout</span>
            </div>
            <div style={{ color:"rgba(255,255,255,0.55)", fontSize:11, marginTop:4 }}>{purpose}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ color:"white", fontWeight:900, fontSize:20, fontFamily:"'Playfair Display',serif" }}>₹{amount}</div>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:10 }}>Secure Payment</div>
          </div>
        </div>

        <div style={{ padding:"18px 20px" }}>

          {/* Method selection */}
          {step === "method" && (
            <>
              <div style={{ fontSize:12, fontWeight:700, color:"#666", marginBottom:12, textTransform:"uppercase", letterSpacing:0.5 }}>Select Payment Method</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { id:"upi",  icon:"📱", label:"UPI",         sub:"GPay · PhonePe · Paytm · Any UPI" },
                  { id:"card", icon:"💳", label:"Credit / Debit Card", sub:"Visa · Mastercard · RuPay" },
                  { id:"nb",   icon:"🏦", label:"Net Banking",  sub:"All major banks supported" },
                ].map(m => (
                  <button key={m.id} onClick={() => { if(m.id==="nb"){processPayment();}else{setStep(m.id);} }}
                    style={{ padding:"12px 14px", border:"1.5px solid #f0e8df", borderRadius:12, background:"white", cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor="#E8650A"; e.currentTarget.style.background="rgba(232,101,10,0.03)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor="#f0e8df"; e.currentTarget.style.background="white"; }}>
                    <span style={{ fontSize:22 }}>{m.icon}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:800, color:"#1A1A1A" }}>{m.label}</div>
                      <div style={{ fontSize:11, color:"#bbb" }}>{m.sub}</div>
                    </div>
                    <span style={{ marginLeft:"auto", color:"#bbb" }}>›</span>
                  </button>
                ))}
              </div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:14 }}>
                <span style={{ fontSize:12 }}>🔒</span>
                <span style={{ fontSize:11, color:"#bbb" }}>256-bit SSL · Secured by Razorpay</span>
              </div>
              <button onClick={onClose} style={{ width:"100%", marginTop:10, padding:"9px", background:"none", border:"none", color:"#bbb", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
            </>
          )}

          {/* UPI */}
          {step === "upi" && (
            <>
              <button onClick={()=>{setStep("method");setError("");}} style={{ background:"none",border:"none",color:"#bbb",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:14 }}>← Back</button>
              <div style={{ fontSize:12, fontWeight:700, color:"#666", marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>Enter UPI ID</div>
              <input value={upiId} onChange={e=>setUpiId(e.target.value)} placeholder="yourname@upi"
                style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #f0e8df", borderRadius:10, fontSize:14, fontFamily:"'DM Sans',sans-serif", color:"#1A1A1A", marginBottom:6 }}/>
              {error && <div style={{ fontSize:11, color:"#c0392b", fontWeight:700, marginBottom:8 }}>⚠ {error}</div>}
              <div style={{ fontSize:11, color:"#bbb", marginBottom:16 }}>You will receive a payment request on your UPI app.</div>
              <button onClick={validateUpi}
                style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#E8650A,#C9920A)", color:"white", border:"none", borderRadius:50, fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Send Payment Request →
              </button>
            </>
          )}

          {/* Card */}
          {step === "card" && (
            <>
              <button onClick={()=>{setStep("method");setError("");}} style={{ background:"none",border:"none",color:"#bbb",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:14 }}>← Back</button>
              <div style={{ fontSize:12, fontWeight:700, color:"#666", marginBottom:12, textTransform:"uppercase", letterSpacing:0.5 }}>Card Details</div>
              {[
                { label:"Card Number", val:cardNum, set:e=>setCardNum(formatCard(e.target.value)), placeholder:"0000 0000 0000 0000", type:"tel" },
                { label:"Cardholder Name", val:name, set:e=>setName(e.target.value), placeholder:"Name on card", type:"text" },
              ].map(f=>(
                <div key={f.label} style={{ marginBottom:12 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"#888", display:"block", marginBottom:5 }}>{f.label}</label>
                  <input type={f.type} value={f.val} onChange={f.set} placeholder={f.placeholder}
                    style={{ width:"100%", padding:"11px 14px", border:"1.5px solid #f0e8df", borderRadius:10, fontSize:13, fontFamily:"'DM Sans',sans-serif", color:"#1A1A1A" }}/>
                </div>
              ))}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                {[
                  { label:"Expiry (MM/YY)", val:expiry, set:e=>setExpiry(e.target.value.replace(/[^\d/]/g,"").slice(0,5)), placeholder:"MM/YY" },
                  { label:"CVV", val:cvv, set:e=>setCvv(e.target.value.replace(/\D/g,"").slice(0,4)), placeholder:"•••" },
                ].map(f=>(
                  <div key={f.label}>
                    <label style={{ fontSize:11, fontWeight:700, color:"#888", display:"block", marginBottom:5 }}>{f.label}</label>
                    <input type="tel" value={f.val} onChange={f.set} placeholder={f.placeholder}
                      style={{ width:"100%", padding:"11px 14px", border:"1.5px solid #f0e8df", borderRadius:10, fontSize:13, fontFamily:"'DM Sans',sans-serif", color:"#1A1A1A" }}/>
                  </div>
                ))}
              </div>
              {error && <div style={{ fontSize:11, color:"#c0392b", fontWeight:700, marginBottom:10 }}>⚠ {error}</div>}
              <button onClick={validateCard}
                style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#E8650A,#C9920A)", color:"white", border:"none", borderRadius:50, fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Pay ₹{amount} Securely →
              </button>
            </>
          )}

          {/* Processing */}
          {step === "processing" && (
            <div style={{ textAlign:"center", padding:"30px 20px" }}>
              <div style={{ width:56, height:56, border:"4px solid rgba(232,101,10,0.2)", borderTopColor:"#E8650A", borderRadius:"50%", margin:"0 auto 18px", animation:"spin 0.8s linear infinite" }}/>
              <div style={{ fontSize:16, fontWeight:800, color:"#1A1A1A", marginBottom:6 }}>Processing Payment…</div>
              <div style={{ fontSize:12, color:"#bbb" }}>Please wait. Do not close this window.</div>
            </div>
          )}

          {/* Done */}
          {step === "done" && (
            <div style={{ textAlign:"center", padding:"24px 20px" }}>
              <div style={{ width:60, height:60, borderRadius:"50%", background:"linear-gradient(135deg,#2D6A4F,#40916C)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 14px", animation:"checkIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>✓</div>
              <div style={{ fontSize:18, fontWeight:900, fontFamily:"'Playfair Display',serif", color:"#1A1A1A", marginBottom:6 }}>Payment Successful!</div>
              <div style={{ fontSize:12, color:"#888" }}>Redirecting to your dashboard…</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MENU UNAVAILABLE PAGE (shown to customers when subscription lapses) ──────

function MenuUnavailable({ businessName }) {
  return (
    <div style={{ minHeight:"100vh", background:"#FFFAF5", display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 20px", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700;800&display=swap');`}</style>
      <div style={{ textAlign:"center", maxWidth:380 }}>
        <div style={{ fontSize:64, marginBottom:20 }}>🔒</div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:900, color:"#1A1A1A", marginBottom:10 }}>
          Menu Temporarily Unavailable
        </h1>
        <p style={{ fontSize:14, color:"#888", lineHeight:1.75, marginBottom:24 }}>
          <strong style={{ color:"#1A1A1A" }}>{businessName}</strong>'s digital menu is currently unavailable. Please ask the staff for the physical menu or try again later.
        </p>
        <div style={{ background:"rgba(232,101,10,0.06)", border:"1px solid rgba(232,101,10,0.15)", borderRadius:14, padding:"14px 18px", marginBottom:24 }}>
          <div style={{ fontSize:12, color:"#8A6A4A", lineHeight:1.7 }}>
            If you are the business owner, please renew your MenuMitra subscription to restore your menu page.
          </div>
        </div>
        <div style={{ fontSize:11, color:"#ccc" }}>Powered by <strong style={{ color:"#E8650A" }}>MenuMitra</strong></div>
        <div style={{ fontSize:9, color:"#ddd", marginTop:4 }}>Developed by Abhijit Kumar Misra</div>
      </div>
    </div>
  );
}

// ─── SUBSCRIPTION EXPIRY REMINDER BANNER (shown in owner dashboard) ───────────

function ExpiryBanner({ daysRemaining, onRenew }) {
  if (daysRemaining > 14) return null;
  const urgent = daysRemaining <= 3;
  return (
    <div style={{ background: urgent ? "linear-gradient(135deg,#c0392b,#e74c3c)" : "linear-gradient(135deg,#C9920A,#E8650A)", borderRadius:14, padding:"14px 18px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        <span style={{ fontSize:22 }}>{urgent ? "🚨" : "⏰"}</span>
        <div>
          <div style={{ fontWeight:800, color:"white", fontSize:14 }}>
            {urgent ? `Subscription expires in ${daysRemaining} day${daysRemaining!==1?"s":""}!` : `Subscription renews in ${daysRemaining} days`}
          </div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", marginTop:2 }}>
            {urgent ? "Renew now to avoid menu disruption for your customers." : "Your menu will remain active. Renew early to stay uninterrupted."}
          </div>
        </div>
      </div>
      <button onClick={onRenew}
        style={{ padding:"9px 20px", background:"white", color: urgent?"#c0392b":"#E8650A", border:"none", borderRadius:20, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
        Renew Now →
      </button>
    </div>
  );
}

// ─── MAIN SUBSCRIPTION PAGE ──────────────────────────────────────────────────

export default function MenuMitraSubscription() {
  const [subState, setSubState]     = useState("trial"); // trial | active | expired | suspended | grace
  const [expiryDate, setExpiryDate] = useState("2026-05-31");
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [payHistory, setPayHistory] = useState(PAYMENT_HISTORY);
  const [toast, setToast]           = useState(null);
  const [demoTab, setDemoTab]       = useState("subscription"); // subscription | expired | unavailable

  const days = daysLeft(expiryDate);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handlePaymentSuccess = () => {
    setShowRazorpay(false);
    const newExpiry = subState === "trial" || subState === "expired"
      ? addMonths(new Date().toISOString().split("T")[0], 1)
      : addMonths(expiryDate, 1);
    setExpiryDate(newExpiry);
    setSubState("active");
    const newPay = { id:`PAY${Date.now()}`, date:new Date().toISOString().split("T")[0], amount:100, status:"paid", method:"Razorpay", invoiceId:`INV-${new Date().toISOString().slice(0,7)}-${Math.floor(Math.random()*900+100)}` };
    setPayHistory(h => [newPay, ...h]);
    showToast("✅ Subscription renewed! Your menu is active for another month.");
  };

  const toastColors = { success:"#2D6A4F", error:"#c0392b", warning:"#C9920A" };

  return (
    <div style={{ minHeight:"100vh", background:"#F5EFE8", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.6} }
        input:focus { outline:none; border-color:#E8650A!important; }
        .card { background:white; border-radius:18px; border:1px solid rgba(232,101,10,0.08); box-shadow:0 2px 18px rgba(0,0,0,0.05); }
        .plan-check { display:flex; align-items:center; gap:10; padding:8px 0; border-bottom:1px solid #f5ede5; font-size:13px; color:#555; }
        .plan-check:last-child { border-bottom:none; }
        .btn-primary { background:linear-gradient(135deg,#E8650A,#C9920A); color:white; border:none; border-radius:50px; padding:13px 26px; font-size:14px; font-weight:800; cursor:pointer; font-family:'DM Sans',sans-serif; box-shadow:0 6px 22px rgba(232,101,10,0.38); transition:all 0.2s; }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(232,101,10,0.48); }
        .btn-outline { background:transparent; color:#E8650A; border:2px solid #E8650A; border-radius:50px; padding:11px 22px; font-size:13px; font-weight:800; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
        .btn-outline:hover { background:#E8650A; color:white; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:9999, background:toastColors[toast.type]||"#1A1A1A", color:"white", padding:"12px 22px", borderRadius:12, fontWeight:700, fontSize:13, boxShadow:"0 8px 32px rgba(0,0,0,0.25)", whiteSpace:"nowrap", animation:"toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>{toast.msg}</div>
      )}

      {showRazorpay && (
        <RazorpayModal amount={PLAN.price} purpose={`MenuMitra Standard — ${subState==="trial"?"First Payment":"Monthly Renewal"}`} onSuccess={handlePaymentSuccess} onClose={()=>setShowRazorpay(false)}/>
      )}

      {/* Header */}
      <div style={{ background:"white", borderBottom:"1px solid #f0e8df", padding:"16px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#E8650A,#C9920A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🍽️</div>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:17, color:"#1A1A1A" }}>MenuMitra</div>
            <div style={{ fontSize:8, color:"#E8650A", fontWeight:700, letterSpacing:1.5, textTransform:"uppercase" }}>Subscription</div>
          </div>
        </div>
        {/* Demo state switcher */}
        <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ fontSize:10, color:"#bbb", fontWeight:600 }}>DEMO:</span>
          {[["trial","⏳ Trial"],["active","✅ Active"],["grace","⚠️ Grace"],["expired","❌ Expired"]].map(([v,l])=>(
            <button key={v} onClick={()=>{ setSubState(v); setExpiryDate(v==="expired"?"2026-04-30":v==="grace"?"2026-05-20":v==="active"?"2026-06-12":"2026-05-31"); }}
              style={{ padding:"5px 10px", borderRadius:14, border:"none", cursor:"pointer", fontSize:10, fontWeight:700, fontFamily:"'DM Sans',sans-serif", background:subState===v?"#E8650A":"rgba(0,0,0,0.06)", color:subState===v?"white":"#888" }}>
              {l}
            </button>
          ))}
          <span style={{ width:1, height:16, background:"#e8ddd4", margin:"0 4px" }}/>
          {[["subscription","Subscription"],["expired","Expired Screen"],["unavailable","Customer View"]].map(([v,l])=>(
            <button key={v} onClick={()=>setDemoTab(v)}
              style={{ padding:"5px 10px", borderRadius:14, border:"none", cursor:"pointer", fontSize:10, fontWeight:700, fontFamily:"'DM Sans',sans-serif", background:demoTab===v?"#1A1A1A":"rgba(0,0,0,0.06)", color:demoTab===v?"white":"#888" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── CUSTOMER UNAVAILABLE VIEW ── */}
      {demoTab === "unavailable" && <MenuUnavailable businessName="Sharma's Dhaba"/>}

      {/* ── EXPIRED OWNER VIEW ── */}
      {demoTab === "expired" && (
        <div style={{ padding:"32px 28px", maxWidth:680, margin:"0 auto", animation:"fadeUp 0.4s ease both" }}>
          <div style={{ background:"linear-gradient(135deg,#c0392b,#e74c3c)", borderRadius:20, padding:"32px", textAlign:"center", marginBottom:24, boxShadow:"0 12px 40px rgba(192,57,43,0.35)" }}>
            <div style={{ fontSize:48, marginBottom:14 }}>🔒</div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:"white", marginBottom:10 }}>
              Subscription Expired
            </h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.8)", lineHeight:1.75, marginBottom:20 }}>
              Your MenuMitra subscription expired on <strong>30 Apr 2026</strong>.<br/>
              Your menu page is currently showing a "Menu Unavailable" message to your customers.
            </p>
            <button className="btn-primary" style={{ background:"white", color:"#c0392b", boxShadow:"0 6px 24px rgba(0,0,0,0.2)" }} onClick={()=>setShowRazorpay(true)}>
              🔓 Renew for ₹100 — Restore Menu Instantly
            </button>
          </div>
          <div className="card" style={{ padding:"22px" }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>⚠ What you are missing</div>
            {["Your QR code menu is showing as unavailable to all customers.","New orders cannot be placed until you renew.","Your menu data, items, and QR code are all safely stored and will be restored instantly on renewal.","Your order history and analytics are preserved."].map((t,i)=>(
              <div key={i} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:i<3?"1px solid #f5ede5":"none", alignItems:"flex-start" }}>
                <span style={{ color:"#c0392b", fontWeight:800, flexShrink:0 }}>✕</span>
                <span style={{ fontSize:13, color:"#666", lineHeight:1.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN SUBSCRIPTION DASHBOARD ── */}
      {demoTab === "subscription" && (
        <div style={{ padding:"24px 28px", maxWidth:900, margin:"0 auto", animation:"fadeUp 0.4s ease both" }}>

          <div style={{ marginBottom:22 }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, marginBottom:4 }}>Subscription</h1>
            <p style={{ fontSize:13, color:"#999" }}>Manage your MenuMitra plan and billing.</p>
          </div>

          {/* Expiry reminder banner */}
          <ExpiryBanner daysRemaining={days} onRenew={()=>setShowRazorpay(true)}/>

          {/* Expired full-width alert */}
          {(subState==="expired"||subState==="suspended") && (
            <div style={{ background:"rgba(192,57,43,0.06)", border:"2px solid rgba(192,57,43,0.25)", borderRadius:16, padding:"18px 22px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:"#c0392b", marginBottom:4 }}>🔒 Your menu is currently inactive</div>
                <div style={{ fontSize:12, color:"#888" }}>Customers scanning your QR code see a "Menu Unavailable" message. Renew to restore.</div>
              </div>
              <button className="btn-primary" onClick={()=>setShowRazorpay(true)} style={{ whiteSpace:"nowrap" }}>
                🔓 Restore My Menu — ₹100
              </button>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>

            {/* Current plan card */}
            <div className="card" style={{ padding:"24px", background:"linear-gradient(145deg,white,#fef8f3)", border:"1.5px solid rgba(232,101,10,0.18)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>Current Plan</div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"#1A1A1A" }}>{PLAN.name}</h2>
                </div>
                <StatusBadge status={subState}/>
              </div>

              <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:4 }}>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:46, fontWeight:900, color:"#E8650A", lineHeight:1 }}>₹100</span>
                <span style={{ fontSize:15, color:"#bbb" }}>/month</span>
              </div>
              <div style={{ fontSize:12, color:"#aaa", marginBottom:20 }}>
                {subState==="trial" ? `Free trial — first month on us` : `Billed monthly via Razorpay`}
              </div>

              {/* Key dates */}
              <div style={{ background:"#f9f4ef", borderRadius:12, padding:"12px 14px", marginBottom:18 }}>
                {[
                  ["Status", <StatusBadge status={subState}/>],
                  ["Expiry Date", expiryDate],
                  ["Days Remaining", days > 0 ? `${days} days` : "Expired"],
                  ["Auto-renew", subState==="active"?"Enabled":"Disabled"],
                ].map(([k,v],i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:i<3?"1px solid #f0e8df":"none", fontSize:12 }}>
                    <span style={{ color:"#888", fontWeight:600 }}>{k}</span>
                    <span style={{ fontWeight:700, color:"#1A1A1A" }}>{v}</span>
                  </div>
                ))}
              </div>

              <button className="btn-primary" style={{ width:"100%" }} onClick={()=>setShowRazorpay(true)}>
                {subState==="active" ? "🔄 Renew Early (+30 days)" : subState==="trial" ? "💳 Subscribe — ₹100/month" : "🔓 Restore Subscription"}
              </button>

              {subState==="active" && (
                <div style={{ textAlign:"center", marginTop:10, fontSize:11, color:"#bbb" }}>
                  Next auto-renewal: {addDays(expiryDate, 0)} · Cancel anytime from Settings.
                </div>
              )}
            </div>

            {/* What's included */}
            <div className="card" style={{ padding:"24px" }}>
              <div style={{ fontSize:10, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>Everything Included</div>
              <div style={{ marginBottom:18 }}>
                {PLAN.features.map((f,i)=>(
                  <div key={i} className="plan-check">
                    <div style={{ width:20, height:20, borderRadius:6, background:"rgba(45,106,79,0.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ color:"#2D6A4F", fontSize:11, fontWeight:900 }}>✓</span>
                    </div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:"linear-gradient(135deg,rgba(232,101,10,0.06),rgba(201,146,10,0.06))", border:"1px solid rgba(232,101,10,0.15)", borderRadius:12, padding:"12px 14px" }}>
                <div style={{ fontSize:12, fontWeight:800, color:"#E8650A", marginBottom:4 }}>🎁 First Month Free</div>
                <div style={{ fontSize:11, color:"#8A6A4A", lineHeight:1.65 }}>
                  All new accounts get the first month completely free — no credit card required at signup. ₹100/month from Month 2, billed via Razorpay.
                </div>
              </div>
            </div>
          </div>

          {/* Payment history */}
          <div className="card" style={{ overflow:"hidden" }}>
            <div style={{ padding:"20px 22px 16px", borderBottom:"1px solid #f5ede5", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:10, color:"#bbb", textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>Billing</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800 }}>Payment History</div>
              </div>
              <button onClick={()=>showToast("📥 Invoices exported.")}
                style={{ padding:"7px 14px", borderRadius:20, border:"1px solid #f0e8df", background:"white", color:"#888", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                ⬇ Export All
              </button>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid #f5ede5" }}>
                    {["Date","Amount","Method","Invoice","Status"].map(h=>(
                      <th key={h} style={{ padding:"11px 18px", textAlign:"left", fontSize:10, fontWeight:800, color:"#bbb", letterSpacing:1, textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payHistory.map((p,i)=>(
                    <tr key={i} style={{ borderBottom:"1px solid #f5ede5" }}>
                      <td style={{ padding:"12px 18px", fontSize:13, color:"#555" }}>{p.date}</td>
                      <td style={{ padding:"12px 18px", fontSize:14, fontWeight:800, color: p.status==="free"?"#aaa":"#1A1A1A" }}>
                        {p.status==="free" ? "Free" : `₹${p.amount}`}
                      </td>
                      <td style={{ padding:"12px 18px" }}>
                        <span style={{ fontSize:11, background:"rgba(232,101,10,0.08)", color:"#E8650A", borderRadius:8, padding:"3px 10px", fontWeight:700 }}>{p.method}</span>
                      </td>
                      <td style={{ padding:"12px 18px" }}>
                        <button onClick={()=>showToast(`📄 ${p.invoiceId} downloaded.`)}
                          style={{ fontSize:11, color:"#2980b9", fontWeight:700, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textDecoration:"underline" }}>
                          {p.invoiceId}
                        </button>
                      </td>
                      <td style={{ padding:"12px 18px" }}>
                        <span style={{ fontSize:11, fontWeight:800, background:p.status==="paid"?"rgba(45,106,79,0.1)":"rgba(232,101,10,0.1)", color:p.status==="paid"?"#2D6A4F":"#E8650A", borderRadius:8, padding:"3px 10px" }}>
                          {p.status==="paid"?"✓ Paid":"🎁 Free Trial"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Policy notes */}
          <div style={{ marginTop:20, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {[
              { icon:"🔄", title:"Auto-Renewal", body:"Your subscription auto-renews monthly via Razorpay. You will receive an email reminder 7 days before each renewal date." },
              { icon:"⚠️", title:"Grace Period", body:"If a payment fails, you get a 3-day grace period before the menu is deactivated. You can retry payment during this window." },
              { icon:"💾", title:"Data Retention", body:"All your menu items, orders, and analytics are retained even after expiry. Renewing instantly restores everything." },
              { icon:"❌", title:"No Refund Policy", body:"Subscription fees are non-refundable once payment is processed. Please refer to our Terms & Conditions for details." },
            ].map((n,i)=>(
              <div key={i} className="card" style={{ padding:"16px 18px" }}>
                <div style={{ fontSize:20, marginBottom:8 }}>{n.icon}</div>
                <div style={{ fontSize:13, fontWeight:800, color:"#1A1A1A", marginBottom:4 }}>{n.title}</div>
                <div style={{ fontSize:12, color:"#888", lineHeight:1.65 }}>{n.body}</div>
              </div>
            ))}
          </div>

          {/* Admin override note */}
          <div style={{ marginTop:16, background:"rgba(232,101,10,0.04)", border:"1px solid rgba(232,101,10,0.12)", borderRadius:14, padding:"14px 18px", display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ fontSize:18, flexShrink:0 }}>🔐</span>
            <div style={{ fontSize:12, color:"#8A6A4A", lineHeight:1.7 }}>
              <strong>Admin Override:</strong> If you face any payment issue or need a subscription extension, contact MenuMitra support. The Super Admin can manually extend your subscription from the Admin Panel. All manual overrides are logged in the audit trail for accountability.
            </div>
          </div>

        </div>
      )}

      {/* Footer */}
      {demoTab === "subscription" && (
        <div style={{ textAlign:"center", padding:"18px 24px", borderTop:"1px solid #f0e8df", fontSize:11, color:"#ccc" }}>
          ✦ Developed by <strong style={{ color:"#E8650A" }}>Abhijit Kumar Misra</strong> · MenuMitra Subscription · © 2026
        </div>
      )}
    </div>
  );
}
