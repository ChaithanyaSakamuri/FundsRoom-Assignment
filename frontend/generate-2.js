const fs = require('fs');
const path = require('path');

const files = {
  'src/components/ui/Toast.tsx': `
import { useToastStore } from '../../stores/toastStore';
import { AnimatePresence, motion } from 'framer-motion';

export default function Toast() {
  const { toasts, removeToast } = useToastStore();
  return (
    <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={\`card \${t.type === 'error' ? 'text-danger' : t.type === 'success' ? 'text-success' : ''}\`} style={{ padding: '1rem', minWidth: '250px', cursor: 'pointer', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }} onClick={() => removeToast(t.id)}>
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
`,
  'src/components/ui/Button.tsx': `
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export default function Button({ variant = 'primary', isLoading, children, className = '', ...props }: ButtonProps) {
  const baseClass = \`btn btn-\${variant} \${className}\`;
  return (
    <button className={baseClass} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
`,
  'src/components/ui/Badge.tsx': `
export default function Badge({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' }) {
  return <span className={\`badge badge-\${variant}\`}>{children}</span>;
}
`,
  'src/components/ui/Modal.tsx': `
import { AnimatePresence, motion } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'black', zIndex: 999 }} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} className="card" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, width: '100%', maxWidth: '500px' }}>
            <div className="flex align-center justify-between" style={{ marginBottom: '1rem' }}>
              <h3 className="text-lg font-semibold">{title}</h3>
              <button onClick={onClose} className="btn btn-ghost">&times;</button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
`,
  'src/components/ui/Skeleton.tsx': `
export default function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={\`skeleton \${className}\`} {...props} style={{ minHeight: '1.5rem', borderRadius: 'var(--radius-md)', ...props.style }} />;
}
`,
  'src/components/ui/EmptyState.tsx': `
export default function EmptyState({ message = 'No data available' }: { message?: string }) {
  return <div className="card text-center text-secondary py-12">{message}</div>;
}
`,
  'src/components/ui/ConfirmDialog.tsx': `
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="mb-6">{message}</p>
      <div className="flex gap-4 justify-end">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>Confirm</Button>
      </div>
    </Modal>
  );
}
`,
  'src/components/ui/Pagination.tsx': `
import Button from './Button';

export default function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex align-center justify-center gap-4 mt-6">
      <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
      <span className="text-sm font-medium">Page {page} of {totalPages}</span>
      <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
    </div>
  );
}
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\\n');
  console.log('Created', filepath);
}
