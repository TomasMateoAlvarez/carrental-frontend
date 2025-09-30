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
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  IdcardOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { format, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { Client } from '../../types';

const { Title, Text } = Typography;

interface ClientDetailProps {
  client: Client;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ client }) => {
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

  const age = calculateAge(client.fechaNacimiento);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Avatar
          size={80}
          icon={<UserOutlined />}
          style={{
            backgroundColor: client.activo ? '#1890ff' : '#d9d9d9',
            marginBottom: '16px'
          }}
        />
        <Title level={3} style={{ margin: 0 }}>
          {client.nombre} {client.apellido}
        </Title>
        <Space>
          <Tag color={client.activo ? 'green' : 'red'}>
            {client.activo ? 'Cliente Activo' : 'Cliente Inactivo'}
          </Tag>
          {age && (
            <Text type="secondary">{age} años</Text>
          )}
        </Space>
      </div>

      {/* Contact Information */}
      <Card title="Información de Contacto" style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Space>
              <MailOutlined style={{ color: '#1890ff' }} />
              <div>
                <Text strong>Email</Text>
                <br />
                <Text copyable>{client.email}</Text>
              </div>
            </Space>
          </Col>
          <Col span={12}>
            <Space>
              <PhoneOutlined style={{ color: '#52c41a' }} />
              <div>
                <Text strong>Teléfono</Text>
                <br />
                <Text copyable={!!client.telefono}>
                  {client.telefono || 'No especificado'}
                </Text>
              </div>
            </Space>
          </Col>
        </Row>

        {client.direccion && (
          <>
            <Divider />
            <Space>
              <HomeOutlined style={{ color: '#722ed1' }} />
              <div>
                <Text strong>Dirección</Text>
                <br />
                <Text>{client.direccion}</Text>
              </div>
            </Space>
          </>
        )}
      </Card>

      {/* Personal Information */}
      <Card title="Información Personal" style={{ marginBottom: '16px' }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Nombre Completo">
            <Text strong>{client.nombre} {client.apellido}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            <Tag color={client.activo ? 'green' : 'red'}>
              {client.activo ? 'Activo' : 'Inactivo'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de Nacimiento">
            <Space>
              <CalendarOutlined />
              {formatDate(client.fechaNacimiento)}
              {age && <Text type="secondary">({age} años)</Text>}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Número de Licencia">
            <Space>
              <IdcardOutlined />
              <Text copyable={!!client.numeroLicencia}>
                {client.numeroLicencia || 'No especificado'}
              </Text>
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Account Information */}
      <Card title="Información de la Cuenta">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="ID del Cliente">
            <Text code>#{client.id}</Text>
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
        </Descriptions>
      </Card>

      {/* Additional Information */}
      {!client.activo && (
        <Card
          style={{
            marginTop: '16px',
            borderColor: '#ff4d4f',
            backgroundColor: '#fff2f0'
          }}
        >
          <Space>
            <UserOutlined style={{ color: '#ff4d4f' }} />
            <div>
              <Text strong style={{ color: '#ff4d4f' }}>
                Cliente Inactivo
              </Text>
              <br />
              <Text type="secondary">
                Este cliente está marcado como inactivo. No podrá realizar nuevos alquileres hasta que sea reactivado.
              </Text>
            </div>
          </Space>
        </Card>
      )}

      {!client.numeroLicencia && (
        <Card
          style={{
            marginTop: '16px',
            borderColor: '#faad14',
            backgroundColor: '#fffbe6'
          }}
        >
          <Space>
            <IdcardOutlined style={{ color: '#faad14' }} />
            <div>
              <Text strong style={{ color: '#faad14' }}>
                Licencia de Conducir No Registrada
              </Text>
              <br />
              <Text type="secondary">
                Se recomienda solicitar y registrar el número de licencia de conducir para completar el perfil del cliente.
              </Text>
            </div>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default ClientDetail;