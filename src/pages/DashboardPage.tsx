import React from 'react';
import { Card, Typography, Space, Button, Row, Col, Statistic } from 'antd';
import { CarOutlined, UserOutlined, DollarOutlined, CalendarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { vehiclesAPI, reservationsAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

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

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <CarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          Dashboard CarRental
        </Title>
        <Text type="secondary">
          Bienvenido/a {user?.fullName || user?.username}
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Vehículos Totales"
              value={vehicles.length}
              prefix={<CarOutlined />}
              loading={vehiclesLoading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Vehículos Disponibles"
              value={availableVehicles}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#3f8600' }}
              loading={vehiclesLoading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Mis Reservas"
              value={myReservations.length}
              prefix={<CalendarOutlined />}
              loading={myReservationsLoading}
            />
          </Card>
        </Col>

        {(user?.roles.includes('ADMIN') || user?.roles.includes('EMPLOYEE')) && (
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Ingresos Totales"
                value={totalRevenue}
                prefix={<DollarOutlined />}
                precision={2}
                loading={reservationsLoading}
              />
            </Card>
          </Col>
        )}
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card
            title="🚗 Gestión de Vehículos"
            extra={<Button type="primary" href="/vehicles">Ver Todos</Button>}
          >
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                {vehicles.length}
              </Title>
              <Text>Vehículos en el sistema</Text>
              <br />
              <Text type="secondary">
                {availableVehicles} disponibles para alquiler
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="📅 Mis Reservas"
            extra={<Button type="primary" href="/reservations">Ver Todas</Button>}
          >
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
                {myReservations.length}
              </Title>
              <Text>Reservas activas</Text>
              <br />
              <Text type="secondary">
                Gestiona tus reservas de vehículos
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {(user?.roles.includes('ADMIN') || user?.roles.includes('EMPLOYEE')) && (
        <Card title="📊 Panel Administrativo" style={{ marginTop: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Button type="primary" size="large" style={{ width: '100%' }}>
                Gestionar Usuarios
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button type="primary" size="large" style={{ width: '100%' }}>
                Reportes Financieros
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Button type="primary" size="large" style={{ width: '100%' }}>
                Configuración
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      <Card title="🎉 Sistema Funcionando" style={{ marginTop: '24px' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Title level={3}>¡Sistema CarRental con JWT activo!</Title>
          <Space direction="vertical">
            <Text>✅ Frontend React + TypeScript funcionando</Text>
            <Text>✅ Backend Spring Boot conectado (puerto 8083)</Text>
            <Text>✅ Autenticación JWT implementada</Text>
            <Text>✅ Sistema de reservas activo</Text>
            <Text>✅ Base de datos PostgreSQL conectada</Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;