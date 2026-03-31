import { useState, useEffect, useCallback } from 'react';
import { Users, Building2, Calendar, ShieldCheck, Clock, CheckCircle, XCircle, ArrowRight, Bell, BarChart3, Activity, Briefcase } from 'lucide-react';
import { C, btn, card, badge } from '../lib/colors.js';
import { useLang } from '../hooks/useLang.jsx';
import { api } from '../lib/api.js';

const STAGE_COLORS = {
  REGISTRO: '#6B7280', VERIFICACION: '#F59E0B', VERIFICADO: '#10B981',
  CONTACTO_PROMOTORA: '#8B5CF6', CITA_AGENDADA: '#3B82F6', VISITA_REALIZADA: '#06B6D4',
  NEGOCIACION: '#F97316', RESERVA: '#EC4899', CERRADO: '#059669', DESCARTADO: '#EF4444',
};
const STAGE_LABELS = {
  REGISTRO: 'Registro', VERIFICACION: 'Verificación', VERIFICADO: 'Verificado',
  CONTACTO_PROMOTORA: 'Contacto', CITA_AGENDADA: 'Cita', VISITA_REALIZADA: 'Visita',
  NEGOCIACION: 'Negociación', RESERVA: 'Reserva', CERRADO: 'Cerrado', DESCARTADO: 'Descartado',
};

