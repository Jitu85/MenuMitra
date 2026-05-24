import React, { useState, useEffect } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const DEFAULT_DAILY_REVENUE = [
  { date: "Mon", revenue: 0 }, { date: "Tue", revenue: 0 }, { date: "Wed", revenue: 0 },
  { date: "Thu", revenue: 0 }, { date: "Fri", revenue: 0 }, { date: "Sat", revenue: 0 }, { date: "Sun", revenue: 0 },
];

const DEFAULT_PAYMENT_SPLIT = [
  { name: "Razorpay", value: 50, color: "#E8650A" },
  { name: "UPI QR", value: 50, color: "#C9920A" },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayOrdersCount: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    totalMenuItems: 0,
    daysRemaining: 0,
    recentOrders: [],
  });

  const [analytics, setAnalytics] = useState({
    salesOverTime: [],
    topSellingItems: [],
  });


  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Load stats
        const statsRes = await api.get('/owner/stats');
        if (statsRes.data) {
          setStats(statsRes.data);
        }

        // Load analytics
        const analyticsRes = await api.get('/owner/analytics');
        if (analyticsRes.data) {
          setAnalytics({
            salesOverTime: analyticsRes.data.salesOverTime || [],
            topSellingItems: analyticsRes.data.topSellingItems || [],
          });
        }
      } catch (e) {
        console.error("Failed to load dashboard operational statistics", e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const ownerName = user?.ownerName || user?.owner_name || 'Merchant Partner';

  // Compute payment splits dynamically based on recent orders payment methods if stats are empty
  const orders = stats.recentOrders || [];
  const upiCount = orders.filter(o => o.paymentMethod === 'upi_qr' || o.paymentMethod === 'upi').length;
  const rpCount = orders.filter(o => o.paymentMethod === 'razorpay').length;
  const totalCount = upiCount + rpCount;
  
  const paymentSplit = totalCount > 0 ? [
    { name: "Razorpay", value: Math.round((rpCount / totalCount) * 100), color: "#E8650A" },
    { name: "UPI QR", value: Math.round((upiCount / totalCount) * 100), color: "#C9920A" },
  ] : DEFAULT_PAYMENT_SPLIT;

  // Use live sales trend line or default daily line
  const chartData = analytics.salesOverTime && analytics.salesOverTime.length > 0
    ? analytics.salesOverTime
    : DEFAULT_DAILY_REVENUE;

  if (loading) {
    return (
      <OwnerLayout pageTitle="📊 Owner Dashboard">
        <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "center", alignItems: "center", minHeight: "60vh", color: "#E8650A", fontSize: "15px", fontWeight: "bold" }}>
          <span>🔄 Loading business operational statistics...</span>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout pageTitle="📊 Owner Dashboard">
      <div className="page-anim">
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>
            Welcome back, <em style={{ color: "#E8650A" }}>{ownerName}</em> 👋
          </h1>
          <p style={{ fontSize: 13, color: "#999" }}>Here is your business snapshot for today.</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
          {[
            { icon: "📦", label: "Today's Orders", val: stats.todayOrdersCount, sub: "Live Orders", color: "#E8650A" },
            { icon: "💰", label: "Today's Revenue", val: `₹${stats.todayRevenue.toLocaleString('en-IN')}`, sub: "Paid orders only", color: "#2D6A4F" },
            { icon: "📅", label: "Monthly Revenue", val: `₹${stats.monthRevenue.toLocaleString('en-IN')}`, sub: "This Month", color: "#C9920A" },
            { icon: "🍽️", label: "Active Menu Items", val: stats.totalMenuItems, sub: "Total catalog", color: "#5B8DB8" },
            { icon: "⏳", label: "Trial Days Left", val: `${stats.daysRemaining} days`, sub: "Subscription status", color: "#c0392b" },
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
            <div style={{ display: "flex", justifySpace: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Revenue</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800 }}>Sales Trend Line</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "#bbb", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#bbb", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #f0e8df", borderRadius: 10, fontSize: 12 }} formatter={v => `₹${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#E8650A" strokeWidth={2.5} dot={{ fill: "#E8650A", r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding: "22px" }}>
            <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Payment Split</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Diner Preferences</div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={paymentSplit} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                  {paymentSplit.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "white", border: "1px solid #f0e8df", borderRadius: 10, fontSize: 12 }} formatter={v => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              {paymentSplit.map((s, i) => (
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
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Top Dishes</div>
            
            {analytics.topSellingItems && analytics.topSellingItems.length > 0 ? (
              analytics.topSellingItems.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < analytics.topSellingItems.length - 1 ? "1px solid #f5ede5" : "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? "rgba(232,101,10,0.12)" : "#f5ede5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🍛</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: "#bbb" }}>{item.units} units sold · ₹{item.sales.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 13, color: i === 0 ? "#E8650A" : i === 1 ? "#C9920A" : "#bbb" }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  "}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "30px", textAlign: "center", color: "#bbb", fontSize: 13 }}>
                No item sales recorded yet. Live customer orders will populate stats.
              </div>
            )}
          </div>

          <div className="card" style={{ padding: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Activity</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800 }}>Recent Orders Queue</div>
              </div>
            </div>
            
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.slice(0, 4).map((o, i) => {
                const dateVal = new Date(o.createdAt);
                const timeStr = dateVal.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
                return (
                  <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 3 ? "1px solid #f5ede5" : "none" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A" }}>{o.orderNumber.slice(-6)} · Table {o.tableNumber}</div>
                      <div style={{ fontSize: 10, color: "#bbb", marginTop: 1 }}>{timeStr} · {o.customerName} · {o.items.length} items</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#1A1A1A" }}>₹{o.totalAmount}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: o.paymentStatus === "paid" ? "#2D6A4F" : "#E8650A", background: o.paymentStatus === "paid" ? "rgba(45,106,79,0.1)" : "rgba(232,101,10,0.1)", borderRadius: 6, padding: "1px 6px" }}>
                        {o.paymentStatus === "paid" ? "✓ Paid" : "⏳ Pending"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "30px", textAlign: "center", color: "#bbb", fontSize: 13 }}>
                No active orders queue. Scanned digital orders appear immediately.
              </div>
            )}
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
