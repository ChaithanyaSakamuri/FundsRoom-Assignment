import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users, Package, FileText, Calendar, AlertTriangle, ArrowUpRight,
  TrendingUp, Plus, Clock, CheckCircle2, ChevronRight, Activity,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { SkeletonCard, SkeletonTable } from '../components/ui/Skeleton';
import { formatDistanceToNow } from 'date-fns';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#64748b'];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getSummary,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 24, width: 200, background: 'var(--surface-2)', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ height: 14, width: 300, background: 'var(--surface-1)', borderRadius: 4 }} />
        </div>
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <SkeletonTable rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card card-padded" style={{ textAlign: 'center', color: 'var(--danger-600)' }}>
        Failed to load dashboard data. Make sure the backend server is running at http://localhost:4000.
      </div>
    );
  }

  const { stats, alerts, recentActivity, salesTrend, userName } = data || {
    stats: { totalCustomers: 0, totalProducts: 0, totalChallans: 0, pendingFollowups: 0, lowStockProducts: 0, pendingChallans: 0, todaySalesTotal: 0, todaySalesCount: 0 },
    alerts: { criticalProducts: [], overdueFollowups: [], draftChallans: [] },
    recentActivity: [],
    salesTrend: [],
    userName: 'User',
  };

  const inventoryPieData = [
    { name: 'Healthy', value: Math.max(0, stats.totalProducts - stats.lowStockProducts) },
    { name: 'Low Stock', value: stats.lowStockProducts },
    { name: 'Critical', value: alerts.criticalProducts?.length || 0 },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{getGreeting()}, {userName}!</h1>
          <p className="page-subtitle">Here is what is happening across your wholesale operations today.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" icon={<Plus size={14} />} onClick={() => navigate('/customers/new')}>
            New Customer
          </Button>
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => navigate('/challans/new')}>
            Create Sales Challan
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card" onClick={() => navigate('/customers')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <span className="stat-label">Total Customers</span>
            <div className="stat-icon" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.totalCustomers}</div>
          <div className="stat-trend text-secondary">
            <span>CRM Database Records</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <span className="stat-label">Low Stock Alert</span>
            <div className="stat-icon" style={{ background: stats.lowStockProducts > 0 ? 'var(--warning-50)' : 'var(--success-50)', color: stats.lowStockProducts > 0 ? 'var(--warning-600)' : 'var(--success-600)' }}>
              <Package size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: stats.lowStockProducts > 0 ? 'var(--warning-600)' : 'inherit' }}>
            {stats.lowStockProducts}
          </div>
          <div className="stat-trend text-secondary">
            <span>Products below threshold</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/challans')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <span className="stat-label">Draft Challans</span>
            <div className="stat-icon" style={{ background: 'var(--info-50)', color: 'var(--info-600)' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.pendingChallans}</div>
          <div className="stat-trend text-secondary">
            <span>Awaiting confirmation</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/challans')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <span className="stat-label">Today's Sales</span>
            <div className="stat-icon" style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="stat-value">₹{stats.todaySalesTotal.toLocaleString('en-IN')}</div>
          <div className="stat-trend text-success">
            <span>{stats.todaySalesCount} confirmed challan{stats.todaySalesCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Business Pulse — Charts */}
      <div className="grid-2-1" style={{ marginBottom: 24 }}>
        {/* Sales Trend Chart */}
        <div className="card card-padded">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Sales Revenue Trend</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Confirmed revenue over last 7 days</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
              Full Report <ChevronRight size={12} />
            </Button>
          </div>
          <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Health Pie */}
        <div className="card card-padded">
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Inventory Breakdown</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Stock health distribution</div>
          </div>
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={inventoryPieData} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                  {inventoryPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            {inventoryPieData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                <span>{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Center & Activity Feed */}
      <div className="grid-2">
        {/* Urgent Items */}
        <div className="card card-padded">
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color="var(--warning-500)" />
            <span>Attention Required</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.criticalProducts?.slice(0, 3).map((p: any) => (
              <div key={p.id} className="alert-item" onClick={() => navigate(`/inventory/${p.id}`)} style={{ cursor: 'pointer' }}>
                <div className="alert-icon" style={{ background: 'var(--danger-50)', color: 'var(--danger-600)' }}>
                  <Package size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>SKU: {p.sku} · Only {p.currentStock} units left (Min: {p.minStock})</div>
                </div>
                <Button variant="ghost" size="sm">Restock</Button>
              </div>
            ))}

            {alerts.overdueFollowups?.slice(0, 3).map((f: any) => (
              <div key={f.id} className="alert-item" onClick={() => navigate(`/customers/${f.customer?.id}`)} style={{ cursor: 'pointer' }}>
                <div className="alert-icon" style={{ background: 'var(--warning-50)', color: 'var(--warning-600)' }}>
                  <Calendar size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Follow-up: {f.customer?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{f.note || 'Scheduled check-in'}</div>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            ))}

            {(!alerts.criticalProducts?.length && !alerts.overdueFollowups?.length) && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: 12 }}>
                <CheckCircle2 size={24} color="var(--success-500)" style={{ margin: '0 auto 8px' }} />
                All operations running smoothly! No urgent alerts.
              </div>
            )}
          </div>
        </div>

        {/* Audit Log / Activity */}
        <div className="card card-padded">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} color="var(--brand-500)" />
              <span>System Audit Feed</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/activity')}>
              View All
            </Button>
          </div>

          <div className="timeline">
            {recentActivity?.slice(0, 5).map((act: any) => (
              <div key={act.id} className="timeline-item">
                <div className="timeline-line">
                  <div className="timeline-dot" />
                  <div className="timeline-connector" />
                </div>
                <div className="timeline-content">
                  <div className="timeline-date">
                    {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                  </div>
                  <div className="timeline-title">
                    <strong>{act.user?.name || 'User'}</strong> {act.action.toLowerCase().replace(/_/g, ' ')}
                  </div>
                  {act.entityLabel && (
                    <div className="timeline-subtitle">{act.entityLabel}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};