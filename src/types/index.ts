// API Types matching backend DTOs
export interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  mileage: number;
  status: string;
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

// Simple string constants instead of enum
export const VEHICLE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  RENTED: 'RENTED',
  MAINTENANCE: 'MAINTENANCE',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE'
} as const;

export interface Client {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaNacimiento?: string;
  numeroLicencia?: string;
  direccion?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export interface ClientRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaNacimiento?: string;
  numeroLicencia?: string;
  direccion?: string;
  activo?: boolean;
}

export interface AuthUser {
  username: string;
  isAuthenticated: boolean;
}