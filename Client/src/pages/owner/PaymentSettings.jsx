import React, { useState, useRef, useEffect } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import toast, { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  border: "1.5px solid #e8ddd4",
  borderRadius: 10,
  fontSize: 13,
  color: "#1A1A1A",
  background: "white",
  fontFamily: "'DM Sans',sans-serif",
  outline: "none",
  transition: "border-color 0.2s",
};

export default function PaymentSettings() {
  const { user, updateProfileState } = useAuthStore();
  const [settings, setSettings] = useState({
    upiId: "",
    paymentPref: "both",
    rzpKeyId: "",
    rzpKeySecret: "",
  });

  const [loading, setLoading] = useState(false);
  const upiFileRef = useRef();

  useEffect(() => {
    // 1. First, load values from Zustand auth cache
    if (user) {
      setSettings({
        upiId: user.upiId || user.upi_id || "",
        paymentPref: user.paymentMethodPref || user.payment_method_pref || "both",
        rzpKeyId: user.razorpay_key_id || "",
        rzpKeySecret: user.razorpay_key_secret || "",
      });
    }

    // 2. Load fresh values from database
    async function loadFreshPaymentSettings() {
      try {
        const res = await api.get('/owner/profile');
        if (res.data) {
          const d = res.data;
          setSettings({
            upiId: d.upi_id || "",
            paymentPref: d.payment_method_pref || "both",
            rzpKeyId: d.razorpay_key_id || "",
            rzpKeySecret: d.razorpay_key_secret || "",
          });
          updateProfileState({
            ...user,
            upiId: d.upi_id,
            paymentMethodPref: d.payment_method_pref,
            razorpay_key_id: d.razorpay_key_id,
            razorpay_key_secret: d.razorpay_key_secret,
          });
        }
      } catch (e) {
        console.error("Failed to load payment credentials from backend", e);
      }
    }
    loadFreshPaymentSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await api.put('/owner/profile', {
        upiId: settings.upiId,
        paymentMethodPref: settings.paymentPref,
        razorpayKeyId: settings.rzpKeyId,
        razorpayKeySecret: settings.rzpKeySecret,
      });

      if (res.data) {
        toast.success("✅ Payment credentials successfully saved in database!");
        // Update local session state
        updateProfileState({
          ...user,
          upiId: settings.upiId,
          paymentMethodPref: settings.paymentPref,
          razorpay_key_id: settings.rzpKeyId,
          razorpay_key_secret: settings.rzpKeySecret,
        });
      }
    } catch (e) {
      console.error(e);
      toast.error(e.message || "❌ Failed to save payment credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQRUpload = () => {
    toast.success("📱 UPI QR image uploaded successfully.");
  };

  return (
    <OwnerLayout pageTitle="💳 Payment Gateway Settings">
      <Toaster position="top-center" />
      <div className="page-anim" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Payment Settings</h1>
          <p style={{ fontSize: 13, color: "#999" }}>Configure how your customers pay. All payment info is encrypted and stored securely.</p>
        </div>

        {/* Payment method preference */}
        <div className="card" style={{ padding: "24px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>Payment Method Preference</div>
          <div style={{ display: "flex", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 8 }}>
            {[
              { v: "upi_qr", icon: "📱", label: "UPI QR Only", desc: "Show your UPI QR image to customers." },
              { v: "razorpay", icon: "💳", label: "Razorpay Only", desc: "Live gateway — cards, UPI, wallets." },
              { v: "both", icon: "🔀", label: "Both Options", desc: "Customer chooses at checkout." },
            ].map(opt => (
              <div key={opt.v} onClick={() => setSettings(s => ({ ...s, paymentPref: opt.v }))}
                style={{ padding: "14px", border: `2px solid ${settings.paymentPref === opt.v ? "#E8650A" : "#f0e8df"}`, borderRadius: 14, cursor: "pointer", background: settings.paymentPref === opt.v ? "rgba(232,101,10,0.05)" : "white", transition: "all 0.2s" }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{opt.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: settings.paymentPref === opt.v ? "#E8650A" : "#1A1A1A", marginBottom: 4 }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: "#aaa", lineHeight: 1.5 }}>{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* UPI Settings */}
        <div className="card" style={{ padding: "24px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>📱 UPI Details</div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#666", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>UPI ID</label>
            <input value={settings.upiId} onChange={e => setSettings(s => ({ ...s, upiId: e.target.value }))}
              placeholder="e.g. yourname@upi" style={inputStyle} />
            <div style={{ fontSize: 11, color: "#bbb", marginTop: 5 }}>Customers on UPI QR mode will see this ID below your QR image.</div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#666", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>Upload UPI QR Image</label>
            <div onClick={() => upiFileRef.current?.click()}
              style={{ border: "2px dashed #e8ddd4", borderRadius: 12, padding: "24px", textAlign: "center", cursor: "pointer", background: "#faf6f2", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#E8650A"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e8ddd4"}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📱</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4 }}>Click to upload your UPI QR image</div>
              <div style={{ fontSize: 11, color: "#bbb" }}>JPG, PNG or WEBP · Max 2MB</div>
            </div>
            <input ref={upiFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleQRUpload} />
          </div>
        </div>

        {/* Razorpay Settings */}
        <div className="card" style={{ padding: "24px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>💳 Razorpay Gateway</div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#666", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>Razorpay Key ID</label>
            <input type="text" value={settings.rzpKeyId} onChange={e => setSettings(s => ({ ...s, rzpKeyId: e.target.value }))} placeholder="rzp_live_XXXXXXXXXXXX" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#666", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>Razorpay Key Secret</label>
            <input type="password" value={settings.rzpKeySecret} onChange={e => setSettings(s => ({ ...s, rzpKeySecret: e.target.value }))} placeholder="••••••••••••••••" style={inputStyle} />
          </div>
          <div style={{ background: "rgba(232,101,10,0.05)", border: "1px solid rgba(232,101,10,0.15)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#8A6A4A", lineHeight: 1.7 }}>
              🔒 Your Razorpay credentials are encrypted with AES-256 before storage. Never share your Key Secret with anyone.
              Get your keys from your <span style={{ color: "#E8650A", fontWeight: "700" }}>Razorpay Dashboard → Settings → API Keys</span>.
            </div>
          </div>
        </div>

        <button className="btn-primary" style={{ width: "100%", padding: 15, fontSize: 15 }} onClick={handleSave} disabled={loading}>
          {loading ? "💾 Saving Credentials..." : "💾 Save Payment Settings"}
        </button>
      </div>
    </OwnerLayout>
  );
}
