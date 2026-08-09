import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Download, ChevronRight, Eye } from 'lucide-react';
import { challansApi } from '../../services/api';
import { ChallanStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { format } from 'date-fns';

export const ChallanListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['challans', { search, status, page }],
    queryFn: () => challansApi.getAll({ search, status, page, limit: 15 }),
  });

  const challans = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Delivery Challans</h1>
          <p className="page-subtitle">Manage sales orders, stock deductions, and delivery receipts</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => navigate('/challans/new')}>
          Create Sales Challan
        </Button>
      </div>

      <div className="card card-padded" style={{ marginBottom: 20 }}>
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={14} />
            <input
              className="form-input"
              placeholder="Search by challan # or customer name..."
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
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {(search || status) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatus(''); setPage(1); }}>
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable rows={10} cols={6} />
      ) : challans.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<FileText size={32} />}
            title="No sales challans found"
            description="Create a delivery challan to initiate sales order fulfillment and stock deduction."
            action={{ label: "Create Sales Challan", onClick: () => navigate('/challans/new') }}
          />
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Challan Number</th>
                  <th>Customer Account</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Grand Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((ch: any) => (
                  <tr
                    key={ch.id}
                    className="clickable"
                    onClick={() => navigate(`/challans/${ch.id}`)}
                  >
                    <td><strong>{ch.challanNumber}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ch.customer?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ch.customer?.business}</div>
                    </td>
                    <td>{format(new Date(ch.createdAt), 'MMM dd, yyyy')}</td>
                    <td><ChallanStatusBadge status={ch.status} /></td>
                    <td><strong style={{ fontSize: 14 }}>₹{ch.grandTotal?.toLocaleString('en-IN')}</strong></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button variant="ghost" size="sm" icon={<Eye size={12} />} onClick={() => navigate(`/challans/${ch.id}`)}>
                          View
                        </Button>
                        <Button variant="ghost" size="sm" icon={<Download size={12} />} onClick={() => challansApi.downloadPDF(ch.id)}>
                          PDF
                        </Button>
                      </div>
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