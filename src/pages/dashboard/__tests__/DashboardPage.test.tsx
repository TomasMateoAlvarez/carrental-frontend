import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import DashboardPage from '../DashboardPage'

// Mock the API
const mockDashboardAPI = {
  getKPIs: vi.fn(),
}

vi.mock('../../../services/api', () => ({
  dashboardAPI: mockDashboardAPI,
}))

// Mock permissions hook
const mockPermissions = {
  hasPermission: vi.fn(() => true),
  hasRole: vi.fn(() => true),
}

vi.mock('../../../hooks/usePermissions', () => ({
  usePermissions: () => mockPermissions,
}))

// Mock auth store
const mockAuthStore = {
  user: {
    id: 1,
    username: 'admin',
    fullName: 'Admin User',
    roles: ['ADMIN'],
  },
  isAuthenticated: true,
}

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }
})

const mockKPIData = {
  totalVehicles: 25,
  availableVehicles: 18,
  rentedVehicles: 5,
  maintenanceVehicles: 2,
  totalReservations: 150,
  pendingReservations: 8,
  confirmedReservations: 12,
  completedReservations: 130,
  monthlyRevenue: 15000.50,
  dailyRevenue: 850.25,
  utilizationRate: 72.5,
  averageRentalDuration: 3.2,
  topVehicles: [
    { id: 1, licensePlate: 'ABC-123', brand: 'Toyota', model: 'Corolla', rentals: 25 },
    { id: 2, licensePlate: 'XYZ-789', brand: 'Honda', model: 'Civic', rentals: 22 },
  ],
  recentReservations: [
    {
      id: 1,
      reservationCode: 'RES001',
      userFullName: 'Juan Pérez',
      vehicleBrand: 'Toyota',
      vehicleModel: 'Corolla',
      startDate: '2023-11-01',
      endDate: '2023-11-03',
      status: 'CONFIRMED',
    },
  ],
}

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

const renderDashboardPage = () => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardPage />
    </QueryClientProvider>
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDashboardAPI.getKPIs.mockResolvedValue(mockKPIData)
  })

  it('renders dashboard title and welcome message', () => {
    renderDashboardPage()

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText(/bienvenido/i)).toBeInTheDocument()
    expect(screen.getByText('Admin User')).toBeInTheDocument()
  })

  it('shows basic dashboard structure', () => {
    renderDashboardPage()

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    // Check for quick action buttons
    expect(screen.getByText('Agregar Vehículo')).toBeInTheDocument()
    expect(screen.getByText('Nueva Reserva')).toBeInTheDocument()
    expect(screen.getByText('Ver Mantenimiento')).toBeInTheDocument()
  })

  it('handles loading state', () => {
    mockDashboardAPI.getKPIs.mockImplementation(() => new Promise(() => {})) // Never resolves

    renderDashboardPage()

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    // Component renders in loading state
  })

  it('handles API errors gracefully', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockDashboardAPI.getKPIs.mockRejectedValue(new Error('API Error'))

    renderDashboardPage()

    // Component should still render basic structure even with API errors
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText(/bienvenido/i)).toBeInTheDocument()

    consoleError.mockRestore()
  })
})