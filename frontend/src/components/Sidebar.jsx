import { Home, Building2, Users, Calendar, Activity, Gavel, MessageCircle, LogOut, Shield, X, GitBranchPlus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { C, btn } from '../lib/colors.js';
import { useLang } from '../hooks/useLang.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Sidebar({ mobile, onClose }) {
  const { t } = useLang();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { path: '/app', icon: Home, label: t.dashboard },
    { path: '/app/properties', icon: Building2, label: t.properties },
    { path: '/app/clients', icon: Users, label: t.clients },
    { path: '/app/visits', icon: Calendar, label: t.visits },
    { path: '/app/pipeline', icon: GitBranchPlus, label: t.pipeline || 'Seguimiento' },
    { path: '/app/activity', icon: Activity, label: t.activity },
    { path: '/app/legal', icon: Gavel, label: t.legal },
    { path: '/app/contact', icon: MessageCircle, label: t.contact },
  ];

  const go = (path) => { navigate(path); if (mobile) onClose?.(); };

  const st = {
    position: mobile ? 'fixed' : 'relative', top: 0, left: 0, width: 240, height: '100vh',
    background: C.navy, padding: '20px 0', zIndex: mobile ? 8000 : 1,
    transition: 'transform .3s', overflowY: 'auto',
  };

  return (
    <div style={st}>
      {mobile && <button style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer' }} onClick={onClose}><X size={20} color={C.gray} /></button>}
      <div style={{ padding: '0 16px 20px', borderBottom: `1px solid ${C.mid}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Shield size={22} color={C.gold} /><span style={{ color: C.white, fontWeight: 800, fontSize: 16 }}>{t.brand}</span>
        </div>
        <p style={{ color: C.gray, fontSize: 11, margin: 0 }}>{user?.role === 'ADMIN' ? t.adminP : t.agencyP}</p>
      </div>
      <nav style={{ padding: '12px 8px' }}>
        {items.map(it => {
          const active = location.pathname === it.path;
          return (
            <button key={it.path} onClick={() => go(it.path)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', background: active ? `${C.gold}15` : 'transparent', color: active ? C.gold : 'rgba(255,255,255,.6)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 400, textAlign: 'left', marginBottom: 2 }}>
              <it.icon size={17} />{it.label}
            </button>
          );
        })}
      </nav>
      <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, padding: '0 16px' }}>
        <div style={{ background: C.dark, borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <p style={{ color: C.white, fontSize: 12, fontWeight: 600, margin: '0 0 2px' }}>{user?.name}</p>
          <p style={{ color: C.gray, fontSize: 11, margin: 0 }}>{user?.agency}</p>
        </div>
        <button style={{ ...btn('transparent', 'rgba(255,255,255,.5)'), width: '100%', justifyContent: 'center', fontSize: 12, padding: '8px' }} onClick={() => { logout(); navigate('/'); }}>
          <LogOut size={14} />{t.logout}
        </button>
      </div>
    </div>
  );
}
