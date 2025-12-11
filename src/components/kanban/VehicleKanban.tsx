import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Avatar, Button, Spin, message } from 'antd';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { CarOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesAPI } from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Inline types for compatibility
interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  status: string;
  statusDescription: string;
  dailyRate: number;
  category: string;
  seats: number;
  transmission: string;
  fuelType: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Reservation {
  id: number;
  vehicleId: number;
  customerName?: string;
  pickupDate: string;
  returnDate: string;
  status: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  vehicleStatus: string;
  vehicles: VehicleWithReservation[];
}

interface VehicleWithReservation extends Vehicle {
  currentReservation?: Reservation;
}

const VehicleKanban: React.FC = () => {
  const queryClient = useQueryClient();

  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: 'reserved',
      title: 'Reservado',
      color: '#faad14',
      vehicleStatus: 'RESERVED',
      vehicles: []
    },
    {
      id: 'rented',
      title: 'Alquilado',
      color: '#ff4d4f',
      vehicleStatus: 'RENTED',
      vehicles: []
    },
    {
      id: 'cleaning',
      title: 'Devuelto/Limpieza',
      color: '#722ed1',
      vehicleStatus: 'CLEANING',
      vehicles: []
    },
    {
      id: 'available',
      title: 'Disponible',
      color: '#52c41a',
      vehicleStatus: 'AVAILABLE',
      vehicles: []
    }
  ]);

  // Fetch vehicles data
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesAPI.getAll,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mock reservations data with sample information
  const getMockReservations = (): Reservation[] => [
    {
      id: 1,
      vehicleId: 1,
      customerName: 'Carlos Rodríguez',
      pickupDate: '2025-11-26T10:00:00Z',
      returnDate: '2025-11-30T18:00:00Z',
      status: 'CONFIRMED'
    },
    {
      id: 2,
      vehicleId: 2,
      customerName: 'María González',
      pickupDate: '2025-11-25T14:00:00Z',
      returnDate: '2025-11-28T12:00:00Z',
      status: 'ACTIVE'
    },
    {
      id: 3,
      vehicleId: 3,
      customerName: 'Luis Martínez',
      pickupDate: '2025-11-24T09:00:00Z',
      returnDate: '2025-11-26T17:00:00Z',
      status: 'RETURNED'
    },
    {
      id: 4,
      vehicleId: 4,
      customerName: 'Ana Silva',
      pickupDate: '2025-11-27T11:00:00Z',
      returnDate: '2025-12-01T16:00:00Z',
      status: 'CONFIRMED'
    },
    {
      id: 5,
      vehicleId: 5,
      customerName: 'Pedro López',
      pickupDate: '2025-11-26T15:00:00Z',
      returnDate: '2025-11-29T14:00:00Z',
      status: 'ACTIVE'
    }
  ];

  // Mutation for updating vehicle status
  const updateVehicleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      vehiclesAPI.changeStatus(id, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      message.success('Estado del vehículo actualizado correctamente');
    },
    onError: (error: any) => {
      console.error('Error updating vehicle status:', error);
      message.error('Error al actualizar el estado del vehículo');
    },
  });

  // Distribute vehicles into columns based on their real status
  useEffect(() => {
    if (vehicles.length > 0) {
      const reservations = getMockReservations();

      const vehiclesWithReservations: VehicleWithReservation[] = vehicles.map(vehicle => {
        const currentReservation = reservations.find(r => r.vehicleId === vehicle.id);
        return {
          ...vehicle,
          currentReservation
        };
      });

      // Map vehicles to columns based on their actual status
      // Treat RETURNED and WASHING as CLEANING
      const mapStatusToColumn = (status: string) => {
        if (status === 'RETURNED' || status === 'WASHING') return 'CLEANING';
        return status;
      };

      setColumns(prevColumns =>
        prevColumns.map(column => ({
          ...column,
          vehicles: vehiclesWithReservations.filter(v =>
            mapStatusToColumn(v.status) === column.vehicleStatus
          )
        }))
      );
    }
  }, [vehicles]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const vehicleId = parseInt(draggableId);
    const vehicle = sourceColumn.vehicles.find(v => v.id === vehicleId);

    if (!vehicle) return;

    // Update local state immediately for better UX
    setColumns(prevColumns => {
      const newColumns = prevColumns.map(column => {
        if (column.id === source.droppableId) {
          return {
            ...column,
            vehicles: column.vehicles.filter(v => v.id !== vehicleId)
          };
        }
        if (column.id === destination.droppableId) {
          const updatedVehicle = { ...vehicle, status: column.vehicleStatus };
          const newVehicles = [...column.vehicles];
          newVehicles.splice(destination.index, 0, updatedVehicle);
          return {
            ...column,
            vehicles: newVehicles
          };
        }
        return column;
      });
      return newColumns;
    });

    // Update in backend
    updateVehicleStatusMutation.mutate({
      id: vehicleId,
      status: destColumn.vehicleStatus
    });
  };

  const VehicleCard: React.FC<{ vehicle: VehicleWithReservation; index: number }> = ({ vehicle, index }) => (
    <Draggable draggableId={vehicle.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1,
            transform: snapshot.isDragging
              ? `${provided.draggableProps.style?.transform} rotate(5deg)`
              : provided.draggableProps.style?.transform
          }}
        >
          <Card
            size="small"
            style={{
              marginBottom: 8,
              cursor: 'grab',
              border: snapshot.isDragging ? '2px solid #1890ff' : '1px solid #d9d9d9',
              boxShadow: snapshot.isDragging ? '0 4px 12px rgba(0,0,0,0.2)' : undefined
            }}
            bodyStyle={{ padding: '12px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <Avatar icon={<CarOutlined />} size="small" style={{ marginRight: 8 }} />
              <div>
                <Text strong style={{ fontSize: '12px' }}>{vehicle.licensePlate}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {vehicle.brand} {vehicle.model} ({vehicle.year})
                </Text>
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <Tag color={vehicle.color === 'Blanco' ? 'default' : 'blue'} style={{ fontSize: '10px' }}>
                {vehicle.color}
              </Tag>
              <Tag style={{ fontSize: '10px' }}>
                ${vehicle.dailyRate}/día
              </Tag>
            </div>

            {vehicle.currentReservation && (
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <UserOutlined style={{ fontSize: '10px', marginRight: 4, color: '#666' }} />
                  <Text style={{ fontSize: '10px', color: '#666' }}>
                    {vehicle.currentReservation.customerName}
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarOutlined style={{ fontSize: '10px', marginRight: 4, color: '#666' }} />
                  <Text style={{ fontSize: '10px', color: '#666' }}>
                    {dayjs(vehicle.currentReservation.pickupDate).format('DD/MM')} - {' '}
                    {dayjs(vehicle.currentReservation.returnDate).format('DD/MM')}
                  </Text>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </Draggable>
  );

  const KanbanColumn: React.FC<{ column: KanbanColumn }> = ({ column }) => (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: column.color, fontWeight: 'bold' }}>
            {column.title}
          </span>
          <Tag color={column.color} style={{ margin: 0 }}>
            {column.vehicles.length}
          </Tag>
        </div>
      }
      size="small"
      style={{ height: '400px', overflow: 'hidden' }}
      bodyStyle={{
        padding: '8px',
        height: 'calc(100% - 50px)',
        overflowY: 'auto'
      }}
    >
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              minHeight: '300px',
              backgroundColor: snapshot.isDraggingOver ? '#f6ffed' : undefined,
              border: snapshot.isDraggingOver ? '2px dashed #52c41a' : '2px dashed transparent',
              borderRadius: '8px',
              padding: '4px'
            }}
          >
            {column.vehicles.map((vehicle, index) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Card>
  );

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Cargando estado de vehículos...</Text>
        </div>
      </div>
    );
  }

  // Vehicle List Component
  const VehicleList: React.FC = () => (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Lista de Vehículos</span>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {vehicles.length} total
          </Text>
        </div>
      }
      size="small"
      style={{ height: '400px', overflow: 'hidden' }}
      bodyStyle={{
        padding: '8px',
        height: 'calc(100% - 50px)',
        overflowY: 'auto'
      }}
    >
      {vehicles.map((vehicle) => {
        const reservation = getMockReservations().find(r => r.vehicleId === vehicle.id);
        const statusColor =
          vehicle.status === 'AVAILABLE' ? '#52c41a' :
          vehicle.status === 'RESERVED' ? '#faad14' :
          vehicle.status === 'RENTED' ? '#ff4d4f' :
          '#722ed1';

        return (
          <Card
            key={vehicle.id}
            size="small"
            style={{
              marginBottom: 8,
              border: `2px solid ${statusColor}`,
              borderRadius: '6px'
            }}
            bodyStyle={{ padding: '8px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <Avatar
                icon={<CarOutlined />}
                size="small"
                style={{ backgroundColor: statusColor, marginRight: 8 }}
              />
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: '12px', display: 'block' }}>
                  {vehicle.licensePlate}
                </Text>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {vehicle.brand} {vehicle.model}
                </Text>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: '10px', color: statusColor, fontWeight: 'bold' }}>
                {vehicle.status === 'AVAILABLE' ? 'Disponible' :
                 vehicle.status === 'RESERVED' ? 'Reservado' :
                 vehicle.status === 'RENTED' ? 'Alquilado' :
                 'Limpieza'}
              </Text>

              {vehicle.status === 'RESERVED' && reservation && (
                <Text style={{ fontSize: '9px', color: '#666' }}>
                  Vuelve: {dayjs(reservation.returnDate).format('DD/MM')}
                </Text>
              )}
            </div>

            {vehicle.status === 'RENTED' && reservation && (
              <div style={{ marginTop: 4, fontSize: '9px', color: '#666' }}>
                <CalendarOutlined style={{ marginRight: 2 }} />
                Cliente: {reservation.customerName}
              </div>
            )}
          </Card>
        );
      })}
    </Card>
  );

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          Estado de Vehículos - Kanban
        </Title>
        <Button
          type="primary"
          icon={<CarOutlined />}
          onClick={() => window.location.reload()}
        >
          Actualizar
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px' }}>
        {/* Vehicle List on the left */}
        <VehicleList />

        {/* Kanban Board on the right */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {columns.map(column => (
              <KanbanColumn key={column.id} column={column} />
            ))}
          </div>
        </DragDropContext>
      </div>

      <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6f6f6', borderRadius: 6 }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          💡 Arrastra los vehículos entre columnas para cambiar su estado.
          Los cambios se guardan automáticamente.
        </Text>
      </div>
    </div>
  );
};

export default VehicleKanban;