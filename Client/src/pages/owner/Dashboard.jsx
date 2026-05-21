import React, { useState } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const DAILY_REVENUE = [
  { day: "Mon", revenue: 4200 }, { day: "Tue", revenue: 3800 }, { day: "Wed", revenue: 5100 },
  { day: "Thu", revenue: 4700 }, { day: "Fri", revenue: 6800 }, { day: "Sat", revenue: 8200 }, { day: "Sun", revenue: 7400 },
];

const MONTHLY_REVENUE = [
  { month: "Jan", revenue: 68000 }, { month: "Feb", revenue: 72000 }, { month: "Mar", revenue: 81000 },
  { month: "Apr", revenue: 76000 }, { month: "May", revenue: 68400 },
];

const PAYMENT_SPLIT = [
  { name: "Razorpay", value: 58, color: "#E8650A" },
  { name: "UPI QR", value: 42, color: "#C9920A" },
];

const MOCK_ORDERS = [
  { id: "ORD-20260518-0042", table: "5", itemsCount: 3, total: 580, status: "paid", time: "14:32", date: "2026-05-18" },
  { id: "ORD-20260518-0041", table: "3", itemsCount: 2, total: 355, status: "paid", time: "13:55", date: "2026-05-18" },
  { id: "ORD-20260518-0040", table: "8", itemsCount: 3, total: 680, status: "paid", time: "13:20", date: "2026-05-18" },
  { id: "ORD-20260518-0039", table: "1", itemsCount: 2, total: 330, status: "pending", time: "12:48", date: "2026-05-18" },
];

const TOP_ITEMS = [
  { id: "ITM006", nameEn: "Tandoori Roti", photo: "🫓", sales: 334, price: 25 },
  { id: "ITM005", nameEn: "Butter Naan", photo: "🫓", sales: 289, price: 40 },
  { id: "ITM003", nameEn: "Chicken Curry", photo: "🍗", sales: 211, price: 280 },
  { id: "ITM008", nameEn: "Lassi (Sweet)", photo: "🥛", sales: 178, price: 60 },
  { id: "ITM001", nameEn: "Dal Makhani", photo: "🍛", sales: 142, price: 180 },
];

export default function Dashboard() {
  const [chartRange, setChartRange] = useState("daily");

  return (
    <OwnerLayout pageTitle="📊 Owner Dashboard">
      <div className="page-anim">
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>
            Welcome back, <em style={{ color: "#E8650A" }}>Ramesh</em> 👋
          </h1>
          <p style={{ fontSize: 13, color: "#999" }}>Here is your business snapshot for today.</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
          {[
            { icon: "📦", label: "Today's Orders", val: 4, sub: "18 May 2026", color: "#E8650A" },
            { icon: "💰", label: "Today's Revenue", val: "₹1,615", sub: "Paid orders only", color: "#2D6A4F" },
            { icon: "📅", label: "Monthly Revenue", val: "₹68,400", sub: "May 2026", color: "#C9920A" },
            { icon: "🍽️", label: "Menu Items", val: 10, sub: "8 available", color: "#5B8DB8" },
            { icon: "🟢", label: "Live Orders", val: 1, sub: "Awaiting confirm", color: "#c0392b" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ flex: "1 1 160px", padding: "20px", minWidth: 160 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: `${s.color}12`, border: `1.5px solid ${s.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 14 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: "#1A1A1A", lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18, marginBottom: 18 }}>
          <div className="card" style={{ padding: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Revenue</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800 }}>Daily This Week</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["daily", "monthly"].map(r => (
                  <button key={r} onClick={() => setChartRange(r)}
                    style={{ padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", background: chartRange === r ? "#E8650A" : "#f5ede5", color: chartRange === r ? "white" : "#888" }}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartRange === "daily" ? DAILY_REVENUE : MONTHLY_REVENUE} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey={chartRange === "daily" ? "day" : "month"} tick={{ fill: "#bbb", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#bbb", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #f0e8df", borderRadius: 10, fontSize: 12 }} formatter={v => `₹${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#E8650A" strokeWidth={2.5} dot={{ fill: "#E8650A", r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: "22px" }}>
            <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Payment Split</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, marginBottom: 14 }}>This Month</div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={PAYMENT_SPLIT} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                  {PAYMENT_SPLIT.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "white", border: "1px solid #f0e8df", borderRadius: 10, fontSize: 12 }} formatter={v => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              {PAYMENT_SPLIT.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                  <span style={{ fontSize: 11, color: "#888" }}>{s.name} ({s.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Info Rows */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
          <div className="card" style={{ padding: "22px" }}>
            <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Best Sellers</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Top 5 Items</div>
            {TOP_ITEMS.map((item, i) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < 4 ? "1px solid #f5ede5" : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? "rgba(232,101,10,0.12)" : "#f5ede5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{item.photo}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nameEn}</div>
                  <div style={{ fontSize: 10, color: "#bbb" }}>{item.sales} orders · ₹{item.price}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 13, color: i === 0 ? "#E8650A" : i === 1 ? "#C9920A" : "#bbb" }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  "}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Activity</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800 }}>Recent Orders</div>
              </div>
            </div>
            {MOCK_ORDERS.map((o, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 3 ? "1px solid #f5ede5" : "none" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A" }}>{o.id.slice(-6)} · Table {o.table}</div>
                  <div style={{ fontSize: 10, color: "#bbb", marginTop: 1 }}>{o.date} {o.time} · {o.itemsCount} item{o.itemsCount !== 1 ? "s" : ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1A1A1A" }}>₹{o.total}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: o.status === "paid" ? "#2D6A4F" : "#E8650A", background: o.status === "paid" ? "rgba(45,106,79,0.1)" : "rgba(232,101,10,0.1)", borderRadius: 6, padding: "1px 6px" }}>
                    {o.status === "paid" ? "✓ Paid" : "⏳ Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
