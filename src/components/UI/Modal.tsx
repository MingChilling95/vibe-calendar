import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 15, 15, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(2px)'
        }} onClick={onClose}>
            <div
                ref={modalRef}
                onClick={e => e.stopPropagation()}
                style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: '4px',
                    boxShadow: 'var(--shadow-hover)',
                    width: '100%',
                    maxWidth: '500px',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'fadeIn 0.2s ease-out'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: 'var(--spacing-md) var(--spacing-md) var(--spacing-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {title && <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{title}</h3>}
                    <button
                        onClick={onClose}
                        style={{
                            padding: '4px',
                            borderRadius: '4px',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '0 var(--spacing-md) var(--spacing-md)', overflowY: 'auto' }}>
                    {children}
                </div>
            </div>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>,
        document.body
    );
};

export default Modal;
