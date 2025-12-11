import React from 'react';
import {
  Descriptions,
  Tag,
  Typography,
  Space,
  Card,
  Row,
  Col,
  Divider,
  Avatar,
  Table,
  Statistic,
  Tabs,
  Alert,
  Button,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  IdcardOutlined,
  HomeOutlined,
  CarOutlined,
  DollarOutlined,
  HistoryOutlined,
  ContactsOutlined,
} from '@ant-design/icons';
import { format, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { customerAPI } from '../../services/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Inline type definitions to avoid import issues
interface CustomerResponse {
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

interface CustomerHistory {
  customerId: number;
  customerCode: string;
  customerName: string;
  totalReservations: number;
  totalSpent: number;
  averageRentalDays: number;
  lastRentalDate?: string;
  customerLifetimeValue: number;
  segment: CustomerSegment;
  reservationHistory: ReservationSummaryDTO[];
  reservationsThisYear?: number;
  reservationsThisMonth?: number;
  spentThisYear?: number;
  spentThisMonth?: number;
  favoriteVehicleCategory?: string;
  mostUsedPickupLocation?: string;
  averageReservationValue?: number;
  daysSinceLastRental?: number;
}

interface ReservationSummaryDTO {
  id: number;
  reservationCode: string;
  vehicleInfo: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: ReservationStatus;
  createdAt: string;
}

enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

enum CustomerSegment {
  NEW = 'NEW',
  REGULAR = 'REGULAR',
  PREMIUM = 'PREMIUM',
  VIP = 'VIP',
  CORPORATE = 'CORPORATE'
}

enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

interface ClientDetailProps {
  client: CustomerResponse;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ client }) => {
  // Fetch customer history including reservations
  const { data: customerHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['customerHistory', client.id],
    queryFn: () => customerAPI.getHistory(client.id),
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    try {
      return differenceInYears(new Date(), new Date(birthDate));
    } catch {
      return null;
    }
  };

  // Define status display functions
  const getStatusDisplay = (status: CustomerStatus) => {
    switch (status) {
      case CustomerStatus.ACTIVE:
        return { color: 'green', text: 'Activo' };
      case CustomerStatus.INACTIVE:
        return { color: 'orange', text: 'Inactivo' };
      case CustomerStatus.SUSPENDED:
        return { color: 'red', text: 'Suspendido' };
      case CustomerStatus.BLOCKED:
        return { color: 'volcano', text: 'Bloqueado' };
      case CustomerStatus.PENDING_VERIFICATION:
        return { color: 'blue', text: 'Pendiente Verificación' };
      default:
        return { color: 'default', text: status };
    }
  };

  const getSegmentDisplay = (segment: CustomerSegment) => {
    switch (segment) {
      case CustomerSegment.NEW:
        return { color: 'cyan', text: 'Nuevo' };
      case CustomerSegment.REGULAR:
        return { color: 'blue', text: 'Regular' };
      case CustomerSegment.PREMIUM:
        return { color: 'gold', text: 'Premium' };
      case CustomerSegment.VIP:
        return { color: 'purple', text: 'VIP' };
      case CustomerSegment.CORPORATE:
        return { color: 'green', text: 'Corporativo' };
      default:
        return { color: 'default', text: segment };
    }
  };

  const getReservationStatusDisplay = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return { color: 'orange', text: 'Pendiente' };
      case ReservationStatus.CONFIRMED:
        return { color: 'blue', text: 'Confirmada' };
      case ReservationStatus.IN_PROGRESS:
        return { color: 'cyan', text: 'En Progreso' };
      case ReservationStatus.COMPLETED:
        return { color: 'green', text: 'Completada' };
      case ReservationStatus.CANCELLED:
        return { color: 'red', text: 'Cancelada' };
      case ReservationStatus.NO_SHOW:
        return { color: 'volcano', text: 'No Show' };
      default:
        return { color: 'default', text: status };
    }
  };

  const age = calculateAge(client.dateOfBirth);
  const statusDisplay = getStatusDisplay(client.status);
  const segmentDisplay = getSegmentDisplay(client.segment);

  // Prepare reservation history table columns
  const reservationColumns = [
    {
      title: 'Código',
      dataIndex: 'reservationCode',
      key: 'reservationCode',
      width: 120,
    },
    {
      title: 'Vehículo',
      key: 'vehicle',
      render: (record: any) => `${record.vehicleBrand} ${record.vehicleModel}`,
    },
    {
      title: 'Placa',
      dataIndex: 'vehicleLicensePlate',
      key: 'vehicleLicensePlate',
      width: 100,
    },
    {
      title: 'Fechas',
      key: 'dates',
      render: (record: any) => (
        <div>
          <div>{formatDate(record.startDate)} - {formatDate(record.endDate)}</div>
          <Text type="secondary">{record.totalDays} días</Text>
        </div>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: ReservationStatus) => {
        const display = getReservationStatusDisplay(status);
        return (
          <Tag color={display.color}>
            {display.text}
          </Tag>
        );
      },
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
      width: 100,
    },
    {
      title: 'Creada',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
      width: 100,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Avatar
          size={80}
          icon={<UserOutlined />}
          style={{
            backgroundColor: client.status === CustomerStatus.ACTIVE ? '#1890ff' : '#d9d9d9',
            marginBottom: '16px'
          }}
        />
        <Title level={3} style={{ margin: 0 }}>
          {client.fullName}
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
          Código: {client.customerCode}
        </Text>
        <Space>
          <Tag color={statusDisplay.color}>
            {statusDisplay.text}
          </Tag>
          <Tag color={segmentDisplay.color}>
            {segmentDisplay.text}
          </Tag>
          {age && (
            <Text type="secondary">{age} años</Text>
          )}
        </Space>
      </div>

      <Tabs defaultActiveKey="1">
        {/* Personal Information Tab */}
        <TabPane tab="Información Personal" key="1">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Contacto" style={{ marginBottom: '16px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    <Text strong>Email: </Text>
                    <Text copyable>{client.email}</Text>
                  </div>
                  <div>
                    <PhoneOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                    <Text strong>Teléfono: </Text>
                    <Text copyable>{client.phoneNumber}</Text>
                  </div>
                  {client.preferredLanguage && (
                    <div>
                      <Text strong>Idioma Preferido: </Text>
                      <Text>{client.preferredLanguage}</Text>
                    </div>
                  )}
                </Space>
              </Card>

              {/* Personal Details */}
              <Card title="Detalles Personales">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Fecha de Nacimiento">
                    <Space>
                      <CalendarOutlined />
                      {formatDate(client.dateOfBirth)}
                      {age && <Text type="secondary">({age} años)</Text>}
                    </Space>
                  </Descriptions.Item>
                  {client.gender && (
                    <Descriptions.Item label="Género">
                      {client.gender === 'M' ? 'Masculino' : client.gender === 'F' ? 'Femenino' : client.gender}
                    </Descriptions.Item>
                  )}
                  {client.nationality && (
                    <Descriptions.Item label="Nacionalidad">
                      {client.nationality}
                    </Descriptions.Item>
                  )}
                  {client.preferredPickupLocation && (
                    <Descriptions.Item label="Ubicación Preferida">
                      {client.preferredPickupLocation}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>

            <Col span={12}>
              {/* License Information */}
              <Card title="Licencia de Conducir" style={{ marginBottom: '16px' }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Número de Licencia">
                    <Space>
                      <IdcardOutlined />
                      <Text copyable>{client.licenseNumber}</Text>
                    </Space>
                  </Descriptions.Item>
                  {client.licenseClass && (
                    <Descriptions.Item label="Clase">{client.licenseClass}</Descriptions.Item>
                  )}
                  {client.licenseIssuedDate && (
                    <Descriptions.Item label="Fecha de Emisión">
                      {formatDate(client.licenseIssuedDate)}
                    </Descriptions.Item>
                  )}
                  {client.licenseExpiryDate && (
                    <Descriptions.Item label="Fecha de Vencimiento">
                      {formatDate(client.licenseExpiryDate)}
                    </Descriptions.Item>
                  )}
                  {client.licenseIssuingCountry && (
                    <Descriptions.Item label="País de Emisión">{client.licenseIssuingCountry}</Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* Address Information */}
              {(client.streetAddress || client.city || client.state || client.country) && (
                <Card title="Dirección">
                  <Space direction="vertical">
                    <HomeOutlined style={{ color: '#722ed1' }} />
                    {client.streetAddress && <Text>{client.streetAddress}</Text>}
                    {(client.city || client.state) && (
                      <Text>{client.city}{client.city && client.state && ', '}{client.state}</Text>
                    )}
                    {client.postalCode && <Text>Código Postal: {client.postalCode}</Text>}
                    {client.country && <Text>{client.country}</Text>}
                  </Space>
                </Card>
              )}
            </Col>
          </Row>
        </TabPane>

        {/* Emergency Contact Tab */}
        <TabPane tab="Contacto de Emergencia" key="2">
          <Card>
            {client.emergencyContactName ? (
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Nombre">
                  <Space>
                    <ContactsOutlined />
                    {client.emergencyContactName}
                  </Space>
                </Descriptions.Item>
                {client.emergencyContactPhone && (
                  <Descriptions.Item label="Teléfono">
                    <Text copyable>{client.emergencyContactPhone}</Text>
                  </Descriptions.Item>
                )}
                {client.emergencyContactRelationship && (
                  <Descriptions.Item label="Relación">
                    {client.emergencyContactRelationship}
                  </Descriptions.Item>
                )}
              </Descriptions>
            ) : (
              <Alert
                message="Sin Contacto de Emergencia"
                description="No se ha registrado información de contacto de emergencia para este cliente."
                type="warning"
                showIcon
              />
            )}
          </Card>
        </TabPane>

        {/* Business Analytics Tab */}
        <TabPane tab="Estadísticas" key="3">
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Reservaciones"
                  value={client.totalReservations}
                  prefix={<CarOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Gastado"
                  value={client.totalSpent}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Días Promedio de Renta"
                  value={client.averageRentalDays}
                  precision={1}
                  suffix="días"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Valor de Vida (CLV)"
                  value={client.customerLifetimeValue}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {client.lastRentalDate && (
            <Card title="Actividad Reciente" style={{ marginTop: '16px' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Última Reservación">
                  <Space>
                    <HistoryOutlined />
                    {formatDate(client.lastRentalDate)}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </TabPane>

        {/* Reservation History Tab */}
        <TabPane tab="Historial de Reservaciones" key="4">
          {historyLoading ? (
            <Card loading />
          ) : customerHistory?.reservationHistory?.length > 0 ? (
            <div>
              {/* Summary Statistics */}
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={6}>
                  <Card>
                    <Statistic title="Este Año" value={customerHistory.reservationsThisYear} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic title="Este Mes" value={customerHistory.reservationsThisMonth} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Gastado Este Año"
                      value={customerHistory.spentThisYear}
                      precision={2}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Valor Promedio"
                      value={customerHistory.averageReservationValue}
                      precision={2}
                      prefix="$"
                    />
                  </Card>
                </Col>
              </Row>

              {/* Reservation History Table */}
              <Card title="Historial Detallado">
                <Table
                  columns={reservationColumns}
                  dataSource={customerHistory.reservationHistory}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} de ${total} reservaciones`,
                  }}
                  scroll={{ x: 800 }}
                />
              </Card>
            </div>
          ) : (
            <Card>
              <Alert
                message="Sin Historial de Reservaciones"
                description="Este cliente aún no ha realizado ninguna reservación."
                type="info"
                showIcon
              />
            </Card>
          )}
        </TabPane>

        {/* Account Information Tab */}
        <TabPane tab="Información de Cuenta" key="5">
          <Card>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="ID del Cliente">
                <Text code>#{client.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Código del Cliente">
                <Text code>{client.customerCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={statusDisplay.color}>
                  {statusDisplay.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Segmento">
                <Tag color={segmentDisplay.color}>
                  {segmentDisplay.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Registro">
                <Space>
                  <CalendarOutlined />
                  {formatDateTime(client.createdAt)}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Última Actualización">
                <Space>
                  <CalendarOutlined />
                  {formatDateTime(client.updatedAt)}
                </Space>
              </Descriptions.Item>
              {client.lastActivityDate && (
                <Descriptions.Item label="Última Actividad">
                  <Space>
                    <HistoryOutlined />
                    {formatDateTime(client.lastActivityDate)}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            {client.notes && (
              <div style={{ marginTop: '16px' }}>
                <Title level={5}>Notas:</Title>
                <Text>{client.notes}</Text>
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* Status Alerts */}
      {client.status !== CustomerStatus.ACTIVE && (
        <Alert
          style={{ marginTop: '16px' }}
          message={`Cliente ${statusDisplay.text}`}
          description={
            client.status === CustomerStatus.INACTIVE
              ? 'Este cliente está inactivo temporalmente.'
              : client.status === CustomerStatus.SUSPENDED
              ? 'Este cliente ha sido suspendido y no puede realizar reservaciones.'
              : client.status === CustomerStatus.BLOCKED
              ? 'Este cliente ha sido bloqueado permanentemente.'
              : 'Este cliente requiere verificación antes de realizar reservaciones.'
          }
          type={client.status === CustomerStatus.PENDING_VERIFICATION ? 'warning' : 'error'}
          showIcon
        />
      )}
    </div>
  );
};

export default ClientDetail;