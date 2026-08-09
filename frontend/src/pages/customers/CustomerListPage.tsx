import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Phone, Mail, Building, ChevronRight, Users } from 'lucide-react';
import { customersApi } from '../../services/api';
import { CustomerStatusBadge, Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';

export const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', { search, status, type, page }],
    queryFn: () => customersApi.getAll({ search, status, type, page, limit: 15 }),
  });

  const customers = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer CRM</h1>
          <p className="page-subtitle">Manage customer accounts, follow-ups, and sales history</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => navigate('/customers/new')}>
          Add Customer
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="card card-padded" style={{ marginBottom: 20 }}>
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={14} />
            <input
              className="form-input"
              placeholder="Search by name, business, phone, or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <select
            className="form-input form-select"
            style={{ width: 140 }}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PROSPECT">Prospect</option>
          </select>

          <select
            className="form-input form-select"
            style={{ width: 150 }}
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="RETAIL">Retail</option>
            <option value="DISTRIBUTOR">Distributor</option>
            <option value="DIRECT">Direct</option>
          </select>

          {(search || status || type) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(''); setStatus(''); setType(''); setPage(1); }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Content Table */}
      {isLoading ? (
        <SkeletonTable rows={10} cols={6} />
      ) : customers.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Users size={32} />}
            title="No customers found"
            description={search || status || type ? "Try adjusting your search filters." : "Get started by adding your first customer account."}
            action={search ? undefined : { label: "Add Customer", onClick: () => navigate('/customers/new') }}
          />
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer / Business</th>
                  <th>Type</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th>Challans</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c: any) => (
                  <tr
                    key={c.id}
                    className="clickable"
                    onClick={() => navigate(`/customers/${c.id}`)}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                      {c.business && (
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Building size={10} /> {c.business}
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge variant="neutral">{c.type}</Badge>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={11} /> {c.phone}
                      </div>
                      {c.email && (
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={11} /> {c.email}
                        </div>
                      )}
                    </td>
                    <td>
                      <CustomerStatusBadge status={c.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{c._count?.challans || 0}</span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/customers/${c.id}`)}>
                        View 360° <ChevronRight size={12} />
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