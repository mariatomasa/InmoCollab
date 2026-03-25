export const C = {
  navy: '#0F1B2D',
  dark: '#162A45',
  mid: '#1E3A5F',
  gold: '#D4A843',
  goldL: '#E8C76A',
  white: '#FFF',
  off: '#F7F8FA',
  lgray: '#E5E7EB',
  gray: '#9CA3AF',
  dgray: '#4B5563',
  text: '#1F2937',
  ok: '#10B981',
  warn: '#F59E0B',
  err: '#EF4444',
  info: '#3B82F6',
};

export const btn = (bg, fg = '#FFF') => ({
  background: bg, color: fg, border: 'none', padding: '10px 20px',
  borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
  display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all .2s',
});

export const card = (bg = C.white) => ({
  background: bg, borderRadius: 12, padding: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,.08)',
});

export const badge = (bg, fg = '#FFF') => ({
  background: bg, color: fg, padding: '3px 10px', borderRadius: 20,
  fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4,
});
