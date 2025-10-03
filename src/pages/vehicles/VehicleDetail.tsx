import React from 'react';
import {
  Descriptions,
  Tag,
  Typography,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Divider,
} from 'antd';
import {
  CarOutlined,
  CalendarOutlined,
  DollarOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Vehicle } from '../../types';
import { VehicleStatus } from '../../types';

const { Title, Text } = Typography;

interface VehicleDetailProps {
  vehicle: Vehicle;
}

const VehicleDetail: React.FC<VehicleDetailProps> = ({ vehicle }) => {
  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case VehicleStatus.AVAILABLE:
        return 'green';
      case VehicleStatus.RESERVED:
        return 'blue';
      case VehicleStatus.RENTED:
        return 'orange';
      case VehicleStatus.MAINTENANCE:
        return 'red';
      case VehicleStatus.OUT_OF_SERVICE:
        return 'default';
      default:
        return 'default';
    }
  };

  // Status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case VehicleStatus.AVAILABLE:
        return 'Disponible';
      case VehicleStatus.RESERVED:
        return 'Reservado';
      case VehicleStatus.RENTED:
        return 'Alquilado';
      case VehicleStatus.MAINTENANCE:
        return 'Mantenimiento';
      case VehicleStatus.OUT_OF_SERVICE:
        return 'Fuera de Servicio';
      default:
        return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const needsMaintenance = vehicle.nextMaintenanceDate &&
    new Date(vehicle.nextMaintenanceDate) <= new Date();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>
          {vehicle.brand} {vehicle.model} ({vehicle.year})
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          {vehicle.licensePlate}
        </Text>
      </div>

      {/* Status and Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Estado"
              value={getStatusText(vehicle.status)}
              prefix={<CarOutlined />}
              valueStyle={{
                color: getStatusColor(vehicle.status) === 'green' ? '#3f8600' :
                       getStatusColor(vehicle.status) === 'red' ? '#cf1322' :
                       getStatusColor(vehicle.status) === 'orange' ? '#d46b08' : '#1890ff',
                fontSize: window.innerWidth <= 576 ? '14px' : '24px'
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Tarifa Diaria"
              value={vehicle.dailyRate}
              prefix={<DollarOutlined />}
              suffix="USD"
              precision={2}
              valueStyle={{
                fontSize: window.innerWidth <= 576 ? '14px' : '24px'
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Kilometraje"
              value={vehicle.mileage}
              suffix="km"
              valueStyle={{
                fontSize: window.innerWidth <= 576 ? '14px' : '24px'
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Asientos"
              value={vehicle.seats}
              suffix="personas"
              valueStyle={{
                fontSize: window.innerWidth <= 576 ? '14px' : '24px'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Maintenance Alert */}
      {needsMaintenance && (
        <Card
          size="small"
          style={{
            marginBottom: '24px',
            borderColor: '#ff4d4f',
            backgroundColor: '#fff2f0'
          }}
        >
          <Space>
            <ToolOutlined style={{ color: '#ff4d4f' }} />
            <Text strong style={{ color: '#ff4d4f' }}>
              ¡Atención! Este vehículo necesita mantenimiento
            </Text>
          </Space>
        </Card>
      )}

      {/* Vehicle Information */}
      <Card title="Información del Vehículo" style={{ marginBottom: '16px' }}>
        <Descriptions
          column={{ xs: 1, sm: 1, md: 2 }}
          bordered
          size="small"
        >
          <Descriptions.Item label="Matrícula">
            <Text strong>{vehicle.licensePlate}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            <Tag color={getStatusColor(vehicle.status)}>
              {getStatusText(vehicle.status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Marca">
            {vehicle.brand}
          </Descriptions.Item>
          <Descriptions.Item label="Modelo">
            {vehicle.model}
          </Descriptions.Item>
          <Descriptions.Item label="Año">
            {vehicle.year}
          </Descriptions.Item>
          <Descriptions.Item label="Color">
            {vehicle.color || 'No especificado'}
          </Descriptions.Item>
          <Descriptions.Item label="Categoría">
            {vehicle.category || 'No especificada'}
          </Descriptions.Item>
          <Descriptions.Item label="Asientos">
            {vehicle.seats} personas
          </Descriptions.Item>
          <Descriptions.Item label="Transmisión">
            {vehicle.transmission || 'No especificada'}
          </Descriptions.Item>
          <Descriptions.Item label="Combustible">
            {vehicle.fuelType || 'No especificado'}
          </Descriptions.Item>
          <Descriptions.Item label="Kilometraje">
            {vehicle.mileage.toLocaleString()} km
          </Descriptions.Item>
          <Descriptions.Item label="Tarifa Diaria">
            ${vehicle.dailyRate.toFixed(2)} USD
          </Descriptions.Item>
        </Descriptions>

        {vehicle.description && (
          <>
            <Divider />
            <div>
              <Text strong>Descripción:</Text>
              <div style={{ marginTop: '8px' }}>
                <Text>{vehicle.description}</Text>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Maintenance Information */}
      <Card title="Información de Mantenimiento">
        <Descriptions
          column={{ xs: 1, sm: 1 }}
          bordered
          size="small"
        >
          <Descriptions.Item label="Último Mantenimiento">
            <Space>
              <CalendarOutlined />
              {formatDate(vehicle.lastMaintenanceDate)}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Próximo Mantenimiento">
            <Space>
              <CalendarOutlined />
              <Text style={{
                color: needsMaintenance ? '#ff4d4f' : 'inherit',
                fontWeight: needsMaintenance ? 'bold' : 'normal'
              }}>
                {formatDate(vehicle.nextMaintenanceDate)}
              </Text>
              {needsMaintenance && (
                <Tag color="red">¡Vencido!</Tag>
              )}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Timestamps */}
      <Card title="Información del Sistema" style={{ marginTop: '16px' }}>
        <Descriptions
          column={{ xs: 1, sm: 1 }}
          bordered
          size="small"
        >
          <Descriptions.Item label="Fecha de Creación">
            {formatDate(vehicle.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Última Actualización">
            {formatDate(vehicle.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default VehicleDetail;