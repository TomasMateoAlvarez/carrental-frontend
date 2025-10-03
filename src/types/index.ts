// API Types matching backend DTOs
// Updated to fix Vehicle export issue

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}

export interface AuthUser {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
}

// Vehicle Status Enum (defined first)
export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  RENTED = 'RENTED',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  MAINTENANCE = 'MAINTENANCE',
  WASHING = 'WASHING',
  IN_REPAIR = 'IN_REPAIR'
}

// Vehicle Types
export interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  mileage: number;
  status: VehicleStatus;
  dailyRate: number;
  category?: string;
  seats: number;
  transmission?: string;
  fuelType?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

// Vehicle Status Constants (for compatibility)
export const VEHICLE_STATUS = {
  AVAILABLE: 'AVAILABLE' as const,
  RESERVED: 'RESERVED' as const,
  RENTED: 'RENTED' as const,
  OUT_OF_SERVICE: 'OUT_OF_SERVICE' as const,
  MAINTENANCE: 'MAINTENANCE' as const,
  WASHING: 'WASHING' as const,
  IN_REPAIR: 'IN_REPAIR' as const,
} as const;

export interface VehicleRequest {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  mileage: number;
  dailyRate: number;
  category?: string;
  seats: number;
  transmission?: string;
  fuelType?: string;
  description?: string;
}

// Reservation Types
export interface CreateReservationRequest {
  vehicleId: number;
  startDate: string;
  endDate: string;
  pickupLocation?: string;
  returnLocation?: string;
  specialRequests?: string;
}

export interface ReservationResponse {
  id: number;
  reservationCode: string;
  startDate: string;
  endDate: string;
  pickupLocation?: string;
  returnLocation?: string;
  status: ReservationStatus;
  dailyRate: number;
  totalDays: number;
  totalAmount: number;
  specialRequests?: string;
  createdAt: string;
  confirmedAt?: string;
  vehicleId: number;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleLicensePlate: string;
  vehicleCategory?: string;
  userId: number;
  userFullName: string;
  userEmail: string;
  rentalId?: number;
  rentalCode?: string;
  pickupDateTime?: string;
  expectedReturnDateTime?: string;
  actualReturnDateTime?: string;
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

// User Types (for admin management)
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  isLocked: boolean;
  failedLoginAttempts: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  roles: string[];
}