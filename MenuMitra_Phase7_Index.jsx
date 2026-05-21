import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  MenuMitra — Master Application Index
//  Developed by Abhijit Kumar Misra
//  This file is the single entry point that routes between all modules.
//  In production this uses React Router v6 with protected routes.
// ─────────────────────────────────────────────────────────────────────────────

// ── Role & Route Map ──────────────────────────────────────────────────────────
//
//  PUBLIC  (no auth)
//  /                        → Landing Page
//  /signup                  → Owner Sign Up
//  /login                   → Owner Login
//  /admin/login             → Admin Login
//  /menu/:slug              → Customer Menu Page (no login required)
//
//  OWNER   (JWT protected — role: owner)
//  /dashboard               → Owner Dashboard
//  /dashboard/menu          → Menu Management
//  /dashboard/orders        → Orders
//  /dashboard/qr            → My QR Code
//  /dashboard/analytics     → Analytics
//  /dashboard/payments      → Payment Settings
//  /dashboard/subscription  → Subscription
//  /dashboard/settings      → Settings
//
//  ADMIN   (JWT protected — role: admin, separate token)
//  /admin/dashboard         → Admin Dashboard
//  /admin/owners            → Owner Management
//  /admin/owners/:id        → Owner Detail
//  /admin/audit             → Audit Logs
//  /admin/plans             → Subscription Plans
//  /admin/resets            → Password Resets
//
// ─────────────────────────────────────────────────────────────────────────────

const ALL_SCREENS = [
  // ── Public ──
  { id:"landing",      label:"🏠 Landing Page",          role:"public",  desc:"Home page with hero, features, pricing and 3 CTA buttons." },
  { id:"signup",       label:"📝 Owner Sign Up",          role:"public",  desc:"4-step business registration form with all dropdowns and validation." },
  { id:"ownerLogin",   label:"🔑 Owner Login",            role:"public",  desc:"Owner login with forgot password and reset link flow." },
  { id:"adminLogin",   label:"🔒 Admin Login",            role:"public",  desc:"Restricted admin login with 5-attempt lockout and audit logging." },
  { id:"customerMenu", label:"📱 Customer Menu",          role:"public",  desc:"QR scan → bilingual menu → cart → table selection → payment → confirmation." },
  // ── Owner ──
  { id:"ownerDash",    label:"📊 Owner Dashboard",        role:"owner",   desc:"Sales stats, revenue charts, top items, recent orders, subscription status." },
  { id:"menuMgmt",     label:"🍽️ Menu Management",        role:"owner",   desc:"Category + item CRUD, photo upload, veg badge, availability toggle." },
  { id:"orders",       label:"📦 Orders",                 role:"owner",   desc:"All orders with expand, filter, mark paid, print receipt, export CSV." },
  { id:"qrCode",       label:"📲 My QR Code",             role:"owner",   desc:"QR display, download PNG, copy link, stats, placement tips." },
  { id:"analytics",    label:"📈 Analytics",              role:"owner",   desc:"Revenue bar chart, item-wise sales table, payment split donut, export." },
  { id:"payments",     label:"💳 Payment Settings",       role:"owner",   desc:"UPI QR upload, UPI ID, Razorpay keys, payment preference toggle." },
  { id:"subscription", label:"💳 Subscription",           role:"owner",   desc:"Plan status, Razorpay checkout, payment history, renewal, expiry states." },
  { id:"settings",     label:"⚙️ Settings",               role:"owner",   desc:"Profile edit, table count, change password, subscription details." },
  // ── Admin ──
  { id:"adminDash",    label:"📊 Admin Dashboard",        role:"admin",   desc:"Platform stats, signup trend, subscription donut, revenue chart, audit feed." },
  { id:"ownerMgmt",    label:"🏪 Owner Management",       role:"admin",   desc:"Searchable owner table, filter, sort, view detail, suspend, activate." },
  { id:"ownerDetail",  label:"👤 Owner Detail",           role:"admin",   desc:"Full owner profile, subscription, stats, force reset, extend, suspend." },
  { id:"auditLogs",    label:"📋 Audit Logs",             role:"admin",   desc:"Chronological log of all system actions with filters and CSV export." },
  { id:"plansMgmt",    label:"💰 Plan Management",        role:"admin",   desc:"Edit plan name, price, trial days. Warnings before saving." },
  { id:"pwResets",     label:"🔑 Password Resets",        role:"admin",   desc:"Force password reset for any owner. Full reset audit history." },
  // ── System ──
  { id:"printNotify",  label:"🖨️ Print + Notifications",  role:"system",  desc:"Owner live order feed, 4-digit code, print modal, PDF export, order status." },
];

