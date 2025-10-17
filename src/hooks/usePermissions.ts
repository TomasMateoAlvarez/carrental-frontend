import { useAuthStore } from '../stores/authStore';

export const usePermissions = () => {
  const { user, hasRole, hasPermission, isAdmin, isEmployee, isCustomer } = useAuthStore();

  const canManageVehicles = () => {
    return isAdmin() || hasPermission('VEHICLE_MANAGE');
  };

  const canChangeVehicleStatus = () => {
    return hasPermission('VEHICLE_STATUS_CHANGE');
  };

  const canUploadPhotos = () => {
    return hasPermission('VEHICLE_PHOTO_UPLOAD');
  };

  const canManageMaintenance = () => {
    return isAdmin() || hasPermission('MAINTENANCE_RECORD_MANAGE');
  };

  const canViewNotifications = () => {
    return hasPermission('NOTIFICATION_VIEW');
  };

  const canManageNotifications = () => {
    return hasPermission('NOTIFICATION_MANAGE');
  };

  const canViewDashboard = () => {
    return isAdmin() || hasPermission('DASHBOARD_VIEW');
  };

  const canManageReservations = () => {
    return isAdmin() || hasPermission('RESERVATION_MANAGE');
  };

  const canCreateReservations = () => {
    return hasPermission('RESERVATION_CREATE');
  };

  const canViewAnalytics = () => {
    return hasPermission('ANALYTICS_VIEW');
  };

  // Employee-specific permissions (can only change vehicle status)
  const isEmployeeRestricted = () => {
    return isEmployee() && !isAdmin();
  };

  const canFullyEditVehicle = () => {
    return hasPermission('VEHICLE_UPDATE') && !isEmployeeRestricted();
  };

  const canDeleteVehicle = () => {
    return hasPermission('VEHICLE_DELETE') && !isEmployeeRestricted();
  };

  const canCreateVehicle = () => {
    return hasPermission('VEHICLE_CREATE') && !isEmployeeRestricted();
  };

  return {
    user,
    hasRole,
    hasPermission,
    isAdmin,
    isEmployee,
    isCustomer,
    isEmployeeRestricted,
    canManageVehicles,
    canChangeVehicleStatus,
    canUploadPhotos,
    canManageMaintenance,
    canViewNotifications,
    canManageNotifications,
    canViewDashboard,
    canManageReservations,
    canCreateReservations,
    canViewAnalytics,
    canFullyEditVehicle,
    canDeleteVehicle,
    canCreateVehicle,
  };
};