import React from 'react';
import { Row, Col, Card, Statistic, Typography, Space, Button } from 'antd';
import {
  CarOutlined,
  TeamOutlined,
  DollarCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const statsData = [
    {
      title: 'Total Vehículos',
      value: 0,
      icon: <CarOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff'
    },
    {
      title: 'Vehículos Disponibles',
      value: 0,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a'
    },
    {
      title: 'Vehículos Alquilados',
      value: 0,
      icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
      color: '#faad14'
    },
    {
      title: 'En Mantenimiento',
      value: 0,
      icon: <ToolOutlined style={{ color: '#ff4d4f' }} />,
      color: '#ff4d4f'
    }
  ];

  const clientsData = [
    {
      title: 'Total Clientes',
      value: 0,
      icon: <TeamOutlined style={{ color: '#722ed1' }} />,
      color: '#722ed1'
    },
    {
      title: 'Clientes Activos',
      value: 0,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a'
    }
  ];

  const revenueData = [
    {
      title: 'Ingresos del Mes',
      value: 0,
      prefix: '$',
      icon: <DollarCircleOutlined style={{ color: '#13c2c2' }} />,
      color: '#13c2c2'
    },
    {
      title: 'Ingresos del Año',
      value: 0,
      prefix: '$',
      icon: <DollarCircleOutlined style={{ color: '#13c2c2' }} />,
      color: '#13c2c2'
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Dashboard</Title>
        <Paragraph type="secondary">
          Bienvenido al sistema de gestión de alquiler de vehículos. Aquí puedes ver un resumen general de tu negocio.
        </Paragraph>
      </div>

      {/* Vehicle Statistics */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={3}>Vehículos</Title>
        <Row gutter={[16, 16]}>
          {statsData.map((stat, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card
                style={{
                  borderLeft: `4px solid ${stat.color}`,
                  height: '120px'
                }}
                bodyStyle={{ padding: '20px' }}
              >
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.icon}
                  valueStyle={{ color: stat.color }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Clients and Revenue */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={12}>
          <Title level={3}>Clientes</Title>
          <Row gutter={[16, 16]}>
            {clientsData.map((stat, index) => (
              <Col xs={24} sm={12} key={index}>
                <Card
                  style={{
                    borderLeft: `4px solid ${stat.color}`,
                    height: '120px'
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.icon}
                    valueStyle={{ color: stat.color }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        <Col xs={24} md={12}>
          <Title level={3}>Ingresos</Title>
          <Row gutter={[16, 16]}>
            {revenueData.map((stat, index) => (
              <Col xs={24} sm={12} key={index}>
                <Card
                  style={{
                    borderLeft: `4px solid ${stat.color}`,
                    height: '120px'
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.icon}
                    valueStyle={{ color: stat.color }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Acciones Rápidas" style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<CarOutlined />}
            onClick={() => navigate('/vehicles')}
          >
            Gestionar Vehículos
          </Button>
          <Button
            icon={<TeamOutlined />}
            onClick={() => navigate('/clients')}
          >
            Gestionar Clientes
          </Button>
          <Button
            icon={<CarOutlined />}
            onClick={() => navigate('/vehicles?action=add')}
          >
            Agregar Vehículo
          </Button>
          <Button
            icon={<TeamOutlined />}
            onClick={() => navigate('/clients?action=add')}
          >
            Agregar Cliente
          </Button>
        </Space>
      </Card>

      {/* Getting Started */}
      <Card title="Primeros Pasos" style={{ marginBottom: '24px' }}>
        <Paragraph>
          Para comenzar a usar el sistema, sigue estos pasos:
        </Paragraph>
        <ol>
          <li>Agrega algunos vehículos a tu flota en la sección de <strong>Vehículos</strong></li>
          <li>Registra tus clientes en la sección de <strong>Clientes</strong></li>
          <li>Una vez que tengas vehículos y clientes, podrás comenzar a gestionar alquileres</li>
        </ol>
        <Space>
          <Button type="primary" onClick={() => navigate('/vehicles')}>
            Comenzar con Vehículos
          </Button>
          <Button onClick={() => navigate('/clients')}>
            Comenzar con Clientes
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default DashboardPage;