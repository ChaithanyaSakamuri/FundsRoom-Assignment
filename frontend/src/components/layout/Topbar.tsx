import React from 'react';
import { Search, Sun, Moon, Menu } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';

interface TopbarProps {
  onOpenCommandPalette: () => void;
  onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenCommandPalette, onMobileMenuToggle }) => {
  const { isDark, toggle } = useThemeStore();
  const { user } = useAuthStore();

  return (
    <header className="topbar">
      <button
        className="topbar-icon-btn mobile-menu-trigger"
        onClick={onMobileMenuToggle}
        title="Toggle Menu"
      >
        <Menu size={18} />
      </button>

      <button className="topbar-search-btn" onClick={onOpenCommandPalette}>
        <Search size={14} />
        <span>Search customers, products, challans...</span>
        <span className="topbar-shortcut">⌘K</span>
      </button>

      <div className="topbar-actions">
        <button className="topbar-icon-btn" onClick={toggle} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: user?.avatarColor || '#6366f1',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user?.name?.[0] || 'U'}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
};