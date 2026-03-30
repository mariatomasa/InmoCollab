import { useState, useEffect, useCallback } from 'react';
import { Unlock, User, Calendar, CheckCircle, ArrowRight, AlertTriangle, FileText, Building2, Filter, Clock, BarChart3, ChevronDown } from 'lucide-react';
import { C, card, badge, btn } from '../lib/colors.js';
import { useLang } from '../hooks/useLang.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api.js';

const ACTION_CONFIG = {
  property_unlocked:     { icon: Unlock,        color: '#3B82F6', bg: '#DBEAFE' },
  client_registered:     { icon: User,           color: '#10B981', bg: '#D1FAE5' },
  visit_requested:       { icon: Calendar,       color: '#F59E0B', bg: '#FEF3C7' },
  client_verified:       { icon: CheckCircle,    color: '#059669', bg: '#D1FAE5' },
  client_rejected:       { icon: AlertTriangle,  color: '#EF4444', bg: '#FEE2E2' },
  pipeline_stage_changed:{ icon: ArrowRight,     color: '#8B5CF6', bg: '#EDE9FE' },
};

const DEFAULT_CONFIG = { icon: FileText, color: '#6B7280', bg: '#F3F4F6' };

function getConfig(action) {
  for (const [key, cfg] of Object.entries(ACTION_CONFIG)) {
    if (action.includes(key)) return cfg;
  }
  return DEFAULT_CONFIG;
}

