import { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Info } from 'lucide-react';
import { C, btn, card, badge } from '../lib/colors.js';
import { useLang } from '../hooks/useLang.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api.js';

export default function Clients({ showToast }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [clients, setClients] = useState([]);

  useEffect(() => { api.getClients().then(setClients).catch(() => {}); }, []);

  const statusBadge = (s) => {
    if (s === 'VERIFIED') return <span style={badge(C.ok)}><CheckCircle size={10} />{t.verifyOk}</span>;
    if (s === 'REJECTED') return <span style={badge(C.err)}><XCircle size={10} />{t.verifyKo}</span>;
    return <span style={badge(C.warn, C.navy)}><Clock size={10} />{t.verifyPending}</span>;
  };

  const handleVerify = async (id, status) => {
    try {
      await api.verifyClient(id, status);
      setClients(clients.map(c => c.id === id ? { ...c, verifyStatus: status } : c));
      showToast?.(status === 'VERIFIED' ? t.verifyOk : t.verifyKo);
    } catch (err) { showToast?.(err.message); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, color: C.navy, marginBottom: 16 }}>{t.clients}</h1>
      <div style={{ ...card(), marginBottom: 16, background: '#EFF6FF', borderLeft: `4px solid ${C.info}` }}>
        <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.6 }}>
          <Info size={14} color={C.info} style={{ verticalAlign: 'middle', marginRight: 6 }} />{t.clientWarning}
        </p>
      </div>
      {clients.length === 0 ? <div style={{ ...card(), textAlign: 'center', padding: 40 }}><Users size={32} color={C.gray} /><p style={{ color: C.gray, marginTop: 8 }}>{t.noRes}</p></div> :
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {clients.map(c => (
            <div key={c.id} style={{ ...card(), borderLeft: `4px solid ${c.verifyStatus === 'VERIFIED' ? C.ok : c.verifyStatus === 'REJECTED' ? C.err : C.warn}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>{c.name}</p>
                  <p style={{ fontSize: 12, color: C.gray, margin: '0 0 6px' }}>{c.dni} · {c.phone} · {c.property?.name}</p>
                </div>
                {statusBadge(c.verifyStatus)}
              </div>
              {c.verifyStatus === 'PENDING' && (
                <div style={{ background: '#FEF3C7', borderRadius: 6, padding: 8, marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 11, color: C.text, margin: 0 }}><Clock size={11} color={C.warn} style={{ verticalAlign: 'middle', marginRight: 4 }} />{t.verifyPending}</p>
                  {user?.role === 'ADMIN' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ ...btn(C.ok, '#FFF'), padding: '4px 10px', fontSize: 11 }} onClick={() => handleVerify(c.id, 'VERIFIED')}><CheckCircle size={12} />Validar</button>
                      <button style={{ ...btn(C.err, '#FFF'), padding: '4px 10px', fontSize: 11 }} onClick={() => handleVerify(c.id, 'REJECTED')}><XCircle size={12} />Rechazar</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      }
    </div>
  );
}
