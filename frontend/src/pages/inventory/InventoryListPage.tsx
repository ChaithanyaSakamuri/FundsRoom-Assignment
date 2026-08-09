import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Package, AlertTriangle, ChevronRight, Activity } from 'lucide-react';
import { productsApi } from '../../services/api';
import { StockStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';

export const InventoryListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { search, category, status, page }],
    queryFn: () => productsApi.getAll({ search, category, status, page, limit: 15 }),
  });

  const { data: health } = useQuery({
    queryKey: ['inventory-health'],
    queryFn: productsApi.getHealth,
  });

  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory & Stock Catalog</h1>
          <p className="page-subtitle">Track product SKUs, stock health, and warehouse locations</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" icon={<Activity size={14} />} onClick={() => navigate('/stock-movements')}>
            Stock Ledger
          </Button>
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => navigate('/inventory/new')}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Inventory Health Widget */}
      {health && (
        <div className="card card-padded" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              Inventory Health Index: {health.healthPercentage}% Healthy
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              {health.totalProducts} Total SKUs | {health.lowStock} Low | {health.critical} Critical
            </span>
          </div>
          <div className="health-bar-wrap">
            <div
              className={`health-bar-fill ${health.healthPercentage < 70 ? 'low' : health.healthPercentage < 40 ? 'critical' : ''}`}
              style={{ width: `${health.healthPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card card-padded" style={{ marginBottom: 20 }}>
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={14} />
            <input
              className="form-input"
              placeholder="Search product name or SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <select
            className="form-input form-select"
            style={{ width: 160 }}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Stock Status</option>
            <option value="HEALTHY">Healthy</option>
            <option value="LOW">Low Stock</option>
            <option value="CRITICAL">Critical</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>

          {(search || category || status) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(''); setCategory(''); setStatus(''); setPage(1); }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable rows={10} cols={7} />
      ) : products.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Package size={32} />}
            title="No inventory products found"
            description="Try clearing search filters or add a new product item."
            action={{ label: "Add Product", onClick: () => navigate('/inventory/new') }}
          />
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Product Name / SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Stock Quantity</th>
                  <th>Min Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: any) => (
                  <tr
                    key={p.id}
                    className="clickable"
                    onClick={() => navigate(`/inventory/${p.id}`)}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>SKU: {p.sku}</div>
                    </td>
                    <td>{p.category}</td>
                    <td>₹{p.price?.toLocaleString('en-IN')}</td>
                    <td>
                      <strong style={{ fontSize: 14 }}>{p.currentStock}</strong> {p.unit}
                    </td>
                    <td style={{ color: 'var(--text-tertiary)' }}>{p.minStock} {p.unit}</td>
                    <td>
                      <StockStatusBadge status={p.stockStatus || 'HEALTHY'} />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/inventory/${p.id}`)}>
                        Details <ChevronRight size={12} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
};