export default function Activity() {
  const { t } = useLang();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterAgency, setFilterAgency] = useState('ALL');
  const [showCount, setShowCount] = useState(20);

  const load = useCallback(async () => {
    try {
      const data = await api.getActivity();
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Helpers ──
  const actionLabel = (action) => {
    if (action.includes('unlock'))   return t.actUnlock   || 'Desbloqueo de ficha';
    if (action.includes('client_registered'))  return t.actClient   || 'Nuevo cliente';
    if (action.includes('visit'))    return t.actVisit    || 'Visita solicitada';
    if (action.includes('verified')) return t.actVerified || 'Cliente verificado';
    if (action.includes('rejected')) return t.actRejected || 'Cliente rechazado';
    if (action.includes('pipeline')) return t.actPipeline || 'Cambio de etapa';
    return action;
  };

  const formatDateTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = now - d;
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      let relative;
      if (mins < 1)       relative = t.actJustNow   || 'Ahora mismo';
      else if (mins < 60) relative = `${mins} min`;
      else if (hours < 24) relative = `${hours}h`;
      else if (days < 7)  relative = `${days}d`;
      else relative = null;

      const full = d.toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });

      return { relative, full };
    } catch (_) {
      return { relative: null, full: dateStr };
    }
  };

  // ── Filtering ──
  const actionTypes = [...new Set(activities.map(a => {
    if (a.action.includes('unlock'))   return 'unlock';
    if (a.action.includes('client_registered'))  return 'client';
    if (a.action.includes('visit'))    return 'visit';
    if (a.action.includes('verified')) return 'verified';
    if (a.action.includes('rejected')) return 'rejected';
    if (a.action.includes('pipeline')) return 'pipeline';
    return 'other';
  }))];

  const agencies = isAdmin
    ? [...new Set(activities.map(a => a.user?.agency).filter(Boolean))]
    : [];

  const filtered = activities.filter(a => {
    if (filterType !== 'ALL') {
      const type = a.action.includes('unlock') ? 'unlock'
        : a.action.includes('client_registered') ? 'client'
        : a.action.includes('visit') ? 'visit'
        : a.action.includes('verified') ? 'verified'
        : a.action.includes('rejected') ? 'rejected'
        : a.action.includes('pipeline') ? 'pipeline'
        : 'other';
      if (type !== filterType) return false;
    }
    if (filterAgency !== 'ALL' && a.user?.agency !== filterAgency) return false;
    return true;
  });

  const visible = filtered.slice(0, showCount);
  const hasMore = filtered.length > showCount;

  // ── Stats ──
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = activities.filter(a => new Date(a.createdAt) >= today).length;

  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);
  const weekCount = activities.filter(a => new Date(a.createdAt) >= thisWeek).length;

  if (loading) return <div style={{ color: C.gray, padding: 40, textAlign: 'center' }}>{t.loading || 'Cargando...'}</div>;

  // ── Group by date ──
  const groupByDate = (items) => {
    const groups = {};
    items.forEach(a => {
      const d = new Date(a.createdAt);
      const todayDate = new Date();
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);

      let label;
      if (d.toDateString() === todayDate.toDateString()) label = t.actToday || 'Hoy';
      else if (d.toDateString() === yesterdayDate.toDateString()) label = t.actYesterday || 'Ayer';
      else label = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

      if (!groups[label]) groups[label] = [];
      groups[label].push(a);
    });
    return groups;
  };

  const groups = groupByDate(visible);

  const typeFilterLabel = (type) => {
    const labels = {
      unlock: t.actUnlock || 'Desbloqueos',
      client: t.actClient || 'Clientes',
      visit: t.actVisit || 'Visitas',
      verified: t.actVerified || 'Verificados',
      rejected: t.actRejected || 'Rechazados',
      pipeline: t.actPipeline || 'Pipeline',
      other: t.actOther || 'Otros',
    };
    return labels[type] || type;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: C.navy }}>{t.actTitle || 'Actividad'}</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: C.dgray }}>{t.actSubtitle || 'Registro completo de toda la actividad en la plataforma'}</p>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ ...card(), padding: '14px 18px', flex: '1 1 140px', minWidth: 140 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={16} color={C.info} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>{todayCount}</div>
              <div style={{ fontSize: 11, color: C.dgray }}>{t.actToday || 'Hoy'}</div>
            </div>
          </div>
        </div>
        <div style={{ ...card(), padding: '14px 18px', flex: '1 1 140px', minWidth: 140 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={16} color={C.ok} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>{weekCount}</div>
              <div style={{ fontSize: 11, color: C.dgray }}>{t.actThisWeek || 'Esta semana'}</div>
            </div>
          </div>
        </div>
        <div style={{ ...card(), padding: '14px 18px', flex: '1 1 140px', minWidth: 140 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={16} color={C.dgray} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>{activities.length}</div>
              <div style={{ fontSize: 11, color: C.dgray }}>{t.actTotal || 'Total registros'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={14} color={C.gray} />
        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value); setShowCount(20); }}
          style={{
            padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.lgray}`,
            fontSize: 12, color: C.text, background: C.white, cursor: 'pointer',
          }}
        >
          <option value="ALL">{t.actAllTypes || 'Todos los tipos'}</option>
          {actionTypes.map(type => (
            <option key={type} value={type}>{typeFilterLabel(type)}</option>
          ))}
        </select>

        {isAdmin && agencies.length > 1 && (
          <select
            value={filterAgency}
            onChange={e => { setFilterAgency(e.target.value); setShowCount(20); }}
            style={{
              padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.lgray}`,
              fontSize: 12, color: C.text, background: C.white, cursor: 'pointer',
            }}
          >
            <option value="ALL">{t.actAllAgencies || 'Todas las agencias'}</option>
            {agencies.map(ag => <option key={ag} value={ag}>{ag}</option>)}
          </select>
        )}

        {(filterType !== 'ALL' || filterAgency !== 'ALL') && (
          <button
            style={{ ...btn(C.lgray, C.dgray), padding: '6px 12px', fontSize: 11, borderRadius: 6 }}
            onClick={() => { setFilterType('ALL'); setFilterAgency('ALL'); }}
          >
            {t.actClearFilters || 'Limpiar filtros'}
          </button>
        )}
      </div>

      {/* Activity timeline */}
      {filtered.length === 0 ? (
        <div style={{ ...card(), textAlign: 'center', padding: 50 }}>
          <FileText size={36} color={C.lgray} />
          <p style={{ color: C.gray, fontSize: 14, marginTop: 12 }}>
            {filterType !== 'ALL' || filterAgency !== 'ALL'
              ? (t.actNoFiltered || 'No hay actividad con estos filtros')
              : (t.actEmpty || 'No hay actividad registrada todavía')
            }
          </p>
        </div>
      ) : (
        <div>
          {Object.entries(groups).map(([dateLabel, items]) => (
            <div key={dateLabel} style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: C.dgray, textTransform: 'capitalize',
                padding: '6px 0', marginBottom: 8, borderBottom: `1px solid ${C.lgray}`,
              }}>
                {dateLabel}
              </div>

              {items.map((a, i) => {
                const cfg = getConfig(a.action);
                const Icon = cfg.icon;
                const time = formatDateTime(a.createdAt);
                const isLast = i === items.length - 1;

                return (
                  <div key={a.id} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                    {/* Timeline line */}
                    {!isLast && (
                      <div style={{
                        position: 'absolute', left: 17, top: 40, bottom: -8, width: 2,
                        background: C.lgray,
                      }} />
                    )}

                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', background: cfg.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      zIndex: 1,
                    }}>
                      <Icon size={15} color={cfg.color} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, paddingBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{actionLabel(a.action)}</span>
                          {isAdmin && a.user?.agency && (
                            <span style={{ fontSize: 11, color: C.dgray, marginLeft: 8 }}>
                              <Building2 size={10} style={{ verticalAlign: 'middle' }} /> {a.user.agency}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: C.gray, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {time.relative || time.full}
                        </span>
                      </div>

                      {a.details && (
                        <div style={{ fontSize: 12, color: C.dgray, marginTop: 3 }}>{a.details}</div>
                      )}

                      <div style={{ fontSize: 11, color: C.gray, marginTop: 3 }}>
                        <User size={10} style={{ verticalAlign: 'middle' }} /> {a.user?.name || '—'}
                        {time.relative && (
                          <span style={{ marginLeft: 8 }}>
                            <Clock size={10} style={{ verticalAlign: 'middle' }} /> {time.full}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Load more */}
          {hasMore && (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <button
                style={{ ...btn(C.off, C.dgray), padding: '10px 24px', fontSize: 13 }}
                onClick={() => setShowCount(prev => prev + 20)}
              >
                <ChevronDown size={14} /> {t.actLoadMore || 'Ver más actividad'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
