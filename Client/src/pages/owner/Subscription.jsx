import React from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import toast, { Toaster } from 'react-hot-toast';

export default function Subscription() {
  const daysLeft = 23;
  const renewalDate = "2026-06-12";
  const planName = "MenuMitra Standard";
  const planPrice = "₹100/month";

  const handleRenew = () => {
    toast.success("💳 Initiating Razorpay Renewal Simulator (Standard Plan - ₹100)...");
    setTimeout(() => {
      toast.success("✅ Subscription successfully extended by 30 days!");
    }, 1500);
  };

  return (
    <OwnerLayout pageTitle="💎 Subscription Management">
      <Toaster position="top-center" />
      <div className="page-anim" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Subscription & Plan</h1>
          <p style={{ fontSize: 13, color: "#999" }}>Manage your licensing, view billing history, or extend your current digital plan.</p>
        </div>

        {/* Plan card */}
        <div className="card" style={{ padding: "30px", marginBottom: 20, background: "linear-gradient(135deg, rgba(232, 101, 10, 0.05), rgba(201, 146, 10, 0.05))", border: "1.5px solid rgba(232, 101, 10, 0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "inline-block", background: "rgba(232, 101, 10, 0.1)", color: "#E8650A", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Current Plan</div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{planName}</h2>
              <div style={{ fontSize: 15, fontWeight: "bold", color: "#E8650A" }}>{planPrice}</div>
              <div style={{ fontSize: 12, color: "#777", marginTop: 8 }}>Renews on <strong style={{ color: "#1A1A1A" }}>{renewalDate}</strong> · <span style={{ color: "#2D6A4F", fontWeight: 700 }}>{daysLeft} days remaining</span></div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ background: "rgba(45, 106, 79, 0.1)", color: "#2D6A4F", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 800, marginBottom: 8, display: "inline-block" }}>✓ Active</div>
            </div>
          </div>
        </div>

        {/* Plan details list */}
        <div className="card" style={{ padding: "24px", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 800, marginBottom: 16 }}>📋 Plan Benefits & Inclusions</h3>
          {[
            "Bilingual Customer Ordering Menu (English & हिंदी)",
            "Instant Real-Time Sound and Visual Order Alerts via WebSockets",
            "Direct Custom UPI QR Scan & Razorpay PG Payments",
            "Headerless Direct Printing for 58mm/80mm Thermal Receipt Printers",
            "Complete Sales Analytics and Item Performance Charts",
            "Unlimited QR Code Scanning and Table Setup Configurations",
            "Zero Commission Percentage Models"
          ].map((benefit, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < 6 ? "1px solid #f5ede5" : "none", alignItems: "center" }}>
              <span style={{ color: "#2D6A4F", fontWeight: "bold", fontSize: 14 }}>✓</span>
              <span style={{ fontSize: 13, color: "#555" }}>{benefit}</span>
            </div>
          ))}
        </div>

        {/* Pricing tier extend action */}
        <div className="card" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: "bold", color: "#1A1A1A" }}>Need more time?</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Extend your subscription plan seamlessly today.</div>
          </div>
          <button className="btn-primary" onClick={handleRenew}>💳 Renew Plan (₹100)</button>
        </div>
      </div>
    </OwnerLayout>
  );
}
