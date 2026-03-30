import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, User, Building2, Filter, CheckCircle, XCircle, Eye, ChevronDown, ChevronUp, FileText, Phone } from 'lucide-react';
import { C, card, badge, btn } from '../lib/colors.js';
import { useLang } from '../hooks/useLang.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api.js';
import Modal from '../components/Modal.jsx';

const STATUS_CONFIG = {
  PENDING:   { color: '#F59E0B', icon: Clock,       bg: '#FEF3C7' },
  CONFIRMED: { color: '#3B82F6', icon: CheckCircle,  bg: '#DBEAFE' },
  COMPLETED: { color: '#10B981', icon: CheckCircle,  bg: '#D1FAE5' },
  CANCELLED: { color: '#EF4444', icon: XCircle,      bg: '#FEE2E2' },
};

export default function Visits({ showToast }) {
  const { t } = useLang();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterProperty, setFilterProperty] = useState('ALL');
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.getVisits();
      setVisits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Helpers ──
  const statusLabel = (status) => {
    const labels = {
      PENDING: t.visPending || 'Pendiente',
      CONFIRMED: t.visConfirmed || 'Confirmada',
      COMPLETED: t.visCompleted || 'Completada',
      CANCELLED: t.visCancelled || 'Cancelada',
    };
    return labels[status] || status;
  };

  const formatDate = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('es-ES', {
          weekday: 'short', day: 'numeric', month: 'short',
        });
      }
    } catch (_) {}
    return dateStr;
  };

  const isUpcoming = (dateStr) => {
    try {
      const visitDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return visitDate >= today;
    } catch (_) { return false; }
  };

  const handleStatusChange = async (visitId, newStatus) => {
    try {
      await api.updateVisitStatus(visitId, newStatus);
      showToast?.(t.visStatusUpdated || 'Estado de visita actualizado');
      setSelectedVisit(null);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Filtering & sorting ──
  const properties = [...new Set(visits.map(v => v.property?.name).filter(Boolean))];

  const filtered = visits.filter(v => {
    if (filterStatus !== 'ALL' && v.status !== filterStatus) return false;
    if (filterProperty !== 'ALL' && v.property?.name !== filterProperty) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    return sortAsc ? da - db : db - da;
  });

  // ── Stats ──
  const stats = {
    total: visits.length,
    pending: visits.filter(v => v.status === 'PENDING').length,
    confirmed: visits.filter(v => v.status === 'CONFIRMED').length,
    completed: visits.filter(v => v.status === 'COMPLETED').length,
    cancelled: visits.filter(v => v.status === 'CANCELLED').length,
  };

  if (loading) return <div style={{ color: C.gray, padding: 40, textAlign: 'center' }}>{t.loading || 'Cargando...'}</div>;

  // ── Summary cards ──
  const StatCard = ({ label, value, color, active, onClick }) => (
    <div
      onClick={onClick}
      style={{
        ...card(), padding: '14px 18px', cursor: 'pointer', flex: '1 1 120px', minWidth: 120,
        borderBottom: active ? `3px solid ${color}` : '3px solid transparent',
        transition: 'all .2s',
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: C.dgray, marginTop: 2 }}>{label}</div>
    </div>
  );

  // ── Visit card ──
  const VisitCard = ({ visit }) => {
    const cfg = STATUS_CONFIG[visit.status] || STATUS_CONFIG.PENDING;
    const Icon = cfg.icon;
    const upcoming = isUpcoming(visit.date);
    const isExpanded = expandedId === visit.id;

    return (
      <div style={{
        ...card(), padding: 0, marginBottom: 10, overflow: 'hidden',
        borderLeft: `4px solid ${cfg.color}`,
        opacity: visit.status === 'CANCELLED' ? 0.6 : 1,
      }}>
        {/* Main row */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}
          onClick={() => setExpandedId(isExpanded ? null : visit.id)}
        >
          {/* Date block */}
          <div style={{
            width: 52, height: 52, borderRadius: 10, background: cfg.bg,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Calendar size={14} color={cfg.color} />
            <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, marginTop: 2 }}>
              {visit.date.split('-')[2]}/{visit.date.split('-')[1]}
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {visit.property?.name || '—'}
              </span>
              {upcoming && visit.status !== 'COMPLETED' && visit.status !== 'CANCELLED' && (
                <span style={{ fontSize: 9, fontWeight: 700, color: C.white, background: C.info, padding: '1px 6px', borderRadius: 10 }}>
                  {t.visUpcoming || 'Próxima'}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: C.dgray, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Clock size={11} /> {visit.time}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <User size={11} /> {visit.client?.name || '—'}
              </span>
              {visit.property?.zone && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <MapPin size={11} /> {visit.property.zone}
                </span>
              )}
            </div>
          </div>

          {/* Status badge + expand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ ...badge(cfg.color), fontSize: 11 }}>
              <Icon size={12} /> {statusLabel(visit.status)}
            </span>
            {isExpanded ? <ChevronUp size={16} color={C.gray} /> : <ChevronDown size={16} color={C.gray} />}
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div style={{ borderTop: `1px solid ${C.lgray}`, padding: '14px 18px', background: C.off }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: C.gray, marginBottom: 2 }}>{t.visDate || 'Fecha'}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{formatDate(visit.date)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.gray, marginBottom: 2 }}>{t.visTime || 'Hora'}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{visit.time}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.gray, marginBottom: 2 }}>{t.visClient || 'Cliente'}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{visit.client?.name || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.gray, marginBottom: 2 }}>{t.visProperty || 'Promoción'}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{visit.property?.name || '—'}</div>
              </div>
            </div>

            {visit.notes && (
              <div style={{ background: C.white, borderRadius: 8, padding: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: C.gray, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FileText size={11} /> {t.visNotes || 'Observaciones'}
                </div>
                <div style={{ fontSize: 13, color: C.text }}>{visit.notes}</div>
              </div>
            )}

            {/* Admin actions */}
            {isAdmin && visit.status !== 'COMPLETED' && visit.status !== 'CANCELLED' && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {visit.status === 'PENDING' && (
                  <button
                    style={{ ...btn('#3B82F6'), padding: '7px 14px', fontSize: 12, borderRadius: 8 }}
                    onClick={(e) => { e.stopPropagation(); handleStatusChange(visit.id, 'CONFIRMED'); }}
                  >
                    <CheckCircle size={13} /> {t.visConfirm || 'Confirmar'}
                  </button>
                )}
                {(visit.status === 'PENDING' || visit.status === 'CONFIRMED') && (
                  <button
                    style={{ ...btn('#10B981'), padding: '7px 14px', fontSize: 12, borderRadius: 8 }}
                    onClick={(e) => { e.stopPropagation(); handleStatusChange(visit.id, 'COMPLETED'); }}
                  >
                    <CheckCircle size={13} /> {t.visComplete || 'Completar'}
                  </button>
                )}
                <button
                  style={{ ...btn(C.lgray, C.err), padding: '7px 14px', fontSize: 12, borderRadius: 8 }}
                  onClick={(e) => { e.stopPropagation(); handleStatusChange(visit.id, 'CANCELLED'); }}
                >
                  <XCircle size={13} /> {t.visCancel || 'Cancelar'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: C.navy }}>{t.visTitle || 'Visitas'}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.dgray }}>{t.visSubtitle || 'Gestión y seguimiento de todas las visitas programadas'}</p>
        </div>
        <button
          style={{ ...btn(C.off, C.dgray), padding: '8px 14px', fontSize: 12 }}
          onClick={() => setSortAsc(!sortAsc)}
        >
          <Calendar size={14} /> {sortAsc ? (t.visOldFirst || 'Más antiguas') : (t.visNewFirst || 'Más recientes')}
          {sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard
          label={t.visAll || 'Total'}
          value={stats.total} color={C.navy}
          active={filterStatus === 'ALL'}
          onClick={() => setFilterStatus('ALL')}
        />
        <StatCard
          label={t.visPending || 'Pendientes'}
          value={stats.pending} color="#F59E0B"
          active={filterStatus === 'PENDING'}
          onClick={() => setFilterStatus('PENDING')}
        />
        <StatCard
          label={t.visConfirmed || 'Confirmadas'}
          value={stats.confirmed} color="#3B82F6"
          active={filterStatus === 'CONFIRMED'}
          onClick={() => setFilterStatus('CONFIRMED')}
        />
        <StatCard
          label={t.visCompleted || 'Completadas'}
          value={stats.completed} color="#10B981"
          active={filterStatus === 'COMPLETED'}
          onClick={() => setFilterStatus('COMPLETED')}
        />
        <StatCard
          label={t.visCancelled || 'Canceladas'}
          value={stats.cancelled} color="#EF4444"
          active={filterStatus === 'CANCELLED'}
          onClick={() => setFilterStatus('CANCELLED')}
        />
      </div>

      {/* Property filter */}
      {properties.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Filter size={14} color={C.gray} />
          <select
            value={filterProperty}
            onChange={e => setFilterProperty(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.lgray}`,
              fontSize: 12, color: C.text, background: C.white, cursor: 'pointer',
            }}
          >
            <option value="ALL">{t.visAllProperties || 'Todas las promociones'}</option>
            {properties.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}

      {/* Visit list */}
      {sorted.length === 0 ? (
        <div style={{ ...card(), textAlign: 'center', padding: 50 }}>
          <Calendar size={36} color={C.lgray} />
          <p style={{ color: C.gray, fontSize: 14, marginTop: 12 }}>
            {filterStatus !== 'ALL' || filterProperty !== 'ALL'
              ? (t.visNoFiltered || 'No hay visitas con estos filtros')
              : (t.visEmpty || 'No hay visitas programadas todavía')
            }
          </p>
          <p style={{ color: C.dgray, fontSize: 12 }}>
            {t.visEmptyHint || 'Las visitas se crean desde la ficha de cada promoción al registrar un cliente.'}
          </p>
        </div>
      ) : (
        <div>
          {sorted.map(v => <VisitCard key={v.id} visit={v} />)}
        </div>
      )}
    </div>
  );
}
