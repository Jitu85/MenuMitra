import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast, { Toaster } from 'react-hot-toast';

const MOCK_OWNERS = [
  { id: "OWN001", businessName: "Sharma's Dhaba", ownerName: "Ramesh Sharma", businessType: "dhaba", email: "ramesh@sharma.com", phone: "9876543210", city: "Patna", state: "Bihar", joined: "2026-01-12", subscription: "active", expires: "2026-06-12", orders: 342, revenue: 68400, items: 28, tables: 12, fssai: "10012345678901", status: "active" },
  { id: "OWN002", businessName: "Raj Hotel & Restaurant", ownerName: "Sunil Rajput", businessType: "hotel", email: "sunil@rajhotel.com", phone: "9812345678", city: "Jaipur", state: "Rajasthan", joined: "2026-02-03", subscription: "active", expires: "2026-07-03", orders: 891, revenue: 267300, items: 64, tables: 30, fssai: "10023456789012", status: "active" },
  { id: "OWN003", businessName: "Chai Corner", ownerName: "Meena Devi", businessType: "tea_stall", email: "meena@chaicorner.com", phone: "9765432109", city: "Varanasi", state: "Uttar Pradesh", joined: "2026-01-28", subscription: "expired", expires: "2026-04-28", orders: 1203, revenue: 36090, items: 18, tables: 8, fssai: "", status: "active" },
  { id: "OWN004", businessName: "Spice Garden Restaurant", ownerName: "Arjun Mehta", businessType: "restaurant", email: "arjun@spicegarden.com", phone: "9654321098", city: "Pune", state: "Maharashtra", joined: "2026-03-15", subscription: "active", expires: "2026-08-15", orders: 456, revenue: 136800, items: 52, tables: 20, fssai: "10034567890123", status: "active" },
  { id: "OWN005", businessName: "Café Monsoon", ownerName: "Priya Nair", businessType: "cafe", email: "priya@cafemonsoon.com", phone: "9543210987", city: "Kochi", state: "Kerala", joined: "2026-02-20", subscription: "active", expires: "2026-07-20", orders: 678, revenue: 135600, items: 41, tables: 15, fssai: "10045678901234", status: "active" },
  { id: "OWN006", businessName: "Gupta Sweet House", ownerName: "Deepak Gupta", businessType: "bakery", email: "deepak@guptasweets.com", phone: "9432109876", city: "Agra", state: "Uttar Pradesh", joined: "2026-04-01", subscription: "trial", expires: "2026-05-31", orders: 89, revenue: 22250, items: 35, tables: 6, fssai: "10056789012345", status: "active" },
  { id: "OWN007", businessName: "Highway Dhaba 66", ownerName: "Harpreet Singh", businessType: "dhaba", email: "harpreet@hw66.com", phone: "9321098765", city: "Ludhiana", state: "Punjab", joined: "2026-01-05", subscription: "suspended", expires: "2026-02-05", orders: 2341, revenue: 468200, items: 33, tables: 25, fssai: "10067890123456", status: "suspended" },
];

const SUB_BADGE = {
  active: { bg: "rgba(45,106,79,0.15)", color: "#40916C", label: "Active" },
  trial: { bg: "rgba(232,101,10,0.15)", color: "#E8650A", label: "Trial" },
  expired: { bg: "rgba(201,146,10,0.15)", color: "#C9920A", label: "Expired" },
  suspended: { bg: "rgba(192,57,43,0.15)", color: "#e74c3c", label: "Suspended" },
};

function Badge({ status }) {
  const s = SUB_BADGE[status] || SUB_BADGE.expired;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 800 }}>
      {s.label}
    </span>
  );
}

