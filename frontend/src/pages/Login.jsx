import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogIn, ArrowLeft, Users, ShieldCheck, Globe } from 'lucide-react';
import { C, btn, card } from '../lib/colors.js';
import { useLang } from '../hooks/useLang.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Login() {
  const { t, toggle } = useLang();
  const { login, loginDemo } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      nav('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setLoading(true);
    try {
      await loginDemo(role);
      nav('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg,${C.navy},${C.mid})`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 100 }}>
        <button style={{ ...btn('rgba(255,255,255,.15)', C.gold), padding: '6px 12px', fontSize: 12 }} onClick={toggle}><Globe size={14} />{t.switchL}</button>
      </div>
      <div style={{ ...card(), maxWidth: 400, width: '100%' }}>
        <button style={{ ...btn('transparent', C.gray), padding: '4px 8px', marginBottom: 12 }} onClick={() => nav('/')}><ArrowLeft size={16} /></button>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Shield size={32} color={C.gold} />
          <h2 style={{ color: C.navy, margin: '8px 0 4px' }}>{t.loginT}</h2>
        </div>
        {error && <p style={{ color: C.err, fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: C.dgray, fontWeight: 600 }}>{t.email}</label>
            <input value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8, marginTop: 4, boxSizing: 'border-box' }} placeholder="email@agencia.com" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: C.dgray, fontWeight: 600 }}>{t.pass}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8, marginTop: 4, boxSizing: 'border-box' }} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} style={{ ...btn(C.gold, C.navy), width: '100%', justifyContent: 'center', opacity: loading ? .6 : 1 }}>
            <LogIn size={16} />{t.loginBtn}
          </button>
        </form>
        <div style={{ marginTop: 20, padding: '16px 0 0', borderTop: `1px solid ${C.lgray}` }}>
          <p style={{ color: C.gray, fontSize: 12, textAlign: 'center', marginBottom: 10 }}>{t.demo}</p>
          <button style={{ ...btn(C.mid, C.white), width: '100%', justifyContent: 'center', marginBottom: 8, fontSize: 13 }} onClick={() => handleDemo('agency')} disabled={loading}>
            <Users size={14} />{t.demoAg}
          </button>
          <button style={{ ...btn(C.dark, C.gold), width: '100%', justifyContent: 'center', fontSize: 13 }} onClick={() => handleDemo('admin')} disabled={loading}>
            <ShieldCheck size={14} />{t.demoAd}
          </button>
        </div>
      </div>
    </div>
  );
}
