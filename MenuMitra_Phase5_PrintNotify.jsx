import { useState, useEffect, useRef } from "react";

// ─── SHARED ORDER CODE GENERATOR ─────────────────────────────────────────────
// In production this is generated server-side and stored in DB.
// Both customer and owner receive the same code via WebSocket / push notification.
export function generateOrderCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function generateOrderNumber(code) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `ORD-${today}-${code}`;
}

// ─── MOCK INCOMING ORDERS (simulates WebSocket push from server) ───────────────
const MOCK_LIVE_ORDERS = [
  {
    id: "ORD-20260518-4821",
    code: "4821",
    table: "5",
    customerName: "Rahul",
    items: [
      { nameEn: "Dal Makhani",         nameHi: "दाल मखनी",       qty: 2, price: 180, veg: true,  photo: "🍛" },
      { nameEn: "Butter Naan",          nameHi: "बटर नान",         qty: 4, price: 40,  veg: true,  photo: "🫓" },
      { nameEn: "Masala Chai",          nameHi: "मसाला चाय",       qty: 2, price: 30,  veg: true,  photo: "☕" },
    ],
    subtotal: 580, tax: 0, total: 580,
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    notes: "Less spicy please",
    time: "14:32", date: "2026-05-18",
    status: "new", // new | acknowledged | preparing | ready | served
    printed: false,
  },
  {
    id: "ORD-20260518-3307",
    code: "3307",
    table: "3",
    customerName: "",
    items: [
      { nameEn: "Chicken Curry",        nameHi: "चिकन करी",        qty: 1, price: 280, veg: false, photo: "🍗" },
      { nameEn: "Tandoori Roti",        nameHi: "तंदूरी रोटी",      qty: 3, price: 25,  veg: true,  photo: "🫓" },
    ],
    subtotal: 355, tax: 0, total: 355,
    paymentMethod: "upi",
    paymentStatus: "paid",
    notes: "",
    time: "13:55", date: "2026-05-18",
    status: "preparing",
    printed: true,
  },
];

// ─── BUSINESS INFO ─────────────────────────────────────────────────────────────
const BUSINESS = {
  name: "Sharma's Dhaba",
  address: "Shop No. 12, Main Bazaar Road, Near Bus Stand",
  city: "Patna", state: "Bihar", pincode: "800001",
  phone: "+91 98765 43210",
  gstin: "",
  fssai: "10012345678901",
};

// ─── PRINT STYLES (injected into window for browser print) ───────────────────
const PRINT_CSS = `
  @media print {
    body * { visibility: hidden !important; }
    #print-receipt, #print-receipt * { visibility: visible !important; }
    #print-receipt { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; z-index: 99999 !important; }
    @page { margin: 8mm; size: 80mm auto; }
  }
`;

