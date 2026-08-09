import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Package, FileText, ArrowRight, CornerDownLeft } from 'lucide-react';
import { searchAll } from '../../services/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ customers: any[]; products: any[]; challans: any[] }>({
    customers: [],
    products: [],
    challans: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults({ customers: [], products: [], challans: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ customers: [], products: [], challans: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchAll(query);
        setResults(res);
        setSelectedIndex(0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const allItems = [
    ...results.customers.map((c) => ({ type: 'customer', id: c.id, title: c.name, subtitle: c.business || c.phone, path: `/customers/${c.id}` })),
    ...results.products.map((p) => ({ type: 'product', id: p.id, title: p.name, subtitle: `SKU: ${p.sku} | Stock: ${p.currentStock}`, path: `/inventory/${p.id}` })),
    ...results.challans.map((ch) => ({ type: 'challan', id: ch.id, title: ch.challanNumber, subtitle: `${ch.customer?.name} | ₹${ch.grandTotal}`, path: `/challans/${ch.id}` })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        navigate(allItems[selectedIndex].path);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="command-overlay" onClick={onClose}>
      <div className="command-palette animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="command-input-wrap">
          <Search size={18} color="var(--text-tertiary)" />
          <input
            ref={inputRef}
            className="command-input"
            placeholder="Search customers, products, challans..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="command-results">
          {loading && <div style={{ padding: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>Searching NEXORA...</div>}

          {!loading && query && allItems.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>
              No results found for "{query}"
            </div>
          )}

          {!query && (
            <div style={{ padding: 16 }}>
              <div className="command-section-label">Quick Links</div>
              <div className="command-item" onClick={() => { navigate('/customers/new'); onClose(); }}>
                <div className="command-item-icon"><Users size={14} /></div>
                <div className="command-item-text">
                  <div className="command-item-title">Add New Customer</div>
                  <div className="command-item-subtitle">Create CRM customer record</div>
                </div>
              </div>
              <div className="command-item" onClick={() => { navigate('/challans/new'); onClose(); }}>
                <div className="command-item-icon"><FileText size={14} /></div>
                <div className="command-item-text">
                  <div className="command-item-title">Create Sales Challan</div>
                  <div className="command-item-subtitle">Issue delivery challan</div>
                </div>
              </div>
              <div className="command-item" onClick={() => { navigate('/inventory/new'); onClose(); }}>
                <div className="command-item-icon"><Package size={14} /></div>
                <div className="command-item-text">
                  <div className="command-item-title">Add Product</div>
                  <div className="command-item-subtitle">Create catalog item</div>
                </div>
              </div>
            </div>
          )}

          {allItems.length > 0 && (
            <div style={{ padding: '8px 0' }}>
              {allItems.map((item, index) => {
                const Icon = item.type === 'customer' ? Users : item.type === 'product' ? Package : FileText;
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`command-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => { navigate(item.path); onClose(); }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="command-item-icon"><Icon size={14} /></div>
                    <div className="command-item-text">
                      <div className="command-item-title">{item.title}</div>
                      <div className="command-item-subtitle">{item.subtitle}</div>
                    </div>
                    {isSelected && <span className="command-item-kbd"><CornerDownLeft size={10} /></span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="command-footer">
          <div className="command-hint">
            <span className="command-item-kbd">↑↓</span> navigate
          </div>
          <div className="command-hint">
            <span className="command-item-kbd">↵</span> select
          </div>
          <div className="command-hint">
            <span className="command-item-kbd">ESC</span> close
          </div>
        </div>
      </div>
    </div>
  );
};