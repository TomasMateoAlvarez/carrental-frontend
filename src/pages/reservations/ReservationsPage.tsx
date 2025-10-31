import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Form,
  DatePicker,
  Select,
  Input,
  message,
  Row,
  Col,
  Descriptions,
  Tooltip
} from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CarOutlined,
  SearchOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsAPI, vehiclesAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import type { ReservationResponse, CreateReservationRequest, ReservationStatus } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ReservationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedReservation, setSelectedReservation] = useState<ReservationResponse | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedDates, setSelectedDates] = useState<[any, any] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchText, setSearchText] = useState<string>('');

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: user?.roles.includes('ADMIN') || user?.roles.includes('EMPLOYEE')
      ? reservationsAPI.getAll
      : reservationsAPI.getMyReservations,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesAPI.getAll,
  });

  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');

  const createMutation = useMutation({
    mutationFn: reservationsAPI.create,
    onSuccess: (data) => {
      message.success({
        content: `Reserva creada exitosamente. Código: ${data.reservationCode}`,
        duration: 5,
      });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setIsModalVisible(false);
      form.resetFields();
      setSelectedVehicle(null);
      setSelectedDates(null);
    },
    onError: (error: any) => {
      message.error({
        content: `Error al crear la reserva: ${error.response?.data?.message || error.message}`,
        duration: 5,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      reservationsAPI.update(id, status),
    onSuccess: (data) => {
      message.success({
        content: `Reserva ${data.reservationCode} actualizada a ${getStatusText(data.status)}`,
        duration: 4,
      });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error: any) => {
      message.error({
        content: `Error al actualizar la reserva: ${error.response?.data?.message || error.message}`,
        duration: 4,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: reservationsAPI.delete,
    onSuccess: () => {
      message.success('Reserva eliminada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: () => {
      message.error('Error al eliminar la reserva');
    },
  });

  const getStatusColor = (status: ReservationStatus): string => {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'CONFIRMED': return 'blue';
      case 'IN_PROGRESS': return 'green';
      case 'COMPLETED': return 'cyan';
      case 'CANCELLED': return 'red';
      case 'NO_SHOW': return 'purple';
      default: return 'default';
    }
  };

  const getStatusText = (status: ReservationStatus): string => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'CONFIRMED': return 'Confirmada';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'COMPLETED': return 'Completada';
      case 'CANCELLED': return 'Cancelada';
      case 'NO_SHOW': return 'No Show';
      default: return status;
    }
  };

  const handleSubmit = (values: any) => {
    console.log('🚀 FORM SUBMITTED - handleSubmit called!');
    console.log('📋 Form values received:', values);

    // Basic validation: ensure dateRange exists
    if (!values.dateRange || !Array.isArray(values.dateRange) || values.dateRange.length !== 2) {
      message.error('Por favor selecciona las fechas de inicio y fin');
      return;
    }

    const [startDate, endDate] = values.dateRange;

    // Ensure required fields are present
    if (!values.vehicleId) {
      message.error('Por favor selecciona un vehículo');
      return;
    }

    if (!values.pickupLocation) {
      message.error('Por favor especifica la ubicación de recogida');
      return;
    }

    if (!values.returnLocation) {
      message.error('Por favor especifica la ubicación de devolución');
      return;
    }

    // Additional validations
    const today = dayjs();
    const daysDiff = endDate.diff(startDate, 'days');

    if (startDate.isBefore(today, 'day')) {
      message.error('La fecha de inicio no puede ser anterior a hoy');
      return;
    }

    if (daysDiff < 0) {
      message.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    if (daysDiff > 365) {
      message.error('La reserva no puede ser mayor a 365 días');
      return;
    }

    // Create reservation data directly (like VehicleForm pattern)
    const reservationData: CreateReservationRequest = {
      vehicleId: values.vehicleId,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      pickupLocation: values.pickupLocation,
      returnLocation: values.returnLocation,
      specialRequests: values.specialRequests || '', // Default to empty string if not provided
    };

    console.log('Submitting reservation data:', reservationData);
    createMutation.mutate(reservationData);
  };

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

    Modal.confirm({
      title: `¿Estás seguro de que quieres ${getActionText(newStatus)} esta reserva?`,
      content: 'Esta acción actualizará el estado de la reserva.',
      okText: 'Sí, confirmar',
      cancelText: 'Cancelar',
      onOk: () => updateMutation.mutate({ id: reservationId, status: newStatus }),
    });
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '¿Estás seguro de que quieres eliminar esta reserva?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const canManageReservations = user?.roles.includes('ADMIN') || user?.roles.includes('EMPLOYEE');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Código copiado al portapapeles');
    } catch (error) {
      message.error('Error al copiar el código');
    }
  };

  // Calculate total price for reservation
  const calculateTotal = () => {
    if (!selectedVehicle || !selectedDates) return 0;
    const [startDate, endDate] = selectedDates;
    const days = Math.max(1, endDate.diff(startDate, 'days') + 1);
    return days * selectedVehicle.dailyRate;
  };

  const handleVehicleChange = (vehicleId: number) => {
    const vehicle = availableVehicles.find(v => v.id === vehicleId);
    setSelectedVehicle(vehicle);
  };

  const handleDateChange = (dates: any) => {
    setSelectedDates(dates);
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

  const columns = [
    {
      title: 'Código',
      dataIndex: 'reservationCode',
      key: 'reservationCode',
      render: (code: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong>{code}</strong>
          <Tooltip title="Copiar código">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(code)}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Vehículo',
      key: 'vehicle',
      render: (_: any, record: ReservationResponse) => (
        <div>
          <div><strong>{record.vehicleBrand} {record.vehicleModel}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.vehicleLicensePlate}</div>
        </div>
      ),
    },
    {
      title: 'Cliente',
      dataIndex: 'userFullName',
      key: 'userFullName',
      render: (name: string, record: ReservationResponse) => (
        <div>
          <div>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Fechas',
      key: 'dates',
      render: (_: any, record: ReservationResponse) => (
        <div>
          <div>{dayjs(record.startDate).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            hasta {dayjs(record.endDate).format('DD/MM/YYYY')}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.totalDays} día{record.totalDays !== 1 ? 's' : ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: ReservationStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Monto',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => <strong>${amount.toFixed(2)}</strong>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: ReservationResponse) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedReservation(record);
              setIsDetailModalVisible(true);
            }}
          />
          {canManageReservations && record.status === 'PENDING' && (
            <Button
              type="text"
              style={{ color: 'green' }}
              onClick={() => handleStatusUpdate(record.id, 'CONFIRMED')}
            >
              Confirmar
            </Button>
          )}
          {canManageReservations && record.status === 'CONFIRMED' && (
            <Button
              type="text"
              style={{ color: 'blue' }}
              onClick={() => handleStatusUpdate(record.id, 'IN_PROGRESS')}
            >
              Iniciar
            </Button>
          )}
          {canManageReservations && record.status === 'IN_PROGRESS' && (
            <Button
              type="text"
              style={{ color: 'cyan' }}
              onClick={() => handleStatusUpdate(record.id, 'COMPLETED')}
            >
              Completar
            </Button>
          )}
          {(canManageReservations || record.userId === user?.userId) &&
           ['PENDING', 'CONFIRMED'].includes(record.status) && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          {canManageReservations ? 'Gestión de Reservas' : 'Mis Reservas'}
        </Title>
      </div>

      <Card>
        <div style={{ marginBottom: '16px' }}>
          {/* Statistics Row */}
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={6}>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                  {reservations.length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Total Reservas</div>
              </div>
            </Col>
            <Col xs={24} sm={6}>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f6f6f6', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                  {reservations.filter(r => r.status === 'CONFIRMED').length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Confirmadas</div>
              </div>
            </Col>
            <Col xs={24} sm={6}>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fff7e6', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fa8c16' }}>
                  {reservations.filter(r => r.status === 'PENDING').length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Pendientes</div>
              </div>
            </Col>
            <Col xs={24} sm={6}>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f9f0ff', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#722ed1' }}>
                  {reservations.filter(r => r.status === 'IN_PROGRESS').length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>En Progreso</div>
              </div>
            </Col>
          </Row>

          {/* Controls Row */}
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={8}>
              <Input
                placeholder="Buscar por código, cliente, vehículo..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8}>
              <Space>
                <span>Estado:</span>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: 150 }}
                >
                  <Option value="ALL">Todos</Option>
                  <Option value="PENDING">Pendientes</Option>
                  <Option value="CONFIRMED">Confirmadas</Option>
                  <Option value="IN_PROGRESS">En Progreso</Option>
                  <Option value="COMPLETED">Completadas</Option>
                  <Option value="CANCELLED">Canceladas</Option>
                  <Option value="NO_SHOW">No Show</Option>
                </Select>
              </Space>
            </Col>
            <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  form.resetFields();
                  setSelectedVehicle(null);
                  setSelectedDates(null);
                  setIsModalVisible(true);
                }}
              >
                Nueva Reserva
              </Button>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredReservations}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} reservas`,
          }}
        />
      </Card>

      {/* Modal para crear reserva */}
      <Modal
        title="Nueva Reserva"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onFinishFailed={(errorInfo) => {
            console.log('❌ FORM VALIDATION FAILED:', errorInfo);
            message.error('Por favor completa todos los campos requeridos');
          }}
        >
          <Form.Item
            name="vehicleId"
            label="Vehículo"
            rules={[{ required: true, message: 'Seleccione un vehículo' }]}
          >
            <Select
              placeholder="Seleccionar vehículo disponible"
              onChange={handleVehicleChange}
            >
              {availableVehicles.map(vehicle => (
                <Option key={vehicle.id} value={vehicle.id}>
                  <div>
                    <strong>{vehicle.brand} {vehicle.model}</strong> - {vehicle.licensePlate}
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      ${vehicle.dailyRate}/día | {vehicle.seats} asientos | {vehicle.category}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Fechas de alquiler"
            rules={[{ required: true, message: 'Seleccione las fechas' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              onChange={handleDateChange}
            />
          </Form.Item>

          {/* Price Summary */}
          {selectedVehicle && selectedDates && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f6f6f6',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>Resumen de Precio</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Vehículo:</span>
                <span><strong>{selectedVehicle.brand} {selectedVehicle.model}</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Tarifa por día:</span>
                <span>${selectedVehicle.dailyRate.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Días:</span>
                <span>{Math.max(1, selectedDates[1].diff(selectedDates[0], 'days') + 1)}</span>
              </div>
              <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #d9d9d9' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                <span><strong>Total:</strong></span>
                <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pickupLocation"
                label="Lugar de recogida"
                rules={[
                  { required: true, message: 'El lugar de recogida es obligatorio' },
                  { min: 3, message: 'El lugar de recogida debe tener al menos 3 caracteres' },
                  { max: 200, message: 'El lugar de recogida no puede exceder 200 caracteres' }
                ]}
              >
                <Input placeholder="Dirección de recogida" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="returnLocation"
                label="Lugar de devolución"
                rules={[
                  { required: true, message: 'El lugar de devolución es obligatorio' },
                  { min: 3, message: 'El lugar de devolución debe tener al menos 3 caracteres' },
                  { max: 200, message: 'El lugar de devolución no puede exceder 200 caracteres' }
                ]}
              >
                <Input placeholder="Dirección de devolución" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="specialRequests"
            label="Solicitudes especiales"
          >
            <Input.TextArea
              rows={3}
              placeholder="Cualquier solicitud especial o comentario"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending}
              >
                Crear Reserva
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para ver detalles de la reserva */}
      <Modal
        title="Detalles de la Reserva"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={700}
      >
        {selectedReservation && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Código de Reserva" span={2}>
              <strong>{selectedReservation.reservationCode}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Estado" span={2}>
              <Tag color={getStatusColor(selectedReservation.status)}>
                {getStatusText(selectedReservation.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Cliente">{selectedReservation.userFullName}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedReservation.userEmail}</Descriptions.Item>
            <Descriptions.Item label="Vehículo" span={2}>
              <Space>
                <CarOutlined />
                {selectedReservation.vehicleBrand} {selectedReservation.vehicleModel} ({selectedReservation.vehicleLicensePlate})
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de inicio">{dayjs(selectedReservation.startDate).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Fecha de fin">{dayjs(selectedReservation.endDate).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Total de días">{selectedReservation.totalDays} día{selectedReservation.totalDays !== 1 ? 's' : ''}</Descriptions.Item>
            <Descriptions.Item label="Tarifa diaria">${selectedReservation.dailyRate.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Monto total" span={2}>
              <strong>${selectedReservation.totalAmount.toFixed(2)}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Lugar de recogida">{selectedReservation.pickupLocation || 'No especificado'}</Descriptions.Item>
            <Descriptions.Item label="Lugar de devolución">{selectedReservation.returnLocation || 'No especificado'}</Descriptions.Item>
            <Descriptions.Item label="Solicitudes especiales" span={2}>
              {selectedReservation.specialRequests || 'Ninguna'}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de creación">{dayjs(selectedReservation.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
            <Descriptions.Item label="Fecha de confirmación">{selectedReservation.confirmedAt ? dayjs(selectedReservation.confirmedAt).format('DD/MM/YYYY HH:mm') : 'No confirmada'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ReservationsPage;