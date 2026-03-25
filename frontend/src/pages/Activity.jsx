import { useState, useEffect } from 'react';
import { Unlock, User, Calendar, CheckCircle } from 'lucide-react';
import { C, card } from '../lib/colors.js';
import { useLang } from '../hooks/useLang.jsx';
import { api } from '../lib/api.js';

export default function Activity() {
  const { t } = useLang();
  const [activities, setActivities] = useState([]);

  useEffect(() => { api.getActivity().then(setActivities).catch(() => {}); }, []);

  return (
    <div>
      <h1 style={{ fontSize: 22, color: C.navy, marginBottom: 16 }}>{t.activity}</h1>
      <div style={card()}>
        {activities.length === 0 ? <p style={{ color: C.gray, fontSize: 13 }}>No hay actividad</p> :
          activities.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.lgray}` }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${C.info}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {a.action.includes('unlock') ? <Unlock size={15} color={C.info} /> : a.action.includes('client') ? <User size={15} color={C.ok} /> : a.action.includes('visit') ? <Calendar size={15} color={C.warn} /> : <CheckCircle size={15} color={C.ok} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: C.text, margin: 0, fontWeight: 600 }}>{a.user?.name}</p>
                <p style={{ fontSize: 12, color: C.dgray, margin: 0 }}>{a.action} — {a.details}</p>
              </div>
              <span style={{ fontSize: 11, color: C.gray }}>{new Date(a.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
