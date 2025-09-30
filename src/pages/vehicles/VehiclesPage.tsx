import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Typography,
  Card,
  Input,
  Select,
  Tag,
  Modal,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CarOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesAPI } from '../../services/api';
import type { Vehicle } from '../../types';
import { VEHICLE_STATUS } from '../../types';
import VehicleForm from './VehicleForm';
import VehicleDetail from './VehicleDetail';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const VehiclesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesAPI.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: vehiclesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      message.success('Vehículo eliminado exitosamente');
    },
    onError: () => {
      message.error('Error al eliminar el vehículo');
    },
  });

  const handleAdd = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleView = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.licensePlate.toLowerCase().includes(searchText.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchText.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case VEHICLE_STATUS.AVAILABLE: return 'green';
      case VEHICLE_STATUS.RESERVED: return 'blue';
      case VEHICLE_STATUS.RENTED: return 'orange';
      case VEHICLE_STATUS.MAINTENANCE: return 'red';
      case VEHICLE_STATUS.OUT_OF_SERVICE: return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case VEHICLE_STATUS.AVAILABLE: return 'Disponible';
      case VEHICLE_STATUS.RESERVED: return 'Reservado';
      case VEHICLE_STATUS.RENTED: return 'Alquilado';
      case VEHICLE_STATUS.MAINTENANCE: return 'Mantenimiento';
      case VEHICLE_STATUS.OUT_OF_SERVICE: return 'Fuera de Servicio';
      default: return status;
    }
  };

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === VEHICLE_STATUS.AVAILABLE).length,
    rented: vehicles.filter(v => v.status === VEHICLE_STATUS.RENTED).length,
    maintenance: vehicles.filter(v => v.status === VEHICLE_STATUS.MAINTENANCE).length,
  };

  const columns = [
    {
      title: 'Matrícula',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
      sorter: (a: Vehicle, b: Vehicle) => a.licensePlate.localeCompare(b.licensePlate),
    },
    {
      title: 'Marca',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Modelo',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Año',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Tarifa',
      dataIndex: 'dailyRate',
      key: 'dailyRate',
      render: (rate: number) => `$${rate.toFixed(2)}`,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Vehicle) => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="¿Eliminar vehículo?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={3}>Error al cargar los vehículos</Title>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <CarOutlined style={{ marginRight: '8px' }} />
          Gestión de Vehículos
        </Title>
      </div>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card><Statistic title="Total" value={stats.total} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="Disponibles" value={stats.available} valueStyle={{ color: '#3f8600' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="Alquilados" value={stats.rented} valueStyle={{ color: '#cf1322' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="Mantenimiento" value={stats.maintenance} valueStyle={{ color: '#d46b08' }} /></Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space>
              <Search
                placeholder="Buscar vehículos..."
                style={{ width: 300 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                placeholder="Estado"
                style={{ width: 150 }}
                allowClear
                value={statusFilter}
                onChange={setStatusFilter}
              >
                {Object.values(VEHICLE_STATUS).map(status => (
                  <Option key={status} value={status}>
                    {getStatusText(status)}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Agregar Vehículo
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredVehicles}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingVehicle ? 'Editar Vehículo' : 'Agregar Vehículo'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        <VehicleForm
          vehicle={editingVehicle}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        title="Detalles del Vehículo"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedVehicle && <VehicleDetail vehicle={selectedVehicle} />}
      </Modal>
    </div>
  );
};

export default VehiclesPage;