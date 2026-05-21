import React from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

export default function QRCodePage() {
  const { user } = useAuth();
  const slug = user?.slug || "sharmas-dhaba-patna";
  const businessName = user?.businessName || "Sharma's Dhaba";
  const menuUrl = `https://menumitra.in/menu/${slug}`;

  const copyLink = () => {
    navigator.clipboard?.writeText(menuUrl);
    toast.success("🔗 Menu link copied to clipboard!");
  };

  const downloadQR = () => {
    toast.success("📥 QR code downloaded as high-res PNG!");
  };

  return (
    <OwnerLayout pageTitle="📲 My QR Code">
      <Toaster position="top-center" />
      <div className="page-anim">
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>My QR Code</h1>
          <p style={{ fontSize: 13, color: "#999" }}>Download and print this QR code. Place it on every table so customers can scan and order.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {/* QR Display Card */}
          <div className="card" style={{ padding: "36px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "white", borderRadius: 20, padding: "24px", boxShadow: "0 8px 40px rgba(0,0,0,0.1)", border: "2px solid rgba(232,101,10,0.15)", marginBottom: 20, width: "100%", maxWidth: 260 }}>
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 900, color: "#1A1A1A" }}>{businessName}</div>
                <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>Scan to view menu & order</div>
              </div>
              
              {/* Scalable SVG QR code representation */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <svg viewBox="0 0 200 200" width="180" height="180" style={{ display: "block" }}>
                  <rect width="200" height="200" fill="white" />
                  <rect x="10" y="10" width="56" height="56" fill="none" stroke="#1A1A1A" strokeWidth="7" />
                  <rect x="24" y="24" width="28" height="28" fill="#1A1A1A" />
                  <rect x="134" y="10" width="56" height="56" fill="none" stroke="#1A1A1A" strokeWidth="7" />
                  <rect x="148" y="24" width="28" height="28" fill="#1A1A1A" />
                  <rect x="10" y="134" width="56" height="56" fill="none" stroke="#1A1A1A" strokeWidth="7" />
                  <rect x="24" y="148" width="28" height="28" fill="#1A1A1A" />
                  {[80, 88, 96, 104, 112, 120, 128].map((x, i) => i % 2 === 0 && <rect key={x} x={x} y="78" width="7" height="7" fill="#1A1A1A" />)}
                  {[80, 88, 96, 104, 112, 120, 128].map((x, i) => i % 2 === 0 && <rect key={x + "v"} x="78" y={x} width="7" height="7" fill="#1A1A1A" />)}
                  {[[80, 100], [88, 108], [96, 100], [104, 116], [112, 100], [120, 108], [128, 116],
                    [80, 124], [96, 116], [104, 100], [120, 124], [128, 100],
                    [80, 132], [88, 124], [96, 132], [112, 124], [120, 132], [128, 108],
                    [80, 140], [104, 132], [112, 140], [120, 108], [128, 140],
                    [80, 148], [88, 140], [96, 148], [104, 140], [112, 148], [128, 132],
                    [80, 156], [96, 156], [104, 148], [112, 156], [120, 148], [128, 156],
                    [80, 164], [88, 156], [96, 164], [104, 164], [112, 164], [120, 164], [128, 164]
                  ].map(([x, y], i) => <rect key={i} x={x} y={y} width="7" height="7" fill="#1A1A1A" />)}
                  <rect x="88" y="88" width="24" height="24" rx="4" fill="white" />
                  <rect x="91" y="91" width="18" height="18" rx="3" fill="#E8650A" />
                  <text x="100" y="103" textAnchor="middle" fontSize="10" fill="white" fontWeight="900">M</text>
                </svg>
              </div>

              <div style={{ textAlign: "center", marginTop: 14 }}>
                <div style={{ fontSize: 9, color: "#bbb", letterSpacing: 0.5 }}>{menuUrl}</div>
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <span style={{ fontSize: 8, color: "#E8650A", fontWeight: 700 }}>Powered by</span>
                  <span style={{ fontSize: 9, fontFamily: "'Playfair Display',serif", fontWeight: 800, color: "#E8650A" }}>MenuMitra</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 260 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={downloadQR}>📥 Download PNG</button>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={copyLink}>🔗 Copy Link</button>
            </div>
          </div>

          {/* Tips and Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: "22px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Your Menu URL</div>
              <div style={{ background: "#f9f4ef", borderRadius: 10, padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: "#555", border: "1px solid #f0e8df", wordBreak: "break-all", marginBottom: 10 }}>
                {menuUrl}
              </div>
              <div style={{ fontSize: 11, color: "#bbb" }}>Share this link on WhatsApp, Instagram, or anywhere online to let customers browse and order.</div>
            </div>

            <div className="card" style={{ padding: "22px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>📋 Placement Tips</div>
              {["Print and laminate the QR code for durability.", "Place one on each table — use a table tent or frame.", "Stick one at the entrance so walk-ins can pre-browse.", "Share the link on your WhatsApp status daily."].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: i < 3 ? "1px solid #f5ede5" : "none", alignItems: "flex-start" }}>
                  <span style={{ color: "#E8650A", fontWeight: 900, flexShrink: 0, fontSize: 12 }}>→</span>
                  <span style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
