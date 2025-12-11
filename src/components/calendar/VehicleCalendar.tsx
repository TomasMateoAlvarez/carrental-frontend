import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Card, Typography, Switch, Row, Col, Tag, Modal, Descriptions, Avatar, Button, Select } from 'antd';
import { CarOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/es';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { vehiclesAPI } from '../../services/api';
import '../../styles/calendar.css';

// Configure moment for Spanish locale
moment.locale('es');
const localizer = momentLocalizer(moment);

const { Title, Text } = Typography;
const { Option } = Select;

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

interface VehicleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'reservation' | 'maintenance' | 'cleaning' | 'blocked';
    vehicleId: number;
    vehicle: Vehicle;
    customerName?: string;
    description?: string;
    status: string;
  };
}

interface EventDetail {
  event: VehicleEvent;
  visible: boolean;
}

const VehicleCalendar: React.FC = () => {
  const [showVehicleEvents, setShowVehicleEvents] = useState(true);
  const [selectedEventDetail, setSelectedEventDetail] = useState<EventDetail>({
    event: null as any,
    visible: false
  });
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<number | 'all'>('all');
  const [events, setEvents] = useState<VehicleEvent[]>([]);

  // Fetch vehicles data
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesAPI.getAll,
  });

  // Generate mock events based on vehicles
  useEffect(() => {
    if (vehicles.length > 0) {
      const mockEvents: VehicleEvent[] = [];

      // Sample reservations
      const sampleReservations = [
        {
          vehicleId: 1,
          customerName: 'Carlos Rodríguez',
          start: new Date(2025, 10, 26, 10, 0), // Nov 26, 10:00
          end: new Date(2025, 10, 30, 18, 0),   // Nov 30, 18:00
          status: 'CONFIRMED'
        },
        {
          vehicleId: 2,
          customerName: 'María González',
          start: new Date(2025, 10, 25, 14, 0), // Nov 25, 14:00
          end: new Date(2025, 10, 28, 12, 0),   // Nov 28, 12:00
          status: 'ACTIVE'
        },
        {
          vehicleId: 3,
          customerName: 'Luis Martínez',
          start: new Date(2025, 10, 24, 9, 0),  // Nov 24, 09:00
          end: new Date(2025, 10, 26, 17, 0),   // Nov 26, 17:00
          status: 'COMPLETED'
        },
        {
          vehicleId: 4,
          customerName: 'Ana Silva',
          start: new Date(2025, 10, 27, 11, 0), // Nov 27, 11:00
          end: new Date(2025, 11, 1, 16, 0),    // Dec 1, 16:00
          status: 'CONFIRMED'
        },
        {
          vehicleId: 5,
          customerName: 'Pedro López',
          start: new Date(2025, 10, 26, 15, 0), // Nov 26, 15:00
          end: new Date(2025, 10, 29, 14, 0),   // Nov 29, 14:00
          status: 'CONFIRMED'
        },
        {
          vehicleId: 1,
          customerName: 'Elena Ramírez',
          start: new Date(2025, 11, 2, 10, 0),  // Dec 2, 10:00
          end: new Date(2025, 11, 5, 18, 0),    // Dec 5, 18:00
          status: 'CONFIRMED'
        }
      ];

      // Sample maintenance events
      const sampleMaintenanceEvents = [
        {
          vehicleId: 2,
          description: 'Mantenimiento preventivo - 10,000 km',
          start: new Date(2025, 10, 29, 8, 0),  // Nov 29, 08:00
          end: new Date(2025, 10, 29, 17, 0),   // Nov 29, 17:00
        },
        {
          vehicleId: 3,
          description: 'Cambio de llantas',
          start: new Date(2025, 10, 27, 9, 0),  // Nov 27, 09:00
          end: new Date(2025, 10, 27, 15, 0),   // Nov 27, 15:00
        },
        {
          vehicleId: 4,
          description: 'Revisión técnica',
          start: new Date(2025, 11, 3, 10, 0),  // Dec 3, 10:00
          end: new Date(2025, 11, 3, 16, 0),    // Dec 3, 16:00
        }
      ];

      // Convert reservations to events
      sampleReservations.forEach((reservation, index) => {
        const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
        if (vehicle) {
          mockEvents.push({
            id: `reservation-${index}`,
            title: `🚗 ${vehicle.licensePlate} - ${reservation.customerName}`,
            start: reservation.start,
            end: reservation.end,
            resource: {
              type: 'reservation',
              vehicleId: reservation.vehicleId,
              vehicle: vehicle,
              customerName: reservation.customerName,
              status: reservation.status,
              description: `Alquiler de ${vehicle.brand} ${vehicle.model} por ${reservation.customerName}`
            }
          });
        }
      });

      // Convert maintenance to events
      sampleMaintenanceEvents.forEach((maintenance, index) => {
        const vehicle = vehicles.find(v => v.id === maintenance.vehicleId);
        if (vehicle) {
          mockEvents.push({
            id: `maintenance-${index}`,
            title: `🔧 ${vehicle.licensePlate} - Mantenimiento`,
            start: maintenance.start,
            end: maintenance.end,
            resource: {
              type: 'maintenance',
              vehicleId: maintenance.vehicleId,
              vehicle: vehicle,
              description: maintenance.description,
              status: 'SCHEDULED'
            }
          });
        }
      });

      // Add cleaning events (day after rental ends)
      sampleReservations.forEach((reservation, index) => {
        const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
        if (vehicle && reservation.status === 'COMPLETED') {
          const cleaningStart = new Date(reservation.end);
          cleaningStart.setDate(cleaningStart.getDate());
          const cleaningEnd = new Date(cleaningStart);
          cleaningEnd.setHours(cleaningEnd.getHours() + 2); // 2 hours cleaning

          mockEvents.push({
            id: `cleaning-${index}`,
            title: `🧽 ${vehicle.licensePlate} - Limpieza`,
            start: cleaningStart,
            end: cleaningEnd,
            resource: {
              type: 'cleaning',
              vehicleId: reservation.vehicleId,
              vehicle: vehicle,
              description: `Limpieza post-alquiler`,
              status: 'PENDING'
            }
          });
        }
      });

      setEvents(mockEvents);
    }
  }, [vehicles]);

  // Filter events based on selected vehicle
  const filteredEvents = events.filter(event =>
    showVehicleEvents &&
    (selectedVehicleFilter === 'all' || event.resource.vehicleId === selectedVehicleFilter)
  );

  const getEventStyle = (event: VehicleEvent) => {
    const baseStyle = {
      borderRadius: '4px',
      border: 'none',
      color: 'white',
      fontSize: '12px',
      fontWeight: '500',
    };

    switch (event.resource.type) {
      case 'reservation':
        return {
          ...baseStyle,
          backgroundColor: event.resource.status === 'ACTIVE' ? '#ff4d4f' :
                          event.resource.status === 'COMPLETED' ? '#722ed1' : '#faad14'
        };
      case 'maintenance':
        return {
          ...baseStyle,
          backgroundColor: '#13c2c2'
        };
      case 'cleaning':
        return {
          ...baseStyle,
          backgroundColor: '#722ed1'
        };
      case 'blocked':
        return {
          ...baseStyle,
          backgroundColor: '#666666'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#1890ff'
        };
    }
  };

  const handleEventSelect = (event: VehicleEvent) => {
    setSelectedEventDetail({
      event,
      visible: true
    });
  };

  const EventDetailModal = () => {
    const { event, visible } = selectedEventDetail;
    if (!event) return null;

    return (
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              icon={
                event.resource.type === 'reservation' ? <CarOutlined /> :
                event.resource.type === 'maintenance' ? <CarOutlined /> :
                <CarOutlined />
              }
              size="small"
              style={{ marginRight: 8 }}
            />
            Detalles del Evento
          </div>
        }
        open={visible}
        onCancel={() => setSelectedEventDetail({ event: null as any, visible: false })}
        footer={[
          <Button key="close" onClick={() => setSelectedEventDetail({ event: null as any, visible: false })}>
            Cerrar
          </Button>
        ]}
        width={600}
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Tipo">
            <Tag color={
              event.resource.type === 'reservation' ? 'blue' :
              event.resource.type === 'maintenance' ? 'orange' :
              event.resource.type === 'cleaning' ? 'purple' : 'default'
            }>
              {event.resource.type === 'reservation' ? 'Reservación' :
               event.resource.type === 'maintenance' ? 'Mantenimiento' :
               event.resource.type === 'cleaning' ? 'Limpieza' : 'Bloqueado'}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Vehículo">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CarOutlined style={{ marginRight: 8, color: '#666' }} />
              <span>
                <strong>{event.resource.vehicle.licensePlate}</strong> - {' '}
                {event.resource.vehicle.brand} {event.resource.vehicle.model} ({event.resource.vehicle.year})
              </span>
            </div>
          </Descriptions.Item>

          {event.resource.customerName && (
            <Descriptions.Item label="Cliente">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <UserOutlined style={{ marginRight: 8, color: '#666' }} />
                {event.resource.customerName}
              </div>
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Fecha y Hora">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarOutlined style={{ marginRight: 8, color: '#666' }} />
              <div>
                <div><strong>Inicio:</strong> {dayjs(event.start).format('DD/MM/YYYY HH:mm')}</div>
                <div><strong>Fin:</strong> {dayjs(event.end).format('DD/MM/YYYY HH:mm')}</div>
              </div>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Duración">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ClockCircleOutlined style={{ marginRight: 8, color: '#666' }} />
              {dayjs(event.end).diff(dayjs(event.start), 'day')} días, {' '}
              {dayjs(event.end).diff(dayjs(event.start), 'hour') % 24} horas
            </div>
          </Descriptions.Item>

          {event.resource.description && (
            <Descriptions.Item label="Descripción">
              {event.resource.description}
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Estado">
            <Tag color={
              event.resource.status === 'ACTIVE' ? 'red' :
              event.resource.status === 'CONFIRMED' ? 'orange' :
              event.resource.status === 'COMPLETED' ? 'green' :
              event.resource.status === 'SCHEDULED' ? 'blue' : 'default'
            }>
              {event.resource.status === 'ACTIVE' ? 'Activo' :
               event.resource.status === 'CONFIRMED' ? 'Confirmado' :
               event.resource.status === 'COMPLETED' ? 'Completado' :
               event.resource.status === 'SCHEDULED' ? 'Programado' :
               event.resource.status === 'PENDING' ? 'Pendiente' : event.resource.status}
            </Tag>
          </Descriptions.Item>

          {event.resource.type === 'reservation' && (
            <Descriptions.Item label="Tarifa Diaria">
              ${event.resource.vehicle.dailyRate}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Modal>
    );
  };

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>
              Calendario de Eventos de Vehículos
            </Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text>Filtrar por vehículo:</Text>
                <Select
                  style={{ width: 200 }}
                  value={selectedVehicleFilter}
                  onChange={setSelectedVehicleFilter}
                >
                  <Option value="all">Todos los vehículos</Option>
                  {vehicles.map(vehicle => (
                    <Option key={vehicle.id} value={vehicle.id}>
                      {vehicle.licensePlate} - {vehicle.brand} {vehicle.model}
                    </Option>
                  ))}
                </Select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text>Mostrar eventos:</Text>
                <Switch
                  checked={showVehicleEvents}
                  onChange={setShowVehicleEvents}
                  checkedChildren="SÍ"
                  unCheckedChildren="NO"
                />
              </div>
            </div>
          </div>
        }
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col>
              <Tag color="orange">🚗 Reservado</Tag>
            </Col>
            <Col>
              <Tag color="red">🚗 Alquilado</Tag>
            </Col>
            <Col>
              <Tag color="purple">🧽 Limpieza</Tag>
            </Col>
            <Col>
              <Tag color="cyan">🔧 Mantenimiento</Tag>
            </Col>
          </Row>
        </div>

        <div style={{ height: 500 }}>
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleEventSelect}
            eventPropGetter={(event) => ({
              style: getEventStyle(event)
            })}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            messages={{
              next: 'Siguiente',
              previous: 'Anterior',
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda',
              date: 'Fecha',
              time: 'Hora',
              event: 'Evento',
              noEventsInRange: 'No hay eventos en este rango de fechas',
              showMore: (total) => `+ Ver ${total} más`
            }}
            formats={{
              dateFormat: 'DD',
              dayFormat: (date, culture, localizer) =>
                localizer?.format(date, 'dddd', culture) || '',
              dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
                `${localizer?.format(start, 'MMMM DD', culture)} - ${localizer?.format(end, 'MMMM DD YYYY', culture)}`,
              monthHeaderFormat: (date, culture, localizer) =>
                localizer?.format(date, 'MMMM YYYY', culture) || '',
              dayHeaderFormat: (date, culture, localizer) =>
                localizer?.format(date, 'dddd, MMMM DD YYYY', culture) || '',
              agendaDateFormat: (date, culture, localizer) =>
                localizer?.format(date, 'dddd MMM DD', culture) || '',
              agendaTimeFormat: (date, culture, localizer) =>
                localizer?.format(date, 'HH:mm', culture) || '',
              agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
                `${localizer?.format(start, 'HH:mm', culture)} - ${localizer?.format(end, 'HH:mm', culture)}`
            }}
          />
        </div>
      </Card>

      <EventDetailModal />
    </div>
  );
};

export default VehicleCalendar;