export default function AdminPanel({ showToast }) {
  const { t } = useLang();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState({});

  const load = useCallback(async () => {
    try {
      const d = await api.getAdminDashboard();
      setData(d);
    } catch (err) {
      showToast?.('Error al cargar el panel');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (clientId, status) => {
    setVerifying(v => ({ ...v, [clientId]: true }));
    try {
      await api.verifyClient(clientId, status);
      showToast?.(status === 'VERIFIED' ? '✅ Cliente verificado' : '❌ Cliente rechazado');
      load();
    } catch (err) {
      showToast?.(err.message);
    } finally {
      setVerifying(v => ({ ...v, [clientId]: false }));
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: C.gray }}>
      <Clock size={18} style={{ marginRight: 8 }} />{t.loading}
    </div>
  );

  if (!data) return null;
  const { stats, pendingClients, todayVisits, pipeline, recentActivity } = data;

  const statCards = [
    { label: t.totalProps, val: stats.totalProperties, icon: Building2, color: C.info },
    { label: t.activeClients, val: stats.totalClients, icon: Users, color: C.ok },
    { label: t.schedVisits, val: stats.totalVisits, icon: Calendar, color: C.warn },
    { label: t.adminAgencies, val: stats.totalUsers, icon: Briefcase, color: '#8B5CF6' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, color: C.navy, margin: 0 }}>{t.adminTitle}</h1>
        <p style={{ color: C.gray, fontSize: 13, margin: '4px 0 0' }}>{t.adminSubtitle}</p>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <div key={i} style={card()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: C.gray, fontSize: 11, margin: '0 0 4px' }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: C.navy, margin: 0 }}>{s.val}</p>
              </div>
              <div style={{ background: `${s.color}15`, borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={20} color={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* PENDING VERIFICATIONS */}
        <div style={{ gridColumn: pendingClients.length > 0 ? '1 / -1' : '1' }}>
          <div style={card()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Bell size={16} color={pendingClients.length > 0 ? C.warn : C.gray} />
              <h3 style={{ margin: 0, fontSize: 15, color: C.navy }}>{t.adminPending}</h3>
              {pendingClients.length > 0 && (
                <span style={{ ...badge(C.warn, C.navy), marginLeft: 4 }}>{pendingClients.length}</span>
              )}
            </div>

            {pendingClients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: C.gray }}>
                <CheckCircle size={32} color={C.ok} style={{ marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 13 }}>{t.adminNoPending}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingClients.map(c => (
                  <div key={c.id} style={{ background: '#FEF3C7', borderRadius: 10, padding: 14, borderLeft: `4px solid ${C.warn}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: C.dgray, marginTop: 2 }}>DNI: {c.dni} · {c.phone}</div>
                        <div style={{ fontSize: 12, color: C.dgray }}>
                          <Building2 size={11} style={{ verticalAlign: 'middle' }} /> {c.property?.name} · {c.property?.zone}
                        </div>
                        <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>
                          Agencia: <strong>{c.user?.agency}</strong> ({c.user?.name})
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button
                          style={{ ...btn(C.ok, C.white), padding: '6px 14px', fontSize: 12, opacity: verifying[c.id] ? 0.6 : 1 }}
                          disabled={verifying[c.id]}
                          onClick={() => handleVerify(c.id, 'VERIFIED')}>
                          <CheckCircle size={13} />{t.adminVerify}
                        </button>
                        <button
                          style={{ ...btn(C.err, C.white), padding: '6px 14px', fontSize: 12, opacity: verifying[c.id] ? 0.6 : 1 }}
                          disabled={verifying[c.id]}
                          onClick={() => handleVerify(c.id, 'REJECTED')}>
                          <XCircle size={13} />{t.adminReject}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* TODAY'S VISITS */}
        <div style={card()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Calendar size={16} color={C.info} />
            <h3 style={{ margin: 0, fontSize: 15, color: C.navy }}>{t.adminTodayVisits}</h3>
            {todayVisits.length > 0 && <span style={{ ...badge(C.info), marginLeft: 4 }}>{todayVisits.length}</span>}
          </div>
          {todayVisits.length === 0 ? (
            <p style={{ color: C.gray, fontSize: 13, textAlign: 'center', padding: '16px 0', margin: 0 }}>{t.adminNoVisits}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayVisits.map(v => (
                <div key={v.id} style={{ background: C.off, borderRadius: 8, padding: 12, borderLeft: `3px solid ${v.status === 'CONFIRMED' ? C.ok : v.status === 'CANCELLED' ? C.err : C.info}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{v.client?.name}</div>
                      <div style={{ fontSize: 11, color: C.dgray }}>{v.property?.name} · {v.time}</div>
                      <div style={{ fontSize: 11, color: C.gray }}>{v.user?.agency}</div>
                    </div>
                    <span style={{ ...badge(v.status === 'CONFIRMED' ? C.ok : v.status === 'CANCELLED' ? C.err : C.info), fontSize: 10 }}>
                      {v.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PIPELINE OVERVIEW */}
        <div style={card()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BarChart3 size={16} color={C.navy} />
            <h3 style={{ margin: 0, fontSize: 15, color: C.navy }}>{t.adminPipeline}</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(STAGE_LABELS).map(([key, label]) => {
              const count = pipeline[key] || 0;
              if (count === 0 && key === 'DESCARTADO') return null;
              const color = STAGE_COLORS[key];
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: C.dgray, flex: 1 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: count > 0 ? C.text : C.lgray }}>{count}</span>
                  {count > 0 && (
                    <div style={{ width: Math.max(4, count * 8), height: 4, background: color, borderRadius: 2, maxWidth: 80 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div style={card()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Activity size={16} color={C.navy} />
          <h3 style={{ margin: 0, fontSize: 15, color: C.navy }}>{t.recent}</h3>
        </div>
        {recentActivity.length === 0 ? (
          <p style={{ color: C.gray, fontSize: 13, margin: 0 }}>Sin actividad reciente</p>
        ) : (
          <div>
            {recentActivity.map((a, i) => {
              const colors = { client_registered: C.ok, property_unlocked: C.info, visit_requested: C.warn, pipeline_stage_changed: '#8B5CF6' };
              const color = colors[a.action] || C.gray;
              return (
                <div key={a.id} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < recentActivity.length - 1 ? `1px solid ${C.lgray}` : 'none', alignItems: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, color: C.text }}><strong>{a.user?.agency || a.user?.name}</strong> — {a.details}</span>
                  </div>
                  <span style={{ fontSize: 11, color: C.gray, flexShrink: 0 }}>
                    {new Date(a.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
