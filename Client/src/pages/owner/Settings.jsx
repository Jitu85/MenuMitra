import React, { useState } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import toast, { Toaster } from 'react-hot-toast';

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
  const [profile, setProfile] = useState({
    businessName: "Sharma's Dhaba",
    ownerName: "Ramesh Sharma",
    email: "ramesh@sharma.com",
    phone: "9876543210",
    city: "Patna",
    state: "Bihar",
    tableCount: 12,
  });

  const [pwForm, setPwForm] = useState({
    current: "",
    newPw: "",
    confirm: "",
  });

  const handleProfileSave = () => {
    toast.success("✅ Profile settings saved successfully.");
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
              { label: "Email Address", key: "email" },
              { label: "Mobile Number", key: "phone" },
              { label: "City", key: "city" },
              { label: "State", key: "state" },
            ].map((f, i) => (
              <div key={i}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#666", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</label>
                <input value={profile[f.key]} onChange={e => setProfile({ ...profile, [f.key]: e.target.value })} style={inputStyle} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#666", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>Number of Tables</label>
            <select value={profile.tableCount} onChange={e => setProfile({ ...profile, tableCount: Number(e.target.value) })} style={{ ...selectStyle, width: 200 }}>
              {Array.from({ length: 50 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} tables</option>)}
            </select>
          </div>
          <button className="btn-primary" style={{ marginTop: 18 }} onClick={handleProfileSave}>💾 Save Profile</button>
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
