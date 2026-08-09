import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { productsApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { toast } from '../../stores/toastStore';

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: 'General',
    price: 0,
    currentStock: 0,
    minStock: 10,
    warehouse: 'Main Warehouse',
    unit: 'pcs',
    description: '',
  });

  const { data: productData } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (productData) {
      setForm({
        name: productData.name || '',
        sku: productData.sku || '',
        category: productData.category || 'General',
        price: productData.price || 0,
        currentStock: productData.currentStock || 0,
        minStock: productData.minStock || 10,
        warehouse: productData.warehouse || 'Main Warehouse',
        unit: productData.unit || 'pcs',
        description: productData.description || '',
      });
    }
  }, [productData]);

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) =>
      isEdit ? productsApi.update(id!, data) : productsApi.create(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(isEdit ? 'Product updated' : 'Product created');
      const targetId = isEdit ? id : res?.data?.id;
      if (targetId) navigate(`/inventory/${targetId}`);
      else navigate('/inventory');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save product');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku) {
      toast.warning('Product name and SKU are required.');
      return;
    }
    saveMutation.mutate(form);
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/inventory')}
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', marginBottom: 16 }}
      >
        <ArrowLeft size={14} /> Back to Inventory Catalog
      </button>

      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Product SKU' : 'Add New Inventory Product'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update pricing, minimum thresholds, and specs' : 'Add a new product item to inventory'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card card-padded" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Industrial Steel Fastener M8"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">SKU Code *</label>
            <input
              className="form-input"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
              placeholder="e.g., FST-M8-100"
              required
            />
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Category</label>
            <input
              className="form-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Fasteners, Power Tools"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit Price (₹) *</label>
            <input
              className="form-input"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Measurement Unit</label>
            <input
              className="form-input"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="pcs, kg, box, mtr"
            />
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Initial Stock Level</label>
            <input
              className="form-input"
              type="number"
              min="0"
              value={form.currentStock}
              onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })}
              disabled={isEdit}
            />
            {isEdit && <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Use 'Adjust Stock' for stock updates</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Minimum Stock Alert Threshold</label>
            <input
              className="form-input"
              type="number"
              min="0"
              value={form.minStock}
              onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Warehouse Location</label>
            <input
              className="form-input"
              value={form.warehouse}
              onChange={(e) => setForm({ ...form, warehouse: e.target.value })}
              placeholder="Main Warehouse, Bay 4"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description / Technical Specs</label>
          <textarea
            className="form-input form-textarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Product specifications, dimensions, material details..."
          />
        </div>

        <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '16px 0 0', borderTop: '1px solid var(--border-subtle)' }}>
          <Button variant="secondary" type="button" onClick={() => navigate('/inventory')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" icon={<Save size={14} />} loading={saveMutation.isPending}>
            {isEdit ? 'Update Product' : 'Create Product SKU'}
          </Button>
        </div>
      </form>
    </div>
  );
};