export default function OwnerManagement() {
  const [owners, setOwners] = useState(MOCK_OWNERS);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterSub, setFilterSub] = useState("all");

  const filtered = owners.filter(o => {
    const q = searchQ.toLowerCase();
    const matchQ = !q || o.businessName.toLowerCase().includes(q) || o.ownerName.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) || o.city.toLowerCase().includes(q);
    const matchSub = filterSub === "all" || o.subscription === filterSub;
    return matchQ && matchSub;
  });

  const handleStatusToggle = (owner) => {
    setOwners(prev => prev.map(o => {
      if (o.id === owner.id) {
        const isAct = o.status === "active";
        return {
          ...o,
          status: isAct ? "suspended" : "active",
          subscription: isAct ? "suspended" : "active"
        };
      }
      return o;
    }));
    toast.success(`Owner ${owner.businessName} status successfully updated!`);
    if (selectedOwner?.id === owner.id) setSelectedOwner(null);
  };

  const handleExtendSub = (owner) => {
    setOwners(prev => prev.map(o => {
      if (o.id !== owner.id) return o;
      const newExp = new Date(o.expires);
      newExp.setDate(newExp.getDate() + 30);
      return { ...o, subscription: "active", expires: newExp.toISOString().split("T")[0] };
    }));
    toast.success(`Subscription extended 30 days for ${owner.businessName}!`);
    if (selectedOwner?.id === owner.id) setSelectedOwner(null);
  };

  return (
    <AdminLayout pageTitle="🏪 Owner Management">
      <Toaster position="top-center" />
      <div className="page-anim">
        {!selectedOwner ? (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 900, marginBottom: 4 }}>Owner Management</h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{owners.length} registered business owners · {owners.filter(o => o.subscription === "active").length} active subscriptions</p>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search by name, email or city…"
                style={{ padding: "10px 14px", background: "#1E1E1E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", fontSize: 13, flex: "1 1 220px" }} />
              <select value={filterSub} onChange={e => setFilterSub(e.target.value)}
                style={{ padding: "10px 14px", background: "#1E1E1E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", fontSize: 13, cursor: "pointer" }}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Table */}
            <div style={{ background: "#1E1E1E", borderRadius: 18, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", height: 44 }}>
                      {["Business", "Owner", "City", "Joined", "Subscription", "Revenue", "Actions"].map(h => (
                        <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: 1.2, textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(owner => (
                      <tr key={owner.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "white", cursor: "pointer" }} onClick={() => setSelectedOwner(owner)}>{owner.businessName}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{owner.id}</div>
                        </td>
                        <td style={{ padding: "13px 16px", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{owner.ownerName}</td>
                        <td style={{ padding: "13px 16px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{owner.city}, {owner.state}</td>
                        <td style={{ padding: "13px 16px", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{owner.joined}</td>
                        <td style={{ padding: "13px 16px" }}><Badge status={owner.subscription} /></td>
                        <td style={{ padding: "13px 16px", fontSize: 12, fontWeight: 700, color: "#C9920A" }}>₹{owner.revenue.toLocaleString()}</td>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn-admin-primary" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => setSelectedOwner(owner)}>View</button>
                            <button className="btn-admin-primary" style={{ padding: "5px 10px", fontSize: 11, background: owner.status === "active" ? "#c0392b" : "#2d6a4f" }} onClick={() => handleStatusToggle(owner)}>
                              {owner.status === "active" ? "Suspend" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button onClick={() => setSelectedOwner(null)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 20 }}>
              ← Back to Owner List
            </button>
            <div style={{ background: "#1E1E1E", borderRadius: 18, padding: "28px", border: "1px solid rgba(255,255,255,0.06)", maxWidth: 680 }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{selectedOwner.businessName}</h2>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Owner details and administrative actions.</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                {[
                  { label: "Owner Name", val: selectedOwner.ownerName },
                  { label: "Email Address", val: selectedOwner.email },
                  { label: "Mobile Number", val: selectedOwner.phone },
                  { label: "Location", val: `${selectedOwner.city}, ${selectedOwner.state}` },
                  { label: "Registration Date", val: selectedOwner.joined },
                  { label: "GSTIN / FSSAI", val: selectedOwner.fssai || "Not Provided" },
                  { label: "Total Orders", val: selectedOwner.orders },
                  { label: "Platform Revenue", val: `₹${selectedOwner.revenue.toLocaleString()}` },
                ].map((f, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: "bold", color: "white", marginTop: 4 }}>{f.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-admin-primary" onClick={() => handleExtendSub(selectedOwner)}> Extend Sub (30 Days)</button>
                <button className="btn-admin-primary" style={{ background: selectedOwner.status === "active" ? "#c0392b" : "#2d6a4f" }} onClick={() => handleStatusToggle(selectedOwner)}>
                  {selectedOwner.status === "active" ? "Suspend Account" : "Activate Account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
