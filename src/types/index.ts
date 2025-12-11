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

// Vehicle Photos Types
export interface VehiclePhoto {
  id: number;
  vehicleId: number;
  photoUrl: string;
  photoType: string;
  description?: string;
  inspectionType?: string;
  isPrimary: boolean;
  takenAt: string;
  takenByUserId?: number;
  createdAt: string;
}

export enum PhotoType {
  GENERAL = 'GENERAL',
  EXTERIOR = 'EXTERIOR',
  INTERIOR = 'INTERIOR',
  ENGINE = 'ENGINE',
  DAMAGE = 'DAMAGE'
}

export enum InspectionType {
  PICKUP = 'PICKUP',
  RETURN = 'RETURN',
  MAINTENANCE = 'MAINTENANCE',
  GENERAL = 'GENERAL'
}

// Maintenance Types
export interface MaintenanceRecord {
  id: number;
  vehicleId: number;
  maintenanceType: string;
  description: string;
  serviceProvider?: string;
  reason?: string;
  cost?: number;
  mileageAtService: number;
  nextServiceMileage?: number;
  status: MaintenanceStatus;
  serviceDate: string;
  completionDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId?: number;
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE'
}

export enum MaintenanceType {
  ROUTINE = 'ROUTINE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
  CLEANING = 'CLEANING',
  OIL_CHANGE = 'OIL_CHANGE',
  TIRE_CHANGE = 'TIRE_CHANGE',
  BRAKE_SERVICE = 'BRAKE_SERVICE',
  ENGINE_SERVICE = 'ENGINE_SERVICE'
}

// Notifications Types
export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  actionUrl?: string;
  expiresAt?: string;
  createdAt: string;
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum NotificationType {
  MAINTENANCE_DUE = 'MAINTENANCE_DUE',
  MAINTENANCE_COMPLETED = 'MAINTENANCE_COMPLETED',
  RESERVATION_CONFIRMED = 'RESERVATION_CONFIRMED',
  RESERVATION_CANCELLED = 'RESERVATION_CANCELLED',
  VEHICLE_RETURNED = 'VEHICLE_RETURNED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  INFO = 'INFO'
}

// Reservation Types
export interface CreateReservationRequest {
  vehicleId: number;
  customerId: number;
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
  customerId?: number;
  customerCode?: string;
  customerFullName?: string;
  customerEmail?: string;
  customerPhone?: string;
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

// Customer Types
export interface Customer {
  id: number;
  customerCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  status: CustomerStatus;
  segment: CustomerSegment;
  preferredLanguage?: string;
  // License information
  licenseNumber: string;
  licenseIssuedDate?: string;
  licenseExpiryDate?: string;
  licenseIssuingCountry?: string;
  licenseClass?: string;
  // Address information
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  // Emergency contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  // Business analytics
  totalReservations: number;
  totalSpent: number;
  averageRentalDays: number;
  lastRentalDate?: string;
  customerLifetimeValue: number;
  // Audit information
  createdAt: string;
  updatedAt: string;
  lastActivityDate?: string;
  notes?: string;
  preferredPickupLocation?: string;
}

export interface CustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  preferredLanguage?: string;
  licenseNumber: string;
  licenseIssuedDate?: string;
  licenseExpiryDate?: string;
  licenseIssuingCountry?: string;
  licenseClass?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  notes?: string;
  preferredPickupLocation?: string;
}

export interface CustomerResponse {
  id: number;
  customerCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  status: CustomerStatus;
  segment: CustomerSegment;
  preferredLanguage?: string;
  licenseNumber: string;
  licenseIssuedDate?: string;
  licenseExpiryDate?: string;
  licenseIssuingCountry?: string;
  licenseClass?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  totalReservations: number;
  totalSpent: number;
  averageRentalDays: number;
  lastRentalDate?: string;
  customerLifetimeValue: number;
  createdAt: string;
  updatedAt: string;
  lastActivityDate?: string;
  notes?: string;
  preferredPickupLocation?: string;
  isLicenseExpiringSoon?: boolean;
  daysSinceLastActivity?: number;
  engagementScore?: number;
}

export interface CustomerHistory {
  customerId: number;
  customerCode: string;
  customerName: string;
  totalReservations: number;
  totalSpent: number;
  averageRentalDays: number;
  lastRentalDate?: string;
  customerLifetimeValue: number;
  segment: CustomerSegment;
  reservationHistory: ReservationSummary[];
  reservationsThisYear: number;
  reservationsThisMonth: number;
  spentThisYear: number;
  spentThisMonth: number;
  favoriteVehicleCategory?: string;
  mostUsedPickupLocation?: string;
  averageReservationValue: number;
  daysSinceLastRental: number;
}

export interface ReservationSummary {
  id: number;
  reservationCode: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
  status: ReservationStatus;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleLicensePlate: string;
  pickupLocation?: string;
  returnLocation?: string;
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

export enum CustomerSegment {
  NEW = 'NEW',
  REGULAR = 'REGULAR',
  PREMIUM = 'PREMIUM',
  VIP = 'VIP',
  CORPORATE = 'CORPORATE'
}