import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

const MOCK_AUDIT_LOGS = [
  { id: "LOG001", timestamp: "2026-05-18 14:32:11", actor: "Jitu", role: "admin", action: "PASSWORD_RESET", target: "OWN003 - Meena Devi", ip: "103.21.58.44", details: "Force reset initiated. Reset email dispatched to meena@chaicorner.com." },
  { id: "LOG002", timestamp: "2026-05-18 11:20:05", actor: "Jitu", role: "admin", action: "ACCOUNT_SUSPENDED", target: "OWN007 - Harpreet Singh", ip: "103.21.58.44", details: "Account suspended due to non-payment for 90+ days." },
  { id: "LOG018", timestamp: "2026-05-18 09:15:33", actor: "sunil@rajhotel.com", role: "owner", action: "ITEM_ADDED", target: "OWN002 - Raj Hotel", ip: "49.36.12.100", details: "New item added: 'Butter Chicken' — ₹320." },
  { id: "LOG017", timestamp: "2026-05-17 22:44:18", actor: "ramesh@sharma.com", role: "owner", action: "PAYMENT_RECEIVED", target: "OWN001 - Sharma's Dhaba", ip: "49.15.33.77", details: "Order ORD-20260517-0089 paid. Amount: ₹490. Method: Razorpay." },
  { id: "LOG016", timestamp: "2026-05-17 18:30:02", actor: "Jitu", role: "admin", action: "SUBSCRIPTION_EXTENDED", target: "OWN005 - Priya Nair", ip: "103.21.58.44", details: "Subscription manually extended by 30 days as goodwill gesture." },
  { id: "LOG015", timestamp: "2026-05-17 16:12:55", actor: "deepak@guptasweets.com", role: "owner", action: "QR_DOWNLOADED", target: "OWN006 - Gupta Sweet House", ip: "59.88.12.201", details: "QR code downloaded in PNG format." },
  { id: "LOG014", timestamp: "2026-05-17 14:08:33", actor: "Jitu", role: "admin", action: "ACCOUNT_ACTIVATED", target: "OWN008 - Mohammed Nizam", ip: "103.21.58.44", details: "Account manually activated after email verification override." },
  { id: "LOG013", timestamp: "2026-05-16 20:55:11", actor: "priya@cafemonsoon.com", role: "owner", action: "PASSWORD_CHANGED", target: "OWN005 - Priya Nair", ip: "125.63.22.88", details: "Owner changed their account password via Settings." },
  { id: "LOG012", timestamp: "2026-05-16 17:33:44", actor: "arjun@spicegarden.com", role: "owner", action: "UPI_QR_UPLOADED", target: "OWN004 - Spice Garden", ip: "103.56.90.11", details: "New UPI QR image uploaded. Previous image replaced." },
  { id: "LOG011", timestamp: "2026-05-15 11:22:09", actor: "Jitu", role: "admin", action: "PLAN_PRICE_UPDATED", target: "MenuMitra Standard Plan", ip: "103.21.58.44", details: "Plan price updated from ₹200 to ₹100/month." }
];

export default function AuditLogs() {
  const [auditFilter, setAuditFilter] = useState("all");

  const filteredLogs = MOCK_AUDIT_LOGS.filter(log => {
    if (auditFilter === "all") return true;
    if (auditFilter === "admin") return log.role === "admin";
    if (auditFilter === "owner") return log.role === "owner";
    return log.action.includes(auditFilter.toUpperCase());
  });

  return (
    <AdminLayout pageTitle="📋 Audit Logs">
      <div className="page-anim">
        <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 900, marginBottom: 4 }}>Audit Logs</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Real-time activity logs across all owners and admin override actions.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={auditFilter} onChange={e => setAuditFilter(e.target.value)}
              style={{
                padding: "10px 14px", background: "#1E1E1E", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, color: "white", fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: "pointer"
              }}>
              <option value="all">All Actors</option>
              <option value="admin">Admins only</option>
              <option value="owner">Owners only</option>
              <option value="PASSWORD_RESET">Password Resets</option>
              <option value="ACCOUNT">Account Changes</option>
              <option value="SUBSCRIPTION">Subscription changes</option>
            </select>
          </div>
        </div>

        <div style={{ background: "#1E1E1E", borderRadius: 18, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: 1.2, textTransform: "uppercase" }}>Timestamp</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: 1.2, textTransform: "uppercase" }}>Actor</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: 1.2, textTransform: "uppercase" }}>Role</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: 1.2, textTransform: "uppercase" }}>Action</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: 1.2, textTransform: "uppercase" }}>Target</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: 1.2, textTransform: "uppercase" }}>IP Address</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: 1.2, textTransform: "uppercase" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <tr key={i} className="table-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 16px", fontSize: 11, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
                      <div>{log.timestamp.split(" ")[0]}</div>
                      <div style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{log.timestamp.split(" ")[1]}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 700, color: log.role === "admin" ? "#E8650A" : "rgba(255,255,255,0.65)" }}>{log.actor}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: log.role === "admin" ? "rgba(232,101,10,0.15)" : "rgba(255,255,255,0.06)", color: log.role === "admin" ? "#E8650A" : "rgba(255,255,255,0.4)", borderRadius: 6, padding: "2px 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {log.role}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "white", whiteSpace: "nowrap" }}>{log.action.replace(/_/g, " ")}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 11, color: "rgba(255,255,255,0.45)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.target}</td>
                    <td style={{ padding: "12px 16px", fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{log.ip}</td>
                    <td style={{ padding: "12px 16px", fontSize: 11, color: "rgba(255,255,255,0.55)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.details}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Showing {filteredLogs.length} of {MOCK_AUDIT_LOGS.length} entries · Logs retained for 365 days</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>All times in IST (UTC+5:30)</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
