import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, TrendingUp, Package, Users, ArrowLeftRight, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { reportsApi } from '../../services/api';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'customers' | 'stock'>('sales');
  const [days, setDays] = useState(30);

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['report-sales', days],
    queryFn: () => reportsApi.getSalesOverview(days),
    enabled: activeTab === 'sales',
  });

  const { data: inventory, isLoading: invLoading } = useQuery({
    queryKey: ['report-inventory'],
    queryFn: reportsApi.getInventoryHealth,
    enabled: activeTab === 'inventory',
  });

  const { data: customers, isLoading: custLoading } = useQuery({
    queryKey: ['report-customers', days],
    queryFn: () => reportsApi.getCustomerActivity(days),
    enabled: activeTab === 'customers',
  });

  const { data: stock, isLoading: stockLoading } = useQuery({
    queryKey: ['report-stock', days],
    queryFn: () => reportsApi.getStockMovements(days),
    enabled: activeTab === 'stock',
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Operations Reports</h1>
          <p className="page-subtitle">Cross-module business analytics, sales trends, and stock velocity</p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              className={`btn ${days === d ? 'btn-primary' : 'btn-secondary'}`}
              style={{ height: 30, fontSize: 12 }}
              onClick={() => setDays(d)}
            >
              Last {d} Days
            </button>
          ))}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>
          Sales Overview
        </button>
        <button className={`tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
          Inventory Health
        </button>
        <button className={`tab ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
          Customer Activity
        </button>
        <button className={`tab ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => setActiveTab('stock')}>
          Stock Velocity
        </button>
      </div>

      {/* Tab 1: Sales */}
      {activeTab === 'sales' && (
        <div>
          {salesLoading ? (
            <SkeletonCard />
          ) : (
            <>
              <div className="grid-3" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                  <span className="stat-label">Total Revenue</span>
                  <div className="stat-value">₹{sales?.totalRevenue?.toLocaleString('en-IN') || 0}</div>
                  <span className="stat-trend text-success">Last {days} days confirmed</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Challans Issued</span>
                  <div className="stat-value">{sales?.totalChallans || 0}</div>
                  <span className="stat-trend text-secondary">Total confirmed orders</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Average Order Value</span>
                  <div className="stat-value">
                    ₹{sales?.totalChallans ? Math.round(sales.totalRevenue / sales.totalChallans).toLocaleString('en-IN') : 0}
                  </div>
                  <span className="stat-trend text-secondary">Per sales challan</span>
                </div>
              </div>

              <div className="card card-padded" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Daily Revenue Velocity</h3>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sales?.dailyTrend || []}>
                      <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={11} />
                      <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                      <Tooltip contentStyle={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Inventory Health */}
      {activeTab === 'inventory' && (
        <div>
          {invLoading ? (
            <SkeletonCard />
          ) : (
            <div className="grid-2">
              <div className="card card-padded">
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Inventory Health Summary</h3>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={inventory?.statusBreakdown || []} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="count" nameKey="status">
                        {(inventory?.statusBreakdown || []).map((_: any, idx: number) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card card-padded">
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Category Stock Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {inventory?.categoryBreakdown?.map((cat: any) => (
                    <div key={cat.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{cat.category}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cat.totalStock} units ({cat.count} SKUs)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Customer Activity */}
      {activeTab === 'customers' && (
        <div>
          {custLoading ? (
            <SkeletonCard />
          ) : (
            <div className="grid-3">
              <div className="stat-card">
                <span className="stat-label">Total Accounts</span>
                <div className="stat-value">{customers?.totalCustomers || 0}</div>
              </div>
              <div className="stat-card">
                <span className="stat-label">Active Buyers</span>
                <div className="stat-value">{customers?.activeCustomers || 0}</div>
              </div>
              <div className="stat-card">
                <span className="stat-label">Follow-ups Completed</span>
                <div className="stat-value">{customers?.completedFollowups || 0}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Stock Velocity */}
      {activeTab === 'stock' && (
        <div>
          {stockLoading ? (
            <SkeletonCard />
          ) : (
            <div className="card card-padded">
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Stock IN vs Stock OUT Ratio</h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stock?.dailyMovements || []}>
                    <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={11} />
                    <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                    <Tooltip contentStyle={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="in" fill="#22c55e" name="Stock IN" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="out" fill="#ef4444" name="Stock OUT" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};