// ─── RECEIPT COMPONENT (used for both screen and print) ──────────────────────
function ReceiptDocument({ order, business, mode = "screen" }) {
  const isThermal = mode === "thermal";
  const width = isThermal ? 280 : "100%";
  const fontBase = isThermal ? 11 : 13;
  const headingSize = isThermal ? 14 : 18;

  return (
    <div id="print-receipt" style={{
      width, maxWidth: isThermal ? 280 : 480,
      fontFamily: isThermal ? "'Courier New', monospace" : "'DM Sans', sans-serif",
      fontSize: fontBase, color: "#1A1A1A",
      background: "white", padding: isThermal ? "12px 10px" : "24px",
      margin: "0 auto",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');`}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: isThermal ? 10 : 16, borderBottom: `${isThermal ? "1px dashed" : "2px solid"} #1A1A1A`, paddingBottom: isThermal ? 8 : 14 }}>
        {!isThermal && (
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#E8650A,#C9920A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 10px" }}>🍽️</div>
        )}
        {isThermal && <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 2 }}>*** MENUMITRA ***</div>}
        <div style={{ fontSize: headingSize, fontWeight: 900, marginBottom: 3, fontFamily: isThermal ? "inherit" : "'Playfair Display', serif" }}>
          {business.name}
        </div>
        <div style={{ fontSize: isThermal ? 9 : 11, color: "#666", lineHeight: 1.5 }}>
          {business.address}<br />
          {business.city}, {business.state} - {business.pincode}<br />
          {business.phone}
        </div>
        {business.fssai && (
          <div style={{ fontSize: 9, color: "#999", marginTop: 4 }}>FSSAI: {business.fssai}</div>
        )}
      </div>

      {/* Order identity */}
      <div style={{ background: isThermal ? "transparent" : "#f9f4ef", borderRadius: isThermal ? 0 : 10, padding: isThermal ? "0 0 8px" : "12px 14px", marginBottom: isThermal ? 8 : 14, borderBottom: isThermal ? "1px dashed #1A1A1A" : "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontWeight: 700 }}>Order No.</span>
          <span style={{ fontWeight: 900, color: "#E8650A" }}>{order.id}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontWeight: 700 }}>Confirm Code</span>
          <span style={{ fontSize: isThermal ? 18 : 22, fontWeight: 900, color: "#1A1A1A", letterSpacing: 4, fontFamily: isThermal ? "inherit" : "'Playfair Display', serif" }}>
            #{order.code}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontWeight: 700 }}>Table No.</span>
          <span style={{ fontWeight: 900 }}>{order.table}</span>
        </div>
        {order.customerName && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontWeight: 700 }}>Customer</span>
            <span style={{ fontWeight: 700 }}>{order.customerName}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontWeight: 700 }}>Date & Time</span>
          <span>{order.date}  {order.time}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700 }}>Payment</span>
          <span style={{ fontWeight: 700, color: "#2D6A4F" }}>
            ✓ PAID via {order.paymentMethod === "razorpay" ? "Razorpay" : "UPI QR"}
          </span>
        </div>
      </div>

      {/* Items header */}
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: isThermal ? 10 : 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.8, paddingBottom: 6, borderBottom: `${isThermal ? "1px dashed" : "1px solid"} #ddd`, marginBottom: 6 }}>
        <span>Item</span>
        <span>Qty × Rate = Amt</span>
      </div>

      {/* Items */}
      {order.items.map((item, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "5px 0", borderBottom: i < order.items.length - 1 ? `1px ${isThermal ? "dotted" : "solid"} #f0e8df` : "none" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
              {!isThermal && (
                <div style={{ width: 10, height: 10, border: `1.5px solid ${item.veg ? "#2D6A4F" : "#c0392b"}`, borderRadius: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.veg ? "#2D6A4F" : "#c0392b" }} />
                </div>
              )}
              {isThermal ? `[${item.veg ? "V" : "N"}]` : ""} {item.nameEn}
            </div>
          </div>
          <div style={{ fontWeight: 700, whiteSpace: "nowrap", marginLeft: 10 }}>
            {item.qty} × ₹{item.price} = ₹{item.qty * item.price}
          </div>
        </div>
      ))}

      {/* Notes */}
      {order.notes && (
        <div style={{ marginTop: 8, padding: isThermal ? "0" : "8px 10px", background: isThermal ? "transparent" : "#fff8f0", borderRadius: 6, fontSize: 11, color: "#888", borderTop: isThermal ? "1px dashed #ddd" : "none", paddingTop: isThermal ? 6 : undefined }}>
          📝 Note: {order.notes}
        </div>
      )}

      {/* Totals */}
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `${isThermal ? "1px dashed" : "2px dashed"} #1A1A1A` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span>Subtotal</span>
          <span style={{ fontWeight: 700 }}>₹{order.subtotal}</span>
        </div>
        {order.tax > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span>GST (5%)</span>
            <span style={{ fontWeight: 700 }}>₹{order.tax}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: isThermal ? 15 : 18, marginTop: 6, paddingTop: 6, borderTop: `${isThermal ? "1px dashed" : "1px solid"} #1A1A1A` }}>
          <span>TOTAL</span>
          <span style={{ color: "#E8650A", fontFamily: isThermal ? "inherit" : "'Playfair Display', serif" }}>₹{order.total}</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: isThermal ? 12 : 16, textAlign: "center", borderTop: `${isThermal ? "1px dashed" : "1px solid"} #ddd`, paddingTop: isThermal ? 8 : 12 }}>
        {isThermal ? (
          <>
            <div style={{ fontWeight: 900, marginBottom: 4 }}>Thank you for dining with us!</div>
            <div style={{ fontSize: 9 }}>Powered by MenuMitra</div>
            <div style={{ fontSize: 9 }}>Developed by Abhijit Kumar Misra</div>
            <div style={{ fontSize: 9, marginTop: 4 }}>*** CUSTOMER COPY ***</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4 }}>Thank you for dining with us! 🙏</div>
            <div style={{ fontSize: 11, color: "#bbb", marginBottom: 8 }}>Visit us again soon.</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "#bbb" }}>Powered by</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 900, color: "#E8650A" }}>MenuMitra</span>
            </div>
            <div style={{ fontSize: 9, color: "#ddd", marginTop: 4 }}>Developed by Abhijit Kumar Misra</div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── PRINT MODAL (Owner side — triggered auto on payment) ─────────────────────
