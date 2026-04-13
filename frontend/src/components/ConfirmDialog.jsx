import { useState } from 'react';

/**
 * ConfirmDialog - Custom confirmation dialog replacing window.confirm()
 * Supports Golden Rule #5 (Error Prevention) and Heuristic #5 (Error Prevention)
 */
export default function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message, confirmText = 'Ya, Lanjutkan', cancelText = 'Batal', variant = 'danger' }) {
  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="modal-overlay" onClick={onCancel} onKeyDown={handleKeyDown} role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
      <div className="modal confirm-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div className={`confirm-icon confirm-icon-${variant}`}>
            {variant === 'danger' && '⚠️'}
            {variant === 'warning' && '❓'}
            {variant === 'info' && 'ℹ️'}
          </div>
          <h3 id="confirm-title" style={{ color: 'var(--text-white)', fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
            {title || 'Konfirmasi'}
          </h3>
          <p id="confirm-message" style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
            {message}
          </p>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={onCancel} aria-label={cancelText}>
            {cancelText}
          </button>
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            autoFocus
            aria-label={confirmText}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage confirm dialog state.
 * Usage:
 *   const { confirm, ConfirmDialogComponent } = useConfirm();
 *   await confirm({ title: '...', message: '...' });
 */
export function useConfirm() {
  const [state, setState] = useState({ isOpen: false, resolve: null, config: {} });

  const confirm = (config = {}) => {
    return new Promise((resolve) => {
      setState({ isOpen: true, resolve, config });
    });
  };

  const handleConfirm = () => {
    state.resolve?.(true);
    setState({ isOpen: false, resolve: null, config: {} });
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState({ isOpen: false, resolve: null, config: {} });
  };

  const ConfirmDialogComponent = (
    <ConfirmDialog
      isOpen={state.isOpen}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      {...state.config}
    />
  );

  return { confirm, ConfirmDialogComponent };
}
