import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { usePermissions } from '../../hooks/usePermissions';
import { NotificationCenter } from '../notifications/NotificationCenter';

// Professional SaaS Admin Layout Icons (using Unicode symbols for now)
const DashboardIcon = () => (
  <svg className="sidebar-nav-icon" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

const CarIcon = () => (
  <svg className="sidebar-nav-icon" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8-2a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="sidebar-nav-icon" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const UsersIcon = () => (
  <svg className="sidebar-nav-icon" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

const ToolIcon = () => (
  <svg className="sidebar-nav-icon" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
  </svg>
);

const HamburgerIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
  </svg>
);

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const {
    canManageVehicles,
    canManageReservations,
    canManageMaintenance,
    canViewDashboard,
  } = usePermissions();

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Navigation items based on permissions
  const navigationItems = [
    canViewDashboard() && {
      key: '/dashboard',
      icon: <DashboardIcon />,
      label: 'Dashboard',
    },
    canManageVehicles() && {
      key: '/vehicles',
      icon: <CarIcon />,
      label: 'Fleet',
    },
    canManageReservations() && {
      key: '/reservations',
      icon: <CalendarIcon />,
      label: 'Reservations',
    },
    {
      key: '/clients',
      icon: <UsersIcon />,
      label: 'Customers',
    },
    canManageMaintenance() && {
      key: '/maintenance',
      icon: <ToolIcon />,
      label: 'Maintenance',
    },
  ].filter(Boolean);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const getPageTitle = (pathname: string): string => {
    const titles: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/vehicles': 'Fleet Management',
      '/reservations': 'Reservations',
      '/clients': 'Customer Management',
      '/maintenance': 'Maintenance'
    };
    return titles[pathname] || 'CARENTAL Admin';
  };

  return (
    <div className="admin-layout">
      {/* Professional Sidebar */}
      <div
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${isMobile && mobileMenuOpen ? 'mobile-open' : ''}`}
        style={{
          transform: isMobile ? (mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        }}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <CarIcon />
            </div>
            {!sidebarCollapsed && (
              <div>
                <div className="sidebar-logo-text">CARENTAL</div>
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '400' }}>
                  Admin Dashboard
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigationItems.map((item: any) => (
            <a
              key={item.key}
              className={`sidebar-nav-item ${location.pathname === item.key ? 'active' : ''}`}
              onClick={() => handleNavigation(item.key)}
              style={{ cursor: 'pointer' }}
            >
              {item.icon}
              {!sidebarCollapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-nav-item"
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8'
            }}
          >
            <LogoutIcon />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Navigation */}
        <header className="top-nav">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="notification-bell"
            >
              <HamburgerIcon />
            </button>
            <h1 className="top-nav-title">{getPageTitle(location.pathname)}</h1>
          </div>

          <div className="top-nav-right">
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <NotificationCenter showAsDropdown={true} />
            </div>

            {/* User Profile */}
            <div className="user-profile">
              <div className="user-avatar">
                {user?.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              {!isMobile && (
                <div>
                  <div style={{ fontWeight: '500', fontSize: '14px' }}>
                    {user?.username || 'Admin User'}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {user?.roles?.[0] || 'Administrator'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;