import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastStore } from '../../stores/toastStore';

const icons = {
  success: <CheckCircle size={16} color="var(--success-500)" />,
  error: <AlertCircle size={16} color="var(--danger-500)" />,
  warning: <AlertTriangle size={16} color="var(--warning-500)" />,
  info: <Info size={16} color="var(--info-500)" />,
};

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type} animate-fade-in`}>
          <span className="toast-icon">{icons[t.type]}</span>
          <div className="toast-body">
            <div className="toast-title">{t.title}</div>
            {t.message && <div className="toast-message">{t.message}</div>}
          </div>
          <button className="toast-close" onClick={() => removeToast(t.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};