import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total?: number;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange, total }) => {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
      {total !== undefined && (
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          {total} total record{total !== 1 ? 's' : ''}
        </span>
      )}
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft size={14} />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={i} style={{ padding: '0 4px', color: 'var(--text-tertiary)', fontSize: 12 }}>...</span>
          ) : (
            <button
              key={p}
              className={`pagination-btn ${page === p ? 'active' : ''}`}
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </button>
          )
        )}
        <button
          className="pagination-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};