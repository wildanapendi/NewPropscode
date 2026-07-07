import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminSidebar from './components/layout/AdminSidebar';
import { useState, lazy, Suspense } from 'react';

// Public Pages (Lazy Loaded)
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'));
const BlogPage = lazy(() => import('./pages/public/BlogPage'));
const BlogDetailPage = lazy(() => import('./pages/public/BlogDetailPage'));
const TeamPage = lazy(() => import('./pages/public/TeamPage'));
const PortfolioPage = lazy(() => import('./pages/public/PortfolioPage'));
const MaintenancePage = lazy(() => import('./pages/public/MaintenancePage'));

// Auth Pages (Lazy Loaded)
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));

// Client Pages (Lazy Loaded)
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));
const OrderFormPage = lazy(() => import('./pages/client/OrderFormPage'));
const ProjectDetailPage = lazy(() => import('./pages/client/ProjectDetailPage'));

// Admin Pages (Lazy Loaded)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const BlogManager = lazy(() => import('./pages/admin/BlogManager'));
const PortfolioManager = lazy(() => import('./pages/admin/PortfolioManager'));
const TeamManager = lazy(() => import('./pages/admin/TeamManager'));
const OrderManager = lazy(() => import('./pages/admin/OrderManager'));
const HRManager = lazy(() => import('./pages/admin/HRManager'));
const ServiceManager = lazy(() => import('./pages/admin/ServiceManager'));
const SettingsManager = lazy(() => import('./pages/admin/SettingsManager'));

import './index.css';

const LoadingSpinner = () => (
  <div className="loading-page">
    <div className="spinner" />
  </div>
);

import FloatingChatbot from './components/ui/FloatingChatbot';

// Layout for public pages
const PublicLayout = () => (
  <>
    <Navbar />
    <main style={{ paddingTop: '70px', minHeight: '100vh' }}>
      <Outlet />
    </main>
    <Footer />
    <FloatingChatbot />
  </>
);

// Protected route for clients
const ClientRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '70px', minHeight: '100vh' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

// Protected route for admins
const AdminLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;

  return (
    <div className="admin-layout">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`admin-main ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Outlet />
      </main>
      <style>{`
        .admin-layout { display: flex; min-height: 100vh; }
        .admin-main { flex: 1; margin-left: 260px; padding: 2rem; transition: margin-left var(--transition-base); }
        .admin-main.collapsed { margin-left: 72px; }
        @media (max-width: 900px) { .admin-main { margin-left: 72px; padding: 1rem; } }
      `}</style>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#16161f', color: '#f0f0f5', border: '1px solid rgba(255,255,255,0.06)' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
            </Route>

            {/* Auth Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Client Routes */}
            <Route element={<ClientRoute />}>
              <Route path="/dashboard" element={<ClientDashboard />} />
              <Route path="/order/new" element={<OrderFormPage />} />
              <Route path="/project/:id" element={<ProjectDetailPage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<OrderManager />} />
              <Route path="/admin/blog" element={<BlogManager />} />
              <Route path="/admin/portfolio" element={<PortfolioManager />} />
              <Route path="/admin/team" element={<TeamManager />} />
              <Route path="/admin/services" element={<ServiceManager />} />
              <Route path="/admin/hr" element={<HRManager />} />
              <Route path="/admin/settings" element={<SettingsManager />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
