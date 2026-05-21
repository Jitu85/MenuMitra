import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminLayout({ children, pageTitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: "/admin/dashboard", icon: "📊", label: "Dashboard" },
    { to: "/admin/owners", icon: "🏪", label: "Owner Management" },
    { to: "/admin/audit", icon: "📋", label: "Audit Logs" },
    { to: "/admin/plans", icon: "💳", label: "Subscription Plans" },
    { to: "/admin/resets", icon: "🔑", label: "Password Resets" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#111", fontFamily: "'DM Sans',sans-serif", color: "white" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 12px;
          margin-bottom: 4px;
          border-radius: 12px;
          cursor: pointer;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.55);
          font-weight: 500;
          font-size: 13px;
          transition: all 0.2s;
        }
        .admin-nav-link:hover {
          background: rgba(255, 255, 255, 0.06);
          color: white;
        }
        .admin-nav-link.active {
          background: rgba(232, 101, 10, 0.15) !important;
          color: #E8650A !important;
          font-weight: 700;
        }
        .admin-card {
          background: #1E1E1E;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
        }
        .btn-admin-primary {
          background: linear-gradient(135deg, #E8650A, #C9920A);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 11px 22px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .btn-admin-primary:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 230 : 70, flexShrink: 0,
        background: "#141414", borderRight: "1px solid rgba(255, 255, 255, 0.06)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        overflow: "hidden", position: "sticky", top: 0, height: "100vh", zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ padding: "22px 18px 16px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #E8650A, #C9920A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🍽️</div>
          {sidebarOpen && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 16, color: "white", whiteSpace: "nowrap" }}>MenuMitra</div>
              <div style={{ fontSize: 8, color: "#E8650A", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* Super Admin Info */}
        {sidebarOpen && (
          <div style={{ margin: "12px 14px", background: "rgba(232, 101, 10, 0.1)", border: "1px solid rgba(232, 101, 10, 0.2)", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", marginBottom: 2 }}>🔐 Super Admin</div>
            <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.35)" }}>Abhijit Kumar Misra</div>
            <div style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.2)", marginTop: 1 }}>ID: Jitu</div>
          </div>
        )}

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "8px 10px", overflowY: "auto" }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className="admin-nav-link" end={item.to === "/admin/dashboard"}>
              <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <div className="admin-nav-link" onClick={() => setSidebarOpen(v => !v)} style={{ margin: 0 }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>{sidebarOpen ? "◀" : "▶"}</span>
            {sidebarOpen && <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.3)", fontWeight: 500 }}>Collapse</span>}
          </div>
          <div className="admin-nav-link" onClick={handleLogout} style={{ margin: "6px 0 0", color: "#e74c3c" }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>🚪</span>
            {sidebarOpen && <span style={{ fontSize: 12, color: "#e74c3c", fontWeight: "bold" }}>Sign Out</span>}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ background: "#141414", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.3)", fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>
              MenuMitra Admin · {pageTitle}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.2)" }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#40916C", boxShadow: "0 0 0 3px rgba(64,145,108,0.2)" }}/>
            <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.35)", fontWeight: 600 }}>System Online</span>
          </div>
        </div>

        {/* Dynamic Page Content */}
        <div style={{ padding: "28px", minHeight: "calc(100vh - 120px)" }}>
          {children}
        </div>

        {/* Consistent Footer */}
        <footer style={{ textAlign: "center", padding: "18px 24px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", fontSize: 11, color: "rgba(255, 255, 255, 0.2)" }}>
          ✦ Developed by <strong style={{ color: "#E8650A" }}>Abhijit Kumar Misra</strong> · MenuMitra Admin Portal · © 2026
        </footer>
      </main>
    </div>
  );
}
