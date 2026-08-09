import React from 'react';

type BadgeVariant = 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', dot = false, children, className = '' }) => (
  <span className={`badge badge-${variant} ${className}`}>
    {dot && <span className="badge-dot" />}
    {children}
  </span>
);

export const CustomerStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, BadgeVariant> = {
    ACTIVE: 'success', INACTIVE: 'neutral', PROSPECT: 'info',
  };
  const label: Record<string, string> = {
    ACTIVE: 'Active', INACTIVE: 'Inactive', PROSPECT: 'Prospect',
  };
  return <Badge variant={map[status] || 'neutral'} dot>{label[status] || status}</Badge>;
};

export const ChallanStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, BadgeVariant> = {
    DRAFT: 'warning', CONFIRMED: 'success', CANCELLED: 'danger',
  };
  return <Badge variant={map[status] || 'neutral'}>{status}</Badge>;
};

export const StockStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, BadgeVariant> = {
    HEALTHY: 'success', LOW: 'warning', CRITICAL: 'danger', OUT_OF_STOCK: 'danger',
  };
  const label: Record<string, string> = {
    HEALTHY: 'Healthy', LOW: 'Low Stock', CRITICAL: 'Critical', OUT_OF_STOCK: 'Out of Stock',
  };
  return <Badge variant={map[status] || 'neutral'}>{label[status] || status}</Badge>;
};

export const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const map: Record<string, string> = {
    ADMIN: 'role-admin', SALES: 'role-sales', WAREHOUSE: 'role-warehouse', ACCOUNTS: 'role-accounts',
  };
  const label: Record<string, string> = {
    ADMIN: 'Admin', SALES: 'Sales', WAREHOUSE: 'Warehouse', ACCOUNTS: 'Accounts',
  };
  return (
    <span className={`role-badge ${map[role] || ''}`}>{label[role] || role}</span>
  );
};

export const MovementBadge: React.FC<{ type: 'IN' | 'OUT' }> = ({ type }) => (
  <span className={`movement-badge ${type.toLowerCase()}`}>
    {type === 'IN' ? '▲' : '▼'} {type}
  </span>
);