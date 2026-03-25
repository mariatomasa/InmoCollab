import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { C, card, badge } from '../lib/colors.js';
import { useLang } from '../hooks/useLang.jsx';
import { api } from '../lib/api.js';

export default function Visits() {
  const { t } = useLang();
  const [visits, setVisits] = useState([]);

  useEffect(() => { api.getVisits().then(setVisits).catch(() => {}); }, []);

  return (
    <div>
      <h1 style={{ fontSize: 22, color: C.navy, marginBottom: 16 }}>{t.visits}</h1>
      {visits.length === 0 ? <div style={{ ...card(), textAlign: 'center', padding: 40 }}><Calendar size={32} color={C.gray} /><p style={{ color: C.gray, marginTop: 8 }}>{t.noRes}</p></div> :
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visits.map(v => (
            <div key={v.id} style={{ ...card(), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>{v.property?.name}</p>
                <p style={{ fontSize: 12, color: C.gray, margin: 0 }}>{v.date} {v.time} · {v.client?.name || '—'}</p>
              </div>
              <span style={badge(v.status === 'CONFIRMED' ? C.ok : v.status === 'COMPLETED' ? C.info : C.warn)}>
                {v.status === 'CONFIRMED' ? t.confirmed : v.status === 'COMPLETED' ? t.completed : t.pending}
              </span>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
