import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Phone, Mail, Building, MapPin, Calendar, Plus, FileText,
  Edit2, Trash2, CheckCircle2, Clock, Activity, MessageSquare
} from 'lucide-react';
import { customersApi } from '../../services/api';
import { CustomerStatusBadge, ChallanStatusBadge, Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import { toast } from '../../stores/toastStore';
import { formatDistanceToNow, format } from 'date-fns';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'overview' | 'challans' | 'followups'>('overview');
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [followupDate, setFollowupDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [followupNote, setFollowupNote] = useState('');

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getById(id!),
    enabled: !!id,
  });

  const createFollowupMutation = useMutation({
    mutationFn: (data: any) => customersApi.createFollowup(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      toast.success('Follow-up scheduled successfully');
      setFollowupModalOpen(false);
      setFollowupNote('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to schedule follow-up');
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: () => customersApi.delete(id!),
    onSuccess: () => {
      toast.success('Customer account deleted');
      navigate('/customers');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    },
  });

  if (isLoading) {
    return (
      <div>
        <SkeletonCard />
        <div style={{ height: 24 }} />
        <SkeletonTable rows={5} />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="card card-padded" style={{ textAlign: 'center' }}>
        Customer record not found.
      </div>
    );
  }

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate('/customers')}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', marginBottom: 12 }}
        >
          <ArrowLeft size={14} /> Back to Customer CRM
        </button>

        <div className="page-header" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--brand-500)',
                color: 'white', fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {customer.name[0]}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 className="page-title">{customer.name}</h1>
                <CustomerStatusBadge status={customer.status} />
                <Badge variant="neutral">{customer.type}</Badge>
              </div>
              <p className="page-subtitle">{customer.business || 'Individual Customer'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" icon={<Edit2 size={14} />} onClick={() => navigate(`/customers/${id}/edit`)}>
              Edit Record
            </Button>
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => navigate(`/challans/new?customerId=${id}`)}>
              Create Challan
            </Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => setDeleteDialogOpen(true)} />
          </div>
        </div>
      </div>

      {/* 360 Info Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card card-padded">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>
            Contact Information
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
              <Phone size={14} color="var(--brand-500)" /> {customer.phone}
            </div>
            {customer.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                <Mail size={14} color="var(--brand-500)" /> {customer.email}
              </div>
            )}
            {customer.address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--text-secondary)' }}>
                <MapPin size={14} color="var(--brand-500)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{customer.address}{customer.city ? `, ${customer.city}` : ''}{customer.state ? `, ${customer.state}` : ''}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card card-padded">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>
            Business Metadata
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
            <div>
              <span className="text-tertiary">GSTIN: </span>
              <strong className="text-primary">{customer.gstin || 'Not specified'}</strong>
            </div>
            <div>
              <span className="text-tertiary">Account Type: </span>
              <strong className="text-primary">{customer.type}</strong>
            </div>
            <div>
              <span className="text-tertiary">Created By: </span>
              <span className="text-primary">{customer.createdBy?.name || 'System'}</span>
            </div>
          </div>
        </div>

        <div className="card card-padded">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>
            Sales Summary
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand-600)', marginBottom: 4 }}>
            {customer.challans?.length || 0} Challans
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Total issued sales challans for this account
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview & Timeline
        </button>
        <button className={`tab ${activeTab === 'challans' ? 'active' : ''}`} onClick={() => setActiveTab('challans')}>
          Sales Challans ({customer.challans?.length || 0})
        </button>
        <button className={`tab ${activeTab === 'followups' ? 'active' : ''}`} onClick={() => setActiveTab('followups')}>
          Follow-up Schedule ({customer.followups?.length || 0})
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid-2">
          <div className="card card-padded">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Scheduled Follow-ups</h3>
              <Button variant="ghost" size="sm" icon={<Plus size={12} />} onClick={() => setFollowupModalOpen(true)}>
                Add Schedule
              </Button>
            </div>

            {customer.followups?.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' }}>
                No follow-ups scheduled for this customer.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {customer.followups?.map((f: any) => (
                  <div key={f.id} style={{ padding: 12, background: 'var(--surface-1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                        Due: {format(new Date(f.dueDate), 'MMM dd, yyyy')}
                      </span>
                      {f.completedAt ? (
                        <Badge variant="success">Completed</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </div>
                    {f.note && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f.note}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card card-padded">
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Notes & Account Remarks</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {customer.notes || 'No notes added to this customer profile.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab: Challans */}
      {activeTab === 'challans' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Challan #</th>
                <th>Date</th>
                <th>Status</th>
                <th>Grand Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customer.challans?.map((ch: any) => (
                <tr key={ch.id}>
                  <td><strong>{ch.challanNumber}</strong></td>
                  <td>{format(new Date(ch.createdAt), 'MMM dd, yyyy')}</td>
                  <td><ChallanStatusBadge status={ch.status} /></td>
                  <td>₹{ch.grandTotal?.toLocaleString('en-IN')}</td>
                  <td>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/challans/${ch.id}`)}>
                      View Invoice
                    </Button>
                  </td>
                </tr>
              ))}
              {(!customer.challans || customer.challans.length === 0) && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-tertiary)' }}>
                    No sales challans recorded for this customer yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Followups */}
      {activeTab === 'followups' && (
        <div className="card card-padded">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Follow-up Register</h3>
            <Button variant="primary" size="sm" icon={<Plus size={12} />} onClick={() => setFollowupModalOpen(true)}>
              Schedule Follow-up
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {customer.followups?.map((f: any) => (
              <div key={f.id} className="card card-padded" style={{ background: 'var(--surface-1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Scheduled for {format(new Date(f.dueDate), 'MMMM dd, yyyy')}</div>
                  <Badge variant={f.completedAt ? 'success' : 'warning'}>{f.completedAt ? 'Completed' : 'Scheduled'}</Badge>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f.note || 'No notes specified'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Followup Modal */}
      <Modal isOpen={followupModalOpen} onClose={() => setFollowupModalOpen(false)} title="Schedule Customer Follow-up">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createFollowupMutation.mutate({ dueDate: followupDate, note: followupNote });
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              className="form-input"
              type="date"
              value={followupDate}
              onChange={(e) => setFollowupDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Follow-up Note / Objective</label>
            <textarea
              className="form-input form-textarea"
              placeholder="e.g., Check for restock order inquiry, discussion on payment terms..."
              value={followupNote}
              onChange={(e) => setFollowupNote(e.target.value)}
            />
          </div>
          <div className="modal-footer" style={{ padding: 0, border: 0 }}>
            <Button variant="secondary" type="button" onClick={() => setFollowupModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={createFollowupMutation.isPending}>Schedule</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Customer Account"
        message={`Are you sure you want to delete ${customer.name}? This will permanently remove the record.`}
        confirmLabel="Delete Customer"
        onConfirm={() => deleteCustomerMutation.mutate()}
        onCancel={() => setDeleteDialogOpen(false)}
        isLoading={deleteCustomerMutation.isPending}
      />
    </div>
  );
};