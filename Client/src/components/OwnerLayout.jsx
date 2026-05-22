import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function OwnerLayout({ children, pageTitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fallback info if user is not fully loaded
  const businessName = user?.businessName || "Sharma's Dhaba";
  const city = user?.city || "Patna";
  const state = user?.state || "Bihar";
  const slug = user?.slug || "sharmas-dhaba-patna";
  const subscriptionExpires = user?.subscriptionExpires || "2026-06-12";

  const daysLeft = Math.max(0, Math.ceil((new Date(subscriptionExpires) - new Date()) / (1000 * 60 * 60 * 24)));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: "/dashboard", icon: "📊", label: "Dashboard" },
    { to: "/dashboard/menu", icon: "🍽️", label: "Menu Management" },
    { to: "/dashboard/orders", icon: "📦", label: "Orders" },
    { to: "/dashboard/qr", icon: "📲", label: "My QR Code" },
    { to: "/dashboard/analytics", icon: "📈", label: "Analytics" },
    { to: "/dashboard/payments", icon: "💳", label: "Payment Settings" },
    { to: "/dashboard/subscription", icon: "💎", label: "Subscription" },
    { to: "/dashboard/settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F5EFE8", fontFamily: "'DM Sans',sans-serif", color: "#1A1A1A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-link-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 11px;
          margin-bottom: 3px;
          border-radius: 12px;
          cursor: pointer;
          text-decoration: none;
          color: #666;
          font-weight: 500;
          font-size: 13px;
          transition: all 0.2s;
        }
        .nav-link-item:hover {
          background: rgba(232, 101, 10, 0.08);
          color: #E8650A;
        }
        .nav-link-item.active {
          background: rgba(232, 101, 10, 0.12) !important;
          color: #E8650A !important;
          font-weight: 700;
        }
        .card {
          background: white;
          border-radius: 18px;
          border: 1px solid rgba(232, 101, 10, 0.08);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
        }
        .btn-primary {
          background: linear-gradient(135deg, #E8650A, #C9920A);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 11px 22px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(232, 101, 10, 0.35);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(232, 101, 10, 0.45);
        }
        .btn-ghost {
          background: transparent;
          color: #E8650A;
          border: 2px solid #E8650A;
          border-radius: 50px;
          padding: 9px 18px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .btn-ghost:hover {
          background: #E8650A;
          color: white;
        }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 230 : 68, flexShrink: 0,
        background: "white", borderRight: "1px solid rgba(232, 101, 10, 0.1)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        overflow: "hidden", position: "sticky", top: 0, height: "100vh", zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid #f0e8df", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #E8650A, #C9920A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🍽️</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 16, color: "#1A1A1A", whiteSpace: "nowrap" }}>MenuMitra</div>
              <div style={{ fontSize: 8, color: "#E8650A", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Owner Portal</div>
            </div>
          )}
        </div>

        {/* Business Info Banner */}
        {sidebarOpen && (
          <div style={{ margin: "10px 12px", background: "linear-gradient(135deg, rgba(232, 101, 10, 0.08), rgba(201, 146, 10, 0.06))", border: "1px solid rgba(232, 101, 10, 0.15)", borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#1A1A1A", marginBottom: 1 }}>{businessName}</div>
            <div style={{ fontSize: 10, color: "#E8650A", fontWeight: 600, marginBottom: 4 }}>{city}, {state}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2D6A4F" }}/>
              <span style={{ fontSize: 10, color: "#2D6A4F", fontWeight: 700 }}>Active · {daysLeft} days left</span>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "8px 10px", overflowY: "auto" }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className="nav-link-item" end={item.to === "/dashboard"}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls */}
        <div style={{ padding: "10px", borderTop: "1px solid #f0e8df" }}>
          <div className="nav-link-item" onClick={() => setSidebarOpen(v => !v)} style={{ margin: 0 }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>{sidebarOpen ? "◀" : "▶"}</span>
            {sidebarOpen && <span style={{ fontSize: 11, color: "#bbb" }}>Collapse</span>}
          </div>
          <div className="nav-link-item" onClick={handleLogout} style={{ margin: "4px 0 0", color: "#c0392b" }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>🚪</span>
            {sidebarOpen && <span style={{ fontSize: 11, fontWeight: "bold" }}>Sign Out</span>}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ background: "white", borderBottom: "1px solid #f0e8df", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 12px rgba(0, 0, 0, 0.04)" }}>
          <div>
            <div style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, marginBottom: 1 }}>
              {pageTitle}
            </div>
            <div style={{ fontSize: 12, color: "#ccc" }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "rgba(45, 106, 79, 0.08)", border: "1px solid rgba(45, 106, 79, 0.2)", borderRadius: 20, padding: "5px 12px", display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2D6A4F" }}/>
              <span style={{ fontSize: 11, color: "#2D6A4F", fontWeight: 700 }}>Active · {daysLeft} days</span>
            </div>
            <Link to={`/menu/${slug}`} target="_blank" rel="noreferrer"
              style={{ fontSize: 12, color: "#E8650A", fontWeight: 700, textDecoration: "none", background: "rgba(232, 101, 10, 0.08)", borderRadius: 20, padding: "5px 12px" }}>
              🔗 Live Menu View
            </Link>
          </div>
        </div>

        {/* Dynamic Page Content */}
        <div style={{ padding: "24px", minHeight: "calc(100vh - 120px)" }}>
          {children}
        </div>

        {/* Consistent Footer */}
        <footer style={{ textAlign: "center", padding: "18px 24px", borderTop: "1px solid #f0e8df", fontSize: 11, color: "#ccc" }}>
          ✦ Developed by <strong style={{ color: "#E8650A" }}>Abhijit Kumar Misra</strong> · MenuMitra Owner Portal · © 2026
        </footer>
      </main>
    </div>
  );
}
