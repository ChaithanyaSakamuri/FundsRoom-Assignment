import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, FileText, ArrowLeftRight,
  BarChart2, Activity, ChevronLeft, ChevronRight, Zap,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  to: string;
  icon: any;
  label: string;
  exact?: boolean;
  roles: string[];
}

const navItems: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true, roles: [] },
  { to: '/customers', icon: Users, label: 'Customers', roles: ['ADMIN', 'SALES'] },
  { to: '/inventory', icon: Package, label: 'Inventory', roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  { to: '/stock-movements', icon: ArrowLeftRight, label: 'Stock Movements', roles: ['ADMIN', 'WAREHOUSE'] },
  { to: '/challans', icon: FileText, label: 'Sales Challans', roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
  { to: '/reports', icon: BarChart2, label: 'Reports', roles: [] },
  { to: '/activity', icon: Activity, label: 'Activity', roles: ['ADMIN'] },
];

const avatarColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6',
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = navItems.filter(
    (item) => item.roles.length === 0 || (user && item.roles.includes(user.role as string))
  );

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const avatarColor = user?.avatarColor || avatarColors[0];

  return (
    <>
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 99, backdropFilter: 'blur(4px)',
          }}
          onClick={onMobileClose}
        />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Zap size={16} color="white" />
          </div>
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-name">NEXORA</div>
            <div className="sidebar-logo-tagline">Business Operations</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
              onClick={onMobileClose}
            >
              <item.icon size={16} className="sidebar-icon" />
              <span className="sidebar-link-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout} title="Logout">
            <div
              className="sidebar-avatar"
              style={{ background: avatarColor }}
            >
              {initials}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role} · Logout</div>
            </div>
          </div>
        </div>

        <button
          className="collapse-btn"
          onClick={onToggleCollapse}
          title="Toggle Sidebar"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
};