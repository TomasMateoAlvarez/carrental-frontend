import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  role?: string;
  fallback?: React.ReactNode;
  requireAll?: boolean; // true = requires ALL permissions/roles, false = requires ANY
  permissions?: string[];
  roles?: string[];
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  role,
  permissions = [],
  roles = [],
  fallback = null,
  requireAll = false
}) => {
  const { hasPermission, hasRole } = usePermissions();

  // Build arrays of permissions and roles to check
  const permissionsToCheck = [
    ...(permission ? [permission] : []),
    ...permissions
  ];

  const rolesToCheck = [
    ...(role ? [role] : []),
    ...roles
  ];

  // Check permissions
  let hasRequiredPermissions = true;
  if (permissionsToCheck.length > 0) {
    if (requireAll) {
      hasRequiredPermissions = permissionsToCheck.every(perm => hasPermission(perm));
    } else {
      hasRequiredPermissions = permissionsToCheck.some(perm => hasPermission(perm));
    }
  }

  // Check roles
  let hasRequiredRoles = true;
  if (rolesToCheck.length > 0) {
    if (requireAll) {
      hasRequiredRoles = rolesToCheck.every(r => hasRole(r));
    } else {
      hasRequiredRoles = rolesToCheck.some(r => hasRole(r));
    }
  }

  // If both permissions and roles are specified, both must pass
  const hasAccess = hasRequiredPermissions && hasRequiredRoles;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Convenience components for common use cases
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <PermissionGuard role="ADMIN" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const EmployeeOrAdmin: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <PermissionGuard roles={['ADMIN', 'EMPLOYEE']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const CustomerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <PermissionGuard role="CUSTOMER" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const VehicleManagers: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <PermissionGuard permission="VEHICLE_MANAGE" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const StatusChangers: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <PermissionGuard permission="VEHICLE_STATUS_CHANGE" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const MaintenanceManagers: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => (
  <PermissionGuard permission="MAINTENANCE_RECORD_MANAGE" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export default PermissionGuard;