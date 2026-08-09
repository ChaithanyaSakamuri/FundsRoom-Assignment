import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, Database, BarChart2 } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { toast } from '../stores/toastStore';
import { Button } from '../components/ui/Button';

const demoUsers = [
  { role: 'Admin', email: 'admin@nexora.demo', pass: 'nexora@2024', badge: 'Full Access' },
  { role: 'Sales', email: 'sales@nexora.demo', pass: 'nexora@2024', badge: 'CRM & Sales' },
  { role: 'Warehouse', email: 'warehouse@nexora.demo', pass: 'nexora@2024', badge: 'Inventory & Stock' },
  { role: 'Accounts', email: 'accounts@nexora.demo', pass: 'nexora@2024', badge: 'Challans & Reports' },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@nexora.demo');
  const [password, setPassword] = useState('nexora@2024');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      const res = await authApi.login(email, password);
      login(res.user, res.accessToken);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (u: (typeof demoUsers)[0]) => {
    setEmail(u.email);
    setPassword(u.pass);
  };

  return (
    <div className="login-page">
      {/* Left branding panel */}
      <div className="login-left">
        <div className="login-left-pattern" />
        <div className="login-left-grid" />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div className="sidebar-logo-icon" style={{ width: 36, height: 36 }}>
              <Zap size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'white', letterSpacing: '0.05em' }}>NEXORA</div>
              <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: '0.1em' }}>INTELLIGENT BUSINESS OPERATIONS</div>
            </div>
          </div>

          <div style={{ maxWidth: 420 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 16 }}>
              One workspace for customers, inventory & sales operations.
            </h1>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 40 }}>
              Enterprise ERP+CRM platform built for modern wholesale & distribution teams. Real-time stock ledgers, transactional sales challans, and customer 360° intelligence.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: ShieldCheck, title: 'Role-Based Control', desc: 'Granular permissions for Admin, Sales, Warehouse & Accounts' },
                { icon: Database, title: 'Transactional Integrity', desc: 'Atomic stock updates on challan confirmation' },
                { icon: BarChart2, title: 'Real-time Analytics', desc: 'Live sales trends, inventory health & activity auditing' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
                    <f.icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontSize: 12, color: '#475569' }}>
          © 2026 NEXORA Operations Inc. Enterprise Edition v1.0
        </div>
      </div>

      {/* Right login form */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Sign in to NEXORA
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Select a demo role below or enter your credentials
            </p>
          </div>

          {/* Demo account selector */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Click to Auto-fill Demo Account:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {demoUsers.map((u) => (
                <button
                  key={u.role}
                  type="button"
                  onClick={() => handleSelectDemo(u)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${email === u.email ? 'var(--brand-500)' : 'var(--border-subtle)'}`,
                    background: email === u.email ? 'var(--brand-50)' : 'var(--surface-1)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{u.role}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{u.badge}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 12px', background: 'var(--danger-50)', border: '1px solid var(--danger-100)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--danger-600)', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: 34 }}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: 34 }}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button variant="primary" size="xl" type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>
              Sign In to Workspace <ArrowRight size={16} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};