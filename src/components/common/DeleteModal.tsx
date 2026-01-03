import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  subMessage?: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Warning Model", 
  message = "Are you Sure to delete this Employee ?",
  subMessage = "This action can't be undone"
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
    }}>
      <div style={{
        background: 'white', padding: '2rem', borderRadius: '0.5rem', width: '400px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
        color: 'black'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
           <AlertTriangle size={64} color="#dc2626" />
           <h2 style={{ margin: 0, color: '#dc2626', fontSize: '1.25rem', fontWeight: 600 }}>Warning</h2>
        </div>
        
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ margin: 0, color: '#374151', fontSize: '1rem', fontWeight: 500 }}>{message}</p>
          {subMessage && (
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{subMessage}</p>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
           <button 
             onClick={onConfirm}
             style={{ padding: '0.75rem 2rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
           >
             Delete
           </button>
           <button 
             onClick={onClose}
             style={{ padding: '0.75rem 2rem', background: '#9ca3af', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
           >
             Cancel
           </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
