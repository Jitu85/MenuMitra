import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    loginId: '',
    password: ''
  });
  
  const [attempts, setAttempts] = useState(() => {
    return parseInt(localStorage.getItem('menumitra_admin_attempts') || '0', 10);
  });
  
  const [lockoutTime, setLockoutTime] = useState(() => {
    const lockedUntil = localStorage.getItem('menumitra_admin_locked_until');
    if (lockedUntil) {
      const remaining = Math.ceil((new Date(lockedUntil) - new Date()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            localStorage.removeItem('menumitra_admin_locked_until');
            localStorage.setItem('menumitra_admin_attempts', '0');
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTime > 0) {
      toast.error(`System locked. Try again in ${lockoutTime}s.`);
      return;
    }

    if (!formData.loginId.trim()) {
      toast.error("Operator ID is required");
      return;
    }
    if (!formData.password || formData.password.length < 4) {
      toast.error("Enter password");
      return;
    }

    const res = await login(formData.loginId.trim(), formData.password, true);
    if (res.success) {
      toast.success("Super Admin authenticated!");
      localStorage.setItem('menumitra_admin_attempts', '0');
      setAttempts(0);
      setTimeout(() => navigate('/admin/dashboard'), 1000);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('menumitra_admin_attempts', newAttempts.toString());

      if (newAttempts >= 5) {
        const lockedUntil = new Date(Date.now() + 30000); // 30 seconds lockout
        localStorage.setItem('menumitra_admin_locked_until', lockedUntil.toISOString());
        setLockoutTime(30);
        toast.error("Brute-force security activated! Locked out for 30s.");
      } else {
        toast.error(res.error || `Invalid credentials. ${5 - newAttempts} attempts remaining.`);
      }
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
          background: #111113;
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
          background: linear-gradient(135deg, #1C1C1E, #3A3A3C);
          border: 1.5px solid rgba(255,255,255,0.08);
          color: white;
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          width: 100%;
        }
        .btn-primary:not(:disabled):hover {
          background: #E8650A;
          border-color: #E8650A;
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
        <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.45)" }}>Go to <Link to="/login" style={{ color: "#E8650A", fontWeight: 700, textDecoration: "none" }}>Owner Login</Link></span>
      </div>

      <div className="auth-body" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div className="auth-card" style={{ background: "#161618", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "24px", maxWidth: "420px", width: "100%", padding: "40px", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
          
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "30px", fontWeight: 900, textAlign: "center", marginBottom: "8px" }}>Operator Portal</h2>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: "32px" }}>Authorized system administrators only. Brute force attempts lock operations and log operator metadata.</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Operator ID</label>
              <input type="text" name="loginId" value={formData.loginId} onChange={handleChange} placeholder="e.g. Jitu" required disabled={lockoutTime > 0} />
            </div>

            <div style={{ position: "relative" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Security Password</label>
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required disabled={lockoutTime > 0} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", bottom: "10px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "12px", fontWeight: 700 }} disabled={lockoutTime > 0}>
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>

            {attempts > 0 && lockoutTime === 0 && (
              <div style={{ fontSize: "11px", color: "#e74c3c", fontWeight: 700, textAlign: "center" }}>
                ⚠ Security Warnings: {attempts}/5 failed attempts.
              </div>
            )}

            {lockoutTime > 0 && (
              <div style={{ fontSize: "12px", color: "#e74c3c", fontWeight: 800, textAlign: "center", padding: "10px", background: "rgba(231,76,60,0.1)", borderRadius: "8px" }}>
                🔒 Brute Force Protection Active! Try in {lockoutTime}s.
              </div>
            )}

            <button type="submit" disabled={loading || lockoutTime > 0} className="btn-primary" style={{ marginTop: "12px" }}>
              {loading ? "Decrypting Credentials..." : lockoutTime > 0 ? "Locked" : "Verify & Open Panel"}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <Link to="/" style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", textDecoration: "none" }}>
              ← Return to Homepage
            </Link>
          </div>
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
