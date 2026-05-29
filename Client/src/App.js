import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import { Analytics } from '@vercel/analytics/react';

// ── Public pages (Eager load for fast initial paint) ──────────────────────
import Landing       from './pages/Landing';
import Signup        from './pages/Signup';
import OwnerLogin    from './pages/OwnerLogin';
import AdminLogin    from './pages/AdminLogin';
import CustomerMenu  from './pages/CustomerMenu';

// ── Owner pages (Lazy loaded to reduce bundle size) ──────────────────────
const OwnerDashboard = lazy(() => import('./pages/owner/Dashboard'));
const MenuManagement = lazy(() => import('./pages/owner/MenuManagement'));
const Orders         = lazy(() => import('./pages/owner/Orders'));
const QRCode         = lazy(() => import('./pages/owner/QRCode'));
const OwnerAnalytics = lazy(() => import('./pages/owner/Analytics'));
const PaymentSettings = lazy(() => import('./pages/owner/PaymentSettings'));
const Subscription   = lazy(() => import('./pages/owner/Subscription'));
const Settings       = lazy(() => import('./pages/owner/Settings'));

// ── Admin pages (Lazy loaded) ──────────────────────────────────────────
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const OwnerManagement = lazy(() => import('./pages/admin/OwnerManagement'));
const AuditLogs      = lazy(() => import('./pages/admin/AuditLogs'));
const Plans          = lazy(() => import('./pages/admin/Plans'));
const PasswordResets = lazy(() => import('./pages/admin/PasswordResets'));

// ── Route guards ──────────────────────────────────────
function OwnerRoute({ children }) {
  const { isOwner } = useAuth();
  return isOwner ? children : <Navigate to='/login' replace />;
}

function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to='/admin/login' replace />;
}

export default function App() {
  const initAuth = useAuthStore(state => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
    <BrowserRouter>
      <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#E8650A" }}>Loading MenuMitra...</div>}>
        <Routes>
          {/* Public */}
          <Route path='/'             element={<Landing />} />
          <Route path='/signup'        element={<Signup />} />
          <Route path='/login'         element={<OwnerLogin />} />
          <Route path='/admin/login'   element={<AdminLogin />} />
          <Route path='/menu/:slug'    element={<CustomerMenu />} />

          {/* Owner — protected */}
          <Route path='/dashboard'             element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
          <Route path='/dashboard/menu'        element={<OwnerRoute><MenuManagement /></OwnerRoute>} />
          <Route path='/dashboard/orders'      element={<OwnerRoute><Orders /></OwnerRoute>} />
          <Route path='/dashboard/qr'          element={<OwnerRoute><QRCode /></OwnerRoute>} />
          <Route path='/dashboard/analytics'   element={<OwnerRoute><OwnerAnalytics /></OwnerRoute>} />
          <Route path='/dashboard/payments'    element={<OwnerRoute><PaymentSettings /></OwnerRoute>} />
          <Route path='/dashboard/subscription' element={<OwnerRoute><Subscription /></OwnerRoute>} />
          <Route path='/dashboard/settings'    element={<OwnerRoute><Settings /></OwnerRoute>} />

          {/* Admin — protected */}
          <Route path='/admin/dashboard' element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path='/admin/owners'    element={<AdminRoute><OwnerManagement /></AdminRoute>} />
          <Route path='/admin/audit'     element={<AdminRoute><AuditLogs /></AdminRoute>} />
          <Route path='/admin/plans'     element={<AdminRoute><Plans /></AdminRoute>} />
          <Route path='/admin/resets'    element={<AdminRoute><PasswordResets /></AdminRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    <Analytics />
    </>
  );
}
