import React, { useState, useEffect } from 'react';
import {
  Badge,
  Dropdown,
  Button,
  List,
  Typography,
  Space,
  Tag,
  Empty,
  Spin,
  message,
  Card,
  Divider,
  Popconfirm
} from 'antd';
import {
  BellOutlined,
  DeleteOutlined,
  CheckOutlined,
  EyeOutlined,
  ToolOutlined,
  CarOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { notificationsAPI } from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';

// Inline types to bypass import issues
interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: string;
  createdAt: string;
  readAt?: string;
}

enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

enum NotificationType {
  MAINTENANCE = 'MAINTENANCE',
  RESERVATION = 'RESERVATION',
  SYSTEM = 'SYSTEM',
  PAYMENT = 'PAYMENT',
  VEHICLE = 'VEHICLE'
}

const { Text, Title } = Typography;

interface NotificationCenterProps {
  showAsDropdown?: boolean;
  maxHeight?: number;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  showAsDropdown = true,
  maxHeight = 400
}) => {
  const { canViewNotifications } = usePermissions();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const loadNotifications = async () => {
    if (!canViewNotifications()) return;

    try {
      setLoading(true);
      // For now, just show empty notifications to prevent backend errors
      // TODO: Fix backend notifications API
      setNotifications([]);
      setUnreadCount(0);

      /* Temporarily disabled until backend API is fixed
      const [userNotifications, count] = await Promise.all([
        notificationsAPI.getUserNotifications(),
        notificationsAPI.getUnreadCount()
      ]);
      setNotifications(userNotifications);
      setUnreadCount(count);
      */
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Don't show error message to avoid spam
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Temporarily disabled polling to prevent resource exhaustion
    // TODO: Re-enable when backend notifications API is fixed
    // const interval = setInterval(loadNotifications, 30000);
    // return () => clearInterval(interval);
  }, []); // Empty dependency array to run only once

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      message.error('Error al marcar como leído');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      await loadNotifications();
      message.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error marking all as read:', error);
      message.error('Error al marcar todas como leídas');
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      await loadNotifications();
      message.success('Notificación eliminada');
    } catch (error) {
      console.error('Error deleting notification:', error);
      message.error('Error al eliminar la notificación');
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'red';
      case NotificationPriority.HIGH:
        return 'orange';
      case NotificationPriority.MEDIUM:
        return 'blue';
      case NotificationPriority.LOW:
        return 'green';
      default:
        return 'default';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case NotificationType.MAINTENANCE_DUE:
      case NotificationType.MAINTENANCE_COMPLETED:
        return <ToolOutlined style={{ color: '#faad14' }} />;
      case NotificationType.RESERVATION_CONFIRMED:
      case NotificationType.RESERVATION_CANCELLED:
      case NotificationType.VEHICLE_RETURNED:
        return <CarOutlined style={{ color: '#1890ff' }} />;
      case NotificationType.SYSTEM_ALERT:
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case NotificationType.INFO:
        return <InfoCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return <BellOutlined />;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const notificationsList = (
    <div style={{ width: showAsDropdown ? 350 : '100%', maxHeight, overflowY: 'auto' }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <Empty
          description="No hay notificaciones"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          {/* Header with actions */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={5} style={{ margin: 0 }}>
                Notificaciones ({unreadCount} nuevas)
              </Title>
              {unreadCount > 0 && (
                <Button
                  type="link"
                  size="small"
                  onClick={handleMarkAllAsRead}
                >
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </div>

          {/* Notifications list */}
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item
                style={{
                  backgroundColor: notification.isRead ? 'transparent' : '#f6ffed',
                  borderLeft: notification.isRead ? 'none' : '3px solid #52c41a',
                  padding: '12px 16px'
                }}
                actions={[
                  !notification.isRead && (
                    <Button
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Marcar como leído"
                    />
                  ),
                  <Popconfirm
                    title="¿Eliminar esta notificación?"
                    onConfirm={() => handleDelete(notification.id)}
                    okText="Sí"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      title="Eliminar"
                    />
                  </Popconfirm>
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={getNotificationIcon(notification.type)}
                  title={
                    <Space>
                      <Text strong={!notification.isRead}>
                        {notification.title}
                      </Text>
                      <Tag
                        color={getPriorityColor(notification.priority)}
                        size="small"
                      >
                        {notification.priority}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {notification.message}
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {formatRelativeTime(notification.createdAt)}
                        </Text>
                        {notification.relatedEntityType && (
                          <Tag size="small" style={{ marginLeft: 8 }}>
                            {notification.relatedEntityType}
                          </Tag>
                        )}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </>
      )}
    </div>
  );

  if (!canViewNotifications()) {
    return null;
  }

  if (!showAsDropdown) {
    return (
      <Card title="Centro de Notificaciones">
        {notificationsList}
      </Card>
    );
  }

  return (
    <Dropdown
      open={dropdownVisible}
      onOpenChange={setDropdownVisible}
      overlay={notificationsList}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button
        type="text"
        shape="circle"
        style={{ position: 'relative' }}
        onClick={() => setDropdownVisible(!dropdownVisible)}
      >
        <Badge count={unreadCount} size="small">
          <BellOutlined style={{ fontSize: '18px' }} />
        </Badge>
      </Button>
    </Dropdown>
  );
};