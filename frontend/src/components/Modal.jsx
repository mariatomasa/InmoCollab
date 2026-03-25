import { C } from '../lib/colors.js';

export default function Modal({ children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000, padding: 20 }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: 16, padding: 28, maxWidth: 520, width: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
