import React, { useState, useEffect } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import toast, { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';

const INIT_ORDERS = [
  { id: "ORD-20260518-0042", table: "5", items: [{ name: "Dal Makhani", qty: 2, price: 180 }, { name: "Butter Naan", qty: 4, price: 40 }], total: 520, status: "paid", method: "razorpay", time: "14:32", date: "2026-05-18" },
  { id: "ORD-20260518-0041", table: "3", items: [{ name: "Chicken Curry", qty: 1, price: 280 }, { name: "Tandoori Roti", qty: 3, price: 25 }], total: 355, status: "paid", method: "upi", time: "13:55", date: "2026-05-18" },
  { id: "ORD-20260518-0039", table: "1", items: [{ name: "Paneer Tikka", qty: 1, price: 240 }], total: 240, status: "pending", method: "upi", time: "12:48", date: "2026-05-18" },
];

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(INIT_ORDERS);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Robustly strip '/api' suffix from API URL for the WebSocket connection
    const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    const socketUrl = rawApiUrl.replace(/\/api$/, '');
    const socket = io(socketUrl);
    
    if (user?.id) {
      socket.emit('join_owner_room', user.id);
    }

    socket.on('new_order', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
      toast.success(`🎉 New Order Received! Table ${newOrder.table} - Total: ₹${newOrder.total}`, {
        duration: 8000,
        icon: '🔔'
      });
      // Play ding sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav');
        audio.play();
      } catch (e) {
        console.log('Audio playback blocked');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const updateStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success(`Order ${orderId.slice(-6)} marked as ${newStatus}.`);
  };

  const printReceipt = (order) => {
    toast.success(`📤 Dispatching receipt of ORD-${order.id.slice(-6)} to thermal printer...`);
  };

  const filteredOrders = orders.filter(o => filter === "all" ? true : o.status === filter);

  return (
    <OwnerLayout pageTitle="📦 Live Orders Counter">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="page-anim">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Live Orders</h1>
            <p style={{ fontSize: 13, color: "#999" }}>Monitor customer requests and update billing details instantly.</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["all", "pending", "paid"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 700, textTransform: "capitalize", background: filter === f ? "#E8650A" : "white", color: filter === f ? "white" : "#666", border: filter === f ? "none" : "1px solid #f0e8df" }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table/Grid */}
        <div style={{ background: "white", borderRadius: 18, border: "1px solid rgba(232,101,10,0.08)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f5ede5" }}>
                  {["Order ID", "Table", "Time", "Items Count", "Total Price", "Payment", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "#bbb", textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => (
                  <React.Fragment key={o.id}>
                    <tr className="table-row" style={{ borderBottom: "1px solid #f5ede5" }}>
                      <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: "bold" }}>
                        <button onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)} style={{ background: "none", border: "none", color: "#E8650A", cursor: "pointer", fontWeight: "bold", marginRight: 8 }}>
                          {expandedOrder === o.id ? "▼" : "▶"}
                        </button>
                        {o.id.slice(-6)}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: "bold" }}>Table {o.table}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#555" }}>{o.time}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#555" }}>{o.items.length} items</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: "bold", color: "#E8650A" }}>₹{o.total}</td>
                      <td style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "#888" }}>{o.method}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, color: o.status === "paid" ? "#2D6A4F" : "#E8650A", background: o.status === "paid" ? "rgba(45,106,79,0.1)" : "rgba(232,101,10,0.1)" }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {o.status === "pending" && (
                            <button onClick={() => updateStatus(o.id, "paid")} style={{ padding: "4px 8px", background: "#2D6A4F", color: "white", border: "none", borderRadius: 6, fontSize: 10, cursor: "pointer" }}>Mark Paid</button>
                          )}
                          <button onClick={() => printReceipt(o)} style={{ padding: "4px 8px", background: "#5B8DB8", color: "white", border: "none", borderRadius: 6, fontSize: 10, cursor: "pointer" }}>🖨️ Print</button>
                        </div>
                      </td>
                    </tr>
                    {expandedOrder === o.id && (
                      <tr>
                        <td colSpan={8} style={{ padding: "16px 28px", background: "#faf8f5" }}>
                          <div style={{ fontSize: 12 }}>
                            <div style={{ fontWeight: "bold", marginBottom: 8, color: "#1A1A1A" }}>Ordered Dishes:</div>
                            {o.items.map((item, idx) => (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dashed #e8ddd4", maxWidth: 400 }}>
                                <span>{item.name} x {item.qty}</span>
                                <span style={{ fontWeight: "bold" }}>₹{item.qty * item.price}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
