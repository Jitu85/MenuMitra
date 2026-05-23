import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast, { Toaster } from 'react-hot-toast';

const STATES_AND_UTS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const BIZ_TYPES = [
  { value: 'hotel', label: 'Hotel / Lodge' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'tea_stall', label: 'Tea Stall / Chai Shop' },
  { value: 'cafe', label: 'Café / Coffee Shop' },
  { value: 'dhaba', label: 'Dhaba' },
  { value: 'other', label: 'Other Outlet' }
];

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'restaurant',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Bihar',
    pincode: '',
    tableCount: 10,
    gstin: '',
    fssaiLicense: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.businessName.trim()) { toast.error("Business Name is required"); return false; }
      if (!formData.businessType) { toast.error("Business Type is required"); return false; }
    } else if (currentStep === 2) {
      if (!formData.ownerName.trim()) { toast.error("Owner's Name is required"); return false; }
      if (!formData.email.trim() || !formData.email.includes('@')) { toast.error("Enter a valid email address"); return false; }
      if (!formData.phone.trim() || formData.phone.length < 10) { toast.error("Enter a valid 10-digit mobile number"); return false; }
      if (!formData.address.trim()) { toast.error("Address is required"); return false; }
      if (!formData.city.trim()) { toast.error("City is required"); return false; }
      if (!formData.pincode.trim() || formData.pincode.length !== 6) { toast.error("Enter a valid 6-digit PIN code"); return false; }
    } else if (currentStep === 3) {
      if (!formData.tableCount || formData.tableCount <= 0) { toast.error("Table Count must be greater than 0"); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password || formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!formData.termsAccepted) {
      toast.error("You must accept the Terms & Conditions");
      return;
    }

    const signupData = {
      business_name: formData.businessName,
      business_type: formData.businessType,
      owner_name: formData.ownerName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      table_count: parseInt(formData.tableCount, 10),
      gstin: formData.gstin || null,
      fssai_license: formData.fssaiLicense || null,
      password: formData.password
    };

    const res = await signup(signupData);
    if (res.success) {
      toast.success("Account created! Trial started successfully!");
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      toast.error(res.error || "Failed to create account. Email/phone might already exist.");
    }
  };

  const stepsLabel = ["Outlet Info", "Owner Profile", "Configuration", "Security"];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0F0F0F", fontFamily: "'DM Sans', sans-serif", color: "white", display: "flex", flexDirection: "column" }}>
      <Toaster position="top-center" reverseOrder={false} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, textarea {
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
        input:focus, select:focus, textarea:focus {
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
        }
        .btn-primary:hover {
          transform: translateY(-1.5px);
          box-shadow: 0 6px 20px rgba(232, 101, 10, 0.45);
        }
        .btn-secondary {
          background: rgba(255, 255, 255, 0.06);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .step-pill {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 12px;
          border: 2px solid rgba(255, 255, 255, 0.12);
          background: #1A1A1A;
          color: rgba(255, 255, 255, 0.4);
          transition: all 0.3s;
        }
        .step-pill.active {
          border-color: #E8650A;
          background: #E8650A;
          color: white;
          box-shadow: 0 0 15px rgba(232, 101, 10, 0.3);
        }
        .step-pill.done {
          border-color: #2D6A4F;
          background: #2D6A4F;
          color: white;
        }

        /* Mobile Responsive adjustments */
        @media (max-width: 560px) {
          .signup-header {
            padding: 12px 16px !important;
            flex-direction: column !important;
            gap: 8px !important;
            text-align: center !important;
          }
          .signup-body {
            padding: 20px 12px !important;
          }
          .signup-card {
            padding: 24px 16px !important;
            border-radius: 16px !important;
          }
          .responsive-grid, .responsive-grid-3 {
            grid-template-columns: 1fr !important;
          }
          .signup-stepper {
            gap: 4px !important;
            margin-bottom: 24px !important;
          }
          .signup-stepper-label {
            font-size: 8px !important;
          }
          .signup-footer {
            padding: 16px !important;
            flex-direction: column !important;
            text-align: center !important;
            gap: 8px !important;
          }
        }
      `}</style>

      {/* Top Header Bar */}
      <div className="signup-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
        <Link to="/" style={{ textDecoration: "none", color: "white", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "24px" }}>🍽️</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "20px" }}>MenuMitra</span>
        </Link>
        <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.45)" }}>Already registered? <Link to="/login" style={{ color: "#E8650A", fontWeight: 700, textDecoration: "none" }}>Log In</Link></span>
      </div>

      <div className="signup-body" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div className="signup-card" style={{ background: "#1A1A1A", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "24px", maxWidth: "600px", width: "100%", padding: "40px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
          
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 900, textAlign: "center", marginBottom: "8px" }}>Owner Sign Up</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", textAlign: "center", marginBottom: "32px" }}>Digitalize your dining menu & accept direct table orders. 30-day free trial.</p>

          {/* Stepper progress */}
          <div className="signup-stepper" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", marginBottom: "40px" }}>
            <div style={{ height: "2px", background: "rgba(255,255,255,0.08)", position: "absolute", left: "20px", right: "20px", top: "16px", zIndex: 1 }} />
            {stepsLabel.map((label, idx) => {
              const currentNum = idx + 1;
              const isActive = step === currentNum;
              const isDone = step > currentNum;
              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, position: "relative", width: "80px" }}>
                  <div className={`step-pill ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                    {isDone ? "✓" : currentNum}
                  </div>
                  <span className="signup-stepper-label" style={{ fontSize: "10px", fontWeight: 700, color: isActive ? "#E8650A" : isDone ? "#2D6A4F" : "rgba(255,255,255,0.3)", marginTop: "8px", textAlign: "center" }}>{label}</span>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* STEP 1: Business Details */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Business / Outlet Name *</label>
                  <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="e.g. Ramesh Sweet House & Dhaba" required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Outlet Type *</label>
                  <select name="businessType" value={formData.businessType} onChange={handleChange}>
                    {BIZ_TYPES.map(t => (
                      <option key={t.value} value={t.value} style={{ background: "#1F1F1F" }}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2: Owner Personal & Address */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Owner's Full Name *</label>
                  <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="e.g. Ramesh Kumar" required />
                </div>
                <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="owner@gmail.com" required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Mobile Number *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile" required />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Outlet Address *</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={2} placeholder="Full physical location details..." required style={{ resize: "none" }} />
                </div>
                <div className="responsive-grid-3" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Patna" required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>State *</label>
                    <select name="state" value={formData.state} onChange={handleChange}>
                      {STATES_AND_UTS.map(st => (
                        <option key={st} value={st} style={{ background: "#1F1F1F" }}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>PIN Code *</label>
                    <input type="tel" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="600001" maxLength={6} required />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Setup configuration */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Initial Number of Tables *</label>
                  <input type="number" name="tableCount" value={formData.tableCount} onChange={handleChange} min={1} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>GSTIN (Optional)</label>
                  <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} placeholder="15-digit GSTIN" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>FSSAI License No. (Optional)</label>
                  <input type="text" name="fssaiLicense" value={formData.fssaiLicense} onChange={handleChange} placeholder="14-digit FSSAI No." />
                </div>
              </div>
            )}

            {/* STEP 4: Password Security */}
            {step === 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Create Password * (min 8 chars)</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Confirm Password *</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "10px" }}>
                  <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} style={{ width: "auto", marginTop: "3px", cursor: "pointer" }} id="terms" required />
                  <label htmlFor="terms" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", cursor: "pointer", lineHeight: 1.5 }}>
                    I agree to the Terms of Service & Privacy Policy of MenuMitra. I understand that I will receive my billing QRs immediately after creation.
                  </label>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginTop: "24px" }}>
              {step > 1 ? (
                <button type="button" onClick={handlePrev} className="btn-secondary" style={{ flex: 1 }}>
                  Previous
                </button>
              ) : (
                <Link to="/" style={{ textDecoration: "none", textAlign: "center", flex: 1 }} className="btn-secondary">
                  Cancel
                </Link>
              )}

              {step < 4 ? (
                <button type="button" onClick={handleNext} className="btn-primary" style={{ flex: 1 }}>
                  Next Step
                </button>
              ) : (
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                  {loading ? "Creating Account..." : "Finish Registration"}
                </button>
              )}
            </div>
          </form>

        </div>
      </div>

      {/* Developer credit footer */}
      <div className="signup-footer" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
        <span>© 2026 MenuMitra · All Rights Reserved</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>Developed by</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, color: "rgba(255,255,255,0.6)" }}>Abhijit Kumar Misra</span>
        </div>
      </div>
    </div>
  );
}
