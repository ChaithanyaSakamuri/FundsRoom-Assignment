import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  borderRadius?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  className = '',
  borderRadius,
}) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius }}
  />
);

export const SkeletonCard: React.FC = () => (
  <div className="card card-padded" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Skeleton height="12px" width="40%" />
    <Skeleton height="28px" width="60%" />
    <Skeleton height="12px" width="80%" />
  </div>
);

export const SkeletonTableRow: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} style={{ padding: '12px 16px' }}>
        <Skeleton height="14px" width={i === 0 ? '80%' : '60%'} />
      </td>
    ))}
  </tr>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
  <div className="table-container">
    <div className="table-wrap">
      <table className="table">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);