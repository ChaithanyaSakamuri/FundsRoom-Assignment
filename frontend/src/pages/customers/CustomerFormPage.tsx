import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { customersApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { toast } from '../../stores/toastStore';

export const CustomerFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    business: '',
    type: 'WHOLESALE',
    phone: '',
    email: '',
    status: 'ACTIVE',
    address: '',
    city: '',
    state: '',
    gstin: '',
    notes: '',
  });

  const { data: customerData } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (customerData) {
      setForm({
        name: customerData.name || '',
        business: customerData.business || '',
        type: customerData.type || 'WHOLESALE',
        phone: customerData.phone || '',
        email: customerData.email || '',
        status: customerData.status || 'ACTIVE',
        address: customerData.address || '',
        city: customerData.city || '',
        state: customerData.state || '',
        gstin: customerData.gstin || '',
        notes: customerData.notes || '',
      });
    }
  }, [customerData]);

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) =>
      isEdit ? customersApi.update(id!, data) : customersApi.create(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(isEdit ? 'Customer updated' : 'Customer account created');
      const targetId = isEdit ? id : res?.data?.id;
      if (targetId) navigate(`/customers/${targetId}`);
      else navigate('/customers');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.warning('Name and phone number are required.');
      return;
    }
    saveMutation.mutate(form);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/customers')}
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', marginBottom: 16 }}
      >
        <ArrowLeft size={14} /> Back to Customer CRM
      </button>

      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Customer Account' : 'Add New Customer Account'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update details and contact info' : 'Create a new CRM account for sales tracking'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card card-padded" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Rajesh Kumar"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Company / Business Name</label>
            <input
              className="form-input"
              value={form.business}
              onChange={(e) => setForm({ ...form, business: e.target.value })}
              placeholder="e.g. Apex Traders Pvt Ltd"
            />
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Customer Type</label>
            <select
              className="form-input form-select"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="WHOLESALE">Wholesale</option>
              <option value="RETAIL">Retail</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="DIRECT">Direct</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              className="form-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="client@business.com"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Account Status</label>
            <select
              className="form-input form-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PROSPECT">Prospect</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">GSTIN (Optional)</label>
            <input
              className="form-input"
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              placeholder="27AAAAA0000A1Z5"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            className="form-input"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Street address, Industrial Estate, Hub..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              className="form-input"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Mumbai"
            />
          </div>
          <div className="form-group">
            <label className="form-label">State</label>
            <input
              className="form-input"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              placeholder="Maharashtra"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes & Remarks</label>
          <textarea
            className="form-input form-textarea"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Special credit terms, delivery preferences, key contact details..."
          />
        </div>

        <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '16px 0 0', borderTop: '1px solid var(--border-subtle)' }}>
          <Button variant="secondary" type="button" onClick={() => navigate('/customers')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" icon={<Save size={14} />} loading={saveMutation.isPending}>
            {isEdit ? 'Update Customer' : 'Save Customer Account'}
          </Button>
        </div>
      </form>
    </div>
  );
};