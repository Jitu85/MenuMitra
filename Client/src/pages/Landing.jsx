import { Link } from 'react-router-dom';

export default function Landing() {

  const content = {
    welcome: "Welcome to MenuMitra",
    welcomeSub: "Scan. Order. Pay. Seamlessly.",
    heroDesc: "Empower your restaurant, hotel, café, tea stall, or dhaba with a touchless digital menu. Generate a dynamic QR code, let guests order directly from their phone, and print thermal receipts with zero commissions.",
    ctaOwnerLogin: "Owner Login",
    ctaAdminLogin: "Admin Login",
    ctaSignUp: "Create Free Account",
    howItWorks: "How It Works",
    step1Title: "1. Place QRs",
    step1Desc: "Place your unique generated QR codes on tables, guest rooms, or billing counters.",
    step2Title: "2. Customers Scan & Order",
    step2Desc: "Guests scan with any smartphone, view your beautiful digital menu, and place orders directly.",
    step3Title: "3. Direct Instant Payment",
    step3Desc: "Receive payments directly into your account via custom UPI QR or secure live Razorpay.",
    featuresTitle: "Why Choose MenuMitra?",
    feat1Title: "Beautiful Digital Menus",
    feat1Desc: "Provide an elegant, touchless browsing experience for all your guests on any device.",
    feat2Title: "Instant Socket Alerts",
    feat2Desc: "Owner dashboards receive order placement alerts in real-time.",
    feat3Title: "Headerless Puppeteer Printing",
    feat3Desc: "Print beautifully formatted order slips directly onto 58mm/80mm thermal printers.",
    feat4Title: "Zero Commissions — Ever",
    feat4Desc: "All earnings are yours. No third-party aggregators cutting into your hard-earned margins.",
    pricingTitle: "Simple, Transparent Pricing",
    planName: "MenuMitra Standard",
    planPrice: "₹100/month",
    trialText: "First 30 Days Free Trial",
    planDesc: "Everything you need to digitalize and automate your food outlet operations.",
  };

  const t = content;

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundImage: "linear-gradient(rgba(15, 15, 15, 0.82), rgba(15, 15, 15, 0.90)), url('/Background.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      fontFamily: "'DM Sans', sans-serif", 
      color: "white", 
      overflowX: "hidden" 
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes floatPulse {
          0% { transform: translateY(0); box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
          50% { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(232, 101, 10, 0.4); }
          100% { transform: translateY(0); box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
        }

        .animate-fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0; /* Starts hidden, animation fills forwards */
        }
        
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }

        .glow-btn {
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #E8650A, #C9920A);
          box-shadow: 0 4px 15px rgba(232, 101, 10, 0.4);
        }
        .glow-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(232, 101, 10, 0.6);
        }
        .outline-btn {
          transition: all 0.3s ease;
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          background: transparent;
        }
        .outline-btn:hover {
          border-color: #E8650A;
          background: rgba(232, 101, 10, 0.05);
          color: #E8650A;
        }
        .card {
          background: #1A1A1A;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          transition: all 0.3s ease;
        }
        .card:hover {
          transform: translateY(-4px);
          border-color: rgba(232, 101, 10, 0.3);
          box-shadow: 0 12px 30px rgba(0,0,0,0.4);
        }
        
        .floater {
          animation: floatPulse 4s ease-in-out infinite;
        }

        /* Mobile Layout Optimizations */
        @media (max-width: 768px) {
          .nav-container {
            padding: 12px 16px !important;
            flex-direction: column !important;
            gap: 12px !important;
            position: relative !important;
          }
          
          .nav-logo-text {
            font-size: 20px !important;
          }
          
          .nav-actions {
            width: 100% !important;
            justify-content: center !important;
            gap: 8px !important;
            flex-wrap: wrap !important;
          }
          
          .nav-actions a, .nav-actions button {
            padding: 6px 12px !important;
            font-size: 11px !important;
          }

          .hero-container {
            padding: 40px 16px !important;
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            text-align: center !important;
          }
          
          .hero-title {
            font-size: 32px !important;
            line-height: 1.2 !important;
          }
          
          .hero-buttons {
            justify-content: center !important;
          }

          .graphic-floater-1, .graphic-floater-2 {
            display: none !important;
          }
          
          .graphic-wrapper {
            margin-top: 20px !important;
          }

          .graphic-phone {
            width: 280px !important;
            height: 500px !important;
          }

          .section-padding {
            padding: 40px 16px !important;
          }
          
          .footer-container {
            padding: 20px !important;
            flex-direction: column !important;
            text-align: center !important;
            gap: 16px !important;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className="nav-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", background: "#002236", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "28px" }}>🍽️</span>
          <div>
            <span className="nav-logo-text" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "24px", color: "white" }}>MenuMitra</span>
            <div style={{ fontSize: "8px", color: "#E8650A", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Scan · Order · Pay</div>
          </div>
        </div>

        <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link to="/login" className="outline-btn" style={{ padding: "8px 18px", borderRadius: "50px", textDecoration: "none", color: "white", fontSize: "13px", fontWeight: 700 }}>
            {t.ctaOwnerLogin}
          </Link>
          <Link to="/admin/login" className="outline-btn" style={{ padding: "8px 18px", borderRadius: "50px", textDecoration: "none", color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 600 }}>
            {t.ctaAdminLogin}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-container" style={{ padding: "80px 40px", maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
        <div className="animate-fade-up">
          <span style={{ color: "#E8650A", fontWeight: 800, letterSpacing: 1.5, fontSize: "13px", textTransform: "uppercase" }}>✦ {t.welcomeSub}</span>
          <h1 className="hero-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "52px", fontWeight: 900, lineHeight: 1.1, margin: "16px 0 24px", background: "linear-gradient(to right, #ffffff, #f0e8df)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {t.welcome}
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.65)", lineHeight: 1.7, marginBottom: "36px" }}>
            {t.heroDesc}
          </p>
          <div className="hero-buttons" style={{ display: "flex", gap: 16 }}>
            <Link to="/signup" className="glow-btn" style={{ padding: "14px 28px", borderRadius: "50px", textDecoration: "none", color: "white", fontSize: "15px", fontWeight: 800 }}>
              {t.ctaSignUp}
            </Link>
            <Link to="/login" className="outline-btn" style={{ padding: "14px 28px", borderRadius: "50px", textDecoration: "none", color: "white", fontSize: "15px", fontWeight: 800 }}>
              {t.ctaOwnerLogin}
            </Link>
          </div>
        </div>

        {/* Dynamic Graphic Mockup */}
        <div className="graphic-wrapper animate-fade-up delay-1" style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="graphic-phone" style={{ width: "320px", height: "580px", borderRadius: "40px", border: "12px solid #2A2A2E", background: "#1C1C1E", boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 80px rgba(232, 101, 10, 0.15)", overflow: "hidden", position: "relative" }}>
            {/* Phone notch */}
            <div style={{ width: "140px", height: "24px", background: "#2A2A2E", borderRadius: "0 0 15px 15px", position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}></div>
            {/* Phone screen preview */}
            <div style={{ padding: "40px 20px 20px", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Sharma's Dhaba</span>
                <span style={{ background: "rgba(45, 106, 79, 0.15)", color: "#2D6A4F", fontSize: 9, padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>OPEN</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 12, color: "#E8650A", fontWeight: 700, marginBottom: 2 }}>🔥 Popular Dishes</div>
                
                {/* Item 1: Dal Makhani */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>Dal Makhani</div>
                    <div style={{ fontSize: 10, color: "#888" }}>₹180 · Veg</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(232, 101, 10, 0.15)", borderRadius: 15, padding: "2px 8px", border: "1px solid rgba(232, 101, 10, 0.4)" }}>
                    <span style={{ fontSize: 10, color: "#E8650A", fontWeight: "bold", cursor: "pointer" }}>−</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "white" }}>1</span>
                    <span style={{ fontSize: 10, color: "#E8650A", fontWeight: "bold", cursor: "pointer" }}>+</span>
                  </div>
                </div>

                {/* Item 2: Paneer Butter Masala */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>Paneer Butter Masala</div>
                    <div style={{ fontSize: 10, color: "#888" }}>₹220 · Veg</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(232, 101, 10, 0.15)", borderRadius: 15, padding: "2px 8px", border: "1px solid rgba(232, 101, 10, 0.4)" }}>
                    <span style={{ fontSize: 10, color: "#E8650A", fontWeight: "bold", cursor: "pointer" }}>−</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "white" }}>1</span>
                    <span style={{ fontSize: 10, color: "#E8650A", fontWeight: "bold", cursor: "pointer" }}>+</span>
                  </div>
                </div>

                {/* Item 3: Butter Naan */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>Butter Naan</div>
                    <div style={{ fontSize: 10, color: "#888" }}>₹40 · Veg</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(232, 101, 10, 0.15)", borderRadius: 15, padding: "2px 8px", border: "1px solid rgba(232, 101, 10, 0.4)" }}>
                    <span style={{ fontSize: 10, color: "#E8650A", fontWeight: "bold", cursor: "pointer" }}>−</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "white" }}>2</span>
                    <span style={{ fontSize: 10, color: "#E8650A", fontWeight: "bold", cursor: "pointer" }}>+</span>
                  </div>
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", marginTop: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
                  <span>Total (4 items)</span>
                  <span style={{ fontWeight: 700 }}>₹480</span>
                </div>
                <button style={{ width: "100%", background: "linear-gradient(135deg, #E8650A, #C9920A)", border: "none", color: "white", padding: 8, borderRadius: 8, fontSize: 11, fontWeight: 800 }}>Confirm Order & Pay</button>
              </div>
            </div>
          </div>

          {/* Floaters */}
          <div className="graphic-floater-1 floater" style={{ position: "absolute", top: "10%", right: "-20px", background: "rgba(45, 106, 79, 0.9)", border: "1px solid rgba(45, 106, 79, 0.4)", borderRadius: "12px", padding: "10px 14px", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.3)", zIndex: 20 }}>
            🟢 Live Order Alert
          </div>
          <div className="graphic-floater-2 floater" style={{ position: "absolute", bottom: "15%", left: "-40px", background: "rgba(232, 101, 10, 0.9)", border: "1px solid rgba(232, 101, 10, 0.4)", borderRadius: "12px", padding: "10px 14px", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.3)", zIndex: 20 }}>
            ⚡ Instant UPI Payment
          </div>
        </div>
      </header>

      {/* How it works */}
      <section className="section-padding" style={{ padding: "80px 40px", background: "rgba(10, 10, 10, 0.4)", backdropFilter: "blur(4px)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 className="animate-fade-up" style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 900, textAlign: "center", marginBottom: "48px" }}>
            {t.howItWorks}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              { title: t.step1Title, desc: t.step1Desc, icon: "📲" },
              { title: t.step2Title, desc: t.step2Desc, icon: "🍽️" },
              { title: t.step3Title, desc: t.step3Desc, icon: "💳" }
            ].map((step, idx) => (
              <div key={idx} className={`card animate-fade-up delay-${idx+1}`} style={{ padding: "32px" }}>
                <span style={{ fontSize: "32px", display: "block", marginBottom: "16px" }}>{step.icon}</span>
                <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "8px" }}>{step.title}</h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding" style={{ padding: "80px 40px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 className="animate-fade-up" style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 900, textAlign: "center", marginBottom: "48px" }}>
          {t.featuresTitle}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
          {[
            { title: t.feat1Title, desc: t.feat1Desc, icon: "✨" },
            { title: t.feat2Title, desc: t.feat2Desc, icon: "🔔" },
            { title: t.feat3Title, desc: t.feat3Desc, icon: "🖨️" },
            { title: t.feat4Title, desc: t.feat4Desc, icon: "💰" }
          ].map((feat, idx) => (
            <div key={idx} className={`card animate-fade-up delay-${(idx % 4) + 1}`} style={{ padding: "28px" }}>
              <div style={{ fontSize: "24px", color: "#E8650A", marginBottom: "14px" }}>{feat.icon}</div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "6px" }}>{feat.title}</h3>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="section-padding" style={{ padding: "80px 40px", background: "rgba(10, 10, 10, 0.4)", backdropFilter: "blur(4px)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 className="animate-fade-up" style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 900, textAlign: "center", marginBottom: "48px" }}>
            {t.pricingTitle}
          </h2>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="card animate-fade-up delay-1" style={{ padding: "40px", maxWidth: "460px", width: "100%", border: "2px solid #E8650A", position: "relative" }}>
              <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #E8650A, #C9920A)", color: "white", padding: "4px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: 800 }}>
                {t.trialText}
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, textAlign: "center", marginBottom: "8px" }}>{t.planName}</h3>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "38px", fontWeight: 900, textAlign: "center", color: "#E8650A", margin: "16px 0" }}>
                {t.planPrice}
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.6, marginBottom: "28px" }}>
                {t.planDesc}
              </p>
              <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", marginBottom: "24px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "32px" }}>
                {[
                  "Unlimited menu items & categories",
                  "Elegant, blazing-fast customer menu",
                  "Unique QR code for download & sharing",
                  "Direct UPI QR or Razorpay integration",
                  "Server-side PDF receipt printing via Puppeteer",
                  "Zero delivery commission or platform cut",
                ].map((f, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 8, fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                    <span style={{ color: "#E8650A", fontWeight: "bold" }}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/signup" className="glow-btn" style={{ display: "block", textAlign: "center", padding: "14px", borderRadius: "50px", textDecoration: "none", color: "white", fontSize: "14px", fontWeight: 800 }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div style={{ background: "#002236", borderTop: "1px solid rgba(255, 255, 255, 0.08)", color: "white", marginTop: "40px" }}>
        <footer className="footer-container" style={{ padding: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "22px" }}>🍽️</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "18px", color: "white" }}>MenuMitra</span>
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)" }}>
            © 2026 MenuMitra · All Rights Reserved
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "6px 16px", borderRadius: "50px" }}>
            <span style={{ color: "#E8650A" }}>✦</span>
            <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.65)", fontWeight: 500 }}>Designed & Developed by</span>
            <span style={{ fontSize: "13px", fontFamily: "'Playfair Display', serif", fontWeight: 900, color: "#E8650A" }}>Abhijit Kumar Misra</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
