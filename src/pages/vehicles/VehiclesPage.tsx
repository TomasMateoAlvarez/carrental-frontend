import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesAPI } from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';
import VehicleForm from './VehicleForm';
import VehicleDetail from './VehicleDetail';
import { Row, Col, Card, Statistic, Table, Tag, Button, Space, Tooltip } from 'antd';
import { CarOutlined, CheckCircleOutlined, ToolOutlined, ExclamationCircleOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

// Professional SaaS Icons
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const CarsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8-2a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const ToolIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const SpeedIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
  </svg>
);

// Inline type definitions
interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  status: VehicleStatus;
  statusDescription: string;
  dailyRate: number;
  category: string;
  seats: number;
  transmission: string;
  fuelType: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  needsMaintenance: boolean;
  availableForRental: boolean;
}

enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  RESERVED = 'RESERVED',
  CLEANING = 'CLEANING',
  IN_REPAIR = 'IN_REPAIR',
  WASHING = 'WASHING',
  RETURNED = 'RETURNED'
}

const VEHICLE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  MAINTENANCE: 'MAINTENANCE',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
  RESERVED: 'RESERVED',
  CLEANING: 'CLEANING',
  IN_REPAIR: 'IN_REPAIR',
  WASHING: 'WASHING',
  RETURNED: 'RETURNED'
} as const;

// Professional Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case VEHICLE_STATUS.AVAILABLE:
        return { color: 'available', text: 'Disponible' };
      case VEHICLE_STATUS.RENTED:
        return { color: 'danger', text: 'Alquilado' };
      case VEHICLE_STATUS.MAINTENANCE:
        return { color: 'warning', text: 'Mantenimiento' };
      case VEHICLE_STATUS.OUT_OF_SERVICE:
        return { color: 'danger', text: 'Fuera de Servicio' };
      case VEHICLE_STATUS.RESERVED:
        return { color: 'pending', text: 'Reservado' };
      case VEHICLE_STATUS.CLEANING:
        return { color: 'info', text: 'Limpieza' };
      case VEHICLE_STATUS.IN_REPAIR:
        return { color: 'danger', text: 'En Reparación' };
      case VEHICLE_STATUS.WASHING:
        return { color: 'info', text: 'Lavado' };
      case VEHICLE_STATUS.RETURNED:
        return { color: 'success', text: 'Devuelto' };
      default:
        return { color: 'default', text: status };
    }
  };

  const config = getStatusConfig(status);
  return <span className={`badge ${config.color}`}>{config.text}</span>;
};

const VehiclesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const queryClient = useQueryClient();
  const {
    canCreateVehicle,
    canFullyEditVehicle,
    canDeleteVehicle,
    canChangeVehicleStatus,
    isEmployeeRestricted
  } = usePermissions();

  // Fetch vehicles
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesAPI.getAll,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: vehiclesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: () => {
      // Show error notification here
    },
  });

  // Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = searchQuery === '' ||
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === '' || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormModalOpen(true);
  };

  const handleView = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingVehicle(null);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingVehicle(null);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedVehicle(null);
  };

  // Calculate statistics
  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === VEHICLE_STATUS.AVAILABLE).length,
    rented: vehicles.filter(v => v.status === VEHICLE_STATUS.RENTED).length,
    maintenance: vehicles.filter(v => v.status === VEHICLE_STATUS.MAINTENANCE || v.status === VEHICLE_STATUS.IN_REPAIR).length,
  };

  // Table columns for horizontal view
  const columns = [
    {
      title: 'Vehicle',
      key: 'vehicle',
      render: (_, vehicle: Vehicle) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CarOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>
              {vehicle.brand} {vehicle.model}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {vehicle.licensePlate}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const getTagColor = (status: string) => {
          switch (status) {
            case 'AVAILABLE': return 'green';
            case 'RENTED': return 'orange';
            case 'MAINTENANCE': case 'IN_REPAIR': return 'red';
            case 'RESERVED': return 'blue';
            case 'CLEANING': case 'WASHING': return 'cyan';
            default: return 'default';
          }
        };
        const getStatusText = (status: string) => {
          switch (status) {
            case 'AVAILABLE': return 'Disponible';
            case 'RENTED': return 'Alquilado';
            case 'MAINTENANCE': return 'Mantenimiento';
            case 'IN_REPAIR': return 'En Reparación';
            case 'RESERVED': return 'Reservado';
            case 'CLEANING': return 'Limpieza';
            case 'WASHING': return 'Lavado';
            default: return status;
          }
        };
        return <Tag color={getTagColor(status)}>{getStatusText(status)}</Tag>;
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, vehicle: Vehicle) => (
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {vehicle.year} • {vehicle.color} • {vehicle.seats} seats
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {vehicle.transmission} • {vehicle.fuelType}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {vehicle.mileage.toLocaleString()} km
          </div>
        </div>
      ),
    },
    {
      title: 'Daily Rate',
      dataIndex: 'dailyRate',
      key: 'dailyRate',
      render: (rate: number) => (
        <div style={{ fontWeight: 600, color: '#1890ff' }}>
          ${rate.toFixed(2)}/day
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, vehicle: Vehicle) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(vehicle)}
              size="small"
            />
          </Tooltip>
          {canFullyEditVehicle() && (
            <Tooltip title="Edit Vehicle">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(vehicle)}
                size="small"
              />
            </Tooltip>
          )}
          {canDeleteVehicle() && (
            <Tooltip title="Delete Vehicle">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(vehicle.id)}
                size="small"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando vehículos...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Professional Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Management</h1>
          <p className="page-subtitle">Manage your vehicle fleet efficiently</p>
        </div>
        {canCreateVehicle() && (
          <button onClick={handleAddNew} className="btn btn-primary">
            <PlusIcon />
            New Vehicle
          </button>
        )}
      </div>

      {/* Professional Vehicle Status Cards - Exact Maintenance Design */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card
            hoverable
            onClick={() => setStatusFilter('')}
            style={{
              cursor: 'pointer',
              borderColor: statusFilter === '' ? '#1890ff' : '#d9d9d9',
              backgroundColor: statusFilter === '' ? '#f0f7ff' : '#ffffff'
            }}
          >
            <Statistic
              title="Total Fleet"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            hoverable
            onClick={() => setStatusFilter('AVAILABLE')}
            style={{
              cursor: 'pointer',
              borderColor: statusFilter === 'AVAILABLE' ? '#52c41a' : '#d9d9d9',
              backgroundColor: statusFilter === 'AVAILABLE' ? '#f6ffed' : '#ffffff'
            }}
          >
            <Statistic
              title="Available"
              value={stats.available}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            hoverable
            onClick={() => setStatusFilter('RENTED')}
            style={{
              cursor: 'pointer',
              borderColor: statusFilter === 'RENTED' ? '#faad14' : '#d9d9d9',
              backgroundColor: statusFilter === 'RENTED' ? '#fffbe6' : '#ffffff'
            }}
          >
            <Statistic
              title="Rented"
              value={stats.rented}
              valueStyle={{ color: '#faad14' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            hoverable
            onClick={() => setStatusFilter('MAINTENANCE')}
            style={{
              cursor: 'pointer',
              borderColor: statusFilter === 'MAINTENANCE' || statusFilter === 'IN_REPAIR' ? '#cf1322' : '#d9d9d9',
              backgroundColor: statusFilter === 'MAINTENANCE' || statusFilter === 'IN_REPAIR' ? '#fff2f0' : '#ffffff'
            }}
          >
            <Statistic
              title="Maintenance"
              value={stats.maintenance}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Professional Search and Filters */}
      <div className="card">
        <div className="card-content">
          <div className="search-filter-container">
            <div className="search-input-container">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search by license plate, brand, or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <div className="filter-select-container">
                <FilterIcon />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value={VEHICLE_STATUS.AVAILABLE}>Available</option>
                  <option value={VEHICLE_STATUS.RENTED}>Rented</option>
                  <option value={VEHICLE_STATUS.MAINTENANCE}>Maintenance</option>
                  <option value={VEHICLE_STATUS.OUT_OF_SERVICE}>Out of Service</option>
                  <option value={VEHICLE_STATUS.RESERVED}>Reserved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results summary */}
          {(searchQuery || statusFilter) && (
            <div className="search-results-summary">
              Showing {filteredVehicles.length} of {vehicles.length} vehicles
              {searchQuery && <span className="filter-tag">Search: "{searchQuery}"</span>}
              {statusFilter && <span className="filter-tag">Status: {statusFilter}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Professional Horizontal Vehicle Table */}
      <Table
        columns={columns}
        dataSource={filteredVehicles}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: itemsPerPage,
          total: filteredVehicles.length,
          showTotal: (total, range) =>
            `Showing ${range[0]}-${range[1]} of ${total} vehicles`,
          showSizeChanger: true,
          pageSizeOptions: ['10', '25', '50', '100'],
          showQuickJumper: true,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            if (pageSize !== itemsPerPage) {
              setCurrentPage(1); // Reset to first page when page size changes
            }
          },
        }}
        locale={{
          emptyText: (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CarOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#666' }}>No vehicles found</h3>
              <p style={{ margin: '0', color: '#999' }}>
                {searchQuery || statusFilter
                  ? 'Try adjusting your search criteria or filters'
                  : 'Start by adding your first vehicle to the fleet'}
              </p>
              {!searchQuery && !statusFilter && canCreateVehicle() && (
                <Button
                  type="primary"
                  icon={<CarOutlined />}
                  onClick={handleAddNew}
                  style={{ marginTop: '16px' }}
                >
                  Add Your First Vehicle
                </Button>
              )}
            </div>
          ),
        }}
        size="middle"
        style={{ backgroundColor: '#fff' }}
      />

      {/* Professional Modals */}
      {isFormModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingVehicle ? 'Edit Vehicle' : 'New Vehicle'}</h3>
              <button onClick={closeFormModal} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-content">
              <VehicleForm
                vehicle={editingVehicle}
                onSuccess={closeFormModal}
              />
            </div>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedVehicle && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Vehicle Details</h3>
              <button onClick={closeDetailModal} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-content">
              <VehicleDetail vehicle={selectedVehicle} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;