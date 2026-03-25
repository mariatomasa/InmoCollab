import { useNavigate } from 'react-router-dom';
import { Shield, LogIn, BookOpen, Users, Calendar, Trophy, CheckCircle, Handshake, Unlock, ArrowRight, PhoneCall, Mail, MessageCircle, UserCheck, Search as SearchIcon, FileCheck, Euro } from 'lucide-react';
import { C, btn, card } from '../lib/colors.js';
import { useLang } from '../hooks/useLang.jsx';
import { Globe } from 'lucide-react';

const CYCLE_ICONS = [UserCheck, SearchIcon, Unlock, Calendar, FileCheck, Euro];

export default function Landing() {
  const { t, toggle } = useLang();
  const nav = useNavigate();
  const steps = t.cycleS;

  return (
    <div style={{ minHeight: '100vh', background: C.navy }}>
      {/* Lang toggle */}
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 100 }}>
        <button style={{ ...btn(C.dark + 'AA', C.gold), padding: '6px 12px', fontSize: 12 }} onClick={toggle}><Globe size={14} />{t.switchL}</button>
      </div>

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg,${C.navy},${C.mid})`, padding: '60px 20px 40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Shield size={36} color={C.gold} /><span style={{ color: C.white, fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>{t.brand}</span>
        </div>
        <p style={{ color: C.gold, fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{t.tag}</p>
        <p style={{ color: 'rgba(255,255,255,.75)', maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.6 }}>{t.heroDesc}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={btn(C.gold, C.navy)} onClick={() => nav('/login')}><LogIn size={16} />{t.login}</button>
          <button style={{ ...btn('transparent', C.gold), border: `1px solid ${C.gold}` }} onClick={() => nav('/legal')}><BookOpen size={16} />{t.legal}</button>
        </div>
      </div>

      {/* SOCIAL PROOF TICKER */}
      <div style={{ background: C.dark, padding: '14px 20px', display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
        {[{ icon: Users, txt: t.sp1 }, { icon: Calendar, txt: t.sp2 }, { icon: Trophy, txt: t.sp3 }].map((s, i) =>
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.8)', fontSize: 13 }}>
            <s.icon size={15} color={C.gold} />{s.txt}
          </div>
        )}
      </div>

      {/* COMMISSION ANCHOR */}
      <div style={{ background: `linear-gradient(90deg,${C.mid},${C.dark})`, padding: '20px', textAlign: 'center' }}>
        <p style={{ color: C.gray, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{t.avgComm}</p>
        <p style={{ color: C.gold, fontSize: 36, fontWeight: 800, margin: '4px 0' }}>{t.avgCommVal}</p>
        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }}>{t.avgCommDesc}</p>
      </div>

      {/* CYCLE */}
      <div style={{ padding: '40px 20px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ color: C.white, textAlign: 'center', marginBottom: 28, fontSize: 22 }}>{t.cycleT}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 16 }}>
          {steps.map((s, i) => {
            const Ic = CYCLE_ICONS[i] || CheckCircle;
            return (
              <div key={i} style={{ ...card(C.dark), textAlign: 'center', position: 'relative' }}>
                <div style={{ background: `${C.gold}22`, borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <Ic size={20} color={C.gold} />
                </div>
                <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>PASO {i + 1}</div>
                <div style={{ color: C.white, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{s.t}</div>
                <div style={{ color: C.gray, fontSize: 12, lineHeight: 1.4 }}>{s.d}</div>
                {i < steps.length - 1 && <ArrowRight size={14} color={C.gold} style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)' }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* SYMMETRY */}
      <div style={{ padding: '32px 20px', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ color: C.white, textAlign: 'center', marginBottom: 20, fontSize: 20 }}>{t.symTitle}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={card(C.dark)}>
            <p style={{ color: C.gold, fontWeight: 700, marginBottom: 10, fontSize: 13 }}>{t.weProv}</p>
            {[t.w1, t.w2, t.w3, t.w4].map((w, i) => <div key={i} style={{ color: 'rgba(255,255,255,.8)', fontSize: 13, padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={12} color={C.ok} />{w}</div>)}
          </div>
          <div style={card(C.dark)}>
            <p style={{ color: C.gold, fontWeight: 700, marginBottom: 10, fontSize: 13 }}>{t.youProv}</p>
            {[t.y1, t.y2].map((w, i) => <div key={i} style={{ color: 'rgba(255,255,255,.8)', fontSize: 13, padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}><Handshake size={12} color={C.gold} />{w}</div>)}
          </div>
        </div>
      </div>

      {/* MODALITIES + TABLE */}
      <div style={{ padding: '20px 20px 12px', maxWidth: 700, margin: '0 auto' }}>
        <h3 style={{ color: C.white, textAlign: 'center', marginBottom: 16, fontSize: 18 }}>{t.commTbl}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div style={{ background: C.dark, borderRadius: 10, padding: 16, borderTop: `3px solid ${C.gold}` }}>
            <p style={{ color: C.gold, fontWeight: 800, fontSize: 14, margin: '0 0 6px' }}>{t.modalityA}</p>
            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, lineHeight: 1.5, margin: '0 0 10px' }}>{t.modalityADesc}</p>
            <div style={{ background: C.gold, color: C.navy, borderRadius: 6, padding: '6px 12px', textAlign: 'center', fontWeight: 800, fontSize: 20 }}>50%</div>
          </div>
          <div style={{ background: C.dark, borderRadius: 10, padding: 16, borderTop: `3px solid ${C.info}` }}>
            <p style={{ color: C.info, fontWeight: 800, fontSize: 14, margin: '0 0 6px' }}>{t.modalityB}</p>
            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, lineHeight: 1.5, margin: '0 0 10px' }}>{t.modalityBDesc}</p>
            <div style={{ background: C.info, color: C.white, borderRadius: 6, padding: '6px 12px', textAlign: 'center', fontWeight: 800, fontSize: 20 }}>35%</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
          <thead><tr>{[t.commT, t.commP, t.commW].map((h, i) => <th key={i} style={{ background: C.gold, color: C.navy, padding: '8px 12px', fontSize: 12, fontWeight: 700, textAlign: 'left' }}>{h}</th>)}</tr></thead>
          <tbody>{t.commR.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ padding: '8px 12px', color: C.white, fontSize: 13, borderBottom: `1px solid ${C.mid}` }}>{c}</td>)}</tr>)}</tbody>
        </table>
        <p style={{ color: C.gray, fontSize: 11, textAlign: 'center', lineHeight: 1.5 }}>{t.commNote}</p>
      </div>

      {/* EXIT EASY */}
      <div style={{ textAlign: 'center', padding: '20px 20px 40px' }}>
        <p style={{ color: C.ok, fontSize: 13, fontWeight: 600 }}><Unlock size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />{t.noLock}</p>
      </div>

      {/* CTA */}
      <div style={{ background: C.gold, padding: '32px 20px', textAlign: 'center' }}>
        <p style={{ color: C.navy, fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{t.contactT}</p>
        <p style={{ color: C.navy, opacity: .7, fontSize: 14, marginBottom: 16 }}>{t.contactDirect}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="tel:+34611044383" style={{ ...btn(C.navy, '#FFF'), padding: '10px 18px', fontSize: 14, textDecoration: 'none' }}><PhoneCall size={15} />+34 611 044 383</a>
          <a href="mailto:janire@mariatomasa.com" style={{ ...btn(C.white, C.navy), padding: '10px 18px', fontSize: 14, textDecoration: 'none' }}><Mail size={15} />janire@mariatomasa.com</a>
          <a href="https://wa.me/34611044383?text=Hola%20Janire%2C%20quiero%20informaci%C3%B3n%20sobre%20InmoCollab" target="_blank" rel="noopener noreferrer" style={{ ...btn('#25D366', '#FFF'), padding: '10px 18px', fontSize: 14, textDecoration: 'none' }}><MessageCircle size={15} />WhatsApp</a>
        </div>
        <button style={{ ...btn('transparent', C.navy), marginTop: 14, fontSize: 13, textDecoration: 'underline', border: 'none' }} onClick={() => nav('/contact')}>
          {t.contactSend} →
        </button>
      </div>
    </div>
  );
}
