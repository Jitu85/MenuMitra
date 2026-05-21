import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// ── Public pages ──────────────────────────────────────
import Landing       from './pages/Landing';
import Signup        from './pages/Signup';
import OwnerLogin    from './pages/OwnerLogin';
import AdminLogin    from './pages/AdminLogin';
import CustomerMenu  from './pages/CustomerMenu';

// ── Owner pages (login required) ──────────────────────
import OwnerDashboard from './pages/owner/Dashboard';
import MenuManagement from './pages/owner/MenuManagement';
import Orders         from './pages/owner/Orders';
import QRCode         from './pages/owner/QRCode';
import Analytics      from './pages/owner/Analytics';
import PaymentSettings from './pages/owner/PaymentSettings';
import Subscription   from './pages/owner/Subscription';
import Settings       from './pages/owner/Settings';

// ── Admin pages (admin login required) ────────────────
import AdminDashboard from './pages/admin/Dashboard';
import OwnerManagement from './pages/admin/OwnerManagement';
import AuditLogs      from './pages/admin/AuditLogs';
import Plans          from './pages/admin/Plans';
import PasswordResets from './pages/admin/PasswordResets';

// ── Route guards ──────────────────────────────────────
function OwnerRoute({ children }) {
  const { user } = useAuth();
  return user?.role === 'owner' ? children : <Navigate to='/login' replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to='/admin/login' replace />;
}

export default function App() {
  return (
    <BrowserRouter>
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
        <Route path='/dashboard/analytics'   element={<OwnerRoute><Analytics /></OwnerRoute>} />
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
    </BrowserRouter>
  );
}
