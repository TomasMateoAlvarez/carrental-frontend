import React from 'react';
import {
  Form,
  Input,
  DatePicker,
  Switch,
  Button,
  Row,
  Col,
  message,
  Space,
} from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsAPI } from '../../services/api';
import { Client, ClientRequest } from '../../types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ClientFormProps {
  client?: Client | null;
  onSuccess: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSuccess }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const isEditing = !!client;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: clientsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
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
    mutationFn: ({ id, data }: { id: number; data: ClientRequest }) =>
      clientsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      message.success('Cliente actualizado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al actualizar el cliente';
      message.error(errorMessage);
    },
  });

  const onFinish = (values: any) => {
    const clientData: ClientRequest = {
      nombre: values.nombre,
      apellido: values.apellido,
      email: values.email,
      telefono: values.telefono,
      fechaNacimiento: values.fechaNacimiento ?
        dayjs(values.fechaNacimiento).format('YYYY-MM-DD') : undefined,
      numeroLicencia: values.numeroLicencia,
      direccion: values.direccion,
      activo: values.activo !== undefined ? values.activo : true,
    };

    if (isEditing && client) {
      updateMutation.mutate({ id: client.id, data: clientData });
    } else {
      createMutation.mutate(clientData);
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
              nombre: client.nombre,
              apellido: client.apellido,
              email: client.email,
              telefono: client.telefono,
              fechaNacimiento: client.fechaNacimiento ? dayjs(client.fechaNacimiento) : undefined,
              numeroLicencia: client.numeroLicencia,
              direccion: client.direccion,
              activo: client.activo,
            }
          : {
              activo: true,
            }
      }
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="nombre"
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
            name="apellido"
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
            name="telefono"
            label="Teléfono"
            rules={[
              { max: 20, message: 'El teléfono no puede exceder 20 caracteres' },
              { pattern: /^[\d\s\-\+\(\)]+$/, message: 'Formato de teléfono inválido' },
            ]}
          >
            <Input placeholder="Ej: +1 (555) 123-4567" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="fechaNacimiento"
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
        <Col span={12}>
          <Form.Item
            name="numeroLicencia"
            label="Número de Licencia"
            rules={[
              { max: 50, message: 'El número de licencia no puede exceder 50 caracteres' },
            ]}
          >
            <Input placeholder="Número de licencia de conducir" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="direccion"
        label="Dirección"
        rules={[
          { max: 500, message: 'La dirección no puede exceder 500 caracteres' },
        ]}
      >
        <TextArea
          rows={3}
          placeholder="Dirección completa del cliente (opcional)"
          showCount
          maxLength={500}
        />
      </Form.Item>

      <Form.Item
        name="activo"
        label="Estado del Cliente"
        valuePropName="checked"
      >
        <Switch
          checkedChildren="Activo"
          unCheckedChildren="Inactivo"
        />
      </Form.Item>

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