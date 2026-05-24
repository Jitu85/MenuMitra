import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAuditLogs } from '../../services/adminService';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [auditFilter, setAuditFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const data = await getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error("Failed to load audit logs", err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (auditFilter === "all") return true;
    if (auditFilter === "admin") return log.actorRole === "admin";
    if (auditFilter === "owner") return log.actorRole === "owner";
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

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <div className="spinner" style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(232,101,10,0.1)", borderTopColor: "#E8650A", animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
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
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: 1.2, textTransform: "uppercase" }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, i) => (
                    <tr key={i} className="table-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "12px 16px", fontSize: 11, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
                        <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                        <div style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 700, color: log.actorRole === "admin" ? "#E8650A" : "rgba(255,255,255,0.65)" }}>
                        {log.actorId ? `User (${log.actorId.substring(0,8)})` : "Admin"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, background: log.actorRole === "admin" ? "rgba(232,101,10,0.15)" : "rgba(255,255,255,0.06)", color: log.actorRole === "admin" ? "#E8650A" : "rgba(255,255,255,0.4)", borderRadius: 6, padding: "2px 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {log.actorRole}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "white", whiteSpace: "nowrap" }}>{log.action.replace(/_/g, " ")}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 11, color: "rgba(255,255,255,0.45)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {log.targetType} {log.targetId ? `(${log.targetId.substring(0,8)})` : ""}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 11, color: "rgba(255,255,255,0.55)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}>
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: 30, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                        No audit log activities matched your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Showing {filteredLogs.length} of {logs.length} entries · Logs retained for 365 days</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>All times in local time</span>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
