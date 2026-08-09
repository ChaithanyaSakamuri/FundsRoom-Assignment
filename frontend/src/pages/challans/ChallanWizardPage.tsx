import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Search, Plus, Trash2, CheckCircle2, FileText, Download, AlertTriangle } from 'lucide-react';
import { customersApi, productsApi, challansApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../stores/toastStore';

export const ChallanWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');

  const [step, setStep] = useState(1);

  // Step 1: Customer
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Step 2 & 3: Products & Quantities
  const [productSearch, setProductSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<Array<{ product: any; quantity: number }>>([]);
  const [notes, setNotes] = useState('');

  // Search queries
  const { data: customerResults } = useQuery({
    queryKey: ['search-customers', customerSearch],
    queryFn: () => customersApi.search(customerSearch),
    enabled: customerSearch.length > 0,
  });

  const { data: productResults } = useQuery({
    queryKey: ['search-products', productSearch],
    queryFn: () => productsApi.search(productSearch),
    enabled: productSearch.length > 0,
  });

  const { data: allCustomers } = useQuery({
    queryKey: ['all-customers-wizard'],
    queryFn: () => customersApi.getAll({ limit: 10 }),
  });

  const { data: allProducts } = useQuery({
    queryKey: ['all-products-wizard'],
    queryFn: () => productsApi.getAll({ limit: 10 }),
  });

  useEffect(() => {
    if (preselectedCustomerId) {
      customersApi.getById(preselectedCustomerId).then((c) => {
        if (c) setSelectedCustomer(c);
      });
    }
  }, [preselectedCustomerId]);

  const [createdChallan, setCreatedChallan] = useState<any>(null);

  const createChallanMutation = useMutation({
    mutationFn: async () => {
      const items = selectedItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price,
      }));
      const payload = {
        customerId: selectedCustomer.id,
        notes,
        items,
      };
      // Step 1: Create draft
      const draftRes = await challansApi.create(payload);

      // Step 2: Automatically confirm to trigger atomic stock deduction!
      const confirmRes = await challansApi.confirm(draftRes.data.id);
      return confirmRes.data;
    },
    onSuccess: (data) => {
      setCreatedChallan(data);
      toast.success('Challan issued and confirmed! Stock updated atomically.');
      setStep(5);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to issue challan');
    },
  });

  const handleAddItem = (prod: any) => {
    const existing = selectedItems.find((i) => i.product.id === prod.id);
    if (existing) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.product.id === prod.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems([...selectedItems, { product: prod, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (prodId: string, qty: number) => {
    if (qty <= 0) {
      setSelectedItems(selectedItems.filter((i) => i.product.id !== prodId));
    } else {
      setSelectedItems(
        selectedItems.map((i) => (i.product.id === prodId ? { ...i, quantity: qty } : i))
      );
    }
  };

  const handleRemoveItem = (prodId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.product.id !== prodId));
  };

  // Stock validation check for Step 3
  const stockErrors = selectedItems.filter((i) => i.quantity > i.product.currentStock);

  const calculateSubtotal = () =>
    selectedItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const displayedCustomers = customerSearch
    ? customerResults || []
    : allCustomers?.data || [];

  const displayedProducts = productSearch
    ? productResults || []
    : allProducts?.data || [];

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/challans')}
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', marginBottom: 16 }}
      >
        <ArrowLeft size={14} /> Back to Challans List
      </button>

      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Issue Sales Delivery Challan</h1>
          <p className="page-subtitle">5-step interactive fulfillment wizard with real-time stock validation</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="wizard-steps">
        {[
          { num: 1, label: 'Select Customer' },
          { num: 2, label: 'Add Line Items' },
          { num: 3, label: 'Review & Validate' },
          { num: 4, label: 'Confirm & Deduct' },
          { num: 5, label: 'Fulfillment Issued' },
        ].map((s, i) => (
          <React.Fragment key={s.num}>
            <div className={`wizard-step ${step === s.num ? 'active' : step > s.num ? 'completed' : ''}`}>
              <div className="wizard-step-number">{step > s.num ? '✓' : s.num}</div>
              <span className="wizard-step-label">{s.label}</span>
            </div>
            {i < 4 && <div className={`wizard-connector ${step > s.num ? 'completed' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1: Select Customer */}
      {step === 1 && (
        <div className="card card-padded" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Step 1: Choose Customer Account</h3>

          <div className="search-input-wrap">
            <Search size={14} />
            <input
              className="form-input"
              placeholder="Type to search customers by name or business..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxHeight: 320, overflowY: 'auto' }}>
            {displayedCustomers.map((c: any) => {
              const isSelected = selectedCustomer?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  style={{
                    padding: 14,
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isSelected ? 'var(--brand-500)' : 'var(--border-subtle)'}`,
                    background: isSelected ? 'var(--brand-50)' : 'var(--surface-1)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{c.business || 'Individual'} · {c.phone}</div>
                  <div style={{ marginTop: 6 }}><Badge variant="neutral">{c.type}</Badge></div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <Button
              variant="primary"
              disabled={!selectedCustomer}
              onClick={() => setStep(2)}
            >
              Continue to Select Products →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Add Products */}
      {step === 2 && (
        <div className="card card-padded" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Step 2: Add Line Items for {selectedCustomer?.name}</h3>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-600)' }}>
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="search-input-wrap">
            <Search size={14} />
            <input
              className="form-input"
              placeholder="Search product catalog by name or SKU..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxHeight: 300, overflowY: 'auto' }}>
            {displayedProducts.map((p: any) => {
              const selectedCount = selectedItems.find((i) => i.product.id === p.id)?.quantity || 0;
              return (
                <div
                  key={p.id}
                  style={{
                    padding: 12,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--surface-1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      SKU: {p.sku} | Stock: <strong>{p.currentStock} {p.unit}</strong> | ₹{p.price}
                    </div>
                  </div>
                  <Button
                    variant={selectedCount > 0 ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleAddItem(p)}
                  >
                    {selectedCount > 0 ? `+${selectedCount}` : 'Add'}
                  </Button>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
            <Button
              variant="primary"
              disabled={selectedItems.length === 0}
              onClick={() => setStep(3)}
            >
              Review Quantities & Stock →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Validate Quantities */}
      {step === 3 && (
        <div className="card card-padded" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Step 3: Quantities & Real-time Stock Validation</h3>

          {stockErrors.length > 0 && (
            <div style={{ padding: 12, background: 'var(--danger-50)', border: '1px solid var(--danger-100)', borderRadius: 8, color: 'var(--danger-600)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} />
              <span>Insufficient stock! Adjust quantities before proceeding.</span>
            </div>
          )}

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product Item</th>
                  <th>Available Stock</th>
                  <th>Quantity Required</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map(({ product, quantity }) => {
                  const hasStockErr = quantity > product.currentStock;

                  return (
                    <tr key={product.id} style={{ background: hasStockErr ? 'var(--danger-50)' : undefined }}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{product.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>SKU: {product.sku}</div>
                      </td>
                      <td>
                        <span style={{ color: hasStockErr ? 'var(--danger-600)' : 'inherit', fontWeight: 600 }}>
                          {product.currentStock} {product.unit}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <input
                            className={`form-input ${hasStockErr ? 'error' : ''}`}
                            type="number"
                            min="1"
                            style={{ width: 80, height: 32 }}
                            value={quantity}
                            onChange={(e) => handleQuantityChange(product.id, Number(e.target.value))}
                          />
                          {hasStockErr && (
                            <span style={{ fontSize: 10, color: 'var(--danger-600)', fontWeight: 600 }}>
                              Only {product.currentStock} units available!
                            </span>
                          )}
                        </div>
                      </td>
                      <td>₹{product.price}</td>
                      <td><strong>₹{(product.price * quantity).toLocaleString('en-IN')}</strong></td>
                      <td>
                        <button
                          onClick={() => handleRemoveItem(product.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger-500)', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Subtotal Amount</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--brand-600)' }}>
                  ₹{calculateSubtotal().toLocaleString('en-IN')}
                </div>
              </div>
              <Button
                variant="primary"
                disabled={stockErrors.length > 0 || selectedItems.length === 0}
                onClick={() => setStep(4)}
              >
                Proceed to Confirmation →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Confirm & Deduct */}
      {step === 4 && (
        <div className="card card-padded" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800 }}>Step 4: Final Confirmation & Transactional Stock Deduction</h3>

          <div className="card card-padded" style={{ background: 'var(--surface-1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Customer Account</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{selectedCustomer.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedCustomer.business} · {selectedCustomer.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Fulfillment Total</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--brand-600)', marginTop: 2 }}>
                  ₹{calculateSubtotal().toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{selectedItems.length} line items</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery & Order Notes</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Dispatches via Transport Corp, Freight prepaid..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div style={{ padding: 12, background: 'var(--warning-50)', border: '1px solid var(--warning-100)', borderRadius: 8, fontSize: 12, color: 'var(--warning-600)' }}>
            ⚠️ <strong>Transactional Operation:</strong> Confirming will immediately deduct items from warehouse inventory and generate an official PDF delivery challan.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="secondary" onClick={() => setStep(3)}>← Back</Button>
            <Button
              variant="primary"
              size="lg"
              loading={createChallanMutation.isPending}
              onClick={() => createChallanMutation.mutate()}
            >
              Confirm & Issue Delivery Challan
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: Success State */}
      {step === 5 && createdChallan && (
        <div className="card card-padded" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--success-50)', color: 'var(--success-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Delivery Challan Issued Successfully!
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Challan <strong>{createdChallan.challanNumber}</strong> confirmed. Stock ledgers updated.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Button variant="secondary" icon={<FileText size={14} />} onClick={() => navigate(`/challans/${createdChallan.id}`)}>
              View Challan Details
            </Button>
            <Button variant="primary" icon={<Download size={14} />} onClick={() => challansApi.downloadPDF(createdChallan.id)}>
              Download PDF Invoice
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};