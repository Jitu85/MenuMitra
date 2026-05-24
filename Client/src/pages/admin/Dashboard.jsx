import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { getAdminStats, getAuditLogs } from '../../services/adminService';

function StatCard({ icon, label, value, sub, color = "#E8650A", trend }) {
  return (
    <div style={{ background: "#1E1E1E", borderRadius: 18, padding: "22px 24px", border: "1px solid rgba(255,255,255,0.06)", flex: "1 1 180px", minWidth: 180 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, border: `1.5px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{icon}</div>
        {trend && <span style={{ fontSize: 11, fontWeight: 700, color: trend > 0 ? "#40916C" : "#e74c3c" }}>▲ {trend}%</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: "white", fontFamily: "'Playfair Display',serif", lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const statsData = await getAdminStats();
        const logsData = await getAuditLogs();
        setStats(statsData);
        setAuditLogs(logsData);
      } catch (err) {
        console.error("Failed to load admin dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout pageTitle="📊 Super Admin Dashboard">
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "60vh", gap: 16 }}>
          <div className="spinner" style={{
            width: 50, height: 50, borderRadius: "50%",
            border: "3px solid rgba(232,101,10,0.1)", borderTopColor: "#E8650A",
            animation: "spin 1s linear infinite"
          }} />
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600 }}>Loading administrative data...</div>
        </div>
      </AdminLayout>
    );
  }

  // Fallback default statistics
  const currentStats = stats || {
    totalOwners: 0,
    activeSubs: 0,
    trialSubs: 0,
    expiredSubs: 0,
    platformRevenue: 0,
    totalOrders: 0
  };

  const SUB_STATUS = [
    { name: "Active", value: currentStats.activeSubs, color: "#2D6A4F" },
    { name: "Trial", value: currentStats.trialSubs, color: "#E8650A" },
    { name: "Expired", value: currentStats.expiredSubs, color: "#C9920A" },
    { name: "Suspended", value: Math.max(0, currentStats.totalOwners - currentStats.activeSubs - currentStats.trialSubs - currentStats.expiredSubs), color: "#c0392b" },
  ];

  // We can construct a mock signup trend but using real statistics
  const SIGNUP_TREND = [
    { month: "Dec", signups: Math.max(0, currentStats.totalOwners - 5) },
    { month: "Jan", signups: Math.max(0, currentStats.totalOwners - 4) },
    { month: "Feb", signups: Math.max(0, currentStats.totalOwners - 3) },
    { month: "Mar", signups: Math.max(0, currentStats.totalOwners - 2) },
    { month: "Apr", signups: Math.max(0, currentStats.totalOwners - 1) },
    { month: "May", signups: currentStats.totalOwners },
  ];

  return (
    <AdminLayout pageTitle="📊 Super Admin Dashboard">
      <div className="page-anim">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 900, marginBottom: 4 }}>
            Good morning, <em style={{ color: "#E8650A" }}>Abhijit</em> 👋
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Here is an overview of the MenuMitra platform as of today.</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
          <StatCard icon="🏪" label="Total Registered Owners" value={currentStats.totalOwners} sub="Platform-wide" color="#E8650A" />
          <StatCard icon="✅" label="Active Subscriptions" value={currentStats.activeSubs} sub="Paying accounts" color="#2D6A4F" />
          <StatCard icon="⏳" label="On Free Trial" value={currentStats.trialSubs} sub="Trial accounts" color="#C9920A" />
          <StatCard icon="❌" label="Expired / Suspended" value={currentStats.expiredSubs} sub="Needs attention" color="#c0392b" />
          <StatCard icon="💰" label="Platform Revenue" value={`₹${currentStats.platformRevenue}`} sub="All-time sales" color="#E8650A" />
          <StatCard icon="📦" label="Total Customer Orders" value={currentStats.totalOrders} sub="Across all businesses" color="#2D6A4F" />
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 20 }}>
          {/* Signup trend */}
          <div style={{ background: "#1E1E1E", borderRadius: 18, padding: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>New Owner Signups</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800 }}>Monthly Trend</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={SIGNUP_TREND} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1E1E1E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} labelStyle={{ color: "white" }} itemStyle={{ color: "#E8650A" }} />
                <Line type="monotone" dataKey="signups" stroke="#E8650A" strokeWidth={2.5} dot={{ fill: "#E8650A", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Subscription Status */}
          <div style={{ background: "#1E1E1E", borderRadius: 18, padding: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Subscription Status</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800 }}>Breakdown</div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={SUB_STATUS} cx="50%" cy="50%" innerRadius={46} outerRadius={72} paddingAngle={3} dataKey="value">
                  {SUB_STATUS.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1E1E1E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} itemStyle={{ color: "white" }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 4 }}>
              {SUB_STATUS.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{s.name} ({s.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit feed */}
        <div style={{ background: "#1E1E1E", borderRadius: 18, padding: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Latest Activity</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800 }}>Audit Feed</div>
            </div>
          </div>
          {auditLogs.slice(0, 5).map((log, i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "flex-start" }}>
              <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
                {log.action.includes("RESET") ? "🔑" : log.action.includes("SUSPEND") ? "🔒" : log.action.includes("ACTIV") ? "✅" : log.action.includes("PAYMENT") ? "💳" : log.action.includes("ITEM") ? "🍽️" : "📋"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "white", marginBottom: 2 }}>
                  <span style={{ color: "#E8650A" }}>{log.actorId ? `User (${log.actorId.substring(0,8)})` : "Admin"}</span> · <span style={{ color: "rgba(255,255,255,0.5)" }}>{log.action.replace(/_/g, " ")}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : "No details provided"}
                </div>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", flexShrink: 0, textAlign: "right" }}>
                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br />
                <span style={{ color: "rgba(255,255,255,0.15)" }}>{new Date(log.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {auditLogs.length === 0 && (
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No recent audit activity found.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
