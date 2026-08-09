import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftRight, Search, Plus, Filter } from 'lucide-react';
import { stockApi } from '../../services/api';
import { MovementBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { format } from 'date-fns';

export const StockMovementPage: React.FC = () => {
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['stock-movements', { type, page }],
    queryFn: () => stockApi.getAll({ type, page, limit: 20 }),
  });

  const movements = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Audit Ledger</h1>
          <p className="page-subtitle">Real-time trace of all inventory movements IN and OUT</p>
        </div>
      </div>

      <div className="card card-padded" style={{ marginBottom: 20 }}>
        <div className="filter-bar">
          <select
            className="form-input form-select"
            style={{ width: 180 }}
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
          >
            <option value="">All Movement Types</option>
            <option value="IN">Stock IN (Receipts & Returns)</option>
            <option value="OUT">Stock OUT (Challans & Disposals)</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable rows={10} cols={6} />
      ) : movements.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<ArrowLeftRight size={32} />}
            title="No stock movements recorded"
            description="Stock movements occur automatically when sales challans are confirmed or manually recorded."
          />
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product / SKU</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reason / Reference</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m: any) => (
                  <tr key={m.id}>
                    <td>{format(new Date(m.createdAt), 'MMM dd, yyyy HH:mm')}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.product?.name || 'Product'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>SKU: {m.product?.sku}</div>
                    </td>
                    <td><MovementBadge type={m.type} /></td>
                    <td><strong style={{ fontSize: 14 }}>{m.quantity}</strong> {m.product?.unit || 'pcs'}</td>
                    <td>
                      <div>{m.reason?.replace(/_/g, ' ')}</div>
                      {m.reference && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Ref: {m.reference}</div>}
                    </td>
                    <td>{m.createdBy?.name || 'System'}</td>
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