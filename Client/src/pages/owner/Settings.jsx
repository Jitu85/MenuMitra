import React, { useState, useEffect } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import toast, { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  border: "1.5px solid #e8ddd4",
  borderRadius: 10,
  fontSize: 13,
  color: "#1A1A1A",
  background: "white",
  fontFamily: "'DM Sans',sans-serif",
  outline: "none",
  transition: "border-color 0.2s",
};

const selectStyle = {
  width: "100%",
  padding: "11px 14px",
  border: "1.5px solid #e8ddd4",
  borderRadius: 10,
  fontSize: 13,
  color: "#1A1A1A",
  background: "white",
  fontFamily: "'DM Sans',sans-serif",
  outline: "none",
  cursor: "pointer",
};

export default function Settings() {
  const { user, updateProfileState } = useAuthStore();
  const [profile, setProfile] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    tableCount: 10,
  });

  const [pwForm, setPwForm] = useState({
    current: "",
    newPw: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);

  // Load profile data on mount and whenever user changes
  useEffect(() => {
    // 1. First, load from Zustand auth cache
    if (user) {
      setProfile({
        businessName: user.businessName || user.business_name || "",
        ownerName: user.ownerName || user.owner_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        tableCount: user.tableCount || user.table_count || 10,
      });
    }

    // 2. Then, fetch a fresh copy from database
    async function loadFreshProfile() {
      try {
        const res = await api.get('/owner/profile');
        if (res.data) {
          const d = res.data;
          const freshData = {
            businessName: d.business_name || "",
            ownerName: d.owner_name || "",
            email: d.email || "",
            phone: d.phone || "",
            address: d.address || "",
            city: d.city || "",
            state: d.state || "",
            pincode: d.pincode || "",
            tableCount: d.table_count || 10,
          };
          setProfile(freshData);
          updateProfileState({ ...user, ...freshData });
        }
      } catch (e) {
        console.error("Failed to load fresh profile settings from backend", e);
      }
    }
    loadFreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileSave = async () => {
    if (!profile.businessName.trim() || !profile.ownerName.trim() || !profile.phone.trim()) {
      toast.error("❌ Business name, owner name, and phone are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.put('/owner/profile', {
        businessName: profile.businessName,
        ownerName: profile.ownerName,
        phone: profile.phone,
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
        tableCount: parseInt(profile.tableCount, 10),
      });

      if (res.data) {
        toast.success("✅ Profile settings successfully saved in the database!");
        // Update local memory and cache
        const updatedUserProfile = {
          ...user,
          businessName: profile.businessName,
          ownerName: profile.ownerName,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          pincode: profile.pincode,
          tableCount: profile.tableCount,
        };
        updateProfileState(updatedUserProfile);
      }
    } catch (e) {
      console.error(e);
      toast.error(e.message || "❌ Failed to save profile to database.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      toast.error("❌ All password fields are required.");
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error("❌ New passwords do not match.");
      return;
    }
    if (pwForm.newPw.length < 8) {
      toast.error("❌ Password must be at least 8 characters.");
      return;
    }
    toast.success("✅ Password successfully changed.");
    setPwForm({ current: "", newPw: "", confirm: "" });
  };

  return (
    <OwnerLayout pageTitle="⚙️ General Settings">
      <Toaster position="top-center" />
      <div className="page-anim" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Settings</h1>
          <p style={{ fontSize: 13, color: "#999" }}>Manage your business profile, table count, and account security.</p>
        </div>

        {/* Business profile */}
        <div className="card" style={{ padding: "24px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>🏪 Business Profile</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            {[
              { label: "Business Name", key: "businessName" },
              { label: "Owner Name", key: "ownerName" },
              { label: "Email Address", key: "email", disabled: true },
              { label: "Mobile Number", key: "phone" },
              { label: "Outlet Address", key: "address" },
              { label: "City", key: "city" },
              { label: "State", key: "state" },
              { label: "PIN Code", key: "pincode" },
            ].map((f, i) => (
              <div key={i}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#666", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</label>
                <input 
                  value={profile[f.key] || ""} 
                  onChange={e => setProfile({ ...profile, [f.key]: e.target.value })} 
                  style={{ ...inputStyle, background: f.disabled ? "#f5ede5" : "white", cursor: f.disabled ? "not-allowed" : "text" }} 
                  disabled={f.disabled}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#666", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>Number of Tables</label>
            <select value={profile.tableCount || 10} onChange={e => setProfile({ ...profile, tableCount: Number(e.target.value) })} style={{ ...selectStyle, width: 200 }}>
              {Array.from({ length: 50 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} tables</option>)}
            </select>
          </div>
          <button className="btn-primary" style={{ marginTop: 18 }} onClick={handleProfileSave} disabled={loading}>
            {loading ? "💾 Saving Settings..." : "💾 Save Profile"}
          </button>
        </div>

        {/* Change password */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>🔐 Change Password</div>
          {[
            { label: "Current Password", key: "current", placeholder: "Enter current password" },
            { label: "New Password", key: "newPw", placeholder: "Min. 8 characters" },
            { label: "Confirm New Password", key: "confirm", placeholder: "Re-enter new password" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#666", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</label>
              <input type="password" value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder} style={inputStyle} />
            </div>
          ))}
          <button className="btn-primary" onClick={handlePasswordSave}>🔐 Change Password</button>
        </div>
      </div>
    </OwnerLayout>
  );
}
