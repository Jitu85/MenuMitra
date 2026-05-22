import React, { useState } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const DAILY_REVENUE = [
  { day: "Mon", revenue: 4200 }, { day: "Tue", revenue: 3800 }, { day: "Wed", revenue: 5100 },
  { day: "Thu", revenue: 4700 }, { day: "Fri", revenue: 6800 }, { day: "Sat", revenue: 8200 }, { day: "Sun", revenue: 7400 },
];

const MONTHLY_REVENUE = [
  { month: "Jan", revenue: 68000 }, { month: "Feb", revenue: 72000 }, { month: "Mar", revenue: 81000 },
  { month: "Apr", revenue: 76000 }, { month: "May", revenue: 68400 },
];

const MOCK_ITEMS = [
  { id: "ITM006", nameEn: "Tandoori Roti", nameHi: "तंदूरी रोटी", photo: "🫓", sales: 334, price: 25, isAvailable: true, categoryName: "Breads" },
  { id: "ITM005", nameEn: "Butter Naan", nameHi: "बटर नान", photo: "🫓", sales: 289, price: 40, isAvailable: true, categoryName: "Breads" },
  { id: "ITM003", nameEn: "Chicken Curry", nameHi: "चिकन करी", photo: "🍗", sales: 211, price: 280, isAvailable: true, categoryName: "Main Course" },
  { id: "ITM008", nameEn: "Lassi (Sweet)", nameHi: "मीठी लस्सी", photo: "🥛", sales: 178, price: 60, isAvailable: true, categoryName: "Beverages" },
  { id: "ITM001", nameEn: "Dal Makhani", nameHi: "दाल मखनी", photo: "🍛", sales: 142, price: 180, isAvailable: true, categoryName: "Main Course" },
  { id: "ITM009", nameEn: "Paneer Tikka", nameHi: "पनीर टिक्का", photo: "🧆", sales: 134, price: 240, isAvailable: true, categoryName: "Starters" },
  { id: "ITM002", nameEn: "Paneer Butter Masala", nameHi: "पनीर बटर मसाला", photo: "🧆", sales: 98, price: 220, isAvailable: true, categoryName: "Main Course" },
  { id: "ITM010", nameEn: "Gulab Jamun", nameHi: "गुलाब जामुन", photo: "🍮", sales: 89, price: 80, isAvailable: true, categoryName: "Desserts" },
  { id: "ITM004", nameEn: "Mutton Rogan Josh", nameHi: "मटन रोगन जोश", photo: "🥘", sales: 67, price: 380, isAvailable: false, categoryName: "Main Course" },
];

export default function Analytics() {
  const [analyticsRange, setAnalyticsRange] = useState("weekly");

  return (
    <OwnerLayout pageTitle="📈 Analytics & Reports">
      <div className="page-anim">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Analytics</h1>
            <p style={{ fontSize: 13, color: "#999" }}>Detailed sales performance and item-wise breakdown.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["weekly", "monthly"].map(r => (
              <button key={r} onClick={() => setAnalyticsRange(r)}
                style={{ padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", background: analyticsRange === r ? "#E8650A" : "white", color: analyticsRange === r ? "white" : "#888", border: analyticsRange === r ? "none" : "1px solid #f0e8df" }}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Revenue chart */}
        <div className="card" style={{ padding: "24px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Revenue Trend</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, marginBottom: 18 }}>{analyticsRange === "weekly" ? "This Week" : "Past 5 Months"}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analyticsRange === "weekly" ? DAILY_REVENUE : MONTHLY_REVENUE} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey={analyticsRange === "weekly" ? "day" : "month"} tick={{ fill: "#bbb", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#bbb", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #f0e8df", borderRadius: 10, fontSize: 12 }} formatter={v => `₹${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#E8650A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Item performance table */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f5ede5" }}>
            <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Performance</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800 }}>Item-wise Sales Breakdown</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f5ede5" }}>
                  {["Item", "Category", "Units Sold", "Revenue", "Avg/Day", "Status"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "#bbb", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_ITEMS.map((item, i) => (
                  <tr key={item.id} className="table-row" style={{ borderBottom: "1px solid #f5ede5" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 18 }}>{item.photo}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>{item.nameEn}</div>
                          <div style={{ fontSize: 10, color: "#bbb" }}>{item.nameHi}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, background: "#f5ede5", color: "#888", borderRadius: 6, padding: "3px 8px" }}>{item.categoryName}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 800, color: "#1A1A1A" }}>{item.sales}</td>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 800, color: "#E8650A" }}>₹{(item.sales * item.price).toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>{(item.sales / 30).toFixed(1)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, background: item.isAvailable ? "rgba(45,106,79,0.1)" : "rgba(192,57,43,0.1)", color: item.isAvailable ? "#2D6A4F" : "#c0392b", borderRadius: 6, padding: "3px 8px" }}>
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
