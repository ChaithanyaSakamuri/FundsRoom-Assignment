import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger',
}) => (
  <Modal isOpen={isOpen} onClose={onCancel}>
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div className={`confirm-icon ${variant}`}>
        <AlertTriangle size={24} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</div>
    </div>
    <div className="modal-footer" style={{ justifyContent: 'center', gap: 10, paddingTop: 20, borderTop: 0 }}>
      <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
        Cancel
      </Button>
      <Button
        variant={variant === 'danger' ? 'danger' : 'primary'}
        onClick={onConfirm}
        loading={isLoading}
      >
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);