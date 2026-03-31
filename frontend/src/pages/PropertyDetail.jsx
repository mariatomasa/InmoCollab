import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Lock, Flame, Sparkles, BedDouble, Bath, Maximize, Calendar, Waves, Car, TreePine, Sun, Phone, Eye, ShieldCheck, AlertTriangle, Send, Share2, Clock, XCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { C, btn, card, badge } from '../lib/colors.js';
import { useLang } from '../hooks/useLang.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api.js';
import Modal from '../components/Modal.jsx';

export default function PropertyDetail({ showToast }) {
  const { id } = useParams();
  const { t, lang } = useLang();
  const { user } = useAuth();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [clients, setClients] = useState([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [similarProps, setSimilarProps] = useState([]);
  const [showSimilar, setShowSimilar] = useState(false);

  useEffect(() => {
    api.getProperty(id).then(setP).catch(() => nav('/app/properties'));
    api.getClients().then(c => setClients(c.filter(cl => cl.propertyId === id))).catch(() => {});
  }, [id]);

  if (!p) return null;

  const isU = p.isUnlocked;
  const desc = lang === 'es' ? p.descEs : p.descEn;
  const feats = lang === 'es' ? p.featuresEs : p.featuresEn;
  const pendingClient = clients.find(c => c.verifyStatus === 'PENDING');
  const rejectedClient = clients.find(c => c.verifyStatus === 'REJECTED');

  const handleClient = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.registerClient({ name: fd.get('name'), dni: fd.get('dni'), phone: fd.get('phone'), email: fd.get('email'), propertyId: id });
      setShowClientForm(false);
      showToast?.(t.verifyPending);
      api.getClients().then(c => setClients(c.filter(cl => cl.propertyId === id)));
      // Load similar properties as recommendations
      api.getSimilarProperties(id).then(s => { setSimilarProps(s); setShowSimilar(true); }).catch(() => {});
    } catch (err) { showToast?.(err.message); }
  };

  const handleVisit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const verifiedClient = clients.find(c => c.verifyStatus === 'VERIFIED');
    if (!verifiedClient) return;
    try {
      await api.requestVisit({ propertyId: id, clientId: verifiedClient.id, date: fd.get('date'), time: fd.get('time'), notes: fd.get('notes') });
      setShowVisitForm(false);
      showToast?.(t.schedVisit + ' ✓');
    } catch (err) { showToast?.(err.message); }
  };

  return (
    <div>
      <button style={{ ...btn('transparent', C.mid), padding: '4px 8px', marginBottom: 12 }} onClick={() => nav('/app/properties')}><ArrowLeft size={16} /></button>
      {/* HEADER */}
      <div style={{ height: 200, background: p.gradient, borderRadius: 12, display: 'flex', alignItems: 'flex-end', padding: 20, position: 'relative', marginBottom: 20 }}>
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
          {p.hot && <span style={badge(C.err)}><Flame size={10} />{t.hotP}</span>}
          {p.isNew && <span style={badge(C.ok)}><Sparkles size={10} />{t.newP}</span>}
          {!isU && <span style={badge(C.navy + 'DD')}><Lock size={12} />{t.blind}</span>}
        </div>
        <div><h1 style={{ color: C.white, fontSize: 24, margin: '0 0 4px', textShadow: '0 2px 8px rgba(0,0,0,.4)' }}>{p.name}</h1>
          <p style={{ color: 'rgba(255,255,255,.8)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} />{p.zone} · {p.type}</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* LEFT */}
        <div>
          <div style={card()}>
            <p style={{ color: C.text, lineHeight: 1.6, margin: '0 0 16px' }}>{desc}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
              {[{ l: t.beds, v: p.bedrooms, i: BedDouble }, { l: t.baths, v: p.bathrooms, i: Bath }, { l: t.area, v: p.area + 'm²', i: Maximize }, { l: t.completion, v: p.completion, i: Calendar }].map((s, i) =>
                <div key={i} style={{ textAlign: 'center' }}><s.i size={16} color={C.mid} /><p style={{ fontSize: 16, fontWeight: 700, color: C.navy, margin: '4px 0 0' }}>{s.v}</p><p style={{ fontSize: 11, color: C.gray, margin: 0 }}>{s.l}</p></div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {p.pool && <span style={badge(`${C.info}20`, C.info)}><Waves size={10} />{t.pool}</span>}
              {p.parking && <span style={badge(`${C.ok}20`, C.ok)}><Car size={10} />{t.parking}</span>}
              {p.garden && <span style={badge(`${C.ok}20`, C.ok)}><TreePine size={10} />{t.garden}</span>}
              {p.terrace && <span style={badge(`${C.warn}20`, C.warn)}><Sun size={10} />{t.terrace}</span>}
            </div>
            <h3 style={{ fontSize: 14, color: C.navy, marginBottom: 8 }}>{t.features}</h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {feats?.map((f, i) => <span key={i} style={{ background: C.off, padding: '4px 10px', borderRadius: 6, fontSize: 12, color: C.dgray }}>{f}</span>)}
            </div>
          </div>
          {/* TRANSPARENCY LOG */}
          <div style={{ ...card(), marginTop: 16 }}>
            <h3 style={{ fontSize: 14, color: C.navy, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Eye size={14} />{t.transLog}</h3>
            <p style={{ fontSize: 12, color: C.gray, margin: '0 0 10px' }}>{t.transDesc}</p>
            <div style={{ background: C.off, borderRadius: 8, padding: 10, fontSize: 12, color: C.dgray, fontFamily: 'monospace', lineHeight: 1.8 }}>
              {new Date().toLocaleDateString()} — Vista ficha<br />
              {isU && <>{new Date().toLocaleDateString()} — Datos desbloqueados<br /></>}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div style={{ ...card(), marginBottom: 16, textAlign: 'center' }}>
            <p style={{ color: C.gray, fontSize: 12, margin: '0 0 4px' }}>{t.from}</p>
            <p style={{ color: C.navy, fontSize: 28, fontWeight: 800, margin: '0 0 4px' }}>{p.price?.toLocaleString()}€</p>
            <p style={{ fontSize: 12, color: C.dgray }}>{p.availUnits}/{p.totalUnits} {t.units}</p>
          </div>

          <div style={{ ...card(), marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, color: C.navy, marginBottom: 10 }}>{t.developer}</h3>
            {isU ? <>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: '0 0 6px' }}>{p.developer}</p>
              <p style={{ fontSize: 13, color: C.dgray, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={12} />{p.address}</p>
              <p style={{ fontSize: 13, color: C.dgray, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={12} />{p.devPhone}</p>
              <div style={{ background: '#ECFDF5', borderRadius: 8, padding: 8, marginTop: 10 }}>
                <p style={{ fontSize: 11, color: C.ok, margin: 0 }}><Lock size={10} style={{ verticalAlign: 'middle' }} /> {t.expires} 30 {t.days}</p>
              </div>
            </> : <div style={{ background: C.off, borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <Lock size={24} color={C.gray} />
              <p style={{ color: C.gray, fontSize: 13, margin: '8px 0 0' }}>{t.blindDesc}</p>
            </div>}
          </div>

          {pendingClient && <div style={{ ...card(), marginBottom: 16, background: '#FEF3C7', borderLeft: `4px solid ${C.warn}` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 4px' }}><Clock size={14} color={C.warn} style={{ verticalAlign: 'middle', marginRight: 4 }} />{t.verifyStatus}</p>
            <p style={{ fontSize: 12, color: C.dgray, margin: 0 }}>{t.verifyPending}</p>
          </div>}

          {rejectedClient && !pendingClient && <div style={{ ...card(), marginBottom: 16, background: '#FEE2E2', borderLeft: `4px solid ${C.err}` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.err, margin: 0 }}><XCircle size={14} color={C.err} style={{ verticalAlign: 'middle', marginRight: 4 }} />{t.verifyKo}</p>
          </div>}

          <div style={{ ...card(), marginBottom: 16, background: '#FEF3C7', borderLeft: `3px solid ${C.gold}` }}>
            <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.5 }}><ShieldCheck size={14} color={C.gold} style={{ verticalAlign: 'middle', marginRight: 4 }} />{t.moral}</p>
          </div>

          <div style={{ ...card(), marginBottom: 16, background: '#FEE2E2', borderLeft: `3px solid ${C.err}` }}>
            <p style={{ fontSize: 11, color: C.text, margin: 0, lineHeight: 1.5 }}><AlertTriangle size={12} color={C.err} style={{ verticalAlign: 'middle', marginRight: 4 }} />{t.clientWarning}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!isU && !pendingClient && <button style={{ ...btn(C.gold, C.navy), justifyContent: 'center' }} onClick={() => setShowClientForm(true)}><Send size={14} />{t.regClient}</button>}
            {pendingClient && <button style={{ ...btn(C.warn, C.navy), justifyContent: 'center', opacity: .7 }} disabled><Clock size={14} />{t.verifyPending}</button>}
            {isU && <button style={{ ...btn(C.mid, C.white), justifyContent: 'center' }} onClick={() => setShowVisitForm(true)}><Calendar size={14} />{t.schedVisit}</button>}
            <button style={{ ...btn(C.off, C.dgray), justifyContent: 'center' }} onClick={() => { navigator.clipboard.writeText(window.location.href); showToast?.(t.copied); }}><Share2 size={14} />{t.share}</button>
          </div>
        </div>
      </div>

      {/* CLIENT FORM */}
      {showClientForm && <Modal onClose={() => setShowClientForm(false)}>
        <h2 style={{ color: C.navy, marginBottom: 4 }}>{t.regClient}</h2>
        <p style={{ color: C.dgray, fontSize: 13, marginBottom: 12 }}>{p.name}</p>
        <div style={{ background: '#FEE2E2', borderRadius: 8, padding: 12, marginBottom: 12, borderLeft: `4px solid ${C.err}` }}>
          <p style={{ fontSize: 12, color: C.err, margin: 0, fontWeight: 700, marginBottom: 4 }}><AlertTriangle size={13} color={C.err} style={{ verticalAlign: 'middle', marginRight: 4 }} />{t.verifyPre}</p>
          <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.5 }}>{t.clientWarning}</p>
        </div>
        <div style={{ background: '#FEF3C7', borderRadius: 8, padding: 10, marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: C.text, margin: 0 }}><ShieldCheck size={12} color={C.gold} style={{ verticalAlign: 'middle', marginRight: 4 }} />{t.moralShort}</p>
        </div>
        <form onSubmit={handleClient}>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: C.dgray, fontWeight: 600 }}>{t.cName} *</label><input name="name" required style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8, marginTop: 4, boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: C.dgray, fontWeight: 600 }}>{t.cDNI} *</label><input name="dni" required style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8, marginTop: 4, boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: C.dgray, fontWeight: 600 }}>{t.cPhone} *</label><input name="phone" required style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8, marginTop: 4, boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, color: C.dgray, fontWeight: 600 }}>{t.cEmail}</label><input name="email" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8, marginTop: 4, boxSizing: 'border-box' }} /></div>
          <p style={{ fontSize: 11, color: C.dgray, margin: '0 0 12px', lineHeight: 1.5 }}>{t.moral}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={btn(C.gold, C.navy)}><Send size={14} />{t.submit}</button>
            <button type="button" style={btn(C.off, C.dgray)} onClick={() => setShowClientForm(false)}>{t.cancel}</button>
          </div>
        </form>
      </Modal>}

      {/* VISIT FORM */}
      {showVisitForm && <Modal onClose={() => setShowVisitForm(false)}>
        <h2 style={{ color: C.navy, marginBottom: 4 }}>{t.schedVisit}</h2>
        <p style={{ color: C.dgray, fontSize: 13, marginBottom: 16 }}>{p.name}</p>
        <form onSubmit={handleVisit}>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: C.dgray, fontWeight: 600 }}>{t.vDate} *</label><input name="date" type="date" required style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8, marginTop: 4, boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: C.dgray, fontWeight: 600 }}>{t.vTime} *</label><input name="time" type="time" required style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8, marginTop: 4, boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, color: C.dgray, fontWeight: 600 }}>{t.vNotes}</label><textarea name="notes" rows={3} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8, marginTop: 4, boxSizing: 'border-box', resize: 'vertical' }} /></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={btn(C.gold, C.navy)}><Calendar size={14} />{t.vConfirm}</button>
            <button type="button" style={btn(C.off, C.dgray)} onClick={() => setShowVisitForm(false)}>{t.cancel}</button>
          </div>
        </form>
      </Modal>}

      {/* SIMILAR PROPERTIES MODAL */}
      {showSimilar && similarProps.length > 0 && <Modal onClose={() => setShowSimilar(false)}>
        <div style={{ maxWidth: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Lightbulb size={20} color={C.gold} />
            <h2 style={{ color: C.navy, margin: 0 }}>{t.simTitle}</h2>
          </div>
          <p style={{ color: C.dgray, fontSize: 13, marginBottom: 16 }}>{t.simDesc}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
            {similarProps.map(s => (
              <div key={s.id} style={{ ...card(), padding: 14, cursor: 'pointer', borderLeft: `4px solid ${s.gradient || C.mid}`, transition: 'transform .15s' }}
                onClick={() => { setShowSimilar(false); nav(`/app/properties/${s.id}`); }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: C.dgray, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <MapPin size={12} />{s.zone} · {s.type}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: C.navy }}>{s.price?.toLocaleString()}€</div>
                    <div style={{ fontSize: 11, color: C.dgray }}>{s.availUnits}/{s.totalUnits} {t.units}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: C.dgray }}>
                  <span><BedDouble size={12} style={{ verticalAlign: 'middle' }} /> {s.bedrooms}</span>
                  <span><Bath size={12} style={{ verticalAlign: 'middle' }} /> {s.bathrooms}</span>
                  <span><Maximize size={12} style={{ verticalAlign: 'middle' }} /> {s.area}m²</span>
                  {s.zone === p.zone && <span style={{ ...badge(`${C.ok}20`, C.ok), fontSize: 10 }}>{t.simSameZone}</span>}
                  {Math.abs(s.price - p.price) / p.price <= 0.1 && <span style={{ ...badge(`${C.info}20`, C.info), fontSize: 10 }}>{t.simSamePrice}</span>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button style={btn(C.off, C.dgray)} onClick={() => setShowSimilar(false)}>{t.cancel}</button>
          </div>
        </div>
      </Modal>}
    </div>
  );
}
