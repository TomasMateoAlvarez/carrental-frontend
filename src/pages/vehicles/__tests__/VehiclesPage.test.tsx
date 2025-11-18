import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import VehiclesPage from '../VehiclesPage'

// Mock the API
const mockVehiclesAPI = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  updateStatus: vi.fn(),
}

vi.mock('../../../services/api', () => ({
  vehiclesAPI: mockVehiclesAPI,
}))

// Mock permissions hook
const mockPermissions = {
  canView: vi.fn(() => true),
  canCreate: vi.fn(() => true),
  canUpdate: vi.fn(() => true),
  canDelete: vi.fn(() => true),
}

vi.mock('../../../hooks/usePermissions', () => ({
  usePermissions: () => mockPermissions,
}))

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd')
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }
})

const mockVehicles = [
  {
    id: 1,
    licensePlate: 'ABC-123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2023,
    color: 'Blanco',
    mileage: 15000,
    status: 'AVAILABLE',
    statusDescription: 'Disponible',
    dailyRate: 45.00,
    category: 'COMPACT',
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    description: 'Toyota Corolla en excelente estado',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 2,
    licensePlate: 'XYZ-789',
    brand: 'Honda',
    model: 'Civic',
    year: 2022,
    color: 'Negro',
    mileage: 20000,
    status: 'MAINTENANCE',
    statusDescription: 'En mantenimiento',
    dailyRate: 40.00,
    category: 'COMPACT',
    seats: 5,
    transmission: 'MANUAL',
    fuelType: 'GASOLINE',
    description: 'Honda Civic económico',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
]

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

const renderVehiclesPage = () => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('VehiclesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockVehiclesAPI.getAll.mockResolvedValue(mockVehicles)
  })

  it('renders vehicle page with title and actions', async () => {
    renderVehiclesPage()

    expect(screen.getByText('Gestión de Vehículos')).toBeInTheDocument()
    expect(screen.getByText('Agregar Vehículo')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/buscar por matrícula/i)).toBeInTheDocument()
  })

  it('displays vehicles in table', async () => {
    renderVehiclesPage()

    await waitFor(() => {
      expect(screen.getByText('ABC-123')).toBeInTheDocument()
      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument()
      expect(screen.getByText('XYZ-789')).toBeInTheDocument()
      expect(screen.getByText('Honda Civic')).toBeInTheDocument()
    })
  })

  it('displays vehicle status tags correctly', async () => {
    renderVehiclesPage()

    await waitFor(() => {
      expect(screen.getByText('Disponible')).toBeInTheDocument()
      expect(screen.getByText('En mantenimiento')).toBeInTheDocument()
    })
  })

  it('shows statistics cards', async () => {
    renderVehiclesPage()

    await waitFor(() => {
      expect(screen.getByText('Total Vehículos')).toBeInTheDocument()
      expect(screen.getByText('Disponibles')).toBeInTheDocument()
      expect(screen.getByText('En Mantenimiento')).toBeInTheDocument()
    })
  })

  it('filters vehicles by search term', async () => {
    const user = userEvent.setup()
    renderVehiclesPage()

    await waitFor(() => {
      expect(screen.getByText('ABC-123')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/buscar por matrícula/i)
    await user.type(searchInput, 'ABC')

    // The search should filter the displayed vehicles
    expect(screen.getByText('ABC-123')).toBeInTheDocument()
  })

  it('filters vehicles by status', async () => {
    const user = userEvent.setup()
    renderVehiclesPage()

    await waitFor(() => {
      expect(screen.getByText('ABC-123')).toBeInTheDocument()
    })

    const statusFilter = screen.getByDisplayValue('Todos los estados')
    await user.click(statusFilter)

    const availableOption = screen.getByText('Disponible')
    await user.click(availableOption)

    // The filter should be applied
    expect(statusFilter).toHaveDisplayValue('Disponible')
  })

  it('shows add vehicle button when user has create permission', () => {
    mockPermissions.canCreate.mockReturnValue(true)
    renderVehiclesPage()

    expect(screen.getByText('Agregar Vehículo')).toBeInTheDocument()
  })

  it('hides add vehicle button when user lacks create permission', () => {
    mockPermissions.canCreate.mockReturnValue(false)
    renderVehiclesPage()

    expect(screen.queryByText('Agregar Vehículo')).not.toBeInTheDocument()
  })

  it('shows action buttons for vehicles when user has permissions', async () => {
    mockPermissions.canUpdate.mockReturnValue(true)
    mockPermissions.canDelete.mockReturnValue(true)
    renderVehiclesPage()

    await waitFor(() => {
      expect(screen.getAllByTitle(/editar/i)).toHaveLength(2)
      expect(screen.getAllByTitle(/eliminar/i)).toHaveLength(2)
    })
  })

  it('calculates statistics correctly', async () => {
    renderVehiclesPage()

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument() // Total vehicles
    })
  })

  it('handles API errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockVehiclesAPI.getAll.mockRejectedValue(new Error('API Error'))

    renderVehiclesPage()

    await waitFor(() => {
      // The component should handle the error without crashing
      expect(screen.getByText('Gestión de Vehículos')).toBeInTheDocument()
    })

    consoleError.mockRestore()
  })

  it('formats currency correctly', async () => {
    renderVehiclesPage()

    await waitFor(() => {
      expect(screen.getByText('€45.00')).toBeInTheDocument()
      expect(screen.getByText('€40.00')).toBeInTheDocument()
    })
  })

  it('displays vehicle transmission and fuel type', async () => {
    renderVehiclesPage()

    await waitFor(() => {
      expect(screen.getByText('Automático')).toBeInTheDocument()
      expect(screen.getByText('Manual')).toBeInTheDocument()
      expect(screen.getAllByText('Gasolina')).toHaveLength(2)
    })
  })
})