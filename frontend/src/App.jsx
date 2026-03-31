import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { Globe, Menu } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { LangProvider, useLang } from './hooks/useLang.jsx';
import { C, btn } from './lib/colors.js';
import Sidebar from './components/Sidebar.jsx';
import Toast from './components/Toast.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Properties from './pages/Properties.jsx';
import PropertyDetail from './pages/PropertyDetail.jsx';
import Clients from './pages/Clients.jsx';
import Visits from './pages/Visits.jsx';
import Activity from './pages/Activity.jsx';
import Legal from './pages/Legal.jsx';
import Contact from './pages/Contact.jsx';
import Pipeline from './pages/Pipeline.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const { t, toggle } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg) => setToast(msg);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: C.gray }}>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.off }}>
      <Sidebar mobile={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 7999 }} onClick={() => setMenuOpen(false)} />}
      <div style={{ flex: 1, padding: 24, maxWidth: 1100, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setMenuOpen(true)}>
            <Menu size={22} color={C.navy} />
          </button>
          <button style={{ ...btn(C.off, C.mid), padding: '6px 12px', fontSize: 12 }} onClick={toggle}><Globe size={14} />{t.switchL}</button>
        </div>
        <Outlet context={{ showToast }} />
      </div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function useToast() {
  const ctx = useOutletContext();
  return ctx?.showToast || (() => {});
}

function DashboardWrapper() { return <Dashboard />; }
function PropertiesWrapper() { return <Properties />; }
function PropertyDetailWrapper() { return <PropertyDetail showToast={useToast()} />; }
function ClientsWrapper() { return <Clients showToast={useToast()} />; }
function VisitsWrapper() { return <Visits showToast={useToast()} />; }
function ActivityWrapper() { return <Activity />; }
function LegalWrapper() { return <Legal showToast={useToast()} />; }
function ContactWrapper() { return <Contact showToast={useToast()} />; }
function PipelineWrapper() { return <Pipeline showToast={useToast()} />; }
function AdminPanelWrapper() { return <AdminPanel showToast={useToast()} />; }

function AppRoutes() {
  const [toast, setToast] = useState(null);
  const showToast = (msg) => setToast(msg);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/legal" element={<Legal showToast={showToast} isPublic />} />
        <Route path="/contact" element={<Contact showToast={showToast} isPublic />} />
        <Route path="/app" element={<ProtectedLayout />}>
          <Route index element={<DashboardWrapper />} />
          <Route path="properties" element={<PropertiesWrapper />} />
          <Route path="properties/:id" element={<PropertyDetailWrapper />} />
          <Route path="clients" element={<ClientsWrapper />} />
          <Route path="visits" element={<VisitsWrapper />} />
          <Route path="pipeline" element={<PipelineWrapper />} />
          <Route path="activity" element={<ActivityWrapper />} />
          <Route path="legal" element={<LegalWrapper />} />
          <Route path="contact" element={<ContactWrapper />} />
          <Route path="admin" element={<AdminPanelWrapper />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}
