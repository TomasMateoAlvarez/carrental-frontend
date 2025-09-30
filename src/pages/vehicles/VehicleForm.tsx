import React from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Row,
  Col,
  message,
  Space,
} from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesAPI } from '../../services/api';
import { Vehicle, VehicleRequest, VehicleStatus } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSuccess: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onSuccess }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const isEditing = !!vehicle;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: vehiclesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      message.success('Vehículo creado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al crear el vehículo';
      message.error(errorMessage);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: VehicleRequest }) =>
      vehiclesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      message.success('Vehículo actualizado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al actualizar el vehículo';
      message.error(errorMessage);
    },
  });

  const onFinish = (values: any) => {
    const vehicleData: VehicleRequest = {
      licensePlate: values.licensePlate,
      brand: values.brand,
      model: values.model,
      year: values.year,
      color: values.color,
      mileage: values.mileage,
      dailyRate: values.dailyRate,
      category: values.category,
      seats: values.seats,
      transmission: values.transmission,
      fuelType: values.fuelType,
      description: values.description,
    };

    if (isEditing && vehicle) {
      updateMutation.mutate({ id: vehicle.id, data: vehicleData });
    } else {
      createMutation.mutate(vehicleData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={
        vehicle
          ? {
              licensePlate: vehicle.licensePlate,
              brand: vehicle.brand,
              model: vehicle.model,
              year: vehicle.year,
              color: vehicle.color,
              mileage: vehicle.mileage,
              dailyRate: vehicle.dailyRate,
              category: vehicle.category,
              seats: vehicle.seats,
              transmission: vehicle.transmission,
              fuelType: vehicle.fuelType,
              description: vehicle.description,
            }
          : {
              seats: 5,
              mileage: 0,
            }
      }
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="licensePlate"
            label="Matrícula"
            rules={[
              { required: true, message: 'La matrícula es obligatoria' },
              { max: 20, message: 'La matrícula no puede exceder 20 caracteres' },
            ]}
          >
            <Input placeholder="Ej: ABC-123" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="year"
            label="Año"
            rules={[
              { required: true, message: 'El año es obligatorio' },
              { type: 'number', min: 1900, message: 'Año inválido' },
              { type: 'number', max: new Date().getFullYear() + 1, message: 'Año inválido' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="2020"
              min={1900}
              max={new Date().getFullYear() + 1}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="brand"
            label="Marca"
            rules={[
              { required: true, message: 'La marca es obligatoria' },
              { max: 50, message: 'La marca no puede exceder 50 caracteres' },
            ]}
          >
            <Input placeholder="Ej: Toyota" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="model"
            label="Modelo"
            rules={[
              { required: true, message: 'El modelo es obligatorio' },
              { max: 50, message: 'El modelo no puede exceder 50 caracteres' },
            ]}
          >
            <Input placeholder="Ej: Corolla" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="color"
            label="Color"
            rules={[
              { max: 30, message: 'El color no puede exceder 30 caracteres' },
            ]}
          >
            <Input placeholder="Ej: Blanco" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="category"
            label="Categoría"
            rules={[
              { max: 50, message: 'La categoría no puede exceder 50 caracteres' },
            ]}
          >
            <Select placeholder="Selecciona una categoría">
              <Option value="Economy">Económico</Option>
              <Option value="Compact">Compacto</Option>
              <Option value="Intermediate">Intermedio</Option>
              <Option value="Standard">Estándar</Option>
              <Option value="Full Size">Tamaño Completo</Option>
              <Option value="Premium">Premium</Option>
              <Option value="Luxury">Lujo</Option>
              <Option value="SUV">SUV</Option>
              <Option value="Minivan">Minivan</Option>
              <Option value="Pickup">Pickup</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="seats"
            label="Asientos"
            rules={[
              { required: true, message: 'El número de asientos es obligatorio' },
              { type: 'number', min: 1, message: 'Debe tener al menos 1 asiento' },
              { type: 'number', max: 15, message: 'No puede tener más de 15 asientos' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              max={15}
              placeholder="5"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="mileage"
            label="Kilometraje"
            rules={[
              { required: true, message: 'El kilometraje es obligatorio' },
              { type: 'number', min: 0, message: 'El kilometraje no puede ser negativo' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="50000"
              addonAfter="km"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="dailyRate"
            label="Tarifa Diaria"
            rules={[
              { required: true, message: 'La tarifa diaria es obligatoria' },
              { type: 'number', min: 0.01, message: 'La tarifa debe ser mayor a 0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0.01}
              precision={2}
              placeholder="50.00"
              addonBefore="$"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="transmission"
            label="Transmisión"
            rules={[
              { max: 20, message: 'La transmisión no puede exceder 20 caracteres' },
            ]}
          >
            <Select placeholder="Selecciona el tipo de transmisión">
              <Option value="Manual">Manual</Option>
              <Option value="Automática">Automática</Option>
              <Option value="CVT">CVT</Option>
              <Option value="Semi-automática">Semi-automática</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="fuelType"
            label="Tipo de Combustible"
            rules={[
              { max: 20, message: 'El tipo de combustible no puede exceder 20 caracteres' },
            ]}
          >
            <Select placeholder="Selecciona el tipo de combustible">
              <Option value="Gasolina">Gasolina</Option>
              <Option value="Diesel">Diesel</Option>
              <Option value="Híbrido">Híbrido</Option>
              <Option value="Eléctrico">Eléctrico</Option>
              <Option value="GLP">GLP</Option>
              <Option value="GNC">GNC</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="description"
        label="Descripción"
        rules={[
          { max: 500, message: 'La descripción no puede exceder 500 caracteres' },
        ]}
      >
        <TextArea
          rows={3}
          placeholder="Descripción adicional del vehículo (opcional)"
          showCount
          maxLength={500}
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
            {isEditing ? 'Actualizar' : 'Crear'} Vehículo
          </Button>
          <Button size="large" onClick={onSuccess}>
            Cancelar
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default VehicleForm;