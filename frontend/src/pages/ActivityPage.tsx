import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity as ActivityIcon } from 'lucide-react';
import { activityApi } from '../services/api';
import { RoleBadge } from '../components/ui/Badge';
import { SkeletonTable } from '../components/ui/Skeleton';
import { Pagination } from '../components/ui/Pagination';
import { formatDistanceToNow, format } from 'date-fns';

export const ActivityPage: React.FC = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['activity-full', page],
    queryFn: () => activityApi.getAll(page),
  });

  const logs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Audit Log & Activity Feed</h1>
          <p className="page-subtitle">Complete chronological record of user actions and operations</p>
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable rows={10} cols={4} />
      ) : (
        <div className="card card-padded">
          <div className="timeline">
            {logs.map((act: any) => (
              <div key={act.id} className="timeline-item">
                <div className="timeline-line">
                  <div className="timeline-dot" />
                  <div className="timeline-connector" />
                </div>
                <div className="timeline-content">
                  <div className="timeline-date">
                    {format(new Date(act.createdAt), 'MMM dd, yyyy HH:mm')} ({formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })})
                  </div>
                  <div className="timeline-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong>{act.user?.name || 'System User'}</strong>
                    <RoleBadge role={act.user?.role || 'ADMIN'} />
                    <span>{act.action?.toLowerCase().replace(/_/g, ' ')}</span>
                  </div>
                  {act.entityLabel && (
                    <div className="timeline-subtitle" style={{ fontWeight: 600, color: 'var(--brand-600)', marginTop: 2 }}>
                      {act.entityLabel}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination && (
            <div style={{ marginTop: 20 }}>
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};