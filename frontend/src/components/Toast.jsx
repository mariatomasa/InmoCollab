import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { C } from '../lib/colors.js';

export default function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.navy, color: C.white, padding: '12px 24px', borderRadius: 10, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,.3)', display: 'flex', alignItems: 'center', gap: 8, animation: 'slideIn .3s ease' }}>
      <CheckCircle size={18} color={C.ok} />{msg}
    </div>
  );
}
