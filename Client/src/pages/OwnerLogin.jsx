import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast, { Toaster } from 'react-hot-toast';

export default function OwnerLogin() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!formData.password || formData.password.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    const res = await login(formData.email.trim(), formData.password);
    if (res.success) {
      toast.success("Owner logged in successfully!");
      setTimeout(() => navigate('/dashboard'), 1000);
    } else {
      toast.error(res.error || "Invalid email or password.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0F0F0F", fontFamily: "'DM Sans', sans-serif", color: "white", display: "flex", flexDirection: "column" }}>
      <Toaster position="top-center" reverseOrder={false} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input {
          width: 100%;
          padding: 12px 16px;
          background: #1F1F1F;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          outline: none;
          transition: all 0.25s ease;
        }
        input:focus {
          border-color: #E8650A;
          box-shadow: 0 0 0 3px rgba(232, 101, 10, 0.15);
        }
        .btn-primary {
          background: linear-gradient(135deg, #E8650A, #C9920A);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          width: 100%;
        }
        .btn-primary:hover {
          transform: translateY(-1.5px);
          box-shadow: 0 6px 20px rgba(232, 101, 10, 0.45);
        }
        .outline-btn {
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          background: transparent;
          color: rgba(255,255,255,0.7);
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          width: 100%;
          text-align: center;
          text-decoration: none;
          display: block;
        }
        .outline-btn:hover {
          border-color: #E8650A;
          background: rgba(232, 101, 10, 0.05);
          color: #E8650A;
        }

        /* Mobile responsive overrides */
        @media (max-width: 560px) {
          .auth-header {
            padding: 12px 16px !important;
            flex-direction: column !important;
            gap: 8px !important;
            text-align: center !important;
          }
          .auth-body {
            padding: 20px 12px !important;
          }
          .auth-card {
            padding: 24px 16px !important;
            border-radius: 16px !important;
          }
          .auth-footer {
            padding: 16px !important;
            flex-direction: column !important;
            text-align: center !important;
            gap: 8px !important;
          }
        }
      `}</style>

      {/* Top Header Bar */}
      <div className="auth-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
        <Link to="/" style={{ textDecoration: "none", color: "white", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "24px" }}>🍽️</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "20px" }}>MenuMitra</span>
        </Link>
        <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.45)" }}>New to MenuMitra? <Link to="/signup" style={{ color: "#E8650A", fontWeight: 700, textDecoration: "none" }}>Sign Up</Link></span>
      </div>

      <div className="auth-body" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div className="auth-card" style={{ background: "#1A1A1A", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "24px", maxWidth: "420px", width: "100%", padding: "40px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
          
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 900, textAlign: "center", marginBottom: "8px" }}>Owner Login</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", textAlign: "center", marginBottom: "32px" }}>Access your restaurant dashboard, orders feed, and digital menu controls.</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="owner@gmail.com" required />
            </div>

            <div style={{ position: "relative" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Password</label>
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", bottom: "10px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: "12px" }}>
              {loading ? "Authenticating..." : "Login to Dashboard"}
            </button>
          </form>

          <div style={{ margin: "24px 0 16px", height: "1px", background: "rgba(255,255,255,0.06)", position: "relative", textAlign: "center" }}>
            <span style={{ position: "absolute", top: "-9px", left: "50%", transform: "translateX(-50%)", background: "#1A1A1A", padding: "0 10px", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>ADMINISTRATION Access</span>
          </div>

          <Link to="/admin/login" className="outline-btn">
            Platform Operator Login
          </Link>
        </div>
      </div>

      {/* Developer credit footer */}
      <div className="auth-footer" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
        <span>© 2026 MenuMitra · All Rights Reserved</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>Developed by</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, color: "rgba(255,255,255,0.6)" }}>Abhijit Kumar Misra</span>
        </div>
      </div>
    </div>
  );
}
