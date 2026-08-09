import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, Printer, Zap, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { challansApi } from '../../services/api';
import { ChallanStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { toast } from '../../stores/toastStore';
import { format } from 'date-fns';

export const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data: challan, isLoading } = useQuery({
    queryKey: ['challan', id],
    queryFn: () => challansApi.getById(id!),
    enabled: !!id,
  });

  const confirmMutation = useMutation({
    mutationFn: () => challansApi.confirm(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challan', id] });
      toast.success('Challan confirmed. Stock deducted.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to confirm challan');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => challansApi.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challan', id] });
      toast.success('Challan cancelled.');
      setCancelDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel challan');
    },
  });

  if (isLoading) return <SkeletonCard />;
  if (!challan) return <div className="card card-padded">Challan record not found.</div>;

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/challans')}
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', marginBottom: 16 }}
      >
        <ArrowLeft size={14} /> Back to Sales Challans
      </button>

      {/* Action Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title">{challan.challanNumber}</h1>
            <ChallanStatusBadge status={challan.status} />
          </div>
          <p className="page-subtitle">Issued on {format(new Date(challan.createdAt), 'MMMM dd, yyyy')}</p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" icon={<Printer size={14} />} onClick={() => window.print()}>
            Print Document
          </Button>
          <Button variant="primary" icon={<Download size={14} />} onClick={() => challansApi.downloadPDF(challan.id)}>
            Download Official PDF
          </Button>
          {challan.status === 'DRAFT' && (
            <>
              <Button variant="success" loading={confirmMutation.isPending} onClick={() => confirmMutation.mutate()}>
                Confirm Challan
              </Button>
              <Button variant="danger" size="sm" onClick={() => setCancelDialogOpen(true)}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Document View Sheet */}
      <div className="card card-padded" style={{ background: 'var(--surface-0)', padding: 36, border: '1px solid var(--border-default)' }}>
        {/* Document Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--brand-500)', paddingBottom: 20, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Zap size={16} />
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '0.05em' }}>NEXORA</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Intelligent Business Operations Platform</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Industrial Logistics Division, MH</div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>DELIVERY CHALLAN</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-600)' }}>{challan.challanNumber}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
              Date: {format(new Date(challan.createdAt), 'dd/MM/yyyy')}
            </div>
          </div>
        </div>

        {/* Customer & Issue Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28, padding: 16, background: 'var(--surface-1)', borderRadius: 8 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Customer (Consignee)</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{challan.customer?.name}</div>
            {challan.customer?.business && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{challan.customer.business}</div>}
            {challan.customer?.phone && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Phone: {challan.customer.phone}</div>}
            {challan.customer?.gstin && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>GSTIN: {challan.customer.gstin}</div>}
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Issued By</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{challan.createdBy?.name || 'Authorized Dispatch'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Role: {challan.createdBy?.role || 'Operations'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Email: {challan.createdBy?.email}</div>
          </div>
        </div>

        {/* Items Table */}
        <div className="table-container" style={{ marginBottom: 24 }}>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description / SKU</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {challan.items?.map((item: any, idx: number) => {
                const snap = item.productSnapshot || {};
                return (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{snap.name || item.product?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>SKU: {snap.sku || item.product?.sku}</div>
                    </td>
                    <td>{snap.category || 'General'}</td>
                    <td><strong>{item.quantity}</strong> {snap.unit || 'pcs'}</td>
                    <td>₹{item.unitPrice?.toLocaleString('en-IN')}</td>
                    <td><strong>₹{item.totalPrice?.toLocaleString('en-IN')}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: 400 }}>
            {challan.notes && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Delivery Notes</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{challan.notes}</div>
              </div>
            )}
          </div>

          <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'right' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>Subtotal:</span>
              <span>₹{challan.subtotal?.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>Tax (0%):</span>
              <span>₹0.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900, color: 'var(--brand-600)', borderTop: '1px solid var(--border-subtle)', paddingTop: 6 }}>
              <span>Grand Total:</span>
              <span>₹{challan.grandTotal?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        title="Cancel Sales Challan"
        message="Are you sure you want to cancel this challan? Cancelled challans cannot be restored."
        confirmLabel="Cancel Challan"
        onConfirm={() => cancelMutation.mutate()}
        onCancel={() => setCancelDialogOpen(false)}
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
};