const ROLE_COLORS = {
  public: { bg:"rgba(45,106,79,0.1)",  color:"#2D6A4F",  label:"Public"  },
  owner:  { bg:"rgba(232,101,10,0.1)", color:"#E8650A",  label:"Owner"   },
  admin:  { bg:"rgba(26,26,26,0.1)",   color:"#1A1A1A",  label:"Admin"   },
  system: { bg:"rgba(41,128,185,0.1)", color:"#2980b9",  label:"System"  },
};

const BUILD_STATUS = {
  landing:      "complete", signup:      "complete", ownerLogin:  "complete",
  adminLogin:   "complete", customerMenu:"complete", ownerDash:   "complete",
  menuMgmt:     "complete", orders:      "complete", qrCode:      "complete",
  analytics:    "complete", payments:    "complete", subscription:"complete",
  settings:     "complete", adminDash:   "complete", ownerMgmt:   "complete",
  ownerDetail:  "complete", auditLogs:   "complete", plansMgmt:   "complete",
  pwResets:     "complete", printNotify: "complete",
};

const PHASE_MAP = {
  landing:1, signup:1, ownerLogin:1, adminLogin:1,
  adminDash:2, ownerMgmt:2, ownerDetail:2, auditLogs:2, plansMgmt:2, pwResets:2,
  ownerDash:3, menuMgmt:3, orders:3, qrCode:3, analytics:3, payments:3, settings:3,
  customerMenu:4,
  printNotify:5,
  subscription:6,
};

