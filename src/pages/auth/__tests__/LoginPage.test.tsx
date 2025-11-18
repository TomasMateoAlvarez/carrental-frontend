import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import LoginPage from '../LoginPage'
import * as authStore from '../../../stores/authStore'

// Mock the auth store
const mockLogin = vi.fn()
const mockAuthStore = {
  login: mockLogin,
  isLoading: false,
  user: null,
  token: null,
  isAuthenticated: false,
  logout: vi.fn(),
  initializeAuth: vi.fn(),
}

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

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

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  )
}

// Mock react-router with simple div wrapper
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthStore.isLoading = false
  })

  it('renders login form with all required fields', () => {
    renderLoginPage()

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    await user.click(submitButton)

    expect(await screen.findByText(/por favor ingresa tu usuario/i)).toBeInTheDocument()
    expect(await screen.findByText(/por favor ingresa tu contraseña/i)).toBeInTheDocument()
  })

  it('calls login function with correct credentials', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(true)

    renderLoginPage()

    const usernameInput = screen.getByLabelText(/usuario/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    await user.type(usernameInput, 'admin')
    await user.type(passwordInput, 'admin123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'admin',
        password: 'admin123',
      })
    })
  })

  it('navigates to dashboard on successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(true)

    renderLoginPage()

    const usernameInput = screen.getByLabelText(/usuario/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    await user.type(usernameInput, 'admin')
    await user.type(passwordInput, 'admin123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error message on failed login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(false)

    renderLoginPage()

    const usernameInput = screen.getByLabelText(/usuario/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    await user.type(usernameInput, 'wrong')
    await user.type(passwordInput, 'credentials')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })

    // Verify that navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows loading state when login is in progress', () => {
    mockAuthStore.isLoading = true

    renderLoginPage()

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    expect(submitButton).toBeDisabled()
  })

  it('has register link', () => {
    renderLoginPage()

    const registerLink = screen.getByText(/regístrate aquí/i)
    expect(registerLink).toBeInTheDocument()
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register')
  })

  it('displays CarRental branding', () => {
    renderLoginPage()

    expect(screen.getByText('CarRental')).toBeInTheDocument()
    expect(screen.getByText(/sistema de gestión de alquiler de vehículos/i)).toBeInTheDocument()
  })
})