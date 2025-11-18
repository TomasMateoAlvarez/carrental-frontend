import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import PermissionGuard, {
  AdminOnly,
  EmployeeOrAdmin,
  CustomerOnly,
  VehicleManagers,
  StatusChangers,
  MaintenanceManagers
} from '../PermissionGuard'

// Mock usePermissions hook
const mockHasPermission = vi.fn()
const mockHasRole = vi.fn()

vi.mock('../../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: mockHasPermission,
    hasRole: mockHasRole,
  }),
}))

describe('PermissionGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic functionality', () => {
    it('renders children when no restrictions are applied', () => {
      render(
        <PermissionGuard>
          <div>Test content</div>
        </PermissionGuard>
      )

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('renders children when user has required permission', () => {
      mockHasPermission.mockReturnValue(true)

      render(
        <PermissionGuard permission="TEST_PERMISSION">
          <div>Protected content</div>
        </PermissionGuard>
      )

      expect(screen.getByText('Protected content')).toBeInTheDocument()
      expect(mockHasPermission).toHaveBeenCalledWith('TEST_PERMISSION')
    })

    it('does not render children when user lacks permission', () => {
      mockHasPermission.mockReturnValue(false)

      render(
        <PermissionGuard permission="TEST_PERMISSION">
          <div>Protected content</div>
        </PermissionGuard>
      )

      expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    })

    it('renders fallback when user lacks permission', () => {
      mockHasPermission.mockReturnValue(false)

      render(
        <PermissionGuard
          permission="TEST_PERMISSION"
          fallback={<div>Access denied</div>}
        >
          <div>Protected content</div>
        </PermissionGuard>
      )

      expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
      expect(screen.getByText('Access denied')).toBeInTheDocument()
    })
  })

  describe('Role-based access', () => {
    it('renders children when user has required role', () => {
      mockHasRole.mockReturnValue(true)

      render(
        <PermissionGuard role="ADMIN">
          <div>Admin content</div>
        </PermissionGuard>
      )

      expect(screen.getByText('Admin content')).toBeInTheDocument()
      expect(mockHasRole).toHaveBeenCalledWith('ADMIN')
    })

    it('does not render children when user lacks role', () => {
      mockHasRole.mockReturnValue(false)

      render(
        <PermissionGuard role="ADMIN">
          <div>Admin content</div>
        </PermissionGuard>
      )

      expect(screen.queryByText('Admin content')).not.toBeInTheDocument()
    })
  })

  describe('Multiple permissions/roles', () => {
    it('renders when user has ANY of the specified permissions (requireAll=false)', () => {
      mockHasPermission
        .mockReturnValueOnce(false) // First permission
        .mockReturnValueOnce(true)  // Second permission

      render(
        <PermissionGuard
          permissions={['PERM1', 'PERM2']}
          requireAll={false}
        >
          <div>Content</div>
        </PermissionGuard>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('does not render when user lacks ALL permissions (requireAll=true)', () => {
      mockHasPermission
        .mockReturnValueOnce(true)  // First permission
        .mockReturnValueOnce(false) // Second permission

      render(
        <PermissionGuard
          permissions={['PERM1', 'PERM2']}
          requireAll={true}
        >
          <div>Content</div>
        </PermissionGuard>
      )

      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })

    it('renders when user has ALL permissions (requireAll=true)', () => {
      mockHasPermission.mockReturnValue(true)

      render(
        <PermissionGuard
          permissions={['PERM1', 'PERM2']}
          requireAll={true}
        >
          <div>Content</div>
        </PermissionGuard>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('renders when user has ANY of the specified roles', () => {
      mockHasRole
        .mockReturnValueOnce(false) // ADMIN
        .mockReturnValueOnce(true)  // EMPLOYEE

      render(
        <PermissionGuard roles={['ADMIN', 'EMPLOYEE']}>
          <div>Content</div>
        </PermissionGuard>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Combined permissions and roles', () => {
    it('requires both permission and role to be satisfied', () => {
      mockHasPermission.mockReturnValue(true)
      mockHasRole.mockReturnValue(false)

      render(
        <PermissionGuard permission="TEST_PERM" role="ADMIN">
          <div>Content</div>
        </PermissionGuard>
      )

      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })

    it('renders when both permission and role are satisfied', () => {
      mockHasPermission.mockReturnValue(true)
      mockHasRole.mockReturnValue(true)

      render(
        <PermissionGuard permission="TEST_PERM" role="ADMIN">
          <div>Content</div>
        </PermissionGuard>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Convenience components', () => {
    it('AdminOnly renders for admin users', () => {
      mockHasRole.mockReturnValue(true)

      render(
        <AdminOnly>
          <div>Admin only content</div>
        </AdminOnly>
      )

      expect(screen.getByText('Admin only content')).toBeInTheDocument()
      expect(mockHasRole).toHaveBeenCalledWith('ADMIN')
    })

    it('EmployeeOrAdmin renders for admin or employee users', () => {
      mockHasRole
        .mockReturnValueOnce(false) // ADMIN
        .mockReturnValueOnce(true)  // EMPLOYEE

      render(
        <EmployeeOrAdmin>
          <div>Staff content</div>
        </EmployeeOrAdmin>
      )

      expect(screen.getByText('Staff content')).toBeInTheDocument()
    })

    it('CustomerOnly renders for customer users', () => {
      mockHasRole.mockReturnValue(true)

      render(
        <CustomerOnly>
          <div>Customer content</div>
        </CustomerOnly>
      )

      expect(screen.getByText('Customer content')).toBeInTheDocument()
      expect(mockHasRole).toHaveBeenCalledWith('CUSTOMER')
    })

    it('VehicleManagers renders for users with vehicle management permission', () => {
      mockHasPermission.mockReturnValue(true)

      render(
        <VehicleManagers>
          <div>Vehicle management</div>
        </VehicleManagers>
      )

      expect(screen.getByText('Vehicle management')).toBeInTheDocument()
      expect(mockHasPermission).toHaveBeenCalledWith('VEHICLE_MANAGE')
    })

    it('StatusChangers renders for users with status change permission', () => {
      mockHasPermission.mockReturnValue(true)

      render(
        <StatusChangers>
          <div>Status controls</div>
        </StatusChangers>
      )

      expect(screen.getByText('Status controls')).toBeInTheDocument()
      expect(mockHasPermission).toHaveBeenCalledWith('VEHICLE_STATUS_CHANGE')
    })

    it('MaintenanceManagers renders for users with maintenance permission', () => {
      mockHasPermission.mockReturnValue(true)

      render(
        <MaintenanceManagers>
          <div>Maintenance management</div>
        </MaintenanceManagers>
      )

      expect(screen.getByText('Maintenance management')).toBeInTheDocument()
      expect(mockHasPermission).toHaveBeenCalledWith('MAINTENANCE_RECORD_MANAGE')
    })
  })

  describe('Fallback rendering', () => {
    it('renders fallback for convenience components', () => {
      mockHasRole.mockReturnValue(false)

      render(
        <AdminOnly fallback={<div>Not an admin</div>}>
          <div>Admin content</div>
        </AdminOnly>
      )

      expect(screen.queryByText('Admin content')).not.toBeInTheDocument()
      expect(screen.getByText('Not an admin')).toBeInTheDocument()
    })

    it('renders null fallback by default', () => {
      mockHasRole.mockReturnValue(false)

      const { container } = render(
        <AdminOnly>
          <div>Admin content</div>
        </AdminOnly>
      )

      expect(screen.queryByText('Admin content')).not.toBeInTheDocument()
      expect(container.firstChild).toBeNull()
    })
  })
})