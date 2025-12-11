import React, { useState } from 'react';
import { Card, Typography, Space, Button, Row, Col, Statistic, Tabs, message, Modal, Form, Input, DatePicker, Select, Badge } from 'antd';
import dayjs from 'dayjs';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import '../styles/calendar.css';
import { CarOutlined, UserOutlined, DollarOutlined, CalendarOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesAPI, reservationsAPI, maintenanceAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const { Title, Text } = Typography;
const { Option } = Select;

// Configurar moment en español
moment.locale('es');
const localizer = momentLocalizer(moment);

// Configurar mensajes en español para el calendario
const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay eventos en este rango',
  showMore: (total: number) => `+ Ver más (${total})`
};

// Enhanced Kanban with Drag and Drop
const DragDropKanban: React.FC<{ vehicles: any[] }> = ({ vehicles = [] }) => {
  const queryClient = useQueryClient();
  const [kmPopupVisible, setKmPopupVisible] = useState(false);
  const [selectedVehicleForKm, setSelectedVehicleForKm] = useState<any>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<any>(null);

  console.log('🔧 DragDropKanban component loaded with vehicles:', vehicles.length);

  // Obtener reservas para mostrar fechas
  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: reservationsAPI.getAll,
  });

  // Safety check
  if (!vehicles || !Array.isArray(vehicles)) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <Text>Cargando vehículos...</Text>
      </div>
    );
  }

  // Mutation for updating vehicle status
  const updateVehicleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => {
      console.log('🔄 Updating vehicle status:', { id, status });
      // Use CLEANING instead of RETURNED for backend compatibility
      const backendStatus = status === 'RETURNED' ? 'CLEANING' : status;
      return vehiclesAPI.changeStatus(id, backendStatus as any);
    },
    onSuccess: () => {
      console.log('✅ Vehicle status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      message.success('Estado del vehículo actualizado correctamente');
    },
    onError: (error: any) => {
      console.error('❌ Error updating vehicle status:', error);
      message.error(`Error al actualizar el estado: ${error.message || 'Error desconocido'}`);
    },
  });

  // Group vehicles by status safely
  const reserved = vehicles.filter(v => v?.status === 'RESERVED') || [];
  const rented = vehicles.filter(v => v?.status === 'RENTED') || [];
  const cleaning = vehicles.filter(v =>
    v?.status === 'CLEANING' || v?.status === 'WASHING' || v?.status === 'RETURNED'
  ) || [];
  const available = vehicles.filter(v => v?.status === 'AVAILABLE') || [];

  console.log('📊 Vehicle distribution:', { reserved: reserved.length, rented: rented.length, cleaning: cleaning.length, available: available.length });

  // Handle drag end
  const handleDragEnd = (result: any) => {
    console.log('🎯 Drag end event:', result);

    if (!result.destination) {
      console.log('❌ No destination, cancelling drag');
      return;
    }

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      console.log('❌ Same column, cancelling drag');
      return;
    }

    // Map column IDs to statuses
    const statusMap = {
      'reserved': 'RESERVED',
      'rented': 'RENTED',
      'cleaning': 'CLEANING',
      'available': 'AVAILABLE'
    };

    const newStatus = statusMap[destination.droppableId as keyof typeof statusMap];
    const vehicleId = parseInt(draggableId);

    console.log('🎯 Drag details:', {
      from: source.droppableId,
      to: destination.droppableId,
      vehicleId,
      newStatus
    });

    if (newStatus && vehicleId && !isNaN(vehicleId)) {
      // Encontrar el vehículo
      const vehicle = vehicles.find(v => v.id === vehicleId);

      // 🚨 DETECTAR CAMBIO DE DISPONIBLE A RESERVADO
      if (source.droppableId === 'available' && destination.droppableId === 'reserved') {
        console.log('🔔 Vehículo cambiando de DISPONIBLE a RESERVADO - mostrar popup KM');
        setSelectedVehicleForKm(vehicle);
        setPendingStatusChange({ id: vehicleId, status: newStatus });
        setKmPopupVisible(true);
        return; // No ejecutar el cambio de estado todavía
      }

      // Para otros cambios de estado, proceder normalmente
      console.log('🚗 Updating vehicle:', vehicleId, 'to status:', newStatus);
      updateVehicleStatusMutation.mutate({ id: vehicleId, status: newStatus });
    } else {
      console.error('❌ Invalid drag data:', { newStatus, vehicleId, isNaN: isNaN(vehicleId) });
      message.error('Error en los datos del vehículo a actualizar');
    }
  };

  // Draggable vehicle card component
  const VehicleCard = ({ vehicle, index }: { vehicle: any, index: number }) => {
    if (!vehicle || !vehicle.id) {
      console.warn('⚠️ Invalid vehicle data:', vehicle);
      return null;
    }

    return (
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
                ? `${provided.draggableProps.style?.transform} rotate(2deg)`
                : provided.draggableProps.style?.transform,
              userSelect: 'none'
            }}
          >
            <Card
              size="small"
              style={{
                marginBottom: 8,
                cursor: 'grab',
                border: snapshot.isDragging ? '2px solid #1890ff' : '1px solid #d9d9d9',
                borderRadius: 4,
                boxShadow: snapshot.isDragging ? '0 4px 12px rgba(24,144,255,0.4)' : '0 1px 3px rgba(0,0,0,0.1)'
              }}
              bodyStyle={{ padding: '8px' }}
            >
              <Text strong style={{ fontSize: '12px', display: 'block' }}>
                {vehicle.licensePlate || 'Sin placa'}
              </Text>
              <Text type="secondary" style={{ fontSize: '10px' }}>
                {vehicle.brand || ''} {vehicle.model || ''}
              </Text>
              <br />
              <Text style={{ fontSize: '9px', color: '#666' }}>
                ${vehicle.dailyRate || 0}/día
              </Text>
            </Card>
          </div>
        )}
      </Draggable>
    );
  };

  // Droppable column component
  const DroppableColumn = ({
    id,
    title,
    vehicles,
    bgColor
  }: {
    id: string,
    title: string,
    vehicles: any[],
    bgColor: string
  }) => (
    <Card
      title={`${title} (${vehicles.length})`}
      size="small"
      style={{ backgroundColor: bgColor, minHeight: '350px' }}
    >
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              minHeight: '250px',
              backgroundColor: snapshot.isDraggingOver ? '#e6f7ff' : 'transparent',
              border: snapshot.isDraggingOver ? '2px dashed #1890ff' : '2px dashed transparent',
              borderRadius: '6px',
              padding: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            {vehicles.map((vehicle, index) => (
              <VehicleCard key={`vehicle-${vehicle.id}`} vehicle={vehicle} index={index} />
            ))}
            {provided.placeholder}
            {vehicles.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#999',
                border: '1px dashed #d9d9d9',
                borderRadius: '4px',
                backgroundColor: snapshot.isDraggingOver ? '#f0f8ff' : '#fafafa'
              }}>
                <Text type="secondary">
                  {snapshot.isDraggingOver ? '⬇️ Soltar aquí' : '📦 Sin vehículos'}
                </Text>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </Card>
  );

  // Funciones para manejar el popup de KM
  const handleKmFormSubmit = (values: any) => {
    console.log('📝 KM Form submitted:', values);

    if (!pendingStatusChange || !selectedVehicleForKm) {
      message.error('Error: datos del vehículo no encontrados');
      return;
    }

    if (!values.dateRange || !values.dateRange[0] || !values.dateRange[1]) {
      message.error('Por favor seleccione las fechas de inicio y fin de la reserva');
      return;
    }

    const startDate = dayjs(values.dateRange[0]).format('YYYY-MM-DD');
    const endDate = dayjs(values.dateRange[1]).format('YYYY-MM-DD');
    const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;

    // Datos de la nueva reserva
    const newReservation = {
      vehicleId: selectedVehicleForKm.id,
      startDate: startDate,
      endDate: endDate,
      totalDays: totalDays,
      dailyRate: selectedVehicleForKm.dailyRate,
      totalAmount: totalDays * selectedVehicleForKm.dailyRate,
      pickupLocation: values.pickupLocation || 'Oficina principal',
      returnLocation: values.returnLocation || 'Oficina principal',
      specialRequests: values.specialRequests || '',
      status: 'CONFIRMED'
    };

    // Actualizar el kilometraje del vehículo
    const updatedVehicle = {
      ...selectedVehicleForKm,
      mileage: parseInt(values.currentKm)
    };

    console.log('🔄 Creating reservation and updating vehicle:', { newReservation, updatedVehicle });

    // Primero crear la reserva
    reservationsAPI.create(newReservation)
      .then((reservation) => {
        console.log('✅ Reservation created:', reservation);
        // Luego actualizar el vehiculo con los nuevos KM
        return vehiclesAPI.update(selectedVehicleForKm.id, updatedVehicle);
      })
      .then(() => {
        console.log('✅ Vehicle updated with new mileage');
        // Finalmente cambiar el estado
        updateVehicleStatusMutation.mutate(pendingStatusChange);
        message.success(`Vehículo ${selectedVehicleForKm.licensePlate} reservado exitosamente del ${dayjs(startDate).format('DD/MM/YYYY')} al ${dayjs(endDate).format('DD/MM/YYYY')}. KM de salida: ${values.currentKm}`);
        setKmPopupVisible(false);
        setSelectedVehicleForKm(null);
        setPendingStatusChange(null);
      })
      .catch((error) => {
        console.error('❌ Error creating reservation or updating vehicle:', error);
        message.error('Error al crear la reserva o actualizar el vehículo');
      });
  };

  const handleKmPopupCancel = () => {
    console.log('❌ Popup KM cancelado');
    setKmPopupVisible(false);
    setSelectedVehicleForKm(null);
    setPendingStatusChange(null);
    message.info('Cambio de estado cancelado');
  };

  // Buscar reserva activa para el vehículo seleccionado
  const getVehicleReservation = () => {
    if (!selectedVehicleForKm) return null;

    return reservations.find(reservation =>
      reservation.vehicleId === selectedVehicleForKm.id &&
      (reservation.status === 'CONFIRMED' || reservation.status === 'PENDING')
    );
  };

  return (
    <div>
      <Title level={4}>🎯 Estado de Vehículos - Kanban con Drag & Drop</Title>

      {updateVehicleStatusMutation.isPending && (
        <div style={{
          position: 'fixed',
          top: 100,
          right: 20,
          zIndex: 1000,
          padding: '8px 16px',
          backgroundColor: '#1890ff',
          color: 'white',
          borderRadius: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          🔄 Actualizando...
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px' }}>
        {/* Vehicle List */}
        <Card title={`Lista de Vehículos (${vehicles.length})`} size="small">
          <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
            {vehicles.map((vehicle, index) => (
              <div key={vehicle.id || index} style={{
                marginBottom: 8,
                padding: 12,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                backgroundColor: '#fff'
              }}>
                <Text strong>{vehicle.licensePlate || 'N/A'}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {vehicle.brand} {vehicle.model}
                </Text>
                <br />
                <Text style={{
                  fontSize: '11px',
                  color: vehicle.status === 'AVAILABLE' ? '#52c41a' :
                        vehicle.status === 'RENTED' ? '#ff4d4f' :
                        vehicle.status === 'RESERVED' ? '#faad14' : '#722ed1'
                }}>
                  Estado: {vehicle.status}
                </Text>
              </div>
            ))}
          </div>
        </Card>

        {/* Drag & Drop Kanban Columns */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <DroppableColumn
              id="reserved"
              title="🔒 Reservado"
              vehicles={reserved}
              bgColor="#fff7e6"
            />
            <DroppableColumn
              id="rented"
              title="🚗 Alquilado"
              vehicles={rented}
              bgColor="#fff1f0"
            />
            <DroppableColumn
              id="cleaning"
              title="🧽 Limpieza"
              vehicles={cleaning}
              bgColor="#f9f0ff"
            />
            <DroppableColumn
              id="available"
              title="✅ Disponible"
              vehicles={available}
              bgColor="#f6ffed"
            />
          </div>
        </DragDropContext>
      </div>

      <div style={{
        marginTop: 16,
        padding: 16,
        backgroundColor: '#f0f8ff',
        borderRadius: 8,
        border: '1px solid #d6e4ff'
      }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          💡 <strong>Instrucciones:</strong> Arrastra los vehículos entre columnas para cambiar su estado.
          Los cambios se guardan automáticamente en la base de datos.
          <br />
          🔄 Flujo: Reservado → Alquilado → Limpieza → Disponible
        </Text>
      </div>

      {/* Modal para registrar KM de salida */}
      <Modal
        title="🚗 Registro de KM de Salida"
        open={kmPopupVisible}
        onCancel={handleKmPopupCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        {selectedVehicleForKm && (
          <Form
            onFinish={handleKmFormSubmit}
            layout="vertical"
            initialValues={{
              currentKm: selectedVehicleForKm.mileage,
              pickupLocation: 'Oficina principal',
              returnLocation: 'Oficina principal'
            }}
          >
            {/* Información del vehículo */}
            <Card
              title="📋 Información del Vehículo"
              size="small"
              style={{ marginBottom: 16, backgroundColor: '#f9f9f9' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Placa:</Text> {selectedVehicleForKm.licensePlate}
                  <br />
                  <Text strong>Marca/Modelo:</Text> {selectedVehicleForKm.brand} {selectedVehicleForKm.model}
                  <br />
                  <Text strong>Año:</Text> {selectedVehicleForKm.modelYear}
                </Col>
                <Col span={12}>
                  <Text strong>Color:</Text> {selectedVehicleForKm.color}
                  <br />
                  <Text strong>Asientos:</Text> {selectedVehicleForKm.seats}
                  <br />
                  <Text strong>Transmisión:</Text> {selectedVehicleForKm.transmission}
                </Col>
              </Row>
            </Card>

            {/* Formulario de fechas de reserva */}
            <Card
              title="📅 Fechas de Reserva"
              size="small"
              style={{ marginBottom: 16, backgroundColor: '#fff7e6' }}
            >
              <Form.Item
                label="Período de Reserva"
                name="dateRange"
                rules={[
                  { required: true, message: 'Por favor seleccione las fechas de inicio y fin' }
                ]}
              >
                <DatePicker.RangePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder={['Fecha inicio', 'Fecha fin']}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                  showTime={false}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Ubicación de Recogida"
                    name="pickupLocation"
                    rules={[
                      { required: true, message: 'Por favor ingrese la ubicación de recogida' }
                    ]}
                  >
                    <Input
                      placeholder="Ej: Oficina principal, Aeropuerto"
                      defaultValue="Oficina principal"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Ubicación de Retorno"
                    name="returnLocation"
                    rules={[
                      { required: true, message: 'Por favor ingrese la ubicación de retorno' }
                    ]}
                  >
                    <Input
                      placeholder="Ej: Oficina principal, Aeropuerto"
                      defaultValue="Oficina principal"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Solicitudes Especiales (Opcional)"
                name="specialRequests"
              >
                <Input.TextArea
                  placeholder="GPS, silla para bebé, combustible lleno, etc."
                  rows={2}
                />
              </Form.Item>
            </Card>

            {/* Resumen de costos dinámico */}
            <Form.Item shouldUpdate={(prev, curr) => prev.dateRange !== curr.dateRange}>
              {({ getFieldValue }) => {
                const dateRange = getFieldValue('dateRange');
                if (dateRange && dateRange[0] && dateRange[1]) {
                  const days = dayjs(dateRange[1]).diff(dayjs(dateRange[0]), 'day') + 1;
                  const totalCost = days * selectedVehicleForKm.dailyRate;

                  return (
                    <Card
                      title="💰 Resumen de Costos"
                      size="small"
                      style={{ marginBottom: 16, backgroundColor: '#f0f8ff', border: '2px solid #1890ff' }}
                    >
                      <Row gutter={16}>
                        <Col span={8}>
                          <Text strong>Días: </Text>
                          <Text style={{ fontSize: '16px', color: '#1890ff' }}>{days}</Text>
                        </Col>
                        <Col span={8}>
                          <Text strong>Tarifa/día: </Text>
                          <Text style={{ fontSize: '16px', color: '#52c41a' }}>${selectedVehicleForKm.dailyRate}</Text>
                        </Col>
                        <Col span={8}>
                          <Text strong>Total: </Text>
                          <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff7a00' }}>${totalCost}</Text>
                        </Col>
                      </Row>
                    </Card>
                  );
                }
                return null;
              }}
            </Form.Item>

            {/* Formulario de KM */}
            <Card title="⛽ Kilometraje de Salida" size="small" style={{ backgroundColor: '#f6ffed' }}>
              <Form.Item
                label="Kilometraje Actual del Vehículo"
                name="currentKm"
                rules={[
                  { required: true, message: 'Por favor ingrese el kilometraje actual' },
                  { type: 'number', min: selectedVehicleForKm.mileage, message: `El kilometraje no puede ser menor al actual (${selectedVehicleForKm.mileage} km)` }
                ]}
              >
                <Input
                  type="number"
                  suffix="km"
                  placeholder={`Actual: ${selectedVehicleForKm.mileage} km`}
                  style={{ fontSize: '16px' }}
                />
              </Form.Item>

              <div style={{
                padding: '12px',
                backgroundColor: '#e6f7ff',
                borderRadius: '6px',
                border: '1px solid #91d5ff',
                marginBottom: '16px'
              }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  💡 <strong>Importante:</strong> Registre el kilometraje exacto mostrado en el odómetro del vehículo.
                  Esta información será utilizada para el control de mantenimiento y cálculo de tarifas por kilometraje.
                </Text>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Button block onClick={handleKmPopupCancel}>
                    ❌ Cancelar
                  </Button>
                </Col>
                <Col span={12}>
                  <Button type="primary" htmlType="submit" block>
                    ✅ Crear Reserva y Actualizar KM
                  </Button>
                </Col>
              </Row>
            </Card>
          </Form>
        )}
      </Modal>
    </div>
  );
};

// Componente de calendario funcional con eventos
const VehicleCalendar: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');

  // Obtener datos necesarios
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesAPI.getAll,
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: reservationsAPI.getAll,
  });

  // Crear función temporal para obtener todos los registros de mantenimiento
  const getAllMaintenanceRecords = async () => {
    try {
      const response = await fetch('http://localhost:8083/api/v1/maintenance/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log('🚫 No hay endpoint /all, intentando obtener por estado...');
        // Si no existe /all, intentar obtener por diferentes estados
        const scheduledResponse = await fetch('http://localhost:8083/api/v1/maintenance/status/SCHEDULED', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            'Content-Type': 'application/json'
          }
        });

        const inProgressResponse = await fetch('http://localhost:8083/api/v1/maintenance/status/IN_PROGRESS', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            'Content-Type': 'application/json'
          }
        });

        const completedResponse = await fetch('http://localhost:8083/api/v1/maintenance/status/COMPLETED', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            'Content-Type': 'application/json'
          }
        });

        const scheduled = scheduledResponse.ok ? await scheduledResponse.json() : [];
        const inProgress = inProgressResponse.ok ? await inProgressResponse.json() : [];
        const completed = completedResponse.ok ? await completedResponse.json() : [];

        console.log('📋 Maintenance by status:', { scheduled, inProgress, completed });
        return [...scheduled, ...inProgress, ...completed];
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching maintenance records:', error);
      return [];
    }
  };

  const { data: maintenanceRecords = [], isLoading: maintenanceLoading, error: maintenanceError } = useQuery({
    queryKey: ['maintenance-records'],
    queryFn: getAllMaintenanceRecords,
  });

  // Debug logs
  console.log('🔧 Maintenance Records:', maintenanceRecords);
  console.log('📊 Vehicles:', vehicles);
  console.log('📅 Reservations:', reservations);

  // Función para convertir reservas en eventos del calendario
  const getReservationEvents = () => {
    return reservations.map((reservation: any) => {
      const vehicle = vehicles.find((v: any) => v.id === reservation.vehicleId);
      const vehicleName = vehicle ? `${vehicle.licensePlate} - ${vehicle.brand} ${vehicle.model}` : 'Vehículo desconocido';

      return {
        id: `reservation-${reservation.id}`,
        title: `🚗 ${vehicleName}`,
        start: new Date(reservation.startDate),
        end: new Date(reservation.endDate),
        resource: {
          type: 'reservation',
          status: reservation.status,
          data: reservation,
          vehicle: vehicle
        }
      };
    });
  };

  // Función para convertir mantenimiento en eventos del calendario
  const getMaintenanceEvents = () => {
    console.log('🔧 Processing maintenance records for calendar:', maintenanceRecords.length);

    const events = maintenanceRecords.map((record: any) => {
      console.log('📝 Processing maintenance record:', record);

      const vehicle = vehicles.find((v: any) => v.id === record.vehicleId);
      const vehicleName = vehicle ? `${vehicle.licensePlate} - ${vehicle.brand} ${vehicle.model}` : 'Vehículo desconocido';

      const event = {
        id: `maintenance-${record.id}`,
        title: `🔧 ${vehicleName}`,
        start: new Date(record.serviceDate),
        end: record.completionDate ? new Date(record.completionDate) : new Date(record.serviceDate),
        resource: {
          type: 'maintenance',
          status: record.status,
          data: record,
          vehicle: vehicle
        }
      };

      console.log('📅 Created maintenance event:', event);
      return event;
    });

    console.log('🎯 Total maintenance events created:', events.length);
    return events;
  };

  // Combinar todos los eventos
  const getAllEvents = () => {
    const reservationEvents = getReservationEvents();
    const maintenanceEvents = getMaintenanceEvents();

    console.log('🚗 Reservation events:', reservationEvents.length);
    console.log('🔧 Maintenance events:', maintenanceEvents.length);

    let allEvents = [...reservationEvents, ...maintenanceEvents];
    console.log('📊 Combined events before filters:', allEvents.length);

    // Filtrar por vehículo
    if (selectedVehicle !== 'all') {
      allEvents = allEvents.filter(event =>
        event.resource.vehicle?.id === parseInt(selectedVehicle)
      );
      console.log('🚙 Events after vehicle filter:', allEvents.length);
    }

    // Filtrar por tipo de evento
    if (selectedEventType !== 'all') {
      allEvents = allEvents.filter(event =>
        event.resource.type === selectedEventType
      );
      console.log('🎭 Events after type filter:', allEvents.length);
    }

    console.log('🎯 Final events for calendar:', allEvents);
    return allEvents;
  };

  // Personalizar el estilo de cada evento
  const eventStyleGetter = (event: any) => {
    const { type, status } = event.resource;

    let style = {
      borderRadius: '4px',
      border: 'none',
      color: 'white',
      fontSize: '12px',
      padding: '2px 6px'
    };

    if (type === 'reservation') {
      if (status === 'CONFIRMED') {
        style = { ...style, backgroundColor: '#faad14' }; // Naranja para reservas confirmadas
      } else if (status === 'IN_PROGRESS') {
        style = { ...style, backgroundColor: '#ff4d4f' }; // Rojo para alquileres activos
      } else if (status === 'COMPLETED') {
        style = { ...style, backgroundColor: '#52c41a' }; // Verde para completados
      } else {
        style = { ...style, backgroundColor: '#d9d9d9' }; // Gris para otros
      }
    } else if (type === 'maintenance') {
      if (status === 'SCHEDULED') {
        style = { ...style, backgroundColor: '#13c2c2' }; // Azul claro para programado
      } else if (status === 'IN_PROGRESS') {
        style = { ...style, backgroundColor: '#1890ff' }; // Azul para en progreso
      } else if (status === 'COMPLETED') {
        style = { ...style, backgroundColor: '#52c41a' }; // Verde para completado
      } else {
        style = { ...style, backgroundColor: '#722ed1' }; // Morado para otros
      }
    }

    return { style };
  };

  // Manejar clic en evento
  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setEventModalVisible(true);
  };

  // Funciones de navegación del calendario
  const handleNavigate = (action: string) => {
    let newDate = new Date(currentDate);

    if (action === 'PREV') {
      if (currentView === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (currentView === 'week') {
        newDate.setDate(newDate.getDate() - 7);
      } else if (currentView === 'day') {
        newDate.setDate(newDate.getDate() - 1);
      }
    } else if (action === 'NEXT') {
      if (currentView === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (currentView === 'week') {
        newDate.setDate(newDate.getDate() + 7);
      } else if (currentView === 'day') {
        newDate.setDate(newDate.getDate() + 1);
      }
    } else if (action === 'TODAY') {
      newDate = new Date();
    }

    setCurrentDate(newDate);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  // Toolbar personalizado para navegación completa
  const CustomToolbar = ({ localizer, label }: any) => {
    const goToBack = () => {
      handleNavigate('PREV');
    };

    const goToNext = () => {
      handleNavigate('NEXT');
    };

    const goToCurrent = () => {
      handleNavigate('TODAY');
    };

    const goToMonth = () => {
      handleViewChange('month');
    };

    const goToWeek = () => {
      handleViewChange('week');
    };

    const goToDay = () => {
      handleViewChange('day');
    };

    const goToAgenda = () => {
      handleViewChange('agenda');
    };

    return (
      <div className="rbc-toolbar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '12px 16px',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        border: '1px solid #d9d9d9'
      }}>
        <div className="rbc-btn-group" style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={goToBack}>‹ Anterior</Button>
          <Button onClick={goToCurrent}>Hoy</Button>
          <Button onClick={goToNext}>Siguiente ›</Button>
        </div>

        <div className="rbc-toolbar-label" style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#333',
          textAlign: 'center',
          flex: 1
        }}>
          {label}
        </div>

        <div className="rbc-btn-group" style={{ display: 'flex', gap: '4px' }}>
          <Button
            type={currentView === 'month' ? 'primary' : 'default'}
            onClick={goToMonth}
          >
            Mes
          </Button>
          <Button
            type={currentView === 'week' ? 'primary' : 'default'}
            onClick={goToWeek}
          >
            Semana
          </Button>
          <Button
            type={currentView === 'day' ? 'primary' : 'default'}
            onClick={goToDay}
          >
            Día
          </Button>
          <Button
            type={currentView === 'agenda' ? 'primary' : 'default'}
            onClick={goToAgenda}
          >
            Agenda
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Title level={4}>📅 Calendario de Eventos de Vehículos</Title>

      {/* Filtros */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>Filtrar por Vehículo:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={selectedVehicle}
              onChange={setSelectedVehicle}
              placeholder="Seleccionar vehículo"
            >
              <Option value="all">Todos los vehículos</Option>
              {vehicles.map((vehicle: any) => (
                <Option key={vehicle.id} value={vehicle.id.toString()}>
                  {vehicle.licensePlate} - {vehicle.brand} {vehicle.model}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Text strong>Tipo de Evento:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={selectedEventType}
              onChange={setSelectedEventType}
              placeholder="Seleccionar tipo"
            >
              <Option value="all">Todos los eventos</Option>
              <Option value="reservation">🚗 Reservas/Alquileres</Option>
              <Option value="maintenance">🔧 Mantenimiento</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Text strong>Leyenda:</Text>
            <div style={{ marginTop: 8 }}>
              <Space direction="vertical" size={4}>
                <div><Badge color="#faad14" text="Reservas Confirmadas" /></div>
                <div><Badge color="#ff4d4f" text="Alquileres Activos" /></div>
                <div><Badge color="#13c2c2" text="Mantenimiento Programado" /></div>
                <div><Badge color="#52c41a" text="Eventos Completados" /></div>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Calendario */}
      <Card>
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={getAllEvents()}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            messages={messages}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleEventClick}
            views={['month', 'week', 'day', 'agenda']}
            view={currentView as any}
            onView={handleViewChange as any}
            date={currentDate}
            onNavigate={setCurrentDate}
            popup
            showMultiDayTimes
            scrollToTime={new Date(1970, 1, 1, 8)}
            step={30}
            timeslots={2}
            dayLayoutAlgorithm="no-overlap"
            components={{
              toolbar: CustomToolbar
            }}
          />
        </div>
      </Card>

      {/* Modal de detalle del evento */}
      <Modal
        title={
          <div style={{ color: selectedEvent?.resource?.type === 'reservation' ? '#faad14' : '#13c2c2' }}>
            {selectedEvent?.resource?.type === 'reservation' ? '🚗 Detalle de Reserva' : '🔧 Detalle de Mantenimiento'}
          </div>
        }
        open={eventModalVisible}
        onCancel={() => setEventModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedEvent && (
          <div>
            {selectedEvent.resource.type === 'reservation' ? (
              <Card>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong>Vehículo:</Text>
                    <br />
                    <Text>{selectedEvent.resource.vehicle?.licensePlate} - {selectedEvent.resource.vehicle?.brand} {selectedEvent.resource.vehicle?.model}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Estado:</Text>
                    <br />
                    <Badge
                      status={selectedEvent.resource.status === 'CONFIRMED' ? 'processing' : 'success'}
                      text={selectedEvent.resource.status}
                    />
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Text strong>Fecha Inicio:</Text>
                    <br />
                    <Text>{moment(selectedEvent.start).format('DD/MM/YYYY')}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Fecha Fin:</Text>
                    <br />
                    <Text>{moment(selectedEvent.end).format('DD/MM/YYYY')}</Text>
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Text strong>Ubicación Recogida:</Text>
                    <br />
                    <Text>{selectedEvent.resource.data.pickupLocation}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Ubicación Retorno:</Text>
                    <br />
                    <Text>{selectedEvent.resource.data.returnLocation}</Text>
                  </Col>
                </Row>
                <div style={{ marginTop: 16 }}>
                  <Text strong>Total: </Text>
                  <Text style={{ fontSize: '16px', color: '#52c41a' }}>${selectedEvent.resource.data.totalAmount}</Text>
                </div>
              </Card>
            ) : (
              <Card>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong>Vehículo:</Text>
                    <br />
                    <Text>{selectedEvent.resource.vehicle?.licensePlate} - {selectedEvent.resource.vehicle?.brand} {selectedEvent.resource.vehicle?.model}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Estado:</Text>
                    <br />
                    <Badge
                      status={selectedEvent.resource.status === 'COMPLETED' ? 'success' : 'processing'}
                      text={selectedEvent.resource.status}
                    />
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Text strong>Tipo:</Text>
                    <br />
                    <Text>{selectedEvent.resource.data.maintenanceType}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Fecha Servicio:</Text>
                    <br />
                    <Text>{moment(selectedEvent.start).format('DD/MM/YYYY')}</Text>
                  </Col>
                </Row>
                <div style={{ marginTop: 16 }}>
                  <Text strong>Descripción:</Text>
                  <br />
                  <Text>{selectedEvent.resource.data.description}</Text>
                </div>
                {selectedEvent.resource.data.cost && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Costo: </Text>
                    <Text style={{ fontSize: '16px', color: '#ff7a00' }}>${selectedEvent.resource.data.cost}</Text>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesAPI.getAll,
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: reservationsAPI.getAll,
    enabled: !!user && (user.roles.includes('ADMIN') || user.roles.includes('EMPLOYEE')),
  });

  const { data: myReservations = [], isLoading: myReservationsLoading } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: reservationsAPI.getMyReservations,
  });

  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
  const totalRevenue = reservations.reduce((sum, res) => sum + (res.totalAmount || 0), 0);
  const myActiveReservations = myReservations.filter(res =>
    res.status === 'CONFIRMED' || res.status === 'IN_PROGRESS'
  ).length;

  // Estadísticas para el Kanban
  const reserved = vehicles.filter(v => v.status === 'RESERVED').length;
  const rented = vehicles.filter(v => v.status === 'RENTED').length;
  const cleaning = vehicles.filter(v => v.status === 'CLEANING' || v.status === 'WASHING').length;

  // Componente de resumen general
  const OverviewContent = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Vehículos"
              value={vehicles.length}
              prefix={<CarOutlined style={{ color: '#1890ff' }} />}
              loading={vehiclesLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Disponibles"
              value={availableVehicles}
              prefix={<CarOutlined style={{ color: '#52c41a' }} />}
              loading={vehiclesLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={user?.roles.includes('CUSTOMER') ? 'Mis Reservas Activas' : 'Total Reservas'}
              value={user?.roles.includes('CUSTOMER') ? myActiveReservations : reservations.length}
              prefix={<CalendarOutlined style={{ color: '#fa8c16' }} />}
              loading={user?.roles.includes('CUSTOMER') ? myReservationsLoading : reservationsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ingresos Totales"
              value={totalRevenue}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              loading={reservationsLoading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Acciones Rápidas" style={{ height: '200px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block icon={<CarOutlined />}>
                Ver Vehículos
              </Button>
              <Button block icon={<CalendarOutlined />}>
                Nueva Reserva
              </Button>
              <Button block icon={<UserOutlined />}>
                Gestionar Clientes
              </Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Estado de la Flota" style={{ height: '200px' }}>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff7e6', borderRadius: '4px' }}>
                  <Text strong style={{ color: '#faad14' }}>{reserved}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Reservados</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff1f0', borderRadius: '4px' }}>
                  <Text strong style={{ color: '#ff4d4f' }}>{rented}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Alquilados</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f9f0ff', borderRadius: '4px' }}>
                  <Text strong style={{ color: '#722ed1' }}>{cleaning}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Limpieza</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f6ffed', borderRadius: '4px' }}>
                  <Text strong style={{ color: '#52c41a' }}>{availableVehicles}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Disponibles</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>🚗 Dashboard CarRental - ACTUALIZADO ✅</Title>
        <Text type="secondary">
          Bienvenido al sistema de gestión de alquiler de vehículos.
          <strong style={{ color: 'red' }}> → VER LAS 3 PESTAÑAS ABAJO ← </strong>
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        items={[
          {
            key: 'overview',
            label: (
              <span>
                <DollarOutlined />
                Resumen General
              </span>
            ),
            children: <OverviewContent />
          },
          {
            key: 'kanban',
            label: (
              <span>
                <AppstoreOutlined />
                Estado de Vehículos (Kanban)
              </span>
            ),
            children: (
              <div style={{ minHeight: '500px' }}>
                <DragDropKanban vehicles={vehicles} />
              </div>
            )
          },
          {
            key: 'calendar',
            label: (
              <span>
                <CalendarOutlined />
                Calendario de Eventos
              </span>
            ),
            children: <VehicleCalendar />
          }
        ]}
      />

      {/* Información contextual */}
      {activeTab === 'kanban' && (
        <Card
          title="💡 Vista Kanban"
          size="small"
          style={{
            marginTop: 16,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none'
          }}
          headStyle={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
          bodyStyle={{ color: 'white' }}
        >
          <Text style={{ color: 'white' }}>
            <strong>Vista en tiempo real del estado de tus vehículos:</strong>
            <br />
            • Arrastra los vehículos entre columnas para cambiar su estado automáticamente
            <br />
            • Reservado → Alquilado → Devuelto/Para lavar → Disponible
            <br />
            • Los cambios se guardan instantáneamente en la base de datos
          </Text>
        </Card>
      )}

      {activeTab === 'calendar' && (
        <Card
          title="📅 Calendario de Eventos"
          size="small"
          style={{
            marginTop: 16,
            background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
            color: 'white',
            border: 'none'
          }}
          headStyle={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
          bodyStyle={{ color: 'white' }}
        >
          <Text style={{ color: 'white' }}>
            <strong>Visualiza todas las actividades de tu flota:</strong>
            <br />
            • 🚗 Eventos de alquiler con fechas y clientes
            <br />
            • 🔧 Mantenimientos programados y preventivos
            <br />
            • 🧽 Tiempos de limpieza post-alquiler
            <br />
            • Filtra por vehículo específico para ver su cronograma
          </Text>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;