function PrintModal({ order, business, onClose, onMarkPrinted }) {
  const [printMode, setPrintMode] = useState("browser"); // browser | thermal
  const [exporting, setExporting] = useState(false);
  const [printed, setPrinted] = useState(false);

  const handleBrowserPrint = () => {
    const style = document.createElement("style");
    style.innerHTML = PRINT_CSS;
    document.head.appendChild(style);
    setTimeout(() => {
      window.print();
      document.head.removeChild(style);
      setPrinted(true);
      onMarkPrinted(order.id);
    }, 100);
  };

  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setPrinted(true);
      onMarkPrinted(order.id);
      alert(`PDF saved: ${order.id}.pdf\n\n(In production this uses Puppeteer on the server to generate a pixel-perfect PDF and download it.)`);
    }, 1600);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "white", borderRadius: 24, maxWidth: 680, width: "100%", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 40px 80px rgba(0,0,0,0.4)", animation: "modalIn 0.35s cubic-bezier(0.22,1,0.36,1) both" }}>
        <style>{`
          @keyframes modalIn { from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)} }
          @keyframes spin { to{transform:rotate(360deg)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        `}</style>

        {/* Modal header */}
        <div style={{ background: "linear-gradient(135deg,#E8650A,#C9920A)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
              💰 Payment Received — New Order
            </div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: "white" }}>
              Table {order.table} · <span style={{ letterSpacing: 3 }}>#{order.code}</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 3 }}>
              {order.id} · ₹{order.total} · {order.paymentMethod === "razorpay" ? "Razorpay" : "UPI QR"}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, width: 34, height: 34, color: "white", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
        </div>

        {/* Print mode toggle */}
        <div style={{ padding: "14px 24px 0", borderBottom: "1px solid #f0e8df", display: "flex", gap: 8, flexShrink: 0 }}>
          {[
            { id: "browser", icon: "🖨️", label: "Browser / PDF Print" },
            { id: "thermal", icon: "🧾", label: "Thermal Receipt (58–80mm)" },
          ].map(m => (
            <button key={m.id} onClick={() => setPrintMode(m.id)}
              style={{ padding: "8px 16px 10px", borderRadius: "10px 10px 0 0", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6, borderBottom: `3px solid ${printMode === m.id ? "#E8650A" : "transparent"}`, background: printMode === m.id ? "rgba(232,101,10,0.06)" : "transparent", color: printMode === m.id ? "#E8650A" : "#888", transition: "all 0.2s" }}>
              <span>{m.icon}</span> {m.label}
            </button>
          ))}
        </div>

        {/* Receipt preview */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: "#f9f4ef" }}>
          <div style={{ background: "white", borderRadius: 14, padding: "6px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: printMode === "thermal" ? 320 : "100%", margin: "0 auto" }}>
            <ReceiptDocument order={order} business={business} mode={printMode} />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f0e8df", flexShrink: 0, background: "white" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: printed ? 8 : 0 }}>
            <button onClick={handleBrowserPrint}
              style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#1A1A1A,#2A2A2A)", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.25)", transition: "all 0.2s" }}>
              🖨️ Print Now
            </button>
            <button onClick={handleExportPDF} disabled={exporting}
              style={{ flex: 1, padding: "13px", borderRadius: 12, border: "2px solid #E8650A", background: "white", color: "#E8650A", fontWeight: 800, fontSize: 14, cursor: exporting ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
              {exporting
                ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(232,101,10,0.3)", borderTopColor: "#E8650A", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Exporting…</>
                : "📄 Export PDF"}
            </button>
            <button onClick={onClose}
              style={{ padding: "13px 18px", borderRadius: 12, border: "1px solid #f0e8df", background: "white", color: "#bbb", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              Skip
            </button>
          </div>
          {printed && (
            <div style={{ fontSize: 12, color: "#2D6A4F", fontWeight: 700, textAlign: "center", animation: "fadeUp 0.3s ease both" }}>
              ✓ Receipt printed/exported and saved to order history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOMER CONFIRMATION SCREEN (shown after payment on customer's phone) ───
function CustomerConfirmation({ order, businessName, onNewOrder }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard?.writeText(order.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#FFFAF5,#FEF0DF)", fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "32px 16px 40px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700;800&display=swap');
        @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}50%{transform:scale(1.1)}70%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(45,106,79,0.4)}50%{box-shadow:0 0 0 12px rgba(45,106,79,0)}}
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      {/* Checkmark */}
      <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,#2D6A4F,#40916C)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 20, animation: "bounceIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both", boxShadow: "0 12px 40px rgba(45,106,79,0.4)", animationFillMode: "both" }}>
        ✓
      </div>

      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: "#1A1A1A", textAlign: "center", marginBottom: 8, animation: "fadeUp 0.5s 0.2s both" }}>
        Order Placed!
      </h1>
      <p style={{ fontSize: 13, color: "#888", textAlign: "center", lineHeight: 1.7, marginBottom: 28, animation: "fadeUp 0.5s 0.3s both" }}>
        Payment received. Your food is being prepared.<br />
        Show this code to the staff when collecting your order.
      </p>

      {/* 4-digit code — the star of this screen */}
      <div style={{ background: "white", borderRadius: 20, padding: "24px 32px", textAlign: "center", boxShadow: "0 12px 50px rgba(0,0,0,0.1)", border: "2px solid rgba(232,101,10,0.15)", marginBottom: 20, width: "100%", maxWidth: 340, animation: "fadeUp 0.5s 0.4s both" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#bbb", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Your Order Code</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 64, fontWeight: 900, color: "#1A1A1A", letterSpacing: 12, lineHeight: 1, marginBottom: 8 }}>
          {order.code}
        </div>
        <div style={{ width: "100%", height: 3, background: "linear-gradient(90deg,#E8650A,#C9920A)", borderRadius: 2, marginBottom: 12 }} />
        <button onClick={copyCode}
          style={{ background: copied ? "rgba(45,106,79,0.1)" : "rgba(232,101,10,0.1)", border: "none", borderRadius: 20, padding: "6px 16px", fontSize: 11, fontWeight: 700, color: copied ? "#2D6A4F" : "#E8650A", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s" }}>
          {copied ? "✓ Copied!" : "📋 Copy Code"}
        </button>
      </div>

      {/* Order details card */}
      <div style={{ background: "white", borderRadius: 16, padding: "16px 18px", width: "100%", maxWidth: 340, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f0e8df", marginBottom: 14, animation: "fadeUp 0.5s 0.5s both" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Order Summary</div>
        {[
          ["Order No.", order.id],
          ["Table No.", `Table ${order.table}`],
          ["Restaurant", businessName],
          ["Paid via", order.paymentMethod === "razorpay" ? "Razorpay ✓" : "UPI QR ✓"],
          ["Total", `₹${order.total}`],
        ].map(([k, v], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 4 ? "1px solid #f5ede5" : "none", fontSize: 13 }}>
            <span style={{ color: "#888" }}>{k}</span>
            <span style={{ fontWeight: i === 4 ? 900 : 700, color: i === 4 ? "#E8650A" : "#1A1A1A" }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Items recap */}
      <div style={{ background: "white", borderRadius: 16, padding: "14px 18px", width: "100%", maxWidth: 340, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f0e8df", marginBottom: 24, animation: "fadeUp 0.5s 0.55s both" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Items Ordered</div>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < order.items.length - 1 ? "1px solid #f5ede5" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>{item.photo}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A" }}>{item.nameEn}</div>
                <div style={{ fontSize: 10, color: "#bbb" }}>× {item.qty}</div>
              </div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#1A1A1A" }}>₹{item.qty * item.price}</span>
          </div>
        ))}
      </div>

      {/* Info boxes */}
      <div style={{ width: "100%", maxWidth: 340, animation: "fadeUp 0.5s 0.6s both" }}>
        <div style={{ background: "rgba(45,106,79,0.07)", border: "1px solid rgba(45,106,79,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#2D6A4F", marginBottom: 4 }}>📢 The staff has been notified</div>
          <div style={{ fontSize: 11, color: "#5A8A6A", lineHeight: 1.65 }}>
            The kitchen has received your order. When your food is ready, you will be called by your 4-digit code: <strong>#{order.code}</strong>
          </div>
        </div>
        <div style={{ background: "rgba(232,101,10,0.05)", border: "1px solid rgba(232,101,10,0.15)", borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, color: "#8A6A4A", lineHeight: 1.7 }}>
            💡 <strong>Tip:</strong> Take a screenshot of this screen or note down your order code <strong>#{order.code}</strong> for reference.
          </div>
        </div>
      </div>

      <button onClick={onNewOrder}
        style={{ marginTop: 24, padding: "13px 32px", borderRadius: 50, border: "2px solid #E8650A", background: "transparent", color: "#E8650A", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", animation: "fadeUp 0.5s 0.65s both" }}>
        ← Place Another Order
      </button>

      <div style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: "#ddd" }}>
        ✦ Developed by <strong style={{ color: "#E8650A" }}>Abhijit Kumar Misra</strong> · MenuMitra
      </div>
    </div>
  );
}

// ─── OWNER NOTIFICATION PANEL (Live order feed — simulates WebSocket push) ────
export function OwnerOrderNotificationPanel() {
  const [orders, setOrders] = useState(MOCK_LIVE_ORDERS);
  const [printOrder, setPrintOrder] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(true);
  const [tab, setTab] = useState("live"); // live | history

  const markPrinted = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, printed: true } : o));
    setPrintOrder(null);
  };

  const updateStatus = (orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const STATUS_FLOW = ["new", "acknowledged", "preparing", "ready", "served"];
  const STATUS_LABELS = { new: "🔴 New", acknowledged: "🟡 Acknowledged", preparing: "🔵 Preparing", ready: "🟢 Ready", served: "⚪ Served" };
  const STATUS_COLORS = { new: "#c0392b", acknowledged: "#C9920A", preparing: "#2980b9", ready: "#2D6A4F", served: "#bbb" };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#F5EFE8", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes newOrderPulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.03)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {printOrder && (
        <PrintModal order={printOrder} business={BUSINESS} onClose={() => setPrintOrder(null)} onMarkPrinted={markPrinted} />
      )}

      {/* Top bar */}
      <div style={{ background: "#1A1A1A", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#E8650A,#C9920A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🍽️</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 900, color: "white" }}>MenuMitra</div>
            <div style={{ fontSize: 9, color: "#E8650A", fontWeight: 700, letterSpacing: 1.5 }}>LIVE ORDER FEED</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#40916C", boxShadow: "0 0 0 3px rgba(64,145,108,0.25)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Receiving orders</span>
        </div>
      </div>

      {/* New order alert banner */}
      {newOrderAlert && orders.some(o => o.status === "new") && (
        <div style={{ background: "linear-gradient(135deg,#c0392b,#e74c3c)", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", animation: "newOrderPulse 1.5s ease-in-out infinite" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🔔</span>
            <div>
              <div style={{ fontWeight: 800, color: "white", fontSize: 14 }}>New Order Received!</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
                Table {orders.find(o => o.status === "new")?.table} · Code #{orders.find(o => o.status === "new")?.code} · ₹{orders.find(o => o.status === "new")?.total}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setPrintOrder(orders.find(o => o.status === "new")); setNewOrderAlert(false); }}
              style={{ padding: "7px 14px", background: "white", color: "#c0392b", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              🖨️ Print Now
            </button>
            <button onClick={() => setNewOrderAlert(false)}
              style={{ padding: "7px 10px", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, color: "white", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>✕</button>
          </div>
        </div>
      )}

      <div style={{ padding: "16px 20px" }}>
        {/* Stats row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          {[
            { label: "New Orders", val: orders.filter(o => o.status === "new").length, color: "#c0392b", icon: "🔴" },
            { label: "Preparing", val: orders.filter(o => o.status === "preparing").length, color: "#2980b9", icon: "🔵" },
            { label: "Ready", val: orders.filter(o => o.status === "ready").length, color: "#2D6A4F", icon: "🟢" },
            { label: "Today's Revenue", val: `₹${orders.filter(o => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0)}`, color: "#E8650A", icon: "💰" },
          ].map((s, i) => (
            <div key={i} style={{ flex: "1 1 140px", background: "white", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(232,101,10,0.08)" }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#999", marginTop: 3, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["live", "🔴 Live Orders"], ["history", "📋 All Today"]].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)}
              style={{ padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "'DM Sans',sans-serif", background: tab === v ? "#E8650A" : "white", color: tab === v ? "white" : "#888", boxShadow: tab === v ? "0 4px 14px rgba(232,101,10,0.35)" : "none", border: tab === v ? "none" : "1px solid #f0e8df" }}>
              {l}
            </button>
          ))}
        </div>

        {/* Orders list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders
            .filter(o => tab === "live" ? o.status !== "served" : true)
            .map((order, i) => (
              <div key={order.id} style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: `2px solid ${order.status === "new" ? "#c0392b" : "rgba(232,101,10,0.08)"}`, animation: `slideIn 0.4s ${i * 0.08}s both` }}>

                {/* Order header */}
                <div style={{ padding: "14px 16px", background: order.status === "new" ? "rgba(192,57,43,0.04)" : "white", borderBottom: "1px solid #f5ede5", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    {/* 4-digit code — prominent */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <div style={{ background: "#1A1A1A", borderRadius: 8, padding: "4px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>CODE</span>
                        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: "#E8650A", letterSpacing: 3 }}>#{order.code}</span>
                      </div>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "#1A1A1A" }}>Table {order.table}</span>
                      {order.customerName && <span style={{ fontSize: 12, color: "#888" }}>· {order.customerName}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "#bbb" }}>{order.id} · {order.date} {order.time}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: `${STATUS_COLORS[order.status]}18`, color: STATUS_COLORS[order.status], borderRadius: 20, padding: "3px 10px" }}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(45,106,79,0.1)", color: "#2D6A4F", borderRadius: 20, padding: "3px 10px" }}>
                      ✓ {order.paymentMethod === "razorpay" ? "Razorpay" : "UPI QR"}
                    </span>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "#E8650A" }}>₹{order.total}</span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ padding: "10px 16px 8px" }}>
                  {order.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: j < order.items.length - 1 ? "1px solid #f5ede5" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{item.photo}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>× {item.qty}  {item.nameEn}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#1A1A1A" }}>₹{item.qty * item.price}</span>
                    </div>
                  ))}
                  {order.notes && (
                    <div style={{ marginTop: 6, fontSize: 11, color: "#E8650A", fontWeight: 700, background: "rgba(232,101,10,0.06)", borderRadius: 6, padding: "5px 8px" }}>
                      📝 {order.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ padding: "10px 16px", borderTop: "1px solid #f5ede5", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {/* Status buttons */}
                  {STATUS_FLOW.filter(s => s !== order.status && STATUS_FLOW.indexOf(s) === STATUS_FLOW.indexOf(order.status) + 1).map(nextStatus => (
                    <button key={nextStatus} onClick={() => updateStatus(order.id, nextStatus)}
                      style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "'DM Sans',sans-serif", background: `${STATUS_COLORS[nextStatus]}18`, color: STATUS_COLORS[nextStatus] }}>
                      → Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                    </button>
                  ))}
                  {/* Print button */}
                  <button onClick={() => setPrintOrder(order)}
                    style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #f0e8df", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "'DM Sans',sans-serif", background: "white", color: "#555", display: "flex", alignItems: "center", gap: 5 }}>
                    {order.printed ? "✓ Reprint" : "🖨️ Print Receipt"}
                  </button>
                  <button onClick={() => setPrintOrder(order)}
                    style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #f0e8df", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "'DM Sans',sans-serif", background: "white", color: "#555" }}>
                    📄 Export PDF
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px", fontSize: 11, color: "#ccc" }}>
        ✦ Developed by <strong style={{ color: "#E8650A" }}>Abhijit Kumar Misra</strong> · MenuMitra · © 2026
      </div>
    </div>
  );
}

// ─── DEMO WRAPPER — toggle between Customer view and Owner view ───────────────
export default function Phase5Demo() {
  const [demoView, setDemoView] = useState("owner"); // owner | customer

  const SAMPLE_ORDER = {
    id: "ORD-20260518-4821",
    code: "4821",
    table: "5",
    customerName: "Rahul",
    items: MOCK_LIVE_ORDERS[0].items,
    subtotal: 580, tax: 0, total: 580,
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    notes: "Less spicy please",
    time: "14:32", date: "2026-05-18",
  };

  return (
    <div>
      {/* Toggle */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10000, background: "#0F0F0F", padding: "10px 20px", display: "flex", gap: 10, alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>DEMO VIEW:</span>
        {[
          ["owner", "🏪 Owner — Live Order Feed + Print"],
          ["customer", "📱 Customer — Order Confirmation"],
        ].map(([v, l]) => (
          <button key={v} onClick={() => setDemoView(v)}
            style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", background: demoView === v ? "#E8650A" : "rgba(255,255,255,0.08)", color: demoView === v ? "white" : "rgba(255,255,255,0.45)" }}>
            {l}
          </button>
        ))}
      </div>
      <div style={{ paddingTop: 44 }}>
        {demoView === "owner"
          ? <OwnerOrderNotificationPanel />
          : <CustomerConfirmation order={SAMPLE_ORDER} businessName={BUSINESS.name} onNewOrder={() => {}} />}
      </div>
    </div>
  );
}
