import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, MessageSquarePlus, Clock, User, Building2, Phone, Mail, ArrowRight, X, Filter, BarChart3 } from 'lucide-react';
import { api } from '../lib/api.js';
import { C, btn, card, badge } from '../lib/colors.js';
import { useLang } from '../hooks/useLang.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import Modal from '../components/Modal.jsx';

const STAGES = [
  { key: 'REGISTRO', color: '#6B7280' },
  { key: 'VERIFICACION', color: '#F59E0B' },
  { key: 'VERIFICADO', color: '#10B981' },
  { key: 'CONTACTO_PROMOTORA', color: '#8B5CF6' },
  { key: 'CITA_AGENDADA', color: '#3B82F6' },
  { key: 'VISITA_REALIZADA', color: '#06B6D4' },
  { key: 'NEGOCIACION', color: '#F97316' },
  { key: 'RESERVA', color: '#EC4899' },
  { key: 'CERRADO', color: '#059669' },
  { key: 'DESCARTADO', color: '#EF4444' },
];

const ACTIVE_STAGES = STAGES.filter(s => s.key !== 'DESCARTADO');

export default function Pipeline({ showToast }) {
  const { t } = useLang();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [clients, setClients] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('board'); // 'board' or 'list'
  const [selectedClient, setSelectedClient] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(null);
  const [moveNote, setMoveNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [filterAgency, setFilterAgency] = useState('');

  const load = useCallback(async () => {
    try {
      const [pData, sData] = await Promise.all([
        api.getPipeline(),
        api.getPipelineSummary(),
      ]);
      setClients(pData);
      setSummary(sData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMove = async (clientId, newStage) => {
    try {
      await api.updatePipelineStage(clientId, newStage, moveNote || undefined);
      setShowMoveModal(null);
      setMoveNote('');
      showToast?.(t.pipeMoved || 'Etapa actualizada');
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickMove = async (clientId, newStage) => {
    try {
      await api.updatePipelineStage(clientId, newStage);
      showToast?.(t.pipeMoved || 'Etapa actualizada');
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (clientId) => {
    if (!noteText.trim()) return;
    try {
      await api.addPipelineNote(clientId, noteText);
      setShowNoteModal(null);
      setNoteText('');
      showToast?.(t.pipeNoteAdded || 'Nota añadida');
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredClients = filterAgency
    ? clients.filter(c => c.user?.agency?.toLowerCase().includes(filterAgency.toLowerCase()))
    : clients;

  const clientsByStage = (stageKey) =>
    filteredClients.filter(c => c.pipelineStage === stageKey);

  const getStageInfo = (key) => STAGES.find(s => s.key === key) || STAGES[0];

  const stageLabel = (key) => {
    const labels = {
      REGISTRO: t.pipeRegistro || 'Registro',
      VERIFICACION: t.pipeVerificacion || 'Verificación',
      VERIFICADO: t.pipeVerificado || 'Verificado',
      CONTACTO_PROMOTORA: t.pipeContacto || 'Contacto promotora',
      CITA_AGENDADA: t.pipeCita || 'Cita agendada',
      VISITA_REALIZADA: t.pipeVisita || 'Visita realizada',
      NEGOCIACION: t.pipeNegociacion || 'Negociación',
      RESERVA: t.pipeReserva || 'Reserva',
      CERRADO: t.pipeCerrado || 'Cerrado',
      DESCARTADO: t.pipeDescartado || 'Descartado',
    };
    return labels[key] || key;
  };

  const nextStage = (currentKey) => {
    const idx = ACTIVE_STAGES.findIndex(s => s.key === currentKey);
    if (idx >= 0 && idx < ACTIVE_STAGES.length - 1) return ACTIVE_STAGES[idx + 1].key;
    return null;
  };

  const timeSince = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return t.pipeToday || 'Hoy';
    if (days === 1) return t.pipeYesterday || 'Ayer';
    return `${days} ${t.pipeDaysAgo || 'días'}`;
  };

  if (loading) return <div style={{ color: C.gray, padding: 40, textAlign: 'center' }}>{t.loading || 'Cargando...'}</div>;

  // ── Summary bar ──
  const SummaryBar = () => (
    <div style={{ ...card(), marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <BarChart3 size={18} color={C.navy} />
      {STAGES.map(s => {
        const count = summary[s.key] || 0;
        if (s.key === 'DESCARTADO' && count === 0) return null;
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: `${s.color}15`, fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
            <span style={{ color: C.text, fontWeight: 500 }}>{count}</span>
            <span style={{ color: C.dgray }}>{stageLabel(s.key)}</span>
          </div>
        );
      })}
    </div>
  );

  // ── Client card ──
  const ClientCard = ({ client }) => {
    const stageInfo = getStageInfo(client.pipelineStage);
    const next = nextStage(client.pipelineStage);
    const lastEvent = client.pipelineEvents?.[0];
    const lastVisit = client.visits?.[0];

    return (
      <div style={{ ...card(), padding: 14, marginBottom: 10, borderLeft: `4px solid ${stageInfo.color}`, cursor: 'pointer' }}
        onClick={() => setSelectedClient(client)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{client.name}</div>
            <div style={{ fontSize: 12, color: C.dgray, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Building2 size={12} />{client.property?.name} · {client.property?.zone}
            </div>
          </div>
          <span style={{ ...badge(stageInfo.color), fontSize: 10 }}>{stageLabel(client.pipelineStage)}</span>
        </div>

        {isAdmin && client.user && (
          <div style={{ fontSize: 11, color: C.gray, marginBottom: 4 }}>
            <User size={11} /> {client.user.name} ({client.user.agency})
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.gray, marginBottom: 6 }}>
          <Clock size={11} /> {timeSince(client.updatedAt)}
          {lastEvent?.note && (
            <span style={{ color: C.dgray, fontStyle: 'italic' }}>— {lastEvent.note.slice(0, 40)}{lastEvent.note.length > 40 ? '…' : ''}</span>
          )}
        </div>

        {lastVisit && (
          <div style={{ fontSize: 11, color: C.info, marginBottom: 6 }}>
            📅 {t.pipeVisitOn || 'Visita'}: {lastVisit.date} {lastVisit.time} ({lastVisit.status})
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, marginTop: 4 }} onClick={e => e.stopPropagation()}>
          {next && (
            <button style={{ ...btn(stageInfo.color), padding: '4px 10px', fontSize: 11, borderRadius: 6 }}
              onClick={() => handleQuickMove(client.id, next)}>
              <ArrowRight size={12} /> {stageLabel(next)}
            </button>
          )}
          {client.pipelineStage !== 'DESCARTADO' && client.pipelineStage !== 'CERRADO' && (
            <button style={{ ...btn(C.lgray, C.dgray), padding: '4px 10px', fontSize: 11, borderRadius: 6 }}
              onClick={() => { setShowMoveModal(client); setMoveNote(''); }}>
              {t.pipeChangeStage || 'Cambiar etapa'}
            </button>
          )}
          <button style={{ ...btn(C.lgray, C.dgray), padding: '4px 10px', fontSize: 11, borderRadius: 6 }}
            onClick={() => { setShowNoteModal(client); setNoteText(''); }}>
            <MessageSquarePlus size={12} />
          </button>
        </div>
      </div>
    );
  };

  // ── Board view (Kanban) ──
  const BoardView = () => (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 20 }}>
      {ACTIVE_STAGES.map(stage => {
        const stageClients = clientsByStage(stage.key);
        return (
          <div key={stage.key} style={{ minWidth: 280, maxWidth: 300, flex: '0 0 280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: `${stage.color}15`, borderRadius: '10px 10px 0 0', borderBottom: `3px solid ${stage.color}` }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color }} />
              <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{stageLabel(stage.key)}</span>
              <span style={{ ...badge(stage.color), fontSize: 10, marginLeft: 'auto' }}>{stageClients.length}</span>
            </div>
            <div style={{ background: `${stage.color}08`, borderRadius: '0 0 10px 10px', padding: 8, minHeight: 100 }}>
              {stageClients.length === 0 && (
                <div style={{ color: C.gray, fontSize: 12, textAlign: 'center', padding: 20 }}>—</div>
              )}
              {stageClients.map(c => <ClientCard key={c.id} client={c} />)}
            </div>
          </div>
        );
      })}

      {/* Descartados column - only if there are any */}
      {clientsByStage('DESCARTADO').length > 0 && (
        <div style={{ minWidth: 280, maxWidth: 300, flex: '0 0 280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#EF444415', borderRadius: '10px 10px 0 0', borderBottom: '3px solid #EF4444' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{stageLabel('DESCARTADO')}</span>
            <span style={{ ...badge('#EF4444'), fontSize: 10, marginLeft: 'auto' }}>{clientsByStage('DESCARTADO').length}</span>
          </div>
          <div style={{ background: '#EF444408', borderRadius: '0 0 10px 10px', padding: 8 }}>
            {clientsByStage('DESCARTADO').map(c => <ClientCard key={c.id} client={c} />)}
          </div>
        </div>
      )}
    </div>
  );

  // ── List view (simplified for Yanire) ──
  const ListView = () => (
    <div>
      {STAGES.map(stage => {
        const stageClients = clientsByStage(stage.key);
        if (stageClients.length === 0) return null;
        return (
          <div key={stage.key} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: stage.color }} />
              <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{stageLabel(stage.key)}</span>
              <span style={{ ...badge(stage.color), fontSize: 11 }}>{stageClients.length}</span>
            </div>
            {stageClients.map(c => <ClientCard key={c.id} client={c} />)}
          </div>
        );
      })}
    </div>
  );

  // ── Client detail modal ──
  const DetailModal = () => {
    if (!selectedClient) return null;
    const c = selectedClient;
    const stageInfo = getStageInfo(c.pipelineStage);

    return (
      <Modal onClose={() => setSelectedClient(null)}>
        <div style={{ maxWidth: 540 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, color: C.navy }}>{c.name}</h2>
            <span style={{ ...badge(stageInfo.color) }}>{stageLabel(c.pipelineStage)}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ ...card(C.off), padding: 12 }}>
              <div style={{ fontSize: 11, color: C.gray, marginBottom: 2 }}>DNI</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.dni}</div>
            </div>
            <div style={{ ...card(C.off), padding: 12 }}>
              <div style={{ fontSize: 11, color: C.gray, marginBottom: 2 }}><Phone size={11} /> {t.cPhone}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.phone}</div>
            </div>
            {c.email && (
              <div style={{ ...card(C.off), padding: 12 }}>
                <div style={{ fontSize: 11, color: C.gray, marginBottom: 2 }}><Mail size={11} /> Email</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.email}</div>
              </div>
            )}
            <div style={{ ...card(C.off), padding: 12 }}>
              <div style={{ fontSize: 11, color: C.gray, marginBottom: 2 }}><Building2 size={11} /> {t.pipePromocion || 'Promoción'}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.property?.name}</div>
              <div style={{ fontSize: 11, color: C.dgray }}>{c.property?.zone}</div>
            </div>
          </div>

          {isAdmin && c.property?.developer && (
            <div style={{ ...card('#F3F4F6'), padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.gray, marginBottom: 2 }}>{t.developer || 'Promotora'}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.property.developer}</div>
              {c.property.devPhone && <div style={{ fontSize: 12, color: C.dgray }}><Phone size={11} /> {c.property.devPhone}</div>}
            </div>
          )}

          {c.user && (
            <div style={{ fontSize: 12, color: C.dgray, marginBottom: 16 }}>
              <User size={12} /> {t.pipeAgencia || 'Agencia'}: <strong>{c.user.agency}</strong> ({c.user.name})
            </div>
          )}

          {/* Timeline */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, color: C.navy, marginBottom: 10 }}>{t.pipeHistorial || 'Historial'}</h3>
            {c.pipelineEvents?.length === 0 && (
              <div style={{ color: C.gray, fontSize: 12 }}>{t.pipeNoEvents || 'Sin eventos registrados'}</div>
            )}
            {c.pipelineEvents?.map((ev, i) => (
              <div key={ev.id} style={{ display: 'flex', gap: 10, marginBottom: 10, paddingLeft: 12, borderLeft: `2px solid ${i === 0 ? C.gold : C.lgray}` }}>
                <div style={{ flex: 1 }}>
                  {ev.fromStage !== ev.toStage ? (
                    <div style={{ fontSize: 12, color: C.text }}>
                      <span style={{ ...badge(getStageInfo(ev.fromStage || 'REGISTRO').color), fontSize: 10 }}>{stageLabel(ev.fromStage || 'REGISTRO')}</span>
                      {' '}<ArrowRight size={12} style={{ verticalAlign: 'middle' }} />{' '}
                      <span style={{ ...badge(getStageInfo(ev.toStage).color), fontSize: 10 }}>{stageLabel(ev.toStage)}</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: C.dgray }}>📝 {t.pipeNota || 'Nota'}</div>
                  )}
                  {ev.note && <div style={{ fontSize: 12, color: C.text, marginTop: 4, fontStyle: 'italic' }}>"{ev.note}"</div>}
                  <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>
                    {ev.user?.name} · {new Date(ev.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {c.pipelineStage !== 'CERRADO' && c.pipelineStage !== 'DESCARTADO' && (
              <>
                {nextStage(c.pipelineStage) && (
                  <button style={{ ...btn(stageInfo.color), padding: '8px 16px', fontSize: 12 }}
                    onClick={() => { handleQuickMove(c.id, nextStage(c.pipelineStage)); setSelectedClient(null); }}>
                    <ArrowRight size={14} /> {t.pipeAvanzar || 'Avanzar a'} {stageLabel(nextStage(c.pipelineStage))}
                  </button>
                )}
                <button style={{ ...btn(C.err), padding: '8px 16px', fontSize: 12 }}
                  onClick={() => { handleQuickMove(c.id, 'DESCARTADO'); setSelectedClient(null); }}>
                  {t.pipeDescartar || 'Descartar'}
                </button>
              </>
            )}
            <button style={{ ...btn(C.lgray, C.dgray), padding: '8px 16px', fontSize: 12 }}
              onClick={() => setSelectedClient(null)}>
              {t.cancel || 'Cerrar'}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // ── Move modal ──
  const MoveModal = () => {
    if (!showMoveModal) return null;
    return (
      <Modal onClose={() => setShowMoveModal(null)}>
        <div style={{ maxWidth: 400 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, color: C.navy }}>{t.pipeMoveTitle || 'Mover a otra etapa'}</h3>
          <p style={{ fontSize: 13, color: C.dgray, marginBottom: 12 }}>{showMoveModal.name}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {STAGES.map(s => {
              if (s.key === showMoveModal.pipelineStage) return null;
              return (
                <button key={s.key}
                  style={{ ...btn(`${s.color}15`, C.text), padding: '8px 14px', fontSize: 12, justifyContent: 'flex-start', borderRadius: 8 }}
                  onClick={() => handleMove(showMoveModal.id, s.key)}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                  {stageLabel(s.key)}
                </button>
              );
            })}
          </div>
          <textarea
            placeholder={t.pipeNotePlaceholder || 'Nota opcional (ej: "Promotora confirma disponibilidad")'}
            value={moveNote} onChange={e => setMoveNote(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${C.lgray}`, fontSize: 13, minHeight: 60, resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>
      </Modal>
    );
  };

  // ── Note modal ──
  const NoteModal = () => {
    if (!showNoteModal) return null;
    return (
      <Modal onClose={() => setShowNoteModal(null)}>
        <div style={{ maxWidth: 400 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, color: C.navy }}>{t.pipeAddNote || 'Añadir nota'}</h3>
          <p style={{ fontSize: 13, color: C.dgray, marginBottom: 12 }}>{showNoteModal.name} — {stageLabel(showNoteModal.pipelineStage)}</p>
          <textarea
            placeholder={t.pipeNotePlaceholder || 'Escribe una nota...'}
            value={noteText} onChange={e => setNoteText(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${C.lgray}`, fontSize: 13, minHeight: 80, resize: 'vertical', marginBottom: 12, boxSizing: 'border-box' }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={{ ...btn(C.lgray, C.dgray), padding: '8px 16px', fontSize: 12 }}
              onClick={() => setShowNoteModal(null)}>{t.cancel || 'Cancelar'}</button>
            <button style={{ ...btn(C.gold), padding: '8px 16px', fontSize: 12 }}
              onClick={() => handleAddNote(showNoteModal.id)}>{t.submit || 'Guardar'}</button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: C.navy }}>{t.pipeTitle || 'Seguimiento Pipeline'}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.dgray }}>{t.pipeSubtitle || 'Gestión del ciclo completo: registro → verificación → visita → cierre'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isAdmin && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Filter size={14} color={C.gray} style={{ position: 'absolute', left: 10 }} />
              <input
                placeholder={t.pipeFilterAgency || 'Filtrar agencia...'}
                value={filterAgency} onChange={e => setFilterAgency(e.target.value)}
                style={{ padding: '8px 10px 8px 30px', borderRadius: 8, border: `1px solid ${C.lgray}`, fontSize: 12, width: 160 }}
              />
            </div>
          )}
          <button
            style={{ ...btn(view === 'board' ? C.navy : C.lgray, view === 'board' ? C.white : C.dgray), padding: '8px 14px', fontSize: 12 }}
            onClick={() => setView('board')}>
            {t.pipeBoard || 'Tablero'}
          </button>
          <button
            style={{ ...btn(view === 'list' ? C.navy : C.lgray, view === 'list' ? C.white : C.dgray), padding: '8px 14px', fontSize: 12 }}
            onClick={() => setView('list')}>
            {t.pipeList || 'Lista'}
          </button>
        </div>
      </div>

      <SummaryBar />

      {clients.length === 0 ? (
        <div style={{ ...card(), textAlign: 'center', padding: 60 }}>
          <User size={40} color={C.lgray} />
          <p style={{ color: C.gray, fontSize: 14, marginTop: 12 }}>{t.pipeEmpty || 'No hay clientes en el pipeline todavía.'}</p>
          <p style={{ color: C.dgray, fontSize: 12 }}>{t.pipeEmptyHint || 'Los clientes aparecerán aquí cuando se registren en una propiedad.'}</p>
        </div>
      ) : (
        view === 'board' ? <BoardView /> : <ListView />
      )}

      <DetailModal />
      <MoveModal />
      <NoteModal />
    </div>
  );
}
