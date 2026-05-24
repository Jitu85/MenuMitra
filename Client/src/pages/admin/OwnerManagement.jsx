import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast, { Toaster } from 'react-hot-toast';
import { getOwners, getOwnerDetails, updateOwnerStatus, overrideSubscription } from '../../services/adminService';

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
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [detailedOwner, setDetailedOwner] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterSub, setFilterSub] = useState("all");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch owners list based on search and status
  const fetchOwnersList = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQ) params.search = searchQ;
      if (filterSub !== "all") params.status = filterSub;
      const data = await getOwners(params);
      setOwners(data);
    } catch (err) {
      toast.error(err.message || "Failed to load owner accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOwnersList();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQ, filterSub]);

  // Load detailed owner data when an owner is selected
  useEffect(() => {
    if (!selectedOwner) {
      setDetailedOwner(null);
      return;
    }

    async function loadDetails() {
      try {
        setDetailLoading(true);
        const data = await getOwnerDetails(selectedOwner.id);
        setDetailedOwner(data);
      } catch (err) {
        toast.error("Failed to load details: " + err.message);
        setSelectedOwner(null);
      } finally {
        setDetailLoading(false);
      }
    }
    loadDetails();
  }, [selectedOwner]);

  const handleStatusToggle = async (owner) => {
    try {
      const nextActive = !owner.isActive;
      await updateOwnerStatus(owner.id, nextActive);
      toast.success(`Owner account ${nextActive ? 'activated' : 'suspended'} successfully!`);
      fetchOwnersList();
      if (selectedOwner?.id === owner.id) {
        // Reload details if open
        const updatedDetails = await getOwnerDetails(owner.id);
        setDetailedOwner(updatedDetails);
      }
    } catch (err) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleExtendSub = async (owner) => {
    try {
      const currentExpiry = owner.subscriptionExpires ? new Date(owner.subscriptionExpires) : new Date();
      // Add 30 days
      const newExpiry = new Date(currentExpiry.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      await overrideSubscription(owner.id, "active", newExpiry.toISOString());
      toast.success(`Subscription manually extended 30 days for ${owner.businessName || 'Owner'}!`);
      
      fetchOwnersList();
      if (selectedOwner?.id === owner.id) {
        const updatedDetails = await getOwnerDetails(owner.id);
        setDetailedOwner(updatedDetails);
      }
    } catch (err) {
      toast.error("Failed to extend subscription: " + err.message);
    }
  };

  return (
    <AdminLayout pageTitle="🏪 Owner Management">
      <Toaster position="top-center" />
      <div className="page-anim">
        {!selectedOwner ? (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 900, marginBottom: 4 }}>Owner Management</h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                {owners.length} registered business owners · {owners.filter(o => o.subscriptionStatus === "active").length} active subscriptions
              </p>
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

            {/* Table or Loader */}
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <div className="spinner" style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(232,101,10,0.1)", borderTopColor: "#E8650A", animation: "spin 1s linear infinite" }} />
              </div>
            ) : (
              <div style={{ background: "#1E1E1E", borderRadius: 18, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", height: 44 }}>
                        {["Business", "OwnerName", "City/State", "Joined On", "Subscription", "Account Status", "Actions"].map(h => (
                          <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: 1.2, textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {owners.map(owner => (
                        <tr key={owner.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "white", cursor: "pointer" }} onClick={() => setSelectedOwner(owner)}>{owner.businessName}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{owner.id}</div>
                          </td>
                          <td style={{ padding: "13px 16px", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{owner.ownerName}</td>
                          <td style={{ padding: "13px 16px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{owner.city}, {owner.state}</td>
                          <td style={{ padding: "13px 16px", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                            {new Date(owner.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "13px 16px" }}><Badge status={owner.subscriptionStatus} /></td>
                          <td style={{ padding: "13px 16px" }}>
                            <span style={{
                              background: owner.isActive ? "rgba(45,106,79,0.12)" : "rgba(192,57,43,0.12)",
                              color: owner.isActive ? "#40916C" : "#e74c3c",
                              padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase"
                            }}>
                              {owner.isActive ? "Active" : "Suspended"}
                            </span>
                          </td>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="btn-admin-primary" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => setSelectedOwner(owner)}>View</button>
                              <button className="btn-admin-primary" style={{ padding: "5px 10px", fontSize: 11, background: owner.isActive ? "#c0392b" : "#2d6a4f" }} onClick={() => handleStatusToggle(owner)}>
                                {owner.isActive ? "Suspend" : "Activate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {owners.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: "center", padding: 30, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                            No merchant accounts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <button onClick={() => setSelectedOwner(null)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 20 }}>
              ← Back to Owner List
            </button>
            
            {detailLoading || !detailedOwner ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <div className="spinner" style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(232,101,10,0.1)", borderTopColor: "#E8650A", animation: "spin 1s linear infinite" }} />
              </div>
            ) : (
              <div style={{ background: "#1E1E1E", borderRadius: 18, padding: "28px", border: "1px solid rgba(255,255,255,0.06)", maxWidth: 680 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{detailedOwner.businessName}</h2>
                  <Badge status={detailedOwner.subscriptionStatus} />
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Owner details and administrative actions.</div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                  {[
                    { label: "Owner Name", val: detailedOwner.ownerName },
                    { label: "Email Address", val: detailedOwner.email },
                    { label: "Mobile Number", val: detailedOwner.phone },
                    { label: "Location", val: `${detailedOwner.city}, ${detailedOwner.state}` },
                    { label: "Address Detail", val: detailedOwner.address || "Not Provided" },
                    { label: "Pin Code", val: detailedOwner.pincode || "Not Provided" },
                    { label: "Business Type", val: detailedOwner.businessType ? detailedOwner.businessType.toUpperCase() : "RESTURANT" },
                    { label: "Registration Date", val: new Date(detailedOwner.createdAt).toLocaleDateString() },
                    { label: "GSTIN", val: detailedOwner.gstin || "Not Provided" },
                    { label: "FSSAI License", val: detailedOwner.fssaiLicense || "Not Provided" },
                    { label: "Tables Count", val: detailedOwner.tableCount || 10 },
                    { label: "Subscription Expiry", val: detailedOwner.subscriptionExpires ? new Date(detailedOwner.subscriptionExpires).toLocaleDateString() : "Expired / None" },
                  ].map((f, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>{f.label}</div>
                      <div style={{ fontSize: 13, fontWeight: "bold", color: "white", marginTop: 4 }}>{f.val}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn-admin-primary" onClick={() => handleExtendSub(detailedOwner)}> Extend Sub (30 Days)</button>
                  <button className="btn-admin-primary" style={{ background: detailedOwner.isActive ? "#c0392b" : "#2d6a4f" }} onClick={() => handleStatusToggle(detailedOwner)}>
                    {detailedOwner.isActive ? "Suspend Account" : "Activate Account"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
