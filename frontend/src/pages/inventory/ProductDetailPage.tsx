import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit2, Plus, ArrowLeftRight, Package, Archive } from 'lucide-react';
import { productsApi, stockApi } from '../../services/api';
import { StockStatusBadge, MovementBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import { toast } from '../../stores/toastStore';
import { format } from 'date-fns';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [movementQty, setMovementQty] = useState(1);
  const [movementReason, setMovementReason] = useState('PURCHASE_RECEIPT');
  const [movementNotes, setMovementNotes] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
  });

  const recordMovementMutation = useMutation({
    mutationFn: (data: any) => stockApi.create({ productId: id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast.success('Stock movement recorded');
      setMovementModalOpen(false);
      setMovementQty(1);
      setMovementNotes('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to record movement');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => productsApi.delete(id!),
    onSuccess: () => {
      toast.success('Product archived');
      navigate('/inventory');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to archive product');
    },
  });

  if (isLoading) return <SkeletonCard />;
  if (!product) return <div className="card card-padded">Product not found.</div>;

  return (
    <div>
      <button
        onClick={() => navigate('/inventory')}
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', marginBottom: 16 }}
      >
        <ArrowLeft size={14} /> Back to Inventory Catalog
      </button>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-500)' }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="page-title">{product.name}</h1>
              <StockStatusBadge status={product.stockStatus || 'HEALTHY'} />
            </div>
            <p className="page-subtitle">SKU: {product.sku} · Category: {product.category}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" icon={<Edit2 size={14} />} onClick={() => navigate(`/inventory/${id}/edit`)}>
            Edit Product
          </Button>
          <Button variant="primary" icon={<ArrowLeftRight size={14} />} onClick={() => setMovementModalOpen(true)}>
            Adjust Stock
          </Button>
          <Button variant="danger" size="sm" icon={<Archive size={14} />} onClick={() => setArchiveDialogOpen(true)} />
        </div>
      </div>

      {/* Stock Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card card-padded">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
            Current Stock Level
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
            {product.currentStock} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>{product.unit}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
            Threshold Minimum: {product.minStock} {product.unit}
          </div>
        </div>

        <div className="card card-padded">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
            Unit Selling Price
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--brand-600)', lineHeight: 1 }}>
            ₹{product.price?.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
            Per unit ({product.unit})
          </div>
        </div>

        <div className="card card-padded">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
            Warehouse Location
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            {product.warehouse}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Designated storage zone
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="card card-padded" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Description</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{product.description}</p>
        </div>
      )}

      {/* Stock History Ledger */}
      <div className="card card-padded">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Stock Movement History</h3>
        <div className="table-container" style={{ border: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {product.stockMovements?.map((m: any) => (
                <tr key={m.id}>
                  <td>{format(new Date(m.createdAt), 'MMM dd, yyyy HH:mm')}</td>
                  <td><MovementBadge type={m.type} /></td>
                  <td><strong>{m.quantity}</strong> {product.unit}</td>
                  <td>{m.reason?.replace(/_/g, ' ')}</td>
                  <td>{m.createdBy?.name || 'System'}</td>
                </tr>
              ))}
              {(!product.stockMovements || product.stockMovements.length === 0) && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-tertiary)' }}>
                    No stock movements recorded for this item yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement Modal */}
      <Modal isOpen={movementModalOpen} onClose={() => setMovementModalOpen(false)} title="Record Stock Adjustment">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            recordMovementMutation.mutate({ type: movementType, quantity: Number(movementQty), reason: movementReason, notes: movementNotes });
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div className="form-group">
            <label className="form-label">Movement Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                className={`btn ${movementType === 'IN' ? 'btn-success' : 'btn-secondary'}`}
                onClick={() => setMovementType('IN')}
              >
                ▲ Stock IN (Add)
              </button>
              <button
                type="button"
                className={`btn ${movementType === 'OUT' ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => setMovementType('OUT')}
              >
                ▼ Stock OUT (Deduct)
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={movementQty}
              onChange={(e) => setMovementQty(Number(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reason</label>
            <select
              className="form-input form-select"
              value={movementReason}
              onChange={(e) => setMovementReason(e.target.value)}
            >
              <option value="PURCHASE_RECEIPT">Purchase Receipt (IN)</option>
              <option value="RETURN">Customer Return (IN)</option>
              <option value="DAMAGE_DISPOSAL">Damaged Goods (OUT)</option>
              <option value="AUDIT_ADJUSTMENT">Audit Adjustment</option>
              <option value="MANUAL_CORRECTION">Manual Correction</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Reference</label>
            <textarea
              className="form-input form-textarea"
              placeholder="PO number, audit note..."
              value={movementNotes}
              onChange={(e) => setMovementNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, border: 0 }}>
            <Button variant="secondary" type="button" onClick={() => setMovementModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={recordMovementMutation.isPending}>Save Movement</Button>
          </div>
        </form>
      </Modal>

      {/* Archive Confirm Dialog */}
      <ConfirmDialog
        isOpen={archiveDialogOpen}
        title="Archive Product"
        message={`Are you sure you want to archive ${product.name}? It will be hidden from active catalog.`}
        confirmLabel="Archive"
        onConfirm={() => archiveMutation.mutate()}
        onCancel={() => setArchiveDialogOpen(false)}
        isLoading={archiveMutation.isPending}
      />
    </div>
  );
};