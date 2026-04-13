import { useEffect, useRef } from 'react';

/**
 * Modal - Accessible modal with focus trap, Escape to close, and ARIA attributes
 * Golden Rule #7: Keep users in control (Escape key closes)
 * Golden Rule #4: Design dialogs to yield closure (clear header/footer)
 * Heuristic #3: User control & freedom (multiple ways to dismiss)
 */
export default function Modal({ isOpen, onClose, title, children, footer, size = 'default' }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Save previously focused element for restoration
      previousFocusRef.current = document.activeElement;
      // Focus the modal
      setTimeout(() => modalRef.current?.focus(), 50);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Restore focus (Golden Rule #6: easy reversal)
      previousFocusRef.current?.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
    // Focus trap: Tab cycles within modal
    if (e.key === 'Tab') {
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!isOpen) return null;

  const sizeClass = size === 'large' ? 'modal-large' : size === 'small' ? 'modal-small' : '';

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        className={`modal ${sizeClass}`}
        onClick={e => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h3 className="modal-title" id="modal-title">{title}</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Tutup dialog"
            title="Tekan Escape untuk menutup"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