export default function MenuMitraIndex() {
  const [filterRole, setFilterRole] = useState("all");
  const [hovered, setHovered] = useState(null);

  const filtered = ALL_SCREENS.filter(s => filterRole === "all" || s.role === filterRole);
  const complete  = ALL_SCREENS.filter(s => BUILD_STATUS[s.id] === "complete").length;
  const total     = ALL_SCREENS.length;

  return (
    <div style={{ minHeight:"100vh", background:"#0F0F0F", fontFamily:"'DM Sans',sans-serif", color:"white" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center}100%{background-position:-200% center} }
        .screen-card { transition:all 0.25s; border-radius:16px; cursor:default; }
        .screen-card:hover { transform:translateY(-4px); box-shadow:0 20px 50px rgba(0,0,0,0.5)!important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"28px 32px", background:"rgba(255,255,255,0.02)" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
              <div style={{ width:46, height:46, borderRadius:13, background:"linear-gradient(135deg,#E8650A,#C9920A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:"0 6px 24px rgba(232,101,10,0.45)" }}>🍽️</div>
              <div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:26, color:"white", lineHeight:1 }}>MenuMitra</div>
                <div style={{ fontSize:9, color:"#E8650A", fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginTop:2 }}>Complete Application Index</div>
              </div>
            </div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", maxWidth:520, lineHeight:1.7 }}>
              Full-stack digital menu and ordering platform for Indian hotels, restaurants, tea stalls, cafés and dhabas.
              All screens built across 7 phases — public, owner, admin and system modules.
            </p>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:11, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>Developed by</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:900, color:"#E8650A" }}>Abhijit Kumar Misra</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:4 }}>© 2026 MenuMitra · All Rights Reserved</div>
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ padding:"20px 32px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)", fontWeight:600 }}>Build Progress</span>
          <span style={{ fontSize:12, color:"#E8650A", fontWeight:800 }}>{complete}/{total} screens complete</span>
        </div>
        <div style={{ height:6, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(complete/total)*100}%`, background:"linear-gradient(90deg,#E8650A,#C9920A)", borderRadius:3, transition:"width 0.5s ease" }}/>
        </div>

        {/* Phase pills */}
        <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
          {[1,2,3,4,5,6,7].map(p => {
            const phaseScreens = ALL_SCREENS.filter(s => PHASE_MAP[s.id] === p);
            const done = phaseScreens.filter(s => BUILD_STATUS[s.id]==="complete").length;
            const isAll = done === phaseScreens.length && phaseScreens.length > 0;
            const labels = { 1:"Auth & Landing",2:"Admin Panel",3:"Owner Dashboard",4:"Customer Menu",5:"Print & Notify",6:"Subscription",7:"Integration" };
            return (
              <div key={p} style={{ padding:"6px 12px", borderRadius:20, background:isAll?"rgba(45,106,79,0.15)":p===7?"rgba(232,101,10,0.15)":"rgba(255,255,255,0.06)", border:`1px solid ${isAll?"rgba(45,106,79,0.3)":p===7?"rgba(232,101,10,0.3)":"rgba(255,255,255,0.08)"}`, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:10, fontWeight:800, color:isAll?"#40916C":p===7?"#E8650A":"rgba(255,255,255,0.4)" }}>
                  {isAll?"✓":p===7?"●":"○"} Phase {p}
                </span>
                <span style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>{labels[p]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Role filter ── */}
      <div style={{ padding:"16px 32px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontWeight:600, marginRight:4 }}>FILTER:</span>
        {[["all","All Screens"], ["public","Public"], ["owner","Owner"], ["admin","Admin"], ["system","System"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilterRole(v)}
            style={{ padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'DM Sans',sans-serif", background:filterRole===v?"#E8650A":"rgba(255,255,255,0.07)", color:filterRole===v?"white":"rgba(255,255,255,0.45)", transition:"all 0.2s" }}>
            {l}
          </button>
        ))}
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.2)", marginLeft:8 }}>
          {filtered.length} screen{filtered.length!==1?"s":""}
        </span>
      </div>

      {/* ── Screen grid ── */}
      <div style={{ padding:"24px 32px" }}>
        {["public","owner","admin","system"].filter(role => filterRole==="all" || filterRole===role).map(role => {
          const roleScreens = filtered.filter(s => s.role===role);
          if (!roleScreens.length) return null;
          const rc = ROLE_COLORS[role];
          return (
            <div key={role} style={{ marginBottom:32, animation:"fadeUp 0.4s ease both" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <span style={{ background:rc.bg, color:rc.color, borderRadius:8, padding:"4px 12px", fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:1 }}>{rc.label}</span>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>{roleScreens.length} screens</span>
                <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.05)" }}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
                {roleScreens.map((screen,i) => {
                  const status = BUILD_STATUS[screen.id];
                  const phase  = PHASE_MAP[screen.id];
                  return (
                    <div key={screen.id} className="screen-card"
                      style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${hovered===screen.id?"rgba(232,101,10,0.3)":"rgba(255,255,255,0.07)"}`, padding:"18px", animation:`fadeUp 0.4s ${i*0.05}s both`, boxShadow:"0 4px 20px rgba(0,0,0,0.2)" }}
                      onMouseEnter={()=>setHovered(screen.id)}
                      onMouseLeave={()=>setHovered(null)}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:"white", lineHeight:1.3, flex:1, marginRight:8 }}>{screen.label}</div>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                          <span style={{ fontSize:9, fontWeight:800, background:status==="complete"?"rgba(45,106,79,0.2)":"rgba(232,101,10,0.15)", color:status==="complete"?"#40916C":"#E8650A", borderRadius:6, padding:"2px 7px", letterSpacing:0.5, textTransform:"uppercase" }}>
                            {status==="complete"?"✓ Done":"Pending"}
                          </span>
                          {phase && (
                            <span style={{ fontSize:9, color:"rgba(255,255,255,0.25)", fontWeight:600 }}>Phase {phase}</span>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", lineHeight:1.65 }}>{screen.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tech stack ── */}
      <div style={{ margin:"0 32px 32px", background:"rgba(255,255,255,0.03)", borderRadius:20, border:"1px solid rgba(255,255,255,0.06)", padding:"24px", animation:"fadeUp 0.4s 0.3s both" }}>
        <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:18 }}>Technology Stack</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
          {[
            { layer:"Frontend",       tech:"React 18 + Tailwind CSS",        icon:"⚛️"  },
            { layer:"State",          tech:"Zustand + React Context",         icon:"🗃️"  },
            { layer:"Language",       tech:"i18next (EN + हिंदी)",            icon:"🌐"  },
            { layer:"Charts",         tech:"Recharts",                        icon:"📊"  },
            { layer:"Backend",        tech:"Node.js + Express.js",            icon:"⚙️"  },
            { layer:"Database",       tech:"PostgreSQL via Prisma ORM",       icon:"🗄️"  },
            { layer:"Auth",           tech:"JWT + bcrypt (role-based)",       icon:"🔐"  },
            { layer:"File Storage",   tech:"Cloudinary (photos + UPI QR)",   icon:"☁️"  },
            { layer:"Payments",       tech:"Razorpay (UPI, Cards, Wallets)",  icon:"💳"  },
            { layer:"Print",          tech:"Browser print + Thermal 58/80mm",icon:"🖨️"  },
            { layer:"Notifications",  tech:"Socket.io / SSE (real-time)",    icon:"🔔"  },
            { layer:"Email",          tech:"Nodemailer + Gmail SMTP",         icon:"📧"  },
            { layer:"Caching",        tech:"Redis (sessions, rate limits)",   icon:"⚡"  },
            { layer:"Hosting",        tech:"Vercel + Railway + Supabase",     icon:"🚀"  },
            { layer:"Monitoring",     tech:"Sentry (errors + performance)",   icon:"👁️"  },
            { layer:"PDF Export",     tech:"Puppeteer (server-side PDF)",     icon:"📄"  },
          ].map((t,i)=>(
            <div key={i} style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, padding:"12px 14px", border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:18, marginBottom:6 }}>{t.icon}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, marginBottom:2 }}>{t.layer}</div>
              <div style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.65)" }}>{t.tech}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── File manifest ── */}
      <div style={{ margin:"0 32px 32px", background:"rgba(255,255,255,0.03)", borderRadius:20, border:"1px solid rgba(255,255,255,0.06)", padding:"24px" }}>
        <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:18 }}>Deliverable File Manifest</div>
        <div style={{ display:"flex", flexDirection:"column", gap:0, fontFamily:"monospace" }}>
          {[
            { file:"MenuMitra_Project_Blueprint.md",     phase:"-", desc:"Full project plan, DB schema, API routes, 9-phase roadmap" },
            { file:"MenuMitra_Landing.jsx",              phase:"1", desc:"Landing page — hero, features, pricing, footer" },
            { file:"MenuMitra_Signup.jsx",               phase:"1", desc:"4-step owner registration form" },
            { file:"MenuMitra_OwnerLogin.jsx",           phase:"1", desc:"Owner login + forgot password flow" },
            { file:"MenuMitra_AdminLogin.jsx",           phase:"1", desc:"Admin login with 5-attempt lockout" },
            { file:"MenuMitra_AdminPanel.jsx",           phase:"2", desc:"Full admin control centre (5 sections)" },
            { file:"MenuMitra_OwnerDashboard.jsx",       phase:"3", desc:"Owner panel (7 sections incl. menu mgmt)" },
            { file:"MenuMitra_CustomerMenu.jsx",         phase:"4", desc:"Customer-facing bilingual menu + cart + payment" },
            { file:"MenuMitra_Phase5_PrintNotify.jsx",   phase:"5", desc:"4-digit code, print modal, PDF export, order feed" },
            { file:"MenuMitra_Phase6_Subscription.jsx",  phase:"6", desc:"Subscription flow, Razorpay checkout, expiry states" },
            { file:"MenuMitra_Phase7_Index.jsx",         phase:"7", desc:"Master index — routing map, tech stack, file manifest" },
          ].map((f,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:0, padding:"9px 0", borderBottom:i<10?"1px solid rgba(255,255,255,0.05)":"none" }}>
              <span style={{ fontSize:9, fontWeight:800, background:"rgba(232,101,10,0.15)", color:"#E8650A", borderRadius:6, padding:"2px 6px", marginRight:12, flexShrink:0 }}>P{f.phase}</span>
              <span style={{ fontSize:12, color:"#E8650A", minWidth:340, flexShrink:0 }}>{f.file}</span>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Super admin credentials reminder ── */}
      <div style={{ margin:"0 32px 32px", background:"rgba(232,101,10,0.06)", border:"1px solid rgba(232,101,10,0.2)", borderRadius:16, padding:"18px 22px" }}>
        <div style={{ fontSize:11, fontWeight:800, color:"#E8650A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:12 }}>🔐 Super Admin Seed Record</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
          {[
            ["Login ID",  "Jitu"],
            ["Password",  "admin123 (bcrypt-hashed in DB)"],
            ["Email",     "abhijit.jituwreath@gmail.com"],
            ["Role",      "Super Admin"],
            ["Name",      "Abhijit Kumar Misra"],
          ].map(([k,v],i)=>(
            <div key={i}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, marginBottom:2 }}>{k}</div>
              <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.7)", fontFamily:k==="Login ID"||k==="Email"?"monospace":"inherit" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:12, lineHeight:1.7 }}>
          ⚠ The plaintext password is only recorded here for handover reference. In the deployed system, the password is stored exclusively as a bcrypt hash (cost factor 12). Change this to a stronger password before going live.
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding:"24px 32px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>© 2026 MenuMitra · All Rights Reserved</div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ color:"#E8650A", fontSize:14 }}>✦</span>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.3)" }}>Developed by</span>
          <span style={{ fontSize:14, fontFamily:"'Playfair Display',serif", fontWeight:900, color:"rgba(255,255,255,0.7)" }}>Abhijit Kumar Misra</span>
        </div>
      </div>
    </div>
  );
}
