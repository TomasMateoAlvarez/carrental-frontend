import React from 'react';
import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
  message,
  Space,
  Tabs,
} from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerAPI } from '../../services/api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
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
  status: string;
  segment: string;
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

interface CustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
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
  notes?: string;
  preferredPickupLocation?: string;
}

interface ClientFormProps {
  client?: CustomerResponse | null;
  onSuccess: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSuccess }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const isEditing = !!client;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: customerAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      message.success('Cliente creado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al crear el cliente';
      message.error(errorMessage);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerRequest }) =>
      customerAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      message.success('Cliente actualizado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al actualizar el cliente';
      message.error(errorMessage);
    },
  });

  const onFinish = (values: any) => {
    const customerData: CustomerRequest = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phoneNumber: values.phone, // Backend expects phoneNumber field
      dateOfBirth: values.dateOfBirth ?
        dayjs(values.dateOfBirth).format('YYYY-MM-DD') : undefined,
      gender: values.gender,
      nationality: values.nationality,
      preferredLanguage: values.preferredLanguage,
      licenseNumber: values.licenseNumber,
      licenseIssuedDate: values.licenseIssuedDate ?
        dayjs(values.licenseIssuedDate).format('YYYY-MM-DD') : undefined,
      licenseExpiryDate: values.licenseExpiryDate ?
        dayjs(values.licenseExpiryDate).format('YYYY-MM-DD') : undefined,
      licenseIssuingCountry: values.licenseIssuingCountry,
      licenseClass: values.licenseClass,
      streetAddress: values.streetAddress,
      city: values.city,
      state: values.state,
      postalCode: values.postalCode,
      country: values.country,
      emergencyContactName: values.emergencyContactName,
      emergencyContactPhone: values.emergencyContactPhone,
      emergencyContactRelationship: values.emergencyContactRelationship,
      notes: values.notes,
      preferredPickupLocation: values.preferredPickupLocation,
    };

    if (isEditing && client) {
      updateMutation.mutate({ id: client.id, data: customerData });
    } else {
      createMutation.mutate(customerData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Calculate max date (18 years ago)
  const maxDate = dayjs().subtract(18, 'year');

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={
        client
          ? {
              firstName: client.firstName,
              lastName: client.lastName,
              email: client.email,
              phone: client.phoneNumber,
              dateOfBirth: client.dateOfBirth ? dayjs(client.dateOfBirth) : undefined,
              gender: client.gender,
              nationality: client.nationality,
              preferredLanguage: client.preferredLanguage,
              licenseNumber: client.licenseNumber,
              licenseIssuedDate: client.licenseIssuedDate ? dayjs(client.licenseIssuedDate) : undefined,
              licenseExpiryDate: client.licenseExpiryDate ? dayjs(client.licenseExpiryDate) : undefined,
              licenseIssuingCountry: client.licenseIssuingCountry,
              licenseClass: client.licenseClass,
              streetAddress: client.streetAddress,
              city: client.city,
              state: client.state,
              postalCode: client.postalCode,
              country: client.country,
              emergencyContactName: client.emergencyContactName,
              emergencyContactPhone: client.emergencyContactPhone,
              emergencyContactRelationship: client.emergencyContactRelationship,
              notes: client.notes,
              preferredPickupLocation: client.preferredPickupLocation,
            }
          : {}
      }
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Información Personal" key="1">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Nombre"
                rules={[
                  { required: true, message: 'El nombre es obligatorio' },
                  { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                  { max: 100, message: 'El nombre no puede exceder 100 caracteres' },
                  { pattern: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, message: 'El nombre solo puede contener letras y espacios' },
                ]}
              >
                <Input placeholder="Nombre del cliente" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Apellido"
                rules={[
                  { required: true, message: 'El apellido es obligatorio' },
                  { min: 2, message: 'El apellido debe tener al menos 2 caracteres' },
                  { max: 100, message: 'El apellido no puede exceder 100 caracteres' },
                  { pattern: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, message: 'El apellido solo puede contener letras y espacios' },
                ]}
              >
                <Input placeholder="Apellido del cliente" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'El email es obligatorio' },
                  { type: 'email', message: 'Ingresa un email válido' },
                  { max: 150, message: 'El email no puede exceder 150 caracteres' },
                ]}
              >
                <Input placeholder="correo@ejemplo.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Teléfono"
                rules={[
                  { required: true, message: 'El teléfono es obligatorio' },
                  { max: 20, message: 'El teléfono no puede exceder 20 caracteres' },
                  { pattern: /^[\d\s\-\+\(\)]+$/, message: 'Formato de teléfono inválido' },
                ]}
              >
                <Input placeholder="Ej: +506 8888-8888" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="dateOfBirth"
                label="Fecha de Nacimiento"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (dayjs(value).isAfter(maxDate)) {
                        return Promise.reject(new Error('El cliente debe ser mayor de 18 años'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Selecciona la fecha"
                  format="DD/MM/YYYY"
                  maxDate={maxDate}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gender" label="Género">
                <Select placeholder="Selecciona género">
                  <Option value="M">Masculino</Option>
                  <Option value="F">Femenino</Option>
                  <Option value="Other">Otro</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="nationality" label="Nacionalidad">
                <Input placeholder="Ej: Costarricense" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="preferredLanguage" label="Idioma Preferido">
            <Select placeholder="Selecciona idioma">
              <Option value="es">Español</Option>
              <Option value="en">English</Option>
              <Option value="fr">Français</Option>
              <Option value="de">Deutsch</Option>
            </Select>
          </Form.Item>
        </TabPane>

        <TabPane tab="Licencia de Conducir" key="2">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="licenseNumber"
                label="Número de Licencia"
                rules={[
                  { required: true, message: 'El número de licencia es obligatorio' },
                  { max: 50, message: 'El número de licencia no puede exceder 50 caracteres' },
                ]}
              >
                <Input placeholder="Número de licencia de conducir" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="licenseClass" label="Clase de Licencia">
                <Select placeholder="Selecciona la clase">
                  <Option value="A1">A1 - Motocicletas hasta 125cc</Option>
                  <Option value="A2">A2 - Motocicletas hasta 400cc</Option>
                  <Option value="A3">A3 - Motocicletas sin límite</Option>
                  <Option value="B1">B1 - Automóviles</Option>
                  <Option value="B2">B2 - Vehículos de carga liviana</Option>
                  <Option value="B3">B3 - Autobuses pequeños</Option>
                  <Option value="B4">B4 - Vehículos de carga pesada</Option>
                  <Option value="C1">C1 - Autobuses</Option>
                  <Option value="C2">C2 - Vehículos articulados</Option>
                  <Option value="E1">E1 - Especial</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="licenseIssuedDate" label="Fecha de Emisión">
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Fecha de emisión"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="licenseExpiryDate" label="Fecha de Vencimiento">
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Fecha de vencimiento"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="licenseIssuingCountry" label="País de Emisión">
                <Input placeholder="Ej: Costa Rica" />
              </Form.Item>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Dirección" key="3">
          <Form.Item
            name="streetAddress"
            label="Dirección"
            rules={[
              { max: 500, message: 'La dirección no puede exceder 500 caracteres' },
            ]}
          >
            <TextArea
              rows={2}
              placeholder="Dirección completa (calle, número, colonia)"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="Ciudad">
                <Input placeholder="Ciudad" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="state" label="Provincia/Estado">
                <Input placeholder="Provincia o Estado" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="postalCode" label="Código Postal">
                <Input placeholder="Código postal" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="country" label="País">
                <Input placeholder="País" />
              </Form.Item>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Contacto de Emergencia" key="4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="emergencyContactName" label="Nombre del Contacto">
                <Input placeholder="Nombre completo del contacto de emergencia" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="emergencyContactPhone" label="Teléfono del Contacto">
                <Input placeholder="Número de teléfono del contacto" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="emergencyContactRelationship" label="Relación">
            <Select placeholder="Selecciona la relación">
              <Option value="Padre">Padre</Option>
              <Option value="Madre">Madre</Option>
              <Option value="Cónyuge">Cónyuge</Option>
              <Option value="Hermano/a">Hermano/a</Option>
              <Option value="Hijo/a">Hijo/a</Option>
              <Option value="Amigo/a">Amigo/a</Option>
              <Option value="Otro">Otro</Option>
            </Select>
          </Form.Item>
        </TabPane>

        <TabPane tab="Otros" key="5">
          <Form.Item name="preferredPickupLocation" label="Ubicación Preferida de Recogida">
            <Input placeholder="Ubicación preferida para recoger vehículos" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notas Adicionales"
            rules={[
              { max: 1000, message: 'Las notas no pueden exceder 1000 caracteres' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Notas adicionales sobre el cliente (opcional)"
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </TabPane>
      </Tabs>

      <Form.Item style={{ marginTop: '24px' }}>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            size="large"
          >
            {isEditing ? 'Actualizar' : 'Crear'} Cliente
          </Button>
          <Button size="large" onClick={onSuccess}>
            Cancelar
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ClientForm;