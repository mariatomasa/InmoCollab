import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize, Lock, Flame, Sparkles, AlertTriangle, ChevronRight } from 'lucide-react';
import { C, btn, card, badge } from '../lib/colors.js';
import { useLang } from '../hooks/useLang.jsx';
import { api } from '../lib/api.js';

export default function Properties() {
  const { t, lang } = useLang();
  const nav = useNavigate();
  const [properties, setProperties] = useState([]);
  const [q, setQ] = useState('');
  const [zn, setZn] = useState('');
  const [tp, setTp] = useState('');
  const [zones, setZones] = useState([]);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    api.getProperties({}).then(setProperties).catch(() => {});
    api.getFilters().then(f => { setZones(f.zones); setTypes(f.types); }).catch(() => {});
  }, []);

  const filtered = properties.filter(p => {
    if (zn && p.zone !== zn) return false;
    if (tp && p.type !== tp) return false;
    if (q) { const s = q.toLowerCase(); if (!p.name.toLowerCase().includes(s) && !p.zone.toLowerCase().includes(s)) return false; }
    return true;
  });

  return (
    <div>
      <h1 style={{ fontSize: 22, color: C.navy, marginBottom: 16 }}>{t.properties}</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.search} style={{ flex: 1, minWidth: 180, padding: '8px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8 }} />
        <select value={zn} onChange={e => setZn(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8 }}>
          <option value="">{t.allZones}</option>{zones.map(z => <option key={z}>{z}</option>)}
        </select>
        <select value={tp} onChange={e => setTp(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${C.lgray}`, borderRadius: 8 }}>
          <option value="">{t.allTypes}</option>{types.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? <p style={{ color: C.gray, textAlign: 'center', padding: 40 }}>{t.noRes}</p> :
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {filtered.map(p => (
            <div key={p.id} style={{ ...card(), padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform .2s', border: `1px solid ${C.lgray}` }} onClick={() => nav(`/app/properties/${p.id}`)}>
              <div style={{ height: 140, background: p.gradient, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 12 }}>
                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {p.hot && <span style={badge(C.err)}><Flame size={10} />{t.hotP}</span>}
                  {p.isNew && <span style={badge(C.ok)}><Sparkles size={10} />{t.newP}</span>}
                  {p.availUnits <= 5 && <span style={badge(C.warn, C.navy)}><AlertTriangle size={10} />{t.lastU}</span>}
                </div>
                <div style={{ position: 'absolute', top: 8, left: 8, ...badge(C.navy + 'DD') }}><Lock size={10} />{t.blind}</div>
                <p style={{ color: C.white, fontWeight: 800, fontSize: 16, margin: 0, textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>{p.name}</p>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.dgray, fontSize: 12 }}><MapPin size={12} />{p.zone}</span>
                  <span style={{ color: C.navy, fontWeight: 800 }}>{t.from} {p.price.toLocaleString()}€</span>
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: C.dgray, display: 'flex', alignItems: 'center', gap: 3 }}><BedDouble size={12} />{p.bedrooms}</span>
                  <span style={{ fontSize: 12, color: C.dgray, display: 'flex', alignItems: 'center', gap: 3 }}><Bath size={12} />{p.bathrooms}</span>
                  <span style={{ fontSize: 12, color: C.dgray, display: 'flex', alignItems: 'center', gap: 3 }}><Maximize size={12} />{p.area}m²</span>
                  <span style={{ fontSize: 12, color: C.dgray }}>{p.type}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                  {p.soldWeek > 0 && <span style={{ fontSize: 11, color: C.err, fontWeight: 600 }}>{p.soldWeek} {t.soldW}</span>}
                  <span style={{ fontSize: 11, color: C.info }}>{p.viewsToday} {t.viewsD}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: C.gray }}>{p.availUnits}/{p.totalUnits} {t.units}</span>
                  <span style={{ ...btn(C.gold, C.navy), padding: '6px 14px', fontSize: 12 }}>{t.viewDetails} <ChevronRight size={12} /></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
