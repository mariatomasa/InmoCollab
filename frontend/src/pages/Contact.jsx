import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle, User, PhoneCall, AtSign, MessageCircle, ArrowLeft, Globe } from 'lucide-react';
import { C, btn, card } from '../lib/colors.js';
import { useLang } from '../hooks/useLang.jsx';
import { api } from '../lib/api.js';

export default function Contact({ showToast, isPublic }) {
  const { t, toggle } = useLang();
  const nav = useNavigate();
  const [sent, setSent] = useState(false);
  const reasons = [t.contactR1, t.contactR2, t.contactR3, t.contactR4, t.contactR5];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.sendContact({ agency: fd.get('agency'), person: fd.get('person'), email: fd.get('email'), phone: fd.get('phone'), message: fd.get('msg') });
      setSent(true);
      showToast?.(t.contactSent);
    } catch (err) { showToast?.(err.message); }
  };

  const content = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div style={card()}>
        {sent ? <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ background: `${C.ok}15`, borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={32} color={C.ok} />
          </div>
          <h3 style={{ color: C.navy, margin: '0 0 8px' }}>{t.contactSent}</h3>
          <p style={{ color: C.gray, fontSize: 13 }}>Janire Hortelano · +34 611 044 383</p>
        </div>
          : <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: C.dgray, fontWeight: 600, display: 'block', marginBottom: 4 }}>{t.contactName} *</label>
              <input name="agency" required placeholder="Ej: Costa Blanca Homes" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8, boxSizing: 'border-box', fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: C.dgray, fontWeight: 600, display: 'block', marginBottom: 4 }}>{t.contactPerson} *</label>
              <input name="person" required placeholder="Ej: Ana López" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8, boxSizing: 'border-box', fontSize: 14 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: C.dgray, fontWeight: 600, display: 'block', marginBottom: 4 }}>{t.contactEmail} *</label>
                <input name="email" type="email" required placeholder="email@agencia.com" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8, boxSizing: 'border-box', fontSize: 14 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: C.dgray, fontWeight: 600, display: 'block', marginBottom: 4 }}>{t.contactPhone} *</label>
                <input name="phone" required placeholder="+34 600 000 000" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8, boxSizing: 'border-box', fontSize: 14 }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: C.dgray, fontWeight: 600, display: 'block', marginBottom: 4 }}>{t.contactMsg}</label>
              <textarea name="msg" rows={3} placeholder="Zona, tipo de clientes, experiencia..." style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8, boxSizing: 'border-box', fontSize: 14, resize: 'vertical' }} />
            </div>
            <button type="submit" style={{ ...btn(C.gold, C.navy), width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15 }}>
              <Send size={16} />{t.contactSend}
            </button>
            <p style={{ fontSize: 11, color: C.gray, textAlign: 'center', marginTop: 8 }}>RGPD · Tus datos solo se usarán para contactarte</p>
          </form>}
      </div>
      <div>
        <div style={{ ...card(), marginBottom: 16, background: `linear-gradient(135deg,${C.navy},${C.mid})` }}>
          <h3 style={{ color: C.gold, fontSize: 16, margin: '0 0 12px' }}>{t.contactDirect}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ background: `${C.gold}22`, borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={24} color={C.gold} />
            </div>
            <div>
              <p style={{ color: C.white, fontWeight: 700, margin: 0, fontSize: 15 }}>Janire Hortelano</p>
              <p style={{ color: C.gray, margin: 0, fontSize: 12 }}>Coordinadora de Colaboraciones</p>
              <p style={{ color: C.gray, margin: 0, fontSize: 12 }}>mariatomasa.com — Alicante</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a href="tel:+34611044383" style={{ ...btn(C.ok, '#FFF'), padding: '8px 14px', fontSize: 13, textDecoration: 'none' }}><PhoneCall size={14} />{t.contactCallBtn}</a>
            <a href="mailto:janire@mariatomasa.com" style={{ ...btn(C.info, '#FFF'), padding: '8px 14px', fontSize: 13, textDecoration: 'none' }}><AtSign size={14} />{t.contactEmailBtn}</a>
            <a href="https://wa.me/34611044383?text=Hola%20Janire%2C%20quiero%20informaci%C3%B3n%20sobre%20InmoCollab" target="_blank" rel="noopener noreferrer" style={{ ...btn('#25D366', '#FFF'), padding: '8px 14px', fontSize: 13, textDecoration: 'none' }}><MessageCircle size={14} />{t.contactWhatsapp}</a>
          </div>
        </div>
        <div style={card()}>
          <h3 style={{ color: C.navy, fontSize: 15, margin: '0 0 14px' }}>{t.contactWhy}</h3>
          {reasons.map((r, i) => <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <div style={{ background: `${C.gold}15`, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
              <CheckCircle size={14} color={C.gold} />
            </div>
            <p style={{ color: C.text, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{r}</p>
          </div>)}
          <div style={{ marginTop: 14, padding: '10px 14px', background: `${C.ok}10`, borderRadius: 8, borderLeft: `3px solid ${C.ok}` }}>
            <p style={{ color: C.ok, fontSize: 12, fontWeight: 600, margin: 0 }}>{t.noLock}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isPublic) {
    return (
      <div style={{ minHeight: '100vh', background: C.off, padding: 20 }}>
        <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 100 }}>
          <button style={{ ...btn(C.off, C.mid), padding: '6px 12px', fontSize: 12 }} onClick={toggle}><Globe size={14} />{t.switchL}</button>
        </div>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button style={{ ...btn('transparent', C.mid), marginBottom: 16, padding: '6px 12px' }} onClick={() => nav('/')}><ArrowLeft size={16} />Volver</button>
          <h1 style={{ fontSize: 22, color: C.navy, marginBottom: 4 }}>{t.contactT}</h1>
          <p style={{ color: C.gray, fontSize: 13, marginBottom: 24 }}>{t.contactDesc}</p>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, color: C.navy, marginBottom: 4 }}>{t.contactT}</h1>
      <p style={{ color: C.gray, fontSize: 13, marginBottom: 24 }}>{t.contactDesc}</p>
      {content}
    </div>
  );
}
