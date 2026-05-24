import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getOwners, initiatePasswordReset, getAuditLogs } from '../../services/adminService';

export default function PasswordResets() {
  const [owners, setOwners] = useState([]);
  const [resetModal, setResetModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOwnersAndLogs = async () => {
    try {
      setLoading(true);
      const ownersData = await getOwners();
      const logsData = await getAuditLogs();
      setOwners(ownersData);
      // Filter logs to show only PASSWORD_RESET or PASSWORD_CHANGED actions
      const resetLogs = logsData.filter(log => log.action.includes("PASSWORD"));
      setLogs(resetLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnersAndLogs();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleForceReset = (owner) => {
    setResetModal(owner);
  };

  const sendReset = async () => {
    if (!resetModal) return;
    try {
      await initiatePasswordReset(resetModal.email);
      showToast(`✅ Password reset link generated successfully for ${resetModal.email}`);
      setResetModal(null);
      // Reload logs
      const logsData = await getAuditLogs();
      setLogs(logsData.filter(log => log.action.includes("PASSWORD")));
    } catch (err) {
      showToast(`❌ Error: ${err.message || "Failed to initiate reset link."}`);
    }
  };

  return (
    <AdminLayout pageTitle="🔑 Password Resets">
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

        {/* Reset Password Modal */}
        {resetModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 8000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#1E1E1E", borderRadius: 20, padding: "32px", maxWidth: 440, width: "100%", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔑</div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Force Password Reset</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
                Owner: <strong style={{ color: "white" }}>{resetModal.ownerName}</strong> — {resetModal.businessName}
              </p>
              <div style={{ background: "rgba(232,101,10,0.08)", border: "1px solid rgba(232,101,10,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 22 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.75 }}>
                  📧 A secure password reset link will be generated for:<br />
                  <strong style={{ color: "#E8650A", fontSize: 13 }}>{resetModal.email}</strong><br />
                  The link will expire in <strong>30 minutes</strong>. This action will be recorded in the audit log.
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setResetModal(null)} style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
                <button onClick={sendReset} style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg,#E8650A,#C9920A)", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>📧 Send Reset Email</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 900, marginBottom: 4 }}>Password Reset Management</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Initiate force password resets for any owner. All reset actions are logged in the audit trail.</p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <div className="spinner" style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(232,101,10,0.1)", borderTopColor: "#E8650A", animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <>
            {/* Quick reset box */}
            <div style={{ background: "#1E1E1E", borderRadius: 18, padding: "24px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>🔑 Force Reset — Select Owner</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
                {owners.map(owner => (
                  <div key={owner.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 2 }}>{owner.businessName}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{owner.ownerName}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>{owner.email}</div>
                    </div>
                    <button className="action-btn" onClick={() => handleForceReset(owner)}
                      style={{
                        padding: "7px 12px", background: "rgba(201,146,10,0.15)", color: "#C9920A", fontSize: 11,
                        fontWeight: 800, flexShrink: 0, border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.15)"}
                      onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}>
                      Reset
                    </button>
                  </div>
                ))}
                {owners.length === 0 && (
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, padding: 10 }}>No registered owners found.</div>
                )}
              </div>
            </div>

            {/* Reset audit history */}
            <div style={{ background: "#1E1E1E", borderRadius: 18, padding: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>Recent Password Reset Log</div>
              {logs.map((log, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "flex-start" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(201,146,10,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🔑</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 3 }}>
                      {log.targetType} {log.targetId ? `(${log.targetId.substring(0,8)})` : ""}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>
                      {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                      By <strong style={{ color: "rgba(255,255,255,0.35)" }}>{log.actorId ? `User (${log.actorId.substring(0,8)})` : "Admin"}</strong> · {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, background: "rgba(201,146,10,0.12)", color: "#C9920A", borderRadius: 6, padding: "3px 8px", fontWeight: 800, flexShrink: 0 }}>LOGGED</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div style={{ textAlign: "center", padding: "30px", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>No password reset events logged yet.</div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
