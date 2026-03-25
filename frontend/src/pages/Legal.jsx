import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, ArrowLeft, FileCheck, CheckCircle, Globe } from 'lucide-react';
import { C, btn, card } from '../lib/colors.js';
import { useLang } from '../hooks/useLang.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api.js';

export default function Legal({ showToast, isPublic }) {
  const { t, toggle } = useLang();
  const auth = useAuth();
  const nav = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const signed = auth?.user?.legalSigned || false;

  const handleSign = async () => {
    if (!auth?.user) return;
    try {
      await api.signLegal();
      await auth.refreshUser();
      showToast?.(t.legalSigned);
    } catch (err) { showToast?.(err.message); }
  };

  return (
    <div style={{ minHeight: isPublic ? '100vh' : 'auto', background: C.off, padding: isPublic ? 20 : 0 }}>
      {isPublic && (
        <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 100 }}>
          <button style={{ ...btn(C.off, C.mid), padding: '6px 12px', fontSize: 12 }} onClick={toggle}><Globe size={14} />{t.switchL}</button>
        </div>
      )}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {isPublic && <button style={{ ...btn('transparent', C.mid), marginBottom: 16, padding: '6px 12px' }} onClick={() => nav('/')}><ArrowLeft size={16} />Volver</button>}
        <div style={{ ...card(), marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Gavel size={28} color={C.gold} />
            <div>
              <h1 style={{ fontSize: 22, color: C.navy, margin: 0 }}>{t.legalT}</h1>
              <p style={{ color: C.gray, fontSize: 13, margin: 0 }}>{t.legalSub}</p>
            </div>
          </div>
          {t.legalS.map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <h3 style={{ color: C.navy, fontSize: 15, marginBottom: 4 }}>{s.t}</h3>
              <p style={{ color: C.dgray, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{s.tx}</p>
            </div>
          ))}
        </div>
        {auth?.user && (signed ?
          <div style={{ ...card(), background: '#ECFDF5', borderLeft: `4px solid ${C.ok}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={20} color={C.ok} />
              <div>
                <p style={{ fontWeight: 700, color: C.ok, margin: 0 }}>{t.legalSigned}</p>
                <p style={{ fontSize: 12, color: C.dgray, margin: 0 }}>{t.legalDate}: {auth.user.legalDate ? new Date(auth.user.legalDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          :
          <div style={card()}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
              <input type="checkbox" checked={accepted} onChange={() => setAccepted(!accepted)} style={{ marginTop: 3, accentColor: C.gold }} />
              <span style={{ fontSize: 13, color: C.text }}>{t.legalAccept}</span>
            </label>
            <button style={{ ...btn(accepted ? C.gold : C.lgray, accepted ? C.navy : C.gray), opacity: accepted ? 1 : .6 }} disabled={!accepted} onClick={handleSign}>
              <FileCheck size={16} />{t.legalSign}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
