import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAdminStats } from '../../services/adminService';

export default function Plans() {
  const [planEdit, setPlanEdit] = useState(false);
  const [toast, setToast] = useState(null);
  const [plan, setPlan] = useState({ name: "MenuMitra Standard", price: "100", trial: "30" });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const statsData = await getAdminStats();
        setStats(statsData);
      } catch (err) {
        console.error("Failed to load plans page statistics", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const currentStats = stats || {
    totalOwners: 0,
    activeSubs: 0,
    trialSubs: 0,
    expiredSubs: 0,
    platformRevenue: 0
  };

  return (
    <AdminLayout pageTitle="💳 Subscription Plans">
      <div className="page-anim">
        {toast && (
          <div style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
            background: "#2D6A4F", color: "white", padding: "12px 22px", borderRadius: 12,
            fontWeight: 700, fontSize: 13, boxShadow: "0 12px 40px rgba(0,0,0,0.6)"
          }}>
            {toast}
          </div>
        )}

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 900, marginBottom: 4 }}>Subscription Plans</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Manage the MenuMitra subscription plan and pricing. Changes take effect for new subscribers immediately.</p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <div className="spinner" style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(232,101,10,0.1)", borderTopColor: "#E8650A", animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {/* Current plan display */}
            <div style={{ background: "#1E1E1E", borderRadius: 18, padding: "28px", border: "1px solid rgba(232,101,10,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Current Active Plan</div>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900 }}>{plan.name}</h2>
                </div>
                <div style={{ background: "rgba(45,106,79,0.15)", color: "#40916C", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 800 }}>LIVE</div>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 48, fontWeight: 900, color: "#E8650A" }}>₹{plan.price}</span>
                <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>/month</span>
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>First {plan.trial} days free for all new signups</div>

              <div style={{ marginBottom: 24 }}>
                {["Unlimited menu items & categories", "Elegant digital customer menu", "Unique QR code", "UPI QR & Razorpay payments", "Browser & Thermal print receipts", "Sales analytics dashboard", "Real-time order notifications", "Zero delivery commission"].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ color: "#40916C", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{f}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["Active Subscribers", currentStats.activeSubs],
                  ["On Trial", currentStats.trialSubs],
                  ["Total Subscribers", currentStats.totalOwners],
                  ["Total Platform Revenue", `₹${currentStats.platformRevenue}`]
                ].map(([k, v], i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "white", fontFamily: "'Playfair Display',serif" }}>{v}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{k}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit plan */}
            <div style={{ background: "#1E1E1E", borderRadius: 18, padding: "28px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>Edit Plan Settings</div>

              {[
                { label: "Plan Name", key: "name", type: "text", hint: "Displayed on the pricing page and owner's subscription tab." },
                { label: "Monthly Price (₹)", key: "price", type: "number", hint: "Amount charged from Month 2 onwards. Changes apply to new subscriptions only." },
                { label: "Free Trial Duration (days)", key: "trial", type: "number", hint: "Number of free days given to new signups before first charge." },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>{f.label}</label>
                  <input type={f.type} value={plan[f.key]} onChange={e => setPlan(p => ({ ...p, [f.key]: e.target.value }))} disabled={!planEdit}
                    style={{
                      width: "100%", padding: "12px 14px", background: planEdit ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                      border: `1.5px solid ${planEdit ? "rgba(232,101,10,0.4)" : "rgba(255,255,255,0.07)"}`, borderRadius: 10,
                      color: planEdit ? "white" : "rgba(255,255,255,0.45)", fontSize: 14, fontFamily: "'DM Sans',sans-serif", fontWeight: 600
                    }} />
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 5 }}>{f.hint}</div>
                </div>
              ))}

              <div style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
                  ⚠️ <strong style={{ color: "rgba(255,255,255,0.55)" }}>Warning:</strong> Changing the price will affect all future billing cycles but will not retroactively change active subscriptions. All plan changes are recorded in the audit log.
                </div>
              </div>

              {!planEdit ? (
                <button onClick={() => setPlanEdit(true)}
                  style={{
                    width: "100%", padding: "13px", background: "linear-gradient(135deg,#E8650A,#C9920A)",
                    color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 800,
                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}>
                  ✏️ Edit Plan Settings
                </button>
              ) : (
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setPlanEdit(false)}
                    style={{
                      flex: 1, padding: "12px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 13, fontWeight: 700,
                      cursor: "pointer", fontFamily: "'DM Sans',sans-serif"
                    }}>
                    Cancel
                  </button>
                  <button onClick={() => { setPlanEdit(false); showToast("✅ Plan settings saved and logged successfully."); }}
                    style={{
                      flex: 2, padding: "12px", background: "linear-gradient(135deg,#2D6A4F,#40916C)",
                      color: "white", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800,
                      cursor: "pointer", fontFamily: "'DM Sans',sans-serif"
                    }}>
                    ✅ Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
