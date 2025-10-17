import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Typography,
  Dropdown,
  Avatar,
  Space,
  Drawer
} from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  CarOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  CalendarOutlined,
  ToolOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { usePermissions } from '../../hooks/usePermissions';
import { NotificationCenter } from '../notifications/NotificationCenter';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const {
    canManageVehicles,
    canManageReservations,
    canManageMaintenance,
    canViewDashboard,
    isCustomer
  } = usePermissions();

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Build menu items based on user permissions
  const menuItems = [
    canViewDashboard() && {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    canManageVehicles() && {
      key: '/vehicles',
      icon: <CarOutlined />,
      label: 'Vehículos',
    },
    canManageReservations() && {
      key: '/reservations',
      icon: <CalendarOutlined />,
      label: 'Reservas',
    },
    canManageMaintenance() && {
      key: '/maintenance',
      icon: <ToolOutlined />,
      label: 'Mantenimiento',
    },
  ].filter(Boolean); // Remove null items

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Perfil',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: handleLogout,
    },
  ];

  // Sidebar content component
  const SidebarContent = ({ isCollapsed = false }: { isCollapsed?: boolean }) => (
    <>
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        padding: isCollapsed ? '0' : '0 24px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <CarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
        {!isCollapsed && (
          <Title level={4} style={{ margin: '0 0 0 12px', color: '#1890ff' }}>
            CarRental
          </Title>
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ border: 'none' }}
      />
    </>
  );

  return (
    <Layout style={{
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            background: '#fff',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 100,
          }}
          width={200}
          collapsedWidth={80}
          breakpoint="lg"
          onBreakpoint={(broken) => {
            if (broken) {
              setCollapsed(true);
            }
          }}
        >
          <SidebarContent isCollapsed={collapsed} />
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title={
          <Space>
            <CarOutlined style={{ color: '#1890ff' }} />
            <span style={{ color: '#1890ff' }}>CarRental</span>
          </Space>
        }
        placement="left"
        closable={true}
        onClose={() => setMobileDrawerOpen(false)}
        open={isMobile && mobileDrawerOpen}
        bodyStyle={{ padding: 0 }}
        width={280}
        style={{ zIndex: 1000 }}
      >
        <SidebarContent />
      </Drawer>

      <Layout style={{
        marginLeft: !isMobile ? (collapsed ? 80 : 200) : 0,
        width: !isMobile ? `calc(100% - ${collapsed ? 80 : 200}px)` : '100%',
        minHeight: '100vh'
      }}>
        <Header style={{
          padding: isMobile ? '0 12px' : '0 24px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          width: '100%',
          height: 64,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{
              fontSize: '16px',
              width: 48,
              height: 48
            }}
          />

          <Space size="middle">
            {/* Notification Center */}
            <NotificationCenter showAsDropdown={true} />

            {/* User Menu */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} size={isMobile ? 'default' : 'large'} />
                {!isMobile && (
                  <span style={{
                    maxWidth: 150,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user?.username} ({user?.roles?.[0] || 'Usuario'})
                  </span>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{
          margin: isMobile ? '8px' : '16px',
          padding: isMobile ? '12px' : '20px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 80px)',
          overflow: 'auto',
          width: '100%',
          maxWidth: '100%'
        }}>
          <div className="responsive-container">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;