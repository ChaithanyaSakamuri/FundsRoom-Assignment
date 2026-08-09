import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state">
        <div className="empty-state-icon" style={{ background: 'var(--danger-50)', color: 'var(--danger-600)' }}>
          <AlertTriangle size={28} />
        </div>
        <div className="empty-state-title" style={{ fontSize: 20 }}>404 — Page Not Found</div>
        <div className="empty-state-description">
          The operation path or resource you requested does not exist in NEXORA workspace.
        </div>
        <Button variant="primary" onClick={() => navigate('/')}>
          Back to Dashboard Command Center
        </Button>
      </div>
    </div>
  );
};