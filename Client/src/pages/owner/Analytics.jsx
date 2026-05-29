import React, { useState, useEffect } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Analytics() {
  const [salesData, setSalesData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/owner/analytics');
      setSalesData(res.data.salesOverTime || []);
      setTopItems(res.data.topSellingItems || []);
    } catch (err) {
      toast.error('Failed to load analytics.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (topItems.length === 0) return toast.error('No data to export.');
    
    const headers = ["Item Name", "Category", "Units Sold", "Revenue (INR)", "Status"];
    const rows = topItems.map(item => [
      `"${item.name}"`,
      `"${item.categoryName}"`,
      item.sales,
      item.revenue || 0,
      item.isAvailable ? "Available" : "Unavailable"
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `menumitra_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Analytics exported successfully!');
  };

  return (
    <OwnerLayout pageTitle="📈 Analytics & Reports">
      <div className="page-anim">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Analytics</h1>
            <p style={{ fontSize: 13, color: "#999" }}>Detailed sales performance and item-wise breakdown.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={exportToCSV}
              style={{ padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", background: "#1A1A1A", color: "white", border: "none" }}>
              Export to CSV
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>Loading analytics...</div>
        ) : (
          <>
            {/* Revenue chart */}
            <div className="card" style={{ padding: "24px", marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Revenue Trend</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, marginBottom: 18 }}>Sales Over Time</div>
              <ResponsiveContainer width="100%" height={220}>
                {salesData.length > 0 ? (
                  <BarChart data={salesData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: "#bbb", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#bbb", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #f0e8df", borderRadius: 10, fontSize: 12 }} formatter={v => `₹${Number(v).toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="#E8650A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb" }}>No sales data yet.</div>
                )}
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
                      {["Item", "Category", "Units Sold", "Revenue", "Status"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "#bbb", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topItems.length > 0 ? topItems.map((item) => (
                      <tr key={item.id} className="table-row" style={{ borderBottom: "1px solid #f5ede5" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {(!item.photo || item.photo.length < 10) ? (
                              <span style={{ fontSize: 18 }}>{item.photo || "🍽️"}</span>
                            ) : (
                              <img src={item.photo} alt={item.name} style={{ width: 24, height: 24, borderRadius: 4, objectFit: "cover" }} />
                            )}
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>{item.name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 11, background: "#f5ede5", color: "#888", borderRadius: 6, padding: "3px 8px" }}>{item.categoryName}</span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 800, color: "#1A1A1A" }}>{item.sales}</td>
                        <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 800, color: "#E8650A" }}>₹{Number(item.revenue || 0).toLocaleString()}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, background: item.isAvailable ? "rgba(45,106,79,0.1)" : "rgba(192,57,43,0.1)", color: item.isAvailable ? "#2D6A4F" : "#c0392b", borderRadius: 6, padding: "3px 8px" }}>
                            {item.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#bbb" }}>No items sold yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </OwnerLayout>
  );
}
