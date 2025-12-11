import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsAPI, vehiclesAPI, customerAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Row, Col, Card, Statistic } from 'antd';
import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// Professional Reservations Management Icons
const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const StopIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2V9a2 2 0 00-2-2V5a3 3 0 00-3-3V1a1 1 0 10-2 0v1a3 3 0 00-3 3v2a2 2 0 00-2 2v2h2v-2z" />
  </svg>
);

// Inline types to avoid import issues
interface ReservationResponse {
  id: number;
  reservationCode: string;
  vehicleId: number;
  customerId: number;
  startDate: string;
  endDate: string;
  pickupLocation?: string;
  returnLocation?: string;
  specialRequests?: string;
  status: ReservationStatus;
  totalAmount: number;
  dailyRate: number;
  totalDays: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleLicensePlate: string;
  createdAt: string;
  confirmedAt?: string;
}

interface CreateReservationRequest {
  vehicleId: number;
  customerId: number;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  returnLocation: string;
  specialRequests?: string;
}

type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

// Professional Status Badge Component
const StatusBadge = ({ status }: { status: ReservationStatus }) => {
  const getStatusConfig = (status: ReservationStatus) => {
    switch (status) {
      case 'PENDING':
        return { color: 'pending', text: 'Pendiente' };
      case 'CONFIRMED':
        return { color: 'confirmed', text: 'Confirmada' };
      case 'IN_PROGRESS':
        return { color: 'rented', text: 'En Progreso' };
      case 'COMPLETED':
        return { color: 'available', text: 'Completada' };
      case 'CANCELLED':
        return { color: 'maintenance', text: 'Cancelada' };
      case 'NO_SHOW':
        return { color: 'maintenance', text: 'No Show' };
      default:
        return { color: 'pending', text: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`badge ${config.color}`}>
      {config.text}
    </span>
  );
};

// Professional Stats Card Component
const StatsCard = ({
  title,
  value,
  icon,
  subtitle,
  colorClass
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle: string;
  colorClass: string;
}) => (
  <div className="stats-card">
    <div className="stats-card-header">
      <div className={`stats-icon ${colorClass}`}>
        {icon}
      </div>
      <div>
        <div className="stats-title">{title}</div>
      </div>
    </div>
    <div className="stats-value">{value}</div>
    <div className="stats-subtitle">{subtitle}</div>
  </div>
);

// Professional Action Button Component
const ActionButton = ({
  icon,
  onClick,
  type = 'default',
  disabled = false,
  text
}: {
  icon: React.ReactNode;
  onClick: () => void;
  type?: 'default' | 'primary' | 'success' | 'danger';
  disabled?: boolean;
  text?: string;
}) => (
  <button
    className={`action-btn ${type} ${disabled ? 'disabled' : ''}`}
    onClick={onClick}
    disabled={disabled}
    title={text}
  >
    {icon}
    {text && <span className="action-btn-text">{text}</span>}
  </button>
);

const ReservationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedReservation, setSelectedReservation] = useState<ReservationResponse | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedDates, setSelectedDates] = useState<[any, any] | null>(null);

  const { data: reservations = [], isLoading, error } = useQuery({
    queryKey: ['reservations'],
    queryFn: user?.roles.includes('ADMIN') || user?.roles.includes('EMPLOYEE')
      ? reservationsAPI.getAll
      : reservationsAPI.getMyReservations,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesAPI.getAll,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: customerAPI.getAll,
  });

  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');
  const activeCustomers = customers.filter(c => c.status === 'ACTIVE');

  const createMutation = useMutation({
    mutationFn: reservationsAPI.create,
    onSuccess: (data) => {
      alert(`Reserva creada exitosamente. Código: ${data.reservationCode}`);
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setIsModalVisible(false);
      resetForm();
    },
    onError: (error: any) => {
      alert(`Error al crear la reserva: ${error.response?.data?.message || error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      reservationsAPI.update(id, status),
    onSuccess: (data) => {
      alert(`Reserva ${data.reservationCode} actualizada`);
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error: any) => {
      alert(`Error al actualizar la reserva: ${error.response?.data?.message || error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: reservationsAPI.delete,
    onSuccess: () => {
      alert('Reserva eliminada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: () => {
      alert('Error al eliminar la reserva');
    },
  });

  const handleStatusUpdate = (reservationId: number, newStatus: string) => {
    const getActionText = (status: string) => {
      switch (status) {
        case 'CONFIRMED': return 'confirmar';
        case 'IN_PROGRESS': return 'iniciar';
        case 'COMPLETED': return 'completar';
        case 'CANCELLED': return 'cancelar';
        default: return 'actualizar';
      }
    };

    if (window.confirm(`¿Estás seguro de que quieres ${getActionText(newStatus)} esta reserva?`)) {
      updateMutation.mutate({ id: reservationId, status: newStatus });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      deleteMutation.mutate(id);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Código copiado al portapapeles');
    } catch (error) {
      alert('Error al copiar el código');
    }
  };

  const canManageReservations = user?.roles.includes('ADMIN') || user?.roles.includes('EMPLOYEE');

  const resetForm = () => {
    setSelectedVehicle(null);
    setSelectedDates(null);
  };

  // Filter reservations based on status and search text
  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = statusFilter === 'ALL' || reservation.status === statusFilter;
    const matchesSearch = searchText === '' ||
      reservation.reservationCode.toLowerCase().includes(searchText.toLowerCase()) ||
      reservation.userFullName.toLowerCase().includes(searchText.toLowerCase()) ||
      reservation.userEmail.toLowerCase().includes(searchText.toLowerCase()) ||
      `${reservation.vehicleBrand} ${reservation.vehicleModel}`.toLowerCase().includes(searchText.toLowerCase()) ||
      reservation.vehicleLicensePlate.toLowerCase().includes(searchText.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    inProgress: reservations.filter(r => r.status === 'IN_PROGRESS').length,
    completed: reservations.filter(r => r.status === 'COMPLETED').length,
  };

  if (error) {
    return (
      <div className="error-state">
        <h3>Error al cargar las reservas</h3>
        <p>Por favor, intenta recargar la página</p>
      </div>
    );
  }

  return (
    <div>
      {/* Professional Reservation Status Cards - Exact Maintenance Design */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card
            hoverable
            onClick={() => setStatusFilter('ALL')}
            style={{
              cursor: 'pointer',
              borderColor: statusFilter === 'ALL' ? '#1890ff' : '#d9d9d9',
              backgroundColor: statusFilter === 'ALL' ? '#f0f7ff' : '#ffffff'
            }}
          >
            <Statistic
              title="Total Reservas"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            hoverable
            onClick={() => setStatusFilter('CONFIRMED')}
            style={{
              cursor: 'pointer',
              borderColor: statusFilter === 'CONFIRMED' ? '#52c41a' : '#d9d9d9',
              backgroundColor: statusFilter === 'CONFIRMED' ? '#f6ffed' : '#ffffff'
            }}
          >
            <Statistic
              title="Confirmadas"
              value={stats.confirmed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            hoverable
            onClick={() => setStatusFilter('PENDING')}
            style={{
              cursor: 'pointer',
              borderColor: statusFilter === 'PENDING' ? '#faad14' : '#d9d9d9',
              backgroundColor: statusFilter === 'PENDING' ? '#fffbe6' : '#ffffff'
            }}
          >
            <Statistic
              title="Pendientes"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            hoverable
            onClick={() => setStatusFilter('IN_PROGRESS')}
            style={{
              cursor: 'pointer',
              borderColor: statusFilter === 'IN_PROGRESS' ? '#1890ff' : '#d9d9d9',
              backgroundColor: statusFilter === 'IN_PROGRESS' ? '#f0f7ff' : '#ffffff'
            }}
          >
            <Statistic
              title="En Progreso"
              value={stats.inProgress}
              valueStyle={{ color: '#1890ff' }}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Top Actions Bar */}
      <div className="top-actions-bar">
        <div className="search-and-filters">
          <div className="search-input-container">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar por código, cliente, vehículo..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-container">
            <FilterIcon />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Todos los estados</option>
              <option value="PENDING">Pendientes</option>
              <option value="CONFIRMED">Confirmadas</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="COMPLETED">Completadas</option>
              <option value="CANCELLED">Canceladas</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setIsModalVisible(true);
            }}
          >
            <PlusIcon />
            Nueva Reserva
          </button>
        </div>
      </div>

      {/* Results Summary */}
      {(searchText || statusFilter !== 'ALL') && (
        <div className="results-summary">
          Mostrando {filteredReservations.length} de {reservations.length} reservas
          {searchText && ` • Búsqueda: "${searchText}"`}
          {statusFilter !== 'ALL' && ` • Estado: ${statusFilter}`}
        </div>
      )}

      {/* Modern Horizontal Reservation Cards */}
      <div className="reservation-cards-grid">
        {isLoading ? (
          <div className="loading-state-full">
            <div className="loading-spinner"></div>
            <p>Cargando reservas...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="empty-state-full">
            <div className="empty-icon">
              <CalendarIcon />
            </div>
            <h3>No se encontraron reservas</h3>
            <p>No hay reservas que coincidan con los criterios de búsqueda</p>
          </div>
        ) : (
          <>
            {filteredReservations.map((reservation) => (
              <div key={reservation.id} className="reservation-card">
                {/* Reservation Header with Code and Status */}
                <div className="reservation-header">
                  <div className="reservation-code-section">
                    <span className="reservation-code-label">Reserva</span>
                    <div className="reservation-code-actions">
                      <span className="reservation-code-value">
                        {reservation.reservationCode}
                      </span>
                      <button
                        className="copy-btn-sm"
                        onClick={() => copyToClipboard(reservation.reservationCode)}
                        title="Copiar código"
                      >
                        <CopyIcon />
                      </button>
                    </div>
                  </div>
                  <div className="reservation-status-section">
                    <StatusBadge status={reservation.status} />
                  </div>
                  <div className="reservation-amount-section">
                    <span className="amount-value">${reservation.totalAmount.toFixed(2)}</span>
                    <span className="amount-label">total</span>
                  </div>
                </div>

                {/* Main Content Row */}
                <div className="reservation-content">
                  {/* Vehicle Info */}
                  <div className="content-section vehicle-section">
                    <div className="section-icon">
                      <CalendarIcon />
                    </div>
                    <div className="section-content">
                      <h4 className="section-title">Vehículo</h4>
                      <p className="vehicle-name">{reservation.vehicleBrand} {reservation.vehicleModel}</p>
                      <p className="vehicle-plate">{reservation.vehicleLicensePlate}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="content-section customer-section">
                    <div className="section-icon">
                      <EyeIcon />
                    </div>
                    <div className="section-content">
                      <h4 className="section-title">Cliente</h4>
                      <p className="customer-name">{reservation.userFullName}</p>
                      <p className="customer-email">{reservation.userEmail}</p>
                    </div>
                  </div>

                  {/* Date Info */}
                  <div className="content-section dates-section">
                    <div className="section-icon">
                      <CalendarIcon />
                    </div>
                    <div className="section-content">
                      <h4 className="section-title">Periodo</h4>
                      <p className="date-range">
                        {dayjs(reservation.startDate).format('DD/MM/YYYY')} - {dayjs(reservation.endDate).format('DD/MM/YYYY')}
                      </p>
                      <p className="date-duration">{reservation.totalDays} día{reservation.totalDays !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Pickup/Return Locations */}
                  {(reservation.pickupLocation || reservation.returnLocation) && (
                    <div className="content-section location-section">
                      <div className="section-icon">
                        <SearchIcon />
                      </div>
                      <div className="section-content">
                        <h4 className="section-title">Ubicaciones</h4>
                        {reservation.pickupLocation && (
                          <p className="location-info">Recogida: {reservation.pickupLocation}</p>
                        )}
                        {reservation.returnLocation && (
                          <p className="location-info">Devolución: {reservation.returnLocation}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="reservation-actions">
                  <ActionButton
                    icon={<EyeIcon />}
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setIsDetailModalVisible(true);
                    }}
                    type="default"
                    text="Ver Detalles"
                  />

                  {canManageReservations && reservation.status === 'PENDING' && (
                    <ActionButton
                      icon={<CheckIcon />}
                      onClick={() => handleStatusUpdate(reservation.id, 'CONFIRMED')}
                      type="success"
                      text="Confirmar"
                    />
                  )}

                  {canManageReservations && reservation.status === 'CONFIRMED' && (
                    <ActionButton
                      icon={<PlayIcon />}
                      onClick={() => handleStatusUpdate(reservation.id, 'IN_PROGRESS')}
                      type="primary"
                      text="Iniciar"
                    />
                  )}

                  {canManageReservations && reservation.status === 'IN_PROGRESS' && (
                    <ActionButton
                      icon={<StopIcon />}
                      onClick={() => handleStatusUpdate(reservation.id, 'COMPLETED')}
                      type="primary"
                      text="Completar"
                    />
                  )}

                  {(canManageReservations || reservation.userId === user?.userId) &&
                   ['PENDING', 'CONFIRMED'].includes(reservation.status) && (
                    <ActionButton
                      icon={<TrashIcon />}
                      onClick={() => handleDelete(reservation.id)}
                      type="danger"
                      text="Cancelar"
                    />
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Create Reservation Modal */}
      {isModalVisible && (
        <div className="modal-overlay" onClick={() => setIsModalVisible(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Reserva</h3>
              <button
                className="modal-close"
                onClick={() => setIsModalVisible(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const data: any = Object.fromEntries(formData);

                  // Validate required fields
                  if (!data.vehicleId || !data.customerId || !data.startDate || !data.endDate || !data.pickupLocation || !data.returnLocation) {
                    alert('Por favor completa todos los campos requeridos');
                    return;
                  }

                  const reservationData: CreateReservationRequest = {
                    vehicleId: parseInt(data.vehicleId),
                    customerId: parseInt(data.customerId),
                    startDate: data.startDate,
                    endDate: data.endDate,
                    pickupLocation: data.pickupLocation,
                    returnLocation: data.returnLocation,
                    specialRequests: data.specialRequests || '',
                  };

                  createMutation.mutate(reservationData);
                }}
                className="reservation-form"
              >
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="vehicleId">Vehículo *</label>
                    <select name="vehicleId" id="vehicleId" required>
                      <option value="">Seleccionar vehículo</option>
                      {availableVehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.brand} {vehicle.model} - {vehicle.licensePlate} (${vehicle.dailyRate}/día)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="customerId">Cliente *</label>
                    <select name="customerId" id="customerId" required>
                      <option value="">Seleccionar cliente</option>
                      {activeCustomers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.fullName} - {customer.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="startDate">Fecha de inicio *</label>
                    <input
                      type="date"
                      name="startDate"
                      id="startDate"
                      min={dayjs().format('YYYY-MM-DD')}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="endDate">Fecha de fin *</label>
                    <input
                      type="date"
                      name="endDate"
                      id="endDate"
                      min={dayjs().format('YYYY-MM-DD')}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pickupLocation">Lugar de recogida *</label>
                    <input
                      type="text"
                      name="pickupLocation"
                      id="pickupLocation"
                      placeholder="Dirección de recogida"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="returnLocation">Lugar de devolución *</label>
                    <input
                      type="text"
                      name="returnLocation"
                      id="returnLocation"
                      placeholder="Dirección de devolución"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="specialRequests">Solicitudes especiales</label>
                    <textarea
                      name="specialRequests"
                      id="specialRequests"
                      rows={3}
                      placeholder="Cualquier solicitud especial o comentario"
                    ></textarea>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Creando...' : 'Crear Reserva'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsModalVisible(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Details Modal */}
      {isDetailModalVisible && selectedReservation && (
        <div className="modal-overlay" onClick={() => setIsDetailModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles de la Reserva</h3>
              <button
                className="modal-close"
                onClick={() => setIsDetailModalVisible(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="reservation-details">
                <div className="detail-section">
                  <h4>Información General</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Código de Reserva:</label>
                      <span className="reservation-code-detail">{selectedReservation.reservationCode}</span>
                    </div>
                    <div className="detail-item">
                      <label>Estado:</label>
                      <StatusBadge status={selectedReservation.status} />
                    </div>
                    <div className="detail-item">
                      <label>Fecha de creación:</label>
                      <span>{dayjs(selectedReservation.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                    </div>
                    {selectedReservation.confirmedAt && (
                      <div className="detail-item">
                        <label>Fecha de confirmación:</label>
                        <span>{dayjs(selectedReservation.confirmedAt).format('DD/MM/YYYY HH:mm')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Cliente</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Nombre:</label>
                      <span>{selectedReservation.userFullName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedReservation.userEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Vehículo</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Vehículo:</label>
                      <span>{selectedReservation.vehicleBrand} {selectedReservation.vehicleModel}</span>
                    </div>
                    <div className="detail-item">
                      <label>Matrícula:</label>
                      <span>{selectedReservation.vehicleLicensePlate}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Fechas y Ubicación</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Fecha de inicio:</label>
                      <span>{dayjs(selectedReservation.startDate).format('DD/MM/YYYY')}</span>
                    </div>
                    <div className="detail-item">
                      <label>Fecha de fin:</label>
                      <span>{dayjs(selectedReservation.endDate).format('DD/MM/YYYY')}</span>
                    </div>
                    <div className="detail-item">
                      <label>Total de días:</label>
                      <span>{selectedReservation.totalDays} día{selectedReservation.totalDays !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="detail-item">
                      <label>Lugar de recogida:</label>
                      <span>{selectedReservation.pickupLocation || 'No especificado'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Lugar de devolución:</label>
                      <span>{selectedReservation.returnLocation || 'No especificado'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Información Financiera</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Tarifa diaria:</label>
                      <span>${selectedReservation.dailyRate.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Monto total:</label>
                      <span className="total-amount">${selectedReservation.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {selectedReservation.specialRequests && (
                  <div className="detail-section">
                    <h4>Solicitudes Especiales</h4>
                    <p className="special-requests">{selectedReservation.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setIsDetailModalVisible(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;