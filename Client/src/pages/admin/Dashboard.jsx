import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const SIGNUP_TREND = [
  { month: "Dec", signups: 3 }, { month: "Jan", signups: 12 }, { month: "Feb", signups: 18 },
  { month: "Mar", signups: 24 }, { month: "Apr", signups: 19 }, { month: "May", signups: 31 },
];

const SUB_STATUS = [
  { name: "Active", value: 5, color: "#2D6A4F" },
  { name: "Trial", value: 1, color: "#E8650A" },
  { name: "Expired", value: 1, color: "#C9920A" },
  { name: "Suspended", value: 1, color: "#c0392b" },
];

const MOCK_AUDIT_LOGS = [
  { id: "LOG001", timestamp: "2026-05-18 14:32:11", actor: "Jitu", action: "PASSWORD_RESET", details: "Force reset initiated. Reset email dispatched to meena@chaicorner.com." },
  { id: "LOG002", timestamp: "2026-05-18 11:20:05", actor: "Jitu", action: "ACCOUNT_SUSPENDED", details: "Account suspended due to non-payment for 90+ days." },
  { id: "LOG018", timestamp: "2026-05-18 09:15:33", actor: "sunil@rajhotel.com", action: "ITEM_ADDED", details: "New item added: 'Butter Chicken' — ₹320." },
  { id: "LOG017", timestamp: "2026-05-17 22:44:18", actor: "ramesh@sharma.com", action: "PAYMENT_RECEIVED", details: "Order ORD-20260517-0089 paid. Amount: ₹490. Method: Razorpay." },
  { id: "LOG016", timestamp: "2026-05-17 18:30:02", actor: "Jitu", action: "SUBSCRIPTION_EXTENDED", details: "Subscription manually extended by 30 days as goodwill gesture." },
];

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
          <StatCard icon="🏪" label="Total Registered Owners" value="8" sub="Platform-wide" color="#E8650A" trend={23} />
          <StatCard icon="✅" label="Active Subscriptions" value="5" sub="Paying accounts" color="#2D6A4F" trend={8} />
          <StatCard icon="⏳" label="On Free Trial" value="1" sub="Expires May 31" color="#C9920A" />
          <StatCard icon="❌" label="Expired / Suspended" value="2" sub="Needs attention" color="#c0392b" />
          <StatCard icon="💰" label="Platform Revenue" value="₹700" sub="This month" color="#E8650A" trend={15} />
          <StatCard icon="📦" label="Total Orders Today" value="127" sub="Across all businesses" color="#2D6A4F" trend={6} />
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
          {MOCK_AUDIT_LOGS.map((log, i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "flex-start" }}>
              <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
                {log.action.includes("RESET") ? "🔑" : log.action.includes("SUSPEND") ? "🔒" : log.action.includes("ACTIV") ? "✅" : log.action.includes("PAYMENT") ? "💳" : log.action.includes("ITEM") ? "🍽️" : "📋"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "white", marginBottom: 2 }}>
                  <span style={{ color: "#E8650A" }}>{log.actor}</span> · <span style={{ color: "rgba(255,255,255,0.5)" }}>{log.action.replace(/_/g, " ")}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.details}</div>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", flexShrink: 0, textAlign: "right" }}>
                {log.timestamp.split(" ")[1]}<br />
                <span style={{ color: "rgba(255,255,255,0.15)" }}>{log.timestamp.split(" ")[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
