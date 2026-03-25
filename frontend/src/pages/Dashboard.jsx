import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Calendar, Home, AlertTriangle, Award, Sparkles, Unlock, User, CheckCircle } from 'lucide-react';
import { C, btn, card, badge } from '../lib/colors.js';
import { useLang } from '../hooks/useLang.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api.js';

export default function Dashboard() {
  const { t } = useLang();
  const { user } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState({ properties: 0, clients: 0, visits: 0 });
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    Promise.all([api.getProperties({}), api.getClients(), api.getVisits(), api.getActivity()])
      .then(([props, clients, visits, acts]) => {
        setStats({ properties: props.length, clients: clients.length, visits: visits.length });
        setActivities(acts.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  const levelNames = { EXPLORER: t.lvl0, VERIFIED: t.lvl1, ACTIVE: t.lvl2, PREFERRED: t.lvl3 };
  const levelProgress = { EXPLORER: 15, VERIFIED: 40, ACTIVE: 70, PREFERRED: 100 };

  const statItems = [
    { label: t.totalProps, val: stats.properties, icon: Building2, color: C.info },
    { label: t.activeClients, val: stats.clients, icon: Users, color: C.ok },
    { label: t.schedVisits, val: stats.visits, icon: Calendar, color: C.warn },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 22, color: C.navy, marginBottom: 4 }}>{t.welcome}, {user?.name}</h1>
      <p style={{ color: C.gray, fontSize: 13, marginBottom: 20 }}>{user?.agency}</p>

      {/* FOMO */}
      {user?.role === 'AGENCY' && (
        <div style={{ ...card(), background: '#FEF3C7', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, borderLeft: `4px solid ${C.warn}` }}>
          <AlertTriangle size={20} color={C.warn} />
          <div>
            <p style={{ fontWeight: 700, color: C.text, margin: 0, fontSize: 14 }}>{t.fomo}</p>
            <p style={{ color: C.dgray, fontSize: 12, margin: 0 }}>3 {t.fomoNew} · 12 {t.fomoVis}</p>
          </div>
        </div>
      )}

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
        {statItems.map((s, i) => (
          <div key={i} style={card()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: C.gray, fontSize: 11, margin: '0 0 4px' }}>{s.label}</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: C.navy, margin: 0 }}>{s.val}</p>
              </div>
              <div style={{ background: `${s.color}15`, borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} color={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LEVEL */}
      {user?.role === 'AGENCY' && (
        <div style={{ ...card(), marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontWeight: 700, color: C.navy, margin: 0, fontSize: 14 }}>{t.progress}</p>
            <span style={badge(C.gold, C.navy)}><Award size={12} />{levelNames[user.level] || t.lvl0}</span>
          </div>
          <div style={{ background: C.lgray, borderRadius: 20, height: 8, marginBottom: 8 }}>
            <div style={{ background: `linear-gradient(90deg,${C.gold},${C.goldL})`, height: '100%', borderRadius: 20, width: `${levelProgress[user.level] || 15}%`, transition: 'width .5s' }} />
          </div>
          <p style={{ color: C.gray, fontSize: 11, margin: 0 }}>{t.lvlDesc}</p>
          {user.level === 'PREFERRED' && (
            <div style={{ background: '#FEF3C7', borderRadius: 8, padding: 10, marginTop: 10 }}>
              <p style={{ color: C.text, fontSize: 12, margin: 0 }}><Sparkles size={12} color={C.gold} style={{ verticalAlign: 'middle', marginRight: 4 }} />{t.prefBen}</p>
            </div>
          )}
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button style={btn(C.mid, C.white)} onClick={() => nav('/app/properties')}><Building2 size={14} />{t.browse}</button>
        <button style={btn(C.gold, C.navy)} onClick={() => nav('/app/legal')}><Home size={14} />{t.legal}</button>
      </div>

      {/* RECENT ACTIVITY */}
      <div style={card()}>
        <h3 style={{ fontSize: 15, color: C.navy, marginBottom: 12 }}>{t.recent}</h3>
        {activities.length === 0 ? <p style={{ color: C.gray, fontSize: 13 }}>No hay actividad reciente</p> :
          activities.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.lgray}` }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${C.info}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {a.action.includes('unlock') ? <Unlock size={14} color={C.info} /> : a.action.includes('client') ? <User size={14} color={C.ok} /> : a.action.includes('visit') ? <Calendar size={14} color={C.warn} /> : <CheckCircle size={14} color={C.ok} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: C.text, margin: 0 }}><b>{a.user?.name || a.user?.agency}</b> — {a.action}</p>
                <p style={{ fontSize: 11, color: C.gray, margin: 0 }}>{a.details} · {new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
