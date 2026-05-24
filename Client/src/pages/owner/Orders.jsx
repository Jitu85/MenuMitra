import React, { useState, useEffect } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import toast, { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function Orders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // 1. Fetch existing orders from database on load
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await api.get('/orders');
        setOrders(res.data || []);
      } catch (e) {
        console.error("Failed to load live orders list", e);
        toast.error("❌ Failed to fetch live orders from database.");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();

    // 2. Setup Socket.io Real-Time connection
    const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    const socketUrl = rawApiUrl.replace(/\/api$/, '');
    const socket = io(socketUrl);
    
    if (user?.id) {
      socket.emit('join_owner_room', user.id);
    }

    // Fixed event name from 'new_order' to match backend 'new_order_received'
    socket.on('new_order_received', (newOrder) => {
      // Map keys to match GET /orders schema exactly
      const mappedOrder = {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        tableNumber: newOrder.tableNumber,
        customerName: newOrder.customerName || 'Guest',
        totalAmount: newOrder.totalAmount,
        paymentMethod: newOrder.paymentMethod || 'N/A',
        paymentStatus: 'pending',
        createdAt: newOrder.createdAt || new Date().toISOString(),
        items: newOrder.items.map(i => ({
          nameEn: i.nameEn,
          qty: i.qty,
          price: i.price,
          totalPrice: i.qty * i.price
        }))
      };

      setOrders(prev => [mappedOrder, ...prev]);
      
      toast.success(`🎉 New Order! Table ${newOrder.tableNumber} - Total: ₹${newOrder.totalAmount}`, {
        duration: 9000,
        icon: '🔔'
      });

      // Play alert chime
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav');
        audio.play();
      } catch (e) {
        console.warn('Audio alert blocked by browser autoplay settings');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { paymentStatus: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: newStatus } : o));
      toast.success(`✅ Order marked as ${newStatus} in database.`);
    } catch (e) {
      console.error(e);
      toast.error("❌ Failed to update order status.");
    }
  };

  const printReceipt = (order) => {
    // Dynamically open pre-styled browser thermal receipt in a new tab for native thermal printing
    const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
    const printUrl = `${rawApiUrl}/print/receipt/${order.id}`;
    window.open(printUrl, '_blank');
    toast.success("📤 Dispatching receipt frame to browser print tab...");
  };

  const filteredOrders = orders.filter(o => filter === "all" ? true : o.paymentStatus === filter);

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
          
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#bbb" }}>Loading active order book...</div>
          ) : filteredOrders.length > 0 ? (
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
                  {filteredOrders.map(o => {
                    const dateVal = new Date(o.createdAt);
                    const timeStr = dateVal.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
                    const itemsCount = o.items.reduce((sum, item) => sum + item.qty, 0);

                    return (
                      <React.Fragment key={o.id}>
                        <tr className="table-row" style={{ borderBottom: "1px solid #f5ede5" }}>
                          <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: "bold" }}>
                            <button onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)} style={{ background: "none", border: "none", color: "#E8650A", cursor: "pointer", fontWeight: "bold", marginRight: 8 }}>
                              {expandedOrder === o.id ? "▼" : "▶"}
                            </button>
                            {o.orderNumber ? o.orderNumber.slice(-6) : o.id.slice(-6)}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: "bold" }}>Table {o.tableNumber}</td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}>{timeStr}</td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}>{itemsCount} item{itemsCount !== 1 ? "s" : ""}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 800, color: "#E8650A" }}>₹{o.totalAmount}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 9, fontWeight: 800, background: "#f5ede5", color: "#888", padding: "3px 6px", borderRadius: 5, textTransform: "uppercase" }}>
                              {o.paymentMethod ? o.paymentMethod.replace('_', ' ') : 'CASH'}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 10, fontWeight: 700, background: o.paymentStatus === "paid" ? "rgba(45,106,79,0.12)" : "rgba(232,101,10,0.12)", color: o.paymentStatus === "paid" ? "#2D6A4F" : "#E8650A", borderRadius: 6, padding: "3px 8px" }}>
                              {o.paymentStatus === "paid" ? "✓ Paid" : "⏳ Pending"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                              {o.paymentStatus === "pending" ? (
                                <button className="action-btn" onClick={() => updateStatus(o.id, "paid")}
                                  style={{ border: "none", background: "#E8650A", color: "white", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                  Mark Paid
                                </button>
                              ) : (
                                <button className="action-btn" onClick={() => updateStatus(o.id, "pending")}
                                  style={{ border: "none", background: "rgba(232,101,10,0.06)", color: "#E8650A", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                  Mark Unpaid
                                </button>
                              )}
                              <button onClick={() => printReceipt(o)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>🖨️</button>
                            </div>
                          </td>
                        </tr>

                        {/* Collapsible Order Item Details */}
                        {expandedOrder === o.id && (
                          <tr>
                            <td colSpan={8} style={{ padding: "14px 20px", background: "rgba(232,101,10,0.02)" }}>
                              <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>📋 Order Items Detail (Customer: {o.customerName})</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 400 }}>
                                {o.items.map((item, idx) => (
                                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                                    <span style={{ color: "#1A1A1A" }}>{item.qty}x {item.nameEn}</span>
                                    <span style={{ fontWeight: "bold", color: "#666" }}>₹{(item.qty * item.price).toLocaleString()}</span>
                                  </div>
                                ))}
                                {o.notes && (
                                  <div style={{ marginTop: 8, padding: "8px 10px", background: "rgba(0,0,0,0.02)", borderLeft: "3.5px solid #C9920A", borderRadius: 4, fontSize: 11, color: "#666" }}>
                                    <strong>Notes:</strong> {o.notes}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px", color: "#bbb" }}>No active checkouts found for this selection.</div>
          )}
        </div>
      </div>
    </OwnerLayout>
  );
}
